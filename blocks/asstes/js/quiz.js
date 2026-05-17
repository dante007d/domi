// Quiz Logic and Question Bank

export const QuizBank = {
    1: [
        { q: "If a train travels 60 km/h for 2.5 hours, how far does it go?", options: ["120 km", "150 km", "180 km", "200 km"], a: 1 },
        { q: "What is 15% of 200?", options: ["15", "25", "30", "45"], a: 2 },
        { q: "Which is largest: 3/4, 5/7, 7/9?", options: ["3/4", "5/7", "7/9", "All equal"], a: 2 }
    ],
    2: [
        { q: "Next in series: 2, 6, 12, 20, 30, ___", options: ["38", "40", "42", "44"], a: 2 },
        { q: "Find the odd one out: 17, 23, 29, 33, 37", options: ["23", "29", "33", "37"], a: 2 },
        { q: "A + B = 10, A × B = 21. What is A - B? (A > B)", options: ["2", "3", "4", "5"], a: 2 }
    ],
    3: [
        { q: "All roses are flowers. Some flowers fade quickly. Can we conclude all roses fade quickly?", options: ["Yes", "No", "Maybe", "Insufficient data"], a: 1 },
        { q: "If CLOCK = 25 in a code, LOCK = ?", options: ["19", "20", "22", "24"], a: 0 },
        { q: "A is north of B. C is east of B. What direction is C from A?", options: ["North-East", "South-East", "South-West", "North-West"], a: 1 }
    ],
    4: [
        { q: "A can do a job in 10 days, B in 15 days. Together in how many days?", options: ["5 days", "6 days", "8 days", "12.5 days"], a: 1 },
        { q: "The average of 5 numbers is 27. If one number is removed, average becomes 25. What was removed?", options: ["25", "30", "35", "40"], a: 2 },
        { q: "Speed ratio of two trains is 3:4. If faster takes 40 min, slower takes ___?", options: ["30 min", "45 min", "50 min", "53.3 min"], a: 3 }
    ],
    5: [
        { q: "You have two ropes. Each burns in 1 hour non-uniformly. How do you measure 45 minutes?", options: ["Fold both in half", "Light rope 1 at both ends + rope 2 at one end", "Burn one, then burn half of second", "Impossible"], a: 1 },
        { q: "A bat + ball cost $1.10. Bat costs $1 more than ball. Ball costs ___?", options: ["$0.10", "$0.05", "$0.15", "$0.01"], a: 1 },
        { q: "How many squares are on a standard chessboard?", options: ["64", "128", "204", "256"], a: 2 }
    ]
};

export class QuizManager {
    constructor() {
        this.lives = 3;
        this.currentLevel = 1;
        this.currentQuestion = null;
        this.timer = 60;
        this.timerInterval = null;
        this.onComplete = null;
        this.onGameOver = null;
        this.onFeedback = null;
    }

    startQuiz(level, onComplete, onGameOver, onFeedback) {
        this.currentLevel = level;
        this.onComplete = onComplete;
        this.onGameOver = onGameOver;
        this.onFeedback = onFeedback;
        this.loadQuestion();
    }

    loadQuestion() {
        const questions = QuizBank[this.currentLevel];
        // Pick random question from level
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        this.timer = 60;
        this.updateUI();
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        const timerBar = document.getElementById('timer-bar');
        timerBar.style.width = '100%';
        
        this.timerInterval = setInterval(() => {
            this.timer -= 1;
            timerBar.style.width = `${(this.timer / 60) * 100}%`;
            
            if (this.timer <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    handleTimeout() {
        this.stopTimer();
        this.loseLife();
        if (this.lives > 0) {
            this.onFeedback(false);
            setTimeout(() => this.loadQuestion(), 2000);
        }
    }

    submitAnswer(idx) {
        this.stopTimer();
        if (idx === this.currentQuestion.a) {
            this.onFeedback(true);
            setTimeout(() => this.onComplete(), 2000);
        } else {
            this.loseLife();
            if (this.lives > 0) {
                this.onFeedback(false);
                setTimeout(() => this.loadQuestion(), 2000);
            }
        }
    }

    loseLife() {
        this.lives--;
        const skulls = document.querySelectorAll('.skull');
        if (skulls[this.lives]) {
            skulls[this.lives].style.opacity = '0.2';
        }
        if (this.lives <= 0) {
            this.onGameOver();
        }
    }

    updateUI() {
        document.getElementById('question-text').innerText = this.currentQuestion.q;
        const opts = document.querySelectorAll('.opt-text');
        for (let i = 0; i < 4; i++) {
            opts[i].innerText = this.currentQuestion.options[i];
        }
    }
}
