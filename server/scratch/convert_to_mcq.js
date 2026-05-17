import { puzzles } from '../data/puzzles.js';
import fs from 'fs';

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Get all possible answers per category to use as distractors for text-based questions
const answersByCategory = {};
puzzles.forEach(p => {
    if (!answersByCategory[p.category]) answersByCategory[p.category] = new Set();
    answersByCategory[p.category].add(p.answer);
});

const mcqPuzzles = puzzles.map(p => {
    const options = [p.answer];
    
    // If it's a number, generate numerical distractors
    if (!isNaN(p.answer) && p.answer.trim() !== "") {
        const val = parseFloat(p.answer);
        const offsets = [-10, 10, -5, 5, 20, -20, 2, -2];
        shuffle(offsets);
        
        let count = 0;
        while (options.length < 4 && count < offsets.length) {
            const dist = (val + offsets[count]).toString();
            if (!options.includes(dist)) options.push(dist);
            count++;
        }
    } 
    
    // Fill up to 4 options with other answers from the same category
    const categoryPool = Array.from(answersByCategory[p.category]).filter(a => a !== p.answer);
    shuffle(categoryPool);
    
    let poolIdx = 0;
    while (options.length < 4 && poolIdx < categoryPool.length) {
        if (!options.includes(categoryPool[poolIdx])) {
            options.push(categoryPool[poolIdx]);
        }
        poolIdx++;
    }
    
    // Fallback distractors if pool is too small
    const fallbacks = ["None of these", "All of these", "Undefined", "Error"];
    let fIdx = 0;
    while (options.length < 4) {
        options.push(fallbacks[fIdx % fallbacks.length]);
        fIdx++;
    }

    return {
        ...p,
        type: "MCQ",
        options: shuffle(options)
    };
});

const fileContent = `export const normalize = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/\\s+/g, '');
};

export const puzzles = ${JSON.stringify(mcqPuzzles, null, 2)};
`;

fs.writeFileSync('./server/data/puzzles.js', fileContent);
console.log("Transformed 500 puzzles to MCQ format.");
