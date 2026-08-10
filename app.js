// Configuração do Worker do PDF.js
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let acaoAtual = 'juntar';

function selecionarAcao(acao) {
  acaoAtual = acao;

    // 1. Remove 'active' de todos os cards e abas
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  // 2. Identifica o card pai clicado (mesmo se clicar no ícone ou no texto)
  if (window.event) {
    const cardClicado = window.event.target.closest('.tab-btn');
    if (cardClicado) cardClicado.classList.add('active');
  }
  
  const input = document.getElementById('pdf-input');
  const label = document.getElementById('file-label');
  const separarOptions = document.getElementById('separar-options');
  const workspace = document.getElementById('workspace');
  const toolTitle = document.getElementById('tool-title');

  // 1. Exibe a área de trabalho se ela existir
  if (workspace) {
    workspace.classList.remove('hidden');
  }

  // 2. Controla a exibição das opções de separar
  if (separarOptions) {
    if (acao === 'separar') {
      separarOptions.classList.remove('hidden');
    } else {
      separarOptions.classList.add('hidden');
    }
  }

  // 3. Atualiza títulos e regras do campo de arquivo
  if (input) {
    if (acao === 'juntar') {
      input.multiple = true;
      if (label) label.textContent = 'Selecione 2 ou mais arquivos PDF';
      if (toolTitle) toolTitle.textContent = 'Unir PDFs';
    } else if (acao === 'separar') {
      input.multiple = false;
      if (label) label.textContent = 'Selecione 1 arquivo PDF';
      if (toolTitle) toolTitle.textContent = 'Dividir PDF';
    } else if (acao === 'comprimir') {
      input.multiple = false;
      if (label) label.textContent = 'Selecione 1 arquivo PDF';
      if (toolTitle) toolTitle.textContent = 'Comprimir PDF';
    }
  }
}

// Garante funcionamento tanto com onclick="selecionarAcao(...)" quanto onclick="abrirFerramenta(...)"
const abrirFerramenta = selecionarAcao;

document.getElementById('btn-processar').addEventListener('click', async () => {
  const input = document.getElementById('pdf-input');
  const btn = document.getElementById('btn-processar');
  const status = document.getElementById('status');

  if (!input.files.length) {
    alert('Selecione pelo menos um arquivo PDF.');
    return;
  }

  try {
    btn.disabled = true;
    status.textContent = 'Processando...';

    let resultBytes;
    let fileName = 'resultado.pdf';

    if (acaoAtual === 'juntar') {
      resultBytes = await juntarPDFs(input.files);
      fileName = 'pdf_unificado.pdf';
    } else if (acaoAtual === 'separar') {
      const inicio = parseInt(document.getElementById('page-start').value) || 1;
      const fim = parseInt(document.getElementById('page-end').value);
      resultBytes = await separarPDF(input.files[0], inicio, fim);
      fileName = 'pdf_extraido.pdf';
    } else if (acaoAtual === 'comprimir') {
      resultBytes = await comprimirPDF(input.files[0]);
      fileName = 'pdf_comprimido.pdf';
    }

    downloadPDF(resultBytes, fileName);
    status.textContent = '✅ Concluído com sucesso!';
  } catch (error) {
    console.error(error);
    status.textContent = '❌ Erro ao processar o arquivo.';
  } finally {
    btn.disabled = false;
  }
});

// 1. Unir PDFs
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

// 2. Separar Páginas do PDF
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

// 3. Comprimir PDF
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