import { dynamodbService, EntityType } from './dynamodb';
import { User, UserRole, createUserEntity } from '../types/entities';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export class UserService {
  
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user entity
    const userEntity = createUserEntity({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || UserRole.USER
    });

    const user = await dynamodbService.create<User>(userEntity);
    logger.info(`Created user: ${user.email}`);
    
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return await dynamodbService.getById<User>(EntityType.USER, id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Use a scan to find user by email - in production you'd use a GSI
      const result = await dynamodbService.queryByEntityType<User>(EntityType.USER);
      const user = result.items.find(u => u.email === email);
      return user || null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<Omit<User, keyof import('../services/dynamodb').BaseEntity>>): Promise<User> {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    return await dynamodbService.update<User>(EntityType.USER, id, updates, true);
  }

  async deleteUser(id: string): Promise<void> {
    await dynamodbService.delete(EntityType.USER, id);
    logger.info(`Deleted user: ${id}`);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  generateToken(user: User): string {
    const secret = config.jwtSecret;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }
    
    return jwt.sign(
      { id: user.id, email: user.email },
      secret
    );
  }

  verifyToken(token: string): { id: string; email: string } | null {
    try {
      const secret = config.jwtSecret;
      if (!secret) {
        throw new Error('JWT secret not configured');
      }
      
      return jwt.verify(token, secret) as { id: string; email: string };
    } catch (error) {
      return null;
    }
  }

  sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async getAllUsers(limit?: number, lastKey?: any): Promise<{ users: Omit<User, 'password'>[], lastKey?: any }> {
    const result = await dynamodbService.queryByEntityType<User>(EntityType.USER, limit, lastKey);
    return {
      users: result.items.map(user => this.sanitizeUser(user)),
      lastKey: result.lastKey
    };
  }
}

export const userService = new UserService();