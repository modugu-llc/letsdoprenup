import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { documentService } from '../services/documentService';
import { DocumentType } from '../types/entities';
import { Handler } from 'aws-lambda';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    documentService.ensureUploadDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = documentService.generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const validation = documentService.validateFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error || 'Invalid file'));
    }
  }
});

// Upload document
router.post('/upload/:prenupId', authenticate, upload.single('document'), 
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const { prenupId } = req.params;
    const { type } = req.body;

    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    try {
      const document = await documentService.createDocument({
        prenupId,
        type: type as DocumentType || DocumentType.SUPPORTING_DOCUMENT,
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user!.id
      });

      res.json({
        success: true,
        data: { document },
        message: 'Document uploaded successfully'
      });
    } catch (error: any) {
      // Clean up uploaded file on error
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error.message === 'Access denied to prenup') {
        throw createError('Prenup not found', 404);
      }
      throw error;
    }
  })
);

// Get documents for a prenup
router.get('/:prenupId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await require('../services/prenupService').prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const documents = await documentService.getDocumentsByPrenup(prenupId);

  res.json({
    success: true,
    data: { documents }
  });
}));

// Download document
router.get('/download/:documentId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { documentId } = req.params;

  const canAccess = await documentService.userCanAccessDocument(documentId, req.user!.id);
  if (!canAccess) {
    throw createError('Document not found', 404);
  }

  const document = await documentService.getDocumentById(documentId);
  if (!document) {
    throw createError('Document not found', 404);
  }

  // Check if file exists
  const fileStats = await documentService.getFileStats(document.path);
  if (!fileStats.exists) {
    throw createError('File not found on server', 404);
  }

  // Send file
  res.download(document.path, document.filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error downloading file'
        });
      }
    }
  });
}));

// Delete document
router.delete('/:documentId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { documentId } = req.params;

  try {
    await documentService.deleteDocument(documentId, req.user!.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      throw createError('Document not found', 404);
    }
    if (error.message === 'Access denied') {
      throw createError('Access denied', 403);
    }
    throw error;
  }
}));

// Get documents by type
router.get('/:prenupId/type/:type', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId, type } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await require('../services/prenupService').prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  if (!Object.values(DocumentType).includes(type as DocumentType)) {
    throw createError('Invalid document type', 400);
  }

  const documents = await documentService.getDocumentsByType(prenupId, type as DocumentType);

  res.json({
    success: true,
    data: { documents }
  });
}));

// Get file usage stats for a prenup
router.get('/:prenupId/stats', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await require('../services/prenupService').prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const documents = await documentService.getDocumentsByPrenup(prenupId);
  const totalSize = await documentService.getTotalFileSizeForPrenup(prenupId);

  const stats = {
    totalDocuments: documents.length,
    totalSize: totalSize,
    totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
    byType: Object.values(DocumentType).map(type => ({
      type,
      count: documents.filter(d => d.type === type).length,
      size: documents
        .filter(d => d.type === type)
        .reduce((sum, doc) => sum + doc.size, 0)
    }))
  };

  res.json({
    success: true,
    data: { stats }
  });
}));

// Lambda-compatible handlers
export const uploadDocumentHandler: Handler = async (event, context) => {
  try {
    // Note: File upload in Lambda requires different handling
    // This is a simplified example - in production you'd use S3 for file storage
    
    const prenupId = event.pathParameters?.prenupId;
    if (!prenupId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Prenup ID required'
        })
      };
    }

    // TODO: Extract user from JWT and implement file upload to S3
    return {
      statusCode: 501,
      body: JSON.stringify({
        success: false,
        error: 'File upload not implemented for Lambda deployment'
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

export const getDocumentsHandler: Handler = async (event, context) => {
  try {
    const prenupId = event.pathParameters?.prenupId;
    if (!prenupId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Prenup ID required'
        })
      };
    }

    // TODO: Extract user from JWT
    const userId = 'user-from-jwt';

    // Verify access
    const hasAccess = await require('../services/prenupService').prenupService.userHasAccessToPrenup(prenupId, userId);
    if (!hasAccess) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'Prenup not found'
        })
      };
    }

    const documents = await documentService.getDocumentsByPrenup(prenupId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { documents }
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

export default router;