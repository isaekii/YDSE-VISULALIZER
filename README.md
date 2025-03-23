Observer Effect in Double-Slit Experiment
This project is an interactive simulation of the quantum double-slit experiment, demonstrating the observer effect using real-time webcam-based eye detection. When your eyes are open (observer active), particles exhibit particle-like behavior; when your eyes are closed (observer inactive), they exhibit wave-like interference patterns.

Features
Real-time Observer Detection: Uses MediaPipe FaceMesh to detect eye openness via webcam, toggling between particle and wave behavior.
Adjustable Parameters:
Wavelength (400–700 nm)
Slit Width (0.05–0.5 mm)
Slit Distance (0.2–1.0 mm)
Simulation Controls: Start, pause, and stop the experiment.
Visual Feedback: Displays quantum time and particle detection count.
Interactive Graphics: Built with p5.js for dynamic visualization of particles and waves.
Usage
Setup: Open index.html in a modern browser (Chrome/Firefox recommended).
Allow Webcam Access: Grant permission for webcam use when prompted.
Interact:
Start: Click "Start" to begin the simulation.
Observer Effect: Open your eyes to observe particle behavior; close them for wave behavior.
Adjust Settings: Use sliders to tweak wavelength, slit width, and slit distance.
Pause/Stop: Pause to freeze the simulation or stop to reset it.
Monitor: Check "Quantum Time" and "Particles Detected" in the info panel.
Installation
To run this simulation locally:

Clone or download this repository.
Ensure an internet connection for CDN-hosted libraries (p5.js, MediaPipe, TensorFlow.js).
Open index.html in a browser with webcam support.
No additional server setup is required, but a live server (e.g., via VS Code's Live Server extension) may improve performance.

Technologies
HTML5: Structure and UI.
CSS3: Styling and responsive design.
JavaScript:
p5.js: Canvas-based graphics and animation.
MediaPipe FaceMesh: Facial landmark detection for eye tracking.
TensorFlow.js: Backend support for MediaPipe.
Webcam API: Real-time video input.
Dependencies
Loaded via CDN in index.html:

p5.js: https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js
MediaPipe FaceMesh: https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh
TensorFlow.js:
https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core
https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter
https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl
Limitations
Requires a webcam and sufficient lighting for accurate eye detection.
Performance may vary depending on browser and hardware.
Wave interference is simplified for visualization and may not fully represent quantum mechanics.
