document.addEventListener("DOMContentLoaded", function() {
  const taskForm = document.getElementById('taskForm');
  taskForm.addEventListener('submit', function(event) {
      event.preventDefault(); 
      addTask();
  });

  // Open the IndexedDB database
  const request = window.indexedDB.open('tasksDB', 1);

  request.onerror = function(event) {
      console.error("Database error: " + event.target.errorCode);
  };

  request.onsuccess = function(event) {
      db = event.target.result;
      loadTasks(); // Load tasks only after the database connection is successful
  };

  request.onupgradeneeded = function(event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('taskText', 'taskText', { unique: true });
  };
});

// Function to load tasks from IndexedDB
function loadTasks() {
  const transaction = db.transaction(['tasks'], 'readonly');
  const objectStore = transaction.objectStore('tasks');
  const request = objectStore.getAll();

  request.onsuccess = function(event) {
      const tasks = event.target.result;
      tasks.forEach(task => {
          addTaskToDOM(task.taskText, task.id);
      });
  };
}




function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    isTaskDuplicate(taskText, function(isDuplicate) {
      if (!isDuplicate) {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.add({ taskText: taskText });

        request.onsuccess = function(event) {
          addTaskToDOM(taskText, event.target.result);
        };

        transaction.oncomplete = function() {
          taskInput.value = '';
        };
      } else {
        showNotification('Task already exists!');
      }
    });
  }
}

function isTaskDuplicate(taskText, callback) {
  const transaction = db.transaction(['tasks'], 'readonly');
  const objectStore = transaction.objectStore('tasks');
  const index = objectStore.index('taskText');
  const request = index.get(taskText);

  request.onsuccess = function(event) {
    callback(!!request.result);
  };
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

function addTaskToDOM(taskText, id) {
  const taskList = document.getElementById('taskList');
  const li = document.createElement('li');
  li.dataset.taskId = id;

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

function deleteTask(taskElement) {
  const taskId = parseInt(taskElement.dataset.taskId);
  const taskText = taskElement.querySelector('span').textContent;
  const confirmation = confirm(`Are you sure you want to delete the task: "${taskText}"?`);
  if (confirmation) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    const request = objectStore.delete(taskId);

    request.onsuccess = function() {
      taskElement.remove();
      showNotification('Task deleted successfully.');
    };
  }
}

function editTask(taskElement) {
  const taskId = parseInt(taskElement.dataset.taskId);
  const taskTextElement = taskElement.querySelector('span');
  const taskText = taskTextElement.textContent;
  const newText = prompt('Edit task:', taskText);
  if (newText !== null) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    const request = objectStore.get(taskId);

    request.onsuccess = function(event) {
      const data = event.target.result;
      data.taskText = newText;
      const updateRequest = objectStore.put(data);

      updateRequest.onsuccess = function() {
        taskTextElement.textContent = newText;
        showNotification('Task updated successfully.');
      };
    };
  }
}
