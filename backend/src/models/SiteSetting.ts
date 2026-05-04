import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSetting extends Document {
    monthlyFee: number;
    remindStartDay: number;
    remindEndDay: number;
}

const SiteSettingSchema: Schema = new Schema({
    monthlyFee: { type: Number, required: true },
    remindStartDay: { type: Number, required: true },
    remindEndDay: { type: Number, required: true },
});

export default mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);
