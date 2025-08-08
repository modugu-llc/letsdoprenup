import { dynamodbService, EntityType } from './dynamodb';
import { 
  FinancialDisclosure,
  Asset,
  Debt,
  Income,
  createFinancialDisclosureEntity
} from '../types/entities';
import { userService } from './userService';
import { prenupService } from './prenupService';
import { logger } from '../utils/logger';

export class FinancialService {

  async createOrUpdateFinancialDisclosure(data: {
    prenupId: string;
    userId: string;
    assets: Asset[];
    debts: Debt[];
    income: Income;
  }): Promise<FinancialDisclosure> {
    // Verify user has access to prenup
    const hasAccess = await prenupService.userHasAccessToPrenup(data.prenupId, data.userId);
    if (!hasAccess) {
      throw new Error('Access denied to prenup');
    }

    // Get user info for denormalization
    const user = await userService.getUserById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate net worth
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalDebts = data.debts.reduce((sum, debt) => sum + debt.amount, 0);
    const netWorth = totalAssets - totalDebts;

    // Check if disclosure already exists
    const existingDisclosure = await this.getFinancialDisclosureByPrenupAndUser(data.prenupId, data.userId);

    let disclosure: FinancialDisclosure;

    if (existingDisclosure) {
      // Update existing disclosure
      disclosure = await dynamodbService.update<FinancialDisclosure>(
        EntityType.FINANCIAL_DISCLOSURE,
        existingDisclosure.id,
        {
          assets: data.assets,
          debts: data.debts,
          income: data.income,
          netWorth,
          userEmail: user.email
        },
        true // Create new version
      );
    } else {
      // Create new disclosure
      const disclosureEntity = createFinancialDisclosureEntity({
        prenupId: data.prenupId,
        userId: data.userId,
        assets: data.assets,
        debts: data.debts,
        income: data.income,
        netWorth,
        userEmail: user.email
      });

      disclosure = await dynamodbService.create<FinancialDisclosure>(disclosureEntity);
    }

    logger.info(`Financial disclosure saved for user ${data.userId} on prenup ${data.prenupId}`);
    return disclosure;
  }

  async getFinancialDisclosureById(id: string): Promise<FinancialDisclosure | null> {
    return await dynamodbService.getById<FinancialDisclosure>(EntityType.FINANCIAL_DISCLOSURE, id);
  }

  async getFinancialDisclosureByPrenupAndUser(prenupId: string, userId: string): Promise<FinancialDisclosure | null> {
    try {
      // Get all financial disclosures and filter
      const result = await dynamodbService.queryByEntityType<FinancialDisclosure>(EntityType.FINANCIAL_DISCLOSURE);
      
      const disclosure = result.items.find(d => 
        d.prenupId === prenupId && d.userId === userId
      );

      return disclosure || null;
    } catch (error) {
      logger.error(`Error finding financial disclosure for prenup ${prenupId} user ${userId}:`, error);
      return null;
    }
  }

  async getFinancialDisclosuresByPrenup(prenupId: string): Promise<FinancialDisclosure[]> {
    try {
      // Get all financial disclosures and filter by prenup
      const result = await dynamodbService.queryByEntityType<FinancialDisclosure>(EntityType.FINANCIAL_DISCLOSURE);
      
      const disclosures = result.items.filter(d => d.prenupId === prenupId);
      
      return disclosures.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      logger.error(`Error getting financial disclosures for prenup ${prenupId}:`, error);
      return [];
    }
  }

  async deleteFinancialDisclosure(id: string): Promise<void> {
    await dynamodbService.delete(EntityType.FINANCIAL_DISCLOSURE, id);
    logger.info(`Deleted financial disclosure: ${id}`);
  }

  async getFinancialSummary(prenupId: string): Promise<{
    individual: Array<{
      user: any;
      netWorth: number;
      totalAssets: number;
      totalDebts: number;
      annualIncome: number;
    }>;
    combined: {
      totalNetWorth: number;
      totalAssets: number;
      totalDebts: number;
      combinedIncome: number;
    };
  }> {
    const disclosures = await this.getFinancialDisclosuresByPrenup(prenupId);

    // Get user info for each disclosure
    const individualSummaries = await Promise.all(
      disclosures.map(async (disclosure) => {
        const user = await userService.getUserById(disclosure.userId);
        
        const totalAssets = disclosure.assets.reduce((sum, asset) => sum + asset.value, 0);
        const totalDebts = disclosure.debts.reduce((sum, debt) => sum + debt.amount, 0);
        const annualIncome = Object.values(disclosure.income)
          .reduce((sum: number, value: any) => 
            sum + (typeof value === 'number' ? value : 0), 0
          );

        return {
          user: user ? userService.sanitizeUser(user) : null,
          netWorth: disclosure.netWorth,
          totalAssets,
          totalDebts,
          annualIncome
        };
      })
    );

    // Calculate combined totals
    const combined = {
      totalNetWorth: individualSummaries.reduce((sum, item) => sum + item.netWorth, 0),
      totalAssets: individualSummaries.reduce((sum, item) => sum + item.totalAssets, 0),
      totalDebts: individualSummaries.reduce((sum, item) => sum + item.totalDebts, 0),
      combinedIncome: individualSummaries.reduce((sum, item) => sum + item.annualIncome, 0)
    };

    return {
      individual: individualSummaries,
      combined
    };
  }

  async generateFinancialReport(prenupId: string): Promise<{
    prenupId: string;
    prenupTitle?: string;
    state?: string;
    generatedAt: string;
    disclosures: Array<{
      user: any;
      submittedAt: string;
      lastUpdated: string;
      netWorth: number;
      assets: Asset[];
      debts: Debt[];
      income: Income;
    }>;
  }> {
    // Get prenup info
    const prenup = await prenupService.getPrenupById(prenupId);
    
    // Get all disclosures
    const disclosures = await this.getFinancialDisclosuresByPrenup(prenupId);

    // Build report with user info
    const reportDisclosures = await Promise.all(
      disclosures.map(async (disclosure) => {
        const user = await userService.getUserById(disclosure.userId);
        
        return {
          user: user ? userService.sanitizeUser(user) : null,
          submittedAt: disclosure.createdAt,
          lastUpdated: disclosure.updatedAt,
          netWorth: disclosure.netWorth,
          assets: disclosure.assets,
          debts: disclosure.debts,
          income: disclosure.income
        };
      })
    );

    return {
      prenupId,
      prenupTitle: prenup?.title,
      state: prenup?.state,
      generatedAt: new Date().toISOString(),
      disclosures: reportDisclosures
    };
  }

  // Helper methods for validation
  validateAsset(asset: Asset): boolean {
    return !!(asset.type && asset.description && asset.value >= 0 && asset.ownership);
  }

  validateDebt(debt: Debt): boolean {
    return !!(debt.type && debt.description && debt.amount >= 0 && debt.creditor);
  }

  validateIncome(income: Income): boolean {
    const values = Object.values(income);
    return values.every(val => typeof val === 'number' && val >= 0);
  }

  // Get all versions of a financial disclosure (for audit trail)
  async getFinancialDisclosureVersions(disclosureId: string): Promise<FinancialDisclosure[]> {
    try {
      // This would use DynamoDB query to get all versions
      // For now, returning just the current version as placeholder
      const current = await this.getFinancialDisclosureById(disclosureId);
      return current ? [current] : [];
    } catch (error) {
      logger.error(`Error getting versions for disclosure ${disclosureId}:`, error);
      return [];
    }
  }
}

export const financialService = new FinancialService();