import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin || true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  // Production-grade performance tweaks
  pingTimeout: 30000,
  pingInterval: 15000,
  transports: ['websocket', 'polling'] 
});

app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true
}));

const gameState = {
    roomCode: "BLOCKLY-MAIN",
    gameStarted: false,
    teams: {} // teamId: { name, level, failures, startTime, totalTime, status }
};

// High-Performance Broadcast Throttle
let broadcastPending = false;

function queueStateBroadcast() {
    if (broadcastPending) return;
    
    broadcastPending = true;
    setTimeout(() => {
        io.to('game_room').emit('game_state_update', gameState);
        io.to('admin_room').emit('game_state_update', gameState);
        broadcastPending = false;
    }, 500); // Broadcast state at most twice per second (500ms intervals)
}

io.on('connection', (socket) => {
    console.log('[CONN] User connected:', socket.id);

    socket.on('join_game', ({ teamName, teamId }) => {
        console.log(`[JOIN] ${teamName} (${teamId}) joined`);
        socket.join('game_room');
        
        if (!gameState.teams[teamId]) {
            gameState.teams[teamId] = {
                id: teamId,
                name: teamName,
                level: 1,
                failures: 0,
                startTime: gameState.gameStarted ? Date.now() : null,
                totalTime: 0,
                status: 'ACTIVE'
            };
        }
        
        // Immediate update response for joining player, throttled update for rest
        socket.emit('game_state_update', gameState);
        queueStateBroadcast();

        if (gameState.gameStarted) {
            socket.emit('mission_started');
        }
    });

    socket.on('update_progress', ({ teamId, level }) => {
        const team = gameState.teams[teamId];
        if (team && team.level !== level) {
            console.log(`[PROGRESS] Team ${team.name} reached Level ${level}`);
            team.level = level;
            if (team.startTime) {
                team.totalTime = (Date.now() - team.startTime) / 1000;
            }
            queueStateBroadcast();
        }
    });

    socket.on('report_failure', ({ teamId }) => {
        const team = gameState.teams[teamId];
        if (team) {
            console.log(`[FAILURE] Team ${team.name} failed an attempt`);
            team.failures++;
            queueStateBroadcast();
        }
    });

    socket.on('admin_join', () => {
        socket.join('admin_room');
        socket.emit('game_state_update', gameState);
    });

    socket.on('start_mission', () => {
        gameState.gameStarted = true;
        const now = Date.now();
        Object.values(gameState.teams).forEach(team => {
            team.startTime = now;
        });
        io.to('game_room').emit('mission_started');
        queueStateBroadcast();
    });

    socket.on('reset_session', () => {
        gameState.gameStarted = false;
        gameState.teams = {};
        io.to('game_room').emit('session_reset');
        queueStateBroadcast();
    });

    socket.on('disconnect', () => {
        console.log('[DISCONN] User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`⬡ Production Blockly Multiplayer Server running on port ${PORT}`);
});
