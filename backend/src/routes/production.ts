import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { ProductionRequest } from '../models/ProductionRequest';
import { blockchainService } from '../services/blockchain';

const router = Router();

// Middleware to verify user authentication
const requireAuth = async (req: any, res: any, next: any) => {
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

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * @route POST /api/production/submit-request
 * @desc Submit hydrogen production request (Producer only)
 */
router.post('/submit-request',
  requireAuth,
  [
    body('amount').isInt({ min: 1, max: 1000 }).withMessage('Amount must be between 1 and 1000 kg'),
    body('productionDate').isISO8601().withMessage('Invalid production date'),
    body('facilityLocation').isString().trim().notEmpty().withMessage('Facility location is required'),
    body('productionMethod').isString().trim().notEmpty().withMessage('Production method is required'),
    body('energySource').isString().trim().notEmpty().withMessage('Energy source is required'),
    body('notes').optional().isString().trim().withMessage('Notes must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is a producer
      if (req.user.role !== 'producer') {
        return res.status(403).json({ error: 'Only producers can submit production requests' });
      }

      // Check if producer is approved
      if (!req.user.isApproved) {
        return res.status(403).json({ error: 'Producer not approved yet' });
      }

      const {
        amount,
        productionDate,
        facilityLocation,
        productionMethod,
        energySource,
        notes
      } = req.body;

      // Generate certification hash
      const certificationData = {
        producerAddress: req.user.walletAddress,
        amount,
        productionDate,
        facilityLocation,
        productionMethod,
        energySource,
        timestamp: Date.now()
      };

      const certificationHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(certificationData))
        .digest('hex');

      // Check if certification hash already exists
      const existingRequest = await ProductionRequest.findOne({ certificationHash });
      if (existingRequest) {
        return res.status(400).json({ error: 'Duplicate production request' });
      }

      // Create production request
      const productionRequest = new ProductionRequest({
        producerAddress: req.user.walletAddress,
        amount,
        certificationHash,
        status: 'pending',
        metadata: {
          productionDate: new Date(productionDate),
          facilityLocation,
          productionMethod,
          energySource,
          notes
        }
      });

      await productionRequest.save();

      res.status(201).json({
        message: 'Production request submitted successfully',
        request: {
          id: productionRequest._id,
          certificationHash,
          amount,
          status: productionRequest.status,
          submittedAt: productionRequest.submittedAt
        }
      });
    } catch (error) {
      console.error('Submit production request error:', error);
      res.status(500).json({ error: 'Failed to submit production request' });
    }
  }
);

/**
 * @route POST /api/production/certify
 * @desc Certify production request (City Admin only)
 */
router.post('/certify',
  requireAuth,
  [
    body('requestId').isMongoId().withMessage('Invalid request ID'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('rejectionReason').optional().isString().trim().withMessage('Rejection reason must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user is a city admin
      if (req.user.role !== 'city_admin') {
        return res.status(403).json({ error: 'Only city admins can certify production requests' });
      }

      const { requestId, action, rejectionReason } = req.body;

      // Find production request
      const productionRequest = await ProductionRequest.findById(requestId);
      if (!productionRequest) {
        return res.status(404).json({ error: 'Production request not found' });
      }

      // Check if request is in pending status
      if (productionRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Request is not in pending status' });
      }

      // Check if producer is under this city admin's jurisdiction
      const producer = await User.findOne({ walletAddress: productionRequest.producerAddress });
      if (!producer || producer.cityId !== req.user.cityId) {
        return res.status(403).json({ error: 'Producer not under your jurisdiction' });
      }

      if (action === 'reject') {
        // Reject the request
        productionRequest.status = 'rejected';
        productionRequest.rejectionReason = rejectionReason;
        productionRequest.certifiedBy = req.user.walletAddress;
        productionRequest.certifiedAt = new Date();
        await productionRequest.save();

        res.json({
          message: 'Production request rejected',
          request: {
            id: productionRequest._id,
            status: productionRequest.status,
            rejectionReason: productionRequest.rejectionReason,
            certifiedAt: productionRequest.certifiedAt
          }
        });
      } else {
        // Approve the request
        productionRequest.status = 'approved';
        productionRequest.certifiedBy = req.user.walletAddress;
        productionRequest.certifiedAt = new Date();
        await productionRequest.save();

        res.json({
          message: 'Production request approved',
          request: {
            id: productionRequest._id,
            certificationHash: productionRequest.certificationHash,
            status: productionRequest.status,
            certifiedAt: productionRequest.certifiedAt
          }
        });
      }
    } catch (error) {
      console.error('Certify production request error:', error);
      res.status(500).json({ error: 'Failed to certify production request' });
    }
  }
);

/**
 * @route POST /api/production/mint
 * @desc Mint tokens for approved production request
 */
router.post('/mint',
  requireAuth,
  [
    body('requestId').isMongoId().withMessage('Invalid request ID'),
    body('certifierSignature').isString().notEmpty().withMessage('Certifier signature is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { requestId, certifierSignature } = req.body;

      // Find production request
      const productionRequest = await ProductionRequest.findById(requestId);
      if (!productionRequest) {
        return res.status(404).json({ error: 'Production request not found' });
      }

      // Check if request is approved
      if (productionRequest.status !== 'approved') {
        return res.status(400).json({ error: 'Production request is not approved' });
      }

      // Check if user is the producer
      if (productionRequest.producerAddress !== req.user.walletAddress) {
        return res.status(403).json({ error: 'Only the producer can mint tokens' });
      }

      // Mint tokens on blockchain
      const result = await blockchainService.mintWithCertification(
        productionRequest.producerAddress,
        productionRequest.amount,
        productionRequest.certificationHash,
        certifierSignature
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'Tokens minted successfully',
        transactionHash: result.transactionHash,
        tokenIds: result.tokenIds,
        amount: productionRequest.amount
      });
    } catch (error) {
      console.error('Mint tokens error:', error);
      res.status(500).json({ error: 'Failed to mint tokens' });
    }
  }
);

/**
 * @route GET /api/production/requests
 * @desc Get production requests for user
 */
router.get('/requests', requireAuth, async (req, res) => {
  try {
    let query: any = {};

    if (req.user.role === 'producer') {
      // Producers see their own requests
      query.producerAddress = req.user.walletAddress;
    } else if (req.user.role === 'city_admin') {
      // City admins see requests from producers in their city
      const producers = await User.find({ 
        role: 'producer', 
        cityId: req.user.cityId 
      }).select('walletAddress');
      
      const producerAddresses = producers.map(p => p.walletAddress);
      query.producerAddress = { $in: producerAddresses };
    }

    const requests = await ProductionRequest.find(query)
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({ requests });
  } catch (error) {
    console.error('Get production requests error:', error);
    res.status(500).json({ error: 'Failed to get production requests' });
  }
});

/**
 * @route GET /api/production/request/:id
 * @desc Get specific production request
 */
router.get('/request/:id', requireAuth, async (req, res) => {
  try {
    const request = await ProductionRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Production request not found' });
    }

    // Check permissions
    if (req.user.role === 'producer' && request.producerAddress !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'city_admin') {
      const producer = await User.findOne({ walletAddress: request.producerAddress });
      if (!producer || producer.cityId !== req.user.cityId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ request });
  } catch (error) {
    console.error('Get production request error:', error);
    res.status(500).json({ error: 'Failed to get production request' });
  }
});

export default router;