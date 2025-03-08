/* Aircraft.js - Aircraft model and behavior for the Flight Simulator */

// Global aircraft variables
let aircraft;
let aircraftModel;
let propeller;

// Aircraft properties
const aircraftProperties = {
    modelLoaded: false,
    propellerSpeed: 0,
    maxPropellerSpeed: 20
};

// Initialize aircraft
function initAircraft() {
    // Create a temporary aircraft box while the model loads
    const geometry = new THREE.BoxGeometry(3, 1, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
    aircraft = new THREE.Mesh(geometry, material);
    aircraft.castShadow = true;
    aircraft.receiveShadow = true;
    aircraft.position.set(0, 0.5, 0); // Start on the runway
    scene.add(aircraft);
    
    // Create a simple aircraft model using primitives
    createSimpleAircraftModel();
}

// Create a simple aircraft model using Three.js primitives
function createSimpleAircraftModel() {
    // Remove temporary box if it exists
    if (aircraft) {
        scene.remove(aircraft);
    }
    
    // Create aircraft group
    aircraft = new THREE.Group();
    
    // Fuselage
    const fuselageGeometry = new THREE.CylinderGeometry(0.8, 0.5, 5, 8);
    fuselageGeometry.rotateZ(Math.PI / 2);
    const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x3366CC });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    aircraft.add(fuselage);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(7, 0.2, 1.5);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x3366CC });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.set(0, 0, 0);
    wings.castShadow = true;
    wings.receiveShadow = true;
    aircraft.add(wings);
    
    // Tail
    const tailGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x3366CC });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0, -2);
    tail.castShadow = true;
    tail.receiveShadow = true;
    aircraft.add(tail);
    
    // Vertical stabilizer
    const stabilizerGeometry = new THREE.BoxGeometry(0.2, 1, 0.8);
    const stabilizerMaterial = new THREE.MeshPhongMaterial({ color: 0x3366CC });
    const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
    stabilizer.position.set(0, 0.5, -2);
    stabilizer.castShadow = true;
    stabilizer.receiveShadow = true;
    aircraft.add(stabilizer);
    
    // Propeller base
    const propBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8);
    const propBaseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const propBase = new THREE.Mesh(propBaseGeometry, propBaseMaterial);
    propBase.position.set(0, 0, 2.5);
    propBase.rotation.x = Math.PI / 2;
    propBase.castShadow = true;
    propBase.receiveShadow = true;
    aircraft.add(propBase);
    
    // Propeller
    const propellerGeometry = new THREE.BoxGeometry(2, 0.1, 0.2);
    const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.position.set(0, 0, 2.7);
    propeller.castShadow = true;
    propeller.receiveShadow = true;
    aircraft.add(propeller);
    
    // Cockpit glass
    const cockpitGeometry = new THREE.SphereGeometry(0.7, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88CCFF,
        transparent: true,
        opacity: 0.7
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.5, 0.5);
    cockpit.rotation.x = Math.PI;
    cockpit.castShadow = false; // Glass doesn't cast shadow
    cockpit.receiveShadow = true;
    aircraft.add(cockpit);
    
    // Landing gear
    createLandingGear();
    
    // Position aircraft on the runway
    aircraft.position.set(0, 1.5, 0);
    aircraft.rotation.y = Math.PI; // Face forward along the runway
    
    // Add aircraft to scene
    scene.add(aircraft);
    
    // Set flag that model is loaded
    aircraftProperties.modelLoaded = true;
}

// Create landing gear for the aircraft
function createLandingGear() {
    // Main landing gear
    const gearMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    // Left gear
    const leftGearLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8),
        gearMaterial
    );
    leftGearLeg.position.set(-1.5, -0.6, 0);
    leftGearLeg.castShadow = true;
    leftGearLeg.receiveShadow = true;
    aircraft.add(leftGearLeg);
    
    const leftGearWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
        gearMaterial
    );
    leftGearWheel.position.set(-1.5, -1.2, 0);
    leftGearWheel.rotation.x = Math.PI / 2;
    leftGearWheel.castShadow = true;
    leftGearWheel.receiveShadow = true;
    aircraft.add(leftGearWheel);
    
    // Right gear
    const rightGearLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8),
        gearMaterial
    );
    rightGearLeg.position.set(1.5, -0.6, 0);
    rightGearLeg.castShadow = true;
    rightGearLeg.receiveShadow = true;
    aircraft.add(rightGearLeg);
    
    const rightGearWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
        gearMaterial
    );
    rightGearWheel.position.set(1.5, -1.2, 0);
    rightGearWheel.rotation.x = Math.PI / 2;
    rightGearWheel.castShadow = true;
    rightGearWheel.receiveShadow = true;
    aircraft.add(rightGearWheel);
    
    // Nose gear
    const noseGearLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1, 8),
        gearMaterial
    );
    noseGearLeg.position.set(0, -0.5, 2);
    noseGearLeg.castShadow = true;
    noseGearLeg.receiveShadow = true;
    aircraft.add(noseGearLeg);
    
    const noseGearWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16),
        gearMaterial
    );
    noseGearWheel.position.set(0, -1, 2);
    noseGearWheel.rotation.x = Math.PI / 2;
    noseGearWheel.castShadow = true;
    noseGearWheel.receiveShadow = true;
    aircraft.add(noseGearWheel);
}

// Update aircraft
function updateAircraft(deltaTime) {
    if (!aircraft || !aircraftProperties.modelLoaded) return;
    
    // Update propeller rotation based on throttle
    if (propeller) {
        const targetPropSpeed = aircraftPhysics.throttle * aircraftProperties.maxPropellerSpeed;
        aircraftProperties.propellerSpeed = THREE.MathUtils.lerp(
            aircraftProperties.propellerSpeed,
            targetPropSpeed,
            deltaTime * 2
        );
        propeller.rotation.x += aircraftProperties.propellerSpeed * deltaTime;
    }
    
    // Apply physics to aircraft position and rotation
    aircraft.position.copy(aircraftPhysics.position);
    aircraft.quaternion.copy(aircraftPhysics.quaternion);
}
