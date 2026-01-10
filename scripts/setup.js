#!/usr/bin/env node
/**
 * Cross-platform CLI Setup Script for Standard Parti Poodles Australia
 * Works on Windows, macOS, and Linux
 */

import { execSync, spawn } from 'child_process';
import { platform } from 'os';
import { existsSync } from 'fs';
import { createInterface } from 'readline';

const isWindows = platform() === 'win32';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function commandExists(cmd) {
  try {
    execSync(isWindows ? `where ${cmd}` : `which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runCommand(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    return null;
  }
}

function runInteractive(cmd, args = []) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true
    });
    child.on('close', resolve);
  });
}

async function main() {
  console.log('');
  log('===================================================', 'blue');
  log('  Deployment Tools Setup for Parti Poodles', 'blue');
  log('===================================================', 'blue');
  console.log('');

  // Check if in project root
  if (!existsSync('package.json')) {
    log('Error: Please run this script from the project root directory', 'red');
    process.exit(1);
  }

  // Check CLI installations
  log('Checking CLI installations...', 'yellow');
  console.log('');

  // Vercel CLI
  if (commandExists('vercel')) {
    log('[OK] Vercel CLI installed', 'green');
  } else {
    log('[INSTALLING] Vercel CLI...', 'yellow');
    runCommand('npm install -g vercel');
  }

  // Convex CLI
  if (commandExists('convex')) {
    log('[OK] Convex CLI installed', 'green');
  } else {
    log('[INSTALLING] Convex CLI...', 'yellow');
    runCommand('npm install -g convex');
  }

  // GitHub CLI
  if (commandExists('gh')) {
    log('[OK] GitHub CLI installed', 'green');
  } else {
    log('[WARNING] GitHub CLI not installed', 'yellow');
    log('Download from: https://cli.github.com/', 'yellow');
  }

  console.log('');
  log('===================================================', 'blue');
  log('  Authentication Setup', 'blue');
  log('===================================================', 'blue');
  console.log('');

  // Vercel Login
  log('1. VERCEL AUTHENTICATION', 'yellow');
  log('   This will open a browser window for login...', 'reset');
  console.log('');
  await runInteractive('vercel', ['login']);

  console.log('');
  log('2. CONVEX AUTHENTICATION', 'yellow');
  log('   This will open a browser window for Convex login...', 'reset');
  console.log('');
  await runInteractive('npx', ['convex', 'login']);

  console.log('');
  log('3. GITHUB CLI AUTHENTICATION', 'yellow');
  if (commandExists('gh')) {
    log('   This will guide you through GitHub login...', 'reset');
    console.log('');
    await runInteractive('gh', ['auth', 'login']);
  } else {
    log('   Skipped - GitHub CLI not installed', 'red');
  }

  console.log('');
  log('===================================================', 'blue');
  log('  Linking Vercel Project', 'blue');
  log('===================================================', 'blue');
  console.log('');

  if (!existsSync('.vercel')) {
    log('Linking to Vercel project...', 'yellow');
    await runInteractive('vercel', ['link']);
  } else {
    log('[OK] Vercel project already linked', 'green');
  }

  console.log('');
  log('===================================================', 'green');
  log('  Setup Complete!', 'green');
  log('===================================================', 'green');
  console.log('');
  log('Available commands:', 'reset');
  log('  npm run deploy          - Deploy to Vercel production', 'reset');
  log('  npm run deploy:preview  - Deploy preview to Vercel', 'reset');
  log('  npm run deploy:logs     - View deployment logs', 'reset');
  log('  npm run convex:dev      - Start Convex dev server', 'reset');
  log('  npm run convex:deploy   - Deploy Convex functions', 'reset');
  console.log('');
}

main().catch(console.error);
