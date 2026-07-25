import { Request, Response } from 'express';
import { BadmintonTeam } from '../models/BadmintonTeam';
import { SuccessResponse, BadRequestResponse, InternalErrorResponse, NotFoundResponse } from '../common/responseType';
import mongoose, { ClientSession } from 'mongoose';
import { BadRequestError } from '../common/apiError';
import { ShuttlecockFeeRequest } from '../models/requests';
import PaymentService from '../services/paymentService';
import { BadmintonSessionModel } from '../models/badmintonSession';
import { Member } from '../models/Member';

export const createBadmintonTeam = async (req: Request, res: Response) => {
    try {
        const {
            name,
            amount,
            numberShuttlecock,
            shuttlecockFee,
            courtFee,
            note,
            updateById,
            members, // [{ memberId, isFixed, isActive }]
        } = req.body;

        // Validate required fields
        if (!name || !updateById || !Array.isArray(members)) {
            throw new BadRequestError('Missing required fields');
        }

        const team = new BadmintonTeam({
            name,
            amount,
            numberShuttlecock,
            shuttlecockFee,
            courtFee,
            note,
            updateById,
            members,
            updateTime: new Date()
        });

        await team.save();
        return new SuccessResponse('Tạo nhóm cầu lông thành công', team).send(res);
    } catch (err) {
        console.error('Error creating badminton team:', err);
        return new InternalErrorResponse().send(res);
    }
}


export const updateBadmintonTeamFees = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { numberShuttlecock, shuttlecockFee, fixedCourtFee, updateById } = req.body;

        const existing = await BadmintonTeam.findById(id);
        if (!existing) {
            return new BadRequestResponse('Không tìm thấy team').send(res);
        }

        existing.numberShuttlecock += numberShuttlecock || 0;
        existing.shuttlecockFee += shuttlecockFee || 0;
        // existing.fixedCourtFee += fixedCourtFee || 0;
        existing.updateById = updateById;
        existing.updateTime = new Date();

        await existing.save();

        return new SuccessResponse('Cập nhật thành công', existing).send(res);
    } catch (err) {
        console.error('Lỗi khi cập nhật team:', err);
        return new InternalErrorResponse().send(res);
    }
};

export const getBadmintonTeamById = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new BadRequestResponse('ID không hợp lệ').send(res);
    }

    try {
        const team = await BadmintonTeam.findById(id)
            .populate('updateById');

        if (!team) {
            return new NotFoundResponse('Không tìm thấy đội cầu lông').send(res);
        }

        return new SuccessResponse('Lấy thông tin đội thành công', team).send(res);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết BadmintonTeam:', error);
        return new InternalErrorResponse().send(res);
    }
};


export const payForShuttlecockFee = async (req: Request, res: Response) => {
    const { groupId, shuttlecockFee, numberShuttlecock } = req.body as ShuttlecockFeeRequest;

    // validation
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return new BadRequestResponse('ID không hợp lệ').send(res);
    }

    try {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();
        const team = await PaymentService.findTeamByGroupId(groupId, session)
        if (!team) {
            return new BadRequestResponse('groupId không hợp lệ').send(res);
        }
        if (shuttlecockFee > team.amount) {
            return new BadRequestResponse('Nhóm không đủ tiền mua cầu, vui lòng nạp tiền').send(res);
        }
        let message = `Thanh toán ${shuttlecockFee} cho ${numberShuttlecock.toString()} quả cầu`;
        team.numberShuttlecock = Number(team.numberShuttlecock) + Number(numberShuttlecock)
        team.shuttlecockFee = Number(team.shuttlecockFee) + Number(shuttlecockFee)
        await PaymentService.updateTeamBalance(team, shuttlecockFee * -1, session);
        await PaymentService.recordTransactionHistoryForGroup(undefined, team, shuttlecockFee * -1, undefined, session, message);
        await session.commitTransaction();
        return new SuccessResponse('Thanh toán tiền cầu thành công', team).send(res);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết BadmintonTeam:', error);
        return new InternalErrorResponse().send(res);
    }
};


export const getSessionFeesByMember = async (req: Request, res: Response) => {
    try {
        const { groupId, memberId, status } = req.query;

        if (!groupId || !memberId) {
            return new BadRequestResponse("Thiếu groupId hoặc memberId").send(res);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const filter: any = {
            groupId: new mongoose.Types.ObjectId(groupId as string),
            status: status ?? 'done',
            'participants.memberId': new mongoose.Types.ObjectId(memberId as string)
        };

        if (startDate || endDate) {
            filter.time = {};
            if (startDate) filter.time.$gte = startDate;
            if (endDate) filter.time.$lte = endDate;
        }

        const totalCount = await BadmintonSessionModel.countDocuments(filter);

        const sessions = await BadmintonSessionModel.find(filter)
            .sort({ time: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const result = sessions.map(session => {
            const participant = session.participants.find(
                p => p.memberId.toString() === memberId
            );

            if (!participant) return null;

            const subTotal = participant.subParticipants?.reduce((sum, sub) =>
                sum + sub.courtFee + sub.shuttlecockFee + sub.extraFee, 0) || 0;

            const memberTotal = participant.courtFee + participant.shuttlecockFee
                + participant.extraFee + participant.modifiedFee;

            return {
                sessionId: session._id,
                date: session.time,
                location: session.location,
                memberTotal,
                guests: participant.subParticipants?.map(sub => ({
                    name: sub.name,
                    total: sub.courtFee + sub.shuttlecockFee + sub.extraFee
                })) || [],
                total: memberTotal + subTotal
            };
        }).filter(Boolean);

        const grandTotal = result.reduce((sum, s) => sum + (s?.total ?? 0), 0);

        return new SuccessResponse('Lấy lịch sử phí theo trận thành công', {
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            grandTotal,
            sessions: result,
        }).send(res);

    } catch (err) {
        console.error('ERROR', err);
        return new InternalErrorResponse().send(res);
    }
};

export const getGroupMembersFee = async (req: Request, res: Response) => {
    try {
        const { groupId, status } = req.query;

        if (!groupId) {
            return new BadRequestResponse("Thiếu groupId").send(res);
        }

        // Lấy tất cả session theo groupId và status
        const filter: any = {
            groupId: new mongoose.Types.ObjectId(groupId as string),
            status: status ?? 'done',
        };

        const sessions = await BadmintonSessionModel.find(filter).lean();

        // Map tiền theo từng memberId
        const memberFeeMap = new Map<string, {
            memberId: string;
            totalCourtFee: number;
            totalShuttlecockFee: number;
            totalExtraFee: number;
            totalModifiedFee: number;
            totalGuestFee: number;
            grandTotal: number;
            sessionCount: number;
        }>();

        for (const session of sessions) {
            for (const participant of session.participants) {
                const memberId = participant.memberId.toString();

                if (!memberFeeMap.has(memberId)) {
                    memberFeeMap.set(memberId, {
                        memberId,
                        totalCourtFee: 0,
                        totalShuttlecockFee: 0,
                        totalExtraFee: 0,
                        totalModifiedFee: 0,
                        totalGuestFee: 0,
                        grandTotal: 0,
                        sessionCount: 0,
                    });
                }

                const entry = memberFeeMap.get(memberId)!;
                const guestFee = participant.subParticipants?.reduce((sum, sub) =>
                    sum + sub.courtFee + sub.shuttlecockFee + sub.extraFee, 0) || 0;

                entry.totalCourtFee += participant.courtFee;
                entry.totalShuttlecockFee += participant.shuttlecockFee;
                entry.totalExtraFee += participant.extraFee;
                entry.totalModifiedFee += participant.modifiedFee ?? 0;
                entry.totalGuestFee += guestFee;
                entry.grandTotal += participant.courtFee + participant.shuttlecockFee
                    + participant.extraFee + (participant.modifiedFee ?? 0) + guestFee;
                entry.sessionCount += 1;
            }
        }

        // Lấy thông tin tên member
        const memberIds = Array.from(memberFeeMap.keys()).map(
            id => new mongoose.Types.ObjectId(id)
        );
        const members = await Member.find({
            _id: { $in: memberIds },
            deletedAt: null
        }).lean();

        const memberNameMap = new Map(members.map(m => [m._id.toString(), m.name]));

        const result = Array.from(memberFeeMap.values()).map(entry => ({
            ...entry,
            name: memberNameMap.get(entry.memberId) ?? 'Không rõ',
        }));

        // Tổng toàn group
        const groupTotal = result.reduce((sum, m) => sum + m.grandTotal, 0);

        return new SuccessResponse('Lấy tổng phí thành viên thành công', {
            groupTotal,
            memberCount: result.length,
            members: result,
        }).send(res);

    } catch (err) {
        console.error('ERROR', err);
        return new InternalErrorResponse().send(res);
    }
};