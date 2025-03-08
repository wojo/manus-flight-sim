// Create attitude indicator for all devices
function createGlobalAttitudeIndicator() {
    // Create container for attitude indicator
    const attitudeContainer = document.createElement('div');
    attitudeContainer.id = 'attitude-indicator';
    attitudeContainer.style.position = 'absolute';
    attitudeContainer.style.top = '20px';
    attitudeContainer.style.left = '50%';
    attitudeContainer.style.transform = 'translateX(-50%)';
    attitudeContainer.style.width = '120px';
    attitudeContainer.style.height = '120px';
    attitudeContainer.style.borderRadius = '50%';
    attitudeContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    attitudeContainer.style.overflow = 'hidden';
    attitudeContainer.style.zIndex = '100';
    attitudeContainer.style.border = '3px solid white';
    
    // Create horizon element
    const horizon = document.createElement('div');
    horizon.id = 'horizon';
    horizon.style.position = 'absolute';
    horizon.style.width = '200%';
    horizon.style.height = '200%';
    horizon.style.left = '-50%';
    horizon.style.top = '50%';
    horizon.style.background = 'linear-gradient(to bottom, #87CEEB 50%, #8B4513 50%)';
    horizon.style.transformOrigin = 'center';
    attitudeContainer.appendChild(horizon);
    
    // Create center marker
    const centerMarker = document.createElement('div');
    centerMarker.style.position = 'absolute';
    centerMarker.style.width = '10px';
    centerMarker.style.height = '10px';
    centerMarker.style.borderRadius = '50%';
    centerMarker.style.backgroundColor = 'yellow';
    centerMarker.style.top = '50%';
    centerMarker.style.left = '50%';
    centerMarker.style.transform = 'translate(-50%, -50%)';
    attitudeContainer.appendChild(centerMarker);
    
    // Create level indicators
    const leftBar = document.createElement('div');
    leftBar.style.position = 'absolute';
    leftBar.style.width = '30px';
    leftBar.style.height = '4px';
    leftBar.style.backgroundColor = 'yellow';
    leftBar.style.top = '50%';
    leftBar.style.left = '10px';
    leftBar.style.transform = 'translateY(-50%)';
    attitudeContainer.appendChild(leftBar);
    
    const rightBar = document.createElement('div');
    rightBar.style.position = 'absolute';
    rightBar.style.width = '30px';
    rightBar.style.height = '4px';
    rightBar.style.backgroundColor = 'yellow';
    rightBar.style.top = '50%';
    rightBar.style.right = '10px';
    rightBar.style.transform = 'translateY(-50%)';
    attitudeContainer.appendChild(rightBar);
    
    // Create "level" button
    const levelButton = document.createElement('div');
    levelButton.id = 'level-button';
    levelButton.className = 'level-button';
    levelButton.textContent = 'LEVEL';
    levelButton.style.position = 'absolute';
    levelButton.style.top = '150px';
    levelButton.style.left = '50%';
    levelButton.style.transform = 'translateX(-50%)';
    levelButton.style.backgroundColor = '#4169E1';
    levelButton.style.color = 'white';
    levelButton.style.padding = '10px';
    levelButton.style.borderRadius = '5px';
    levelButton.style.fontSize = '14px';
    levelButton.style.fontWeight = 'bold';
    levelButton.style.zIndex = '100';
    levelButton.style.userSelect = 'none';
    levelButton.style.touchAction = 'none';
    levelButton.style.cursor = 'pointer'; // Add cursor pointer for desktop
    
    // Add event listeners for both touch and mouse
    levelButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        console.log("Level button pressed (touch)");
        // Reset aircraft orientation to level flight
        levelAircraft();
        this.style.backgroundColor = '#1E90FF';
    });
    
    levelButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log("Level button released (touch)");
        this.style.backgroundColor = '#4169E1';
    });
    
    // Add mouse events for desktop
    levelButton.addEventListener('mousedown', function(e) {
        console.log("Level button pressed (mouse)");
        // Reset aircraft orientation to level flight
        levelAircraft();
        this.style.backgroundColor = '#1E90FF';
    });
    
    levelButton.addEventListener('mouseup', function(e) {
        console.log("Level button released (mouse)");
        this.style.backgroundColor = '#4169E1';
    });
    
    // Add elements to game container (works for both mobile and desktop)
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.appendChild(attitudeContainer);
        gameContainer.appendChild(levelButton);
        console.log("Added attitude indicator to game container");
    } else {
        console.error("Game container not found");
        // Fallback to body if game container not found
        document.body.appendChild(attitudeContainer);
        document.body.appendChild(levelButton);
    }
    
    // Update attitude indicator
    setInterval(updateAttitudeIndicator, 16); // ~60fps
}

// Update attitude indicator based on aircraft orientation
function updateAttitudeIndicator() {
    if (!aircraft) return;
    
    const horizon = document.getElementById('horizon');
    if (!horizon) return;
    
    // Get aircraft pitch and roll
    const pitch = aircraft.rotation.x;
    const roll = aircraft.rotation.z;
    
    // Apply transformations to horizon
    // Roll is applied as rotation, pitch as vertical translation
    const pitchTranslation = -pitch * 50; // Scale factor for visual effect
    horizon.style.transform = `translateY(${pitchTranslation}px) rotate(${-roll}rad)`;
}

// Level the aircraft
function levelAircraft() {
    if (!aircraftPhysics) return;
    
    // Gradually reset orientation to level flight
    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.setFromEuler(new THREE.Euler(0, aircraftPhysics.quaternion.y, 0));
    
    // Apply the level orientation
    aircraftPhysics.quaternion.copy(targetQuaternion);
    
    // Reset angular velocity
    aircraftPhysics.angularVelocity.set(0, 0, 0);
    
    console.log("Aircraft leveled");
}
