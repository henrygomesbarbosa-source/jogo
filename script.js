// BANCO DE PERGUNTAS ELABORADO COM BASE NO TRABALHO ENVIADO
const questions = [
  {
    category: "Esportes de Precisão",
    question: "De acordo com o texto, qual é o objetivo principal dos esportes de precisão, como o boliche e a bocha?",
    options: [
      "Correr a maior distância no menor tempo",
      "Acertar um alvo ou colocar um objeto o mais próximo possível de um ponto",
      "Invadir a quadra adversária para fazer gols",
      "Passar a bola por cima de uma rede usando raquetes"
    ],
    correct: 1 //[cite: 3]
  },
  {
    category: "Esportes de Invasão",
    question: "Quais das modalidades abaixo são exemplos de esportes de invasão citados no trabalho?",
    options: [
      "Vôlei, Badminton e Bocha",
      "Corridas, Saltos e Arremessos",
      "Futebol, Basquete e Handebol",
      "Boliche, Natação e Ciclismo"
    ],
    correct: 2 //[cite: 3]
  },
  {
    category: "Esportes de Rede e Parede",
    question: "No voleibol, quantos toques a equipe pode dar na bola para devolvê-la ao lado adversário?",
    options: [
      "Até 5 toques",
      "Apenas 1 toque",
      "Quantos toques quiser",
      "Até 3 toques (sem contar o bloqueio)"
    ],
    correct: 3 //[cite: 6]
  },
  {
    category: "Esportes de Marca",
    question: "Como é medido o desempenho nos esportes de marca, como o atletismo?",
    options: [
      "Por unidades objetivas como tempo, distância ou altura",
      "Pela quantidade de gols no tempo regulamentar",
      "Apenas pelo número de juízes que aprovam a jogada",
      "Pelo número de pinos derrubados na pista"
    ],
    correct: 0 //[cite: 3, 8]
  },
  {
    category: "Atitude e Valores",
    question: "O que o trabalho destaca como essencial para o trabalho em equipe e espírito esportivo?",
    options: [
      "Vencer a qualquer custo, mesmo desrespeitando regras",
      "Comunicação, cooperação, respeito e empatia",
      "Deixar apenas o jogador mais habilidoso jogar",
      "Discutir com os árbitros em todas as faltas"
    ],
    correct: 1 //[cite: 13, 14]
  },
  {
    category: "Benefícios do Esporte",
    question: "Qual destes é um benefício físico da prática regular de esportes?",
    options: [
      "Melhora do condicionamento e coordenação motora",
      "Aumento do cansaço sem melhorias musculares",
      "Perda imediata do equilíbrio corporal",
      "Redução da capacidade respiratória"
    ],
    correct: 0 //[cite: 14]
  }
];

// ESTADO DO JOGO
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let correctCount = 0;
let targetInterval = null;

// REFERÊNCIAS DO DOM
const screenStart = document.getElementById("screen-start");
const screenTarget = document.getElementById("screen-target");
const screenQuiz = document.getElementById("screen-quiz");
const screenEnd = document.getElementById("screen-end");

const btnStart = document.getElementById("btn-start");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");

const targetBox = document.getElementById("shooting-target");
const targetGallery = document.querySelector(".shooting-gallery");

const livesDisplay = document.getElementById("lives-display");
const scoreDisplay = document.getElementById("score-display");
const progressBar = document.getElementById("progress-bar");

const questionBadge = document.getElementById("question-badge");
const categoryBadge = document.getElementById("category-badge");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackMessage = document.getElementById("feedback-message");

const finalScore = document.getElementById("final-score");
const accuracyText = document.getElementById("accuracy-text");
const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const endIcon = document.getElementById("end-icon");

// EVENTOS DE CLIQUE
btnStart.addEventListener("click", startGame);
btnNext.addEventListener("click", prepareNextTarget);
btnRestart.addEventListener("click", startGame);
targetBox.addEventListener("click", hitTarget);

// SISTEMA DE SOM SINTETIZADO (Web Audio API)
function playAudio(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hit') { // Som de tiro/acerto no alvo
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.fadeOut(ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'correct') { // Som de resposta certa
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      gain.gain.fadeOut(ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') { // Som de erro
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
      gain.gain.fadeOut(ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
}

// INICIAR O JOGO
function startGame() {
  currentQuestionIndex = 0;
  score = 0;
  lives = 3;
  correctCount = 0;

  updateHUD();
  switchScreen(screenTarget);
  startMovingTarget();
}

// TROCA GERENCIADA DE TELAS
function switchScreen(activeScreen) {
  [screenStart, screenTarget, screenQuiz, screenEnd].forEach(screen => {
    screen.classList.remove("active");
  });
  activeScreen.classList.add("active");
}

// MOVIMENTAÇÃO DINÂMICA DO ALVO
function startMovingTarget() {
  moveTarget();
  if (targetInterval) clearInterval(targetInterval);
  
  // O alvo muda de lugar a cada 1.2 segundos
  targetInterval = setInterval(moveTarget, 1200);
}

function moveTarget() {
  const galleryWidth = targetGallery.clientWidth - 110;
  const galleryHeight = targetGallery.clientHeight - 110;

  const randomX = Math.max(10, Math.floor(Math.random() * galleryWidth));
  const randomY = Math.max(10, Math.floor(Math.random() * galleryHeight));

  targetBox.style.left = `${randomX}px`;
  targetBox.style.top = `${randomY}px`;
}

// QUANDO O JOGADOR ACERTA O ALVO
function hitTarget(e) {
  e.stopPropagation();
  playAudio('hit');
  clearInterval(targetInterval);

  score += 20; // Bônus por acertar o alvo!
  updateHUD();

  // Transição para a pergunta
  setTimeout(() => {
    switchScreen(screenQuiz);
    loadQuestion();
  }, 300);
}

// CARREGAR A PERGUNTA
function loadQuestion() {
  resetQuizState();

  const q = questions[currentQuestionIndex];
  questionBadge.textContent = `Pergunta ${currentQuestionIndex + 1}/${questions.length}`;
  categoryBadge.textContent = q.category;
  questionText.textContent = q.question;

  // Atualizar Barra de Progresso
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;

  // Renderizar Opções
  const prefixes = ["A)", "B)", "C)", "D)"];
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.innerHTML = `<strong>${prefixes[idx]}</strong> ${opt}`;
    btn.addEventListener("click", () => handleAnswer(idx));
    optionsContainer.appendChild(btn);
  });
}

function resetQuizState() {
  feedbackMessage.className = "feedback-box hidden";
  btnNext.classList.add("hidden");
  optionsContainer.innerHTML = "";
}

// PROCESSAR RESPOSTA DO QUIZ
function handleAnswer(selectedIndex) {
  const q = questions[currentQuestionIndex];
  const buttons = optionsContainer.querySelectorAll(".option-btn");

  buttons.forEach(b => b.disabled = true);

  if (selectedIndex === q.correct) {
    buttons[selectedIndex].classList.add("correct");
    score += 100;
    correctCount++;
    playAudio('correct');
    showFeedback("🎯 Sensacional! Resposta Exata!", "correct");
  } else {
    buttons[selectedIndex].classList.add("wrong");
    buttons[q.correct].classList.add("correct");
    lives--;
    playAudio('wrong');
    showFeedback("❌ Que pena, você errou esta!", "wrong");
  }

  updateHUD();

  if (lives > 0) {
    btnNext.classList.remove("hidden");
  } else {
    setTimeout(endGame, 1400);
  }
}

function showFeedback(msg, typeClass) {
  feedbackMessage.textContent = msg;
  feedbackMessage.classList.add(typeClass);
  feedbackMessage.classList.remove("hidden");
}

function prepareNextTarget() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    switchScreen(screenTarget);
    startMovingTarget();
  } else {
    endGame();
  }
}

// ATUALIZAR INTERFACE (HUD)
function updateHUD() {
  scoreDisplay.textContent = score;
  let heartIcons = "";
  for (let i = 0; i < lives; i++) heartIcons += "❤️";
  livesDisplay.textContent = heartIcons || "💔";
}

// FIM DE JOGO
function endGame() {
  if (targetInterval) clearInterval(targetInterval);
  switchScreen(screenEnd);

  finalScore.textContent = score;
  accuracyText.textContent = `Você acertou ${correctCount} de ${questions.length} perguntas.`;

  if (lives === 0) {
    endIcon.textContent = "🎯💔";
    endTitle.textContent = "Fim das Tentativas!";
    endMessage.textContent = "Suas vidas acabaram, mas você praticou bastante! Tente de novo para fazer a pontuação máxima.";
  } else if (correctCount === questions.length) {
    endIcon.textContent = "🏆🎯";
    endTitle.textContent = "Pontuação Perfeita!";
    endMessage.textContent = "Você é o Mestre da Precisão e da Educação Física! Acertou tudo!";
  } else {
    endIcon.textContent = "🌟🎯";
    endTitle.textContent = "Bom Trabalho!";
    endMessage.textContent = "Você mandou muito bem no tiro ao alvo dos esportes!";
  }
}
