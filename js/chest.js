// Chest Entity and Logic

import { Textures } from './textures.js';

export class Chest {
    constructor(scene, maze, position = null, isFake = false) {
        this.scene = scene;
        this.isFake = isFake;

        if (position) {
            this.position = new THREE.Vector3(position.x + 0.5, 0.2, position.y + 0.5);
        } else {
            this.position = new THREE.Vector3(maze.end.x + 0.5, 0.2, maze.end.y + 0.5);
        }

        // Sprite
        const tex = Textures.getChestSprite(false);
        const mat = new THREE.SpriteMaterial({ map: tex });
        this.sprite = new THREE.Sprite(mat);
        this.sprite.position.copy(this.position);
        this.sprite.scale.set(0.8, 0.8, 1);
        this.scene.add(this.sprite);

        // Glow (Fake chests have a subtler, slightly redder tint if you look closely)
        const glowColor = this.isFake ? 0xffbb00 : 0xffaa00;
        this.glow = new THREE.PointLight(glowColor, 2, 4);
        this.glow.position.copy(this.position);
        this.scene.add(this.glow);

        this.isOpen = false;
        this.time = 0;
    }

    update(dt, playerPos) {
        this.time += dt;

        // Flicker effect
        this.glow.intensity = 1.5 + Math.sin(this.time * 15) * 0.5 + Math.random() * 0.5;

        // Pulse scale slightly
        const scale = 0.8 + Math.sin(this.time * 2) * 0.05;
        this.sprite.scale.set(scale, scale, 1);

        // Proximity check
        const dist = playerPos.distanceTo(this.position);
        return dist < 1.5; // Return true if close enough to interact
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.sprite.material.map = Textures.getChestSprite(true);

        if (this.isFake) {
            this.glow.intensity = 10;
            this.glow.color.setHex(0xff0000); // Red flash for trap
            this.sprite.scale.set(1.5, 1.5, 1); // Expand briefly
        } else {
            this.glow.intensity = 4;
            this.glow.color.setHex(0xffffff); // White flash
        }
    }

    destroy() {
        this.scene.remove(this.sprite);
        this.scene.remove(this.glow);
    }
}
