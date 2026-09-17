import { chromium } from '@playwright/test';
import sharp from 'sharp';

// Use the real interview, not an enlarged low-resolution doctor thumbnail.
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4175/');
  const data = await page.evaluate(async (frameTime) => {
    const video = document.createElement('video');
    video.src = '/assets/daria-tishina-web.mp4';
    video.muted = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    video.currentTime = frameTime;
    await new Promise(resolve => { video.onseeked = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }, Number(process.env.FRAME_TIME || 41.65));
  await sharp(Buffer.from(data, 'base64')).webp({ quality: 92 }).toFile('public/assets/daria-video-cover.webp');
} finally {
  await browser.close();
}
