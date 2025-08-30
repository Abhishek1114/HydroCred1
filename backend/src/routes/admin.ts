import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { blockchainService } from '../services/blockchain';

const router = Router();

// Middleware to verify admin role
const requireAdmin = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId);

      if (!user || !user.isApproved) {
        return res.status(403).json({ error: 'User not approved' });
      }

      // Check role hierarchy
      const roleHierarchy = {
        'main_admin': 4,
        'country_admin': 3,
        'state_admin': 2,
        'city_admin': 1
      };

      const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

/**
 * @route POST /api/admin/appoint-country-admin
 * @desc Appoint country admin (Main Admin only)
 */
router.post('/appoint-country-admin', 
  requireAdmin('main_admin'),
  [
    body('adminAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('countryId').isInt({ min: 1 }).withMessage('Invalid country ID'),
    body('name').isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('organization').optional().isString().trim().withMessage('Organization must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { adminAddress, countryId, name, email, organization } = req.body;

      // Check if user already exists
      let user = await User.findOne({ walletAddress: adminAddress.toLowerCase() });
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user in database
      user = new User({
        walletAddress: adminAddress.toLowerCase(),
        role: 'country_admin',
        name,
        email,
        organization,
        countryId,
        isApproved: true,
        approvedBy: req.user.walletAddress,
        approvedAt: new Date()
      });

      await user.save();

      // Appoint on blockchain
      const result = await blockchainService.appointCountryAdmin(adminAddress, countryId);
      
      if (!result.success) {
        // Rollback database change
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'Country admin appointed successfully',
        user: {
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          organization: user.organization,
          countryId: user.countryId
        },
        transactionHash: result.transactionHash
      });
    } catch (error) {
      console.error('Appoint country admin error:', error);
      res.status(500).json({ error: 'Failed to appoint country admin' });
    }
  }
);

/**
 * @route POST /api/admin/appoint-state-admin
 * @desc Appoint state admin (Country Admin only)
 */
router.post('/appoint-state-admin',
  requireAdmin('country_admin'),
  [
    body('adminAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('stateId').isInt({ min: 1 }).withMessage('Invalid state ID'),
    body('name').isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('organization').optional().isString().trim().withMessage('Organization must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { adminAddress, stateId, name, email, organization } = req.body;

      // Check if user already exists
      let user = await User.findOne({ walletAddress: adminAddress.toLowerCase() });
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user in database
      user = new User({
        walletAddress: adminAddress.toLowerCase(),
        role: 'state_admin',
        name,
        email,
        organization,
        countryId: req.user.countryId,
        stateId,
        isApproved: true,
        approvedBy: req.user.walletAddress,
        approvedAt: new Date()
      });

      await user.save();

      // Appoint on blockchain
      const result = await blockchainService.appointStateAdmin(adminAddress, stateId);
      
      if (!result.success) {
        // Rollback database change
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'State admin appointed successfully',
        user: {
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          organization: user.organization,
          stateId: user.stateId
        },
        transactionHash: result.transactionHash
      });
    } catch (error) {
      console.error('Appoint state admin error:', error);
      res.status(500).json({ error: 'Failed to appoint state admin' });
    }
  }
);

/**
 * @route POST /api/admin/appoint-city-admin
 * @desc Appoint city admin (State Admin only)
 */
router.post('/appoint-city-admin',
  requireAdmin('state_admin'),
  [
    body('adminAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('cityId').isInt({ min: 1 }).withMessage('Invalid city ID'),
    body('name').isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('organization').optional().isString().trim().withMessage('Organization must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { adminAddress, cityId, name, email, organization } = req.body;

      // Check if user already exists
      let user = await User.findOne({ walletAddress: adminAddress.toLowerCase() });
      
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user in database
      user = new User({
        walletAddress: adminAddress.toLowerCase(),
        role: 'city_admin',
        name,
        email,
        organization,
        countryId: req.user.countryId,
        stateId: req.user.stateId,
        cityId,
        isApproved: true,
        approvedBy: req.user.walletAddress,
        approvedAt: new Date()
      });

      await user.save();

      // Appoint on blockchain
      const result = await blockchainService.appointCityAdmin(adminAddress, cityId);
      
      if (!result.success) {
        // Rollback database change
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'City admin appointed successfully',
        user: {
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          organization: user.organization,
          cityId: user.cityId
        },
        transactionHash: result.transactionHash
      });
    } catch (error) {
      console.error('Appoint city admin error:', error);
      res.status(500).json({ error: 'Failed to appoint city admin' });
    }
  }
);

/**
 * @route POST /api/admin/approve-producer
 * @desc Approve producer registration (City Admin only)
 */
router.post('/approve-producer',
  requireAdmin('city_admin'),
  [
    body('producerAddress').isEthereumAddress().withMessage('Invalid wallet address')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { producerAddress } = req.body;

      // Find producer in database
      const producer = await User.findOne({ 
        walletAddress: producerAddress.toLowerCase(),
        role: 'producer'
      });

      if (!producer) {
        return res.status(404).json({ error: 'Producer not found' });
      }

      if (producer.isApproved) {
        return res.status(400).json({ error: 'Producer already approved' });
      }

      // Update producer approval
      producer.isApproved = true;
      producer.approvedBy = req.user.walletAddress;
      producer.approvedAt = new Date();
      await producer.save();

      // Register on blockchain
      const result = await blockchainService.registerProducer(producerAddress);
      
      if (!result.success) {
        // Rollback database change
        producer.isApproved = false;
        producer.approvedBy = undefined;
        producer.approvedAt = undefined;
        await producer.save();
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'Producer approved successfully',
        producer: {
          walletAddress: producer.walletAddress,
          name: producer.name,
          organization: producer.organization,
          approvedBy: producer.approvedBy,
          approvedAt: producer.approvedAt
        },
        transactionHash: result.transactionHash
      });
    } catch (error) {
      console.error('Approve producer error:', error);
      res.status(500).json({ error: 'Failed to approve producer' });
    }
  }
);

/**
 * @route GET /api/admin/pending-approvals
 * @desc Get pending approvals for admin
 */
router.get('/pending-approvals', requireAdmin('city_admin'), async (req, res) => {
  try {
    const pendingProducers = await User.find({
      role: 'producer',
      isApproved: false,
      cityId: req.user.cityId
    }).select('-__v');

    res.json({ pendingProducers });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to get pending approvals' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc Get users under admin's jurisdiction
 */
router.get('/users', requireAdmin('city_admin'), async (req, res) => {
  try {
    const users = await User.find({
      cityId: req.user.cityId
    }).select('-__v').sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;