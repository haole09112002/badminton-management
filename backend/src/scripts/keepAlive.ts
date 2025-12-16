import axios from 'axios';

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:8080';
const PING_INTERVAL = parseInt(process.env.KEEP_ALIVE_INTERVAL || '840000');

const keepAlive = (): void => {
  console.log('🕐 Keep-alive started');
  console.log(`⏰ Interval: ${PING_INTERVAL}ms (${PING_INTERVAL / 1000}s)`);
  console.log(`🎯 Target URL: ${RENDER_URL}/health`);

  pingServer();

  setInterval(async () => {
    await pingServer();
  }, PING_INTERVAL);
};

const pingServer = async (): Promise<void> => {
  try {
    const response = await axios.get(`${RENDER_URL}/health`, {
      timeout: 10000
    });
    console.log(`✅ Keep-alive ping: ${new Date().toISOString()} - Status: ${response.status}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Keep-alive failed: ${error.message}`);
    } else {
      console.error(`❌ Keep-alive failed:`, error);
    }
  }
};

export default keepAlive;
