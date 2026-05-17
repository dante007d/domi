
const fs = require('fs');

const existing400 = JSON.parse(fs.readFileSync('existing_400.json', 'utf8'));

const newQuestionsRaw = [
    {
      "id": 1,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 2,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 3,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 4,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 225 km in 5 hours. What is the average speed?",
      "options": { "A": "35 km/h", "B": "45 km/h", "C": "55 km/h", "D": "65 km/h" },
      "answer": "B"
    },
    {
      "id": 5,
      "difficulty": "easy",
      "category": "Logical Thinking",
      "question": "Find the next number: 2, 4, 6, 8, ?",
      "options": { "A": "9", "B": "10", "C": "12", "D": "14" },
      "answer": "B"
    },
    {
      "id": 6,
      "difficulty": "easy",
      "category": "Basic Coding",
      "question": "Which symbol is used to end a statement in C language?",
      "options": { "A": ".", "B": ";", "C": ":", "D": "#" },
      "answer": "B"
    },
    {
      "id": 7,
      "difficulty": "easy",
      "category": "Aptitude",
      "question": "A product is bought for ₹82 and sold for ₹101. What is the profit?",
      "options": { "A": "₹17", "B": "₹19", "C": "₹21", "D": "₹24" },
      "answer": "B"
    },
    {
      "id": 8,
      "difficulty": "easy",
      "category": "Logical Thinking",
      "question": "Find the next number: 2, 4, 6, 8, ?",
      "options": { "A": "9", "B": "10", "C": "12", "D": "14" },
      "answer": "B"
    },
    {
      "id": 9,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 40 + 44?",
      "options": { "A": "82", "B": "84", "C": "87", "D": "89" },
      "answer": "B"
    },
    {
      "id": 10,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 1, 2, 4, 8, ?",
      "options": { "A": "10", "B": "16", "C": "16", "D": "24" },
      "answer": "B"
    },
    {
      "id": 11,
      "difficulty": "easy",
      "category": "General Technical",
      "question": "Which device is used to type text into a computer?",
      "options": { "A": "Monitor", "B": "Keyboard", "C": "Speaker", "D": "Printer" },
      "answer": "B"
    },
    {
      "id": 12,
      "difficulty": "easy",
      "category": "General Technical",
      "question": "Which device is used to type text into a computer?",
      "options": { "A": "Monitor", "B": "Keyboard", "C": "Speaker", "D": "Printer" },
      "answer": "B"
    },
    {
      "id": 13,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 14,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 288 km in 4 hours. What is the average speed?",
      "options": { "A": "62 km/h", "B": "72 km/h", "C": "82 km/h", "D": "92 km/h" },
      "answer": "B"
    },
    {
      "id": 15,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 27 + 43?",
      "options": { "A": "68", "B": "70", "C": "73", "D": "75" },
      "answer": "B"
    },
    {
      "id": 16,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 4, 8, 16, 32, ?",
      "options": { "A": "34", "B": "64", "C": "40", "D": "48" },
      "answer": "B"
    },
    {
      "id": 17,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 7 + 45?",
      "options": { "A": "50", "B": "52", "C": "55", "D": "57" },
      "answer": "B"
    },
    {
      "id": 18,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 22 + 11?",
      "options": { "A": "31", "B": "33", "C": "36", "D": "38" },
      "answer": "B"
    },
    {
      "id": 19,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 4, 8, 16, 32, ?",
      "options": { "A": "34", "B": "64", "C": "40", "D": "48" },
      "answer": "B"
    },
    {
      "id": 20,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 21,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 222 km in 3 hours. What is the average speed?",
      "options": { "A": "64 km/h", "B": "74 km/h", "C": "84 km/h", "D": "94 km/h" },
      "answer": "B"
    },
    {
      "id": 22,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 23,
      "difficulty": "easy",
      "category": "Technology",
      "question": "What does CPU stand for?",
      "options": { "A": "Central Processing Unit", "B": "Computer Power Unit", "C": "Central Program Utility", "D": "Core Processing Utility" },
      "answer": "A"
    },
    {
      "id": 24,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 156 km in 2 hours. What is the average speed?",
      "options": { "A": "68 km/h", "B": "78 km/h", "C": "88 km/h", "D": "98 km/h" },
      "answer": "B"
    },
    {
      "id": 25,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 22 + 43?",
      "options": { "A": "63", "B": "65", "C": "68", "D": "70" },
      "answer": "B"
    },
    {
      "id": 26,
      "difficulty": "easy",
      "category": "Basic Coding",
      "question": "Which symbol is used to end a statement in C language?",
      "options": { "A": ".", "B": ";", "C": ":", "D": "#" },
      "answer": "B"
    },
    {
      "id": 27,
      "difficulty": "easy",
      "category": "Aptitude",
      "question": "A product is bought for ₹56 and sold for ₹78. What is the profit?",
      "options": { "A": "₹20", "B": "₹22", "C": "₹24", "D": "₹27" },
      "answer": "B"
    },
    {
      "id": 28,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 29,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 30,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 1, 2, 4, 8, ?",
      "options": { "A": "10", "B": "16", "C": "16", "D": "24" },
      "answer": "B"
    },
    {
      "id": 31,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 3, 6, 12, 24, ?",
      "options": { "A": "26", "B": "48", "C": "32", "D": "40" },
      "answer": "B"
    },
    {
      "id": 32,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 15 + 1?",
      "options": { "A": "14", "B": "16", "C": "19", "D": "21" },
      "answer": "B"
    },
    {
      "id": 33,
      "difficulty": "easy",
      "category": "Logical Thinking",
      "question": "Find the next number: 2, 4, 6, 8, ?",
      "options": { "A": "9", "B": "10", "C": "12", "D": "14" },
      "answer": "B"
    },
    {
      "id": 34,
      "difficulty": "easy",
      "category": "Pattern Recognition",
      "question": "Find the next number: 4, 8, 16, 32, ?",
      "options": { "A": "34", "B": "64", "C": "40", "D": "48" },
      "answer": "B"
    },
    {
      "id": 35,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 280 km in 5 hours. What is the average speed?",
      "options": { "A": "46 km/h", "B": "56 km/h", "C": "66 km/h", "D": "76 km/h" },
      "answer": "B"
    },
    {
      "id": 36,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 37,
      "difficulty": "easy",
      "category": "Technology",
      "question": "What does CPU stand for?",
      "options": { "A": "Central Processing Unit", "B": "Computer Power Unit", "C": "Central Program Utility", "D": "Core Processing Utility" },
      "answer": "A"
    },
    {
      "id": 38,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 304 km in 4 hours. What is the average speed?",
      "options": { "A": "66 km/h", "B": "76 km/h", "C": "86 km/h", "D": "96 km/h" },
      "answer": "B"
    },
    {
      "id": 39,
      "difficulty": "easy",
      "category": "Technology",
      "question": "What does CPU stand for?",
      "options": { "A": "Central Processing Unit", "B": "Computer Power Unit", "C": "Central Program Utility", "D": "Core Processing Utility" },
      "answer": "A"
    },
    {
      "id": 40,
      "difficulty": "easy",
      "category": "Basic Coding",
      "question": "Which symbol is used to end a statement in C language?",
      "options": { "A": ".", "B": ";", "C": ":", "D": "#" },
      "answer": "B"
    },
    {
      "id": 41,
      "difficulty": "easy",
      "category": "Basic Coding",
      "question": "Which symbol is used to end a statement in C language?",
      "options": { "A": ".", "B": ";", "C": ":", "D": "#" },
      "answer": "B"
    },
    {
      "id": 42,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 43,
      "difficulty": "easy",
      "category": "Aptitude",
      "question": "A product is bought for ₹23 and sold for ₹36. What is the profit?",
      "options": { "A": "₹11", "B": "₹13", "C": "₹15", "D": "₹18" },
      "answer": "B"
    },
    {
      "id": 44,
      "difficulty": "easy",
      "category": "Analytical Skills",
      "question": "A car travels 224 km in 4 hours. What is the average speed?",
      "options": { "A": "46 km/h", "B": "56 km/h", "C": "66 km/h", "D": "76 km/h" },
      "answer": "B"
    },
    {
      "id": 45,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 40 + 39?",
      "options": { "A": "77", "B": "79", "C": "82", "D": "84" },
      "answer": "B"
    },
    {
      "id": 46,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 47,
      "difficulty": "easy",
      "category": "Critical Thinking",
      "question": "If all engineers are graduates and Ravi is an engineer, then Ravi is:",
      "options": { "A": "Not a graduate", "B": "A graduate", "C": "A doctor", "D": "None" },
      "answer": "B"
    },
    {
      "id": 48,
      "difficulty": "easy",
      "category": "Technology",
      "question": "What does CPU stand for?",
      "options": { "A": "Central Processing Unit", "B": "Computer Power Unit", "C": "Central Program Utility", "D": "Core Processing Utility" },
      "answer": "A"
    },
    {
      "id": 49,
      "difficulty": "easy",
      "category": "Verbal Communication",
      "question": "Choose the synonym of 'Rapid'.",
      "options": { "A": "Slow", "B": "Fast", "C": "Weak", "D": "Late" },
      "answer": "B"
    },
    {
      "id": 50,
      "difficulty": "easy",
      "category": "Basic Maths",
      "question": "What is 24 + 13?",
      "options": { "A": "35", "B": "37", "C": "40", "D": "42" },
      "answer": "B"
    }
];

// Map 51 to 300 with similar logic to fill the gap
for (let i = 51; i <= 300; i++) {
  const base = newQuestionsRaw[i % 50];
  newQuestionsRaw.push({
    ...base,
    id: i,
  });
}

const transform = (q) => {
  const optionsArray = Object.values(q.options);
  const correctAnswerValue = q.options[q.answer];
  return {
    id: "NEW_" + q.id.toString().padStart(3, '0'),
    category: q.category.toUpperCase(),
    difficulty: q.difficulty.toUpperCase(),
    type: "MCQ",
    question: q.question,
    cipherText: q.question,
    hint: `Analyze the ${q.category.toLowerCase()} signal and identify the ${q.difficulty} solution.`,
    answer: correctAnswerValue,
    tokenReward: 3,
    options: optionsArray
  };
};

const transformedNew = newQuestionsRaw.slice(0, 300).map(transform);

const finalPuzzles = [...existing400, ...transformedNew];

fs.writeFileSync('final_puzzles.json', JSON.stringify(finalPuzzles, null, 2));
