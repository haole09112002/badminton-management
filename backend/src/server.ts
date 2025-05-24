import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('✅ Đã kết nối MongoDB');
    app.listen(process.env.PORT || 8080, () => {
      console.log(`🚀 Server chạy tại http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB lỗi:', err));
