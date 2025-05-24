import { Request, Response } from 'express';
import { SuccessResponse, InternalErrorResponse, BadRequestResponse } from '../common/responseType';
import { Member } from '../models/Member';
import { AuthenticatedRequest } from '../types/express';

// Lấy danh sách thành viên
export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await Member.find({});
    const result = members.map(m => {
      return {
        id: m._id,
        name: m.name,
        balance: m.balance,
        email: m.email
      }
    });
    return new SuccessResponse('ok', result).send(res);
  } catch (error) {
    return new InternalErrorResponse().send(res);
  }
};
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return new BadRequestResponse('Không tìm thấy user').send(res);
    }
    const existing = await Member.findById(req.user.id);
    if (!existing) {
      return new BadRequestResponse('Không tìm thấy user').send(res);
    }

    return new SuccessResponse('ok', {
      id: existing._id,
      name: existing.name,
      balance: existing.balance,
      email: existing.email,
      role: existing.role
    }).send(res);
  } catch (error) {
    return new InternalErrorResponse().send(res);
  }
}
// Thêm thành viên
export const addMember = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const password = "123456"
    const count = await Member.countDocuments({ email });
    if (count > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    const newMember = await Member.create({
      name,
      email,
      password,
      role, // optional: chỉ lead/admin mới được set role
    });
    res.status(201).json(newMember);
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    console.log(error)
    res.status(400).send('Lỗi thêm thành viên');
  }
};
