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
const sidebarNotesList = document.getElementById('sidebar-notes-list');
const attachmentsList = document.getElementById('attachments-list');
const noteAttachmentInput = document.getElementById('note-attachment');
import jsPDF from 'jspdf';

let allNotes = [];
let selectedNoteId = null;
let selectedNoteIds = [];

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
    // Cria a nota
    const res = await fetch(API + '/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      const note = await res.json();
      // Se houver arquivos, faz upload
      if (noteAttachmentInput.files.length > 0) {
        for (let i = 0; i < noteAttachmentInput.files.length; i++) {
          const file = noteAttachmentInput.files[i];
          const formData = new FormData();
          formData.append('file', file);
          await fetch(API + `/notes/${note.id}/attachments`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
          });
        }
      }
      noteForm.reset();
      fetchNotes();
    }
  } catch (err) {}
};

async function fetchNotes() {
  notesList.innerHTML = '<li>Carregando...</li>';
  sidebarNotesList.innerHTML = '<li>Carregando...</li>';
  try {
    const res = await fetch(API + '/notes', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const notes = await res.json();
    if (Array.isArray(notes)) {
      allNotes = notes.reverse();
      renderNotesList();
      renderSidebarNotes();
      if (allNotes.length === 0) {
        notesList.innerHTML = '<li>Nenhuma nota encontrada.</li>';
        sidebarNotesList.innerHTML = '<li>Nenhuma nota.</li>';
      }
    } else {
      notesList.innerHTML = '<li>Erro ao carregar notas.</li>';
      sidebarNotesList.innerHTML = '<li>Erro ao carregar notas.</li>';
    }
  } catch (err) {
    notesList.innerHTML = '<li>Erro de conexão.</li>';
    sidebarNotesList.innerHTML = '<li>Erro de conexão.</li>';
  }
}

async function fetchAttachments(noteId) {
  attachmentsList.innerHTML = 'Carregando anexos...';
  try {
    const res = await fetch(API + `/notes/${noteId}/attachments`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const attachments = await res.json();
    if (Array.isArray(attachments) && attachments.length > 0) {
      attachmentsList.innerHTML = '<b>Anexos:</b><ul>' + attachments.map(att =>
        `<li><a href="${API}/notes/attachments/${att.id}" target="_blank">${att.filename}</a></li>`
      ).join('') + '</ul>';
    } else {
      attachmentsList.innerHTML = '<i>Sem anexos</i>';
    }
  } catch (err) {
    attachmentsList.innerHTML = '<i>Erro ao carregar anexos</i>';
  }
}

function renderSidebarNotes() {
  sidebarNotesList.innerHTML = '';
  allNotes.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note.title + ' - ' + formatDate(note.created_at);
    li.title = note.title;
    li.className = (note.id === selectedNoteId) ? 'selected' : '';
    // Checkbox para seleção múltipla
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '6px';
    checkbox.checked = selectedNoteIds.includes(note.id);
    checkbox.onclick = (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        if (!selectedNoteIds.includes(note.id)) selectedNoteIds.push(note.id);
      } else {
        selectedNoteIds = selectedNoteIds.filter(id => id !== note.id);
      }
    };
    li.prepend(checkbox);
    li.onclick = () => selectNote(note.id);
    sidebarNotesList.appendChild(li);
  });
}

function renderNotesList() {
  notesList.innerHTML = '';
  if (selectedNoteId) {
    const note = allNotes.find(n => n.id === selectedNoteId);
    if (note) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${note.title}</strong><br>${note.content || ''}<br><small>Criada em: ${formatDate(note.created_at)}</small>
        <button class="delete-btn" onclick="deleteNote(${note.id})">Excluir</button>`;
      notesList.appendChild(li);
      fetchAttachments(note.id);
    }
  } else {
    allNotes.forEach(note => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${note.title}</strong><br>${note.content || ''}<br><small>Criada em: ${formatDate(note.created_at)}</small>
        <button class="delete-btn" onclick="deleteNote(${note.id})">Excluir</button>`;
      notesList.appendChild(li);
    });
    attachmentsList.innerHTML = '';
  }
}

function selectNote(id) {
  selectedNoteId = id;
  renderSidebarNotes();
  renderNotesList();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
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

const exportPdfBtn = document.getElementById('export-pdf-btn');
exportPdfBtn.onclick = () => {
  const notesToExport = allNotes.filter(n => selectedNoteIds.includes(n.id) || (selectedNoteIds.length === 0 && n.id === selectedNoteId));
  if (notesToExport.length === 0) {
    alert('Selecione pelo menos uma nota para exportar.');
    return;
  }
  const doc = new jsPDF();
  notesToExport.forEach((note, idx) => {
    if (idx > 0) doc.addPage();
    doc.setFontSize(16);
    doc.text(note.title, 10, 20);
    doc.setFontSize(11);
    doc.text('Criada em: ' + formatDate(note.created_at), 10, 30);
    doc.setFontSize(12);
    doc.text(note.content || '', 10, 40, { maxWidth: 180 });
  });
  doc.save('notas.pdf');
}; 