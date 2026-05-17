// Three.js Scene and Renderer setup

import { Textures } from './textures.js';

export class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.y = 0.5; // Set eye level higher for taller walls
        
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(0.5); // Chunky pixelated look!
        
        this.walls = [];
        this.floor = null;
        this.ceiling = null;
        this.levelConfig = null;

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        // Player Light (Torch)
        this.torchLight = new THREE.PointLight(0xffddaa, 2, 7);
        this.scene.add(this.torchLight);
        this.torchTime = 0;

        window.addEventListener('resize', () => this.onResize());
    }

    buildLevel(maze, levelConfig) {
        this.levelConfig = levelConfig;

        // Clear existing walls
        this.walls.forEach(w => this.scene.remove(w));
        this.walls = [];
        if (this.floor) this.scene.remove(this.floor);
        if (this.ceiling) this.scene.remove(this.ceiling);

        // Fog for DOOM atmosphere
        this.scene.fog = new THREE.Fog(0x0a0a0a, 1, 8); // Reduced to 8 for difficulty
        this.scene.background = new THREE.Color(0x0a0a0a);

        const wallTexture = Textures.getTexture(levelConfig.theme);
        const wallMat = new THREE.MeshLambertMaterial({ map: wallTexture });
        const wallGeo = new THREE.BoxGeometry(1, 2, 1); // Height increased to 2

        for (let y = 0; y < maze.size; y++) {
            for (let x = 0; x < maze.size; x++) {
                if (maze.grid[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeo, wallMat);
                    wall.position.set(x + 0.5, 0.5, y + 0.5); // Offset by 0.5 to center in grid cell
                    this.scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }

        // Floor
        const floorGeo = new THREE.PlaneGeometry(maze.size, maze.size);
        const floorMat = new THREE.MeshLambertMaterial({ color: levelConfig.floorColor });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.set(maze.size / 2, -0.5, maze.size / 2); // Centered at size/2
        this.scene.add(this.floor);

        // Ceiling
        const ceilMat = new THREE.MeshLambertMaterial({ color: 0x050505 });
        this.ceiling = new THREE.Mesh(floorGeo, ceilMat);
        this.ceiling.rotation.x = Math.PI / 2;
        this.ceiling.position.set(maze.size / 2, 1.5, maze.size / 2); // Centered at size/2
        this.scene.add(this.ceiling);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(playerPos, dt) {
        this.torchTime += dt;
        // Flickering torch effect
        this.torchLight.intensity = 1.8 + Math.sin(this.torchTime * 10) * 0.3 + Math.random() * 0.1;
        this.torchLight.position.copy(playerPos);
        this.renderer.render(this.scene, this.camera);
    }
}
