/**
 * This script is used to download and install Chromium for Puppeteer in production environments
 * like Heroku, Vercel, or AWS Lambda where the bundled Chromium can't be used.
 * 
 * It is run as a postinstall step to ensure Chromium is available.
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');

// Skip installation in development environments
if (process.env.NODE_ENV === 'development') {
  console.log('Skipping Chromium installation in development environment');
  process.exit(0);
}

// For Heroku deployment
const isHeroku = process.env.DYNO || false;

try {
  // Create the .cache directory if it doesn't exist
  const chromiumPath = path.join(process.cwd(), '.cache', 'puppeteer');
  
  if (!existsSync(path.join(process.cwd(), '.cache'))) {
    mkdirSync(path.join(process.cwd(), '.cache'));
  }
  
  if (!existsSync(chromiumPath)) {
    mkdirSync(chromiumPath, { recursive: true });
  }

  console.log('Installing puppeteer-core dependencies...');
  
  // Install specific Chromium dependencies for Heroku
  if (isHeroku) {
    try {
      console.log('Installing Chromium dependencies for Heroku...');
      execSync('apt-get update && apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils', { stdio: 'inherit' });
    } catch (depError) {
      console.warn('Failed to install system dependencies, continuing anyway:', depError.message);
      // Continue execution - the dependencies might already be installed
    }
  }

  // Set environment variable for Puppeteer to use this path
  process.env.PUPPETEER_CACHE_DIR = chromiumPath;

  // Download Chromium browser
  try {
    console.log('Installing Chromium for Puppeteer...');
    execSync('npx @puppeteer/browsers install chrome@stable', { stdio: 'inherit' });
  } catch (browserError) {
    console.error('Failed to install Chromium browser:', browserError);
    console.log('Continuing with installation...');
  }
  
  // Set environment variables
  const executablePath = process.env.CHROME_BIN || 
                         process.env.CHROMIUM_PATH || 
                         '/app/.cache/puppeteer/chrome/linux-stable/chrome-linux64/chrome';

  console.log(`Using Chromium executable path: ${executablePath}`);
  
  // Create a .env.local file with the path if in Heroku
  if (isHeroku) {
    process.env.CHROMIUM_PATH = executablePath;
    try {
      // Set environment variable for the app to use
      writeFileSync(path.join(process.cwd(), '.env.local'), `CHROMIUM_PATH=${executablePath}\n`, { flag: 'a' });
      console.log('Updated .env.local with Chromium path');
    } catch (writeError) {
      console.warn('Could not write to .env.local:', writeError.message);
    }
  }
  
  console.log('Chromium installation process completed successfully!');
} catch (error) {
  console.error('Warning during Chromium installation:', error);
  console.log('The app will fall back to fetch if Puppeteer is not available');
  // Don't exit with an error code to prevent build failures
}