const API = '';
let token = localStorage.getItem('token');

const authSection = document.getElementById('auth-section');
const notesSection = document.getElementById('notes-section');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const noteForm = document.getElementById('note-form');
const notesList = document.getElementById('notes-list');
const logoutBtn = document.getElementById('logout-btn');
const registerMsg = document.getElementById('register-msg');
const loginMsg = document.getElementById('login-msg');

function showAuth() {
  authSection.style.display = '';
  notesSection.style.display = 'none';
}
function showNotes() {
  authSection.style.display = 'none';
  notesSection.style.display = '';
}

if (token) {
  showNotes();
  fetchNotes();
} else {
  showAuth();
}

registerForm.onsubmit = async (e) => {
  e.preventDefault();
  registerMsg.textContent = '';
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  try {
    const res = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      registerMsg.style.color = 'green';
      registerMsg.textContent = 'Registrado com sucesso! Faça login.';
      registerForm.reset();
    } else {
      registerMsg.style.color = '#e74c3c';
      registerMsg.textContent = data.message || 'Erro ao registrar.';
    }
  } catch (err) {
    registerMsg.textContent = 'Erro de conexão.';
  }
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  loginMsg.textContent = '';
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      showNotes();
      fetchNotes();
      loginForm.reset();
    } else {
      loginMsg.textContent = data.message || 'Usuário ou senha inválidos.';
    }
  } catch (err) {
    loginMsg.textContent = 'Erro de conexão.';
  }
};

logoutBtn.onclick = () => {
  token = null;
  localStorage.removeItem('token');
  showAuth();
};

noteForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  try {
    const res = await fetch(API + '/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      noteForm.reset();
      fetchNotes();
    }
  } catch (err) {}
};

async function fetchNotes() {
  notesList.innerHTML = '<li>Carregando...</li>';
  try {
    const res = await fetch(API + '/notes', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const notes = await res.json();
    if (Array.isArray(notes)) {
      notesList.innerHTML = '';
      notes.reverse().forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${note.title}</strong><br>${note.content || ''}
          <button class="delete-btn" onclick="deleteNote(${note.id})">Excluir</button>`;
        notesList.appendChild(li);
      });
      if (notes.length === 0) notesList.innerHTML = '<li>Nenhuma nota encontrada.</li>';
    } else {
      notesList.innerHTML = '<li>Erro ao carregar notas.</li>';
    }
  } catch (err) {
    notesList.innerHTML = '<li>Erro de conexão.</li>';
  }
}

window.deleteNote = async function(id) {
  if (!confirm('Excluir esta nota?')) return;
  try {
    await fetch(API + '/notes/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    fetchNotes();
  } catch (err) {}
}; 