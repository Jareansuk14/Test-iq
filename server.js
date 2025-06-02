require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const path = require('path');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// ✅ เสิร์ฟ static files เช่น liff.html
app.use(express.static(path.join(__dirname, 'public')));

// อย่าใส่ express.json() ก่อน middleware ของ LINE
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('❌ Webhook Error:', err);
      res.status(500).end();
    });
});

// json parser สำหรับ route อื่นๆ
app.use(express.json());

// จัดการข้อความจากผู้ใช้
async function handleEvent(event) {
  try {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.toLowerCase();

      if (text === 'แชร์') {
        const flex = require('./flex/shareCard.json');
        return client.replyMessage(event.replyToken, flex);
      }
    }
    return Promise.resolve(null);
  } catch (err) {
    console.error('❌ handleEvent error:', err);
    return Promise.reject(err);
  }
}

// ✅ เริ่มเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
