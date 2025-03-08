const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Initialize your bot with the token you get from BotFather
const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN');

// Get the webapp URL from environment variables or use a default
const webAppUrl = process.env.WEBAPP_URL || 'https://your-app-url.com';
const testAppUrl = `${webAppUrl}/test-mini-app.html`;

// Set up the bot commands
bot.command('start', (ctx) => {
  ctx.reply('Добро пожаловать в TG Life! Выберите приложение для запуска:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть основное приложение', web_app: { url: webAppUrl } }],
        [{ text: 'Открыть тестовое приложение', web_app: { url: testAppUrl } }]
      ]
    }
  });
});

// Handle any text messages
bot.on('text', (ctx) => {
  ctx.reply('Выберите приложение для запуска:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть основное приложение', web_app: { url: webAppUrl } }],
        [{ text: 'Открыть тестовое приложение', web_app: { url: testAppUrl } }]
      ]
    }
  });
});

// Log when the bot is started
console.log('Starting bot...');
console.log(`WebApp URL: ${webAppUrl}`);
console.log(`Test App URL: ${testAppUrl}`);

// Start the bot
bot.launch()
  .then(() => console.log('Bot started successfully!'))
  .catch((err) => console.error('Error starting bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
