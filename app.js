if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let acaoAtual = 'juntar';
let arquivosSelecionados = [];

// Elementos da Interface
const dropZone = document.getElementById('drop-zone');
const pdfInput = document.getElementById('pdf-input');
const fileLabel = document.getElementById('file-label');
const fileList = document.getElementById('file-list');
const separarOptions = document.getElementById('separar-options');
const btnProcessar = document.getElementById('btn-processar');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const statusBanner = document.getElementById('status');

// 1. Troca de Ferramenta (Aba)
function selecionarAcao(acao, btn) {
  acaoAtual = acao;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  limparArquivos();

  if (separarOptions) {
    separarOptions.classList.toggle('hidden', acao !== 'separar');
  }

  if (acao === 'juntar') {
    pdfInput.multiple = true;
    fileLabel.textContent = 'Arraste seus PDFs para juntar';
  } else {
    pdfInput.multiple = false;
    fileLabel.textContent = 'Arraste 1 arquivo PDF';
  }
}

// 2. Manipulação do Drag and Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    adicionarArquivos(e.dataTransfer.files);
  }
});

pdfInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    adicionarArquivos(e.target.files);
  }
});

// 3. Gerenciamento de Arquivos Selecionados
function adicionarArquivos(files) {
  const novos = Array.from(files).filter(f => f.type === 'application/pdf');

  if (acaoAtual === 'juntar') {
    arquivosSelecionados = [...arquivosSelecionados, ...novos];
  } else {
    arquivosSelecionados = novos.slice(0, 1);
  }

  atualizarListaArquivos();
}

function removerArquivo(index) {
  arquivosSelecionados.splice(index, 1);
  atualizarListaArquivos();
}

function limparArquivos() {
  arquivosSelecionados = [];
  pdfInput.value = '';
  atualizarListaArquivos();
  ocultarStatus();
}

function atualizarListaArquivos() {
  if (!arquivosSelecionados.length) {
    fileList.classList.add('hidden');
    dropZone.classList.remove('hidden');
    return;
  }

  fileList.innerHTML = '';
  arquivosSelecionados.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-info">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>
          <div class="file-name" title="${file.name}">${file.name}</div>
          <div class="file-size">${formatarTamanho(file.size)}</div>
        </div>
      </div>
      <button class="remove-file-btn" onclick="removerArquivo(${index})" title="Remover">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    fileList.appendChild(item);
  });

  fileList.classList.remove('hidden');
}

function formatarTamanho(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 4. Processamento Principal
btnProcessar.addEventListener('click', async () => {
  if (!arquivosSelecionados.length) {
    exibirStatus('Selecione pelo menos um arquivo PDF.', 'error');
    return;
  }

  try {
    iniciarCarregamento();

    let resultBytes;
    let fileName = 'resultado.pdf';

    if (acaoAtual === 'juntar') {
      if (arquivosSelecionados.length < 2) {
        exibirStatus('Selecione pelo menos 2 arquivos para juntar.', 'error');
        pararCarregamento();
        return;
      }
      resultBytes = await juntarPDFs(arquivosSelecionados);
      fileName = 'pdf_unificado.pdf';
    } else if (acaoAtual === 'separar') {
      const inicio = parseInt(document.getElementById('page-start').value) || 1;
      const fim = parseInt(document.getElementById('page-end').value);
      resultBytes = await separarPDF(arquivosSelecionados[0], inicio, fim);
      fileName = 'pdf_extraido.pdf';
    } else if (acaoAtual === 'comprimir') {
      resultBytes = await comprimirPDF(arquivosSelecionados[0]);
      fileName = 'pdf_comprimido.pdf';
    }

    downloadPDF(resultBytes, fileName);
    exibirStatus('✅ Concluído com sucesso! Download iniciado.', 'success');
  } catch (error) {
    console.error(error);
    exibirStatus('❌ Erro ao processar o arquivo PDF.', 'error');
  } finally {
    pararCarregamento();
  }
});

// Funções de Apoio ao PDF (PDFLib / PDF.js)
async function juntarPDFs(files) {
  const mergedPdf = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));
  }
  return await mergedPdf.save();
}

async function separarPDF(file, inicio, fim) {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFLib.PDFDocument.load(bytes);
  const totalPages = srcDoc.getPageCount();
  
  const start = Math.max(0, inicio - 1);
  const end = fim ? Math.min(totalPages, fim) : totalPages;

  const newDoc = await PDFLib.PDFDocument.create();
  const range = Array.from({ length: end - start }, (_, i) => start + i);
  const copiedPages = await newDoc.copyPages(srcDoc, range);
  copiedPages.forEach(p => newDoc.addPage(p));

  return await newDoc.save();
}

async function comprimirPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const newPdf = await PDFLib.PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', 0.5);
    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
    const image = await newPdf.embedJpg(imgBytes);

    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  return await newPdf.save();
}

function downloadPDF(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Utilitários de UI
function iniciarCarregamento() {
  btnProcessar.disabled = true;
  btnSpinner.classList.remove('hidden');
  btnText.textContent = 'Processando...';
  ocultarStatus();
}

function pararCarregamento() {
  btnProcessar.disabled = false;
  btnSpinner.classList.add('hidden');
  btnText.textContent = 'Processar e Baixar PDF';
}

function exibirStatus(mensagem, tipo) {
  statusBanner.textContent = mensagem;
  statusBanner.className = `status-banner ${tipo}`;
}

function ocultarStatus() {
  statusBanner.className = 'status-banner hidden';
}

// Registra o Service Worker para suporte Offline e Instalação PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Service Worker ativo:', reg.scope))
      .catch(err => console.error('Erro no PWA SW:', err));
  });
}