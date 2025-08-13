export interface BadmintonSession {
  id: string
  courtType: 'fixed' | 'casual'
  time: Date
  location: string
  courtFee: number
  shuttlecockFee: number
  numberParticipant: number
  participants: Participant[]
  extraFee: number
  note?: string;
  status: 'init' | 'edited' | 'done' | 'confirmed';
  _id?: string,
  updateTime: string,
  updateById: string,
  updateByName: string,
  startTime: string,
  endTime: string
  numberShuttlecock: number
}

export interface Participant {
  memberId: string
  name: string
  isCourtFeeApplied: boolean
  isShuttlecockFeeApplied: boolean,
  isExtraFeeApplied: boolean,
  courtFee: number
  shuttlecockFee: number
  extraFee: number
  modifiedFee: number,
  balance: number
  participants?: {
    name: string;
    isCourtFeeApplied: boolean;
    isShuttlecockFeeApplied: boolean;
    isExtraFeeApplied: boolean;
    courtFee: number;
    shuttlecockFee: number;
    extraFee: number;
  }[];
}

export interface ExtraFee {
  name: string;       // Tên loại phí, ví dụ: "Phí nước"
  amount: number;     // Số tiền
}


export interface StatusAmount {
  pending: number,
  accepted: number
}

export interface MemberBalance {
  memberId: string
  name: string
  balance: number
  statusAmounts: StatusAmount
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export interface PaymentResponse {
  _id: string;
  amount: number | string;
  date: string;
  note?: string;
  memberId: string;
  updateById: string;
  updateTime: string;
  status: 'pending' | 'accepted' | 'rejected';
}


export interface BadmintonTeamResponse {
  name: string
  amount: number
  numberShuttlecock: number
  shuttlecockFee: number
  fixedCourtFee: number
  note?: string
  updateById?: { name: string }
  updateTime: string | Date
}

export interface Transaction {
  _id: string;
  type: 'group' | 'person';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
  sessionId?: string;
}

export interface BadmintonSessionWaringResponse {
  session: BadmintonSession,
  errors: Partial<Record<'shuttlecockFee' | 'numberShuttlecock', string>>;
}
