const BIN_URL = 'https://jsonbin-zeta.vercel.app/api/bins/c0QJZA0u7n';

export const Leaderboard = {
    async fetchScores() {
        try {
            const res = await fetch(BIN_URL);
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            const scores = Array.isArray(data) ? data : [];
            // Cache scores locally
            localStorage.setItem('domi_cached_scores', JSON.stringify(scores));
            return scores;
        } catch (e) {
            console.warn("Leaderboard network fetch failed, using offline fallback.", e.message);
            // Fallback to local cache
            const cached = localStorage.getItem('domi_cached_scores');
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (err) {
                    console.error("Error parsing cached scores:", err);
                }
            }
            return [];
        }
    },

    async submitScore(stats) {
        if (!stats || !stats.playerName || stats.playerName === "PLAYER" || stats.playerName.trim() === "") return;
        
        try {
            // 1. Fetch current scores (will automatically use cache if offline)
            const scores = await this.fetchScores();
            
            // 2. Remove any existing entry for this player
            const nameUpper = stats.playerName.trim().toUpperCase();
            const filtered = scores.filter(s => s.playerName.trim().toUpperCase() !== nameUpper);
            
            // 3. Add current player's score
            filtered.push({
                playerName: stats.playerName.trim().toUpperCase(),
                levelsSolved: stats.levelsSolved,
                totalFailures: stats.totalFailures,
                elapsedTime: Math.floor(stats.elapsedTime),
                lastUpdated: Date.now()
            });
            
            // 4. Sort scores:
            // - levelsSolved descending
            // - totalFailures ascending
            // - elapsedTime ascending
            filtered.sort((a, b) => {
                if (b.levelsSolved !== a.levelsSolved) {
                    return b.levelsSolved - a.levelsSolved;
                }
                if (a.totalFailures !== b.totalFailures) {
                    return a.totalFailures - b.totalFailures;
                }
                return a.elapsedTime - b.elapsedTime;
            });
            
            // Limit to top 100 entries
            const topScores = filtered.slice(0, 100);
            
            // Save to local cache immediately
            localStorage.setItem('domi_cached_scores', JSON.stringify(topScores));
            
            // 5. Save back to API
            await fetch(BIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(topScores)
            });
        } catch (e) {
            console.warn("Leaderboard network submit failed, saved locally instead.", e.message);
        }
    }
};

export function getLocalStats() {
    const raw = localStorage.getItem('domi_game_stats');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

export function saveLocalStats(stats) {
    localStorage.setItem('domi_game_stats', JSON.stringify(stats));
}

export function recordFailure() {
    const stats = getLocalStats();
    if (stats) {
        stats.totalFailures++;
        saveLocalStats(stats);
        Leaderboard.submitScore(stats);
    }
}

export function recordLevelSolved(level) {
    const stats = getLocalStats();
    if (stats) {
        if (level > stats.levelsSolved) {
            stats.levelsSolved = level;
        }
        saveLocalStats(stats);
        Leaderboard.submitScore(stats);
    }
}

export function addPlayTime(seconds) {
    const stats = getLocalStats();
    if (stats) {
        stats.elapsedTime += seconds;
        saveLocalStats(stats);
    }
}

// Bind to window for direct access from game scripts and iframe
window.getLocalStats = getLocalStats;
window.saveLocalStats = saveLocalStats;
window.recordFailure = recordFailure;
window.recordLevelSolved = recordLevelSolved;
window.addPlayTime = addPlayTime;
window.Leaderboard = Leaderboard;
