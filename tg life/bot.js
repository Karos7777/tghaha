const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize your bot with the token you get from BotFather
const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN');

// Set up the bot commands
bot.command('start', (ctx) => {
  ctx.reply('Добро пожаловать в TG Life! Нажмите на кнопку ниже, чтобы открыть приложение.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: process.env.WEBAPP_URL || 'https://your-app-url.com' } }]
      ]
    }
  });
});

// Handle any text messages
bot.on('text', (ctx) => {
  ctx.reply('Нажмите на кнопку ниже, чтобы открыть приложение.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: process.env.WEBAPP_URL || 'https://your-app-url.com' } }]
      ]
    }
  });
});

// Start the bot
bot.launch()
  .then(() => console.log('Bot started successfully!'))
  .catch((err) => console.error('Error starting bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
