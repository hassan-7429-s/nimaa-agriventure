const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const folder = path.join(__dirname, 'public');
const images = [
  'nimaa picture1.jpeg',
  'Abby project 26.jpeg',
  'Abby project 29.jpeg',
  'Abby project 25.jpeg'
];

for (const image of images) {
  if (!fs.existsSync(path.join(folder, image))) {
    throw new Error(`Missing image file: ${image}`);
  }
}

const listPath = path.join(folder, 'imglist.txt');
const duration = 3.75;
const lines = [];
for (const image of images) {
  const imagePath = path.join(folder, image).replace(/\\/g, '/').replace(/'/g, "'\\''");
  lines.push(`file '${imagePath}'`);
  lines.push(`duration ${duration}`);
}

// ffmpeg concat demuxer requires the last file to be repeated.
const lastImagePath = path.join(folder, images[images.length - 1]).replace(/\\/g, '/').replace(/'/g, "'\\''");
lines.push(`file '${lastImagePath}'`);
fs.writeFileSync(listPath, lines.join('\n'));

const output = path.join(folder, 'hero-video.mp4');

console.log('Generating video from images:', images.length, 'files');
console.log('Output:', output);

execFileSync(ffmpeg, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', listPath,
  '-r', '30',
  '-vf', 'scale=if(gt(iw/ih\\,1.7777777777777777)\\,1920\\,-2):if(gt(iw/ih\\,1.7777777777777777)\\,-2\\,1080),pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',  '-c:v', 'libx264',
  '-crf', '18',
  '-preset', 'slow',
  '-b:v', '6500k',  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  output
], { stdio: 'inherit' });

fs.unlinkSync(listPath);
console.log('Video created successfully:', output);
