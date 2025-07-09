const API = '';
let token = localStorage.getItem('token');

// Verificar se o usuário está logado
if (!token) {
  window.location.href = 'index.html';
}

const noteForm = document.getElementById('note-form');
const backBtn = document.getElementById('back-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const noteAttachmentInput = document.getElementById('note-attachment');
const selectedFilesDiv = document.getElementById('selected-files');
const formMsg = document.getElementById('form-msg');
const attachmentsList = document.getElementById('attachments-list');

let selectedFiles = [];

// Botão voltar
backBtn.onclick = () => {
  window.location.href = '/';
};

// Gerenciar seleção de arquivos
noteAttachmentInput.onchange = () => {
  selectedFiles = Array.from(noteAttachmentInput.files);
  displaySelectedFiles();
};

function displaySelectedFiles() {
  selectedFilesDiv.innerHTML = '';
  
  if (selectedFiles.length === 0) {
    selectedFilesDiv.innerHTML = '<span style="color: #666; font-style: italic;">Nenhum arquivo selecionado</span>';
    return;
  }
  
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${formatFileSize(file.size)})`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => removeFile(index);
    
    fileItem.appendChild(fileName);
    fileItem.appendChild(removeBtn);
    selectedFilesDiv.appendChild(fileItem);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  displaySelectedFiles();
  
  // Atualizar o input file
  const dt = new DataTransfer();
  selectedFiles.forEach(file => dt.items.add(file));
  noteAttachmentInput.files = dt.files;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Criar nota
noteForm.onsubmit = async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  
  if (!title.trim()) {
    formMsg.style.color = '#e74c3c';
    formMsg.textContent = 'Título é obrigatório';
    return;
  }
  
  try {
    // Criar a nota
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
      
      // Se houver arquivos, fazer upload
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          
          try {
            await fetch(API + `/notes/${note.id}/attachments`, {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + token },
              body: formData
            });
          } catch (err) {
            console.error('Erro ao fazer upload do arquivo:', err);
          }
        }
      }
      
      formMsg.style.color = '#27ae60';
      formMsg.textContent = 'Nota criada com sucesso!';
      
      // Limpar formulário
      noteForm.reset();
      selectedFiles = [];
      displaySelectedFiles();
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } else {
      const data = await res.json();
      formMsg.style.color = '#e74c3c';
      formMsg.textContent = data.message || 'Erro ao criar nota';
    }
  } catch (err) {
    formMsg.style.color = '#e74c3c';
    formMsg.textContent = 'Erro de conexão';
  }
};

// Exportar para PDF
exportPdfBtn.onclick = () => {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  
  if (!title.trim() && !content.trim()) {
    alert('Adicione pelo menos um título ou conteúdo para exportar');
    return;
  }
  
  // Importar jsPDF dinamicamente
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    .then(() => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      let yPosition = 20;
      
      // Adicionar título
      if (title.trim()) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(title, 10, yPosition);
        yPosition += 10;
      }
      
      // Adicionar data
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Criado em: ' + new Date().toLocaleString('pt-BR'), 10, yPosition);
      yPosition += 10;
      
      // Adicionar conteúdo
      if (content.trim()) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 10, yPosition);
      }
      
      // Salvar PDF
      doc.save('nota.pdf');
    })
    .catch(err => {
      console.error('Erro ao carregar jsPDF:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    });
};

// Inicializar
displaySelectedFiles(); 