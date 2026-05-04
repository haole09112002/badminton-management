import { Request, Response } from 'express';
import SiteSetting from '../models/SiteSetting';
import asyncHandler from '../common/asyncHandler';

export const createSiteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { monthlyFee, remindStartDay, remindEndDay } = req.body;
    const setting = await SiteSetting.create({ monthlyFee, remindStartDay, remindEndDay });
    res.status(201).json(setting);
});

export const getSiteSetting = asyncHandler(async (req: Request, res: Response) => {
    const setting = await SiteSetting.findOne();
    if (!setting) return res.status(404).json({ message: 'Not found' });
    res.json(setting);
});

export const updateSiteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { monthlyFee, remindStartDay, remindEndDay } = req.body;
    const setting = await SiteSetting.findOneAndUpdate(
        {},
        { monthlyFee, remindStartDay, remindEndDay },
        { new: true }
    );
    if (!setting) return res.status(404).json({ message: 'Not found' });
    res.json(setting);
});

export const deleteSiteSetting = asyncHandler(async (req: Request, res: Response) => {
    await SiteSetting.deleteMany({});
    res.status(204).send();
});
