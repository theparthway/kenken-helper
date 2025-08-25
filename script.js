// Storage for saved combinations
let savedCombinations = {
    add: [],
    subtract: [],
    multiply: [],
    divide: []
};

function generatePermutations(arr, length, allowRepeats) {
    if (length === 1) {
        return arr.map(x => [x]);
    }
    
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        let remaining = allowRepeats ? arr : arr.filter((_, index) => index !== i);
        let perms = generatePermutations(remaining, length - 1, allowRepeats);
        perms.forEach(perm => result.push([arr[i], ...perm]));
    }
    return result;
}

function calculateCombinations(operation) {
    const goal = parseInt(document.getElementById(`${operation}-goal`).value);
    const numDigits = parseInt(document.getElementById(`${operation}-digits`).value);
    const allowRepeats = document.getElementById(`${operation}-repeat`).checked;
    
    if (!goal || numDigits < 2) {
        alert('Please enter valid goal number and number of digits');
        return;
    }

    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const permutations = generatePermutations(digits, numDigits, allowRepeats);
    const validCombinations = [];
    const seenSorted = new Set(); // Track sorted combinations to avoid duplicates

    permutations.forEach(perm => {
        let result;
        let isValid = false;
        
        switch (operation) {
            case 'add':
            case 'multiply':
                // For addition and multiplication, order doesn't matter
                if (operation === 'add') {
                    result = perm.reduce((sum, digit) => sum + digit, 0);
                } else {
                    result = perm.reduce((product, digit) => product * digit, 1);
                }
                
                if (result === goal) {
                    const sortedKey = [...perm].sort((a, b) => a - b).join(',');
                    if (!seenSorted.has(sortedKey)) {
                        seenSorted.add(sortedKey);
                        validCombinations.push([...perm].sort((a, b) => a - b));
                    }
                }
                break;
                
            case 'subtract':
                // For subtraction, we need to check all possible arrangements
                // since order matters, but we want unique sets of digits
                const sortedKey = [...perm].sort((a, b) => a - b).join(',');
                if (!seenSorted.has(sortedKey)) {
                    // Check if any arrangement of these digits gives the goal
                    const arrangements = generatePermutations(perm, numDigits, true);
                    let foundValid = false;
                    
                    for (let arrangement of arrangements) {
                        const testResult = arrangement.reduce((diff, digit, index) => 
                            index === 0 ? digit : diff - digit);
                        if (testResult === goal) {
                            foundValid = true;
                            break;
                        }
                    }
                    
                    if (foundValid) {
                        seenSorted.add(sortedKey);
                        validCombinations.push([...perm].sort((a, b) => a - b));
                    }
                }
                break;
                
            case 'divide':
                // For division, we need to check all possible arrangements
                // since order matters, but we want unique sets of digits
                const sortedKeyDiv = [...perm].sort((a, b) => a - b).join(',');
                if (!seenSorted.has(sortedKeyDiv)) {
                    // Check if any arrangement of these digits gives the goal
                    const arrangements = generatePermutations(perm, numDigits, true);
                    let foundValid = false;
                    
                    for (let arrangement of arrangements) {
                        if (arrangement.slice(1).every(digit => digit !== 0)) { // Avoid division by zero
                            const testResult = arrangement.reduce((quotient, digit, index) => 
                                index === 0 ? digit : quotient / digit);
                            if (Math.abs(testResult - goal) < 0.0001) { // Handle floating point precision
                                foundValid = true;
                                break;
                            }
                        }
                    }
                    
                    if (foundValid) {
                        seenSorted.add(sortedKeyDiv);
                        validCombinations.push([...perm].sort((a, b) => a - b));
                    }
                }
                break;
        }
    });

    displayResults(operation, validCombinations, goal);
}

function displayResults(operation, combinations, goal) {
    const resultsDiv = document.getElementById(`${operation}-results`);
    
    if (combinations.length === 0) {
        resultsDiv.innerHTML = '<div class="text-center text-gray-500 italic py-5">No valid combinations found</div>';
        return;
    }

    let html = `<h3 class="font-semibold text-gray-700 mb-3">Found ${combinations.length} combination(s) for ${goal}:</h3>`;
    combinations.forEach((combo, index) => {
        html += `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 flex justify-between items-center">
                <span class="font-mono font-bold text-lg text-gray-800">[${combo.join(', ')}]</span>
                <button class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm" onclick="saveCombination('${operation}', [${combo.join(',')}], ${goal})">
                    Save
                </button>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

function saveCombination(operation, combination, goal) {
    const saveData = { combination, goal, timestamp: new Date().toLocaleString() };
    
    // Check if already saved
    if (savedCombinations[operation].some(saved => 
        saved.combination.join(',') === combination.join(',') && saved.goal === goal)) {
        alert('This combination is already saved!');
        return;
    }
    
    savedCombinations[operation].push(saveData);
    updateSavedDisplay(operation);
}

function deleteSavedCombination(operation, index) {
    savedCombinations[operation].splice(index, 1);
    updateSavedDisplay(operation);
}

function updateSavedDisplay(operation) {
    const savedDiv = document.getElementById(`${operation}-saved`);
    
    if (savedCombinations[operation].length === 0) {
        savedDiv.innerHTML = '<div class="text-center text-gray-500 italic py-5">No saved combinations</div>';
        return;
    }

    let html = '';
    savedCombinations[operation].forEach((saved, index) => {
        html += `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 flex justify-between items-center">
                <div>
                    <span class="font-mono font-bold text-lg text-gray-800">[${saved.combination.join(', ')}] = ${saved.goal}</span>
                    <br><small class="text-gray-600">Saved: ${saved.timestamp}</small>
                </div>
                <button class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm" onclick="deleteSavedCombination('${operation}', ${index})">
                    Delete
                </button>
            </div>
        `;
    });
    
    savedDiv.innerHTML = html;
}

// Initialize saved displays
window.onload = function() {
    ['add', 'subtract', 'multiply', 'divide'].forEach(op => {
        updateSavedDisplay(op);
    });
};