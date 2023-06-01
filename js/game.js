const SELECTORS = {
  boardContainer: document.querySelector('.board-container'),
  board: document.querySelector('.board'),
  moves: document.querySelector('.moves'),
  timer: document.querySelector('.timer'),
  start: document.querySelector('button'),
  win: document.querySelector('.win'),
}

const STATE = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null
}

// функция перемешивания карточек
const shuffle = array => {
  const clonedArray = [...array];

  for (let index = clonedArray.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const original = clonedArray[index];

    clonedArray[index] = clonedArray[randomIndex];

    clonedArray[randomIndex] = original;
  }

  return clonedArray;
}


// функция получения рандомной карточки
const pickRandom = (array, items) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let index = 0; index < items; index++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);

    randomPicks.push(clonedArray[randomIndex]);

    clonedArray.splice(randomIndex, 1);
  }

  return randomPicks;
}


// генерация доски с карточками
const generateGame = () => {
  const dimensions = SELECTORS.board.getAttribute('data-dimension');

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of board must be an even number.");
  }

  const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];

  const picks = pickRandom(emojis, (dimensions * dimensions) / 2);

  const items = shuffle([...picks, ...picks]);

  const cards = `
    <div class="board">
      ${items.map(item => `
        <div class="card">
          <div class="card-front"></div>
          <div class="card-back">${item}</div>
        </div>
      `).join('')}
    </div>
  `;

  const parser = new DOMParser().parseFromString(cards, "text/html");

  SELECTORS.board.replaceWith(parser.querySelector('.board'));
}


// начинаем игру
const startGame = () => {
  STATE.gameStarted = true;

  SELECTORS.start.classList.add('disabled');

  STATE.loop = setInterval(() => {
    STATE.totalTime++;

    SELECTORS.moves.innerText = `${STATE.totalFlips} moves`;
    SELECTORS.timer.innerText = `${STATE.totalTime} sec`;
  }, 1000)
}


// переворачивание карточек
const flipCard = card => {
  STATE.flippedCards++;
  STATE.totalFlips++;

  if (!STATE.gameStarted) {
    startGame(); // начинаем игру (секундомер, кол-во шагов и т.д.)
  }

  if (STATE.flippedCards <= 2) {
    card.classList.add('flipped');
  }

  if (STATE.flippedCards === 2) {
    const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
    console.log(flippedCards);

    if (flippedCards[0].innerText === flippedCards[1].innerText) {
      flippedCards[0].classList.add('matched');
      flippedCards[1].classList.add('matched');
    }

    setTimeout(() => {
      flipBackCards(); // перевернуть карточку обратно, если совпадений нет
    }, 1000)
  }

  if (!document.querySelectorAll('.card:not(.flipped)').length) {
    setTimeout(() => {
      SELECTORS.boardContainer.classList.add('flipped')
      SELECTORS.win.innerHTML = `
        <div class='win-text'>
          You won! <br/> with 
          <span class="highlight">${STATE.totalFlips}</span> moves <br/>
          <span class="highlight">${STATE.totalTime}</span> seconds <br/>
        </div>
      `

      clearInterval(STATE.loop); // приостанавливаем отсчет времени
    }, 1000)
  }
}


// возврат карточек в исходное положение
const flipBackCards = () => {
  document.querySelectorAll('.card:not(.matched)').forEach(card => {
    card.classList.remove('flipped');
  })

  STATE.flippedCards = 0;
}


// обработчики событий
const attachEventListeners = () => {
  document.addEventListener('click', event => {
    const eventTarget = event.target; // закрытая сторона карточки
    const eventParent = eventTarget.parentElement; // общий родитель карточки

    if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
      flipCard(eventParent);
    } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
      startGame();
    }
  })
}


attachEventListeners();
generateGame();