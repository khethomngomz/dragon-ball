// Get the canvas and its 2D drawing context
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions dynamically
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Snake configuration
let segmentCount = Math.floor((canvas.width + canvas.height) / 50);
const segmentLength = 20;
const segmentWidth = 15;
const segments = [];
let snakeSpeed = 0.1;

// Gradient configuration
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#ff0000");
gradient.addColorStop(0.5, "#ffff00");
gradient.addColorStop(1, "#00ff00");

// Mouse tracker
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// Food configuration
const foodItems = Array.from({ length: 5 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: 10,
  color: "#ff69b4",
  offset: Math.random() * 2 * Math.PI,
}));

// Obstacle configuration
const obstacles = Array.from({ length: 3 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: 30, // Diameter of the spiked obstacle
  rotation: Math.random() * 360, // Initial rotation angle
  rotationSpeed: Math.random() * 2 + 1, // Rotation speed
  spikes: 6, // Number of spikes on the obstacle
  color: "#8b0000",
}));

// Game state
let score = 0;
let isGameOver = false;

// Initialize segments
for (let i = 0; i < segmentCount; i++) {
  segments.push({ x: mouse.x, y: mouse.y });
}

// Listen for mouse movements
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Resize canvas and adjust segments dynamically
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  segmentCount = Math.floor((canvas.width + canvas.height) / 50);
  segments.length = 0;
  for (let i = 0; i < segmentCount; i++) {
    segments.push({ x: mouse.x, y: mouse.y });
  }
  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(0.5, "#ffff00");
  gradient.addColorStop(1, "#00ff00");
});

// Update the snake's segments
function updateSnake() {
  if (isGameOver) return;

  segments[0].x += (mouse.x - segments[0].x) * snakeSpeed;
  segments[0].y += (mouse.y - segments[0].y) * snakeSpeed;

  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const current = segments[i];
    const dx = prev.x - current.x;
    const dy = prev.y - current.y;
    const angle = Math.atan2(dy, dx);
    current.x = prev.x - Math.cos(angle) * segmentLength;
    current.y = prev.y - Math.sin(angle) * segmentLength;
  }
}

// Draw the dragon-like snake
function drawSnake() {
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const size = segmentWidth - (i * segmentWidth) / segments.length;

    ctx.beginPath();
    ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
    ctx.fill();

    if (i % 2 === 0) {
      const spikeLength = size * 1.5;
      const dx = i === 0 ? mouse.x - segment.x : segments[i - 1].x - segment.x;
      const dy = i === 0 ? mouse.y - segment.y : segments[i - 1].y - segment.y;
      const angle = Math.atan2(dy, dx);

      ctx.beginPath();
      ctx.moveTo(segment.x, segment.y);
      ctx.lineTo(
        segment.x + Math.cos(angle) * spikeLength,
        segment.y + Math.sin(angle) * spikeLength
      );
      ctx.stroke();
    }
  }
}

// Draw and animate food items
function drawFood() {
  foodItems.forEach((food, index) => {
    // Bobbing animation
    food.y += Math.sin(Date.now() / 500 + food.offset) * 0.5;

    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fillStyle = food.color;
    ctx.fill();

    // Check for collision
    const head = segments[0];
    const dx = head.x - food.x;
    const dy = head.y - food.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < food.radius + segmentWidth / 2) {
      foodItems.splice(index, 1); // Remove food
      segments.push({
        x: segments[segments.length - 1].x,
        y: segments[segments.length - 1].y,
      }); // Grow snake
      score++; // Increase score
      snakeSpeed += 0.005; // Increase speed
      obstacles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 + 1,
        spikes: 6,
        color: "#8b0000",
      }); // Add new obstacle
      foodItems.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 10,
        color: "#ff69b4",
        offset: Math.random() * 2 * Math.PI,
      }); // Add new food
    }
  });
}

// Draw and animate spiked obstacles
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    const { x, y, size, rotation, spikes, color, rotationSpeed } = obstacle;

    obstacle.rotation += rotationSpeed; // Update rotation angle

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);

    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      const angle = (i * Math.PI * 2) / spikes;
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      const innerX = Math.cos(angle + Math.PI / spikes) * (size / 2);
      const innerY = Math.sin(angle + Math.PI / spikes) * (size / 2);

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    // Check for collision
    const head = segments[0];
    const dx = head.x - x;
    const dy = head.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < size + segmentWidth / 2) {
      isGameOver = true;
    }
  });
}

// Display the scoreboard
function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

// Show retry screen
function showRetryScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText("Click to Retry", canvas.width / 2, canvas.height / 2 + 60);
}

// Handle retry
canvas.addEventListener("click", () => {
  if (isGameOver) {
    location.reload();
  }
});

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawObstacles();
  updateSnake();
  drawSnake();
  drawScore();

  if (isGameOver) {
    showRetryScreen();
    return;
  }

  requestAnimationFrame(animate);
}

// Start the animation
animate();
