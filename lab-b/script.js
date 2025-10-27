// Inicjalizacja zmiennych
let tasks = [];
let editingTaskId = null;

// Elementy DOM
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const errorMsg = document.getElementById('errorMsg');

// Ładowanie zadań z Local Storage przy starcie
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
});

// Dodawanie zadania
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Wyszukiwanie
searchInput.addEventListener('input', () => {
    renderTasks();
});

function addTask() {
    const taskText = taskInput.value.trim();
    const taskDeadline = taskDate.value;
    
    // Walidacja
    if (!validateTask(taskText, taskDeadline)) {
        return;
    }
    
    // Tworzenie nowego zadania
    const newTask = {
        id: Date.now(),
        text: taskText,
        deadline: taskDeadline,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    
    // Czyszczenie pól
    taskInput.value = '';
    taskDate.value = '';
    errorMsg.style.display = 'none';
}

function validateTask(text, deadline) {
    errorMsg.style.display = 'none';
    
    // Sprawdzenie długości
    if (text.length < 3) {
        showError('Zadanie musi mieć co najmniej 3 znaki');
        return false;
    }
    
    if (text.length > 255) {
        showError('Zadanie nie może mieć więcej niż 255 znaków');
        return false;
    }
    
    // Sprawdzenie daty
    if (deadline) {
        const selectedDate = new Date(deadline);
        const now = new Date();
        
        if (selectedDate <= now) {
            showError('Data musi być w przyszłości');
            return false;
        }
    }
    
    return true;
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function renderTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Filtrowanie zadań
    let filteredTasks = tasks;
    if (searchTerm.length >= 2) {
        filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Czyszczenie listy
    taskList.innerHTML = '';
    
    // Wyświetlanie pustego stanu
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>${searchTerm.length >= 2 ? 'Nie znaleziono zadań' : 'Brak zadań. Dodaj swoje pierwsze zadanie poniżej!'}</p>
            </div>
        `;
        return;
    }
    
    // Renderowanie zadań
    filteredTasks.forEach(task => {
        const taskItem = createTaskElement(task, searchTerm);
        taskList.appendChild(taskItem);
    });
}

function createTaskElement(task, searchTerm) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.taskId = task.id;
    
    // Wyróżnienie wyszukiwanej frazy
    let displayText = escapeHtml(task.text);
    if (searchTerm.length >= 2) {
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        displayText = displayText.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Formatowanie daty - POPRAWKA: sprawdzamy czy deadline istnieje i nie jest pusty
    let dateDisplay = '';
    if (task.deadline && task.deadline.trim() !== '') {
        const date = new Date(task.deadline);
        dateDisplay = `<div class="task-date">📅 ${formatDate(date)}</div>`;
    }
    
    div.innerHTML = `
        <div class="task-content">
            <div class="task-text">${displayText}</div>
            ${dateDisplay}
        </div>
        <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Usuń</button>
    `;
    
    // Obsługa kliknięcia dla edycji
    const taskContent = div.querySelector('.task-content');
    taskContent.addEventListener('click', () => startEditing(task, div));
    
    return div;
}

function startEditing(task, element) {
    if (editingTaskId !== null) return;
    
    editingTaskId = task.id;
    const taskContent = element.querySelector('.task-content');
    
    // Tworzenie formularza edycji z dwoma polami
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'task-input';
    textInput.value = task.text;
    
    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.className = 'task-date-input';
    dateInput.value = task.deadline || '';
    
    editForm.appendChild(textInput);
    editForm.appendChild(dateInput);
    
    taskContent.innerHTML = '';
    taskContent.appendChild(editForm);
    textInput.focus();
    textInput.select();
    
    // Zapisywanie przy kliknięciu poza pole
    const saveEdit = (e) => {
        if (e && element.contains(e.target)) return;
        
        const newText = textInput.value.trim();
        const newDeadline = dateInput.value;
        
        // Walidacja tekstu
        if (newText.length < 3 || newText.length > 255) {
            showError('Zadanie musi mieć od 3 do 255 znaków');
            editingTaskId = null;
            renderTasks();
            document.removeEventListener('click', saveEdit);
            return;
        }
        
        // Walidacja daty
        if (newDeadline) {
            const selectedDate = new Date(newDeadline);
            const now = new Date();
            
            if (selectedDate <= now) {
                showError('Data musi być w przyszłości');
                editingTaskId = null;
                renderTasks();
                document.removeEventListener('click', saveEdit);
                return;
            }
        }
        
        // Zapisanie zmian
        task.text = newText;
        task.deadline = newDeadline;
        saveTasksToStorage();
        editingTaskId = null;
        renderTasks();
        document.removeEventListener('click', saveEdit);
    };
    
    // Zapisywanie po Enter (tylko w polu tekstowym)
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
    
    // Anulowanie po Escape
    const cancelEdit = (e) => {
        if (e.key === 'Escape') {
            editingTaskId = null;
            renderTasks();
            document.removeEventListener('click', saveEdit);
        }
    };
    
    textInput.addEventListener('keydown', cancelEdit);
    dateInput.addEventListener('keydown', cancelEdit);
    
    // Zapisywanie przy kliknięciu poza element
    setTimeout(() => {
        document.addEventListener('click', saveEdit);
    }, 0);
}

function deleteTask(taskId) {
    if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderTasks();
    }
}

function saveTasksToStorage() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Błąd zapisu do Local Storage:', e);
    }
}

function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem('todoTasks');
        if (stored) {
            tasks = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Błąd odczytu z Local Storage:', e);
        tasks = [];
    }
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('pl-PL', options);
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}