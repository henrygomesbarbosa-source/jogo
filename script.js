// BANCO DE PERGUNTAS (Adaptado para 6º Ano)
const questions = [
  {
    category: "Matemática",
    question: "Qual é o resultado da expressão: 15 + (3 × 4)?",
    options: ["27", "72", "32", "19"],
    correct: 0 // Índice da resposta correta (27)
  },
  {
    category: "Português",
    question: "Qual das palavras abaixo é um substantivo próprio?",
    options: ["caneta", "Brasil", "felicidade", "cachorro"],
    correct: 1 // Brasil
  },
  {
    category: "Ciências",
    question: "Qual é o planeta do Sistema Solar conhecido como 'Planeta Vermelho'?",
    options: ["Vênus", "Júpiter", "Marte", "Saturno"],
    correct: 2 // Marte
  },
  {
    category: "História",
    question: "Onde surgiram as primeiras civilizações da escrita cuneiforme?",
    options: ["Mesopotâmia", "Grécia antiga", "Egito", "Roma"],
    correct: 0 // Mesopotâmia
  },
  {
    category: "Geografia",
    question: "Qual é o maior oceano do planeta Terra?",
    options: ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Oceano Ártico"],
    correct: 2 // Oceano Pacífico
  }
];

// ESTADO DO JOGO
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let correctAnswersCount = 0;

// REFERÊNCIAS DO DOM
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");

const btnStart = document.getElementById("btn-start");
const btnNext = document.getElementById("btn-next");
const btnRestart = document.getElementById("btn-restart");

const statusBar = document.getElementById("status-bar");
const livesDisplay = document.getElementById("lives-display");
const scoreDisplay = document.getElementById("score-display");

const questionNumberBadge = document.getElementById("question-number");
const categoryBadge = document.getElementById("category-badge");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const progressBar = document.getElementById("progress-bar");
const feedbackMessage = document.getElementById("feedback-message");

const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const endIcon = document.getElementById("end-icon");
const finalScore = document.getElementById("final-score");
const accuracyText = document.getElementById("accuracy-text");

// INICIALIZAÇÃO E EVENTOS
btnStart.addEventListener("click", startGame);
btnNext.addEventListener("click", nextQuestion);
btnRestart.addEventListener("click", startGame);

// EFEITOS SONOROS (Web Audio API - Funciona em qualquer navegador sem arquivos externos)
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.fadeOut(ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
      gain.gain.fadeOut(ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Caso o áudio esteja bloqueado no navegador
  }
}

// INICIAR O JOGO
function startGame() {
  currentQuestionIndex = 0;
  score = 0;
  lives = 3;
  correctAnswersCount = 0;

  updateStatus();
  statusBar.style.display = "flex";

  startScreen.classList.remove("active");
  endScreen.classList.remove("active");
  quizScreen.classList.add("active");

  loadQuestion();
}

// ATUALIZAR PLACAR E VIDAS
function updateStatus() {
  scoreDisplay.textContent = score;
  let hearts = "";
  for (let i = 0; i < lives; i++) {
    hearts += "❤️";
  }
  livesDisplay.textContent = hearts || "💀";
}

// CARREGAR UMA PERGUNTA
function loadQuestion() {
  resetState();

  const q = questions[currentQuestionIndex];
  
  // Atualizar textos e etiquetas
  questionNumberBadge.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
  categoryBadge.textContent = q.category;
  questionText.textContent = q.question;

  // Atualizar barra de progresso
  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Gerar botões das opções
  const prefixes = ["A)", "B)", "C)", "D)"];
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.classList.add("option-btn");
    button.innerHTML = `<span><strong>${prefixes[index]}</strong> ${option}</span>`;
    button.addEventListener("click", () => selectOption(index));
    optionsContainer.appendChild(button);
  });
}

// LIMPAR ESTADO DA PERGUNTA ANTERIOR
function resetState() {
  feedbackMessage.classList.add("hidden");
  feedbackMessage.className = "feedback hidden";
  btnNext.classList.add("hidden");
  optionsContainer.innerHTML = "";
}

// PROCESSAR A RESPOSTA ESCOLHIDA
function selectOption(selectedIndex) {
  const q = questions[currentQuestionIndex];
  const buttons = optionsContainer.querySelectorAll(".option-btn");

  // Desativar todos os botões após a escolha
  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.correct) {
    // Acertou
    buttons[selectedIndex].classList.add("correct");
    score += 100;
    correctAnswersCount++;
    playSound('correct');
    
    showFeedback("✨ Muito bem! Resposta correta!", "correct-bg");
  } else {
    // Errou
    buttons[selectedIndex].classList.add("wrong");
    buttons[q.correct].classList.add("correct"); // Mostra qual era a certa
    lives--;
    playSound('wrong');

    showFeedback("❌ Ops! Não foi desta vez...", "wrong-bg");
  }

  updateStatus();

  // Exibir botão de próxima pergunta
  if (lives > 0) {
    btnNext.classList.remove("hidden");
  } else {
    // Se acabou as vidas, encerra após 1.5s
    setTimeout(endGame, 1500);
  }
}

// EXIBIR MENSAGEM DE FEEDBACK
function showFeedback(text, bgClass) {
  feedbackMessage.textContent = text;
  feedbackMessage.classList.add(bgClass);
  feedbackMessage.classList.remove("hidden");
}

// PRÓXIMA PERGUNTA OU FIM DO JOGO
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

// TELA DE FINALIZAÇÃO
function endGame() {
  quizScreen.classList.remove("active");
  endScreen.classList.add("active");
  statusBar.style.display = "none";

  finalScore.textContent = score;
  accuracyText.textContent = `Você acertou ${correctAnswersCount} de ${questions.length} perguntas.`;

  // Customizar mensagem final dependendo do desempenho
  if (lives === 0) {
    endIcon.textContent = "💔";
    endTitle.textContent = "Fim de Jogo!";
    endMessage.textContent = "Suas vidas acabaram, mas não desista! Tente novamente e supere seu recorde.";
  } else if (correctAnswersCount === questions.length) {
    endIcon.textContent = "🏆";
    endTitle.textContent = "Incrível! Pontuação Perfeita!";
    endMessage.textContent = "Você é um verdadeiro gênio do 6º ano! Acertou todas as perguntas!";
  } else {
    endIcon.textContent = "🌟";
    endTitle.textContent = "Bom Trabalho!";
    endMessage.textContent = "Você mandou super bem no quiz! Que tal jogar de novo para tirar a nota máxima?";
  }
}
