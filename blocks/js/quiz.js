// Quiz Logic and Question Bank

export const QuizBank = {
    1: [
        { q: "A Caesar cipher shifts letters by key K. If 'HELLO' becomes 'KHOOR', what does 'CODE' become?", options: ["EQHG", "FRGH", "GSHI", "ERGH"], a: 1 },
        { q: "A drawer has 6 black socks and 4 blue socks. What is the minimum number of socks to pull in the dark to guarantee a matching pair?", options: ["2", "3", "4", "5"], a: 1 },
        { q: "If Alice lies on M/Tu/W and Bob lies on Th/F/Sa, and both say 'Yesterday I lied', what day is it today?", options: ["Monday", "Thursday", "Sunday", "Wednesday"], a: 1 },
        { q: "What is the next number in this sequence: 2, 9, 28, 65, 126, ?", options: ["197", "217", "225", "254"], a: 1 },
        { q: "If a binary tree has 15 nodes, what is the maximum possible height (number of edges on the longest root-to-leaf path)?", options: ["3", "7", "14", "15"], a: 2 }
    ],
    2: [
        { q: "How many positive integers less than 100 are coprime to 100?", options: ["40", "50", "60", "99"], a: 0 },
        { q: "You roll two fair six-sided dice. What is the probability that the sum of the numbers rolled is a prime number?", options: ["1/3", "5/12", "7/18", "1/2"], a: 1 },
        { q: "What is the last digit of 7^2026?", options: ["7", "9", "3", "1"], a: 1 },
        { q: "Five people run a race. How many different ways can they finish if there are no ties?", options: ["24", "60", "120", "240"], a: 2 },
        { q: "If a + b = 10 and a² + b² = 58, what is the value of ab?", options: ["15", "18", "21", "24"], a: 2 }
    ],
    3: [
        { q: "In a group of 30 people, 15 play soccer, 12 play basketball, and 5 play both. How many play neither?", options: ["3", "5", "8", "10"], a: 2 },
        { q: "A script doubles infected servers every hour. If it takes 48 hours to infect the whole network, how long to infect half of it?", options: ["24", "36", "44", "47"], a: 3 },
        { q: "Solve for x in the equation: log₂(x) + log₂(x - 2) = 3.", options: ["2", "4", "6", "8"], a: 1 },
        { q: "What is the time complexity of the Master Theorem case where T(N) = 2T(N/2) + O(N)?", options: ["O(N)", "O(N log N)", "O(N²)", "O(log N)"], a: 1 },
        { q: "What is the hexadecimal representation of the decimal number 250?", options: ["E9", "FA", "FB", "EF"], a: 1 }
    ],
    4: [
        { q: "Monty Hall: Prize behind 3 doors. You pick 1. Host reveals Door 3 is empty. What is your win probability if you switch?", options: ["1/3", "1/2", "2/3", "3/4"], a: 2 },
        { q: "If f(n) = f(n-1) + f(n-2) with f(0)=0, f(1)=1, what is the value of f(10)?", options: ["34", "55", "89", "144"], a: 1 },
        { q: "A bag has 3 red marbles and 2 blue. If you draw two without replacement, what is the probability that both are red?", options: ["3/10", "6/25", "2/5", "1/2"], a: 0 },
        { q: "If 12 machines print 12 books in 12 minutes, how many minutes does it take 100 machines to print 100 books?", options: ["1", "12", "100", "1200"], a: 1 },
        { q: "What is the minimum weighings needed to find one heavier counterfeit coin among 8 identical-looking coins using a balance?", options: ["2", "3", "4", "8"], a: 0 }
    ],
    5: [
        { q: "A clock shows 3:15. What is the precise angle (in degrees) between the hour and minute hands?", options: ["0°", "5°", "7.5°", "15°"], a: 2 },
        { q: "If a regular polygon has interior angles of 144 degrees, how many sides does it have?", options: ["8", "10", "12", "15"], a: 1 },
        { q: "What is the value of the infinite sum: 1/2 + 1/4 + 1/8 + 1/16 + ... ?", options: ["1", "1.5", "2", "Infinite"], a: 0 },
        { q: "In how many ways can you arrange the letters in the word 'DOMINO'?", options: ["120", "360", "720", "1440"], a: 1 },
        { q: "A cryptographic hash function must satisfy collision resistance. This means:", options: ["No two inputs produce the same hash", "It is impossible to reverse the hash", "It is hard to find any two inputs with same hash", "It runs in O(1) constant time"], a: 2 }
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
