import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

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

  // Get financial disclosure for current user
  const disclosure = await prisma.financialDisclosure.findFirst({
    where: {
      prenupId,
      userId: req.user!.id
    }
  });

  // Get partner's disclosure if user is creator
  let partnerDisclosure = null;
  if (prenup.partnerId && prenup.createdBy === req.user!.id) {
    partnerDisclosure = await prisma.financialDisclosure.findFirst({
      where: {
        prenupId,
        userId: prenup.partnerId
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  res.json({
    success: true,
    data: { 
      disclosure,
      partnerDisclosure,
      canViewPartner: prenup.createdBy === req.user!.id
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

  // Calculate net worth
  const totalAssets = assets.reduce((sum: number, asset: any) => sum + asset.value, 0);
  const totalDebts = debts.reduce((sum: number, debt: any) => sum + debt.amount, 0);
  const netWorth = totalAssets - totalDebts;

  // Upsert financial disclosure
  const disclosure = await prisma.financialDisclosure.upsert({
    where: {
      prenupId_userId: {
        prenupId,
        userId: req.user!.id
      }
    },
    update: {
      assets,
      debts,
      income,
      netWorth
    },
    create: {
      prenupId,
      userId: req.user!.id,
      assets,
      debts,
      income,
      netWorth
    }
  });

  res.json({
    success: true,
    data: { disclosure },
    message: 'Financial disclosure saved successfully'
  });
}));

// Get financial summary for comparison
router.get('/:prenupId/summary', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const prenup = await prisma.prenup.findFirst({
    where: {
      id: prenupId,
      OR: [
        { createdBy: req.user!.id },
        { partnerId: req.user!.id }
      ]
    },
    include: {
      creator: {
        select: { id: true, firstName: true, lastName: true }
      },
      partner: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });

  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  // Get all financial disclosures for this prenup
  const disclosures = await prisma.financialDisclosure.findMany({
    where: { prenupId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    }
  });

  // Calculate combined financial summary
  const summary = {
    individual: disclosures.map(disclosure => ({
      user: disclosure.user,
      netWorth: disclosure.netWorth,
      totalAssets: (disclosure.assets as any[]).reduce((sum, asset) => sum + asset.value, 0),
      totalDebts: (disclosure.debts as any[]).reduce((sum, debt) => sum + debt.amount, 0),
      annualIncome: Object.values(disclosure.income as any).reduce((sum: number, value: any) => sum + (typeof value === 'number' ? value : 0), 0)
    })),
    combined: {
      totalNetWorth: disclosures.reduce((sum, d) => sum + Number(d.netWorth), 0),
      totalAssets: disclosures.reduce((sum, d) => {
        return sum + (d.assets as any[]).reduce((assetSum, asset) => assetSum + asset.value, 0);
      }, 0),
      totalDebts: disclosures.reduce((sum, d) => {
        return sum + (d.debts as any[]).reduce((debtSum, debt) => debtSum + debt.amount, 0);
      }, 0),
      combinedIncome: disclosures.reduce((sum, d) => {
        return sum + Object.values(d.income as any).reduce((incomeSum: number, value: any) => incomeSum + (typeof value === 'number' ? value : 0), 0);
      }, 0)
    }
  };

  res.json({
    success: true,
    data: { summary, prenup }
  });
}));

// Generate financial disclosure report
router.get('/:prenupId/report', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { prenupId } = req.params;

  // Verify user has access to this prenup
  const prenup = await prisma.prenup.findFirst({
    where: {
      id: prenupId,
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
    }
  });

  if (!prenup) {
    throw createError('Prenup not found', 404);
  }

  // Get all financial disclosures
  const disclosures = await prisma.financialDisclosure.findMany({
    where: { prenupId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Generate timestamped report
  const report = {
    prenupId,
    prenupTitle: prenup.title,
    state: prenup.state,
    generatedAt: new Date().toISOString(),
    disclosures: disclosures.map(disclosure => ({
      user: disclosure.user,
      submittedAt: disclosure.createdAt.toISOString(),
      lastUpdated: disclosure.updatedAt.toISOString(),
      netWorth: disclosure.netWorth,
      assets: disclosure.assets,
      debts: disclosure.debts,
      income: disclosure.income
    }))
  };

  res.json({
    success: true,
    data: { report },
    message: 'Financial disclosure report generated'
  });
}));

export default router;