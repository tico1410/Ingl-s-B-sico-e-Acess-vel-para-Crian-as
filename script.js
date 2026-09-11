let ptFemaleVoice = null;
let enFemaleVoice = null;
let lastSpokenText = "";
let isSlowSpeed = false;

function loadVoices() {
  const voices = window.speechSynthesis.getVoices();

  ptFemaleVoice = voices.find(v => 
    v.lang.includes('pt') && 
    (v.name.includes('Luciana') || v.name.includes('Maria') || v.name.includes('Francisca') || v.name.includes('Google português do Brasil') || v.name.includes('Female'))
  ) || voices.find(v => v.lang.includes('pt'));

  enFemaleVoice = voices.find(v => 
    v.lang.includes('en') && 
    (v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Google US English') || v.name.includes('Female'))
  ) || voices.find(v => v.lang.includes('en'));
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  if (lastSpokenText === text) {
    isSlowSpeed = !isSlowSpeed;
  } else {
    lastSpokenText = text;
    isSlowSpeed = false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  const isPortuguese = /[áéíóúãõç]/i.test(text) || 
                       /correto|incorreto|opção|qual|como|ouvir|pergunta|resposta|meu|nome|olá|bom dia|prazer/i.test(text);

  if (isPortuguese) {
    utterance.lang = 'pt-BR';
    if (ptFemaleVoice) utterance.voice = ptFemaleVoice;
  } else {
    utterance.lang = 'en-US';
    if (enFemaleVoice) utterance.voice = enFemaleVoice;
  }

  utterance.pitch = 1.1;
  utterance.rate = isSlowSpeed ? 0.5 : 0.85; 
  
  window.speechSynthesis.speak(utterance);
}

function toggleContrast() {
  document.body.classList.toggle('high-contrast');
  const btn = document.getElementById('btn-contrast');
  btn.innerText = `Contraste: ${document.body.classList.contains('high-contrast') ? 'Alto' : 'Normal'}`;
}

// Adicionar no início ou junto às funções de acessibilidade:
// Garante que a página inicie no tamanho normal (nível 0)
let currentFontLevel = 0;

function changeFontSize() {
  const body = document.body;
  const btn = document.getElementById('btn-font-size');

  if (!btn) return;

  // Remove o nível de aumento anterior
  if (currentFontLevel > 0) {
    body.classList.remove(`font-size-${currentFontLevel}`);
  }

  // Avança na sequência: 0 (Normal) ➔ 1 (+1) ➔ 2 (+2) ➔ 3 (+3) ➔ 4 (+4) ➔ 0 (Normal)
  currentFontLevel = (currentFontLevel + 1) % 5;

  // Aplica o novo tamanho ou retorna ao padrão
  if (currentFontLevel > 0) {
    body.classList.add(`font-size-${currentFontLevel}`);
    btn.innerText = `Fonte: +${currentFontLevel}`;
  } else {
    btn.innerText = 'Fonte: Normal';
  }
}

function toggleSaturation() {
  document.documentElement.classList.toggle('high-saturation');
  document.body.classList.toggle('high-saturation');
  const btn = document.getElementById('btn-saturation');
  btn.innerText = `Saturação: ${document.body.classList.contains('high-saturation') ? 'Alta' : 'Normal'}`;
}

function toggleFont() {
  document.body.classList.toggle('accessible-font');
  const btn = document.getElementById('btn-font');
  btn.innerText = `Fonte: ${document.body.classList.contains('accessible-font') ? 'Acessível' : 'Padrão'}`;
}

function toggleSpacing() {
  document.body.classList.toggle('expanded-spacing');
  const btn = document.getElementById('btn-spacing');
  btn.innerText = `Espaçamento: ${document.body.classList.contains('expanded-spacing') ? 'Ampliado' : 'Normal'}`;
}

function toggleCursor() {
  document.body.classList.toggle('large-cursor');
  const btn = document.getElementById('btn-cursor');
  btn.innerText = `Cursor: ${document.body.classList.contains('large-cursor') ? 'Grande' : 'Normal'}`;
}

function toggleHighlight() {
  document.body.classList.toggle('highlight-clickable');
  const btn = document.getElementById('btn-highlight');
  btn.innerText = `Destaque Clicável: ${document.body.classList.contains('highlight-clickable') ? 'ON' : 'OFF'}`;
}
// Funções de Arrastar e Soltar (Drag and Drop)

function dragBlock(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function removeHighlight(event) {
  event.currentTarget.classList.remove('drag-over');
}

function dropBlock(event) {
  event.preventDefault();
  const dropZone = event.currentTarget;
  dropZone.classList.remove('drag-over');

  const blockId = event.dataTransfer.getData("text/plain");
  const draggedBlock = document.getElementById(blockId);
  if (!draggedBlock) return;

  const activityCard = dropZone.closest('.drag-activity');
  const correctAnswer = activityCard.getAttribute('data-correct');
  const selectedText = draggedBlock.innerText.trim();
  const feedbackElement = activityCard.querySelector('.drag-feedback');

  if (selectedText.toLowerCase() === correctAnswer.toLowerCase()) {
    dropZone.innerText = selectedText;
    dropZone.style.borderStyle = "solid";
    
    const msg = "Correto! Continue assim!";
    feedbackElement.innerText = "✅ " + msg;
    feedbackElement.style.color = document.body.classList.contains('high-contrast') ? '#00ff00' : 'green';
    
    speakText(msg);
  } else {
    const msg = "Está incorreto, mas tente de novo!";
    feedbackElement.innerText = "❌ " + msg;
    feedbackElement.style.color = document.body.classList.contains('high-contrast') ? '#ff5555' : 'red';
    
    speakText(msg);
  }
}

// Função para verificar respostas dos quizzes e emitir leitura por voz
function checkQuizAnswer(buttonElement, isCorrect, message) {
  const quizCard = buttonElement.closest('.quiz-activity');
  const feedbackElement = quizCard.querySelector('.quiz-feedback');
  
  if (isCorrect) {
    feedbackElement.innerText = "✅ " + message;
    feedbackElement.style.color = document.body.classList.contains('high-contrast') ? '#00ff00' : 'green';
  } else {
    feedbackElement.innerText = "❌ " + message;
    feedbackElement.style.color = document.body.classList.contains('high-contrast') ? '#ff5555' : 'red';
  }
  
  // Utiliza o mesmo leitor de voz do site (com suporte a velocidade reduzida em cliques duplos)
  speakText(message);
}

// Função para Mostrar/Esconder o Menu Lateral de Acessibilidade
function toggleAccessibilityMenu() {
  const menu = document.getElementById('accessibility-toolbar');
  menu.classList.toggle('menu-hidden');
}
