// Main Game Loop and State Machine

import { GameRenderer } from './renderer.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Chest } from './chest.js';
import { HUD } from './hud.js';
import { QuizManager } from './quiz.js';
import { Levels } from './levels.js';
import { AudioSystem } from './audio.js';

export class Game {
    constructor() {
        this.state = 'MENU'; // MENU, PLAYING, QUIZ, GAMEOVER, WIN
        this.levelIndex = 0;
        
        // Systems
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error("CRITICAL ERROR: #game-canvas not found in DOM. Check if index.html is loaded correctly.");
            alert("Game failed to load: Canvas missing. Try a hard refresh (Ctrl+F5).");
        }
        this.renderer = new GameRenderer(canvas);
        this.hud = new HUD();
        this.quiz = new QuizManager();
        
        // Entities
        this.maze = null;
        this.player = null;
        this.chests = [];
        
        this.lastTime = performance.now();
        
        this.setupUI();
        
        // Handle deep-linking to levels via URL ?level=X
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = urlParams.get('level');
        if (levelParam) {
            const lvl = parseInt(levelParam);
            if (lvl >= 1 && lvl <= 5) {
                // Auto-start if a level is specified
                setTimeout(() => {
                    this.startLevel(lvl - 1);
                    document.getElementById('main-menu').classList.add('hidden');
                    AudioSystem.init();
                    AudioSystem.resume();
                }, 500);
            }
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    setupUI() {
        // Main Menu
        document.getElementById('btn-start').addEventListener('click', () => {
            AudioSystem.init();
            AudioSystem.resume();
            document.getElementById('main-menu').classList.add('hidden');
            
            // Critical: Request pointer lock immediately on user click
            // to satisfy browser security requirements
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                canvas.requestPointerLock();
                canvas.focus();
            }

            this.startLevel(0);
        });
        
        document.getElementById('btn-how').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('how-to-play').classList.remove('hidden');
        });

        document.getElementById('btn-credits').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('credits').classList.remove('hidden');
        });

        document.getElementById('btn-back-how').addEventListener('click', () => {
            document.getElementById('how-to-play').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });

        document.getElementById('btn-back-credits').addEventListener('click', () => {
            document.getElementById('credits').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });

        // Admin Access
        document.getElementById('btn-admin').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('admin-login-box').classList.remove('hidden');
            document.getElementById('admin-level-selector').classList.add('hidden');
            document.getElementById('admin-error').classList.add('hidden');
            document.getElementById('admin-pass').value = '';
        });

        document.getElementById('btn-admin-login').addEventListener('click', () => {
            const pass = document.getElementById('admin-pass').value;
            if (pass === '6969') {
                document.getElementById('admin-login-box').classList.add('hidden');
                document.getElementById('admin-level-selector').classList.remove('hidden');
                document.getElementById('admin-error').classList.add('hidden');
            } else {
                document.getElementById('admin-error').classList.remove('hidden');
            }
        });

        document.getElementById('admin-pass').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-admin-login').click();
            }
        });

        document.getElementById('btn-back-admin').addEventListener('click', () => {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });

        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const levelIdx = parseInt(e.currentTarget.getAttribute('data-level'));
                document.getElementById('admin-panel').classList.add('hidden');
                
                AudioSystem.init();
                AudioSystem.resume();
                
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    canvas.requestPointerLock();
                    canvas.focus();
                }
                
                this.startLevel(levelIdx);
            });
        });

        // Game Over / Win
        document.getElementById('btn-restart').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            this.levelIndex = 0;
            this.quiz.lives = 3;
            // reset skulls
            document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
        });

        document.getElementById('btn-main-menu').addEventListener('click', () => {
            document.getElementById('win-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
            this.levelIndex = 0;
            this.quiz.lives = 3;
            document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
        });

        // Quiz Options
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-opt'));
                this.quiz.submitAnswer(idx);
            });
        });

        // Interaction
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.state === 'PLAYING') {
                const nearChest = this.chests.find(c => c.update(0, this.player.camera.position));
                if (nearChest && !nearChest.isOpen) {
                    if (nearChest.isFake) {
                        this.triggerTrap(nearChest);
                    } else {
                        this.triggerQuiz(nearChest);
                    }
                }
            }
        });
    }

    startLevel(index) {
        this.levelIndex = index;
        const config = Levels[this.levelIndex];
        
        this.state = 'TRANSITION';
        const transScreen = document.getElementById('level-transition');
        document.getElementById('transition-text').innerText = `LEVEL ${config.id}`;
        transScreen.classList.remove('hidden');
        
        document.getElementById('hud').classList.add('hidden');

        setTimeout(() => {
            // Generate
            this.maze = new Maze(config.size);
            this.renderer.buildLevel(this.maze, config);
            this.player = new Player(this.renderer.camera, this.maze);
            
            // Spawn Chests
            this.chests.forEach(c => c.destroy());
            this.chests = [];
            
            // Select exactly 3 distinct valid chest positions in the maze (keeping clear of player start)
            const candidatePositions = [];
            while (candidatePositions.length < 3) {
                const cx = Math.floor(Math.random() * this.maze.size);
                const cy = Math.floor(Math.random() * this.maze.size);
                if (this.maze.grid[cy][cx] === 0 && !(cx <= 2 && cy <= 2)) {
                    if (!candidatePositions.some(p => p.x === cx && p.y === cy)) {
                        candidatePositions.push({ x: cx, y: cy });
                    }
                }
            }

            // Calculate squared distance from player start (1, 1) to find the farthest one
            candidatePositions.forEach(p => {
                p.dist = Math.pow(p.x - 1, 2) + Math.pow(p.y - 1, 2);
            });
            // Sort descending (farthest first)
            candidatePositions.sort((a, b) => b.dist - a.dist);

            // Spawn the actual chest at the farthest position
            this.chests.push(new Chest(this.renderer.scene, this.maze, candidatePositions[0], false));

            // Spawn the fake chests at the remaining two positions
            for (let i = 1; i < candidatePositions.length; i++) {
                this.chests.push(new Chest(this.renderer.scene, this.maze, candidatePositions[i], true));
            }
            
            this.hud.setLevel(config.id);
            
            transScreen.classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            
            // Ensure canvas has focus
            const canvas = document.getElementById('game-canvas');
            if (canvas) canvas.focus();

            AudioSystem.startAmbient();
            
            this.state = 'PLAYING';
            this.lastTime = performance.now();
            console.log("Game started successfully.");
        }, 500);
    }

    triggerQuiz(chest) {
        this.state = 'QUIZ';
        this.player.unlockPointer();
        AudioSystem.stopAmbient();
        AudioSystem.playDiscovery();
        AudioSystem.playChestOpen();
        
        chest.open();
        
        const modal = document.getElementById('quiz-modal');
        setTimeout(() => {
            modal.classList.remove('hidden');
            this.quiz.startQuiz(Levels[this.levelIndex].id, 
                () => this.onLevelComplete(),
                () => this.onGameOver(),
                (isCorrect) => this.showQuizFeedback(isCorrect)
            );
        }, 1000); // Wait for chest animation
    }

    showQuizFeedback(isCorrect) {
        const feedback = document.getElementById('quiz-feedback');
        feedback.classList.remove('hidden', 'feedback-correct', 'feedback-wrong');
        
        if (isCorrect) {
            feedback.innerText = "ACCESS GRANTED";
            feedback.classList.add('feedback-correct');
            AudioSystem.playCorrect();
        } else {
            feedback.innerText = "SYSTEM ERROR";
            feedback.classList.add('feedback-wrong');
            AudioSystem.playWrong();
        }
        
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 1500);
    }

    onLevelComplete() {
        document.getElementById('quiz-modal').classList.add('hidden');
        AudioSystem.playFanfare();
        
        this.levelIndex++;
        if (this.levelIndex >= Levels.length) {
            this.state = 'WIN';
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('win-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = `Maze Conquered! Preparing for Logic Phase...`;
            
            // Instead of hard redirect, we now notify the parent game controller
            if (window.onPhaseComplete) {
                window.onPhaseComplete();
            } else {
                setTimeout(() => {
                    window.location.href = '../index.html?level=6';
                }, 3000);
            }
        } else {
            this.startLevel(this.levelIndex);
        }
    }

    onGameOver() {
        document.getElementById('quiz-modal').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        this.state = 'GAMEOVER';
    }

    triggerTrap(chest) {
        chest.open();
        AudioSystem.playWrong();
        AudioSystem.playJumpScare(); // Reuse the scary sound for the trap

        this.quiz.lives--;
        document.querySelectorAll('.skull')[this.quiz.lives].style.opacity = '0.2';
        
        if (this.quiz.lives <= 0) {
            setTimeout(() => this.onGameOver(), 1000);
        } else {
            // Screen shake or something? 
            document.getElementById('game-canvas').style.filter = 'invert(1)';
            setTimeout(() => {
                document.getElementById('game-canvas').style.filter = 'none';
            }, 500);
        }
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.state === 'PLAYING') {
            this.player.update(dt);
            
            let anyNear = false;
            this.chests.forEach(c => {
                const isNear = c.update(dt, this.player.camera.position);
                if (isNear && !c.isOpen) anyNear = true;
            });
            
            this.hud.showInteract(anyNear);
            
            // Minimap shows all chests
            this.hud.drawMinimap(this.maze, this.player.camera.position, this.chests);
            
            this.renderer.render(this.player.camera.position, dt);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Removed window.onload to allow control from root game.js
