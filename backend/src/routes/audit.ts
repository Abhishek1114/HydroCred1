import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { ProductionRequest } from '../models/ProductionRequest';

const router = Router();

// Middleware to verify auditor access
const requireAuditor = async (req: any, res: any, next: any) => {
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

    // Allow auditors and all admin roles
    const allowedRoles = ['auditor', 'main_admin', 'country_admin', 'state_admin', 'city_admin'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * @route GET /api/audit/transactions
 * @desc Get transaction history with filters
 */
router.get('/transactions',
  requireAuditor,
  [
    query('eventType').optional().isIn(['mint', 'transfer', 'retire', 'role_grant', 'role_revoke']).withMessage('Invalid event type'),
    query('from').optional().isEthereumAddress().withMessage('Invalid from address'),
    query('to').optional().isEthereumAddress().withMessage('Invalid to address'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        eventType,
        from,
        to,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      // Build query
      const query: any = {};

      if (eventType) query.eventType = eventType;
      if (from) query.from = from.toLowerCase();
      if (to) query.to = to.toLowerCase();
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate as string);
        if (endDate) query.timestamp.$lte = new Date(endDate as string);
      }

      // Apply jurisdiction filters for non-main admins
      if (req.user.role !== 'main_admin' && req.user.role !== 'auditor') {
        if (req.user.role === 'country_admin') {
          const users = await User.find({ countryId: req.user.countryId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.$or = [
            { from: { $in: addresses } },
            { to: { $in: addresses } }
          ];
        } else if (req.user.role === 'state_admin') {
          const users = await User.find({ stateId: req.user.stateId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.$or = [
            { from: { $in: addresses } },
            { to: { $in: addresses } }
          ];
        } else if (req.user.role === 'city_admin') {
          const users = await User.find({ cityId: req.user.cityId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.$or = [
            { from: { $in: addresses } },
            { to: { $in: addresses } }
          ];
        }
      }

      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');

      const total = await Transaction.countDocuments(query);

      res.json({
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
);

/**
 * @route GET /api/audit/production-requests
 * @desc Get production requests with filters
 */
router.get('/production-requests',
  requireAuditor,
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'minted']).withMessage('Invalid status'),
    query('producerAddress').optional().isEthereumAddress().withMessage('Invalid producer address'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        status,
        producerAddress,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      // Build query
      const query: any = {};

      if (status) query.status = status;
      if (producerAddress) query.producerAddress = producerAddress.toLowerCase();
      
      if (startDate || endDate) {
        query.submittedAt = {};
        if (startDate) query.submittedAt.$gte = new Date(startDate as string);
        if (endDate) query.submittedAt.$lte = new Date(endDate as string);
      }

      // Apply jurisdiction filters for non-main admins
      if (req.user.role !== 'main_admin' && req.user.role !== 'auditor') {
        if (req.user.role === 'country_admin') {
          const users = await User.find({ countryId: req.user.countryId, role: 'producer' }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.producerAddress = { $in: addresses };
        } else if (req.user.role === 'state_admin') {
          const users = await User.find({ stateId: req.user.stateId, role: 'producer' }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.producerAddress = { $in: addresses };
        } else if (req.user.role === 'city_admin') {
          const users = await User.find({ cityId: req.user.cityId, role: 'producer' }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          query.producerAddress = { $in: addresses };
        }
      }

      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      const requests = await ProductionRequest.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');

      const total = await ProductionRequest.countDocuments(query);

      res.json({
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get production requests error:', error);
      res.status(500).json({ error: 'Failed to get production requests' });
    }
  }
);

/**
 * @route GET /api/audit/export
 * @desc Export audit data as JSON or CSV
 */
router.get('/export',
  requireAuditor,
  [
    query('format').isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('type').isIn(['transactions', 'production-requests', 'all']).withMessage('Type must be transactions, production-requests, or all'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { format, type, startDate, endDate } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate || endDate) {
        if (startDate) dateFilter.$gte = new Date(startDate as string);
        if (endDate) dateFilter.$lte = new Date(endDate as string);
      }

      // Apply jurisdiction filters for non-main admins
      let jurisdictionFilter: any = {};
      if (req.user.role !== 'main_admin' && req.user.role !== 'auditor') {
        if (req.user.role === 'country_admin') {
          const users = await User.find({ countryId: req.user.countryId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          jurisdictionFilter = { $in: addresses };
        } else if (req.user.role === 'state_admin') {
          const users = await User.find({ stateId: req.user.stateId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          jurisdictionFilter = { $in: addresses };
        } else if (req.user.role === 'city_admin') {
          const users = await User.find({ cityId: req.user.cityId }).select('walletAddress');
          const addresses = users.map(u => u.walletAddress);
          jurisdictionFilter = { $in: addresses };
        }
      }

      let exportData: any = {};

      if (type === 'transactions' || type === 'all') {
        const transactionQuery: any = {};
        if (Object.keys(dateFilter).length > 0) {
          transactionQuery.timestamp = dateFilter;
        }
        if (Object.keys(jurisdictionFilter).length > 0) {
          transactionQuery.$or = [
            { from: jurisdictionFilter },
            { to: jurisdictionFilter }
          ];
        }

        const transactions = await Transaction.find(transactionQuery)
          .sort({ timestamp: -1 })
          .select('-__v')
          .lean();

        exportData.transactions = transactions;
      }

      if (type === 'production-requests' || type === 'all') {
        const requestQuery: any = {};
        if (Object.keys(dateFilter).length > 0) {
          requestQuery.submittedAt = dateFilter;
        }
        if (Object.keys(jurisdictionFilter).length > 0) {
          requestQuery.producerAddress = jurisdictionFilter;
        }

        const requests = await ProductionRequest.find(requestQuery)
          .sort({ submittedAt: -1 })
          .select('-__v')
          .lean();

        exportData.productionRequests = requests;
      }

      if (format === 'csv') {
        // Convert to CSV format
        let csvData = '';
        
        if (exportData.transactions) {
          csvData += 'Transactions\n';
          csvData += 'Transaction Hash,Block Number,From,To,Event Type,Token IDs,Amount,Role,Timestamp,Status\n';
          
          exportData.transactions.forEach((tx: any) => {
            csvData += `${tx.transactionHash},${tx.blockNumber},${tx.from},${tx.to || ''},${tx.eventType},${tx.tokenIds?.join(';') || ''},${tx.amount || ''},${tx.role || ''},${tx.timestamp},${tx.status}\n`;
          });
          
          csvData += '\n';
        }

        if (exportData.productionRequests) {
          csvData += 'Production Requests\n';
          csvData += 'ID,Producer Address,Amount,Certification Hash,Status,Submitted At,Certified By,Certified At,Rejection Reason\n';
          
          exportData.productionRequests.forEach((req: any) => {
            csvData += `${req._id},${req.producerAddress},${req.amount},${req.certificationHash},${req.status},${req.submittedAt},${req.certifiedBy || ''},${req.certifiedAt || ''},${req.rejectionReason || ''}\n`;
          });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=hydrocred-audit-${Date.now()}.csv`);
        res.send(csvData);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=hydrocred-audit-${Date.now()}.json`);
        res.json(exportData);
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }
);

/**
 * @route GET /api/audit/statistics
 * @desc Get audit statistics
 */
router.get('/statistics', requireAuditor, async (req, res) => {
  try {
    // Build jurisdiction filter
    let jurisdictionFilter: any = {};
    if (req.user.role !== 'main_admin' && req.user.role !== 'auditor') {
      if (req.user.role === 'country_admin') {
        const users = await User.find({ countryId: req.user.countryId }).select('walletAddress');
        const addresses = users.map(u => u.walletAddress);
        jurisdictionFilter = { $in: addresses };
      } else if (req.user.role === 'state_admin') {
        const users = await User.find({ stateId: req.user.stateId }).select('walletAddress');
        const addresses = users.map(u => u.walletAddress);
        jurisdictionFilter = { $in: addresses };
      } else if (req.user.role === 'city_admin') {
        const users = await User.find({ cityId: req.user.cityId }).select('walletAddress');
        const addresses = users.map(u => u.walletAddress);
        jurisdictionFilter = { $in: addresses };
      }
    }

    // Transaction statistics
    const transactionQuery: any = {};
    if (Object.keys(jurisdictionFilter).length > 0) {
      transactionQuery.$or = [
        { from: jurisdictionFilter },
        { to: jurisdictionFilter }
      ];
    }

    const totalTransactions = await Transaction.countDocuments(transactionQuery);
    const mintTransactions = await Transaction.countDocuments({ ...transactionQuery, eventType: 'mint' });
    const transferTransactions = await Transaction.countDocuments({ ...transactionQuery, eventType: 'transfer' });
    const retireTransactions = await Transaction.countDocuments({ ...transactionQuery, eventType: 'retire' });

    // Production request statistics
    const requestQuery: any = {};
    if (Object.keys(jurisdictionFilter).length > 0) {
      requestQuery.producerAddress = jurisdictionFilter;
    }

    const totalRequests = await ProductionRequest.countDocuments(requestQuery);
    const pendingRequests = await ProductionRequest.countDocuments({ ...requestQuery, status: 'pending' });
    const approvedRequests = await ProductionRequest.countDocuments({ ...requestQuery, status: 'approved' });
    const rejectedRequests = await ProductionRequest.countDocuments({ ...requestQuery, status: 'rejected' });
    const mintedRequests = await ProductionRequest.countDocuments({ ...requestQuery, status: 'minted' });

    // User statistics
    const userQuery: any = {};
    if (req.user.role === 'country_admin') {
      userQuery.countryId = req.user.countryId;
    } else if (req.user.role === 'state_admin') {
      userQuery.stateId = req.user.stateId;
    } else if (req.user.role === 'city_admin') {
      userQuery.cityId = req.user.cityId;
    }

    const totalUsers = await User.countDocuments(userQuery);
    const producers = await User.countDocuments({ ...userQuery, role: 'producer' });
    const buyers = await User.countDocuments({ ...userQuery, role: 'buyer' });

    res.json({
      transactions: {
        total: totalTransactions,
        mint: mintTransactions,
        transfer: transferTransactions,
        retire: retireTransactions
      },
      productionRequests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        minted: mintedRequests
      },
      users: {
        total: totalUsers,
        producers,
        buyers
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;