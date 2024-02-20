document.addEventListener("DOMContentLoaded", function() {
    // Load tasks from local storage when the DOM content is loaded
    loadTasks();
  
    // Add event listener for the form submission
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      addTask();
    });
  });
  
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');
  
    // Clear existing tasks
    taskList.innerHTML = '';
  
    // Add tasks from local storage
    tasks.forEach(task => {
      addTaskToDOM(task);
    });
  }
  
  function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
  
    if (taskText !== '') {
      if (!isTaskDuplicate(taskText)) {
        addTaskToDOM(taskText);
        saveTask(taskText);
        taskInput.value = '';
      } else {
        showNotification('Task already exists!');
      }
    }
  }
  
  function isTaskDuplicate(taskText) {
    const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return existingTasks.includes(taskText);
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    document.body.appendChild(notification);
    setTimeout(function() {
      notification.remove();
    }, 1500);
  }
  
  function addTaskToDOM(taskText) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
  
    // Create task text span
    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = taskText;
    li.appendChild(taskTextSpan);
  
    // Add delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
      deleteTask(li);
    };
  
    // Add edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function() {
      editTask(li);
    };
  
  
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);
    li.appendChild(buttonContainer);
  
    taskList.appendChild(li);
  }
  
  function saveTask(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  function deleteTask(taskElement) {
    const taskText = taskElement.querySelector('span').textContent;
    const confirmation = confirm(`Are you sure you want to delete the task: "${taskText}"?`);
    if (confirmation) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.filter(task => task !== taskText);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskElement.remove();
      showNotification('Task deleted successfully.');
    }
  }
  
  function editTask(taskElement) {
    const taskTextElement = taskElement.querySelector('span');
    const taskText = taskTextElement.textContent;
    const newText = prompt('Edit task:', taskText);
    if (newText !== null) {
      taskTextElement.textContent = newText;
      updateLocalStorage();
    }
  }
  
  function updateLocalStorage() {
    const tasks = Array.from(document.querySelectorAll('#taskList li span')).map(task => task.textContent);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
