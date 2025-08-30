import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  role: 'main_admin' | 'country_admin' | 'state_admin' | 'city_admin' | 'producer' | 'buyer' | 'auditor';
  email?: string;
  name: string;
  organization?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['main_admin', 'country_admin', 'state_admin', 'city_admin', 'producer', 'buyer', 'auditor']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  countryId: {
    type: Number
  },
  stateId: {
    type: Number
  },
  cityId: {
    type: Number
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String,
    lowercase: true
  },
  approvedAt: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isApproved: 1 });
UserSchema.index({ countryId: 1, stateId: 1, cityId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);