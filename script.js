document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const generateBtn = document.getElementById('generate-btn');
    const validateBtn = document.getElementById('validate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusElement = document.getElementById('status');
    const difficultySelect = document.getElementById('difficulty');

    const cells = [];
    let currentPuzzle = null;
    let currentSolution = null;

    function createGrid() {
        gridElement.innerHTML = '';
        cells.length = 0;
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.classList.add('cell');
            cell.maxLength = 1;
            
            const row = Math.floor(i / 9);
            const col = i % 9;

            if (col === 2 || col === 5) cell.classList.add('border-right');
            if (row === 2 || row === 5) cell.classList.add('border-bottom');

            cell.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^1-9]/g, '');
                e.target.classList.remove('incorrect', 'correct');
                statusElement.textContent = '';
            });

            gridElement.appendChild(cell);
            cells.push(cell);
        }
    }
    
    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
            if (board[i][col] === num) return false;
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + i % 3;
            if (board[boxRow][boxCol] === num) return false;
        }
        return true;
    }

    function solveBoard(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveBoard(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function generatePuzzle() {
        clearBoard();
        const fullBoard = Array(9).fill(0).map(() => Array(9).fill(0));
        solveBoard(fullBoard);
        currentSolution = JSON.parse(JSON.stringify(fullBoard));
        currentPuzzle = JSON.parse(JSON.stringify(fullBoard));

        const holes = parseInt(difficultySelect.value);
        let attempts = holes;
        while (attempts > 0 && attempts < 81) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (currentPuzzle[row][col] !== 0) {
                currentPuzzle[row][col] = 0;
                attempts--;
            }
        }
        updateUI(currentPuzzle);
        // *** THE FIX IS HERE ***
        // This now enables all buttons correctly after a puzzle is generated.
        setControlsDisabled(false); 
        setStatus(`New puzzle generated (${difficultySelect.options[difficultySelect.selectedIndex].text})!`, false);
    }
    
    function updateUI(board) {
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = board[row][col];
            cell.classList.remove('given-number', 'solved-number', 'incorrect', 'correct');
            if (value !== 0) {
                cell.value = value;
                cell.classList.add('given-number');
                cell.readOnly = true;
            } else {
                cell.value = '';
                cell.readOnly = false;
            }
        });
    }
    
    function showAnswer() {
        if (!currentSolution) return;
        setControlsDisabled(true);
        setStatus('Here is the solution!', false);
        cells.forEach((cell, i) => {
            if (!cell.classList.contains('given-number')) {
                setTimeout(() => {
                    const row = Math.floor(i / 9);
                    const col = i % 9;
                    cell.value = currentSolution[row][col];
                    cell.classList.add('solved-number');
                }, i * 10);
            }
        });
        setTimeout(() => setControlsDisabled(false), cells.length * 10 + 500);
    }
    
    function validateSolution() {
        if (!currentSolution) return;
        let isCorrect = true, isComplete = true;
        cells.forEach((cell, index) => {
            cell.classList.remove('incorrect', 'correct');
            if (cell.readOnly) return;
            const row = Math.floor(index / 9), col = index % 9;
            const userValue = parseInt(cell.value) || 0;
            if (userValue === 0) { isComplete = false; return; }
            if (userValue === currentSolution[row][col]) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('incorrect');
                isCorrect = false;
            }
        });
        if (!isComplete) setStatus('The puzzle is not complete yet.', true);
        else if (isCorrect) setStatus('Congratulations! You solved it!', false);
        else setStatus('There are some errors. Check the red cells.', true);
    }

    function clearBoard() {
        cells.forEach(cell => {
            cell.value = '';
            cell.readOnly = false;
            cell.classList.remove('given-number', 'solved-number', 'incorrect', 'correct');
        });
        currentPuzzle = null;
        currentSolution = null;
        setControlsDisabled(false, true); // Reset to initial state
        setStatus('');
    }

    function setStatus(message, isError = false) {
        statusElement.textContent = message;
        statusElement.className = isError ? 'status-error' : 'status-success';
    }

    function setControlsDisabled(disabled, isInitial = false) {
        generateBtn.disabled = disabled;
        clearBtn.disabled = disabled;
        difficultySelect.disabled = disabled;
        // Only disable these if it's the initial state
        validateBtn.disabled = isInitial ? true : disabled;
        solveBtn.disabled = isInitial ? true : disabled;
    }

    // --- Initial Setup ---
    createGrid();
    setControlsDisabled(false, true);
    generateBtn.addEventListener('click', generatePuzzle);
    validateBtn.addEventListener('click', validateSolution);
    solveBtn.addEventListener('click', showAnswer);
    clearBtn.addEventListener('click', clearBoard);
});