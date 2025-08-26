// Storage for saved combinations
let savedCombinations = {
  add: [],
  subtract: [],
  multiply: [],
  divide: []
};

// Generate permutations (with/without repeats)
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

// Read the number of digits from button group
function getDigitsValue(operation) {
  const group = document.getElementById(`${operation}-digits`);
  return parseInt(group.dataset.value || "2"); // default 2 if nothing selected
}

function calculateCombinations(operation) {
  const goal = parseInt(document.getElementById(`${operation}-goal`).value);
  const numDigits = getDigitsValue(operation);
  const allowRepeats = document.getElementById(`${operation}-repeat`).checked;

  if (!goal || numDigits < 2) {
    alert("Please enter valid goal number and number of digits");
    return;
  }

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const permutations = generatePermutations(digits, numDigits, allowRepeats);
  const validCombinations = [];
  const seenSorted = new Set();

  permutations.forEach(perm => {
    let result;
    switch (operation) {
      case "add":
      case "multiply":
        result = operation === "add"
          ? perm.reduce((sum, d) => sum + d, 0)
          : perm.reduce((prod, d) => prod * d, 1);

        if (result === goal) {
          const key = [...perm].sort((a, b) => a - b).join(",");
          if (!seenSorted.has(key)) {
            seenSorted.add(key);
            validCombinations.push([...perm].sort((a, b) => a - b));
          }
        }
        break;

      case "subtract":
        const keySub = [...perm].sort((a, b) => a - b).join(",");
        if (!seenSorted.has(keySub)) {
          const arrangements = generatePermutations(perm, numDigits, true);
          let found = false;
          for (let arr of arrangements) {
            const test = arr.reduce((diff, d, i) => (i === 0 ? d : diff - d));
            if (test === goal) {
              found = true;
              break;
            }
          }
          if (found) {
            seenSorted.add(keySub);
            validCombinations.push([...perm].sort((a, b) => a - b));
          }
        }
        break;

      case "divide":
        const keyDiv = [...perm].sort((a, b) => a - b).join(",");
        if (!seenSorted.has(keyDiv)) {
          const arrangements = generatePermutations(perm, numDigits, true);
          let found = false;
          for (let arr of arrangements) {
            if (arr.slice(1).every(d => d !== 0)) {
              const test = arr.reduce((q, d, i) => (i === 0 ? d : q / d));
              if (Math.abs(test - goal) < 0.0001) {
                found = true;
                break;
              }
            }
          }
          if (found) {
            seenSorted.add(keyDiv);
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
    resultsDiv.innerHTML =
      `<div class="text-center text-gray-400 italic py-2">No combinations</div>`;
    return;
  }
  let html = `<div class="font-bold mb-2">Found ${combinations.length}:</div>`;
  combinations.forEach(combo => {
    html += `
      <div class="border border-gray-600 rounded p-2 mb-2 flex justify-between items-center">
        <span>[${combo.join(", ")}]</span>
        <button class="px-2 py-1 border rounded text-xs hover:bg-light hover:text-black"
                onclick="saveCombination('${operation}', [${combo.join(",")}], ${goal})">
          Save
        </button>
      </div>`;
  });
  resultsDiv.innerHTML = html;
}

function saveCombination(operation, combination, goal) {
  const saveData = { combination, goal, timestamp: new Date().toLocaleString() };
  if (savedCombinations[operation].some(saved =>
    saved.combination.join(",") === combination.join(",") && saved.goal === goal
  )) {
    alert("Already saved!");
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
    savedDiv.innerHTML =
      `<div class="text-center text-gray-400 italic py-2">No saved</div>`;
    return;
  }
  let html = "";
  savedCombinations[operation].forEach((saved, index) => {
    html += `
      <div class="border border-gray-600 rounded p-2 mb-2 flex justify-between items-center">
        <span>[${saved.combination.join(", ")}] = ${saved.goal}</span>
        <button class="px-2 py-1 border rounded text-xs hover:bg-light hover:text-black"
                onclick="deleteSavedCombination('${operation}', ${index})">
          Delete
        </button>
      </div>`;
  });
  savedDiv.innerHTML = html;
}

// Digit button selector (radio-style)
document.querySelectorAll(".digit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.parentElement;
    group.querySelectorAll(".digit-btn").forEach(b =>
      b.classList.remove("bg-light", "text-black")
    );
    btn.classList.add("bg-light", "text-black");
    group.dataset.value = btn.dataset.value;
  });
});

// Initialize empty saved sections
window.onload = () => {
  ["add", "subtract", "multiply", "divide"].forEach(op => updateSavedDisplay(op));
};