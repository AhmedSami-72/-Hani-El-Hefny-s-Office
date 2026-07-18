const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'assets', 'images', 'home');

// Convert hero-slide-3.png to WebP
sharp(path.join(imagesDir, 'hero-slide-3.png'))
  .webp({ quality: 80 })
  .toFile(path.join(imagesDir, 'hero-slide-3.webp'))
  .then(() => console.log('hero-slide-3.png converted to WebP successfully!'))
  .catch(err => console.error('Error converting hero-slide-3.png:', err));

// Convert hero-slide-4.png to WebP
sharp(path.join(imagesDir, 'hero-slide-4.png'))
  .webp({ quality: 80 })
  .toFile(path.join(imagesDir, 'hero-slide-4.webp'))
  .then(() => console.log('hero-slide-4.png converted to WebP successfully!'))
  .catch(err => console.error('Error converting hero-slide-4.png:', err));
