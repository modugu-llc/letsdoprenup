import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { StateComplianceService } from '../services/stateCompliance';

const router = express.Router();
const prisma = new PrismaClient();
const stateCompliance = new StateComplianceService();

// Validation schemas
const createPrenupSchema = Joi.object({
  title: Joi.string().min(3).required(),
  state: Joi.string().valid('CALIFORNIA', 'WASHINGTON', 'NEW_YORK', 'WASHINGTON_DC', 'VIRGINIA').required()
});

const updatePrenupSchema = Joi.object({
  title: Joi.string().min(3),
  content: Joi.object(),
  progress: Joi.object(),
  status: Joi.string().valid('DRAFT', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'PENDING_SIGNATURES', 'EXECUTED')
});

// Get all prenups for user
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const prenups = await prisma.prenup.findMany({
    where: {
      OR: [
        { createdBy: req.user!.id },
        { partnerId: req.user!.id }
      ]
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      partner: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  res.json({
    success: true,
    data: { prenups }
  });
}));

// Get single prenup
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const prenup = await prisma.prenup.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { createdBy: req.user!.id },
        { partnerId: req.user!.id }
      ]
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      partner: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      documents: true,
      signatures: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      }
    }
  });

  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  // Get state-specific requirements
  const stateRequirements = stateCompliance.getStateRequirements(prenup.state as any);

  res.json({
    success: true,
    data: { prenup, stateRequirements }
  });
}));

// Create new prenup
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { error, value } = createPrenupSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { title, state } = value;

  const prenup = await prisma.prenup.create({
    data: {
      title,
      state,
      createdBy: req.user!.id,
      progress: {
        currentStep: 1,
        completedSteps: [],
        totalSteps: stateCompliance.getStateRequirements(state).totalSteps
      }
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: { prenup },
    message: 'Prenup created successfully'
  });
}));

// Update prenup
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { error, value } = updatePrenupSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const prenup = await prisma.prenup.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { createdBy: req.user!.id },
        { partnerId: req.user!.id }
      ]
    }
  });

  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  // Check if user can edit (must be creator or partner, and not yet executed)
  if (prenup.status === 'EXECUTED') {
    throw createError('Cannot modify executed prenup', 400);
  }

  const updatedPrenup = await prisma.prenup.update({
    where: { id: req.params.id },
    data: value,
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      partner: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    }
  });

  res.json({
    success: true,
    data: { prenup: updatedPrenup },
    message: 'Prenup updated successfully'
  });
}));

// Invite partner
router.post('/:id/invite-partner', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Partner email is required', 400);
  }

  const prenup = await prisma.prenup.findFirst({
    where: {
      id: req.params.id,
      createdBy: req.user!.id
    }
  });

  if (!prenup) {
    throw createError('Prenup not found or you are not the creator', 404);
  }

  if (prenup.partnerId) {
    throw createError('Partner already assigned to this prenup', 400);
  }

  // Check if partner exists as user
  const partnerUser = await prisma.user.findUnique({
    where: { email }
  });

  if (partnerUser) {
    // If partner is already a user, directly assign them
    const updatedPrenup = await prisma.prenup.update({
      where: { id: req.params.id },
      data: { partnerId: partnerUser.id }
    });

    res.json({
      success: true,
      data: { prenup: updatedPrenup },
      message: 'Partner added successfully'
    });
  } else {
    // Create invitation token for new user
    const token = require('crypto').randomBytes(32).toString('hex');
    
    await prisma.partnerInvitation.create({
      data: {
        email,
        prenupId: req.params.id,
        invitedBy: req.user!.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // TODO: Send email invitation

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  }
}));

// Get state requirements
router.get('/states/:state/requirements', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { state } = req.params;
  
  if (!['CALIFORNIA', 'WASHINGTON', 'NEW_YORK', 'WASHINGTON_DC', 'VIRGINIA'].includes(state)) {
    throw createError('Invalid state', 400);
  }

  const requirements = stateCompliance.getStateRequirements(state as any);

  res.json({
    success: true,
    data: { requirements }
  });
}));

export default router;