import { Request, Response } from 'express';
import mongoose, { ClientSession } from 'mongoose';
import { InternalErrorResponse, SuccessResponse, NotFoundResponse, BadRequestResponse } from '../common/responseType';
import { BadmintonSessionModel, Participant, BadmintonSession } from '../models/badmintonSession';
import { BadmintonTeam } from '../models/BadmintonTeam';
import { Member, MemberDocument } from '../models/Member';
import { Payment } from '../models/payment';
import { BadmintonSessionRequest, ParticipantRequest, PassBadmintonSessionRequest } from '../models/requests';
import { BadmintonSessionResponse, BadmintonSessionWaringResponse } from '../models/responses';
import { TransactionHistory } from '../models/TransactionHistory';
import paymentService from '../services/paymentService';
import PaymentService from '../services/paymentService';
import { formatDateVi } from '../utils/date';
import { splitFeeEvenlyInt } from '../utils/money';
import { console } from 'inspector';

// Tạo buổi đánh cầu lông mới
export const createBadmintonSession = async (req: Request, res: Response) => {
  try {
    const { courtType, dateList, location, courtFee, shuttlecockFee, participants, extraFee, note, startTime, endTime, groupId, numberShuttlecock } = req.body as BadmintonSessionRequest;
    const user = (req as any).user;
    console.log(participants)
    if (!courtType || !dateList || dateList.length < 0 || !location || !startTime || !endTime) {
      return new InternalErrorResponse("Thiếu thông tin bắt buộc tên sân hoặc ngày đánh").send(res);
    }

    if (participants.length > 0) {
      const validMembers = await Member.find({
        _id: { $in: participants.map(p => p.memberId) },
        deletedAt: null
      });

      if (validMembers.length !== participants.length) {
        return new InternalErrorResponse("Một hoặc nhiều thành viên không tồn tại trong hệ thống").send(res);
      }
    }

    // ─── CASUAL: giờ cũng dùng transaction và trừ courtFee ngay như fixed ───
    if (courtType === 'casual') {
      const mongoSession: ClientSession = await mongoose.startSession();
      mongoSession.startTransaction();

      try {
        const time = new Date(dateList[0]);
        const updatedParticipants: Participant[] = await mapParticipantsRequestToParticipant(
          participants, courtFee, shuttlecockFee, extraFee
        );

        const newSession = new BadmintonSessionModel({
          courtType,
          time,
          startTime,
          endTime,
          location,
          courtFee,
          shuttlecockFee,
          extraFee,
          note,
          status: 'init',
          participantsCount: updatedParticipants.length,
          participants: updatedParticipants,
          updateTime: Date(),
          groupId,
          numberShuttlecock,
          updateById: user.id
        });
        await newSession.save({ session: mongoSession });

        const team = await PaymentService.findTeamByGroupId(groupId, mongoSession);

        // Validate số dư nhóm trước khi trừ
        if (team.amount < courtFee) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return new BadRequestResponse("Số dư nhóm không đủ để thanh toán tiền sân").send(res);
        }

        await PaymentService.updateTeamBalance(team, courtFee * -1, mongoSession);

        const dateFormat = formatDateVi(new Date(dateList[0]));
        await PaymentService.recordTransactionHistoryForGroup(
          undefined,
          team,
          courtFee * -1,
          undefined,
          mongoSession,
          `Thanh toán tiền sân vãng lai ${location} ngày ${dateFormat}`
        );

        await mongoSession.commitTransaction();

        const populatedSession = await BadmintonSessionModel.findById(newSession._id)
          .populate('updateById', 'name')
          .lean();

        return new SuccessResponse('Tạo buổi đánh thành công', {
          ...populatedSession,
          updateById: populatedSession?.updateById?._id?.toString() || "",
          updateByName: (populatedSession?.updateById as any)?.name || ""
        }).send(res);

      } catch (error) {
        console.log("ERROR", error);
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return new InternalErrorResponse().send(res);
      } finally {
        mongoSession.endSession();
      }
    }

    // ─── FIXED: logic không đổi ───
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      let updatedParticipants: Participant[] = [];

      for (const date of dateList) {
        const time = new Date(date);
        const courtFeePerSession = courtFee / dateList.length;
        const courtFeeApplied = participants.filter(p => p.isCourtFeeApplied);

        updatedParticipants = participants.map(p => ({
          ...p,
          memberId: p.memberId as unknown as MemberDocument,
          courtFee: p.isCourtFeeApplied ? courtFeePerSession / courtFeeApplied.length : 0,
          shuttlecockFee: 0,
          extraFee: 0,
        }));

        const newSession = new BadmintonSessionModel({
          courtType,
          time,
          startTime,
          endTime,
          location,
          courtFee: courtFeePerSession,
          shuttlecockFee,
          extraFee,
          note,
          status: 'init',
          participantsCount: updatedParticipants.length,
          participants: updatedParticipants,
          updateTime: Date(),
          groupId,
          updateById: user.id
        });
        await newSession.save({ session });
      }

      const team = await PaymentService.findTeamByGroupId(groupId, session);
      if (team.amount < courtFee) {
        await session.abortTransaction();
        session.endSession();
        return new BadRequestResponse("Số dư nhóm không đủ để thanh toán tiền sân cố định").send(res);
      }

      await PaymentService.updateTeamBalance(team, courtFee * -1, session);

      const dateFormat = dateList
        .map(date => formatDateVi(new Date(date)))
        .join(', ');
      const message = `Thanh toán tiền sân cố định ${location} các ngày ${dateFormat}`;
      await PaymentService.recordTransactionHistoryForGroup(undefined, team, courtFee * -1, undefined, session, message);

      await session.commitTransaction();
      return new SuccessResponse('Tạo buổi đánh thành công', "OK").send(res);

    } catch (error) {
      console.log("ERROR", error);
      await session.abortTransaction();
      session.endSession();
      return new InternalErrorResponse().send(res);
    }

  } catch (err) {
    console.log("ERROR", err);
    return new InternalErrorResponse().send(res);
  }
};

export const getAllBadmintonSessions = async (req: Request, res: Response) => {
  try {
    const sessionList = await BadmintonSessionModel.find()
      .populate('updateById', 'name')
      .sort({ time: -1 })
      .limit(20);

    const result = sessionList.map(m => {
      const numberParticipant = m.participants.reduce(
        (sum, p) => sum + 1 + (p.subParticipants ? p.subParticipants.length : 0),
        0
      );
      return {
        id: m.id,
        courtType: m.courtType,
        time: m.time,
        startTime: m.startTime,
        endTime: m.endTime,
        location: m.location,
        courtFee: m.courtFee,
        shuttlecockFee: m.shuttlecockFee,
        numberParticipant: numberParticipant,
        participants: [],
        extraFee: m.extraFee ?? 0,
        note: m.note,
        status: m.status,
        updateTime: m.updateTime,
        updateById: m.updateById?._id?.toString() || "",
        updateByName: (m.updateById as any)?.name || "",
        numberShuttlecock: m.numberShuttlecock,
        passAmount: m.passAmount,
      } as BadmintonSessionResponse
    })
    return new SuccessResponse('Lấy thông tin buổi đánh thành công', result).send(res);
  } catch (err) {
    console.error('Lỗi khi lấy session:', err);
    return new InternalErrorResponse().send(res);
  }
};

export const getBadmintonSessions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await BadmintonSessionModel.findById(id)
      .populate({ path: 'participants.memberId', select: 'name balance' })
      .populate('updateById', 'name')
      .lean();

    if (!session) {
      return new InternalErrorResponse('Không tìm thấy buổi đánh cầu lông').send(res);
    }

    const participantList = session.participants.map((p) => {
      const member = p.memberId as any;
      return {
        memberId: member._id.toString(),
        name: member.name,
        balance: member.balance,
        isCourtFeeApplied: p.isCourtFeeApplied,
        isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
        isExtraFeeApplied: p.isExtraFeeApplied,
        courtFee: p.courtFee,
        shuttlecockFee: p.shuttlecockFee,
        extraFee: p.extraFee,
        modifiedFee: p.modifiedFee,
        participants: p.subParticipants?.map(sub => ({
          name: sub.name,
          isCourtFeeApplied: sub.isCourtFeeApplied,
          isShuttlecockFeeApplied: sub.isShuttlecockFeeApplied,
          isExtraFeeApplied: sub.isExtraFeeApplied,
          courtFee: sub.courtFee,
          shuttlecockFee: sub.shuttlecockFee,
          extraFee: sub.extraFee
        })) || []
      }
    })

    const numberParticipant = session.participants.reduce(
      (sum, p) => sum + 1 + (p.subParticipants ? p.subParticipants.length : 0),
      0
    );

    const result = {
      id: session.id,
      courtType: session.courtType,
      time: session.time,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      courtFee: session.courtFee,
      shuttlecockFee: session.shuttlecockFee,
      numberParticipant: numberParticipant,
      participants: participantList,
      extraFee: session.extraFee,
      note: session.note,
      status: session.status,
      updateTime: session.updateTime,
      updateById: session.updateById?._id?.toString() || "",
      updateByName: (session.updateById as any)?.name || "",
      numberShuttlecock: session.numberShuttlecock,
      passAmount: session.passAmount
    } as unknown as BadmintonSessionResponse;

    return new SuccessResponse('Lấy thông tin buổi đánh thành công', result).send(res);
  } catch (err) {
    console.error('Lỗi khi lấy session:', err);
    return new InternalErrorResponse().send(res);
  }
};

export const getAllMembersWithBalance = async (req: Request, res: Response) => {
  try {
    const members = await Member.find({ deletedAt: null });
    const memberIds = members.map((member: any) => new mongoose.Types.ObjectId(member._id));

    const result = await Payment.aggregate([
      {
        $match: {
          memberId: { $in: memberIds },
          status: { $in: ['accepted', 'pending'] }
        }
      },
      {
        $group: {
          _id: { memberId: '$memberId', status: '$status' },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          memberId: '$_id.memberId',
          status: '$_id.status',
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    const balanceMap = result.reduce((acc, item) => {
      const memberId = item.memberId.toString();
      if (!acc[memberId]) acc[memberId] = { pending: 0, accepted: 0 };
      if (item.status === 'pending') acc[memberId].pending = item.totalAmount;
      else if (item.status === 'accepted') acc[memberId].accepted = item.totalAmount;
      return acc;
    }, {} as Record<string, { pending: number; accepted: number }>);

    const data = members.map(member => ({
      memberId: member._id.toString(),
      name: member.name,
      balance: member.balance,
      statusAmounts: balanceMap[member._id.toString()] || { pending: 0, accepted: 0 }
    }));

    return new SuccessResponse('Lấy thông tin thành viên và số dư thanh toán thành công', data).send(res);
  } catch (err) {
    return new InternalErrorResponse('Lỗi server').send(res);
  }
};

export const updateBadmintonSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courtType, dateList, location, courtFee, shuttlecockFee, participants, extraFee, note, startTime, endTime, numberShuttlecock, groupId } = req.body as BadmintonSessionRequest;
    const user = (req as any).user;

    if (!id) {
      return new InternalErrorResponse("Thiếu ID buổi đánh").send(res);
    }

    const session = await BadmintonSessionModel.findById(id);
    if (!session) {
      return new InternalErrorResponse("Buổi đánh không tồn tại").send(res);
    }

    if (!courtType || !dateList || dateList.length < 0 || !location || !startTime || !endTime) {
      return new InternalErrorResponse("Thiếu thông tin bắt buộc: ngày giờ hoặc tên sân").send(res);
    }

    let updatedParticipants: Participant[] = [];

    if (participants.length > 0) {
      const validMembers = await Member.find({
        _id: { $in: participants.map(p => p.memberId) },
        deletedAt: null
      });

      if (validMembers.length !== participants.length) {
        return new InternalErrorResponse("Một hoặc nhiều thành viên không tồn tại trong hệ thống").send(res);
      }
      updatedParticipants = await mapParticipantsRequestToParticipant(participants, courtFee, shuttlecockFee, extraFee);
    }

    if (session.status !== 'init' && session.status !== 'edited') {
      return new BadRequestResponse("Trang thai khong hop le").send(res);
    }

    const team = await BadmintonTeam.findById(groupId);
    if (!team) {
      return new NotFoundResponse('Không tìm thấy đội cầu lông').send(res);
    }

    session.time = dateList[0];
    session.startTime = startTime;
    session.endTime = endTime;
    session.location = location;
    // if (courtType !== 'fixed') session.courtFee = courtFee;
    session.shuttlecockFee = shuttlecockFee;
    session.extraFee = extraFee;
    session.note = note;
    session.status = 'edited';
    session.participants = updatedParticipants;
    session.participantsCount = updatedParticipants.length;
    session.updateTime = new Date();
    session.numberShuttlecock = numberShuttlecock;
    session.updateById = user.id;
    await session.save();

    const updatedSession = await BadmintonSessionModel.findById(session._id)
      .populate('updateById', 'name')
      .lean();

    const errors: Partial<Record<'numberShuttlecock' | 'shuttlecockFee', string>> = {};
    if (team.numberShuttlecock < numberShuttlecock) {
      errors.numberShuttlecock = "Vượt quá số lượng cầu của nhóm";
    }
    if (team.amount < shuttlecockFee) {
      errors.shuttlecockFee = "Phí cầu vượt quá ngân sách nhóm";
    }

    const result = {
      session: {
        ...updatedSession,
        updateById: updatedSession?.updateById || null,
        updateByName: (updatedSession?.updateById as any)?.name || ""
      } as unknown as BadmintonSession,
      errors
    } as BadmintonSessionWaringResponse;

    return new SuccessResponse("Cập nhật buổi đánh thành công", result).send(res);
  } catch (err) {
    console.error("ERROR", err);
    return new InternalErrorResponse().send(res);
  }
};

export const confirmBadmintonSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courtType, dateList, location, courtFee, shuttlecockFee, participants, extraFee, note, startTime, endTime, numberShuttlecock, groupId } = req.body as BadmintonSessionRequest;
    const user = (req as any).user;

    if (!id) {
      return new InternalErrorResponse("Thiếu ID buổi đánh").send(res);
    }

    const session = await BadmintonSessionModel.findById(id);
    if (!session) {
      return new InternalErrorResponse("Buổi đánh không tồn tại").send(res);
    }

    if (!courtType || !dateList || dateList.length < 0 || !location || !startTime || !endTime) {
      return new InternalErrorResponse("Thiếu thông tin bắt buộc: ngày giờ hoặc tên sân").send(res);
    }

    const team = await BadmintonTeam.findById(groupId);
    if (!team) {
      return new NotFoundResponse('Không tìm thấy đội cầu lông').send(res);
    }

    let updatedParticipants: Participant[] = [];

    if (participants.length > 0) {
      const validMembers = await Member.find({
        _id: { $in: participants.map(p => p.memberId) },
        deletedAt: null
      });

      if (validMembers.length !== participants.length) {
        return new InternalErrorResponse("Một hoặc nhiều thành viên không tồn tại trong hệ thống").send(res);
      }
      updatedParticipants = await mapParticipantsRequestToParticipant(participants, courtFee, shuttlecockFee, extraFee);
    }

    if (session.status !== 'edited') {
      return new BadRequestResponse("Trang thai khong hop le").send(res);
    }

    const errors: Partial<Record<'numberShuttlecock' | 'shuttlecockFee', string>> = {};
    let isValidShuttlecock = true;

    if (team.numberShuttlecock < numberShuttlecock) {
      errors.numberShuttlecock = "Vượt quá số lượng cầu của nhóm";
      isValidShuttlecock = false;
    }
    if (team.amount < shuttlecockFee) {
      errors.shuttlecockFee = "Phí cầu vượt quá ngân sách nhóm";
      isValidShuttlecock = false;
    }

    if (!isValidShuttlecock) {
      const result = { session, errors } as BadmintonSessionWaringResponse;
      return new BadRequestResponse("Xác nhận buổi đánh không thành công").send(res);
    }

    session.time = dateList[0];
    session.startTime = startTime;
    session.endTime = endTime;
    session.location = location;
    // if (courtType !== 'fixed') session.courtFee = courtFee;
    session.shuttlecockFee = shuttlecockFee;
    session.extraFee = extraFee;
    session.note = note;
    session.status = 'confirmed';
    session.participants = updatedParticipants;
    session.participantsCount = updatedParticipants.length;
    session.updateTime = new Date();
    session.numberShuttlecock = numberShuttlecock;
    session.updateById = user.id;
    await session.save();

    const confirmedSession = await BadmintonSessionModel.findById(session._id)
      .populate('updateById', 'name')
      .lean();

    const result = {
      session: {
        ...confirmedSession,
        updateById: confirmedSession?.updateById || null,
        updateByName: (confirmedSession?.updateById as any)?.name || ""
      } as unknown as BadmintonSession,
      errors
    } as BadmintonSessionWaringResponse;

    return new SuccessResponse("Xác nhận buổi đánh thành công", result).send(res);
  } catch (err) {
    console.error("ERROR", err);
    return new InternalErrorResponse().send(res);
  }
};

export const payBadmintonSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    const session = await BadmintonSessionModel.findById(id).session(mongoSession);
    if (!session) {
      await mongoSession.abortTransaction();
      return res.status(404).json({ message: 'Không tìm thấy buổi đánh' });
    }

    if (session.status !== 'confirmed') {
      await mongoSession.abortTransaction();
      return res.status(400).json({ message: 'Chỉ buổi đánh ở trạng thái "confirmed" mới được thanh toán' });
    }

    const memberIds = session.participants.map(p => p.memberId);
    const members = await Member.find({ _id: { $in: memberIds }, deletedAt: null }).session(mongoSession);

    if (members.length !== session.participants.length) {
      await mongoSession.abortTransaction();
      return res.status(400).json({ message: 'Một hoặc nhiều thành viên không tồn tại' });
    }

    const group = await BadmintonTeam.findById(session.groupId).session(mongoSession);
    if (!group) {
      await mongoSession.abortTransaction();
      return res.status(400).json({ message: 'Group khong ton tai' });
    }

    // Trừ tiền từng thành viên (không đổi)
    for (const participant of session.participants) {
      const participantMemberId = participant.memberId.toString();
      const member = members.find(m => m._id.toString() === participantMemberId);
      if (!member) {
        await mongoSession.abortTransaction();
        return res.status(400).json({ message: `Không tìm thấy thành viên ${participantMemberId}` });
      }

      const participantTotalFee = participant.courtFee + participant.shuttlecockFee + participant.extraFee + participant.modifiedFee;
      const subParticipantsTotalFee = participant.subParticipants?.reduce((sum, sub) =>
        sum + sub.courtFee + sub.shuttlecockFee + sub.extraFee, 0) || 0;
      const totalFee = participantTotalFee + subParticipantsTotalFee;

      if (member.balance < totalFee) {
        await mongoSession.abortTransaction();
        return res.status(400).json({
          message: `Member ${member.name || member._id} has insufficient balance for payment`
        });
      }

      const balanceBefore = member.balance;
      member.balance -= totalFee;
      const balanceAfter = member.balance;
      await member.save({ session: mongoSession });

      const history = new TransactionHistory({
        memberId: member._id,
        sessionId: session._id,
        amount: totalFee,
        type: 'person',
        balanceBefore,
        balanceAfter,
        reason: `Thanh toán buổi đánh sân ${session.location} ngày ${formatDateVi(new Date(session.time))}`
      });
      await history.save({ session: mongoSession });
    }

    // Cập nhật số cầu lông của nhóm
    if (session.numberShuttlecock !== 0) {
      // Guard tránh chia cho 0
      if (group.numberShuttlecock > 0) {
        group.shuttlecockFee = group.shuttlecockFee - (session.numberShuttlecock * group.shuttlecockFee / group.numberShuttlecock);
      }
      group.numberShuttlecock = group.numberShuttlecock - session.numberShuttlecock;
    }

    // ─── THAY ĐỔI CHÍNH: casual và fixed đều chỉ trừ extraFee + modifiedFee ───
    // courtFee đã được trừ lúc create cho cả 2 loại
    const sumModifiedFee = session.participants.reduce((sum, p) => sum + (p.modifiedFee ?? 0), 0);
    const groupDeductFee = session.extraFee + sumModifiedFee;
    group.amount = group.amount - groupDeductFee;

    const label = session.courtType === 'fixed' ? '[CỐ ĐỊNH]' : '[VÃNG LAI]';
    await paymentService.recordTransactionHistoryForGroup(
      undefined,
      group,
      groupDeductFee * -1,
      session,
      mongoSession,
      `${label}Thanh toán buổi đánh cầu lông sân ${session.location} ngày ${formatDateVi(session.time)} (-${session.numberShuttlecock} cầu/ còn ${group.numberShuttlecock})`
    );

    // Cập nhật trạng thái session
    session.status = 'done';
    session.updateTime = new Date();
    await session.save({ session: mongoSession });

    await group.save({ session: mongoSession });
    await mongoSession.commitTransaction();

    const paidSession = await BadmintonSessionModel.findById(session._id)
      .populate('updateById', 'name')
      .lean();

    return new SuccessResponse('Thanh toán thành công', {
      ...paidSession,
      updateById: paidSession?.updateById?._id?.toString() || "",
      updateByName: (paidSession?.updateById as any)?.name || ""
    }).send(res);

  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    await mongoSession.abortTransaction();
    return new InternalErrorResponse().send(res);
  } finally {
    mongoSession.endSession();
  }
};

export const getTransactionHistoryByMember = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return new InternalErrorResponse().send(res);
    }
    const memberId = user.id.toString();

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: any = { memberId, type: 'person' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const totalCount = await TransactionHistory.countDocuments(filter);
    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      transactions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getTransactionHistoryByGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter: any = { groupId, type: 'group' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const totalCount = await TransactionHistory.countDocuments(filter);
    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      transactions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export async function mapParticipantsRequestToParticipant(
  participantsRequest: ParticipantRequest[],
  courtFee: number,
  shuttlecockFee: number,
  extraFee: number
): Promise<Participant[]> {
  const memberIds = participantsRequest.map(p => p.memberId);
  const members = await Member.find({ _id: { $in: memberIds }, deletedAt: null });

  const memberMap = new Map<string, MemberDocument>();
  members.forEach(m => memberMap.set(m._id.toString(), m));

  const courtFeeApplied = participantsRequest.reduce((count, p) =>
    count + (p.isCourtFeeApplied ? 1 : 0) + (p.participants?.filter(sub => sub.isCourtFeeApplied).length || 0), 0);

  const shuttlecockFeeApplied = participantsRequest.reduce((count, p) =>
    count + (p.isShuttlecockFeeApplied ? 1 : 0) + (p.participants?.filter(sub => sub.isShuttlecockFeeApplied).length || 0), 0);

  const extraFeeApplied = participantsRequest.reduce((count, p) =>
    count + (p.isExtraFeeApplied ? 1 : 0) + (p.participants?.filter(sub => sub.isExtraFeeApplied).length || 0), 0);

  const courtFeeList = splitFeeEvenlyInt(courtFee, courtFeeApplied);
  const shuttlecockFeeList = splitFeeEvenlyInt(shuttlecockFee, shuttlecockFeeApplied);
  const extraFeeList = splitFeeEvenlyInt(extraFee, extraFeeApplied);

  let courtIndex = 0;
  let shuttleIndex = 0;
  let extraIndex = 0;

  return participantsRequest.map((p) => {
    const memberDoc = memberMap.get(p.memberId);
    if (!memberDoc) throw new Error(`Member with ID ${p.memberId} not found`);

    const courtShare = p.isCourtFeeApplied ? courtFeeList[courtIndex++] : 0;
    const shuttleShare = p.isShuttlecockFeeApplied ? shuttlecockFeeList[shuttleIndex++] : 0;
    const extraShare = p.isExtraFeeApplied ? extraFeeList[extraIndex++] : 0;

    return {
      memberId: memberDoc,
      isCourtFeeApplied: p.isCourtFeeApplied,
      isShuttlecockFeeApplied: p.isShuttlecockFeeApplied,
      isExtraFeeApplied: p.isExtraFeeApplied,
      courtFee: courtShare,
      shuttlecockFee: shuttleShare,
      extraFee: extraShare,
      modifiedFee: p.modifiedFee ?? 0,
      subParticipants: p.participants?.map(sub => ({
        name: sub.name,
        isCourtFeeApplied: sub.isCourtFeeApplied,
        isShuttlecockFeeApplied: sub.isShuttlecockFeeApplied,
        isExtraFeeApplied: sub.isExtraFeeApplied,
        courtFee: sub.isCourtFeeApplied ? courtFeeList[courtIndex++] : 0,
        shuttlecockFee: sub.isShuttlecockFeeApplied ? shuttlecockFeeList[shuttleIndex++] : 0,
        extraFee: sub.isExtraFeeApplied ? extraFeeList[extraIndex++] : 0
      })) || []
    };
  });
}

export const passBadmintonSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { courtFee } = req.body as PassBadmintonSessionRequest;
  const user = (req as any).user;

  console.log("PASS BADMINTON SESSION", { id, courtFee, user });
  if (!id) {
    return new BadRequestResponse("Thiếu ID buổi đánh").send(res);
  }
  if (typeof courtFee !== 'number' || isNaN(courtFee) || courtFee < 0) {
    return new BadRequestResponse("Phí sân không hợp lệ").send(res);
  }

  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    const session = await BadmintonSessionModel.findById(id).session(mongoSession);
    if (!session) {
      return new BadRequestResponse("Buổi đánh không tồn tại").send(res);
    }
    if (session.status !== 'init' && session.status !== 'edited') {
      return new BadRequestResponse("Trang thai khong hop le").send(res);
    }

    const group = await BadmintonTeam.findById(session.groupId).session(mongoSession);
    if (!group) {
      return new NotFoundResponse("Không tìm thấy đội cầu lông").send(res);
    }

    session.status = 'done';
    session.updateTime = new Date();
    session.updateById = user.id;
    session.passAmount = courtFee;
    await session.save({ session: mongoSession });

    await PaymentService.updateTeamBalance(group, courtFee, mongoSession);

    await paymentService.recordTransactionHistoryForGroup(
      undefined,
      group,
      courtFee,
      session,
      mongoSession,
      `[PASS] buổi đánh cầu lông sân ${session.location} ngày ${formatDateVi(session.time)})`
    );

    await mongoSession.commitTransaction();



    const confirmedSession = await BadmintonSessionModel.findById(session._id)
      .populate('updateById', 'name')
      .lean();

    return new SuccessResponse('Pass thành công', {
      ...confirmedSession,
      updateById: confirmedSession?.updateById?._id?.toString() || "",
      updateByName: (confirmedSession?.updateById as any)?.name || ""
    }).send(res);

  } catch (err: any) {
    if (mongoSession.inTransaction()) {
      await mongoSession.abortTransaction();
    }
    await mongoSession.abortTransaction();
    console.error('TRANSACTION ERROR:', err);
    if (err?.status === 400) return new BadRequestResponse(err.message).send(res);
    if (err?.status === 404) return new NotFoundResponse(err.message).send(res);
    return new InternalErrorResponse().send(res);
  } finally {
    mongoSession.endSession();
  }
};