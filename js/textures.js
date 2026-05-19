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
            canvas = this.generateNoise(64, 64, '#1f2421', '#0d0f0e', 2); // Darker base stone
            const ctx = canvas.getContext('2d');
            
            // Draw brick joints
            ctx.fillStyle = '#050505';
            for (let y = 0; y < 64; y += 16) {
                ctx.fillRect(0, y, 64, 2);
                for (let x = (y % 32 === 0 ? 0 : 16); x < 64; x += 32) {
                    ctx.fillRect(x, y, 2, 16);
                }
            }
            
            // Add moss/slime patches
            ctx.fillStyle = 'rgba(34, 139, 34, 0.4)'; // Moss green
            ctx.beginPath();
            ctx.arc(16, 24, 6, 0, Math.PI*2);
            ctx.arc(22, 26, 4, 0, Math.PI*2);
            ctx.arc(48, 48, 8, 0, Math.PI*2);
            ctx.fill();
            
            // Add dripping blood/slime
            ctx.fillStyle = '#7a0000'; // Dark blood
            // Drip 1
            ctx.fillRect(10, 16, 2, 8);
            ctx.fillRect(9, 22, 4, 3);
            // Drip 2
            ctx.fillRect(42, 32, 2, 12);
            ctx.fillRect(41, 42, 4, 4);

            // Add glowing red eyes in the brick gaps
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ff0000';
            // Eyes set 1
            ctx.fillRect(20, 8, 2, 2);
            ctx.fillRect(24, 8, 2, 2);
            // Eyes set 2
            ctx.fillRect(52, 40, 2, 2);
            ctx.fillRect(56, 40, 2, 2);
            ctx.shadowBlur = 0; // reset
            
        } else if (type === 'metal') {
            canvas = this.generateNoise(64, 64, '#2d2d2d', '#1a1a1a', 1); // Darker rusted steel
            const ctx = canvas.getContext('2d');
            
            // Rusty panels border
            ctx.strokeStyle = '#0f0f0f';
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, 56, 56);
            
            // Rust spots
            ctx.fillStyle = 'rgba(139, 69, 19, 0.6)'; // Rust brown
            ctx.fillRect(8, 8, 14, 10);
            ctx.fillRect(40, 44, 16, 12);
            ctx.fillStyle = 'rgba(205, 133, 63, 0.4)'; // Orange-ish rust highlights
            ctx.fillRect(10, 10, 8, 6);
            ctx.fillRect(44, 46, 8, 8);
            
            // Creepy scratches/tally marks
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            // Tally ||||/
            ctx.beginPath();
            ctx.moveTo(12, 42); ctx.lineTo(12, 52);
            ctx.moveTo(15, 41); ctx.lineTo(15, 51);
            ctx.moveTo(18, 42); ctx.lineTo(18, 52);
            ctx.moveTo(21, 41); ctx.lineTo(21, 51);
            ctx.moveTo(10, 48); ctx.lineTo(23, 44);
            ctx.stroke();
            
            // Blood splatters
            ctx.fillStyle = 'rgba(122, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(32, 24, 4, 0, Math.PI*2);
            ctx.arc(30, 26, 2, 0, Math.PI*2);
            ctx.arc(35, 22, 1, 0, Math.PI*2);
            ctx.fill();
            
            // Rivets
            ctx.fillStyle = '#0a0a0a';
            ctx.beginPath(); ctx.arc(10, 10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(54, 10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, 54, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(54, 54, 2, 0, Math.PI*2); ctx.fill();
            
        } else if (type === 'hell') {
            canvas = this.generateNoise(64, 64, '#1a0000', '#0a0000', 4); // Pit black/dark red flesh
            const ctx = canvas.getContext('2d');
            
            // Pulsing flesh veins
            ctx.strokeStyle = '#990000';
            ctx.lineWidth = 2;
            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random()*64, 0);
                ctx.bezierCurveTo(Math.random()*64, 21, Math.random()*64, 42, Math.random()*64, 64);
                ctx.stroke();
            }
            
            // Glowing crimson veins
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#ff0000';
            for(let i=0; i<3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, Math.random()*64);
                ctx.lineTo(32, Math.random()*64);
                ctx.lineTo(64, Math.random()*64);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;

            // Fleshy screams/face shadows in the walls
            ctx.fillStyle = '#000000';
            // Face 1
            ctx.beginPath();
            ctx.arc(32, 32, 4, 0, Math.PI*2); // left eye
            ctx.arc(42, 32, 4, 0, Math.PI*2); // right eye
            // Check if ctx.ellipse is supported, otherwise draw simple arc or rectangles for mouth
            try {
                ctx.ellipse(37, 44, 5, 8, 0, 0, Math.PI*2); // screaming mouth
            } catch (err) {
                ctx.arc(37, 44, 6, 0, Math.PI*2);
            }
            ctx.fill();
            
            // Red pupils/glow inside eyes
            ctx.fillStyle = '#ff3300';
            ctx.fillRect(31, 31, 2, 2);
            ctx.fillRect(41, 31, 2, 2);
        } else if (type === 'darksouls') {
            // Dark Souls themed gothic stone wall
            canvas = this.generateNoise(64, 64, '#1c1b22', '#0e0d12', 2);
            const ctx = canvas.getContext('2d');
            
            // Draw gothic vertical/horizontal brick joints
            ctx.fillStyle = '#050508';
            for (let y = 0; y < 64; y += 16) {
                ctx.fillRect(0, y, 64, 2);
                for (let x = (y % 32 === 0 ? 0 : 16); x < 64; x += 32) {
                    ctx.fillRect(x, y, 2, 16);
                }
            }
            
            // Add gothic cracks in the stone
            ctx.strokeStyle = '#050508';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(8, 8); ctx.lineTo(14, 12); ctx.lineTo(10, 20);
            ctx.moveTo(48, 40); ctx.lineTo(52, 46);
            ctx.stroke();
            
            // Moss/ash details
            ctx.fillStyle = 'rgba(74, 84, 76, 0.3)'; // Ashy green-gray
            ctx.beginPath();
            ctx.arc(8, 48, 8, 0, Math.PI*2);
            ctx.arc(56, 16, 6, 0, Math.PI*2);
            ctx.fill();

            // Dripping dark sludge/blood
            ctx.fillStyle = '#221100'; // Dark muck
            ctx.fillRect(20, 16, 2, 10);
            ctx.fillRect(19, 24, 4, 3);
            
            // Draw embedded skulls in the wall
            const drawSkull = (cx, cy) => {
                ctx.save();
                ctx.fillStyle = '#c5becf'; // Weathered bone
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillRect(cx - 2.5, cy + 2.5, 5, 4); // Jaw
                
                ctx.fillStyle = '#0f0c1b'; // Eye sockets
                ctx.fillRect(cx - 2.5, cy - 1.5, 1.5, 2);
                ctx.fillRect(cx + 1, cy - 1.5, 1.5, 2);
                
                ctx.fillRect(cx - 0.5, cy + 1.5, 1, 1); // Nose
                
                ctx.strokeStyle = '#7a7585';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx - 1.5, cy + 5); ctx.lineTo(cx - 1.5, cy + 6.5);
                ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 6.5);
                ctx.moveTo(cx + 1.5, cy + 5); ctx.lineTo(cx + 1.5, cy + 6.5);
                ctx.stroke();
                
                // Flame yellow glow in eyes
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(cx - 2, cy - 1, 0.7, 0.7);
                ctx.fillRect(cx + 1.2, cy - 1, 0.7, 0.7);
                ctx.restore();
            };
            
            // Embedded skulls at specific spots on the wall brick structure
            drawSkull(32, 32);
            drawSkull(16, 48);
            drawSkull(48, 16);
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
    },

    getFloorTexture(theme) {
        const key = 'floor_' + theme;
        if (this.cache[key]) return this.cache[key];

        let canvas;
        if (theme === 'stone') {
            // Cobblestone path
            canvas = this.generateNoise(64, 64, '#1b1b1b', '#101010', 2);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#050505';
            ctx.lineWidth = 1;
            // Draw irregular stone cobbles
            for(let i=0; i<15; i++) {
                ctx.beginPath();
                ctx.arc(Math.random()*64, Math.random()*64, 4 + Math.random()*6, 0, Math.PI*2);
                ctx.stroke();
            }
            // Add some moss patches on floor
            ctx.fillStyle = 'rgba(34, 139, 34, 0.2)';
            ctx.beginPath();
            ctx.arc(10, 10, 12, 0, Math.PI*2);
            ctx.arc(50, 45, 10, 0, Math.PI*2);
            ctx.fill();
        } else if (theme === 'metal') {
            // Metal floor plating (grates)
            canvas = this.generateNoise(64, 64, '#202020', '#151515', 1);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#050505';
            ctx.lineWidth = 1;
            // Draw grid pattern (grate lines)
            for(let i=0; i<64; i+=8) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 64); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(64, i); ctx.stroke();
            }
            // Rust on the floor
            ctx.fillStyle = 'rgba(139, 69, 19, 0.4)';
            ctx.fillRect(16, 20, 12, 8);
            ctx.fillRect(40, 8, 8, 16);
        } else if (theme === 'hell') {
            // Fleshy floor with lava cracks
            canvas = this.generateNoise(64, 64, '#1c0505', '#0c0000', 3);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#ff3300'; // glowing cracks
            ctx.lineWidth = 2;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ff3300';
            ctx.beginPath();
            ctx.moveTo(0, 10); ctx.lineTo(20, 30); ctx.lineTo(40, 15); ctx.lineTo(64, 45);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else { // darksouls fallback
            // Dark Souls gothic floor (ash-covered stone tiles with embers)
            canvas = this.generateNoise(64, 64, '#141416', '#09090b', 2);
            const ctx = canvas.getContext('2d');
            
            // Draw floor stone joints
            ctx.strokeStyle = '#040406';
            ctx.lineWidth = 1;
            for(let i=0; i<64; i+=16) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 64); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(64, i); ctx.stroke();
            }
            
            // Orange glowing ash/ember specks (Dark Souls bonfire vibe)
            ctx.fillStyle = '#ff6600';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#ff3300';
            for(let i=0; i<10; i++) {
                ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2);
            }
            ctx.shadowBlur = 0;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.cache[key] = texture;
        return texture;
    },

    getCeilingTexture(theme) {
        const key = 'ceil_' + theme;
        if (this.cache[key]) return this.cache[key];

        let canvas;
        if (theme === 'stone') {
            // Dark stone slabs with spiderwebs
            canvas = this.generateNoise(64, 64, '#141414', '#0c0c0c', 2);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            // Slab grid
            for(let i=0; i<=64; i+=32) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 64); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(64, i); ctx.stroke();
            }
            // Spiderweb lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(20, 20);
            ctx.moveTo(20, 20); ctx.lineTo(0, 40);
            ctx.moveTo(5, 10); ctx.lineTo(15, 10);
            ctx.stroke();
        } else if (theme === 'metal') {
            // Metal panels with wiring/pipes on ceiling
            canvas = this.generateNoise(64, 64, '#1a1a1a', '#101010', 1);
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#050505';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, 60, 60);
            // Pipes/Cables
            ctx.strokeStyle = '#ea8635'; // orange cable
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(10, 64); ctx.stroke();
            ctx.strokeStyle = '#444444'; // metallic pipe
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(64, 32); ctx.stroke();
        } else if (theme === 'hell') {
            // Demonic pulsing flesh ceiling
            canvas = this.generateNoise(64, 64, '#150000', '#0a0000', 4);
            const ctx = canvas.getContext('2d');
            // Creepy yellow eyes in ceiling looking down
            ctx.fillStyle = '#ffcc00';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#ffcc00';
            ctx.beginPath();
            ctx.arc(32, 20, 3, 0, Math.PI*2);
            ctx.arc(40, 20, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.fillRect(32, 19, 1, 2);
            ctx.fillRect(40, 19, 1, 2);
            // Veins
            ctx.strokeStyle = '#4a0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(36, 20); ctx.lineTo(36, 64);
            ctx.stroke();
        } else { // darksouls fallback
            // Dark Souls gothic ceiling (dark vaulted stone ceiling with hanging cobwebs)
            canvas = this.generateNoise(64, 64, '#0f0f12', '#08080a', 2);
            const ctx = canvas.getContext('2d');
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            // Vault lines
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(64, 64); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(0, 64); ctx.stroke();
            
            // Cobwebs
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(32, 32); ctx.lineTo(48, 48);
            ctx.moveTo(48, 48); ctx.lineTo(48, 32);
            ctx.moveTo(48, 48); ctx.lineTo(32, 48);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.cache[key] = texture;
        return texture;
    },

    getMonsterSprite() {
        const key = 'monster_sprite';
        if (this.cache[key]) return this.cache[key];

        const canvas = document.createElement('canvas');
        // Initial tiny dimensions, will expand once image loads
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = './new_monster_demon.png';

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Filter out white background pixels to make it transparent
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                // Threshold close to white
                if (r > 240 && g > 240 && b > 240) {
                    data[i+3] = 0; // alpha = 0
                }
            }
            ctx.putImageData(imgData, 0, 0);
            texture.needsUpdate = true;
        };

        this.cache[key] = texture;
        return texture;
    }
};
