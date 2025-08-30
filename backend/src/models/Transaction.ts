import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionHash: string;
  blockNumber: number;
  from: string;
  to?: string;
  eventType: 'mint' | 'transfer' | 'retire' | 'role_grant' | 'role_revoke';
  tokenIds?: number[];
  amount?: number;
  role?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  gasUsed?: number;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  errorMessage?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true,
    lowercase: true
  },
  to: {
    type: String,
    lowercase: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['mint', 'transfer', 'retire', 'role_grant', 'role_revoke']
  },
  tokenIds: [{
    type: Number
  }],
  amount: {
    type: Number
  },
  role: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true
  },
  gasUsed: {
    type: Number
  },
  gasPrice: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
TransactionSchema.index({ transactionHash: 1 });
TransactionSchema.index({ from: 1 });
TransactionSchema.index({ to: 1 });
TransactionSchema.index({ eventType: 1 });
TransactionSchema.index({ timestamp: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ blockNumber: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);