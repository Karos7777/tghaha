const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to create a .gitignore file if it doesn't exist
function createGitIgnore() {
  const gitignorePath = path.join(__dirname, '.gitignore');
  const gitignoreContent = `
node_modules/
.env
data/
*.log
`;

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent.trim());
    console.log('Created .gitignore file');
  }
}

// Function to create a README for Glitch
function createReadme() {
  const readmePath = path.join(__dirname, 'README.md');
  const readmeContent = `
# TG Life - Telegram Mini App

This is a Telegram Mini App for health assessment and life expectancy calculation.

## Setup Instructions

1. Create a new bot using BotFather in Telegram
2. Get your bot token and set it in the .env file
3. Set the WEBAPP_URL in the .env file to your Glitch project URL
4. Run \`npm install\` to install dependencies
5. Run \`npm start\` to start the server

## How to Use

1. Start the bot with /start command
2. Click on the "Open App" button to launch the Mini App
3. Complete the health assessment to see your results

## Development

- \`npm run dev\` - Start the server with nodemon for development
- \`npm run bot\` - Start only the Telegram bot
`;

  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, readmeContent.trim());
    console.log('Created README.md file');
  } else {
    console.log('README.md already exists, skipping');
  }
}

// Function to check if git is initialized
function initGit() {
  try {
    if (!fs.existsSync(path.join(__dirname, '.git'))) {
      console.log('Initializing git repository...');
      execSync('git init', { stdio: 'inherit' });
      console.log('Git repository initialized');
    } else {
      console.log('Git repository already initialized');
    }
  } catch (error) {
    console.error('Error initializing git:', error.message);
  }
}

// Main function
function main() {
  console.log('Preparing project for Glitch deployment...');
  
  // Create necessary files
  createGitIgnore();
  createReadme();
  initGit();
  
  console.log('\nDeployment preparation complete!');
  console.log('\nTo deploy to Glitch:');
  console.log('1. Go to https://glitch.com/ and create a new project');
  console.log('2. Choose "Import from GitHub"');
  console.log('3. Push your code to GitHub first or use the Glitch CLI');
  console.log('4. Once deployed, set up your bot token in the .env file on Glitch');
  console.log('5. Set the WEBAPP_URL to your Glitch project URL');
  console.log('\nAlternatively, you can use the Glitch console to clone your repository directly.');
}

// Run the main function
main();
