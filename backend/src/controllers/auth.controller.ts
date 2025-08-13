import { Request, Response } from 'express';
import { SuccessResponse, InternalErrorResponse } from '../common/responseType';
import { JWT_REFRESH_SECRET } from '../config/jwt';
import { Member } from '../models/Member';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existing = await Member.findOne({ email, deletedAt: null });
        if (existing) {
            return res.status(400).json({ message: 'Email đã được đăng ký' });
        }

        const newMember = new Member({ name, email, password }); // nên hash password nếu dùng thật
        await newMember.save();

        return new SuccessResponse('Đăng ký thành công', newMember.toJSON()).send(res);
    } catch (err) {
        console.error(err);
        return new InternalErrorResponse().send(res);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body)
    const user = await Member.findOne({ email, deletedAt: null });
    if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const payload = { id: user._id, name: user.name, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Gửi refresh token qua cookie (HTTP-only)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    return res.json({ accessToken, refreshToken });
};


export const refreshTokenHandler = async (req: Request, res: Response): Promise<Response> => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Không có refresh token' });
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
        const newAccessToken = generateAccessToken({ id: decoded.id, name: decoded.name, role: decoded.role });
        return res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Refresh token không hợp lệ' });
    }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
    res.clearCookie('refreshToken');
    return res.json({ message: 'Đăng xuất thành công' });
};