let config = {
  xBlock: 25,
  ratio: [16, 9],
  blockSize: 30,
}

const game = document.getElementById("game");
const gameScore = document.getElementById("score");

config.yBlock = Math.floor(config.xBlock * (config.ratio[1] / config.ratio[0]));

const gameWidth = config.xBlock * config.blockSize;
const gameHeight = config.yBlock * config.blockSize;

game.style.position = "relative";

let blocks = [];
let snake = [];
let apples = [];

let gameEnd = false;

const toPixel = (value) => `${value}px`;

const randomIntInRange = (start, end) => {
  start = Math.floor(start);
  end = Math.floor(end);

  return Math.floor(Math.random() * (end - start) + start);
};

const random2DVector = (zeroVector, start, end) => {
  zeroVector.x = randomIntInRange(start.x, end.x);
  zeroVector.y = randomIntInRange(start.y, end.y);
};

const clampPosition = (value, start, end) => {
  if (value > end) {
    return 0;
  } else if (value < 0) {
    return end;
  }
  return value;
} 

let moveDirections = ["left", "right", "up", "down"];
let moveDirection = moveDirections[randomIntInRange(0, moveDirections.length)];

console.log(moveDirection);

let spawnPadding = 5;
let blocksCount = config.xBlock * config.yBlock;
const createSnakePart = (snake) => {
  let snakePart = document.createElement("div");

  snakePart.style.width = toPixel(config.blockSize);
  snakePart.style.height = toPixel(config.blockSize);

  snakePart.style.position = "absolute";

  let zIndexOffset = 5;
  snakePart.style.zIndex = blocksCount - snake.length + zIndexOffset + "";
  
  let spawnPosition = { x: 0 ,y: 0 };

  if (snake.length === 0) {
    random2DVector(
      spawnPosition, 
      { x: spawnPadding, y: spawnPadding }, 
      { x: (config.xBlock - spawnPadding) - 1, y: (config.yBlock - spawnPadding) - 1 }
    );

    snakePart.style.backgroundColor = `green`;
  } else {
    let newestPartPosition = { ...snake.at(-1).position };

    switch (moveDirection) {
      case "left":
        newestPartPosition.x += 1;
        break;
      case "right":
        newestPartPosition.x -= 1;
        break;
      case "up":
        newestPartPosition.y += 1;
        break;
      case "down":
        newestPartPosition.y -= 1;
        break;
      default:
        console.error("Didn't handle this direction: ", moveDirection);
    }

    newestPartPosition.x = clampPosition(newestPartPosition.x, 0, config.xBlock - 1);
    newestPartPosition.y = clampPosition(newestPartPosition.y, 0, config.yBlock - 1);

    spawnPosition = newestPartPosition;
    snakePart.style.backgroundColor = `red`;
  }

  snake.push({
    element: snakePart,
    position: spawnPosition
  });

  snakePart.id = `${spawnPosition.x}-${spawnPosition.y}`;
  
  game.appendChild(snakePart);

  snakePart.style.left = toPixel(spawnPosition.x * config.blockSize);
  snakePart.style.top = toPixel(spawnPosition.y * config.blockSize);
};

const followHead = (positionToMove, currentPartIndex) => {
  if (currentPartIndex >= snake.length) {
    console.log("end");
    return;
  };

  console.log("work");

  let currentPart = snake[currentPartIndex];
  let currentPartPosition = { ...currentPart.position };

  currentPart.position = positionToMove;

  currentPart.position.x = clampPosition(currentPart.position.x, 0, config.xBlock - 1);
  currentPart.position.y = clampPosition(currentPart.position.y, 0, config.yBlock - 1);

  currentPart.element.style.left = toPixel(currentPart.position.x * config.blockSize);
  currentPart.element.style.top = toPixel(currentPart.position.y * config.blockSize);

  followHead(currentPartPosition, currentPartIndex + 1)
}

const moveSnakeHead = () => {
  if (gameEnd) return;

  let oldHeadPosition = { ...snake[0].position };

  switch (moveDirection) {
    case "left":
      snake[0].position.x -= 1;
      break;
    case "right":
      snake[0].position.x += 1;
      break;
    case "up":
      snake[0].position.y -= 1;
      break;
    case "down":
      snake[0].position.y += 1;
      break;
    default:
      console.error("Didn't handle this direction: ", moveDirection);
  }

  let head = snake[0];

  head.position.x = clampPosition(head.position.x, 0, config.xBlock - 1);
  head.position.y = clampPosition(head.position.y, 0, config.yBlock - 1);

  head.element.style.left = toPixel(head.position.x * config.blockSize);
  head.element.style.top = toPixel(head.position.y * config.blockSize);

  let checkX = head.position.x;
  let checkY = head.position.y;

  if (snake.length === config.xBlock * config.yBlock) {
    gameEnd = true;
    alert("You win!");
    return;
  }

  for (let i = 1; i < snake.length; i++) {
    let { x, y } = snake[i].position;

    if (x === checkX && y === checkY) {
      gameEnd = true;
      alert("You lose!");
      return;
    }
  }

  for (let i = 0; i < apples.length; i++) {
    let { x, y } = apples[i].position;

    if (x === checkX && y === checkY) {
      createSnakePart(snake);
      apples[i].element.remove();
      gameScore.innerHTML = `Score : ${snake.length - 1}`
    }
  }

  followHead(oldHeadPosition, 1);
}

let appleLifeTime = 10;
let appleRemoveQueue = [];
function spawnApple() {
  let spawnPosition = { x: 0 ,y: 0 };
  let avaliable = [];

  for (let y = 0; y < config.yBlock; y++) {
    for (let x = 0; x < config.xBlock; x++) {
      if (!blocks[x + y].isThereAnApple) {
        avaliable.push({ x: x, y: y });
      }
    }
  }

  const trulyAvaliable = avaliable.filter(spot => {
    return !snake.some(part => part.position.x === spot.x && part.position.y === spot.y);
  });

  if (trulyAvaliable.length > 0) {
    let randomAvaiable = avaliable[randomIntInRange(0, trulyAvaliable.length)];
    console.log(randomAvaiable)
    spawnPosition = randomAvaiable;

    console.log(spawnPosition);
    blocks[(spawnPosition.y * config.xBlock) + spawnPosition.x].isThereAnApple = true;

    let apple = document.createElement("div");

    apple.style.width = toPixel(config.blockSize);
    apple.style.height = toPixel(config.blockSize);

    apple.style.position = "absolute";

    apple.style.zIndex = "0";

    apple.style.backgroundColor = "yellow";

    let appleData = {
      element: apple,
      position: spawnPosition
    }

    apples.push(appleData);
    appleRemoveQueue.push(appleData);

    game.appendChild(apple);

    apple.style.left = toPixel(spawnPosition.x * config.blockSize);
    apple.style.top = toPixel(spawnPosition.y * config.blockSize);
  }
}

game.style.width = toPixel(gameWidth);
game.style.height = toPixel(gameHeight);

game.style.display = "grid";
game.style.gridTemplateColumns = `repeat(${config.xBlock}, 1fr)`;

for (let y = 0; y < config.yBlock; y++) {
  for (let x = 0; x < config.xBlock; x++) {
    let block = document.createElement("div");

    block.style.width = toPixel(config.blockSize);
    block.style.height = toPixel(config.blockSize);

    block.style.backgroundColor = "black";

    game.appendChild(block);
    blocks.push({
      element: block,
      isThereAnApple: false,
    });
  }
}

createSnakePart(snake);
spawnApple();

let moveInterval = setInterval(() => {
  if (gameEnd) return;

  moveSnakeHead();
}, 100);

let spawnAppleInterval = setInterval(() => {
  if (gameEnd) return;

  spawnApple();
}, (appleLifeTime / 10) * 1000);

let removeAppleInterval = setInterval(() => {
  let queueHead = appleRemoveQueue.shift();

  if (queueHead && queueHead.element && queueHead.element.parentNode) {
    blocks[(queueHead.position.y * config.xBlock) + queueHead.position.x].isThereAnApple = false;
    queueHead.element.remove();
  }
}, appleLifeTime * 1000);

let allowedKeys = "adws";
window.addEventListener("keydown", (event) => {
  let inputKey = event.key;

  if (!allowedKeys.includes(inputKey)) return;

  switch (inputKey) {
    case "a":
      if (moveDirection === "right" || snake.length === 0) return;
      moveDirection = "left";
      break;
    case "d":
      if (moveDirection === "left" || snake.length === 0) return;
      moveDirection = "right";
      break;
    case "w":
      if (moveDirection === "down" || snake.length === 0) return;
      moveDirection = "up";
      break;
    case "s":
      if (moveDirection === "up" || snake.length === 0) return;
      moveDirection = "down";
      break;
    default:
      console.error("Didn't handle this direction: ", moveDirection);
  }
  
  console.log(moveDirection);
});