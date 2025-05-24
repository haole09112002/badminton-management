export interface BadmintonSessionRequest {
  courtType: 'fixed' | 'casual'
  dateList: Date[];
  startTime: string,
  endTime: string,
  location: string;
  courtFee: number;
  shuttlecockFee: number;
  participants: ParticipantRequest[];
  extraFee: number
  note?: string;
  groupId: string
  numberShuttlecock: number
}

export interface ParticipantRequest {
  memberId: string
  isCourtFeeApplied: boolean
  isShuttlecockFeeApplied: boolean,
  isExtraFeeApplied: boolean,
  courtFee: number
  shuttlecockFee: number
  extraFee: number
  modifiedFee: number
}

export interface PaymentRequest {
  groupId: string
  amount: number,
  note?: string
}

export interface ShuttlecockFeeRequest {
  groupId: string
  shuttlecockFee: number
  numberShuttlecock: number
  note?: string
}

