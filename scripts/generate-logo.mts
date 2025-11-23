import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

// Create a modern logo for Buddy Connect
function generateLogo() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1'); // Indigo
  gradient.addColorStop(1, '#8b5cf6'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw rounded square background
  ctx.fillStyle = gradient;
  const radius = 80;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.fill();

  // Draw two connected circles representing "Buddy" connection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  
  // Left circle
  ctx.beginPath();
  ctx.arc(140, 220, 50, 0, Math.PI * 2);
  ctx.fill();

  // Right circle
  ctx.beginPath();
  ctx.arc(372, 220, 50, 0, Math.PI * 2);
  ctx.fill();

  // Connection line between circles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(190, 220);
  ctx.lineTo(322, 220);
  ctx.stroke();

  // Small dot in connection line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(256, 220, 8, 0, Math.PI * 2);
  ctx.fill();

  // Add sparkle dots to represent network/connection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const sparkles = [
    { x: 100, y: 100, size: 4 },
    { x: 412, y: 100, size: 4 },
    { x: 80, y: 320, size: 5 },
    { x: 432, y: 320, size: 5 },
  ];
  sparkles.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(process.cwd(), 'public', 'buddy-logo.png');
  fs.writeFileSync(outputPath, buffer);
  console.log('✓ Logo generated at', outputPath);
}

// Generate the logo
generateLogo();
