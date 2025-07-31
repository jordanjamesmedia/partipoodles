#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🐩 Parti Poodles Backend Setup Wizard\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('This wizard will help you set up your backend configuration.\n');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env file from template...\n');
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  console.log('STEP 1: Database Setup (Neon)');
  console.log('--------------------------------');
  console.log('1. Go to https://neon.tech and create a free account');
  console.log('2. Create a new project');
  console.log('3. Copy your connection string (looks like: postgresql://user:pass@host/database?sslmode=require)\n');
  
  const hasNeon = await question('Do you have your Neon connection string? (y/n): ');
  
  if (hasNeon.toLowerCase() === 'y') {
    const dbUrl = await question('Paste your Neon connection string: ');
    updateEnvFile('DATABASE_URL', dbUrl);
    console.log('✓ Database URL saved\n');
  } else {
    console.log('\n⚠️  Skipping database setup. You can add it later to .env file.\n');
  }
  
  console.log('STEP 2: Image Storage (Cloudinary)');
  console.log('-----------------------------------');
  console.log('1. Go to https://cloudinary.com and create a free account');
  console.log('2. Find your credentials in the Dashboard\n');
  
  const hasCloudinary = await question('Do you have your Cloudinary credentials? (y/n): ');
  
  if (hasCloudinary.toLowerCase() === 'y') {
    const cloudName = await question('Enter your Cloud Name: ');
    const apiKey = await question('Enter your API Key: ');
    const apiSecret = await question('Enter your API Secret: ');
    
    updateEnvFile('CLOUDINARY_CLOUD_NAME', cloudName);
    updateEnvFile('CLOUDINARY_API_KEY', apiKey);
    updateEnvFile('CLOUDINARY_API_SECRET', apiSecret);
    console.log('✓ Cloudinary credentials saved\n');
  } else {
    console.log('\n⚠️  Skipping Cloudinary setup. You can add it later to .env file.\n');
  }
  
  console.log('STEP 3: Admin Credentials');
  console.log('-------------------------');
  
  const adminUsername = await question('Enter admin username (default: admin): ') || 'admin';
  const adminPassword = await question('Enter admin password (make it secure!): ');
  
  if (adminPassword && adminPassword.length >= 6) {
    updateEnvFile('ADMIN_USERNAME', adminUsername);
    updateEnvFile('ADMIN_PASSWORD', adminPassword);
    console.log('✓ Admin credentials saved\n');
  } else {
    console.log('\n⚠️  Password too short or empty. Using default (changeme123)\n');
  }
  
  // Generate session secret
  const sessionSecret = generateRandomString(64);
  updateEnvFile('SESSION_SECRET', sessionSecret);
  console.log('✓ Generated secure session secret\n');
  
  console.log('Setup complete! 🎉\n');
  console.log('Next steps:');
  console.log('1. Run: npm run setup-db (to create database tables)');
  console.log('2. Run: npm run dev (to start the server)');
  console.log('3. Visit: http://localhost:3000/admin\n');
  
  rl.close();
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '.env');
  let content = fs.readFileSync(envPath, 'utf8');
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, content);
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setup().catch(console.error);