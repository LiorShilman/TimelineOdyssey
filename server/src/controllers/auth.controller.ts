import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import logger from '../utils/logger.utils.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }

    if (
      error.message.includes('Invalid email') ||
      error.message.includes('Password must')
    ) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    const result = await authService.login({ email, password });

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    if (
      error.message.includes('Invalid email or password') ||
      error.message.includes('Account is deactivated')
    ) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // Here we just acknowledge the logout request
    logger.info(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const { verifyToken, generateAccessToken } = await import('../utils/jwt.utils.js');
    const payload = verifyToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Invalid or expired token')) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid or expired refresh token',
      });
    }

    next(error);
  }
}
