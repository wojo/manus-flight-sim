/* Controls.js - User input handling for the Flight Simulator */

// Control state
const controlState = {
    // Keyboard controls
    keyW: false, // Pitch down
    keyS: false, // Pitch up
    keyA: false, // Roll left
    keyD: false, // Roll right
    keyQ: false, // Yaw left
    keyE: false, // Yaw right
    keyShift: false, // Throttle up
    keyCtrl: false, // Throttle down
    keySpace: false, // Brake
    keyR: false, // Reset position
    
    // Mobile controls
    throttleValue: 0,
    joystickX: 0,
    joystickY: 0,
    
    // Touch tracking
    touchId: null,
    joystickActive: false
};

// Initialize controls
function initControls() {
    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Add mobile control event listeners
    initMobileControls();
    
    // Check device type and show/hide appropriate controls
    checkDeviceType();
}

// Check device type and adjust UI accordingly
function checkDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.getElementById('mobile-controls').style.display = 'flex';
        document.getElementById('desktop-instructions').style.display = 'none';
    } else {
        document.getElementById('mobile-controls').style.display = 'none';
        document.getElementById('desktop-instructions').style.display = 'block';
    }
}

// Handle keyboard key down events
function handleKeyDown(event) {
    updateKeyState(event.code, true);
}

// Handle keyboard key up events
function handleKeyUp(event) {
    updateKeyState(event.code, false);
}

// Update key state based on key code
function updateKeyState(code, isPressed) {
    switch (code) {
        case 'KeyW':
            controlState.keyW = isPressed;
            break;
        case 'KeyS':
            controlState.keyS = isPressed;
            break;
        case 'KeyA':
            controlState.keyA = isPressed;
            break;
        case 'KeyD':
            controlState.keyD = isPressed;
            break;
        case 'KeyQ':
            controlState.keyQ = isPressed;
            break;
        case 'KeyE':
            controlState.keyE = isPressed;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            controlState.keyShift = isPressed;
            break;
        case 'ControlLeft':
        case 'ControlRight':
            controlState.keyCtrl = isPressed;
            break;
        case 'Space':
            controlState.keySpace = isPressed;
            break;
        case 'KeyR':
            if (isPressed) {
                resetAircraft();
            }
            controlState.keyR = isPressed;
            break;
    }
}

// Initialize mobile controls
function initMobileControls() {
    // Throttle slider
    const throttleSlider = document.getElementById('throttle-slider');
    throttleSlider.addEventListener('input', function() {
        controlState.throttleValue = this.value / 100;
    });
    
    // Joystick
    const joystickBase = document.getElementById('joystick-base');
    const joystickHandle = document.getElementById('joystick-handle');
    
    // Get joystick dimensions and center position
    const joystickRect = joystickBase.getBoundingClientRect();
    const joystickCenterX = joystickRect.width / 2;
    const joystickCenterY = joystickRect.height / 2;
    const joystickRadius = joystickRect.width / 2 - 25; // Subtract handle radius
    
    // Touch events for joystick
    joystickBase.addEventListener('touchstart', function(event) {
        event.preventDefault();
        handleJoystickTouch(event, joystickBase, joystickHandle, joystickCenterX, joystickCenterY, joystickRadius);
    });
    
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (controlState.joystickActive) {
            handleJoystickMove(event, joystickBase, joystickHandle, joystickCenterX, joystickCenterY, joystickRadius);
        }
    });
    
    document.addEventListener('touchend', function(event) {
        if (controlState.joystickActive) {
            handleJoystickEnd(event, joystickHandle, joystickCenterX, joystickCenterY);
        }
    });
    
    // Add debug overlay for mobile controls
    addMobileControlsDebug();
}

// Add debug overlay for mobile controls
function addMobileControlsDebug() {
    // Create debug overlay
    const debugOverlay = document.createElement('div');
    debugOverlay.id = 'mobile-debug';
    debugOverlay.style.position = 'absolute';
    debugOverlay.style.top = '10px';
    debugOverlay.style.right = '10px';
    debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    debugOverlay.style.color = 'white';
    debugOverlay.style.padding = '5px';
    debugOverlay.style.borderRadius = '5px';
    debugOverlay.style.fontSize = '12px';
    debugOverlay.style.zIndex = '1000';
    debugOverlay.style.pointerEvents = 'none';
    
    // Add to body
    document.body.appendChild(debugOverlay);
    
    // Update debug info periodically
    setInterval(() => {
        debugOverlay.innerHTML = `
            Joystick: ${controlState.joystickActive ? 'Active' : 'Inactive'}<br>
            X: ${controlState.joystickX.toFixed(2)}<br>
            Y: ${controlState.joystickY.toFixed(2)}<br>
            Throttle: ${controlState.throttleValue.toFixed(2)}<br>
            Velocity: ${aircraftPhysics ? aircraftPhysics.velocity.length().toFixed(2) : 'N/A'}<br>
            Height: ${aircraftPhysics ? aircraftPhysics.position.y.toFixed(2) : 'N/A'}
        `;
    }, 100);
}

// Handle joystick touch start
function handleJoystickTouch(event, joystickBase, joystickHandle, centerX, centerY, radius) {
    const touch = event.touches[0];
    const rect = joystickBase.getBoundingClientRect();
    
    // Check if touch is within joystick base
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    const distance = Math.sqrt(Math.pow(touchX - centerX, 2) + Math.pow(touchY - centerY, 2));
    
    // Always activate joystick when touched anywhere in the base
    // Removed distance check to make it more responsive
    controlState.touchId = touch.identifier;
    controlState.joystickActive = true;
    
    // Move joystick handle to touch position
    moveJoystickHandle(touchX, touchY, joystickHandle, centerX, centerY, radius);
    
    console.log("Joystick activated at:", touchX, touchY);
}

// Handle joystick movement
function handleJoystickMove(event, joystickBase, joystickHandle, centerX, centerY, radius) {
    // Find the touch that matches our tracked ID
    let touch = null;
    for (let i = 0; i < event.touches.length; i++) {
        if (event.touches[i].identifier === controlState.touchId) {
            touch = event.touches[i];
            break;
        }
    }
    
    if (!touch) return;
    
    const rect = joystickBase.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Move joystick handle to touch position
    moveJoystickHandle(touchX, touchY, joystickHandle, centerX, centerY, radius);
}

// Handle joystick touch end
function handleJoystickEnd(event, joystickHandle, centerX, centerY) {
    // Check if our tracked touch has ended
    let touchFound = false;
    for (let i = 0; i < event.touches.length; i++) {
        if (event.touches[i].identifier === controlState.touchId) {
            touchFound = true;
            break;
        }
    }
    
    if (!touchFound) {
        // Reset joystick
        controlState.joystickActive = false;
        controlState.touchId = null;
        controlState.joystickX = 0;
        controlState.joystickY = 0;
        
        // Center the joystick handle
        joystickHandle.style.transform = `translate(0px, 0px)`;
    }
}

// Move joystick handle and update control values
function moveJoystickHandle(touchX, touchY, joystickHandle, centerX, centerY, radius) {
    // Calculate distance from center
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize values between -1 and 1
    if (distance > radius) {
        // Clamp to edge of joystick
        const angle = Math.atan2(deltaY, deltaX);
        const limitedX = Math.cos(angle) * radius;
        const limitedY = Math.sin(angle) * radius;
        
        joystickHandle.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
        
        // Set control values (normalized -1 to 1)
        controlState.joystickX = limitedX / radius;
        controlState.joystickY = limitedY / radius;
    } else {
        // Move within joystick
        joystickHandle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Set control values (normalized -1 to 1)
        controlState.joystickX = deltaX / radius;
        controlState.joystickY = deltaY / radius;
    }
}

// Process controls and apply to aircraft physics
function processControls(deltaTime) {
    // Process keyboard controls
    if (controlState.keyShift) {
        // Increase throttle
        aircraftPhysics.throttle = Math.min(1, aircraftPhysics.throttle + deltaTime * 0.5);
    }
    
    if (controlState.keyCtrl) {
        // Decrease throttle
        aircraftPhysics.throttle = Math.max(0, aircraftPhysics.throttle - deltaTime * 0.5);
    }
    
    // Apply braking
    aircraftPhysics.braking = controlState.keySpace;
    
    // Calculate control inputs for rotation
    let pitchInput = 0;
    let rollInput = 0;
    let yawInput = 0;
    
    // Keyboard inputs
    if (controlState.keyW) pitchInput -= 1;
    if (controlState.keyS) pitchInput += 1;
    if (controlState.keyA) rollInput -= 1;
    if (controlState.keyD) rollInput += 1;
    if (controlState.keyQ) yawInput -= 1;
    if (controlState.keyE) yawInput += 1;
    
    // CRITICAL FIX: Always apply mobile throttle value directly to aircraft physics
    // This ensures throttle works even if joystick is not active
    if (controlState.throttleValue > 0) {
        aircraftPhysics.throttle = controlState.throttleValue;
        console.log("Applied throttle directly:", controlState.throttleValue);
    }
    
    // Mobile inputs - CRITICAL FIX: Always apply joystick values regardless of active state
    if (controlState.joystickActive) {
        // When joystick is actively being touched
        pitchInput += controlState.joystickY;
        rollInput += controlState.joystickX;
        
        // Log mobile control values for debugging
        console.log("Active joystick - X:", controlState.joystickX, "Y:", controlState.joystickY);
    } else if (controlState.joystickX !== 0 || controlState.joystickY !== 0) {
        // When using device orientation or other inputs
        pitchInput += controlState.joystickY;
        rollInput += controlState.joystickX;
        
        // Automatically apply some throttle when tilting for mobile users
        if (Math.abs(controlState.joystickY) > 0.3 || Math.abs(controlState.joystickX) > 0.3) {
            aircraftPhysics.throttle = Math.min(1, aircraftPhysics.throttle + deltaTime * 0.2);
        }
        
        console.log("Orientation controls - X:", controlState.joystickX, "Y:", controlState.joystickY);
    }
    
    // CRITICAL FIX: Force apply significant inputs to ensure controls work
    if (Math.abs(pitchInput) > 0.1 || Math.abs(rollInput) > 0.1 || Math.abs(yawInput) > 0.1) {
        // Apply rotation inputs to angular velocity with increased responsiveness
        aircraftPhysics.angularVelocity.x = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.x,
            pitchInput * PHYSICS.PITCH_RATE,
            deltaTime * 10  // Increased from 5 to 10 for more responsive controls
        );
        
        aircraftPhysics.angularVelocity.z = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.z,
            -rollInput * PHYSICS.ROLL_RATE,
            deltaTime * 10  // Increased from 5 to 10 for more responsive controls
        );
        
        aircraftPhysics.angularVelocity.y = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.y,
            yawInput * PHYSICS.YAW_RATE,
            deltaTime * 10  // Increased from 5 to 10 for more responsive controls
        );
    } else {
        // Apply with normal responsiveness for small inputs
        aircraftPhysics.angularVelocity.x = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.x,
            pitchInput * PHYSICS.PITCH_RATE,
            deltaTime * 5
        );
        
        aircraftPhysics.angularVelocity.z = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.z,
            -rollInput * PHYSICS.ROLL_RATE,
            deltaTime * 5
        );
        
        aircraftPhysics.angularVelocity.y = THREE.MathUtils.lerp(
            aircraftPhysics.angularVelocity.y,
            yawInput * PHYSICS.YAW_RATE,
            deltaTime * 5
        );
    }
    
    // Log physics state for debugging - increased frequency for testing
    if (Math.floor(elapsedTime) % 2 === 0 && Math.floor(elapsedTime * 10) % 10 === 0) {
        console.log("Physics state - Throttle:", aircraftPhysics.throttle.toFixed(2), 
                    "Velocity:", aircraftPhysics.velocity.length().toFixed(2),
                    "Position Y:", aircraftPhysics.position.y.toFixed(2),
                    "Angular velocity:", 
                    "X:", aircraftPhysics.angularVelocity.x.toFixed(2),
                    "Y:", aircraftPhysics.angularVelocity.y.toFixed(2),
                    "Z:", aircraftPhysics.angularVelocity.z.toFixed(2));
    }
}
