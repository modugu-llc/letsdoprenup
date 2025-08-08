import express from 'express';
import Joi from 'joi';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { userService } from '../services/userService';
import { Handler } from 'aws-lambda';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register user
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { email, password, firstName, lastName } = value;

  try {
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = userService.generateToken(user);

    res.status(201).json({
      success: true,
      data: { user: userService.sanitizeUser(user), token },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    if (error.message === 'User already exists with this email') {
      throw createError(error.message, 400);
    }
    throw error;
  }
}));

// Login user
router.post('/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw createError(error.details[0].message, 400);
  }

  const { email, password } = value;

  // Find user
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await userService.verifyPassword(user, password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = userService.generateToken(user);

  res.json({
    success: true,
    data: { user: userService.sanitizeUser(user), token },
    message: 'Login successful'
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = await userService.getUserById(req.user!.id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user: userService.sanitizeUser(user) }
  });
}));

// Lambda-compatible handlers for serverless deployment
export const registerHandler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { error, value } = registerSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: error.details[0].message
        })
      };
    }

    const { email, password, firstName, lastName } = value;
    
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName
    });

    const token = userService.generateToken(user);

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: { user: userService.sanitizeUser(user), token },
        message: 'User registered successfully'
      })
    };
  } catch (error: any) {
    return {
      statusCode: error.message === 'User already exists with this email' ? 400 : 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

export const loginHandler: Handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { error, value } = loginSchema.validate(body);
    
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: error.details[0].message
        })
      };
    }

    const { email, password } = value;
    
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        })
      };
    }

    const isPasswordValid = await userService.verifyPassword(user, password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        })
      };
    }

    const token = userService.generateToken(user);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: { user: userService.sanitizeUser(user), token },
        message: 'Login successful'
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