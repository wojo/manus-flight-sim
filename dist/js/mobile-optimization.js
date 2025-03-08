/* Mobile optimization for the Flight Simulator */

// Add this code to the end of main.js

// Mobile optimization functions
function optimizeForMobile() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log("Mobile device detected, applying optimizations");
        
        // Reduce render quality
        renderer.setPixelRatio(1);
        
        // Reduce shadow map size
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap; // Use basic shadow map for better performance
        
        // Reduce environment complexity
        reduceEnvironmentComplexity();
        
        // Adjust physics update rate
        adjustPhysicsUpdateRate();
        
        // Enable touch controls
        enableTouchControls();
        
        // Adjust viewport for mobile browsers
        adjustViewportForMobile();
    }
}

// Adjust viewport for mobile browsers to handle address bar
function adjustViewportForMobile() {
    // Set viewport height to handle address bar
    const setViewportHeight = () => {
        // First, get the visual viewport height
        const vh = window.innerHeight * 0.01;
        // Set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Apply the height to game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.height = `calc(var(--vh, 1vh) * 100)`;
        }
        
        // Adjust mobile controls position based on screen height
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            // Position controls at 70% of viewport height from top
            mobileControls.style.top = `calc(var(--vh, 1vh) * 70)`;
            mobileControls.style.bottom = 'auto';
            
            console.log("Mobile controls positioned at 70% of viewport height");
        }
    };
    
    // Set the height initially
    setViewportHeight();
    
    // Reset on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
}

// Reduce environment complexity for mobile
function reduceEnvironmentComplexity() {
    // Reduce number of clouds
    const maxClouds = 10;
    if (clouds.length > maxClouds) {
        for (let i = maxClouds; i < clouds.length; i++) {
            scene.remove(clouds[i].mesh);
        }
        clouds.splice(maxClouds);
    }
    
    // Reduce number of buildings
    const maxBuildings = 30;
    if (buildings.length > maxBuildings) {
        for (let i = maxBuildings; i < buildings.length; i++) {
            scene.remove(buildings[i]);
        }
        buildings.splice(maxBuildings);
    }
    
    // Reduce number of mountains
    const maxMountains = 8;
    if (mountains.length > maxMountains) {
        for (let i = maxMountains; i < mountains.length; i++) {
            scene.remove(mountains[i]);
        }
        mountains.splice(maxMountains);
    }
    
    // Reduce number of dynamic elements
    const maxCars = 8;
    if (dynamicElements.cars.length > maxCars) {
        for (let i = maxCars; i < dynamicElements.cars.length; i++) {
            scene.remove(dynamicElements.cars[i].mesh);
        }
        dynamicElements.cars.splice(maxCars);
    }
    
    const maxPlanes = 2;
    if (dynamicElements.planes.length > maxPlanes) {
        for (let i = maxPlanes; i < dynamicElements.planes.length; i++) {
            scene.remove(dynamicElements.planes[i].mesh);
        }
        dynamicElements.planes.splice(maxPlanes);
    }
    
    // Reduce fog density for better performance
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.0015);
    
    // Reduce world size
    environmentProperties.worldSize = 5000;
}

// Adjust physics update rate for mobile
function adjustPhysicsUpdateRate() {
    // Create a variable physics update rate based on device performance
    let lastTime = 0;
    let physicsAccumulator = 0;
    const physicsTimeStep = 1/30; // 30 physics updates per second instead of 60
    
    // Override the animate function
    window.animate = function() {
        requestAnimationFrame(animate);
        
        if (gameState.isRunning && !gameState.isPaused) {
            // Calculate delta time
            const currentTime = clock.getElapsedTime();
            deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Limit delta time to prevent large jumps
            const cappedDeltaTime = Math.min(deltaTime, 0.1);
            
            // Accumulate time for physics updates
            physicsAccumulator += cappedDeltaTime;
            
            // Update physics at a fixed rate
            while (physicsAccumulator >= physicsTimeStep) {
                updatePhysics(physicsTimeStep);
                physicsAccumulator -= physicsTimeStep;
            }
            
            // Update aircraft
            updateAircraft(cappedDeltaTime);
            
            // Update environment at a reduced rate
            updateEnvironment(cappedDeltaTime, currentTime);
            
            // Update camera position relative to aircraft
            updateCamera();
            
            // Update HUD
            updateHUD();
            
            // Update collision detection
            updateCollisionDetection();
            
            // Update explosion animations
            updateExplosionAnimations(cappedDeltaTime);
            
            // Render scene
            renderer.render(scene, camera);
        }
    };
}

// Enable touch controls
function enableTouchControls() {
    // Make mobile controls visible
    document.getElementById('mobile-controls').style.display = 'flex';
    document.getElementById('desktop-instructions').style.display = 'none';
    
    // Add orientation controls as an alternative to joystick
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    // Add throttle boost button for mobile
    addThrottleBoostButton();
}

// Add throttle boost button for mobile
function addThrottleBoostButton() {
    // Create boost button
    const boostButton = document.createElement('div');
    boostButton.id = 'throttle-boost';
    boostButton.className = 'boost-button';
    boostButton.textContent = 'BOOST';
    boostButton.style.position = 'absolute';
    boostButton.style.right = '20px';
    boostButton.style.bottom = '200px'; // Moved even higher to avoid overlap
    boostButton.style.backgroundColor = '#4CAF50';
    boostButton.style.color = 'white';
    boostButton.style.padding = '15px';
    boostButton.style.borderRadius = '50%';
    boostButton.style.width = '80px';
    boostButton.style.height = '80px';
    boostButton.style.display = 'flex';
    boostButton.style.justifyContent = 'center';
    boostButton.style.alignItems = 'center';
    boostButton.style.fontWeight = 'bold';
    boostButton.style.zIndex = '100';
    boostButton.style.userSelect = 'none';
    boostButton.style.touchAction = 'none';
    
    // Add to mobile controls
    const mobileControls = document.getElementById('mobile-controls');
    mobileControls.appendChild(boostButton);
    
    // Add event listeners
    boostButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        console.log("Boost button pressed");
        // Set throttle to maximum
        controlState.throttleValue = 1.0;
        aircraftPhysics.throttle = 1.0;
        this.style.backgroundColor = '#FF4500';
    });
    
    boostButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log("Boost button released");
        this.style.backgroundColor = '#4CAF50';
    });
    
    // Create fire button
    const fireButton = document.createElement('div');
    fireButton.id = 'fire-button';
    fireButton.className = 'fire-button';
    fireButton.textContent = 'FIRE';
    fireButton.style.position = 'absolute';
    fireButton.style.left = '20px';
    fireButton.style.bottom = '200px'; // Moved even higher to avoid overlap with throttle
    fireButton.style.backgroundColor = '#FF4500';
    fireButton.style.color = 'white';
    fireButton.style.padding = '15px';
    fireButton.style.borderRadius = '50%';
    fireButton.style.width = '80px';
    fireButton.style.height = '80px';
    fireButton.style.display = 'flex';
    fireButton.style.justifyContent = 'center';
    fireButton.style.alignItems = 'center';
    fireButton.style.fontWeight = 'bold';
    fireButton.style.zIndex = '100';
    fireButton.style.userSelect = 'none';
    fireButton.style.touchAction = 'none';
    
    // Add to mobile controls
    mobileControls.appendChild(fireButton);
    
    // Add event listeners
    fireButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        console.log("Fire button pressed");
        // Trigger gun firing
        fireGun();
        this.style.backgroundColor = '#CC0000';
    });
    
    fireButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log("Fire button released");
        this.style.backgroundColor = '#FF4500';
    });
}

// Handle device orientation for tilt controls
function handleDeviceOrientation(event) {
    if (!event.beta || !event.gamma || !event.alpha) return;
    
    // Always use orientation controls regardless of joystick state
    // Removed the joystick active check to ensure controls always work
    
    // Beta is front-to-back tilt in degrees, where front is positive (pitch)
    // Gamma is left-to-right tilt in degrees, where right is positive (roll)
    // Alpha is the compass direction, rotation around z-axis (yaw)
    
    // Convert to -1 to 1 range with increased sensitivity
    const pitchInput = Math.max(-1, Math.min(1, event.beta / 15)); // Further increased sensitivity
    const rollInput = Math.max(-1, Math.min(1, event.gamma / 15)); // Further increased sensitivity
    
    // Calculate yaw input from alpha changes
    // Store previous alpha to detect changes
    if (typeof this.lastAlpha === 'undefined') {
        this.lastAlpha = event.alpha;
        this.yawInput = 0;
    } else {
        // Calculate difference in alpha (compass direction)
        let alphaDiff = event.alpha - this.lastAlpha;
        
        // Handle wrap-around at 360 degrees
        if (alphaDiff > 180) alphaDiff -= 360;
        if (alphaDiff < -180) alphaDiff += 360;
        
        // Apply smoothing and sensitivity
        this.yawInput = Math.max(-1, Math.min(1, alphaDiff / 5));
        this.lastAlpha = event.alpha;
    }
    
    // Apply to control state - always apply these values
    controlState.joystickY = pitchInput;
    controlState.joystickX = rollInput;
    
    // Apply yaw input to control state
    if (Math.abs(this.yawInput) > 0.1) {
        // Only apply significant yaw changes to avoid drift
        if (this.yawInput > 0) {
            controlState.keyE = true;
            controlState.keyQ = false;
        } else {
            controlState.keyQ = true;
            controlState.keyE = false;
        }
    } else {
        controlState.keyQ = false;
        controlState.keyE = false;
    }
    
    // Force joystick to be considered active if there's significant tilt
    if (Math.abs(pitchInput) > 0.1 || Math.abs(rollInput) > 0.1) {
        controlState.joystickActive = true;
    }
    
    // Log orientation values occasionally
    if (Math.floor(elapsedTime) % 5 === 0 && Math.floor(elapsedTime * 10) % 10 === 0) {
        console.log("Device orientation - Beta:", event.beta.toFixed(2), 
                    "Gamma:", event.gamma.toFixed(2),
                    "Alpha:", event.alpha.toFixed(2),
                    "Applied values - Pitch:", pitchInput.toFixed(2),
                    "Roll:", rollInput.toFixed(2),
                    "Yaw:", this.yawInput ? this.yawInput.toFixed(2) : "N/A",
                    "Joystick active:", controlState.joystickActive);
    }
}

// Call optimization function when page loads
window.addEventListener('load', function() {
    // Wait a bit to ensure everything else is initialized
    setTimeout(optimizeForMobile, 500);
});
