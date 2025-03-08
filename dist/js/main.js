/* Main.js - Core rendering and game loop for the Flight Simulator */

// Global variables
let scene, camera, renderer;
let clock = new THREE.Clock();
let deltaTime = 0;
let elapsedTime = 0;

// Game state
const gameState = {
    isLoading: true,
    isRunning: false,
    isPaused: false
};

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.0007);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.set(0, 10, 20); // Initial camera position behind the aircraft
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add lights
    addLights();
    
    // Initialize environment
    initEnvironment();
    
    // Initialize aircraft
    initAircraft();
    
    // Initialize physics
    initPhysics();
    
    // Initialize controls
    initControls();
    
    // Initialize collision detection
    initCollisionDetection();
    
    // Initialize gun system
    initGunSystem();
    
    // Initialize sky objects
    initSkyObjects();
    
    // Initialize global attitude indicator
    createGlobalAttitudeIndicator();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading screen and start game
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        gameState.isLoading = false;
        gameState.isRunning = true;
    }, 2000);
    
    // Start animation loop
    animate();
}

// Add lights to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    scene.add(directionalLight);
    
    // Hemisphere light (sky and ground)
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3d3d3d, 0.3);
    scene.add(hemisphereLight);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState.isRunning && !gameState.isPaused) {
        // Calculate delta time
        deltaTime = clock.getDelta();
        elapsedTime = clock.getElapsedTime();
        
        // Process controls
        processControls(deltaTime);
        
        // Update physics
        updatePhysics(deltaTime);
        
        // Update aircraft
        updateAircraft(deltaTime);
        
        // Update environment
        updateEnvironment(deltaTime, elapsedTime);
        
        // Update sky objects
        updateSkyObjects(deltaTime);
        
        // Update collision detection
        updateCollisionDetection();
        
        // Update explosion animations
        updateExplosionAnimations(deltaTime);
        
        // Update bullets
        updateBullets(deltaTime);
        
        // Update bullet explosion animations
        updateBulletExplosionAnimations(deltaTime);
        
        // Update camera position relative to aircraft
        updateCamera();
        
        // Update HUD
        updateHUD();
        
        // Render scene
        renderer.render(scene, camera);
    }
}

// Update camera position relative to aircraft
function updateCamera() {
    if (aircraft) {
        // Get aircraft position and rotation
        const aircraftPosition = aircraft.position.clone();
        const aircraftRotation = aircraft.rotation.clone();
        
        // Calculate camera offset based on aircraft orientation
        const offset = new THREE.Vector3(0, 5, -15); // Position camera above and behind aircraft
        offset.applyQuaternion(aircraft.quaternion);
        
        // Set camera position
        camera.position.copy(aircraftPosition).add(offset);
        
        // Look at a point slightly ahead of the aircraft
        const lookAtPoint = aircraftPosition.clone();
        const forwardVector = new THREE.Vector3(0, 0, 10);
        forwardVector.applyQuaternion(aircraft.quaternion);
        lookAtPoint.add(forwardVector);
        
        camera.lookAt(lookAtPoint);
    }
}

// Update HUD information
function updateHUD() {
    if (aircraft) {
        // Update speed indicator
        const speedElement = document.querySelector('#speed-indicator .value');
        const speed = Math.round(aircraftPhysics.velocity.length() * 1.94384); // Convert m/s to knots
        speedElement.textContent = speed;
        
        // Update altitude indicator
        const altitudeElement = document.querySelector('#altitude-indicator .value');
        const altitude = Math.round(aircraft.position.y * 3.28084); // Convert meters to feet
        altitudeElement.textContent = altitude;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init);
