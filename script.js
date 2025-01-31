const telaInicial = document.getElementById('start-screen');
const telaCarregamento = document.getElementById('loading-screen');
const telaJogo = document.getElementById('game-screen');
const botaoJogar = document.getElementById('play-button');
const tabuleiro = document.getElementById('board');
const celulas = Array.from(document.getElementsByClassName('cell'));
const caixaMensagem = document.getElementById('message-box');
const botaoReplay = document.getElementById('replay-button');

let estadoJogo = ['', '', '', '', '', '', '', '', ''];
let jogosCompletos = 0; // 👈 Rastreia quantos jogos foram completos (vitórias, derrotas ou empates)

botaoJogar.addEventListener('click', () => {
  telaInicial.classList.add('hidden');
  telaCarregamento.classList.remove('hidden');

  setTimeout(() => {
    telaCarregamento.classList.add('hidden');
    telaJogo.classList.remove('hidden');
    iniciarJogo();
  }, 5000);
});

function iniciarJogo() {
  estadoJogo = ['', '', '', '', '', '', '', '', ''];
  celulas.forEach(celula => {
    celula.textContent = '';
    celula.style.pointerEvents = 'auto';
  });
  caixaMensagem.textContent = '';
  caixaMensagem.classList.add('hidden');
  botaoReplay.classList.add('hidden');
}

function verificarVitoria() {
  const condicoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  for (let condicao of condicoesVitoria) {
    const [a, b, c] = condicao;
    if (estadoJogo[a] && estadoJogo[a] === estadoJogo[b] && estadoJogo[a] === estadoJogo[c]) {
      return { vencedor: estadoJogo[a], linha: condicao };
    }
  }

  return null;
}

function jogadaBot() {
  let movimento = null;

  // Joga aleatoriamente após o quinto jogo completo
  if (jogosCompletos >= 5) { // 👈 Verifica se já completou 5 jogos
    const movimentosDisponiveis = estadoJogo
      .map((celula, index) => celula === '' ? index : null)
      .filter(index => index !== null);
    movimento = movimentosDisponiveis[Math.floor(Math.random() * movimentosDisponiveis.length)];
  } else {
    // Usa o algoritmo Minimax nos primeiros 5 jogos
    let melhorPontuacao = -Infinity;
    for (let i = 0; i < estadoJogo.length; i++) {
      if (estadoJogo[i] === '') {
        estadoJogo[i] = 'X';
        let pontuacao = minimax(estadoJogo, 0, false);
        estadoJogo[i] = '';
        if (pontuacao > melhorPontuacao) {
          melhorPontuacao = pontuacao;
          movimento = i;
        }
      }
    }
  }

  estadoJogo[movimento] = 'X';
  celulas[movimento].textContent = '❌';
  verificarEstadoJogo();
}

function minimax(estado, profundidade, ehMaximizador) {
  const resultado = verificarVitoria();
  if (resultado) {
    return resultado.vencedor === 'X' ? 1 : -1;
  }
  if (!estado.includes('')) return 0;

  if (ehMaximizador) {
    let melhorPontuacao = -Infinity;
    for (let i = 0; i < estado.length; i++) {
      if (estado[i] === '') {
        estado[i] = 'X';
        let pontuacao = minimax(estado, profundidade + 1, false);
        estado[i] = '';
        melhorPontuacao = Math.max(pontuacao, melhorPontuacao);
      }
    }
    return melhorPontuacao;
  } else {
    let melhorPontuacao = Infinity;
    for (let i = 0; i < estado.length; i++) {
      if (estado[i] === '') {
        estado[i] = 'O';
        let pontuacao = minimax(estado, profundidade + 1, true);
        estado[i] = '';
        melhorPontuacao = Math.min(pontuacao, melhorPontuacao);
      }
    }
    return melhorPontuacao;
  }
}

celulas.forEach((celula, index) => {
  celula.addEventListener('click', () => {
    if (estadoJogo[index] || verificarVitoria()) return;

    estadoJogo[index] = 'O';
    celula.textContent = '⭕';

    // Desabilita cliques enquanto o bot joga
    celulas.forEach(c => c.style.pointerEvents = 'none');

    verificarEstadoJogo();

    // Vez do bot após a jogada do jogador
    setTimeout(() => {
      if (!verificarVitoria() && estadoJogo.includes('')) {
        jogadaBot();
        celulas.forEach(c => c.style.pointerEvents = 'auto'); // Reabilita cliques
      }
    }, 500); // Pequeno atraso para melhor UX
  });
});

function verificarEstadoJogo() {
  const resultado = verificarVitoria();
  if (resultado) {
    if (resultado.vencedor === 'O') {
      // Transforma os círculos do jogador em corações se ele vencer
      resultado.linha.forEach(index => {
        if (estadoJogo[index] === 'O') {
          celulas[index].textContent = '❤️';
        }
      });
      caixaMensagem.textContent = `Eu te amo Heloísa, minha garota inteligentona ❤️`;
    } else {
      caixaMensagem.textContent = `${resultado.vencedor === 'O' ? 'Você' : 'Bot'} venceu!`;
    }
    jogosCompletos++; // 👈 Incrementa o número de jogos completos
    finalizarJogo();
    return;
  }

  if (!estadoJogo.includes('')) {
    caixaMensagem.textContent = "Empate!";
    jogosCompletos++; // 👈 Incrementa o número de jogos completos
    finalizarJogo();
    return;
  }
}

function finalizarJogo() {
  celulas.forEach(celula => {
    celula.style.pointerEvents = 'none';
  });
  caixaMensagem.classList.remove('hidden');
  botaoReplay.classList.remove('hidden');
}

botaoReplay.addEventListener('click', () => {
  iniciarJogo();
});
