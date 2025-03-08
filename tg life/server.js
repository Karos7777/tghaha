const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data directory for storing user data
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// User data directory
const USERS_DIR = path.join(DATA_DIR, 'users');
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR);
}

// Sample questions for health test
const questions = [
  {
    id: 1,
    question: "Как часто вы занимаетесь физическими упражнениями?",
    answers: [
      { id: 1, text: "Никогда", value: 1 },
      { id: 2, text: "Редко (1-2 раза в месяц)", value: 3 },
      { id: 3, text: "Иногда (1-2 раза в неделю)", value: 6 },
      { id: 4, text: "Регулярно (3-5 раз в неделю)", value: 9 },
      { id: 5, text: "Ежедневно", value: 10 }
    ]
  },
  {
    id: 2,
    question: "Как бы вы оценили качество своего сна?",
    answers: [
      { id: 1, text: "Очень плохое", value: 1 },
      { id: 2, text: "Плохое", value: 3 },
      { id: 3, text: "Среднее", value: 5 },
      { id: 4, text: "Хорошее", value: 8 },
      { id: 5, text: "Отличное", value: 10 }
    ]
  },
  {
    id: 3,
    question: "Как часто вы испытываете стресс?",
    answers: [
      { id: 1, text: "Постоянно", value: 1 },
      { id: 2, text: "Часто", value: 3 },
      { id: 3, text: "Иногда", value: 6 },
      { id: 4, text: "Редко", value: 8 },
      { id: 5, text: "Практически никогда", value: 10 }
    ]
  },
  {
    id: 4,
    question: "Как бы вы оценили своё питание?",
    answers: [
      { id: 1, text: "Очень нездоровое", value: 1 },
      { id: 2, text: "Скорее нездоровое", value: 3 },
      { id: 3, text: "Среднее", value: 5 },
      { id: 4, text: "Здоровое", value: 8 },
      { id: 5, text: "Очень здоровое", value: 10 }
    ]
  },
  {
    id: 5,
    question: "Как часто вы употребляете алкоголь?",
    answers: [
      { id: 1, text: "Ежедневно", value: 1 },
      { id: 2, text: "Несколько раз в неделю", value: 3 },
      { id: 3, text: "Несколько раз в месяц", value: 6 },
      { id: 4, text: "Редко (по праздникам)", value: 8 },
      { id: 5, text: "Не употребляю", value: 10 }
    ]
  },
  {
    id: 6,
    question: "Курите ли вы?",
    answers: [
      { id: 1, text: "Да, регулярно", value: 1 },
      { id: 2, text: "Иногда", value: 4 },
      { id: 3, text: "Бросил(а)", value: 7 },
      { id: 4, text: "Никогда не курил(а)", value: 10 }
    ]
  },
  {
    id: 7,
    question: "Как часто вы проходите медицинские осмотры?",
    answers: [
      { id: 1, text: "Никогда", value: 1 },
      { id: 2, text: "Только когда болею", value: 4 },
      { id: 3, text: "Раз в несколько лет", value: 6 },
      { id: 4, text: "Ежегодно", value: 9 },
      { id: 5, text: "Регулярно, включая профилактические", value: 10 }
    ]
  },
  {
    id: 8,
    question: "Как бы вы оценили своё психическое здоровье?",
    answers: [
      { id: 1, text: "Очень плохое", value: 1 },
      { id: 2, text: "Плохое", value: 3 },
      { id: 3, text: "Среднее", value: 5 },
      { id: 4, text: "Хорошее", value: 8 },
      { id: 5, text: "Отличное", value: 10 }
    ]
  },
  {
    id: 9,
    question: "У вас есть хронические заболевания?",
    answers: [
      { id: 1, text: "Да, несколько тяжелых", value: 1 },
      { id: 2, text: "Да, одно тяжелое", value: 3 },
      { id: 3, text: "Да, но нетяжелые", value: 6 },
      { id: 4, text: "Нет, но есть предрасположенность", value: 8 },
      { id: 5, text: "Нет", value: 10 }
    ]
  },
  {
    id: 10,
    question: "Как бы вы оценили свой уровень энергии в течение дня?",
    answers: [
      { id: 1, text: "Очень низкий", value: 1 },
      { id: 2, text: "Низкий", value: 3 },
      { id: 3, text: "Средний", value: 5 },
      { id: 4, text: "Высокий", value: 8 },
      { id: 5, text: "Очень высокий", value: 10 }
    ]
  }
];

// Verify Telegram data
function verifyTelegramWebAppData(telegramInitData, botToken) {
  // Get data and hash from the initData string
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  
  if (!hash) return false;
  
  // Remove hash from the initData for verification
  initData.delete('hash');
  
  // Sort keys
  const dataCheckString = Array.from(initData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Generate HMAC-SHA-256 signature
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const signature = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  
  return signature === hash;
}

// Helper function to get user file path
function getUserFilePath(userId) {
  return path.join(USERS_DIR, `${userId}.json`);
}

// Helper function to save user data
function saveUserData(userId, data) {
  const filePath = getUserFilePath(userId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Helper function to get user data
function getUserData(userId) {
  const filePath = getUserFilePath(userId);
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  
  return null;
}

// API Routes
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// Calculate results based on answers
app.post('/api/calculate', (req, res) => {
  const { answers } = req.body;
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid answers format' });
  }
  
  // Calculate average score
  const totalScore = answers.reduce((sum, answer) => sum + answer.value, 0);
  const averageScore = totalScore / answers.length;
  
  // Calculate remaining years (simplified formula)
  const remainingYears = (averageScore).toFixed(1);
  
  // Calculate remaining days
  const remainingDays = Math.round(remainingYears * 365);
  
  res.json({
    averageScore,
    remainingYears,
    remainingDays
  });
});

// Get user data
app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const telegramInitData = req.headers['telegram-data'];
    
    // In production, you would verify the Telegram data
    // if (!verifyTelegramWebAppData(telegramInitData, YOUR_BOT_TOKEN)) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    
    const userData = getUserData(userId);
    
    if (userData) {
      res.json(userData);
    } else {
      res.json({
        healthIssues: [],
        exercises: [],
        testResults: null,
        remainingDays: 0,
        initialDays: 0,
        daysAddedFromExercise: 0,
        lastUpdateTime: null,
        lastDecrementDay: null,
        attemptsLeft: 1
      });
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user data
app.post('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const telegramInitData = req.headers['telegram-data'];
    const userData = req.body;
    
    // In production, you would verify the Telegram data
    // if (!verifyTelegramWebAppData(telegramInitData, YOUR_BOT_TOKEN)) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    
    saveUserData(userId, userData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save health issues
app.post('/api/user/:userId/health-issues', (req, res) => {
  try {
    const { userId } = req.params;
    const { healthIssues } = req.body;
    
    let userData = getUserData(userId);
    
    if (!userData) {
      userData = {
        healthIssues: [],
        exercises: [],
        testResults: null,
        remainingDays: 0,
        initialDays: 0,
        daysAddedFromExercise: 0,
        lastUpdateTime: null,
        lastDecrementDay: null,
        attemptsLeft: 1
      };
    }
    
    userData.healthIssues = healthIssues;
    saveUserData(userId, userData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving health issues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save exercises
app.post('/api/user/:userId/exercises', (req, res) => {
  try {
    const { userId } = req.params;
    const { exercises, daysAddedFromExercise } = req.body;
    
    let userData = getUserData(userId);
    
    if (!userData) {
      userData = {
        healthIssues: [],
        exercises: [],
        testResults: null,
        remainingDays: 0,
        initialDays: 0,
        daysAddedFromExercise: 0,
        lastUpdateTime: null,
        lastDecrementDay: null,
        attemptsLeft: 1
      };
    }
    
    userData.exercises = exercises;
    userData.daysAddedFromExercise = daysAddedFromExercise;
    saveUserData(userId, userData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update remaining days
app.post('/api/user/:userId/remaining-days', (req, res) => {
  try {
    const { userId } = req.params;
    const { remainingDays, lastUpdateTime, lastDecrementDay } = req.body;
    
    let userData = getUserData(userId);
    
    if (!userData) {
      userData = {
        healthIssues: [],
        exercises: [],
        testResults: null,
        remainingDays: 0,
        initialDays: 0,
        daysAddedFromExercise: 0,
        lastUpdateTime: null,
        lastDecrementDay: null,
        attemptsLeft: 1
      };
    }
    
    userData.remainingDays = remainingDays;
    if (lastUpdateTime) userData.lastUpdateTime = lastUpdateTime;
    if (lastDecrementDay) userData.lastDecrementDay = lastDecrementDay;
    
    saveUserData(userId, userData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating remaining days:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save test results
app.post('/api/user/:userId/test-results', (req, res) => {
  try {
    const { userId } = req.params;
    const { testResults, remainingDays, initialDays, attemptsLeft } = req.body;
    
    let userData = getUserData(userId);
    
    if (!userData) {
      userData = {
        healthIssues: [],
        exercises: [],
        testResults: null,
        remainingDays: 0,
        initialDays: 0,
        daysAddedFromExercise: 0,
        lastUpdateTime: null,
        lastDecrementDay: null,
        attemptsLeft: 1
      };
    }
    
    userData.testResults = testResults;
    userData.remainingDays = remainingDays;
    userData.initialDays = initialDays;
    userData.attemptsLeft = attemptsLeft;
    userData.lastUpdateTime = new Date().toISOString();
    userData.lastDecrementDay = new Date().toDateString();
    
    saveUserData(userId, userData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mini App URL: ${process.env.WEBAPP_URL || 'https://your-app-url.com'}`);
});
