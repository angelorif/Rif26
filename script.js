
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ground = canvas.height - 130;
let player = {
  x: 50,
  y: ground - 50,
  size: 50,
  vy: 0,
  jumpPower: 15,
  gravity: 1,
  onGround: true,
  image: new Image()
};

player.image.src = 'player_face.png';

let obstacles = [];
let coins = [];
let coinCount = 0;
let frameCount = 0;
let gameOver = false;

function spawnObstacle() {
  let width = 40;
  obstacles.push({
    x: canvas.width,
    y: ground - 40,
    width: width,
    height: 40
  });
}

function spawnCoin() {
  coins.push({
    x: canvas.width,
    y: ground - 100,
    size: 20
  });
}

function drawPlayer() {
  ctx.drawImage(player.image, player.x, player.y, player.size, player.size);
}

function drawObstacles() {
  ctx.fillStyle = "#444";
  obstacles.forEach(ob => {
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });
}

function drawCoins() {
  ctx.fillStyle = "gold";
  coins.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.size > b.x &&
    a.y < b.y + b.height &&
    a.y + a.size > b.y
  );
}

function checkCoinPickup(coin) {
  return (
    player.x < coin.x + coin.size &&
    player.x + player.size > coin.x &&
    player.y < coin.y + coin.size &&
    player.y + player.size > coin.y
  );
}

function glitchEffect(callback) {
  canvas.style.filter = "contrast(200%) brightness(150%)";
  setTimeout(() => {
    canvas.style.filter = "none";
    callback();
  }, 200);
}

function resetGame() {
  obstacles = [];
  coins = [];
  coinCount = 0;
  frameCount = 0;
  gameOver = false;
  document.getElementById("invito").style.display = "none";
  updateCounter();
  animate();
}

function updateCounter() {
  document.getElementById("counter").textContent = coinCount + "/26";
}

function showInvito() {
  document.getElementById("invito").style.display = "block";
}

function update() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ostacoli
  if (frameCount % 180 === 0) spawnObstacle();
  obstacles.forEach(ob => ob.x -= 6);
  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

  // Monete
  if (frameCount % 120 === 0) {
    if (coins.length === 0 || (canvas.width - coins[coins.length - 1].x) > 200) {
      spawnCoin();
    }
  }
  coins.forEach(c => c.x -= 6);
  coins = coins.filter(c => c.x + c.size > 0);

  // Salto
  player.y += player.vy;
  player.vy += player.gravity;

  if (player.y + player.size >= ground) {
    player.y = ground - player.size;
    player.vy = 0;
    player.onGround = true;
  }

  // Collisione
  for (let ob of obstacles) {
    if (checkCollision(player, ob)) {
      gameOver = true;
      glitchEffect(resetGame);
      return;
    }
  }

  // Monete
  coins = coins.filter(c => {
    if (checkCoinPickup(c)) {
      coinCount++;
      updateCounter();
      if (coinCount >= 26) {
        showInvito();
        gameOver = true;
      }
      return false;
    }
    return true;
  });

  drawPlayer();
  drawObstacles();
  drawCoins();

  frameCount++;
  if (!gameOver) requestAnimationFrame(update);
}

function jump() {
  if (player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }
}

window.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

window.addEventListener("touchstart", jump);

function restartGame() {
  resetGame();
}

updateCounter();
animate = update;
animate();
