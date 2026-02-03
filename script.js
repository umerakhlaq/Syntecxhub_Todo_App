document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let todos = JSON.parse(localStorage.getItem('syntecxhub-todos')) || [];
    let currentFilter = 'all';

    // Initial Render
    renderTodos();

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        todos.push(newTodo);
        saveTodos();
        renderTodos();
        todoInput.value = '';
        todoInput.focus();
    }

    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    }

    function deleteTodo(id) {
        const todoElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        if (todoElement) {
            todoElement.style.transform = 'translateX(50px)';
            todoElement.style.opacity = '0';
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== id);
                saveTodos();
                renderTodos();
            }, 300);
        }
    }

    function startEdit(id, li) {
        const todo = todos.find(t => t.id === id);
        const textSpan = li.querySelector('.task-text');
        const originalText = textSpan.textContent;

        li.classList.add('editing');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = originalText;

        // Insert input after check button
        li.insertBefore(input, textSpan);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText !== '' && newText !== originalText) {
                todos = todos.map(t => t.id === id ? { ...t, text: newText } : t);
                saveTodos();
            }
            renderTodos();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }

    function saveTodos() {
        localStorage.setItem('syntecxhub-todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';

        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'pending') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);

            li.innerHTML = `
                <button class="check-btn">
                    <i class="fas fa-check"></i>
                </button>
                <span class="task-text">${todo.text}</span>
                <div class="action-btns">
                    <button class="edit-btn" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" title="Delete Task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            // Event Listeners for actions
            li.querySelector('.check-btn').addEventListener('click', () => toggleTodo(todo.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));
            li.querySelector('.edit-btn').addEventListener('click', () => startEdit(todo.id, li));

            todoList.appendChild(li);
        });

        // Update stats
        const left = todos.filter(t => !t.completed).length;
        itemsLeft.textContent = `${left} item${left !== 1 ? 's' : ''} left`;
    }
});
