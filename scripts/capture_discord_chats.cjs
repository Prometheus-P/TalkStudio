#!/usr/bin/env node
/**
 * 디스코드 스타일 대화 이미지 캡처 스크립트
 * Playwright를 사용하여 생성된 대화를 이미지로 캡처합니다.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 생성된 대화 데이터 로드
const chatsPath = path.join(__dirname, 'generated_chats.json');
const chats = JSON.parse(fs.readFileSync(chatsPath, 'utf-8'));

// 출력 디렉토리 생성
const outputDir = path.join(__dirname, 'captures');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 디스코드 스타일 HTML 생성
 */
function generateDiscordHTML(chatData) {
  const { profiles, messages, metadata, statusBar } = chatData;

  const messagesHTML = messages.map((msg, index) => {
    const profile = msg.sender === 'me' ? profiles.me : profiles.other;
    const isFirstInGroup = index === 0 || messages[index - 1].sender !== msg.sender;

    if (isFirstInGroup) {
      return `
        <div class="message-group">
          <img src="${profile.avatar}" class="avatar" />
          <div class="message-content">
            <div class="message-header">
              <span class="username">${profile.name}</span>
              <span class="timestamp">${msg.time}</span>
            </div>
            <div class="message-text">${msg.text}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="message-continuation">
          <div class="message-text">${msg.text}</div>
        </div>
      `;
    }
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #36393f;
      color: #dcddde;
      padding: 0;
    }
    .discord-container {
      width: 400px;
      background: #36393f;
      border-radius: 8px;
      overflow: hidden;
    }
    .channel-header {
      background: #2f3136;
      padding: 12px 16px;
      border-bottom: 1px solid #202225;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .channel-icon {
      color: #72767d;
      font-size: 20px;
    }
    .channel-name {
      color: #fff;
      font-weight: 600;
      font-size: 16px;
    }
    .date-divider {
      text-align: center;
      padding: 8px 16px;
      position: relative;
    }
    .date-divider::before {
      content: '';
      position: absolute;
      left: 16px;
      right: 16px;
      top: 50%;
      height: 1px;
      background: #4f545c;
    }
    .date-divider span {
      background: #36393f;
      padding: 0 8px;
      position: relative;
      color: #72767d;
      font-size: 12px;
      font-weight: 600;
    }
    .messages-container {
      padding: 16px 0;
    }
    .message-group {
      display: flex;
      padding: 4px 16px;
      margin-top: 16px;
    }
    .message-group:first-child {
      margin-top: 0;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .message-content {
      flex: 1;
      min-width: 0;
    }
    .message-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 4px;
    }
    .username {
      color: #fff;
      font-weight: 600;
      font-size: 16px;
    }
    .timestamp {
      color: #72767d;
      font-size: 12px;
    }
    .message-text {
      color: #dcddde;
      font-size: 15px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .message-continuation {
      padding: 2px 16px 2px 72px;
    }
    .watermark {
      text-align: center;
      padding: 8px;
      color: #4f545c;
      font-size: 10px;
      background: #2f3136;
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="discord-container">
    <div class="channel-header">
      <span class="channel-icon">#</span>
      <span class="channel-name">메이플-거래</span>
    </div>
    <div class="date-divider">
      <span>${metadata.trade_date_korean}</span>
    </div>
    <div class="messages-container">
      ${messagesHTML}
    </div>
    <div class="watermark">
      TalkStudio - Discord Style
    </div>
  </div>
</body>
</html>
  `;
}

async function captureChats() {
  console.log('='.repeat(50));
  console.log('디스코드 대화 이미지 캡처 시작');
  console.log('='.repeat(50));

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 500, height: 800 },
    deviceScaleFactor: 2, // 고해상도
  });

  for (let i = 0; i < chats.length; i++) {
    const chat = chats[i];
    const { metadata } = chat;

    console.log(`\n[${i + 1}/${chats.length}] 캡처 중...`);
    console.log(`  아이템: ${metadata.item.name}`);
    console.log(`  금액: ${metadata.amount_display}`);
    console.log(`  날짜: ${metadata.trade_date_korean}`);

    const page = await context.newPage();

    // HTML 생성 및 로드
    const html = generateDiscordHTML(chat);
    await page.setContent(html, { waitUntil: 'networkidle' });

    // 폰트 로딩 대기
    await page.waitForTimeout(1000);

    // 컨테이너만 캡처
    const container = await page.$('.discord-container');
    const filename = `maple_trade_${i + 1}_${metadata.amount / 10000}만원_${metadata.trade_date.replace(/-/g, '')}.png`;
    const filepath = path.join(outputDir, filename);

    await container.screenshot({ path: filepath });
    console.log(`  -> 저장됨: ${filename}`);

    await page.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`완료! ${chats.length}개 이미지 캡처됨`);
  console.log(`저장 위치: ${outputDir}`);
  console.log('='.repeat(50));

  // 파일 목록 출력
  const files = fs.readdirSync(outputDir);
  console.log('\n캡처된 파일:');
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
}

captureChats().catch(console.error);
