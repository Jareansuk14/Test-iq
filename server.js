require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const path = require('path');

const app = express();

// ตั้งค่า config จากตัวแปรแวดล้อม (Render Dashboard ต้องตั้งด้วย)
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// LINE SDK client
const client = new line.Client(config);

// อย่าใส่ express.json() ก่อน middleware ของ LINE
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('❌ Webhook Error:', err);
      res.status(500).end();
    });
});

// ใช้ express.json() ได้ที่ route อื่นๆ ถ้ามี
app.use(express.json());

// ตัวจัดการ event
async function handleEvent(event) {
  try {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.toLowerCase();

      if (text === 'แชร์') {
        const flex = require('./flex/shareCard.json'); // โหลด Flex Message
        return client.replyMessage(event.replyToken, flex);
      }
    }
    return Promise.resolve(null);
  } catch (err) {
    console.error('❌ handleEvent error:', err);
    return Promise.reject(err);
  }
}

// เริ่มรันเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
