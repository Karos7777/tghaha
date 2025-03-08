// Exercise Tracker Component
class ExerciseTracker {
  constructor(container) {
    this.container = container;
    this.exercises = [];
    this.initExerciseTracker();
  }

  // Initialize the exercise tracker
  initExerciseTracker() {
    this.container.innerHTML = `
      <div class="exercise-tracker">
        <h2>Физическая активность</h2>
        <p class="help-text">Занимайтесь спортом, чтобы увеличить количество оставшихся дней</p>
        
        <div class="exercise-summary">
          <div class="summary-item">
            <h3>Сегодня</h3>
            <p><span id="today-minutes">0</span> минут</p>
          </div>
          <div class="summary-item">
            <h3>На этой неделе</h3>
            <p><span id="week-minutes">0</span> минут</p>
          </div>
          <div class="summary-item">
            <h3>Дней добавлено</h3>
            <p><span id="days-added">0</span> дней</p>
          </div>
        </div>
        
        <button id="add-exercise-btn" class="btn primary-btn">Добавить активность</button>
        
        <h3>История активностей</h3>
        <ul id="exercise-history" class="exercise-list">
          <li class="no-exercises">История активностей пуста</li>
        </ul>
      </div>
    `;
    
    // Add event listener for adding exercise
    document.getElementById('add-exercise-btn').addEventListener('click', this.showExerciseForm.bind(this));
    
    // Load saved exercises
    this.loadExercises();
    
    // Update summary
    this.updateExerciseSummary();
  }
  
  // Show form to add an exercise
  showExerciseForm() {
    // Create modal for adding exercise
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Добавить физическую активность</h2>
        <form id="exercise-form">
          <div class="form-group">
            <label for="exercise-type">Тип активности:</label>
            <select id="exercise-type" required>
              <option value="">-- Выберите --</option>
              <option value="walking">Ходьба</option>
              <option value="running">Бег</option>
              <option value="swimming">Плавание</option>
              <option value="cycling">Велосипед</option>
              <option value="gym">Тренажерный зал</option>
              <option value="yoga">Йога</option>
              <option value="pilates">Пилатес</option>
              <option value="team-sports">Командные виды спорта</option>
              <option value="dancing">Танцы</option>
              <option value="hiking">Поход</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div class="form-group other-type-container" style="display: none;">
            <label for="other-exercise-type">Укажите тип активности:</label>
            <input type="text" id="other-exercise-type" placeholder="Например: скалолазание">
          </div>
          
          <div class="form-group">
            <label for="exercise-intensity">Интенсивность:</label>
            <select id="exercise-intensity" required>
              <option value="low">Низкая</option>
              <option value="medium" selected>Средняя</option>
              <option value="high">Высокая</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="exercise-duration">Продолжительность (минуты):</label>
            <input type="number" id="exercise-duration" min="1" max="600" value="30" required>
          </div>
          
          <div class="form-group">
            <label for="exercise-date">Дата:</label>
            <input type="date" id="exercise-date" required>
          </div>
          
          <div class="form-group">
            <label for="exercise-notes">Примечания (опционально):</label>
            <textarea id="exercise-notes" rows="2"></textarea>
          </div>
          
          <button type="submit" class="btn primary-btn">Сохранить</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('exercise-date').value = dateString;
    
    // Show/hide other type input based on selection
    document.getElementById('exercise-type').addEventListener('change', function() {
      const otherContainer = document.querySelector('.other-type-container');
      if (this.value === 'other') {
        otherContainer.style.display = 'block';
        document.getElementById('other-exercise-type').setAttribute('required', '');
      } else {
        otherContainer.style.display = 'none';
        document.getElementById('other-exercise-type').removeAttribute('required');
      }
    });
    
    // Close modal on X click
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Handle form submission
    document.getElementById('exercise-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const exerciseType = document.getElementById('exercise-type').value;
      let exerciseTypeName = exerciseType === 'other' 
        ? document.getElementById('other-exercise-type').value 
        : document.getElementById('exercise-type').options[document.getElementById('exercise-type').selectedIndex].text;
      
      const exerciseData = {
        id: Date.now().toString(),
        type: exerciseType,
        typeName: exerciseTypeName,
        intensity: document.getElementById('exercise-intensity').value,
        intensityName: document.getElementById('exercise-intensity').options[document.getElementById('exercise-intensity').selectedIndex].text,
        duration: parseInt(document.getElementById('exercise-duration').value),
        date: document.getElementById('exercise-date').value,
        notes: document.getElementById('exercise-notes').value,
        timestamp: new Date().toISOString()
      };
      
      this.addExercise(exerciseData);
      document.body.removeChild(modal);
    });
  }
  
  // Add a new exercise
  addExercise(exerciseData) {
    this.exercises.push(exerciseData);
    
    // Sort exercises by date (newest first)
    this.exercises.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    localStorage.setItem('exercises', JSON.stringify(this.exercises));
    
    // Update exercise list
    this.updateExerciseList();
    
    // Update summary
    this.updateExerciseSummary();
    
    // Update remaining days
    this.updateRemainingDays(exerciseData);
  }
  
  // Remove an exercise
  removeExercise(exerciseId) {
    this.exercises = this.exercises.filter(exercise => exercise.id !== exerciseId);
    
    // Save to localStorage
    localStorage.setItem('exercises', JSON.stringify(this.exercises));
    
    // Update exercise list
    this.updateExerciseList();
    
    // Update summary
    this.updateExerciseSummary();
  }
  
  // Update exercise list in the UI
  updateExerciseList() {
    const historyList = document.getElementById('exercise-history');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (this.exercises.length === 0) {
      historyList.innerHTML = '<li class="no-exercises">История активностей пуста</li>';
      return;
    }
    
    // Get only the most recent 10 exercises to display
    const recentExercises = this.exercises.slice(0, 10);
    
    recentExercises.forEach(exercise => {
      const exerciseItem = document.createElement('li');
      exerciseItem.className = 'exercise-item';
      
      // Format date for display
      const exerciseDate = new Date(exercise.date);
      const formattedDate = exerciseDate.toLocaleDateString('ru-RU');
      
      exerciseItem.innerHTML = `
        <div class="exercise-header">
          <h4>${exercise.typeName}</h4>
          <span class="exercise-date">${formattedDate}</span>
        </div>
        <div class="exercise-details">
          <span class="duration">${exercise.duration} мин</span>
          <span class="intensity intensity-${exercise.intensity}">${exercise.intensityName}</span>
        </div>
        ${exercise.notes ? `<p class="exercise-notes">${exercise.notes}</p>` : ''}
        <button class="btn-remove-exercise" data-id="${exercise.id}">Удалить</button>
      `;
      
      historyList.appendChild(exerciseItem);
      
      // Add remove button handler
      exerciseItem.querySelector('.btn-remove-exercise').addEventListener('click', () => {
        this.removeExercise(exercise.id);
      });
    });
    
    // Add "Show more" button if there are more than 10 exercises
    if (this.exercises.length > 10) {
      const showMoreItem = document.createElement('li');
      showMoreItem.className = 'show-more-item';
      showMoreItem.innerHTML = `
        <button id="show-more-exercises" class="btn secondary-btn">Показать еще (${this.exercises.length - 10})</button>
      `;
      historyList.appendChild(showMoreItem);
      
      // Add show more button handler
      document.getElementById('show-more-exercises').addEventListener('click', this.showAllExercises.bind(this));
    }
  }
  
  // Show all exercises in a modal
  showAllExercises() {
    // Create modal for showing all exercises
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content wide-modal">
        <span class="close-modal">&times;</span>
        <h2>История активностей</h2>
        <div class="exercise-history-container">
          <ul id="full-exercise-history" class="exercise-list full-list">
            <!-- Exercises will be populated here -->
          </ul>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate all exercises
    const historyList = document.getElementById('full-exercise-history');
    
    this.exercises.forEach(exercise => {
      const exerciseItem = document.createElement('li');
      exerciseItem.className = 'exercise-item';
      
      // Format date for display
      const exerciseDate = new Date(exercise.date);
      const formattedDate = exerciseDate.toLocaleDateString('ru-RU');
      
      exerciseItem.innerHTML = `
        <div class="exercise-header">
          <h4>${exercise.typeName}</h4>
          <span class="exercise-date">${formattedDate}</span>
        </div>
        <div class="exercise-details">
          <span class="duration">${exercise.duration} мин</span>
          <span class="intensity intensity-${exercise.intensity}">${exercise.intensityName}</span>
        </div>
        ${exercise.notes ? `<p class="exercise-notes">${exercise.notes}</p>` : ''}
        <button class="btn-remove-exercise-full" data-id="${exercise.id}">Удалить</button>
      `;
      
      historyList.appendChild(exerciseItem);
      
      // Add remove button handler
      exerciseItem.querySelector('.btn-remove-exercise-full').addEventListener('click', () => {
        this.removeExercise(exercise.id);
        exerciseItem.remove();
      });
    });
    
    // Close modal on X click
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
  
  // Update exercise summary in the UI
  updateExerciseSummary() {
    // Get today's and this week's exercises
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to start of week (Sunday)
    
    // Calculate today's minutes
    const todayExercises = this.exercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      exerciseDate.setHours(0, 0, 0, 0);
      return exerciseDate.getTime() === today.getTime();
    });
    
    const todayMinutes = todayExercises.reduce((sum, exercise) => sum + exercise.duration, 0);
    
    // Calculate this week's minutes
    const weekExercises = this.exercises.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      exerciseDate.setHours(0, 0, 0, 0);
      return exerciseDate >= startOfWeek;
    });
    
    const weekMinutes = weekExercises.reduce((sum, exercise) => sum + exercise.duration, 0);
    
    // Update UI
    document.getElementById('today-minutes').textContent = todayMinutes;
    document.getElementById('week-minutes').textContent = weekMinutes;
    
    // Update days added
    const daysAdded = parseInt(localStorage.getItem('daysAddedFromExercise') || '0');
    document.getElementById('days-added').textContent = daysAdded;
  }
  
  // Load exercises from localStorage
  loadExercises() {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
      this.exercises = JSON.parse(savedExercises);
      this.updateExerciseList();
    }
  }
  
  // Update remaining days based on exercise
  updateRemainingDays(exerciseData) {
    // Get current remaining days
    let remainingDays = parseInt(localStorage.getItem('remainingDays') || '0');
    let daysAddedFromExercise = parseInt(localStorage.getItem('daysAddedFromExercise') || '0');
    
    if (remainingDays > 0) {
      // Calculate days to add based on duration and intensity
      let daysToAdd = 0;
      
      // Base formula: 30 minutes of medium intensity = 0.1 days
      // Low intensity = 0.5x, High intensity = 1.5x
      const intensityFactor = exerciseData.intensity === 'low' ? 0.5 : 
                              exerciseData.intensity === 'high' ? 1.5 : 1;
      
      daysToAdd = (exerciseData.duration / 30) * 0.1 * intensityFactor;
      
      // Round to 2 decimal places
      daysToAdd = Math.round(daysToAdd * 100) / 100;
      
      // Add days but ensure it's a reasonable amount
      remainingDays += daysToAdd;
      daysAddedFromExercise += daysToAdd;
      
      // Save updated days
      localStorage.setItem('remainingDays', remainingDays.toString());
      localStorage.setItem('daysAddedFromExercise', daysAddedFromExercise.toString());
      
      // Update display
      const daysLeftEl = document.getElementById('days-left');
      if (daysLeftEl) {
        daysLeftEl.textContent = Math.round(remainingDays).toLocaleString();
      }
      
      document.getElementById('days-added').textContent = daysAddedFromExercise.toFixed(1);
      
      // Show notification of days added
      this.showDaysAddedNotification(daysToAdd);
    }
  }
  
  // Show notification when days are added
  showDaysAddedNotification(daysAdded) {
    const notification = document.createElement('div');
    notification.className = 'notification success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✓</span>
        <span class="notification-text">Добавлено ${daysAdded.toFixed(1)} дней к вашей жизни!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}
