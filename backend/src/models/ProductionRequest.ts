import mongoose, { Document, Schema } from 'mongoose';

export interface IProductionRequest extends Document {
  producerAddress: string;
  amount: number; // kg of hydrogen
  certificationHash: string;
  status: 'pending' | 'approved' | 'rejected' | 'minted';
  submittedAt: Date;
  certifiedBy?: string;
  certifiedAt?: Date;
  rejectionReason?: string;
  metadata: {
    productionDate: Date;
    facilityLocation: string;
    productionMethod: string;
    energySource: string;
    documents?: string[];
    notes?: string;
  };
  transactionHash?: string;
  tokenIds?: number[];
}

const ProductionRequestSchema = new Schema<IProductionRequest>({
  producerAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  certificationHash: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'minted'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  certifiedBy: {
    type: String,
    lowercase: true
  },
  certifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  metadata: {
    productionDate: {
      type: Date,
      required: true
    },
    facilityLocation: {
      type: String,
      required: true
    },
    productionMethod: {
      type: String,
      required: true
    },
    energySource: {
      type: String,
      required: true
    },
    documents: [{
      type: String
    }],
    notes: {
      type: String
    }
  },
  transactionHash: {
    type: String
  },
  tokenIds: [{
    type: Number
  }]
}, {
  timestamps: true
});

// Indexes
ProductionRequestSchema.index({ producerAddress: 1 });
ProductionRequestSchema.index({ status: 1 });
ProductionRequestSchema.index({ certificationHash: 1 });
ProductionRequestSchema.index({ certifiedBy: 1 });
ProductionRequestSchema.index({ submittedAt: -1 });

export const ProductionRequest = mongoose.model<IProductionRequest>('ProductionRequest', ProductionRequestSchema);