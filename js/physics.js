/* Physics.js - Flight physics engine for the Flight Simulator */

// Global physics variables
let aircraftPhysics = {
    position: new THREE.Vector3(0, 1.5, 0),
    quaternion: new THREE.Quaternion(),
    velocity: new THREE.Vector3(0, 0, 0),
    acceleration: new THREE.Vector3(0, 0, 0),
    angularVelocity: new THREE.Vector3(0, 0, 0),
    throttle: 0,
    lift: 0,
    drag: 0,
    thrust: 0,
    weight: 9.8, // gravity * mass
    onGround: true,
    braking: false
};

// Physics constants
const PHYSICS = {
    GRAVITY: 9.8,
    MAX_THRUST: 40, // Increased from 20 to 40 for better takeoff
    LIFT_COEFFICIENT: 0.2, // Increased from 0.1 to 0.2 for better lift
    DRAG_COEFFICIENT: 0.01, // Reduced from 0.02 to 0.01 for less drag
    ROLL_RATE: 1.5,
    PITCH_RATE: 1.0,
    YAW_RATE: 0.8,
    GROUND_FRICTION: 0.03, // Reduced from 0.05 to 0.03 for easier movement on ground
    BRAKE_FORCE: 0.2,
    STALL_SPEED: 8, // Reduced from 10 to 8 for easier takeoff
    STALL_ANGLE: 0.3, // radians
    GROUND_LEVEL: 0
};

// Initialize physics
function initPhysics() {
    // Reset physics state
    aircraftPhysics.position.set(0, 1.5, 0);
    aircraftPhysics.quaternion.set(0, 0, 0, 1);
    aircraftPhysics.velocity.set(0, 0, 0);
    aircraftPhysics.acceleration.set(0, 0, 0);
    aircraftPhysics.angularVelocity.set(0, 0, 0);
    aircraftPhysics.throttle = 0;
    aircraftPhysics.lift = 0;
    aircraftPhysics.drag = 0;
    aircraftPhysics.thrust = 0;
    aircraftPhysics.onGround = true;
    aircraftPhysics.braking = false;
}

// Update physics
function updatePhysics(deltaTime) {
    // Calculate forces
    calculateForces();
    
    // Apply angular velocity (rotation)
    applyRotation(deltaTime);
    
    // Apply acceleration and velocity (translation)
    applyTranslation(deltaTime);
    
    // Check for ground collision
    checkGroundCollision();
}

// Calculate aerodynamic forces
function calculateForces() {
    // Get forward direction vector
    const forwardVector = new THREE.Vector3(0, 0, 1);
    forwardVector.applyQuaternion(aircraftPhysics.quaternion);
    
    // Get up direction vector
    const upVector = new THREE.Vector3(0, 1, 0);
    upVector.applyQuaternion(aircraftPhysics.quaternion);
    
    // Calculate airspeed (magnitude of velocity)
    const airspeed = aircraftPhysics.velocity.length();
    
    // Calculate angle of attack (angle between velocity and forward vector)
    let angleOfAttack = 0;
    if (airspeed > 0.1) {
        const normalizedVelocity = aircraftPhysics.velocity.clone().normalize();
        angleOfAttack = Math.acos(normalizedVelocity.dot(forwardVector));
    }
    
    // Calculate thrust based on throttle
    aircraftPhysics.thrust = aircraftPhysics.throttle * PHYSICS.MAX_THRUST;
    
    // Calculate lift (perpendicular to velocity, scaled by airspeed squared)
    // Lift increases with airspeed and angle of attack up to stall angle
    let liftCoefficient = PHYSICS.LIFT_COEFFICIENT;
    if (angleOfAttack > PHYSICS.STALL_ANGLE) {
        // Reduce lift when stalling (angle of attack too high)
        liftCoefficient *= Math.max(0, 1 - (angleOfAttack - PHYSICS.STALL_ANGLE) * 3);
    }
    
    aircraftPhysics.lift = airspeed * airspeed * liftCoefficient;
    
    // Calculate drag (opposite to velocity, scaled by airspeed squared)
    aircraftPhysics.drag = airspeed * airspeed * PHYSICS.DRAG_COEFFICIENT;
    
    // Apply additional drag when braking on ground
    if (aircraftPhysics.onGround && aircraftPhysics.braking) {
        aircraftPhysics.drag += airspeed * PHYSICS.BRAKE_FORCE;
    }
}

// Apply rotation based on control inputs and angular velocity
function applyRotation(deltaTime) {
    // Apply angular velocity to quaternion
    const angularDelta = aircraftPhysics.angularVelocity.clone().multiplyScalar(deltaTime);
    
    // Convert angular velocity to quaternion delta
    const qDelta = new THREE.Quaternion();
    qDelta.setFromEuler(new THREE.Euler(angularDelta.x, angularDelta.y, angularDelta.z));
    
    // Apply rotation
    aircraftPhysics.quaternion.premultiply(qDelta);
    aircraftPhysics.quaternion.normalize();
    
    // Apply damping to angular velocity
    aircraftPhysics.angularVelocity.multiplyScalar(0.95);
}

// Apply translation based on forces and velocity
function applyTranslation(deltaTime) {
    // Get forward and up vectors
    const forwardVector = new THREE.Vector3(0, 0, 1);
    forwardVector.applyQuaternion(aircraftPhysics.quaternion);
    
    const upVector = new THREE.Vector3(0, 1, 0);
    upVector.applyQuaternion(aircraftPhysics.quaternion);
    
    // Reset acceleration
    aircraftPhysics.acceleration.set(0, 0, 0);
    
    // Apply thrust in forward direction
    const thrustForce = forwardVector.clone().multiplyScalar(aircraftPhysics.thrust);
    aircraftPhysics.acceleration.add(thrustForce);
    
    // Apply lift in up direction
    const liftForce = upVector.clone().multiplyScalar(aircraftPhysics.lift);
    aircraftPhysics.acceleration.add(liftForce);
    
    // Apply drag in opposite direction of velocity
    if (aircraftPhysics.velocity.length() > 0.01) {
        const dragDirection = aircraftPhysics.velocity.clone().normalize().negate();
        const dragForce = dragDirection.multiplyScalar(aircraftPhysics.drag);
        aircraftPhysics.acceleration.add(dragForce);
    }
    
    // Apply gravity
    aircraftPhysics.acceleration.y -= PHYSICS.GRAVITY;
    
    // Apply ground friction when on ground
    if (aircraftPhysics.onGround) {
        const horizontalVelocity = new THREE.Vector3(
            aircraftPhysics.velocity.x,
            0,
            aircraftPhysics.velocity.z
        );
        
        if (horizontalVelocity.length() > 0.01) {
            const frictionDirection = horizontalVelocity.clone().normalize().negate();
            const frictionForce = frictionDirection.multiplyScalar(
                horizontalVelocity.length() * PHYSICS.GROUND_FRICTION
            );
            
            // Apply friction to acceleration
            aircraftPhysics.acceleration.x += frictionForce.x;
            aircraftPhysics.acceleration.z += frictionForce.z;
        }
    }
    
    // Update velocity based on acceleration
    aircraftPhysics.velocity.add(
        aircraftPhysics.acceleration.clone().multiplyScalar(deltaTime)
    );
    
    // Update position based on velocity
    aircraftPhysics.position.add(
        aircraftPhysics.velocity.clone().multiplyScalar(deltaTime)
    );
}

// Check for ground collision
function checkGroundCollision() {
    // Check if aircraft is below ground level
    if (aircraftPhysics.position.y < PHYSICS.GROUND_LEVEL + 1.5) {
        // Set position to ground level
        aircraftPhysics.position.y = PHYSICS.GROUND_LEVEL + 1.5;
        
        // If moving downward, stop vertical movement
        if (aircraftPhysics.velocity.y < 0) {
            aircraftPhysics.velocity.y = 0;
        }
        
        // Set onGround flag
        aircraftPhysics.onGround = true;
    } else {
        // Set onGround flag
        aircraftPhysics.onGround = false;
    }
}

// Reset aircraft position
function resetAircraft() {
    initPhysics();
}
