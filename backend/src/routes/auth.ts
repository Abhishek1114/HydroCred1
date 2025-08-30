import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { blockchainService } from '../services/blockchain';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with wallet signature
 */
router.post('/login', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').isString().notEmpty().withMessage('Signature is required'),
  body('message').isString().notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const ethers = require('ethers');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Get user from database
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Get role from blockchain
    const blockchainRole = await blockchainService.getUserRole(walletAddress);
    
    if (blockchainRole && blockchainRole !== user.role) {
      // Update role if it changed on blockchain
      user.role = blockchainRole as any;
      await user.save();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        walletAddress: user.walletAddress,
        role: user.role,
        userId: user._id 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        organization: user.organization,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 */
router.post('/register', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').isIn(['producer', 'buyer']).withMessage('Invalid role'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('organization').optional().isString().trim().withMessage('Organization must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, name, role, email, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      name,
      role,
      email,
      organization,
      isApproved: role === 'buyer' // Buyers are auto-approved
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        organization: user.organization,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        organization: user.organization,
        isApproved: user.isApproved,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;