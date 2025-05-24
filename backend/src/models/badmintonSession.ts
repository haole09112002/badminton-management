import mongoose, { Schema, Document } from 'mongoose';
import { MemberDocument } from './Member';

export interface Participant {
  memberId: MemberDocument; // ID của thành viên
  courtFee: number; // Số tiền phí sân
  shuttlecockFee: number; // Số tiền phí cầu
  extraFee: number; // Số tiền phí khác (ví dụ: huấn luyện viên)
  modifiedFee: number;

  // Các trường boolean để xác định liệu có tính phí hay không
  isCourtFeeApplied: boolean; // Phí sân có được áp dụng không
  isShuttlecockFeeApplied: boolean; // Phí cầu có được áp dụng không
  isExtraFeeApplied: boolean; // Phí khác có được áp dụng không
}

export interface BadmintonSession extends Document {
  courtType: "fixed" | "casual",
  time: Date; // Thời gian buổi đánh
  startTime: string;
  endTime: string;
  location: string; // Địa chỉ
  courtFee: number; // Tiền sân
  shuttlecockFee: number; // Tiền cầu
  participantsCount: number; // Số lượng người tham gia
  participants: Participant[];
  extraFee: number; // Thêm trường này
  note?: string;
  status: 'init' | 'edited' | 'confirmed' | 'done';
  updateTime: Date;
  updateById: MemberDocument;
  groupId: string
  numberShuttlecock: number
}

const badmintonSessionSchema = new Schema({
  courtType: { type: String, enum: ['fixed', 'casual'] },
  time: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  courtFee: { type: Number, required: true },
  shuttlecockFee: { type: Number, required: true },
  participantsCount: { type: Number, required: true },
  participants: [
    {
      _id: false,
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
      courtFee: { type: Number, default: 0 }, // Phí sân
      shuttlecockFee: { type: Number, default: 0 }, // Phí cầu
      extraFee: { type: Number, default: 0 }, // Phí khác
      modifiedFee: { type: Number, default: 0 }, // Phí khác
      isCourtFeeApplied: { type: Boolean, default: false }, // Có áp dụng phí sân không
      isShuttlecockFeeApplied: { type: Boolean, default: false }, // Có áp dụng phí cầu không
      isExtraFeeApplied: { type: Boolean, default: false }, // Có áp dụng phí khác không
    }
  ],
  extraFee: { type: Number, required: true, default: 0 },
  note: { type: String },
  status: { type: String, enum: ['init', 'edited', 'confirmed', 'done'], default: 'init' },
  updateTime: { type: Date, required: true, default: Date() },
  updateById: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'BadmintonTeam', required: true },
  numberShuttlecock: { type: Number, required: true, default: 0 }
});

const BadmintonSessionModel = mongoose.model<BadmintonSession>('BadmintonSession', badmintonSessionSchema);

export { BadmintonSessionModel };
