import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface MemberDocument extends mongoose.Document {
  _id: string;
  name: string;
  balance: number;
  email: string;
  password?: string;
  role: 'user' | 'lead' | 'admin';
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ['user', 'lead', 'admin'],
    default: 'user',
  }
}, {
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});
memberSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

memberSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Member = mongoose.model<MemberDocument>('Member', memberSchema);
