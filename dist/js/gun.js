/* Gun firing functionality for the Flight Simulator */

// Global variables for gun system
let bullets = [];
let lastFireTime = 0;
const FIRE_RATE = 0.2; // seconds between shots
const BULLET_SPEED = 300;
const BULLET_LIFETIME = 2; // seconds

// Initialize gun system
function initGunSystem() {
    // Reset bullets array
    bullets = [];
    
    // Add keyboard event listener for firing
    window.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            fireGun();
        }
    });
    
    console.log("Gun system initialized");
}

// Fire gun
function fireGun() {
    // Check fire rate
    const currentTime = clock.getElapsedTime();
    if (currentTime - lastFireTime < FIRE_RATE) return;
    
    lastFireTime = currentTime;
    
    // Create bullet
    if (aircraft) {
        // Get aircraft position and direction
        const position = aircraft.position.clone();
        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(aircraft.quaternion);
        
        // Create bullet geometry and material
        const bulletGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        
        // Create bullet mesh
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at aircraft nose
        const offset = direction.clone().multiplyScalar(5);
        bullet.position.copy(position).add(offset);
        
        // Add bullet data - increased bullet speed from 300 to 800
        bullet.userData = {
            velocity: direction.clone().multiplyScalar(800),
            creationTime: currentTime
        };
        
        // Add to scene and bullets array
        scene.add(bullet);
        bullets.push(bullet);
        
        // Add muzzle flash effect
        createMuzzleFlash(position, offset);
        
        // Add sound effect (commented out as per user request to focus on visuals)
        // playGunSound();
        
        console.log("Gun fired, bullet created with velocity:", bullet.userData.velocity.length());
    }
}

// Create muzzle flash effect
function createMuzzleFlash(position, offset) {
    // Create muzzle flash geometry and material
    const flashGeometry = new THREE.SphereGeometry(1, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFF00,
        transparent: true,
        opacity: 0.8
    });
    
    // Create muzzle flash mesh
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    // Position flash at gun muzzle
    flash.position.copy(position).add(offset);
    
    // Add to scene
    scene.add(flash);
    
    // Remove after short duration
    setTimeout(() => {
        scene.remove(flash);
    }, 100);
}

// Update bullets
function updateBullets(deltaTime) {
    const currentTime = clock.getElapsedTime();
    
    // Update each bullet
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Check lifetime
        if (currentTime - bullet.userData.creationTime > BULLET_LIFETIME) {
            // Remove expired bullet
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions
        checkBulletCollisions(bullet, i);
    }
}

// Check bullet collisions
function checkBulletCollisions(bullet, bulletIndex) {
    // Create bullet bounding sphere
    const bulletPosition = bullet.position.clone();
    const bulletRadius = 0.5;
    
    // Check collision with buildings
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        const buildingBox = new THREE.Box3().setFromObject(building);
        
        // Simple sphere-box collision check
        if (buildingBox.containsPoint(bulletPosition)) {
            // Collision detected
            createExplosion(bulletPosition, 0.5);
            
            // Remove bullet
            scene.remove(bullet);
            bullets.splice(bulletIndex, 1);
            return;
        }
    }
    
    // Check collision with other planes
    for (let i = 0; i < dynamicElements.planes.length; i++) {
        const plane = dynamicElements.planes[i].mesh;
        const planeBox = new THREE.Box3().setFromObject(plane);
        
        // Simple sphere-box collision check
        if (planeBox.containsPoint(bulletPosition)) {
            // Collision detected
            createExplosion(bulletPosition, 2);
            
            // Remove plane
            scene.remove(plane);
            dynamicElements.planes.splice(i, 1);
            
            // Remove bullet
            scene.remove(bullet);
            bullets.splice(bulletIndex, 1);
            return;
        }
    }
}

// Create explosion effect for bullet impact
function createExplosion(position, size) {
    // Create particle system for explosion
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Random position within small sphere
        const x = (Math.random() - 0.5) * size;
        const y = (Math.random() - 0.5) * size;
        const z = (Math.random() - 0.5) * size;
        
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
        duration: 0.5,
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
    bulletExplosionAnimations.push(explosionAnimation);
}

// Array to store bullet explosion animations
const bulletExplosionAnimations = [];

// Update bullet explosion animations
function updateBulletExplosionAnimations(delta) {
    for (let i = bulletExplosionAnimations.length - 1; i >= 0; i--) {
        const completed = bulletExplosionAnimations[i].update(delta);
        if (completed) {
            bulletExplosionAnimations.splice(i, 1);
        }
    }
}
