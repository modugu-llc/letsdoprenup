import express from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { financialService } from '../services/financialService';
import { prenupService } from '../services/prenupService';
import { Asset, Debt, Income } from '../types/entities';
import { Handler } from 'aws-lambda';

const router = express.Router();

// Validation schemas
const assetSchema = Joi.object({
  type: Joi.string().valid('REAL_ESTATE', 'VEHICLE', 'BANK_ACCOUNT', 'INVESTMENT', 'BUSINESS', 'PERSONAL_PROPERTY', 'OTHER').required(),
  description: Joi.string().required(),
  value: Joi.number().min(0).required(),
  ownership: Joi.string().valid('INDIVIDUAL', 'JOINT', 'SHARED').required(),
  notes: Joi.string().allow('')
});

const debtSchema = Joi.object({
  type: Joi.string().valid('MORTGAGE', 'STUDENT_LOAN', 'CREDIT_CARD', 'AUTO_LOAN', 'BUSINESS_LOAN', 'PERSONAL_LOAN', 'OTHER').required(),
  description: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  monthlyPayment: Joi.number().min(0),
  creditor: Joi.string().required(),
  notes: Joi.string().allow('')
});

const incomeSchema = Joi.object({
  salary: Joi.number().min(0).default(0),
  bonus: Joi.number().min(0).default(0),
  investments: Joi.number().min(0).default(0),
  business: Joi.number().min(0).default(0),
  rental: Joi.number().min(0).default(0),
  other: Joi.number().min(0).default(0),
  otherDescription: Joi.string().allow('')
});

const financialDisclosureSchema = Joi.object({
  prenupId: Joi.string().required(),
  assets: Joi.array().items(assetSchema).default([]),
  debts: Joi.array().items(debtSchema).default([]),
  income: incomeSchema.required()
});

// Get financial disclosure for a prenup
router.get('/:prenupId', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  // Get financial disclosure for current user
  const disclosure = await financialService.getFinancialDisclosureByPrenupAndUser(
    prenupId,
    req.user!.id
  );

  // Get partner's disclosure if user is creator
  const prenup = await prenupService.getPrenupById(prenupId);
  let partnerDisclosure = null;
  
  if (prenup?.partnerId && prenup.createdBy === req.user!.id) {
    partnerDisclosure = await financialService.getFinancialDisclosureByPrenupAndUser(
      prenupId,
      prenup.partnerId
    );
  }

  res.json({
    success: true,
    data: { 
      disclosure,
      partnerDisclosure,
      canViewPartner: prenup?.createdBy === req.user!.id
    }
  });
}));

// Create or update financial disclosure
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { error, value } = financialDisclosureSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { prenupId, assets, debts, income } = value;

  try {
    const disclosure = await financialService.createOrUpdateFinancialDisclosure({
      prenupId,
      userId: req.user!.id,
      assets: assets as Asset[],
      debts: debts as Debt[],
      income: income as Income
    });

    res.json({
      success: true,
      data: { disclosure },
      message: 'Financial disclosure saved successfully'
    });
  } catch (error: any) {
    if (error.message === 'Access denied to prenup') {
      throw createError('Prenup not found', 404);
    }
    throw error;
  }
}));

// Get financial summary for comparison
router.get('/:prenupId/summary', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const prenup = await prenupService.getPrenupWithUsers(prenupId);
  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  const summary = await financialService.getFinancialSummary(prenupId);

  res.json({
    success: true,
    data: { summary, prenup }
  });
}));

// Generate financial disclosure report
router.get('/:prenupId/report', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const hasAccess = await prenupService.userHasAccessToPrenup(prenupId, req.user!.id);
  if (!hasAccess) {
    throw createError('Prenup not found', 404);
  }

  const report = await financialService.generateFinancialReport(prenupId);

  res.json({
    success: true,
    data: { report },
    message: 'Financial disclosure report generated'
  });
}));

// Lambda-compatible handlers
export const getFinancialDisclosureHandler: Handler = async (event, context) => {
  try {
    // Extract user info from JWT (placeholder)
    const userId = 'user-from-jwt';
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

    const disclosure = await financialService.getFinancialDisclosureByPrenupAndUser(
      prenupId,
      userId
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { disclosure }
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

export const saveFinancialDisclosureHandler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { error, value } = financialDisclosureSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: error.details[0].message
        })
      };
    }

    // Extract user info from JWT (placeholder)
    const userId = 'user-from-jwt';
    const { prenupId, assets, debts, income } = value;

    const disclosure = await financialService.createOrUpdateFinancialDisclosure({
      prenupId,
      userId,
      assets: assets as Asset[],
      debts: debts as Debt[],
      income: income as Income
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { disclosure },
        message: 'Financial disclosure saved successfully'
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