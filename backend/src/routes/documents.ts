import express from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and image files are allowed!'));
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

    // Verify user has access to this prenup
    const prenup = await prisma.prenup.findFirst({
      where: {
        id: prenupId,
        OR: [
          { createdBy: req.user!.id },
          { partnerId: req.user!.id }
        ]
      }
    });

    if (!prenup) {
      throw createError('Prenup not found', 404);
    }

    // Save document record
    const document = await prisma.document.create({
      data: {
        prenupId,
        type: type || 'SUPPORTING_DOCUMENT',
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

    res.json({
      success: true,
      data: { document },
      message: 'Document uploaded successfully'
    });
  })
);

// Get documents for a prenup
router.get('/:prenupId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const prenup = await prisma.prenup.findFirst({
    where: {
      id: prenupId,
      OR: [
        { createdBy: req.user!.id },
        { partnerId: req.user!.id }
      ]
    }
  });

  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  const documents = await prisma.document.findMany({
    where: { prenupId },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: { documents }
  });
}));

// Download document
router.get('/download/:documentId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { documentId } = req.params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      prenup: true
    }
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  // Verify user has access to this prenup
  const hasAccess = document.prenup.createdBy === req.user!.id || 
                   document.prenup.partnerId === req.user!.id;

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  // Send file
  res.download(document.path, document.filename);
}));

// Delete document
router.delete('/:documentId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { documentId } = req.params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      prenup: true
    }
  });

  if (!document) {
    throw createError('Document not found', 404);
  }

  // Verify user has access to this prenup
  const hasAccess = document.prenup.createdBy === req.user!.id || 
                   document.prenup.partnerId === req.user!.id;

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  // Delete file from filesystem
  const fs = require('fs');
  if (fs.existsSync(document.path)) {
    fs.unlinkSync(document.path);
  }

  // Delete database record
  await prisma.document.delete({
    where: { id: documentId }
  });

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
}));

export default router;