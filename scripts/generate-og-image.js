import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create canvas
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#E8F4FD');
gradient.addColorStop(0.5, '#FFFFFF');
gradient.addColorStop(1, '#FEF3E2');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Floating shapes
ctx.save();
ctx.globalAlpha = 0.6;
ctx.fillStyle = '#E0E7FF';
ctx.beginPath();
ctx.arc(200, 150, 60, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

ctx.save();
ctx.globalAlpha = 0.4;
ctx.fillStyle = '#FDE68A';
ctx.beginPath();
ctx.arc(1000, 200, 80, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

ctx.save();
ctx.globalAlpha = 0.5;
ctx.fillStyle = '#FECACA';
ctx.beginPath();
ctx.arc(150, 450, 40, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

ctx.save();
ctx.globalAlpha = 0.6;
ctx.fillStyle = '#D1FAE5';
ctx.beginPath();
ctx.arc(1050, 480, 50, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

// Logo/Icon background
ctx.save();
ctx.globalAlpha = 0.9;
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(600, 250, 50, 0, 2 * Math.PI);
ctx.fill();
ctx.restore();

// Logo dots
ctx.fillStyle = '#3B82F6';
ctx.beginPath();
ctx.arc(600, 230, 8, 0, 2 * Math.PI);
ctx.fill();

ctx.fillStyle = '#FBBF24';
ctx.beginPath();
ctx.arc(600, 270, 6, 0, 2 * Math.PI);
ctx.fill();

ctx.fillStyle = '#EC4899';
ctx.beginPath();
ctx.arc(580, 250, 6, 0, 2 * Math.PI);
ctx.fill();

ctx.fillStyle = '#10B981';
ctx.beginPath();
ctx.arc(620, 250, 6, 0, 2 * Math.PI);
ctx.fill();

// Title
ctx.fillStyle = '#1F2937';
ctx.font = 'bold 64px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Emotional Shower', 600, 360);

// Korean subtitle
ctx.fillStyle = '#6B7280';
ctx.font = '32px Arial, sans-serif';
ctx.fillText('정서샤워 - 매일 하는 마음 샤워', 600, 410);

// Description
ctx.fillStyle = '#9CA3AF';
ctx.font = '24px Arial, sans-serif';
ctx.fillText('하루 3번, 간단한 감정 체크인으로 마음 건강을 챙기세요', 600, 470);

// Bottom accent
const bottomGradient = ctx.createLinearGradient(0, 580, width, 630);
bottomGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
bottomGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
bottomGradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');

ctx.fillStyle = bottomGradient;
ctx.fillRect(0, 580, width, 50);

// Save the image
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(__dirname, '../public/og-image.png');

fs.writeFileSync(outputPath, buffer);
console.log(`✅ OG image saved to: ${outputPath}`);