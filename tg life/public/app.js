// Initialize Telegram WebApp
const tgApp = window.Telegram.WebApp;
tgApp.expand(); // Expand to the maximum allowed height
tgApp.ready(); // Notify Telegram WebApp that the Mini App is ready to be shown

// Get user data from Telegram
const tgUser = tgApp.initDataUnsafe?.user || {};
const userId = tgUser.id || 'anonymous';

// DOM elements - Basic screens
const welcomeScreen = document.getElementById('welcome-screen');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const mainAppScreen = document.getElementById('main-app-screen');

// DOM elements - Buttons
const startTestBtn = document.getElementById('start-test-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const continueBtn = document.getElementById('continue-btn');

// DOM elements - Test elements
const progressBar = document.getElementById('progress-bar');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');

// DOM elements - Results and stats
const healthScoreEl = document.getElementById('health-score');
const daysLeftEl = document.getElementById('days-left');
const mainDaysLeftEl = document.getElementById('main-days-left');
const yearsLeftEl = document.getElementById('years-left');
const attemptsLeftEl = document.getElementById('attempts-left');
const thermometerFill = document.getElementById('thermometer-fill');
const initialDaysEl = document.getElementById('initial-days');
const statsDaysAddedEl = document.getElementById('stats-days-added');
const daysLostEl = document.getElementById('days-lost');
const healthStatusEl = document.getElementById('health-status');
const lastUpdateTimeEl = document.getElementById('last-update-time');

// Application state
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let attemptsLeft = 1; // User can take the test twice
let totalDays = 0;
let initialDays = 0;
let bodyMap = null;
let exerciseTracker = null;

// Constants
const DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fetch questions from the server
async function fetchQuestions() {
  try {
    // In test mode or without server, use mock data
    if (typeof mockQuestions !== 'undefined') {
      questions = mockQuestions;
      totalQuestionsEl.textContent = questions.length;
      return;
    }
    
    const response = await fetch('/api/questions');
    questions = await response.json();
    totalQuestionsEl.textContent = questions.length;
  } catch (error) {
    console.error('Error fetching questions:', error);
    alert('Произошла ошибка при загрузке вопросов. Пожалуйста, попробуйте позже.');
  }
}

// Initialize the application
async function initApp() {
  await fetchQuestions();
  
  // Load saved data
  loadSavedData();
  
  // Event listeners - Test and results
  startTestBtn.addEventListener('click', startTest);
  
  // Setup Telegram main button for navigation
  setupTelegramMainButton();
  
  // Check if user has taken the test before
  const testCompleted = localStorage.getItem('testCompleted');
  
  if (testCompleted === 'true') {
    // If user has already taken the test, go directly to dashboard
    continueToDashboard();
  }
  
  // Set up tab navigation
  setupTabs();
  
  // Initialize components when on dashboard
  if (mainAppScreen.classList.contains('active')) {
    initializeComponents();
  }
  
  // Check if we need to decrement days
  checkAndDecrementDays();
}

// Setup Telegram Main Button
function setupTelegramMainButton() {
  // Configure the main button
  tgApp.MainButton.setParams({
    text: 'Продолжить',
    color: '#2cab37',
    textColor: '#ffffff',
    is_visible: false
  });
  
  // Add event listeners for different screens
  tgApp.MainButton.onClick(function() {
    if (testScreen.classList.contains('active')) {
      handleNextQuestion();
    } else if (resultsScreen.classList.contains('active')) {
      continueToDashboard();
    } else if (mainAppScreen.classList.contains('active')) {
      const activeTab = document.querySelector('.tab.active').dataset.tab;
      
      if (activeTab === 'health-tab') {
        // Show add health issue form
        document.getElementById('add-issue-btn').click();
      } else if (activeTab === 'exercise-tab') {
        // Show add exercise form
        document.getElementById('add-exercise-btn').click();
      }
    }
  });
}

// Start the test
function startTest() {
  welcomeScreen.classList.remove('active');
  testScreen.classList.add('active');
  
  // Reset state
  currentQuestionIndex = 0;
  selectedAnswers = [];
  
  // Show first question
  showQuestion(currentQuestionIndex);
}

// Display current question
function showQuestion(index) {
  const question = questions[index];
  
  // Update progress
  const progress = ((index + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  currentQuestionEl.textContent = index + 1;
  
  // Display question
  questionText.textContent = question.question;
  
  // Clear previous answers
  answersContainer.innerHTML = '';
  
  // Add answer options
  question.answers.forEach(answer => {
    const answerElement = document.createElement('div');
    answerElement.classList.add('answer-option');
    answerElement.textContent = answer.text;
    answerElement.dataset.answerId = answer.id;
    answerElement.dataset.value = answer.value;
    
    answerElement.addEventListener('click', () => selectAnswer(answerElement, answer));
    
    answersContainer.appendChild(answerElement);
  });
  
  // Hide Telegram Main Button until answer is selected
  tgApp.MainButton.hide();
}

// Handle answer selection and show Telegram Main Button
function selectAnswer(element, answer) {
  // Deselect any previously selected answer
  const selected = answersContainer.querySelector('.selected');
  if (selected) selected.classList.remove('selected');
  
  // Select the current answer
  element.classList.add('selected');
  
  // Store the answer
  selectedAnswers[currentQuestionIndex] = answer;
  
  // Show Telegram Main Button
  tgApp.MainButton.setText(currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Показать результаты');
  tgApp.MainButton.show();
}

// Handle next question button
function handleNextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    // Show next question
    showQuestion(currentQuestionIndex);
  } else {
    // Calculate results
    calculateResults();
  }
}

// Calculate and display results
async function calculateResults() {
  try {
    // In test mode or without server, calculate locally
    if (typeof mockQuestions !== 'undefined') {
      const totalScore = selectedAnswers.reduce((sum, answer) => sum + answer.value, 0);
      const averageScore = totalScore / selectedAnswers.length;
      const remainingYears = (averageScore).toFixed(1);
      const remainingDays = Math.round(remainingYears * 365);
      
      processResults({
        averageScore,
        remainingYears,
        remainingDays
      });
      return;
    }
    
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answers: selectedAnswers
      })
    });
    
    const result = await response.json();
    processResults(result);
  } catch (error) {
    console.error('Error calculating results:', error);
    alert('Произошла ошибка при расчете результатов. Пожалуйста, попробуйте позже.');
  }
}

// Process calculated results
function processResults(result) {
  // Save result to localStorage
  localStorage.setItem('healthTestResult', JSON.stringify(result));
  localStorage.setItem('testCompleted', 'true');
  
  // Update attempts left
  attemptsLeft--;
  localStorage.setItem('attemptsLeft', attemptsLeft);
  attemptsLeftEl.textContent = attemptsLeft;
  
  // Save days information
  totalDays = result.remainingDays;
  initialDays = result.remainingDays;
  localStorage.setItem('remainingDays', totalDays.toString());
  localStorage.setItem('initialDays', initialDays.toString());
  
  // Save last update time
  const now = new Date();
  localStorage.setItem('lastUpdateTime', now.toISOString());
  localStorage.setItem('lastDecrementDay', now.toDateString());
  
  // Show results
  showResults(result);
}

// Show results screen
function showResults(result) {
  // Hide test screen and show results screen
  testScreen.classList.remove('active');
  resultsScreen.classList.add('active');
  
  // Update Telegram Main Button
  tgApp.MainButton.setText('Перейти к приложению');
  tgApp.MainButton.show();
  
  // Display results
  healthScoreEl.textContent = result.healthScore;
  daysLeftEl.textContent = Math.round(result.remainingDays).toLocaleString();
  
  const years = (result.remainingDays / 365).toFixed(1);
  yearsLeftEl.textContent = `${years} лет`;
  
  // Update thermometer
  const fillPercentage = (result.healthScore / 10) * 100;
  thermometerFill.style.height = `${fillPercentage}%`;
  
  // Update attempts left
  attemptsLeftEl.textContent = attemptsLeft;
  
  // Show/hide restart button based on attempts left
  if (attemptsLeft <= 0) {
    document.getElementById('attempts-info').style.display = 'none';
  }
  
  // Send data to Telegram if needed
  sendDataToTelegram(result);
}

// Restart the test
function restartTest() {
  if (attemptsLeft > 0) {
    startTest();
  } else {
    alert('У вас не осталось попыток для прохождения теста.');
  }
}

// Continue to main dashboard
function continueToDashboard() {
  // Hide all screens and show main app screen
  welcomeScreen.classList.remove('active');
  testScreen.classList.remove('active');
  resultsScreen.classList.remove('active');
  mainAppScreen.classList.add('active');
  
  // Update Telegram Main Button based on active tab
  updateMainButtonForActiveTab();
  
  // Initialize components
  initializeComponents();
  
  // Mark test as completed
  localStorage.setItem('testCompleted', 'true');
}

// Initialize body map and exercise tracker components
function initializeComponents() {
  // Initialize body map if not already done
  if (!bodyMap) {
    const bodyMapContainer = document.getElementById('body-map-container');
    bodyMap = new BodyMap(bodyMapContainer);
    bodyMap.loadIssues();
  }
  
  // Initialize exercise tracker if not already done
  if (!exerciseTracker) {
    const exerciseTrackerContainer = document.getElementById('exercise-tracker-container');
    exerciseTracker = new ExerciseTracker(exerciseTrackerContainer);
  }
}

// Set up tab navigation with Telegram Main Button update
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      document.getElementById(tabId).classList.add('active');
      
      // Update Telegram Main Button
      updateMainButtonForActiveTab();
    });
  });
}

// Update Telegram Main Button based on active tab
function updateMainButtonForActiveTab() {
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab) return;
  
  const tabId = activeTab.dataset.tab;
  
  if (tabId === 'health-tab') {
    tgApp.MainButton.setText('Добавить проблему');
    tgApp.MainButton.show();
  } else if (tabId === 'exercise-tab') {
    tgApp.MainButton.setText('Добавить активность');
    tgApp.MainButton.show();
  } else {
    tgApp.MainButton.hide();
  }
}

// Load saved data from localStorage
function loadSavedData() {
  // Load attempts left
  const savedAttempts = localStorage.getItem('attemptsLeft');
  if (savedAttempts !== null) {
    attemptsLeft = parseInt(savedAttempts);
    if (attemptsLeftEl) attemptsLeftEl.textContent = attemptsLeft;
  }
  
  // Load days data
  totalDays = parseInt(localStorage.getItem('remainingDays') || '0');
  initialDays = parseInt(localStorage.getItem('initialDays') || '0');
  
  // Update displays
  updateDaysDisplay();
  updateStatistics();
}

// Update days display in all relevant places
function updateDaysDisplay() {
  if (daysLeftEl) daysLeftEl.textContent = Math.round(totalDays).toLocaleString();
  if (mainDaysLeftEl) mainDaysLeftEl.textContent = Math.round(totalDays).toLocaleString();
  if (initialDaysEl) initialDaysEl.textContent = initialDays.toLocaleString();
  
  // If we have days, update years too
  if (totalDays > 0 && yearsLeftEl) {
    const years = (totalDays / 365).toFixed(1);
    yearsLeftEl.textContent = `${years} лет`;
  }
}

// Update statistics display
function updateStatistics() {
  // Days added from exercise
  const daysAdded = parseFloat(localStorage.getItem('daysAddedFromExercise') || '0').toFixed(1);
  if (statsDaysAddedEl) statsDaysAddedEl.textContent = daysAdded;
  
  // Days lost calculation
  const daysLost = initialDays - totalDays + parseFloat(daysAdded);
  if (daysLostEl) daysLostEl.textContent = daysLost.toFixed(1);
  
  // Health status based on percentage of days lost
  if (initialDays > 0 && healthStatusEl) {
    const percentLost = (daysLost / initialDays) * 100;
    let status = 'Отличный';
    
    if (percentLost > 30) {
      status = 'Критический';
    } else if (percentLost > 20) {
      status = 'Плохой';
    } else if (percentLost > 10) {
      status = 'Средний';
    } else if (percentLost > 5) {
      status = 'Нормальный';
    }
    
    healthStatusEl.textContent = status;
  }
  
  // Last update time
  if (lastUpdateTimeEl) {
    const lastUpdateTime = localStorage.getItem('lastUpdateTime');
    if (lastUpdateTime) {
      const date = new Date(lastUpdateTime);
      lastUpdateTimeEl.textContent = date.toLocaleString('ru-RU');
    }
  }
}

// Check if we need to decrement days and do it if necessary
function checkAndDecrementDays() {
  const lastDecrementDay = localStorage.getItem('lastDecrementDay');
  const today = new Date().toDateString();
  
  if (lastDecrementDay !== today && totalDays > 0) {
    // Decrement by 1 day
    totalDays = Math.max(0, totalDays - 1);
    localStorage.setItem('remainingDays', totalDays.toString());
    localStorage.setItem('lastDecrementDay', today);
    
    // Update displays
    updateDaysDisplay();
    updateStatistics();
    
    // Show notification
    showDayDecrementNotification();
  }
  
  // Set up next check
  scheduleNextDayCheck();
}

// Schedule the next day check
function scheduleNextDayCheck() {
  // Calculate time until midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow - now;
  
  // Schedule the check
  setTimeout(() => {
    checkAndDecrementDays();
  }, timeUntilMidnight);
}

// Show notification for day decrement
function showDayDecrementNotification() {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.backgroundColor = '#ff9800'; // Orange warning color
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <span class="notification-text">Прошел еще один день. Осталось: ${totalDays} дней.</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 5000);
}

// Send data to Telegram
function sendDataToTelegram(result) {
  try {
    // Check if we're in Telegram environment
    if (tgApp && tgApp.initDataUnsafe) {
      // Send data back to the bot
      tgApp.sendData(JSON.stringify({
        healthScore: result.healthScore,
        remainingDays: result.remainingDays,
        userId: userId
      }));
      
      // You can also use CloudStorage if needed
      if (tgApp.CloudStorage) {
        tgApp.CloudStorage.setItem('healthScore', result.healthScore.toString());
        tgApp.CloudStorage.setItem('remainingDays', result.remainingDays.toString());
      }
    }
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
  }
}

// Handle back button in Telegram
tgApp.onEvent('backButtonClicked', function() {
  if (testScreen.classList.contains('active') && currentQuestionIndex > 0) {
    // Go back to previous question
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
  } else if (resultsScreen.classList.contains('active')) {
    // Go back to test
    resultsScreen.classList.remove('active');
    testScreen.classList.add('active');
    showQuestion(currentQuestionIndex);
  } else if (mainAppScreen.classList.contains('active')) {
    // Show confirmation dialog
    tgApp.showConfirm(
      'Вы уверены, что хотите выйти из приложения?',
      function(confirmed) {
        if (confirmed) {
          tgApp.close();
        }
      }
    );
  }
});

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
