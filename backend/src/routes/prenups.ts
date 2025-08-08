import express from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { StateComplianceService } from '../services/stateCompliance';
import { prenupService } from '../services/prenupService';
import { USState, PrenupStatus } from '../types/entities';
import { Handler } from 'aws-lambda';

const router = express.Router();
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
  const prenups = await prenupService.getPrenupsByUser(req.user!.id);
  
  // Get creator and partner info for each prenup
  const prenupDetails = await Promise.all(
    prenups.map(async (prenup) => {
      return await prenupService.getPrenupWithUsers(prenup.id);
    })
  );

  res.json({
    success: true,
    data: { prenups: prenupDetails }
  });
}));

// Get single prenup
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { id } = req.params;
  
  // Check user access
  const hasAccess = await prenupService.userHasAccessToPrenup(id, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const prenup = await prenupService.getPrenupWithUsers(id);
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

  const prenup = await prenupService.createPrenup({
    title,
    state: state as USState,
    createdBy: req.user!.id
  });

  const prenupWithUsers = await prenupService.getPrenupWithUsers(prenup.id);

  res.status(201).json({
    success: true,
    data: { prenup: prenupWithUsers },
    message: 'Prenup created successfully'
  });
}));

// Update prenup
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { error, value } = updatePrenupSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { id } = req.params;

  // Check user access
  const hasAccess = await prenupService.userHasAccessToPrenup(id, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const prenup = await prenupService.getPrenupById(id);
  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  // Check if user can edit (must be creator or partner, and not yet executed)
  if (prenup.status === PrenupStatus.EXECUTED) {
    throw createError('Cannot modify executed prenup', 400);
  }

  const updatedPrenup = await prenupService.updatePrenup(id, value);
  const prenupWithUsers = await prenupService.getPrenupWithUsers(updatedPrenup.id);

  res.json({
    success: true,
    data: { prenup: prenupWithUsers },
    message: 'Prenup updated successfully'
  });
}));

// Invite partner
router.post('/:id/invite-partner', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { email } = req.body;
  const { id } = req.params;

  if (!email) {
    throw createError('Partner email is required', 400);
  }

  const prenup = await prenupService.getPrenupById(id);
  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  if (prenup.createdBy !== req.user!.id) {
    throw createError('Only prenup creator can invite partners', 403);
  }

  if (prenup.partnerId) {
    throw createError('Partner already assigned to this prenup', 400);
  }

  try {
    const invitation = await prenupService.invitePartner(id, req.user!.id, email);
    
    if (invitation.id === 'direct-assignment') {
      const updatedPrenup = await prenupService.getPrenupWithUsers(id);
      res.json({
        success: true,
        data: { prenup: updatedPrenup },
        message: 'Partner added successfully'
      });
    } else {
      // TODO: Send email invitation
      res.json({
        success: true,
        message: 'Invitation sent successfully'
      });
    }
  } catch (error: any) {
    throw createError(error.message, 400);
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

// Lambda-compatible handlers
export const getPrenupsHandler: Handler = async (event, context) => {
  try {
    // Extract user ID from JWT token in Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Authorization header required'
        })
      };
    }

    // TODO: Implement JWT verification and user extraction
    // For now, this is a placeholder
    const userId = 'user-from-jwt';
    
    const prenups = await prenupService.getPrenupsByUser(userId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { prenups }
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

export const createPrenupHandler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { error, value } = createPrenupSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: error.details[0].message
        })
      };
    }

    // TODO: Extract user ID from JWT token
    const userId = 'user-from-jwt';
    
    const { title, state } = value;
    const prenup = await prenupService.createPrenup({
      title,
      state: state as USState,
      createdBy: userId
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: { prenup },
        message: 'Prenup created successfully'
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