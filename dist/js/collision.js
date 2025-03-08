/* Collision detection module for the Flight Simulator */

// Add this code to the physics.js file

// Collision objects array
let collisionObjects = [];

// Initialize collision detection
function initCollisionDetection() {
    // Reset collision objects array
    collisionObjects = [];
    
    // Add buildings to collision objects
    buildings.forEach(building => {
        collisionObjects.push({
            type: 'building',
            mesh: building,
            boundingBox: new THREE.Box3().setFromObject(building)
        });
    });
    
    // Add mountains to collision objects
    mountains.forEach(mountain => {
        collisionObjects.push({
            type: 'mountain',
            mesh: mountain,
            boundingBox: new THREE.Box3().setFromObject(mountain)
        });
    });
    
    // Add other planes to collision objects
    dynamicElements.planes.forEach(plane => {
        collisionObjects.push({
            type: 'plane',
            mesh: plane.mesh,
            boundingBox: new THREE.Box3().setFromObject(plane.mesh),
            dynamic: true,
            data: plane
        });
    });
    
    // Add ground as a collision object
    collisionObjects.push({
        type: 'ground',
        y: 0,
        isGround: true
    });
}

// Update collision detection
function updateCollisionDetection() {
    if (!aircraft || !aircraftProperties.modelLoaded) return;
    
    // Create aircraft bounding box
    const aircraftBoundingBox = new THREE.Box3().setFromObject(aircraft);
    
    // Check for collisions with all objects
    for (let i = 0; i < collisionObjects.length; i++) {
        const object = collisionObjects[i];
        
        // Special case for ground
        if (object.isGround) {
            // Ground collision is already handled in checkGroundCollision()
            continue;
        }
        
        // Update bounding box for dynamic objects
        if (object.dynamic) {
            object.boundingBox.setFromObject(object.mesh);
        }
        
        // Check for intersection
        if (aircraftBoundingBox.intersectsBox(object.boundingBox)) {
            // Collision detected!
            handleCollision(object);
            break;
        }
    }
}

// Handle collision with an object
function handleCollision(object) {
    // Create explosion effect
    createExplosionEffect(aircraftPhysics.position);
    
    // Reset aircraft
    setTimeout(() => {
        resetAircraft();
    }, 1000);
    
    // Display collision message
    displayCollisionMessage(object.type);
}

// Create explosion effect
function createExplosionEffect(position) {
    // Create particle system for explosion
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Random position within small sphere
        const x = (Math.random() - 0.5) * 5;
        const y = (Math.random() - 0.5) * 5;
        const z = (Math.random() - 0.5) * 5;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Color gradient from yellow to red
        const shade = Math.random() * 0.5 + 0.5;
        color.setHSL(0.1 * shade, 1, 0.5);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 1.0
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.copy(position);
    scene.add(particleSystem);
    
    // Animate explosion
    const explosionAnimation = {
        time: 0,
        duration: 1.0,
        update: function(delta) {
            this.time += delta;
            const progress = this.time / this.duration;
            
            if (progress >= 1.0) {
                scene.remove(particleSystem);
                return true; // Animation complete
            }
            
            // Expand particles
            const positions = particles.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] *= 1.05;
                positions[i * 3 + 1] *= 1.05;
                positions[i * 3 + 2] *= 1.05;
            }
            particles.attributes.position.needsUpdate = true;
            
            // Fade out
            particleMaterial.opacity = 1.0 - progress;
            
            return false; // Animation in progress
        }
    };
    
    // Add to animations
    explosionAnimations.push(explosionAnimation);
}

// Array to store explosion animations
const explosionAnimations = [];

// Update explosion animations
function updateExplosionAnimations(delta) {
    for (let i = explosionAnimations.length - 1; i >= 0; i--) {
        const completed = explosionAnimations[i].update(delta);
        if (completed) {
            explosionAnimations.splice(i, 1);
        }
    }
}

// Display collision message
function displayCollisionMessage(objectType) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('collision-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'collision-message';
        messageElement.style.position = 'absolute';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        messageElement.style.color = 'white';
        messageElement.style.padding = '20px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.fontWeight = 'bold';
        messageElement.style.fontSize = '24px';
        messageElement.style.textAlign = 'center';
        messageElement.style.zIndex = '1000';
        document.body.appendChild(messageElement);
    }
    
    // Set message based on object type
    messageElement.textContent = `Collision with ${objectType}! Resetting aircraft...`;
    
    // Show message
    messageElement.style.display = 'block';
    
    // Hide message after delay
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// Add to the animate function in main.js
function updateWithCollisionDetection() {
    // Update collision detection
    updateCollisionDetection();
    
    // Update explosion animations
    updateExplosionAnimations(deltaTime);
}
