let board = Array.from({ length: 9 }, () => Array(9).fill(0));

document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
});

function initializeGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('td');
            cell.id = `cell-${i}-${j}`;
            if (board[i][j] !== 0) {
                cell.innerText = board[i][j];
                cell.contentEditable = false;
                cell.style.backgroundColor = '#f0f0f0'; // Different color for prewritten cells
            } else {
                cell.contentEditable = true;
                cell.addEventListener('input', () => validateInput(cell, i, j));
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function isValid(board, num, pos) {
    const [row, col] = pos;

    // Check row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num && col !== i) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num && row !== i) return false;
    }

    // Check box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
            if (board[i][j] === num && (i !== row || j !== col)) return false;
        }
    }

    return true;
}

function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

async function solve(board) {
    const find = findEmpty(board);
    if (!find) return true;

    const [row, col] = find;

    for (let i = 1; i <= 9; i++) {
        if (isValid(board, i, [row, col])) {
            board[row][col] = i;
            updateGrid(row, col, i, 'solve');
            await new Promise(resolve => setTimeout(resolve, 50)); // Faster delay for visualization

            if (await solve(board)) return true;

            board[row][col] = 0;
            updateGrid(row, col, 0, 'backtrack');
            await new Promise(resolve => setTimeout(resolve, 50)); // Faster delay for visualization
        }
    }

    return false;
}

function updateGrid(row, col, num, action) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    cell.innerText = num === 0 ? '' : num;
    cell.style.backgroundColor = action === 'solve' ? '#90EE90' : (action === 'backtrack' ? '#FFCCCB' : 'white');
}

async function startVisualization() {
    const userBoard = getUserBoard();
    const valid = validateBoard(userBoard);
    if (!valid) {
        document.getElementById('message').innerText = 'Invalid board. Please correct the inputs.';
        return;
    }
    document.getElementById('message').innerText = '';
    await solve(userBoard);
}

function generateRandom() {
    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(board);
    removeRandomCells(board, 40); // Removing 40 cells for the puzzle
    initializeGrid();
}

function fillBoard(board) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const shuffled = nums.sort(() => Math.random() - 0.5);
            for (let num of shuffled) {
                if (isValid(board, num, [row, col])) {
                    board[row][col] = num;
                    break;
                }
            }
        }
    }
}

function removeRandomCells(board, count) {
    let removed = 0;
    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
}

function getUserBoard() {
    const userBoard = [];
    for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            const value = parseInt(cell.innerText);
            row.push(isNaN(value) ? 0 : value);
        }
        userBoard.push(row);
    }
    return userBoard;
}

function validateInput(cell, row, col) {
    const value = parseInt(cell.innerText);
    if (isNaN(value) || value < 1 || value > 9) {
        cell.style.backgroundColor = '#FFCCCB'; // Invalid input
    } else if (!isValid(board, value, [row, col])) {
        cell.style.backgroundColor = '#FFCCCB'; // Invalid placement
    } else {
        cell.style.backgroundColor = 'white'; // Valid input
    }
}

function validateBoard(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 0 && !isValid(board, board[i][j], [i, j])) {
                return false;
            }
        }
    }
    return true;
}

function clearGrid() {
    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    initializeGrid();
}
