// Global variables
let wavelength = 550;
let slitWidth = 0.2;
let slitDistance = 0.5;
let particles = [];
let running = false;
let paused = false;
let quantumTime = 0;
let lastUpdateTime = 0;
let clockInterval;
let particleCount = 0;
let canvasWidth, canvasHeight;
let slitPositionX;
let screenPositionX;
let detectionsCounter = 0;

// Observer effect global flag
window.observerActive = false;

// Get references to HTML elements
const videoElement = document.getElementById("webcam");
const observerStateEl = document.getElementById("observerState");

// Initialize MediaPipe FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

// Access the webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    videoElement.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error accessing webcam:", err);
    observerStateEl.innerText = "WEBCAM ERROR";
    observerStateEl.style.color = "orange";
  });

// Process video frames continuously
async function processVideo() {
  await faceMesh.send({ image: videoElement });
  requestAnimationFrame(processVideo);
}

videoElement.onloadeddata = () => {
  processVideo();
};

// Callback when faceMesh returns results
function onResults(results) {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    // Calculate Eye Aspect Ratio (EAR) for both eyes
    const leftEAR = calculateEAR(landmarks, [33, 160, 158, 133, 153, 144]);
    const rightEAR = calculateEAR(landmarks, [362, 385, 387, 263, 373, 380]);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // EAR threshold for determining if eyes are open
    const EAR_THRESHOLD = 0.2;
    if (avgEAR > EAR_THRESHOLD) {
      window.observerActive = true;
      observerStateEl.innerText = "ON (Eyes Open)";
      observerStateEl.style.color = "red";
    } else {
      window.observerActive = false;
      observerStateEl.innerText = "OFF (Eyes Closed)";
      observerStateEl.style.color = "green";
    }
  }
}

// Function to calculate the Eye Aspect Ratio (EAR)
function calculateEAR(landmarks, indices) {
  const p1 = landmarks[indices[0]];
  const p2 = landmarks[indices[1]];
  const p3 = landmarks[indices[2]];
  const p4 = landmarks[indices[3]];
  const p5 = landmarks[indices[4]];
  const p6 = landmarks[indices[5]];

  const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y);

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// p5.js sketch
new p5(function(p) {
  p.setup = function() {
    canvasWidth = p.windowWidth;
    canvasHeight = p.windowHeight;
    p.createCanvas(canvasWidth, canvasHeight);
    p.frameRate(30);

    slitPositionX = p.width * 0.3;
    screenPositionX = p.width * 0.8;

    // Initialize UI elements
    initializeUI();
  };

  p.draw = function() {
    p.background(0);

    if (running && !paused) {
      // Draw the apparatus (source, slits, and screen)
      drawApparatus();

      // Draw different pattern based on observer state
      if (window.observerActive) {
        // Particle behavior when observed
        drawParticleBehavior();
      } else {
        // Wave behavior when not observed
        drawWaveBehavior();
      }

      // Update particles
      updateParticles();
    }
  };

  function drawApparatus() {
    // Source
    p.fill(255, 255, 0);
    p.ellipse(50, p.height / 2, 20, 20);

    // Barrier with slits
    p.fill(100);
    p.rect(slitPositionX - 5, 0, 10, p.height);

    const slitOffset = (slitDistance * 100);
    const slitSize = slitWidth * 100;

    // Clear the slits
    p.fill(0);
    p.rect(slitPositionX - 5, p.height / 2 - slitOffset - slitSize / 2, 10, slitSize);
    p.rect(slitPositionX - 5, p.height / 2 + slitOffset - slitSize / 2, 10, slitSize);

    // Screen
    p.fill(50);
    p.rect(screenPositionX, 0, 5, p.height);
  }

  function drawWaveBehavior() {
    // Create circular waves from each slit
    const slitOffset = (slitDistance * 100);

    // Create wave from source to slits periodically
    if (p.frameCount % 5 === 0) {
      particles.push(new WavePacket(50, p.height / 2, slitPositionX, p.height / 2 - slitOffset, wavelength));
      particles.push(new WavePacket(50, p.height / 2, slitPositionX, p.height / 2 + slitOffset, wavelength));
    }

    // Draw interference pattern on screen
    drawInterferencePattern();
  }

  function drawParticleBehavior() {
    // Shoot particles from source that go through one of the slits
    if (p.frameCount % 10 === 0) {
      const slitOffset = (slitDistance * 100);

      // Randomly choose one of the slits
      const whichSlit = Math.random() < 0.5 ? -1 : 1;
      const targetY = p.height / 2 + (whichSlit * slitOffset);

      particles.push(new Particle(50, p.height / 2, slitPositionX, targetY, wavelength));
    }
  }

  function drawInterferencePattern() {
    // Draw the interference pattern on the screen
    p.stroke(255);

    for (let y = 0; y < p.height; y++) {
      const slitOffset = (slitDistance * 100);
      const slit1Y = p.height / 2 - slitOffset;
      const slit2Y = p.height / 2 + slitOffset;

      // Calculate distances from each slit to this point on screen
      const dist1 = p.dist(slitPositionX, slit1Y, screenPositionX, y);
      const dist2 = p.dist(slitPositionX, slit2Y, screenPositionX, y);

      // Calculate phase difference
      const phaseDiff = 2 * Math.PI * (dist2 - dist1) / (wavelength / 50);

      // Calculate intensity using interference formula
      const intensity = Math.cos(phaseDiff / 2) ** 2;

      // Draw a point with brightness proportional to intensity
      const brightness = intensity * 255;
      p.stroke(brightness);
      p.line(screenPositionX, y, screenPositionX + 5, y);
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      if (!paused) {
        particle.update();
      }

      particle.display();

      // Check if particle has reached the screen
      if (particle.hasReachedScreen()) {
        if (particle instanceof Particle) {
          particleCount++;
          document.getElementById("particleCounter").innerText = particleCount;
        }
        particles.splice(i, 1);
      }

      // Remove old particles
      if (particle.age > 100) {
        particles.splice(i, 1);
      }
    }
  }

  // Wave packet class
  class WavePacket {
    constructor(sourceX, sourceY, targetX, targetY, wavelength) {
      this.sourceX = sourceX;
      this.sourceY = sourceY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.progress = 0;
      this.speed = p.map(wavelength, 400, 700, 0.01, 0.03);
      this.color = wavelengthToColor(wavelength);
      this.age = 0;
      this.amplitude = 1.0;
      this.wavelength = wavelength;
      this.phase = 0;

      // Calculate angle to target
      this.angle = p.atan2(targetY - sourceY, targetX - sourceX);

      // After reaching slit, it will propagate in circular waves
      this.reachedSlit = false;
      this.circleRadius = 0;
    }

    update() {
      if (!this.reachedSlit) {
        this.progress += this.speed;

        // Check if reached slit
        if (this.progress >= 1) {
          this.reachedSlit = true;
        }
      } else {
        // Expand circular wave
        this.circleRadius += this.speed * 50;
        this.amplitude *= 0.99; // Fade amplitude over time
      }

      this.age++;
    }

    display() {
      if (!this.reachedSlit) {
        // Draw wave packet traveling to slit
        p.stroke(this.color);
        p.noFill();

        const x = p.lerp(this.sourceX, this.targetX, this.progress);
        const y = p.lerp(this.sourceY, this.targetY, this.progress);

        const waveSize = 10 + 5 * Math.sin(this.phase);
        p.ellipse(x, y, waveSize, waveSize);

        this.phase += 0.2;
      } else {
        // Draw circular wave from slit
        p.stroke(this.color[0], this.color[1], this.color[2], this.amplitude * 255);
        p.noFill();

        // Draw several concentric circles to simulate waves
        for (let i = 0; i < 3; i++) {
          const radius = this.circleRadius - i * (this.wavelength / 30);
          if (radius > 0) {
            p.ellipse(this.targetX, this.targetY, radius * 2, radius * 2);
          }
        }
      }
    }

    hasReachedScreen() {
      return this.reachedSlit && this.circleRadius > p.dist(this.targetX, this.targetY, screenPositionX, p.height / 2);
    }
  }

  // Particle class
  class Particle {
    constructor(sourceX, sourceY, targetX, targetY, wavelength) {
      this.x = sourceX;
      this.y = sourceY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = p.map(wavelength, 400, 700, 5, 10);
      this.color = wavelengthToColor(wavelength);
      this.age = 0;
      this.passedSlit = false;
      this.finalY = targetY;

      // Calculate velocity
      const angle = p.atan2(targetY - sourceY, targetX - sourceX);
      this.vx = this.speed * p.cos(angle);
      this.vy = this.speed * p.sin(angle);
    }

    update() {
      if (!this.passedSlit) {
        // Move toward slit
        this.x += this.vx;
        this.y += this.vy;

        // Check if passed through slit
        if (this.x >= this.targetX) {
          this.passedSlit = true;

          // After passing slit, go in a slightly random direction
          this.finalY = this.y + p.random(-50, 50);

          // Ensure finalY is within canvas
          this.finalY = p.constrain(this.finalY, 50, p.height - 50);

          // Calculate new velocity toward detection screen
          const angle = p.atan2(this.finalY - this.y, screenPositionX - this.x);
          this.vx = this.speed * p.cos(angle);
          this.vy = this.speed * p.sin(angle);
        }
      } else {
        // Move toward screen
        this.x += this.vx;
        this.y += this.vy;
      }

      this.age++;
    }

    display() {
      p.fill(this.color);
      p.noStroke();
      p.ellipse(this.x, this.y, 8, 8);
    }

    hasReachedScreen() {
      return this.x >= screenPositionX;
    }
  }

  // Convert wavelength to RGB color
  function wavelengthToColor(wavelength) {
    let r, g, b;

    if (wavelength >= 380 && wavelength < 440) {
      r = -1 * (wavelength - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      r = 0;
      g = (wavelength - 440) / (490 - 440);
      b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      r = 0;
      g = 1;
      b = -1 * (wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1;
      g = -1 * (wavelength - 645) / (645 - 580);
      b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1;
      g = 0;
      b = 0;
    } else {
      r = 1;
      g = 1;
      b = 1;
    }

    return [r * 255, g * 255, b * 255];
  }

  // Initialize UI elements
  function initializeUI() {
    // Get slider references
    const wavelengthSlider = document.getElementById("wavelengthSlider");
    const slitWidthSlider = document.getElementById("slitWidthSlider");
    const slitDistanceSlider = document.getElementById("slitDistanceSlider");

    // Update function for sliders
    function updateValues() {
      wavelength = parseFloat(wavelengthSlider.value);
      slitWidth = parseFloat(slitWidthSlider.value);
      slitDistance = parseFloat(slitDistanceSlider.value);

      document.getElementById("wavelengthValue").innerText = wavelength;
      document.getElementById("slitWidthValue").innerText = slitWidth;
      document.getElementById("slitDistanceValue").innerText = slitDistance;
    }

    // Add event listeners to sliders
    wavelengthSlider.addEventListener("input", updateValues);
    slitWidthSlider.addEventListener("input", updateValues);
    slitDistanceSlider.addEventListener("input", updateValues);

    // Button controls
    document.getElementById("startButton").addEventListener("click", startSimulation);
    document.getElementById("pauseButton").addEventListener("click", pauseSimulation);
    document.getElementById("stopButton").addEventListener("click", endSimulation);

    // Call once to initialize values
    updateValues();
  }

  // Simulation control functions
  function startSimulation() {
    if (!running) {
      running = true;
      paused = false;
      particles = [];
      particleCount = 0;
      document.getElementById("particleCounter").innerText = particleCount;
      quantumTime = 0;
      document.getElementById("quantumClock").innerText = "0.00";

      lastUpdateTime = Date.now();
      startQuantumClock();
    } else if (paused) {
      paused = false;
      resumeQuantumClock();
    }
  }

  function pauseSimulation() {
    if (running) {
      paused = !paused;

      if (paused) {
        pauseQuantumClock();
      } else {
        resumeQuantumClock();
      }
    }
  }

  function endSimulation() {
    running = false;
    paused = false;
    particles = [];
    resetQuantumClock();
    particleCount = 0;
    document.getElementById("particleCounter").innerText = particleCount;
  }

  // Quantum clock functions
  function startQuantumClock() {
    quantumTime = 0;
    lastUpdateTime = Date.now();
    updateQuantumClock();
    clockInterval = setInterval(updateQuantumClock, 100);
  }

  function updateQuantumClock() {
    if (running && !paused) {
      quantumTime += (Date.now() - lastUpdateTime) / 1000;
      lastUpdateTime = Date.now();
      document.getElementById("quantumClock").innerText = quantumTime.toFixed(2);
    }
  }

  function pauseQuantumClock() {
    clearInterval(clockInterval);
  }

  function resumeQuantumClock() {
    lastUpdateTime = Date.now();
    clockInterval = setInterval(updateQuantumClock, 100);
  }

  function resetQuantumClock() {
    clearInterval(clockInterval);
    quantumTime = 0;
    document.getElementById("quantumClock").innerText = "0.00";
  }

  // Handle window resize
  p.windowResized = function() {
    canvasWidth = p.windowWidth;
    canvasHeight = p.windowHeight;
    p.resizeCanvas(canvasWidth, canvasHeight);

    slitPositionX = p.width * 0.3;
    screenPositionX = p.width * 0.8;
  };
});
