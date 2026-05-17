// Main Game Loop and State Machine

import { GameRenderer } from './renderer.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Chest } from './chest.js';
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
        
        // Multiplayer Socket
        const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : (localStorage.getItem('BACKEND_URL') || 'https://dominos-effect-f.up.railway.app');
        this.socket = io(socketUrl);
        this.teamId = 'team-' + Math.random().toString(36).substr(2, 9);

        // Listen for mission start
        this.socket.on('mission_started', () => {
            if (this.state === 'WAITING') {
                document.getElementById('waiting-screen').classList.add('hidden');
                
                // Audio and pointer lock logic
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

                this.startLevel(0);
            }
        });

        this.socket.on('session_reset', () => {
            sessionStorage.removeItem('blockly_session');
            window.location.reload();
        });
        
        this.lastTime = performance.now();
        this.setupUI();
        
        // Session Persistence
        const savedTeam = sessionStorage.getItem('blockly_session');
        if (savedTeam) {
            const { name, id } = JSON.parse(savedTeam);
            this.teamId = id;
            const teamSpan = document.getElementById('current-team');
            if (teamSpan) teamSpan.innerText = name;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('waiting-screen').classList.remove('hidden');
            document.getElementById('waiting-team-name').innerText = `TEAM: ${name}`;
            this.state = 'WAITING';
            this.socket.emit('join_game', { teamName: name, teamId: id });
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    setupUI() {
        // System Login
        const btnLogin = document.getElementById('btn-login');
        const playerPass = document.getElementById('player-pass');
        const loginScreen = document.getElementById('login-screen');
        const mainMenu = document.getElementById('main-menu');
        const loginError = document.getElementById('login-error');

        const attemptLogin = () => {
            const teamName = document.getElementById('team-name')?.value || "PLAYER";
            const code = playerPass.value;

            // Admin Bypass Check
            if (code === '586203') {
                window.location.href = 'admin.html';
                return;
            }

            // Level Selector Code
            if (code === '661902') {
                loginScreen.classList.add('hidden');
                const adminPanel = document.getElementById('admin-panel');
                adminPanel.classList.remove('hidden');
                document.getElementById('admin-login-box').classList.add('hidden');
                document.getElementById('admin-level-selector').classList.remove('hidden');
                document.getElementById('admin-error').classList.add('hidden');
                return;
            }

            if (teamName.trim() === "") {
                loginError.innerText = "TEAM NAME REQUIRED";
                loginError.classList.remove('hidden');
                setTimeout(() => {
                    loginError.classList.add('hidden');
                    loginError.innerText = "INVALID ACCESS CODE";
                }, 2000);
                return;
            }

            if (code === '69692839') { 
                this.teamId = 'TEAM-' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('blockly_session', JSON.stringify({ name: teamName, id: this.teamId }));

                this.teamName = teamName;
                const teamSpan = document.getElementById('current-team');
                if (teamSpan) teamSpan.innerText = teamName;
                
                const waitingTeamSpan = document.getElementById('waiting-team-name');
                if (waitingTeamSpan) waitingTeamSpan.innerText = `TEAM: ${teamName}`;

                loginScreen.classList.add('hidden');
                
                // Show waiting screen
                document.getElementById('waiting-screen').classList.remove('hidden');
                this.state = 'WAITING';

                // Join Multiplayer
                this.socket.emit('join_game', { teamName, teamId: this.teamId });
            } else {
                loginError.classList.remove('hidden');
                setTimeout(() => loginError.classList.add('hidden'), 2000);
            }
        };

        if (btnLogin) btnLogin.addEventListener('click', attemptLogin);
        if (playerPass) {
            playerPass.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') attemptLogin();
            });
        }

        // Back button on login screen now does nothing or we can hide it
        document.getElementById('btn-back-login')?.classList.add('hidden');

        // Menu logic removed - consolidated into login screen
        
        document.getElementById('btn-how')?.addEventListener('click', () => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('how-to-play').classList.remove('hidden');
        });

        document.getElementById('btn-credits').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('credits').classList.remove('hidden');
        });

        document.getElementById('btn-back-how').addEventListener('click', () => {
            document.getElementById('how-to-play').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        document.getElementById('btn-back-credits').addEventListener('click', () => {
            document.getElementById('credits').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
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
            if (pass === '2839') {
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
            document.getElementById('login-screen').classList.remove('hidden');
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
                document.getElementById('login-screen').classList.remove('hidden');
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

    startLevel(index) {
        this.levelIndex = index;
        
        if (window.parent && window.parent.Game && window.parent !== window) {
            window.parent.Game.state.level = index + 1;
            window.parent.Game.updateUI();
        }
        
        // Handle Blockly Levels (6-10)
        if (this.levelIndex >= Levels.length) {
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
            
            // Real Chest at exit
            this.chests.push(new Chest(this.renderer.scene, this.maze, null, false));
            
            // Fake Chests (Traps)
            const fakeCount = 3; 
            for(let i=0; i<fakeCount; i++) {
                let fx, fy;
                do {
                    fx = Math.floor(Math.random() * this.maze.size);
                    fy = Math.floor(Math.random() * this.maze.size);
                } while (this.maze.grid[fy][fx] === 1 || (fx === this.maze.end.x && fy === this.maze.end.y));
                this.chests.push(new Chest(this.renderer.scene, this.maze, {x: fx, y: fy}, true));
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
        
        const checkpointLevel = Math.floor(this.levelIndex / 5) * 5;
        const msg = checkpointLevel === 0 ? "RESTARTING FROM LEVEL 1" : `RESTARTING FROM CHECKPOINT: LEVEL ${checkpointLevel + 1}`;
        document.querySelector('#game-over p').innerText = msg;
        
        this.state = 'GAMEOVER';
    }

    triggerTrap(chest) {
        chest.open();
        AudioSystem.playWrong();
        AudioSystem.playJumpScare(); // Reuse the scary sound for the trap
        this.reportFailure();

        this.quiz.lives--;
        document.querySelectorAll('.skull')[this.quiz.lives].style.opacity = '0.2';
        
        // Save state and set to TRAP to freeze player controls
        this.state = 'TRAP';
        
        // Screen invert punchy effect
        document.getElementById('game-canvas').style.filter = 'invert(1)';
        setTimeout(() => {
            document.getElementById('game-canvas').style.filter = 'none';
        }, 500);

        // Fetch random savage insult
        const insult = RAGE_INSULTS[Math.floor(Math.random() * RAGE_INSULTS.length)];
        const overlay = document.getElementById('rage-message-overlay');
        const textElem = document.getElementById('rage-message-text');
        
        if (textElem && overlay) {
            textElem.innerText = insult;
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
            
            if (this.quiz.lives <= 0) {
                this.onGameOver();
            } else {
                this.state = 'PLAYING';
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    try {
                        canvas.requestPointerLock();
                        canvas.focus();
                    } catch (err) {}
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
            
            let anyNear = false;
            this.chests.forEach(c => {
                const isNear = c.update(dt, this.player.camera.position);
                if (isNear && !c.isOpen) anyNear = true;
            });
            
            this.hud.showInteract(anyNear);
            
            // Minimap shows all chests
            this.hud.drawMinimap(this.maze, this.player.camera.position, this.chests);
        }

        // Always render if systems are initialized
        if (this.renderer && this.player) {
            this.renderer.render(this.player.camera.position, dt);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Removed window.onload to allow control from root game.js
