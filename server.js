require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('public'));

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: 'YOUR_CHANNEL_SECRET',
};

const client = new line.Client(config);

// webhook
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(() => res.end());
});

async function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.toLowerCase();
    if (text === 'แชร์') {
      const flex = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'flex/shareCard.json'), 'utf8')
      );
      return client.replyMessage(event.replyToken, flex);
    }
  }
}

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
