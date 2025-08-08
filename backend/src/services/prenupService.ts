import { dynamodbService, EntityType } from './dynamodb';
import { 
  Prenup, 
  PrenupStatus, 
  USState, 
  createPrenupEntity,
  PartnerInvitation,
  InvitationStatus,
  createPartnerInvitationEntity
} from '../types/entities';
import { userService } from './userService';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export class PrenupService {

  async createPrenup(prenupData: {
    title: string;
    state: USState;
    createdBy: string;
  }): Promise<Prenup> {
    // Get creator info to denormalize
    const creator = await userService.getUserById(prenupData.createdBy);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const prenupEntity = createPrenupEntity({
      title: prenupData.title,
      state: prenupData.state,
      status: PrenupStatus.DRAFT,
      createdBy: prenupData.createdBy,
      progress: {
        currentStep: 1,
        completedSteps: [],
        totalSteps: 8 // Default step count, can be state-specific
      },
      content: {},
      createdByEmail: creator.email // Denormalized for easier queries
    });

    const prenup = await dynamodbService.create<Prenup>(prenupEntity);
    logger.info(`Created prenup: ${prenup.title} by user ${prenup.createdBy}`);
    
    return prenup;
  }

  async getPrenupById(id: string): Promise<Prenup | null> {
    return await dynamodbService.getById<Prenup>(EntityType.PRENUP, id);
  }

  async updatePrenup(id: string, updates: Partial<Omit<Prenup, keyof import('../services/dynamodb').BaseEntity>>): Promise<Prenup> {
    return await dynamodbService.update<Prenup>(EntityType.PRENUP, id, updates, true);
  }

  async deletePrenup(id: string): Promise<void> {
    await dynamodbService.delete(EntityType.PRENUP, id);
    logger.info(`Deleted prenup: ${id}`);
  }

  async getPrenupsByUser(userId: string): Promise<Prenup[]> {
    try {
      // Get all prenups and filter by user access
      const result = await dynamodbService.queryByEntityType<Prenup>(EntityType.PRENUP);
      
      const userPrenups = result.items.filter(prenup => 
        prenup.createdBy === userId || prenup.partnerId === userId
      );

      return userPrenups.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      logger.error(`Error getting prenups for user ${userId}:`, error);
      return [];
    }
  }

  async addPartnerToPrenup(prenupId: string, partnerId: string): Promise<Prenup> {
    const prenup = await this.getPrenupById(prenupId);
    if (!prenup) {
      throw new Error('Prenup not found');
    }

    if (prenup.partnerId) {
      throw new Error('Prenup already has a partner');
    }

    // Get partner info for denormalization
    const partner = await userService.getUserById(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    return await this.updatePrenup(prenupId, {
      partnerId,
      partnerEmail: partner.email
    });
  }

  async invitePartner(prenupId: string, invitedBy: string, email: string): Promise<PartnerInvitation> {
    // Check if prenup exists and user has access
    const prenup = await this.getPrenupById(prenupId);
    if (!prenup) {
      throw new Error('Prenup not found');
    }

    if (prenup.createdBy !== invitedBy) {
      throw new Error('Only prenup creator can invite partners');
    }

    if (prenup.partnerId) {
      throw new Error('Prenup already has a partner');
    }

    // Check if partner is already a user
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      // Directly add as partner
      const updatedPrenup = await this.addPartnerToPrenup(prenupId, existingUser.id);
      // Return a mock invitation to indicate success
      return {
        id: 'direct-assignment',
        email,
        prenupId,
        invitedBy,
        token: '',
        status: InvitationStatus.ACCEPTED,
        expiresAt: new Date().toISOString(),
        entityType: EntityType.PARTNER_INVITATION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 'V0'
      };
    }

    // Create invitation for new user
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Get inviter info for denormalization
    const inviter = await userService.getUserById(invitedBy);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    const invitationEntity = createPartnerInvitationEntity({
      email,
      prenupId,
      invitedBy,
      token,
      status: InvitationStatus.PENDING,
      expiresAt: expiresAt.toISOString(),
      invitedByEmail: inviter.email
    });

    const invitation = await dynamodbService.create<PartnerInvitation>(invitationEntity);
    logger.info(`Created partner invitation for ${email} on prenup ${prenupId}`);
    
    return invitation;
  }

  async getPartnerInvitation(token: string): Promise<PartnerInvitation | null> {
    try {
      // Scan for invitation by token - in production you'd use a GSI
      const result = await dynamodbService.queryByEntityType<PartnerInvitation>(EntityType.PARTNER_INVITATION);
      const invitation = result.items.find(inv => inv.token === token);
      
      if (!invitation) {
        return null;
      }

      // Check if invitation is expired
      if (new Date(invitation.expiresAt) < new Date()) {
        await this.updatePartnerInvitation(invitation.id, { status: InvitationStatus.EXPIRED });
        return null;
      }

      return invitation;
    } catch (error) {
      logger.error(`Error finding invitation by token:`, error);
      return null;
    }
  }

  async acceptPartnerInvitation(token: string, acceptingUserId: string): Promise<Prenup> {
    const invitation = await this.getPartnerInvitation(token);
    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation has already been processed');
    }

    // Add partner to prenup
    const updatedPrenup = await this.addPartnerToPrenup(invitation.prenupId, acceptingUserId);

    // Update invitation status
    await this.updatePartnerInvitation(invitation.id, {
      status: InvitationStatus.ACCEPTED
    });

    logger.info(`Partner invitation accepted: ${invitation.id}`);
    return updatedPrenup;
  }

  private async updatePartnerInvitation(id: string, updates: Partial<PartnerInvitation>): Promise<PartnerInvitation> {
    return await dynamodbService.update<PartnerInvitation>(EntityType.PARTNER_INVITATION, id, updates, false);
  }

  async userHasAccessToPrenup(prenupId: string, userId: string): Promise<boolean> {
    const prenup = await this.getPrenupById(prenupId);
    if (!prenup) {
      return false;
    }

    return prenup.createdBy === userId || prenup.partnerId === userId;
  }

  // Get prenup with creator and partner info populated
  async getPrenupWithUsers(id: string): Promise<(Prenup & { 
    creator?: any, 
    partner?: any,
    documents?: any[],
    signatures?: any[]
  }) | null> {
    const prenup = await this.getPrenupById(id);
    if (!prenup) {
      return null;
    }

    // Get creator info
    const creator = await userService.getUserById(prenup.createdBy);
    
    // Get partner info if exists
    let partner = null;
    if (prenup.partnerId) {
      partner = await userService.getUserById(prenup.partnerId);
    }

    // In a real implementation, you'd also fetch related documents and signatures
    // For now, returning empty arrays as placeholders
    return {
      ...prenup,
      creator: creator ? userService.sanitizeUser(creator) : null,
      partner: partner ? userService.sanitizeUser(partner) : null,
      documents: [], // TODO: Implement document fetching
      signatures: []  // TODO: Implement signature fetching
    };
  }
}

export const prenupService = new PrenupService();