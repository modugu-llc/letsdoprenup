import { dynamodbService, EntityType } from './dynamodb';
import { 
  Document,
  DocumentType,
  createDocumentEntity
} from '../types/entities';
import { prenupService } from './prenupService';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class DocumentService {

  async createDocument(data: {
    prenupId: string;
    type: DocumentType;
    filename: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
  }): Promise<Document> {
    // Verify user has access to prenup
    const hasAccess = await prenupService.userHasAccessToPrenup(data.prenupId, data.uploadedBy);
    if (!hasAccess) {
      throw new Error('Access denied to prenup');
    }

    const documentEntity = createDocumentEntity({
      prenupId: data.prenupId,
      type: data.type,
      filename: data.filename,
      path: data.path,
      size: data.size,
      mimeType: data.mimeType,
      uploadedBy: data.uploadedBy
    });

    const document = await dynamodbService.create<Document>(documentEntity);
    logger.info(`Document created: ${document.filename} for prenup ${data.prenupId}`);
    
    return document;
  }

  async getDocumentById(id: string): Promise<Document | null> {
    return await dynamodbService.getById<Document>(EntityType.DOCUMENT, id);
  }

  async getDocumentsByPrenup(prenupId: string): Promise<Document[]> {
    try {
      // Get all documents and filter by prenup
      const result = await dynamodbService.queryByEntityType<Document>(EntityType.DOCUMENT);
      
      const documents = result.items.filter(d => d.prenupId === prenupId);
      
      return documents.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      logger.error(`Error getting documents for prenup ${prenupId}:`, error);
      return [];
    }
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Verify user has access to the prenup
    const hasAccess = await prenupService.userHasAccessToPrenup(document.prenupId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Delete file from filesystem if it exists
    try {
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
        logger.info(`Deleted file: ${document.path}`);
      }
    } catch (error) {
      logger.warn(`Failed to delete file ${document.path}:`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await dynamodbService.delete(EntityType.DOCUMENT, id);
    logger.info(`Deleted document: ${id}`);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return await dynamodbService.update<Document>(EntityType.DOCUMENT, id, updates, false);
  }

  async userCanAccessDocument(documentId: string, userId: string): Promise<boolean> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      return false;
    }

    return await prenupService.userHasAccessToPrenup(document.prenupId, userId);
  }

  // Helper method to get document with prenup info
  async getDocumentWithPrenup(id: string): Promise<(Document & { prenup?: any }) | null> {
    const document = await this.getDocumentById(id);
    if (!document) {
      return null;
    }

    const prenup = await prenupService.getPrenupById(document.prenupId);
    
    return {
      ...document,
      prenup
    };
  }

  // Validate file type and size
  validateFile(file: {
    originalname: string;
    mimetype: string;
    size: number;
  }): { valid: boolean; error?: string } {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return {
        valid: false,
        error: 'Only PDF, DOC, DOCX, and image files are allowed'
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 10MB'
      };
    }

    return { valid: true };
  }

  // Get documents by type
  async getDocumentsByType(prenupId: string, type: DocumentType): Promise<Document[]> {
    const documents = await this.getDocumentsByPrenup(prenupId);
    return documents.filter(d => d.type === type);
  }

  // Get total file size for a prenup
  async getTotalFileSizeForPrenup(prenupId: string): Promise<number> {
    const documents = await this.getDocumentsByPrenup(prenupId);
    return documents.reduce((total, doc) => total + doc.size, 0);
  }

  // Generate unique filename to prevent conflicts
  generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1000);
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    
    return `${name}-${timestamp}-${random}${ext}`;
  }

  // Ensure upload directory exists
  ensureUploadDirectory(uploadDir: string): void {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${uploadDir}`);
    }
  }

  // Get file stats (if file exists on filesystem)
  async getFileStats(documentPath: string): Promise<{
    exists: boolean;
    size?: number;
    modified?: Date;
  }> {
    try {
      if (fs.existsSync(documentPath)) {
        const stats = fs.statSync(documentPath);
        return {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
      }
    } catch (error) {
      logger.error(`Error getting file stats for ${documentPath}:`, error);
    }

    return { exists: false };
  }
}

export const documentService = new DocumentService();