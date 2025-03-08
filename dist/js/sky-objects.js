/* Add more sky objects to the environment */

// Global variables for sky objects
let skyObjects = [];

// Initialize additional sky objects
function initSkyObjects() {
    // Create various sky objects
    createBirds();
    createBalloons();
    createCloudsFormation();
    createSatellites();
    
    console.log("Additional sky objects initialized");
}

// Create birds flying in formation
function createBirds() {
    const birdCount = 15;
    const formationSize = 50;
    
    // Create bird group
    const birdGroup = new THREE.Group();
    
    for (let i = 0; i < birdCount; i++) {
        // Create simple bird shape
        const bird = new THREE.Group();
        
        // Bird body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 4);
        bodyGeometry.rotateX(Math.PI / 2);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bird.add(body);
        
        // Bird wings
        const wingGeometry = new THREE.PlaneGeometry(3, 1);
        const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.set(0, 0, 0);
        bird.add(wings);
        
        // Position bird in formation
        const angle = (i / birdCount) * Math.PI * 2;
        const radius = formationSize / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        bird.position.set(x, 0, z);
        bird.lookAt(0, 0, 0);
        
        // Add animation data
        bird.userData = {
            wingDirection: 1,
            wingPosition: 0,
            speed: 0.2 + Math.random() * 0.1
        };
        
        birdGroup.add(bird);
    }
    
    // Position the entire formation
    birdGroup.position.set(
        Math.random() * 1000 - 500,
        300 + Math.random() * 200,
        Math.random() * 1000 - 500
    );
    
    // Add to scene and sky objects
    scene.add(birdGroup);
    skyObjects.push({
        type: 'birds',
        mesh: birdGroup,
        speed: 10,
        direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        update: function(deltaTime) {
            // Move the entire formation
            this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
            
            // Rotate to face direction
            this.mesh.lookAt(this.mesh.position.clone().add(this.direction));
            
            // Animate individual birds
            for (let i = 0; i < this.mesh.children.length; i++) {
                const bird = this.mesh.children[i];
                const wings = bird.children[1];
                
                // Flap wings
                bird.userData.wingPosition += bird.userData.wingDirection * deltaTime * 5;
                
                if (bird.userData.wingPosition > 0.5) {
                    bird.userData.wingDirection = -1;
                } else if (bird.userData.wingPosition < -0.5) {
                    bird.userData.wingDirection = 1;
                }
                
                wings.rotation.z = bird.userData.wingPosition;
            }
            
            // Check if out of bounds and change direction
            if (this.mesh.position.length() > 2000) {
                this.direction.negate();
            }
        }
    });
}

// Create hot air balloons
function createBalloons() {
    const balloonCount = 5;
    
    for (let i = 0; i < balloonCount; i++) {
        // Create balloon group
        const balloon = new THREE.Group();
        
        // Balloon envelope (the inflated part)
        const envelopeGeometry = new THREE.SphereGeometry(15, 16, 16);
        const envelopeMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(
                Math.random(),
                Math.random(),
                Math.random()
            )
        });
        const envelope = new THREE.Mesh(envelopeGeometry, envelopeMaterial);
        envelope.position.y = 15;
        balloon.add(envelope);
        
        // Balloon basket
        const basketGeometry = new THREE.BoxGeometry(8, 5, 8);
        const basketMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.y = -5;
        balloon.add(basket);
        
        // Ropes connecting basket to envelope
        const ropePositions = [
            { x: 4, z: 4 },
            { x: -4, z: 4 },
            { x: 4, z: -4 },
            { x: -4, z: -4 }
        ];
        
        ropePositions.forEach(pos => {
            const ropeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20, 8);
            const ropeMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
            rope.position.set(pos.x, 5, pos.z);
            balloon.add(rope);
        });
        
        // Position balloon randomly in sky
        balloon.position.set(
            Math.random() * 2000 - 1000,
            400 + Math.random() * 300,
            Math.random() * 2000 - 1000
        );
        
        // Add to scene and sky objects
        scene.add(balloon);
        skyObjects.push({
            type: 'balloon',
            mesh: balloon,
            speed: 2 + Math.random() * 2,
            direction: new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.1, Math.random() - 0.5).normalize(),
            update: function(deltaTime) {
                // Move balloon
                this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
                
                // Add gentle bobbing motion
                this.mesh.position.y += Math.sin(elapsedTime * 0.5) * deltaTime * 2;
                
                // Check if out of bounds and change direction
                if (this.mesh.position.length() > 2000) {
                    this.direction.negate();
                }
            }
        });
    }
}

// Create cloud formations
function createCloudsFormation() {
    const cloudFormationCount = 3;
    
    for (let i = 0; i < cloudFormationCount; i++) {
        // Create cloud formation group
        const cloudFormation = new THREE.Group();
        
        // Create multiple cloud puffs in formation
        const puffCount = 10 + Math.floor(Math.random() * 10);
        
        for (let j = 0; j < puffCount; j++) {
            const puffSize = 30 + Math.random() * 50;
            const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
            const puffMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            
            // Position puffs to form cloud shape
            puff.position.set(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 200
            );
            
            cloudFormation.add(puff);
        }
        
        // Position cloud formation
        cloudFormation.position.set(
            Math.random() * 3000 - 1500,
            500 + Math.random() * 300,
            Math.random() * 3000 - 1500
        );
        
        // Add to scene and sky objects
        scene.add(cloudFormation);
        skyObjects.push({
            type: 'cloudFormation',
            mesh: cloudFormation,
            speed: 5 + Math.random() * 3,
            direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            update: function(deltaTime) {
                // Move cloud formation
                this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
                
                // Check if out of bounds and change direction
                if (this.mesh.position.length() > 3000) {
                    this.direction.negate();
                }
            }
        });
    }
}

// Create satellites
function createSatellites() {
    const satelliteCount = 2;
    
    for (let i = 0; i < satelliteCount; i++) {
        // Create satellite group
        const satellite = new THREE.Group();
        
        // Satellite body
        const bodyGeometry = new THREE.BoxGeometry(5, 5, 10);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        satellite.add(body);
        
        // Solar panels
        const panelGeometry = new THREE.BoxGeometry(30, 0.5, 10);
        const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        satellite.add(panel);
        
        // Position satellite high in the sky
        satellite.position.set(
            Math.random() * 2000 - 1000,
            1500 + Math.random() * 500,
            Math.random() * 2000 - 1000
        );
        
        // Add to scene and sky objects
        scene.add(satellite);
        skyObjects.push({
            type: 'satellite',
            mesh: satellite,
            speed: 20 + Math.random() * 10,
            direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            rotationSpeed: 0.1 + Math.random() * 0.2,
            update: function(deltaTime) {
                // Move satellite
                this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
                
                // Rotate satellite
                this.mesh.rotation.y += this.rotationSpeed * deltaTime;
                
                // Check if out of bounds and change direction
                if (this.mesh.position.length() > 3000) {
                    this.direction.negate();
                }
            }
        });
    }
}

// Update all sky objects
function updateSkyObjects(deltaTime) {
    skyObjects.forEach(object => {
        object.update(deltaTime);
    });
}
