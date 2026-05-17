import { puzzles } from '../data/puzzles.js';
import fs from 'fs';

const updatedPuzzles = puzzles.map(p => {
    const cleanAnswer = p.answer.toLowerCase().trim();
    const cleanHint = p.hint.toLowerCase().trim();
    
    // If hint is exactly the answer or contains the answer too clearly
    if (cleanHint.includes(cleanAnswer) || cleanAnswer.includes(cleanHint)) {
        if (p.category === 'APTITUDE') {
            return { ...p, hint: "Review the numerical pattern or basic arithmetic rules." };
        } else if (['C', 'PYTHON'].includes(p.category)) {
            return { ...p, hint: "Check the language documentation for this specific keyword or syntax." };
        } else {
            return { ...p, hint: "Examine the technical definition of the term." };
        }
    }
    return p;
});

const fileContent = `export const normalize = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/\\s+/g, '');
};

export const puzzles = ${JSON.stringify(updatedPuzzles, null, 2)};
`;

fs.writeFileSync('./server/data/puzzles.js', fileContent);
console.log("Puzzles updated successfully.");
