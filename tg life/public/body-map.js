// Body Map Component for visualizing health issues
class BodyMap {
  constructor(container) {
    this.container = container;
    this.issues = [];
    this.initBodyMap();
  }

  // Initialize the body map
  initBodyMap() {
    const svg = `
      <svg id="body-map-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Head -->
        <circle id="head" cx="100" cy="50" r="30" data-name="Голова" class="body-part" />
        
        <!-- Torso -->
        <rect id="torso" x="70" y="80" width="60" height="100" data-name="Торс" class="body-part" />
        
        <!-- Arms -->
        <rect id="left-arm" x="30" y="90" width="40" height="80" data-name="Левая рука" class="body-part" />
        <rect id="right-arm" x="130" y="90" width="40" height="80" data-name="Правая рука" class="body-part" />
        
        <!-- Legs -->
        <rect id="left-leg" x="70" y="180" width="25" height="120" data-name="Левая нога" class="body-part" />
        <rect id="right-leg" x="105" y="180" width="25" height="120" data-name="Правая нога" class="body-part" />
        
        <!-- Neck -->
        <rect id="neck" x="85" y="65" width="30" height="15" data-name="Шея" class="body-part" />
        
        <!-- Back -->
        <rect id="back" x="70" y="100" width="60" height="60" data-name="Спина" class="body-part back-part" style="display: none;" />
        
        <!-- Stomach -->
        <rect id="stomach" x="80" y="100" width="40" height="40" data-name="Желудок" class="body-part" />
        
        <!-- Chest -->
        <rect id="chest" x="80" y="80" width="40" height="20" data-name="Грудь" class="body-part" />
      </svg>
      <div class="body-controls">
        <button id="rotate-body-btn" class="btn secondary-btn">Повернуть тело</button>
        <button id="add-issue-btn" class="btn primary-btn">Добавить проблему</button>
      </div>
    `;
    
    this.container.innerHTML = svg;
    
    // Add event listeners for body parts
    const bodyParts = document.querySelectorAll('.body-part');
    bodyParts.forEach(part => {
      part.addEventListener('click', () => {
        this.selectBodyPart(part.id, part.dataset.name);
      });
    });
    
    // Rotation button
    document.getElementById('rotate-body-btn').addEventListener('click', this.rotateBody.bind(this));
    
    // Add issue button
    document.getElementById('add-issue-btn').addEventListener('click', this.showIssueForm.bind(this));
  }
  
  // Handle body part selection
  selectBodyPart(partId, partName) {
    // Clear any previously selected parts
    document.querySelectorAll('.body-part.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Select the clicked part
    document.getElementById(partId).classList.add('selected');
    
    // Show issue form for the selected part
    this.showIssueForm(partId, partName);
  }
  
  // Show form to add a health issue
  showIssueForm(partId, partName) {
    const currentIssue = this.issues.find(issue => issue.partId === partId);
    
    // Create modal for adding issue
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Добавить проблему${partName ? ': ' + partName : ''}</h2>
        <form id="issue-form">
          ${partName ? '' : `
            <div class="form-group">
              <label for="body-part-select">Выберите часть тела:</label>
              <select id="body-part-select" required>
                <option value="">-- Выберите --</option>
                <option value="head">Голова</option>
                <option value="neck">Шея</option>
                <option value="chest">Грудь</option>
                <option value="back">Спина</option>
                <option value="stomach">Желудок</option>
                <option value="torso">Торс</option>
                <option value="left-arm">Левая рука</option>
                <option value="right-arm">Правая рука</option>
                <option value="left-leg">Левая нога</option>
                <option value="right-leg">Правая нога</option>
              </select>
            </div>
          `}
          <div class="form-group">
            <label for="issue-name">Название проблемы:</label>
            <input type="text" id="issue-name" value="${currentIssue ? currentIssue.name : ''}" placeholder="Например: боль, онемение, слабость" required>
          </div>
          <div class="form-group">
            <label for="issue-severity">Насколько сильно беспокоит (1-10):</label>
            <input type="range" id="issue-severity" min="1" max="10" value="${currentIssue ? currentIssue.severity : 5}" required>
            <output for="issue-severity" id="severity-output">${currentIssue ? currentIssue.severity : 5}</output>
          </div>
          <div class="form-group">
            <label for="issue-description">Описание (опционально):</label>
            <textarea id="issue-description" rows="3">${currentIssue ? currentIssue.description || '' : ''}</textarea>
          </div>
          <button type="submit" class="btn primary-btn">Сохранить</button>
          ${currentIssue ? '<button type="button" id="delete-issue-btn" class="btn danger-btn">Удалить</button>' : ''}
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the selected value for range input
    const rangeInput = document.getElementById('issue-severity');
    const output = document.getElementById('severity-output');
    rangeInput.addEventListener('input', function() {
      output.textContent = this.value;
    });
    
    // Close modal on X click
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Handle form submission
    document.getElementById('issue-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const issueData = {
        partId: partId || document.getElementById('body-part-select')?.value,
        partName: partName || document.querySelector(`#${document.getElementById('body-part-select')?.value}`)?.dataset.name,
        name: document.getElementById('issue-name').value,
        severity: parseInt(document.getElementById('issue-severity').value),
        description: document.getElementById('issue-description').value,
        timestamp: new Date().toISOString()
      };
      
      this.addOrUpdateIssue(issueData);
      document.body.removeChild(modal);
    });
    
    // Handle delete button if it exists
    const deleteBtn = document.getElementById('delete-issue-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.removeIssue(partId);
        document.body.removeChild(modal);
      });
    }
  }
  
  // Add or update a health issue
  addOrUpdateIssue(issueData) {
    const existingIssueIndex = this.issues.findIndex(issue => issue.partId === issueData.partId);
    
    if (existingIssueIndex >= 0) {
      // Update existing issue
      this.issues[existingIssueIndex] = issueData;
    } else {
      // Add new issue
      this.issues.push(issueData);
    }
    
    // Update visualization
    this.updateBodyVisualization();
    
    // Update localStorage
    localStorage.setItem('healthIssues', JSON.stringify(this.issues));
    
    // Update the days based on health issues
    this.updateRemainingDays();
    
    // Update the issue list
    this.updateIssueList();
  }
  
  // Remove a health issue
  removeIssue(partId) {
    this.issues = this.issues.filter(issue => issue.partId !== partId);
    
    // Update visualization
    this.updateBodyVisualization();
    
    // Update localStorage
    localStorage.setItem('healthIssues', JSON.stringify(this.issues));
    
    // Update the days based on health issues
    this.updateRemainingDays();
    
    // Update the issue list
    this.updateIssueList();
  }
  
  // Update body visualization based on issues
  updateBodyVisualization() {
    // Reset all body parts to default state
    document.querySelectorAll('.body-part').forEach(part => {
      part.style.fill = '#66c2ff';
      part.classList.remove('issue-mild', 'issue-moderate', 'issue-severe');
    });
    
    // Update color for parts with issues
    this.issues.forEach(issue => {
      const part = document.getElementById(issue.partId);
      if (part) {
        // Set color based on severity
        if (issue.severity <= 3) {
          part.classList.add('issue-mild');
          part.style.fill = '#ffff66'; // Yellow for mild issues
        } else if (issue.severity <= 6) {
          part.classList.add('issue-moderate');
          part.style.fill = '#ff9933'; // Orange for moderate issues
        } else {
          part.classList.add('issue-severe');
          part.style.fill = '#ff3333'; // Red for severe issues
        }
      }
    });
  }
  
  // Rotate body to show front/back
  rotateBody() {
    const frontParts = document.querySelectorAll('.body-part:not(.back-part)');
    const backParts = document.querySelectorAll('.back-part');
    
    if (backParts[0].style.display === 'none') {
      // Show back view
      frontParts.forEach(part => {
        if (part.id !== 'left-leg' && part.id !== 'right-leg') {
          part.style.display = 'none';
        }
      });
      backParts.forEach(part => {
        part.style.display = 'block';
      });
      document.getElementById('rotate-body-btn').textContent = 'Показать спереди';
    } else {
      // Show front view
      frontParts.forEach(part => {
        part.style.display = 'block';
      });
      backParts.forEach(part => {
        part.style.display = 'none';
      });
      document.getElementById('rotate-body-btn').textContent = 'Показать сзади';
    }
  }
  
  // Update issue list in the UI
  updateIssueList() {
    const issuesList = document.getElementById('health-issues-list');
    if (!issuesList) return;
    
    issuesList.innerHTML = '';
    
    if (this.issues.length === 0) {
      issuesList.innerHTML = '<li class="no-issues">Проблем со здоровьем не добавлено</li>';
      return;
    }
    
    this.issues.forEach(issue => {
      const issueItem = document.createElement('li');
      issueItem.className = 'issue-item';
      
      // Set color class based on severity
      if (issue.severity <= 3) {
        issueItem.classList.add('severity-mild');
      } else if (issue.severity <= 6) {
        issueItem.classList.add('severity-moderate');
      } else {
        issueItem.classList.add('severity-severe');
      }
      
      issueItem.innerHTML = `
        <div class="issue-header">
          <h3>${issue.partName}: ${issue.name}</h3>
          <span class="severity-badge">Серьезность: ${issue.severity}/10</span>
        </div>
        ${issue.description ? `<p class="issue-description">${issue.description}</p>` : ''}
        <button class="btn-edit-issue" data-part-id="${issue.partId}">Редактировать</button>
      `;
      
      issuesList.appendChild(issueItem);
      
      // Add edit button handler
      issueItem.querySelector('.btn-edit-issue').addEventListener('click', () => {
        this.selectBodyPart(issue.partId, issue.partName);
      });
    });
  }
  
  // Load issues from localStorage
  loadIssues() {
    const savedIssues = localStorage.getItem('healthIssues');
    if (savedIssues) {
      this.issues = JSON.parse(savedIssues);
      this.updateBodyVisualization();
      this.updateIssueList();
    }
  }
  
  // Update remaining days based on health issues
  updateRemainingDays() {
    // Get current remaining days
    let remainingDays = parseInt(localStorage.getItem('remainingDays') || '0');
    
    if (remainingDays > 0) {
      // Calculate average severity of all issues
      if (this.issues.length > 0) {
        const totalSeverity = this.issues.reduce((sum, issue) => sum + issue.severity, 0);
        const avgSeverity = totalSeverity / this.issues.length;
        
        // Reduce days based on severity: more severe = more days reduced
        // On average, a severity of 5 reduces by 1% of total days
        const reductionFactor = avgSeverity * 0.002; // 0.2% per severity point
        const daysReduction = Math.round(remainingDays * reductionFactor);
        
        // Apply reduction but ensure it doesn't go below 1
        remainingDays = Math.max(1, remainingDays - daysReduction);
        
        // Save updated days
        localStorage.setItem('remainingDays', remainingDays.toString());
        
        // Update display
        const daysLeftEl = document.getElementById('days-left');
        if (daysLeftEl) {
          daysLeftEl.textContent = remainingDays.toLocaleString();
        }
      }
    }
  }
}
