/* Environment.js - Environment elements for the Flight Simulator */

// Global environment variables
let ground;
let runway;
let airport;
let skybox;
let clouds = [];
let buildings = [];
let mountains = [];
let dynamicElements = {
    cars: [],
    planes: []
};

// Environment properties
const environmentProperties = {
    worldSize: 10000,
    runwayLength: 1000,
    runwayWidth: 30,
    buildingCount: 100,
    mountainCount: 20,
    cloudCount: 30,
    carCount: 20,
    planeCount: 5
};

// Initialize environment
function initEnvironment() {
    // Create ground
    createGround();
    
    // Create runway
    createRunway();
    
    // Create airport
    createAirport();
    
    // Create skybox
    createSkybox();
    
    // Create clouds
    createClouds();
    
    // Create buildings
    createBuildings();
    
    // Create mountains
    createMountains();
    
    // Create dynamic elements
    createDynamicElements();
}

// Create ground plane
function createGround() {
    const groundSize = environmentProperties.worldSize;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
    
    // Create ground material with grass texture
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a8f00,
        side: THREE.DoubleSide,
        flatShading: true
    });
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    scene.add(ground);
}

// Create runway
function createRunway() {
    const runwayLength = environmentProperties.runwayLength;
    const runwayWidth = environmentProperties.runwayWidth;
    
    // Create runway geometry
    const runwayGeometry = new THREE.PlaneGeometry(runwayWidth, runwayLength);
    const runwayMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    
    runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0.1, 0); // Increased height above ground to prevent z-fighting
    runway.receiveShadow = true;
    
    // Ensure runway is visible in the scene
    runway.renderOrder = 1;
    
    // Add runway to scene
    scene.add(runway);
    
    // Add runway markings
    addRunwayMarkings();
    
    // Log runway creation for debugging
    console.log("Runway created with dimensions:", runwayWidth, "x", runwayLength);
}

// Add runway markings
function addRunwayMarkings() {
    const runwayLength = environmentProperties.runwayLength;
    const runwayWidth = environmentProperties.runwayWidth;
    
    // Center line
    const centerLineGeometry = new THREE.PlaneGeometry(1, runwayLength * 0.8);
    const centerLineMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });
    
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.02, 0); // Slightly above runway
    scene.add(centerLine);
    
    // Threshold markings
    const createThresholdMarking = (z) => {
        const markingGroup = new THREE.Group();
        
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue; // Skip center
            
            const markingGeometry = new THREE.PlaneGeometry(3, 20);
            const marking = new THREE.Mesh(markingGeometry, centerLineMaterial);
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(i * 5, 0.02, z);
            markingGroup.add(marking);
        }
        
        scene.add(markingGroup);
    };
    
    // Add threshold markings at both ends
    createThresholdMarking(-runwayLength / 2 + 15);
    createThresholdMarking(runwayLength / 2 - 15);
}

// Create airport buildings and structures
function createAirport() {
    airport = new THREE.Group();
    
    // Terminal building
    const terminalGeometry = new THREE.BoxGeometry(100, 15, 40);
    const terminalMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal.position.set(-80, 7.5, 100);
    terminal.castShadow = true;
    terminal.receiveShadow = true;
    airport.add(terminal);
    
    // Control tower
    const towerBaseGeometry = new THREE.CylinderGeometry(10, 10, 30, 8);
    const towerBaseMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
    const towerBase = new THREE.Mesh(towerBaseGeometry, towerBaseMaterial);
    towerBase.position.set(-100, 15, 50);
    towerBase.castShadow = true;
    towerBase.receiveShadow = true;
    airport.add(towerBase);
    
    const towerTopGeometry = new THREE.CylinderGeometry(15, 15, 10, 8);
    const towerTopMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88CCFF,
        transparent: true,
        opacity: 0.7
    });
    const towerTop = new THREE.Mesh(towerTopGeometry, towerTopMaterial);
    towerTop.position.set(-100, 35, 50);
    towerTop.castShadow = true;
    towerTop.receiveShadow = true;
    airport.add(towerTop);
    
    // Hangars
    const hangarGeometry = new THREE.BoxGeometry(40, 15, 30);
    const hangarMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    
    for (let i = 0; i < 3; i++) {
        const hangar = new THREE.Mesh(hangarGeometry, hangarMaterial);
        hangar.position.set(-50 + i * 50, 7.5, -80);
        hangar.castShadow = true;
        hangar.receiveShadow = true;
        airport.add(hangar);
    }
    
    // Add airport to scene
    scene.add(airport);
}

// Create skybox
function createSkybox() {
    const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    const skyboxMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Right
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Left
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Top
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Bottom
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Front
        new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide })  // Back
    ];
    
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);
}

// Create clouds
function createClouds() {
    const cloudCount = environmentProperties.cloudCount;
    
    for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create random number of cloud puffs
        const puffCount = 3 + Math.floor(Math.random() * 5);
        
        for (let j = 0; j < puffCount; j++) {
            const puffGeometry = new THREE.SphereGeometry(
                20 + Math.random() * 30, 
                8, 
                8
            );
            const puffMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            
            // Position puffs to form cloud shape
            puff.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 50
            );
            
            cloudGroup.add(puff);
        }
        
        // Position cloud randomly in sky
        const worldSize = environmentProperties.worldSize / 2 - 500;
        cloudGroup.position.set(
            (Math.random() - 0.5) * worldSize,
            300 + Math.random() * 500,
            (Math.random() - 0.5) * worldSize
        );
        
        // Add cloud to scene and clouds array
        scene.add(cloudGroup);
        clouds.push({
            mesh: cloudGroup,
            speed: 0.1 + Math.random() * 0.5,
            direction: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
            ).normalize()
        });
    }
}

// Create buildings
function createBuildings() {
    const buildingCount = environmentProperties.buildingCount;
    const worldSize = environmentProperties.worldSize / 2 - 500;
    
    for (let i = 0; i < buildingCount; i++) {
        // Skip buildings too close to airport
        let x, z;
        let tooClose = true;
        
        while (tooClose) {
            x = (Math.random() - 0.5) * worldSize;
            z = (Math.random() - 0.5) * worldSize;
            
            // Check distance from airport center
            const distanceFromAirport = Math.sqrt(x * x + z * z);
            if (distanceFromAirport > 300) {
                tooClose = false;
            }
        }
        
        // Create building with random size
        const width = 20 + Math.random() * 30;
        const height = 20 + Math.random() * 100;
        const depth = 20 + Math.random() * 30;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(
                0.3 + Math.random() * 0.2,
                0.3 + Math.random() * 0.2,
                0.3 + Math.random() * 0.2
            )
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Add building to scene and buildings array
        scene.add(building);
        buildings.push(building);
    }
}

// Create mountains
function createMountains() {
    const mountainCount = environmentProperties.mountainCount;
    const worldSize = environmentProperties.worldSize / 2 - 500;
    
    for (let i = 0; i < mountainCount; i++) {
        // Skip mountains too close to airport
        let x, z;
        let tooClose = true;
        
        while (tooClose) {
            x = (Math.random() - 0.5) * worldSize;
            z = (Math.random() - 0.5) * worldSize;
            
            // Check distance from airport center
            const distanceFromAirport = Math.sqrt(x * x + z * z);
            if (distanceFromAirport > 500) {
                tooClose = false;
            }
        }
        
        // Create mountain with random size
        const radius = 100 + Math.random() * 200;
        const height = 200 + Math.random() * 500;
        
        const mountainGeometry = new THREE.ConeGeometry(radius, height, 8);
        const mountainMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(
                0.2 + Math.random() * 0.1,
                0.2 + Math.random() * 0.3,
                0.2 + Math.random() * 0.1
            )
        });
        
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(x, height / 2, z);
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        
        // Add mountain to scene and mountains array
        scene.add(mountain);
        mountains.push(mountain);
    }
}

// Create dynamic elements (cars, planes)
function createDynamicElements() {
    // Create cars
    createCars();
    
    // Create other planes
    createOtherPlanes();
}

// Create cars
function createCars() {
    const carCount = environmentProperties.carCount;
    
    for (let i = 0; i < carCount; i++) {
        // Create car group
        const car = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(4, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(
                Math.random(),
                Math.random(),
                Math.random()
            )
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        body.receiveShadow = true;
        car.add(body);
        
        // Car wheels
        const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        // Add four wheels
        const wheelPositions = [
            { x: -2, y: 0, z: -2 },
            { x: 2, y: 0, z: -2 },
            { x: -2, y: 0, z: 2 },
            { x: 2, y: 0, z: 2 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            wheel.receiveShadow = true;
            car.add(wheel);
        });
        
        // Position car randomly on ground
        const worldSize = environmentProperties.worldSize / 2 - 500;
        
        // Create road network (simplified as random positions for now)
        let x, z;
        let validPosition = false;
        
        while (!validPosition) {
            x = (Math.random() - 0.5) * worldSize;
            z = (Math.random() - 0.5) * worldSize;
            
            // Check if not on runway
            const distanceFromRunway = Math.abs(x);
            if (distanceFromRunway > environmentProperties.runwayWidth / 2) {
                validPosition = true;
            }
        }
        
        car.position.set(x, 0, z);
        
        // Random rotation
        car.rotation.y = Math.random() * Math.PI * 2;
        
        // Add car to scene and cars array
        scene.add(car);
        dynamicElements.cars.push({
            mesh: car,
            speed: 0.2 + Math.random() * 0.5,
            direction: new THREE.Vector3(
                Math.sin(car.rotation.y),
                0,
                Math.cos(car.rotation.y)
            )
        });
    }
}

// Create other planes
function createOtherPlanes() {
    const planeCount = environmentProperties.planeCount;
    
    for (let i = 0; i < planeCount; i++) {
        // Create a simple plane model (similar to player aircraft but smaller)
        const otherPlane = new THREE.Group();
        
        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.3, 4, 8);
        fuselageGeometry.rotateZ(Math.PI / 2);
        const fuselageMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(
                Math.random(),
                Math.random(),
                Math.random()
            )
        });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.castShadow = true;
        fuselage.receiveShadow = true;
        otherPlane.add(fuselage);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(5, 0.1, 1);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.castShadow = true;
        wings.receiveShadow = true;
        otherPlane.add(wings);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
        const tail = new THREE.Mesh(tailGeometry, wingMaterial);
        tail.position.set(0, 0, -1.5);
        tail.castShadow = true;
        tail.receiveShadow = true;
        otherPlane.add(tail);
        
        // Vertical stabilizer
        const stabilizerGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.5);
        const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
        stabilizer.position.set(0, 0.4, -1.5);
        stabilizer.castShadow = true;
        stabilizer.receiveShadow = true;
        otherPlane.add(stabilizer);
        
        // Position plane randomly in sky
        const worldSize = environmentProperties.worldSize / 2 - 1000;
        otherPlane.position.set(
            (Math.random() - 0.5) * worldSize,
            500 + Math.random() * 1000,
            (Math.random() - 0.5) * worldSize
        );
        
        // Random rotation
        otherPlane.rotation.y = Math.random() * Math.PI * 2;
        
        // Add plane to scene and planes array
        scene.add(otherPlane);
        dynamicElements.planes.push({
            mesh: otherPlane,
            speed: 1 + Math.random() * 2,
            direction: new THREE.Vector3(
                Math.sin(otherPlane.rotation.y),
                (Math.random() - 0.5) * 0.1, // Slight up/down movement
                Math.cos(otherPlane.rotation.y)
            ).normalize()
        });
    }
}

// Update environment
function updateEnvironment(deltaTime, elapsedTime) {
    // Update clouds
    updateClouds(deltaTime);
    
    // Update dynamic elements
    updateDynamicElements(deltaTime);
}

// Update clouds
function updateClouds(deltaTime) {
    clouds.forEach(cloud => {
        // Move cloud based on direction and speed
        cloud.mesh.position.add(
            cloud.direction.clone().multiplyScalar(cloud.speed * deltaTime)
        );
        
        // Check if cloud is out of bounds
        const worldSize = environmentProperties.worldSize / 2;
        if (
            cloud.mesh.position.x > worldSize ||
            cloud.mesh.position.x < -worldSize ||
            cloud.mesh.position.z > worldSize ||
            cloud.mesh.position.z < -worldSize
        ) {
            // Reset cloud position to opposite side
            cloud.mesh.position.x = -cloud.mesh.position.x * 0.9;
            cloud.mesh.position.z = -cloud.mesh.position.z * 0.9;
        }
    });
}

// Update dynamic elements
function updateDynamicElements(deltaTime) {
    // Update cars
    dynamicElements.cars.forEach(car => {
        // Move car based on direction and speed
        car.mesh.position.add(
            car.direction.clone().multiplyScalar(car.speed * deltaTime)
        );
        
        // Check if car is out of bounds
        const worldSize = environmentProperties.worldSize / 2 - 100;
        if (
            car.mesh.position.x > worldSize ||
            car.mesh.position.x < -worldSize ||
            car.mesh.position.z > worldSize ||
            car.mesh.position.z < -worldSize
        ) {
            // Change direction
            car.direction.x = -car.direction.x;
            car.direction.z = -car.direction.z;
            
            // Update car rotation to match new direction
            car.mesh.rotation.y = Math.atan2(car.direction.x, car.direction.z);
        }
        
        // Randomly change direction occasionally
        if (Math.random() < 0.005) {
            const angle = (Math.random() - 0.5) * Math.PI / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Rotate direction vector
            const newX = car.direction.x * cos - car.direction.z * sin;
            const newZ = car.direction.x * sin + car.direction.z * cos;
            
            car.direction.x = newX;
            car.direction.z = newZ;
            
            // Update car rotation to match new direction
            car.mesh.rotation.y = Math.atan2(car.direction.x, car.direction.z);
        }
    });
    
    // Update other planes
    dynamicElements.planes.forEach(plane => {
        // Move plane based on direction and speed
        plane.mesh.position.add(
            plane.direction.clone().multiplyScalar(plane.speed * deltaTime)
        );
        
        // Update plane rotation to match direction
        plane.mesh.rotation.y = Math.atan2(plane.direction.x, plane.direction.z);
        
        // Add slight banking effect
        plane.mesh.rotation.z = -plane.direction.x * 0.2;
        
        // Check if plane is out of bounds
        const worldSize = environmentProperties.worldSize / 2;
        if (
            plane.mesh.position.x > worldSize ||
            plane.mesh.position.x < -worldSize ||
            plane.mesh.position.z > worldSize ||
            plane.mesh.position.z < -worldSize
        ) {
            // Reset plane position to opposite side
            plane.mesh.position.x = -plane.mesh.position.x * 0.9;
            plane.mesh.position.z = -plane.mesh.position.z * 0.9;
        }
        
        // Randomly change direction occasionally
        if (Math.random() < 0.01) {
            const angle = (Math.random() - 0.5) * Math.PI / 4;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // Rotate direction vector
            const newX = plane.direction.x * cos - plane.direction.z * sin;
            const newZ = plane.direction.x * sin + plane.direction.z * cos;
            
            plane.direction.x = newX;
            plane.direction.z = newZ;
            plane.direction.normalize();
        }
    });
}
