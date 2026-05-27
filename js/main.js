// Main Game Loop and State Machine

import { GameRenderer } from './renderer.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Chest } from './chest.js';
import { Monster } from './monster.js';
import { HUD } from './hud.js';
import { QuizManager } from './quiz.js';
import { Levels } from './levels.js';
import { AudioSystem } from './audio.js';

const RAGE_INSULTS = [
    "I’ve seen disconnected players contribute more than you.",
    "You’re not the weakest player here. You’re the reason the weak feel better about themselves.",
    "You fight like every neuron in your brain filed for resignation.",
    "Your gameplay is a crime scene and your teammates are the witnesses.",
    "You don’t make mistakes anymore. You manufacture disasters.",
    "You move with the confidence of a god and the awareness of roadkill.",
    "The enemy team isn’t trying to kill you anymore. They’re just seeing what else you’ll do wrong.",
    "You are single-handedly lowering the skill ceiling of the entire match.",
    "You play like failure owes you money.",
    "Your mechanics are so bad they look intentionally sabotaged.",
    "You got dismantled so completely even the spectators lost respect.",
    "You aim like your crosshair has a restraining order against enemies.",
    "Every time you touch the keyboard, your team loses hope.",
    "You’re not unpredictable because you’re smart. You’re unpredictable because nothing you do makes sense.",
    "You enter fights already defeated.",
    "The enemy doesn’t outplay you. They wait for you to self-destruct.",
    "You perform like a motivational quote written on a collapsing building.",
    "Your existence in ranked is a public safety hazard.",
    "You’re so consistently useless it almost becomes impressive.",
    "You fight like your brain is running on trial software.",
    "You’re not pressure-tested. You’re pressure-deleted.",
    "The scoreboard isn’t stats anymore. It’s evidence.",
    "You’re the human equivalent of a failed quick-time event.",
    "You got humiliated so badly the game should apologize for matchmaking.",
    "Your gameplay radiates panic, confusion, and unemployment.",
    "You’re not a clutch player. You’re a cautionary tale.",
    "You make incompetence look genetically inherited.",
    "Your enemies stopped respecting the fight and started speedrunning you.",
    "You move like your keyboard inputs are legally binding mistakes.",
    "Every round with you feels like a hostage situation.",
    "You don’t lose because of mechanics. You lose because every decision you make is catastrophically stupid.",
    "You have the awareness of expired yogurt.",
    "Your strategy is just random panic disguised as movement.",
    "You’re the reason teammates mute voice chat.",
    "You fight like your thoughts arrive 30 seconds late.",
    "You couldn’t outplay a loading screen.",
    "Your gameplay belongs in a museum of preventable disasters.",
    "The enemy team isn’t farming kills anymore. They’re farming confidence.",
    "You’re not dead weight. Dead weight at least stays still.",
    "You bring the tactical value of a smoke detector without batteries.",
    "You’re the first player I’ve seen get mentally defeated before the countdown ends.",
    "You play like your mouse is controlled by intrusive thoughts.",
    "You’re not improving. You’re just repeating failure with enthusiasm.",
    "You aim with the determination of a blindfolded tourist.",
    "Your performance makes bots look handcrafted.",
    "You are the strongest argument against skill-based matchmaking.",
    "You fight like a man trying to refund the game through gameplay.",
    "Your team doesn’t need enemies with you around.",
    "You got outclassed so badly it looked educational.",
    "You’re not part of the match. You’re the comic relief.",
    "The only thing more fragile than your gameplay is your decision-making.",
    "You are what happens when ego queues without skill.",
    "You are living proof that matchmaking can fail catastrophically.",
    "Calling you trash is disrespectful to garbage. Garbage gets recycled into something useful.",
    "You play like your monitor is turned off and your ego is turned up.",
    "Every second you stay alive is statistical luck.",
    "You’re not feeding the enemy. You’re running a charity.",
    "Your gameplay has the survival instinct of a moth in a furnace.",
    "You fight like someone typing with oven mitts.",
    "Your enemies aren’t even impressed anymore. They’re concerned.",
    "You have the mechanical precision of a collapsing shopping cart.",
    "Watching you play explains why natural selection takes time.",
    "You bring absolutely nothing to the battlefield except extra deaths.",
    "Your aim belongs in a missing persons report.",
    "You move like your brain and hands are in a long-distance relationship.",
    "Even your own teammates mentally disconnected from you.",
    "You’re the kind of noob tutorials warn people about.",
    "Your opponent isn’t skilled. You’re just catastrophically incompetent.",
    "You got destroyed so badly the replay should be classified as violence.",
    "Every fight becomes easier the moment you join the enemy team accidentally.",
    "You play like failure is genetically encoded.",
    "Your confidence survives longer than your character ever does.",
    "You make basic mistakes with professional consistency.",
    "Even bots would hesitate before making decisions this stupid.",
    "You’re not hardstuck because of teammates. You are the teammate.",
    "Your gameplay looks like a parody made to insult bad players.",
    "You die with such speed and consistency it feels automated.",
    "You enter fights like a motivational speaker and leave like roadkill.",
    "You couldn’t clutch a single neuron together under pressure.",
    "You aim at enemies like you’re politely asking permission to hit them.",
    "Your strategy begins with panic and ends with excuses.",
    "You have the tactical awareness of a wet sock.",
    "Your performance lowered the value of teamwork.",
    "You got outplayed so hard your keyboard deserves a better owner.",
    "You play like you owe the enemy team money.",
    "You’re not learning from mistakes anymore. You’re preserving traditions.",
    "The only thing carrying you is delusion.",
    "You lose fights before they even begin because your decisions are terminally bad.",
    "You make incompetence look effortless.",
    "Your mechanics are so bad they loop back into comedy.",
    "You fight like your thoughts are buffering.",
    "You’re what happens when confidence outruns intelligence.",
    "The enemy isn’t farming kills anymore. They’re farming self-esteem.",
    "You bring the same energy as a broken controller at a tournament.",
    "You got read so easily your opponent probably predicted your birth date too.",
    "You are the final boss of poor decision-making.",
    "Your gameplay belongs in a cautionary documentary.",
    "You have the awareness of decorative furniture.",
    "You’re not unlucky. You’re just bad repeatedly.",
    "Your existence in this lobby is a competitive disadvantage.",
    "You play with the intensity of a man trying to lose on purpose.",
    "Even spectators are getting tilted watching this incompetence.",
    "You got folded so fast the laws of physics took notes.",
    "Your enemies stopped sweating and started experimenting.",
    "You’re not a threat. You’re warm-up content.",
    "The arena doesn’t fear you. It farms you.",
    "I’ve seen training dummies survive longer than you.",
    "You’re not just bad — you actively reduce the intelligence of the entire lobby.",
    "Your gameplay is what happens when confidence develops faster than skill.",
    "You die so fast the respawn timer knows you personally.",
    "Even your failures lack effort.",
    "You play like your only goal is disappointing everyone equally.",
    "The enemy team stopped calling you a threat five deaths ago.",
    "You have the tactical awareness of a brick thrown through a window.",
    "Every decision you make somehow becomes the worst possible one.",
    "You move like panic is your default control scheme.",
    "You’re not hard to beat. You’re hard to watch.",
    "You got destroyed with such efficiency it looked scheduled.",
    "The only thing sharp about your gameplay is the drop in team morale.",
    "You enter every fight with the confidence of a champion and the competence of unplugged hardware.",
    "You are the physical manifestation of ‘skill issue.’",
    "Your enemies aren’t adapting to you. They’re abusing you.",
    "You fight like a motivational speech trapped inside a bad player.",
    "You’ve mastered one mechanic: losing consistently.",
    "Watching you think in real time is painful.",
    "You got folded so hard even your excuses sounded defeated.",
    "Your gameplay has the energy of expired batteries.",
    "You make simple mistakes with elite precision.",
    "You’re not a competitor. You’re environmental storytelling.",
    "You play like the concept of improvement personally offended you.",
    "The enemy team uses you to test risky strategies because they know you can’t punish mistakes.",
    "You have the reaction time of a voicemail.",
    "You collapse under pressure that doesn’t even exist.",
    "You fight like your survival depends entirely on luck and pity.",
    "Your gameplay belongs in a bug report.",
    "You make losing look less like failure and more like destiny.",
    "You’re not trash. Trash eventually gets taken out.",
    "The only thing carrying you is matchmaking mercy.",
    "You’re the reason tutorials include pictures.",
    "Your teammates stopped expecting help and started expecting damage control.",
    "You got dismantled so completely the scoreboard looks disrespectful.",
    "You aim like your crosshair is afraid of enemies.",
    "You bring chaos to your own side and confidence to the enemy.",
    "Your gameplay is a live demonstration of unmanaged incompetence.",
    "You move through the map like a lost tourist.",
    "Even your lucky moments look accidental.",
    "You don’t lose because the enemy is good. You lose because you exist in the fight.",
    "You’re not getting outplayed anymore. You’re getting studied.",
    "You make bad decisions with the certainty of a genius.",
    "The enemy team treats you like free downloadable content.",
    "You’re the weakest thing on the battlefield, including the decorations.",
    "You enter every match like a hero and leave like evidence.",
    "Your survival instincts are purely decorative.",
    "You got humiliated so hard even the game stopped trying to make it fair.",
    "You play with maximum ego and minimum awareness.",
    "Your mechanics look hand-crafted to fail under pressure.",
    "You are what happens when failure gets a keyboard.",
    "Every time you respawn, the enemy gets a confidence boost.",
    "You’re not built for competition. You’re built for tutorials.",
    "You fight like your brain clocked out before the match started.",
    "The scoreboard tells a story, and your chapter is pure suffering."
];

export class Game {
    constructor() {
        window.game = this; // For debugging
        this.state = 'MENU'; // MENU, PLAYING, QUIZ, GAMEOVER, WIN
        this.levelIndex = 0;
        this.maxUnlockedLevel = parseInt(localStorage.getItem('domi_unlocked_level') || '1');
        
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
        this.maze = new Maze(11);
        this.renderer.buildLevel(this.maze, Levels[0]);
        this.player = new Player(this.renderer.camera, this.maze);
        this.chests = [];
        this.monsters = [];
        window.gameInstance = this;
        
        // Multiplayer Socket disabled for Single Player Mode
        this.socket = null;
        this.teamId = 'player-' + Math.random().toString(36).substr(2, 9);
        
        this.lastTime = performance.now();
        this.setupUI();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    setupUI() {
        // Start Game locally
        document.getElementById('btn-start')?.addEventListener('click', () => {
            AudioSystem.init();
            AudioSystem.resume();
            document.getElementById('main-menu').classList.add('hidden');
            
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                setTimeout(() => {
                    try {
                        canvas.requestPointerLock();
                        canvas.focus();
                    } catch (err) {
                        console.warn("Pointer lock request failed:", err);
                    }
                }, 100);
            }

            this.startLevel(0);
        });

        document.getElementById('btn-how')?.addEventListener('click', () => {
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

        // SELECT LEVEL Start Menu Button
        document.getElementById('btn-select-level')?.addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            this.updateLevelSelectorUI();
        });

        // HUD Menu button
        document.getElementById('btn-hud-menu')?.addEventListener('click', () => {
            this.exitToMainMenu();
        });

        // Global keydown listeners for Menu exit and B-cheat
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === '`') {
                document.getElementById('main-menu').classList.add('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                this.updateLevelSelectorUI();
            }
            if (key === 'b') {
                this.maxUnlockedLevel = 20;
                localStorage.setItem('domi_unlocked_level', '20');
                this.updateLevelSelectorUI();
                
                // Show a brief unlock notification on screen
                const alertDiv = document.createElement('div');
                alertDiv.innerText = "ALL LEVELS UNLOCKED!";
                alertDiv.style.position = 'absolute';
                alertDiv.style.top = '10%';
                alertDiv.style.left = '50%';
                alertDiv.style.transform = 'translate(-50%, -50%)';
                alertDiv.style.fontFamily = "'Press Start 2P', monospace";
                alertDiv.style.color = '#ffaa00';
                alertDiv.style.background = 'rgba(0,0,0,0.8)';
                alertDiv.style.border = '2px solid #ffaa00';
                alertDiv.style.padding = '15px';
                alertDiv.style.zIndex = '9999';
                alertDiv.style.fontSize = '1rem';
                alertDiv.style.textShadow = '2px 2px #000';
                document.body.appendChild(alertDiv);
                setTimeout(() => alertDiv.remove(), 2000);
            }
            if (this.state === 'PLAYING' && (key === 'q' || e.key === 'Backspace')) {
                this.exitToMainMenu();
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
                    setTimeout(() => {
                        try {
                            canvas.requestPointerLock();
                            canvas.focus();
                        } catch (err) {
                            console.warn("Pointer lock request failed:", err);
                        }
                    }, 100);
                }
                
                this.startLevel(levelIdx);
            });
        });

        // Game Over / Win
        // Game Over Restart
        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                const checkpointIndex = Math.floor(this.levelIndex / 5) * 5;
                document.getElementById('game-over').classList.add('hidden');
                
                // Reset Quiz Stats
                this.quiz.lives = 3;
                document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
                
                this.startLevel(checkpointIndex);
            });
        }

        // Pointer Lock & Focus Safety
        document.addEventListener('click', () => {
            if (this.state === 'PLAYING') {
                const canvas = document.getElementById('game-canvas');
                if (canvas && document.pointerLockElement !== canvas) {
                    canvas.requestPointerLock();
                }
            }
        });

        const btnMainMenu = document.getElementById('btn-main-menu');
        if (btnMainMenu) {
            btnMainMenu.addEventListener('click', () => {
                document.getElementById('win-screen').classList.add('hidden');
                document.getElementById('main-menu').classList.remove('hidden');
                this.levelIndex = 0;
                this.quiz.lives = 3;
                document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
            });
        }

        // Quiz Options
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-opt'));
                this.quiz.submitAnswer(idx);
            });
        });

        // Interaction
        document.addEventListener('keydown', (e) => {
            if (e.key && e.key.toLowerCase() === 'e' && this.state === 'PLAYING') {
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

    updateLevelSelectorUI() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const levelIdx = parseInt(btn.getAttribute('data-level'));
            // levelIdx is 0-indexed (0 to 24), this.maxUnlockedLevel is 1-indexed (1 to 25)
            if (levelIdx < this.maxUnlockedLevel) {
                btn.classList.remove('locked-btn');
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                btn.style.borderColor = '#ffaa00';
                btn.style.color = '#ffaa00';
            } else {
                btn.classList.add('locked-btn');
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
                btn.style.borderColor = '#444';
                btn.style.color = '#444';
            }
        });
    }

    exitToMainMenu() {
        if (document.pointerLockElement) {
            try {
                document.exitPointerLock();
            } catch(e) {
                console.warn(e);
            }
        }
        if (this.monsters) {
            this.monsters.forEach(m => m.destroy());
            this.monsters = [];
        }
        AudioSystem.stopAmbient();
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('quiz-modal').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.state = 'MENU';
    }

    startLevel(index) {
        this.levelIndex = index;
        this.quiz.lives = 3;
        document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
        
        if (window.parent && window.parent.Game && window.parent !== window) {
            window.parent.Game.state.level = index + 1;
            window.parent.Game.updateUI();
        }
        
        // Handle SPECTRUM Levels (11+)
        if (this.levelIndex >= 10) {
            if (window.fetchLevel) {
                window.fetchLevel(this.levelIndex + 1);
            } else {
                // Fallback to URL if fetchLevel is not globally available yet
                window.location.href = '?level=' + (this.levelIndex + 1);
            }
            return;
        }

        const config = Levels[this.levelIndex];

        // Report progress to server
        if (this.socket) {
            console.log(`[SOCKET] Reporting Level ${config.id} reached...`);
            this.socket.emit('update_progress', { teamId: this.teamId, level: config.id });
        }
        
        this.state = 'TRANSITION';
        const transScreen = document.getElementById('level-transition');
        document.getElementById('transition-text').innerText = `LEVEL ${config.id}`;
        transScreen.classList.remove('hidden');
        
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.add('hidden');
        
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

            // Spawn the fake chests at the remaining positions
            this.chests.push(new Chest(this.renderer.scene, this.maze, candidatePositions[1], true));
            this.chests.push(new Chest(this.renderer.scene, this.maze, candidatePositions[2], true));

            // Spawn Monsters (Scaling count with level, safe positioning)
            if (this.monsters) {
                this.monsters.forEach(m => m.destroy());
            }
            this.monsters = [];
            
            let numMonsters = Math.min(8, 2 + Math.floor((config.id - 1) / 2));
            if (config.id >= 6 && config.id <= 10) {
                numMonsters = 0; // No monsters in levels 6-10
            }
            const monsterPositions = [];
            while (monsterPositions.length < numMonsters) {
                const mx = Math.floor(Math.random() * this.maze.size);
                const mz = Math.floor(Math.random() * this.maze.size);
                const distToPlayer = Math.abs(mx - 1) + Math.abs(mz - 1);
                if (this.maze.grid[mz][mx] === 0 && distToPlayer > 5) {
                    if (!monsterPositions.some(p => p.x === mx && p.z === mz)) {
                        monsterPositions.push({ x: mx, z: mz });
                    }
                }
            }

            monsterPositions.forEach(pos => {
                this.monsters.push(new Monster(this.renderer.scene, this.maze, this.player, pos.x + 0.5, pos.z + 0.5));
            });
            
            this.hud.setLevel(config.id);
            
            transScreen.classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            
            // Ensure canvas has focus
            const canvas = document.getElementById('game-canvas');
            if (canvas) canvas.focus();

            AudioSystem.startAmbient();
            
            this.state = 'PLAYING';
            this.lastTime = performance.now();
            console.log("Game started successfully. Maze size:", this.maze.size);
            console.log("Walls in scene:", this.renderer.walls.length);
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
            this.reportFailure();
        }
        
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 1500);
    }

    onLevelComplete() {
        document.getElementById('quiz-modal').classList.add('hidden');
        AudioSystem.playFanfare();
        
        this.levelIndex++;
        if (window.recordLevelSolved) {
            window.recordLevelSolved(this.levelIndex);
        }
        if (this.levelIndex + 1 > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = Math.min(20, this.levelIndex + 1);
            localStorage.setItem('domi_unlocked_level', this.maxUnlockedLevel.toString());
            this.updateLevelSelectorUI();
        }
        if (this.levelIndex >= 10) {
            this.state = 'WIN';
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('win-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = `Maze Conquered! Preparing for Phase 2...`;
            
            // Instead of hard redirect, we now notify the parent game controller
            if (window.onPhaseComplete) {
                window.onPhaseComplete();
            } else {
                setTimeout(() => {
                    if (window.fetchLevel) {
                        window.fetchLevel(11);
                    } else {
                        window.location.href = '../index.html?level=11';
                    }
                }, 3000);
            }
        } else {
            this.startLevel(this.levelIndex);
        }
    }

    shootGlock() {
        // Disabled: player has no gun, only hands to run away from monsters.
    }

    onGameOver() {
        document.getElementById('quiz-modal').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        const checkpointLevel = Math.floor(this.levelIndex / 5) * 5;
        const msg = checkpointLevel === 0 ? "RESTARTING FROM LEVEL 1" : `RESTARTING FROM CHECKPOINT: LEVEL ${checkpointLevel + 1}`;
        document.querySelector('#game-over p').innerText = msg;
        
        this.state = 'GAMEOVER';
    }

    triggerTrap(chest) {
        chest.open();
        AudioSystem.playWrong();
        AudioSystem.playJumpScare(); // Reuse the scary sound for the trap
        
        // Respawn the player back to the start of the maze
        this.player.respawn();

        // Save state and set to TRAP to freeze player controls
        this.state = 'TRAP';
        
        // Screen invert punchy effect
        document.getElementById('game-canvas').style.filter = 'invert(1)';
        setTimeout(() => {
            document.getElementById('game-canvas').style.filter = 'none';
        }, 500);

        // Fetch random savage insult and add alert
        const insult = RAGE_INSULTS[Math.floor(Math.random() * RAGE_INSULTS.length)];
        const overlay = document.getElementById('rage-message-overlay');
        const textElem = document.getElementById('rage-message-text');
        
        if (textElem && overlay) {
            textElem.innerText = "FAKE CHEST TRAP! RESPONDING AT START!\n\n" + insult;
            overlay.style.display = 'flex';
            overlay.classList.remove('hidden');
        }

        // Release pointer lock so player can see screen clearly
        try {
            document.exitPointerLock();
        } catch (e) {}

        // Freeze for exactly 5 seconds
        setTimeout(() => {
            if (overlay) {
                overlay.style.display = 'none';
                overlay.classList.add('hidden');
            }
            
            this.state = 'PLAYING';
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                try {
                    canvas.requestPointerLock();
                    canvas.focus();
                } catch (err) {}
            }
        }, 5000);
    }

    triggerMonsterAttack(monster) {
        AudioSystem.playJumpScare();
        
        // Show jumpscare overlay for 1.5 seconds
        const jumpscareOverlay = document.getElementById('jumpscare-overlay');
        if (jumpscareOverlay) {
            jumpscareOverlay.classList.remove('hidden');
            jumpscareOverlay.style.display = 'flex';
            
            let flashCount = 0;
            const flashInt = setInterval(() => {
                jumpscareOverlay.style.filter = flashCount % 2 === 0 ? 'invert(1)' : 'none';
                flashCount++;
            }, 100);
            
            setTimeout(() => {
                clearInterval(flashInt);
                jumpscareOverlay.style.filter = 'none';
                jumpscareOverlay.style.display = 'none';
                jumpscareOverlay.classList.add('hidden');
                
                // Show Rage Message Overlay and freeze player
                this.showRageMessageAndDeductLife();
            }, 1500);
        } else {
            this.showRageMessageAndDeductLife();
        }
    }

    showRageMessageAndDeductLife() {
        // Respawn player
        this.player.respawn();

        // Save state and freeze controls
        this.state = 'TRAP';
        
        // Screen invert punchy effect
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.style.filter = 'invert(1)';
        setTimeout(() => {
            if (canvas) canvas.style.filter = 'none';
        }, 500);

        // Fetch random savage insult and show overlay
        const insult = RAGE_INSULTS[Math.floor(Math.random() * RAGE_INSULTS.length)];
        const overlay = document.getElementById('rage-message-overlay');
        const textElem = document.getElementById('rage-message-text');
        
        if (textElem && overlay) {
            textElem.innerText = "MONSTER CAUGHT YOU!\n\n" + insult;
            overlay.style.display = 'flex';
            overlay.classList.remove('hidden');
        }

        // Release pointer lock
        try {
            document.exitPointerLock();
        } catch (e) {}

        // Deduct life
        this.quiz.lives--;
        if (window.recordFailure) {
            window.recordFailure();
        }
        const skulls = document.querySelectorAll('.skull');
        if (skulls[this.quiz.lives]) {
            skulls[this.quiz.lives].style.opacity = '0.2';
        }

        // Freeze for 5 seconds
        setTimeout(() => {
            if (overlay) {
                overlay.style.display = 'none';
                overlay.classList.add('hidden');
            }
            
            if (this.quiz.lives <= 0) {
                this.onGameOver();
            } else {
                this.state = 'PLAYING';
                const canvasElem = document.getElementById('game-canvas');
                if (canvasElem) {
                    try {
                        canvasElem.requestPointerLock();
                        canvasElem.focus();
                    } catch (err) {}
                }
                
                // Reset positions of all monsters
                if (this.monsters) {
                    this.monsters.forEach(m => m.resetPosition());
                }
            }
        }, 5000);
    }

    reportFailure() {
        if (this.socket) {
            this.socket.emit('report_failure', { teamId: this.teamId });
        }
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.state === 'PLAYING') {
            this.player.update(dt);
            if (this.monsters) {
                this.monsters.forEach(m => m.update(dt));
            }
            
            let anyNear = false;
            this.chests.forEach(c => {
                const isNear = c.update(dt, this.player.camera.position);
                if (isNear && !c.isOpen) anyNear = true;
            });
            
            this.hud.showInteract(anyNear);
            
            // Minimap shows all chests and monsters
            this.hud.drawMinimap(this.maze, this.player.camera.position, this.chests, this.monsters);
        }

        // Always render if systems are initialized
        if (this.renderer && this.player) {
            this.renderer.render(this.player.camera.position, dt);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Removed window.onload to allow control from root game.js
