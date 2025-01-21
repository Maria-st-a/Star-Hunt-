let walls = [];
let particle;
let starPositions = [];
let collectedStars = [];
let timer = 20;
let gameOver = false;
let gameStarted = false; // Flag to track if the game has started

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Star positions and sizes
  starPositions = [
    { x: width / 2, y: height / 2, outer: 300, inner: 120, collected: false },
    { x: width / 4 - 30, y: height / 4, outer: 150, inner: 60, collected: false }, // Adjusted the x position of the first star by 30 px (approximately 1 cm)
    { x: width / 6, y: height * 0.75, outer: 120, inner: 48, collected: false },
    { x: width * 0.75, y: height * 0.75, outer: 180, inner: 72, collected: false },
  ];

  // Create star boundaries
  for (let pos of starPositions) {
    createStarBoundaries(pos.x, pos.y, pos.outer, pos.inner, 5);
  }

  // Canvas boundaries
  walls.push(new Boundary(-2, -2, height, -2));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));

  particle = new Particle();
  noCursor();

  // Countdown timer
  setInterval(() => {
    if (gameStarted && !gameOver) timer = max(0, timer - 1);
  }, 1000);
}

function draw() {
  if (!gameStarted) {
    drawIntroScreen(); // Display the intro screen
    return;
  }

  background(128, 0, 32); // Burgundy background

  // Display timer
  fill(255);
  textSize(32);
  text(`Time: ${timer}s`, 80, 40); // Adjusted position for better visibility

  // Check game over conditions
  if (timer <= 0 || collectedStars.length === starPositions.length) {
    gameOver = true;
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(
      collectedStars.length === starPositions.length ? "You Win!" : "Game Over",
      width / 2,
      height / 2
    );
    textSize(32);
    text("Press 'R' to Restart", width / 2, height / 2 + 50);
    return;
  }

  // Show walls
  for (let wall of walls) {
    wall.show();
  }

  // Particle follows mouse movement
  particle.update(mouseX, mouseY);
  particle.show();
  particle.look(walls);

  // Check and draw stars
  for (let star of starPositions) {
    if (!star.collected && isPointInsideStar(mouseX, mouseY, star)) {
      // Updated to a brighter red
      fill(255, 0, 0, 150); // Brighter red with transparency
      noStroke();
      ellipse(star.x, star.y, star.outer * 2);
    }
  }

  // Draw visible cursor
  fill(255, 255, 255, 200);
  ellipse(mouseX, mouseY, 10);
}

function mousePressed() {
  if (!gameStarted && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 30 && mouseY < height / 2 + 80) {
    gameStarted = true;
    return;
  }

  if (!gameOver && gameStarted) {
    for (let star of starPositions) {
      if (!star.collected && isPointInsideStar(mouseX, mouseY, star)) {
        star.collected = true;
        collectedStars.push(star);
      }
    }
  }
}

// Intro screen function
function drawIntroScreen() {
  background(128, 0, 32); // Burgundy background (same as the game page)

  // Draw glowing title text
  fill(255, 215, 0); // Gold color
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Welcome to the Star Hunt!", width / 2, height / 2 - 100);
  textSize(20);
  fill(255);
  text("Find and click on all the stars before time runs out.", width / 2, height / 2 - 50);
  text("Use your mouse to shine light on the hidden stars.", width / 2, height / 2);

  // Add a glowing effect to the start button
  let buttonX = width / 2 - 100;
  let buttonY = height / 2 + 30;
  let buttonWidth = 200;
  let buttonHeight = 50;

  // Glow effect on hover
  if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    fill(255, 215, 0); // Yellow for glow
    noStroke();
    ellipse(width / 2, height / 2 + 55, buttonWidth + 10, buttonHeight + 10); // Outer glowing circle
  }

  // Start button design (Changed button color to yellow like the text)
  fill(255, 215, 0); // Yellow color button (like the text)
  stroke(255);
  strokeWeight(2);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 10); // Rounded rectangle button
  fill(255);
  noStroke();
  textSize(32);
  text("Start", width / 2, height / 2 + 55);

  // Add more soft particle effects to enhance the atmosphere
  for (let i = 0; i < 30; i++) { // Increased the number of particles for a fuller effect
    let x = random(width);
    let y = random(height / 2 - 100, height / 2 + 100);
    let size = random(5, 15); // Random particle size
    let speed = random(0.5, 1.5); // Slower movement speed for particles
    fill(255, 215, 0, 200); // Brighter, golden particles
    noStroke();
    ellipse(x, y, size); // Larger particles with varying size
  }

  // Draw visible cursor on intro screen
  fill(255, 255, 255, 200);
  ellipse(mouseX, mouseY, 10);
}

function keyPressed() {
  if (key === 'R' || key === 'r') {
    timer = 20;
    gameOver = false;
    collectedStars = [];
    gameStarted = false;
    for (let star of starPositions) {
      star.collected = false;
    }
  }
}

// Utility to check if a point is inside a star boundary
function isPointInsideStar(px, py, star) {
  let angleStep = PI / 5;
  let vertices = [];
  for (let i = 0; i < 10; i++) {
    let angle = i * angleStep;
    let r = i % 2 === 0 ? star.outer : star.inner;
    let x = star.x + cos(angle) * r;
    let y = star.y + sin(angle) * r;
    vertices.push({ x, y });
  }
  return pointInPolygon(px, py, vertices);
}

// Custom function to check if a point is inside a polygon
function pointInPolygon(px, py, vertices) {
  let collision = false;
  let next = 0;
  for (let current = 0; current < vertices.length; current++) {
    next = (current + 1) % vertices.length;
    let vc = vertices[current];
    let vn = vertices[next];
    if (((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
        px < ((vn.x - vc.x) * (py - vc.y)) / (vn.y - vc.y) + vc.x) {
      collision = !collision;
    }
  }
  return collision;
}

// Star boundary creation
function createStarBoundaries(cx, cy, rOuter, rInner, points) {
  let angleStep = PI / points;
  let vertices = [];
  for (let i = 0; i < points * 2; i++) {
    let angle = i * angleStep;
    let r = i % 2 === 0 ? rOuter : rInner;
    let x = cx + cos(angle) * r;
    let y = cy + sin(angle) * r;
    vertices.push(createVector(x, y));
  }
  for (let i = 0; i < vertices.length; i++) {
    let a = vertices[i];
    let b = vertices[(i + 1) % vertices.length];
    walls.push(new Boundary(a.x, a.y, b.x, b.y));
  }
}

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(128, 0, 32); // Burgundy-colored walls
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255); // White rays
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    }
  }
}

class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += 1) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        let grayValue = (frameCount * 5 + i * 10) % 255; // Spinning color value
        // Colorful, spinning rays
        stroke(grayValue, 150, 255);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 8); // Smaller particle size
  }
}
