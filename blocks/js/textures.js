// Procedurally generates textures and sprites using HTML5 Canvas

export const Textures = {
    cache: {},
    
    // Generate a noise texture
    generateNoise(width, height, color1, color2, scale = 1) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, width, height);
        
        for (let x = 0; x < width; x += scale) {
            for (let y = 0; y < height; y += scale) {
                if (Math.random() > 0.5) {
                    ctx.fillStyle = color2;
                    ctx.fillRect(x, y, scale, scale);
                }
            }
        }
        return canvas;
    },

    getTexture(type) {
        if (this.cache[type]) return this.cache[type];
        
        let canvas;
        if (type === 'stone') {
            canvas = this.generateNoise(64, 64, '#8a7a6a', '#6a5a4a', 2);
            // Draw brick lines
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#111';
            for (let y = 0; y < 64; y += 16) {
                ctx.fillRect(0, y, 64, 2);
                for (let x = (y % 32 === 0 ? 0 : 16); x < 64; x += 32) {
                    ctx.fillRect(x, y, 2, 16);
                }
            }
        } else if (type === 'metal') {
            canvas = this.generateNoise(64, 64, '#1a2a3a', '#2a3a4a', 1);
            // Rivets and panels
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#0a1a2a';
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, 56, 56);
            ctx.fillStyle = '#0a1a2a';
            ctx.beginPath(); ctx.arc(10, 10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(54, 10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, 54, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(54, 54, 2, 0, Math.PI*2); ctx.fill();
        } else if (type === 'hell') {
            canvas = this.generateNoise(64, 64, '#3a0a0a', '#1a0000', 4);
            const ctx = canvas.getContext('2d');
            // Veins
            ctx.strokeStyle = '#5a0a0a';
            ctx.lineWidth = 1;
            for(let i=0; i<5; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random()*64, 0);
                ctx.lineTo(Math.random()*64, 32);
                ctx.lineTo(Math.random()*64, 64);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.cache[type] = texture;
        return texture;
    },

    getChestSprite(isOpen = false) {
        const key = isOpen ? 'chest_open' : 'chest_closed';
        if (this.cache[key]) return this.cache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw basic pixel art chest
        ctx.fillStyle = '#8b4513'; // wood
        ctx.fillRect(8, 24, 48, 32);
        
        ctx.fillStyle = '#d2b48c'; // trim
        ctx.fillRect(8, 24, 48, 4);
        ctx.fillRect(8, 52, 48, 4);
        ctx.fillRect(8, 24, 4, 32);
        ctx.fillRect(52, 24, 4, 32);

        if (!isOpen) {
            // Closed lid
            ctx.fillStyle = '#6b3503';
            ctx.fillRect(8, 16, 48, 8);
            // Lock
            ctx.fillStyle = '#ffd700'; // gold
            ctx.fillRect(28, 20, 8, 8);
            ctx.fillStyle = '#000';
            ctx.fillRect(31, 22, 2, 4);
        } else {
            // Open lid
            ctx.fillStyle = '#6b3503';
            ctx.fillRect(8, 0, 48, 16);
            // Inside glow
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(12, 16, 40, 8);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.cache[key] = texture;
        return texture;
    }
};
