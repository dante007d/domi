// Quiz Logic and Question Bank

export const QuizBank = {
    1: [
        { q: "What is the remainder when 17 is divided by 5?", options: ["1", "2", "3", "4"], a: 1 },
        { q: "If 3x = 27, find x².", options: ["9", "27", "81", "3"], a: 2 },
        { q: "What is the simple interest on Rs 2000 at 10% per annum for 2 years?", options: ["200", "300", "400", "500"], a: 2 },
        { q: "A shopkeeper gives 10% discount on Rs 500. Find the selling price.", options: ["400", "450", "475", "490"], a: 1 }
    ],
    2: [
        { q: "What is the probability of getting an even number on a dice?", options: ["1/6", "1/3", "1/2", "2/3"], a: 2 },
        { q: "Find the HCF of 18 and 24.", options: ["2", "4", "6", "8"], a: 2 },
        { q: "If a = 5 and b = 3, find the value of a² + b².", options: ["25", "30", "34", "36"], a: 2 },
        { q: "A boat travels 24 km downstream in 3 hours. Find its speed downstream.", options: ["6 km/h", "8 km/h", "10 km/h", "12 km/h"], a: 1 }
    ],
    3: [
        { q: "What is the area of a triangle with base 10 cm and height 8 cm?", options: ["20 cm²", "30 cm²", "40 cm²", "50 cm²"], a: 2 },
        { q: "Find the value of 7 × 8 - 12.", options: ["42", "44", "46", "48"], a: 1 },
        { q: "Find the next term: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "48"], a: 2 },
        { q: "A number is increased by 25% and becomes 100. What was the original number?", options: ["75", "80", "85", "90"], a: 1 }
    ],
    4: [
        { q: "What is the value of 15² - 10²?", options: ["100", "125", "150", "175"], a: 1 },
        { q: "A train moving at 72 km/h covers how many meters in 5 seconds?", options: ["90", "100", "110", "120"], a: 1 },
        { q: "Find the average of first 10 natural numbers.", options: ["5", "5.5", "6", "6.5"], a: 1 },
        { q: "How many diagonals does a hexagon have?", options: ["6", "8", "9", "12"], a: 2 }
    ],
    5: [
        { q: "Find the next number: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "14"], a: 2 },
        { q: "What is the value of 2³ + 3²?", options: ["15", "16", "17", "18"], a: 2 },
        { q: "Find the missing term: 4, 9, 16, 25, ?", options: ["30", "35", "36", "49"], a: 2 },
        { q: "A man buys an item for Rs 800 and sells it for Rs 1000. Find profit percentage.", options: ["20%", "25%", "30%", "35%"], a: 1 }
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
