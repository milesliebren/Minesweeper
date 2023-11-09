document.addEventListener('DOMContentLoaded', function () {
  const gridSize = 25;
  const gameGrid = document.getElementById('game-grid');
  const numMines = 10;
  let gameEnded = false;

  // Generate the table grid
  for (let i = 0; i < gridSize; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('td');
      row.appendChild(cell);
      cell.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // Prevent the default context menu
        if (!gameEnded) {
          cell.classList.toggle('flagged');
          if (cell.classList.contains('flagged')) {
            cell.style.backgroundColor = 'red'; // Change background color to red when flagged
            if (cell.classList.contains('adjacent')) {
              const mineCountTag = cell.querySelector('.mine-count');
              mineCountTag.style.color = 'red'; // Change text color to red when flagged
            }
          } else {
            cell.style.backgroundColor = ''; // Reset background color when unflagged
            if (cell.classList.contains('adjacent')) {
              const mineCountTag = cell.querySelector('.mine-count');
              mineCountTag.style.color = ''; // Reset text color when unflagged
            }
          }
          checkWinCondition(); // Check the win condition after each flag operation
        }
      });

      cell.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default behavior (for cells with context menu)
        if (!gameEnded) {
          if (cell.classList.contains('mine')) {
            endGame(false);
            revealMines();
          } else if (!cell.classList.contains('revealed')) {
            revealCell(cell);
          }
        }
      });
    }
    gameGrid.appendChild(row);
  }

  placeMines(numMines);

  function revealCell(cell) {
    if (!cell.classList.contains('revealed') && !cell.classList.contains('flagged')) {
      cell.classList.add('revealed');
  
      if (cell.classList.contains('adjacent')) {
        const mineCountTag = cell.querySelector('.mine-count');
        mineCountTag.classList.add('revealed');
      } else {
        revealAdjacentEmptyCells(cell);
      }
    }
  }
  
  function revealAdjacentEmptyCells(cell) {
    const queue = [];
    queue.push(cell);
  
    while (queue.length > 0) {
      const currentCell = queue.shift();
      const row = currentCell.parentElement.rowIndex;
      const col = currentCell.cellIndex;
  
      const directions = [-1, 0, 1];
  
      for (let i of directions) {
        for (let j of directions) {
          if (i === 0 && j === 0) {
            continue;  // Skip the cell itself
          }
  
          const adjacentRow = row + i;
          const adjacentCol = col + j;
  
          if (
            adjacentRow >= 0 &&
            adjacentRow < gridSize &&
            adjacentCol >= 0 &&
            adjacentCol < gridSize
          ) {
            const adjacentCell = gameGrid.rows[adjacentRow].cells[adjacentCol];
  
            if (!adjacentCell.classList.contains('revealed') && !adjacentCell.classList.contains('mine')) {
              revealCell(adjacentCell); // Recursively reveal adjacent empty cells
              if (adjacentCell.classList.contains('empty')) {
                queue.push(adjacentCell); // Add adjacent empty cells to the queue
              }
            }
          }
        }
      }
    }
  }
  
  function endGame(win) {
    gameEnded = true;
    if (!win) {
      revealMines();
      setTimeout(function () {
        window.alert('Game over! Play again?');
        // Restart the game
        location.reload();
      }, 500); // Adjust the delay as needed (500 milliseconds in this example)
    } else {
      setTimeout(function () {
        window.alert('Congratulations! You won! Play again?');
        // Restart the game
        location.reload();
      }, 500); // Adjust the delay as needed (500 milliseconds in this example)
    }
  }
  
  function checkWinCondition() {
    const cells = gameGrid.getElementsByTagName('td');
    let correctlyFlaggedMines = 0;
    let revealedCells = 0;
  
    for (let cell of cells) {
      if (cell.classList.contains('revealed')) {
        revealedCells++;
      }
  
      if (cell.classList.contains('mine') && cell.classList.contains('flagged')) {
        correctlyFlaggedMines++;
      }
    }
  
    if (correctlyFlaggedMines === numMines && revealedCells === ((gridSize * gridSize) - numMines)) {
      endGame(true);
    }
  }
  This 

  function revealMines() {
    const cells = gameGrid.getElementsByTagName('td');
    for (let cell of cells) {
      if (cell.classList.contains('mine')) {
        cell.style.backgroundColor = 'black';
      }
    }
  }

});

function placeMines(numberOfMines) {
  const gameGrid = document.getElementById('game-grid');
  const cells = gameGrid.getElementsByTagName('td');
  const totalCells = cells.length;

  if (numberOfMines > totalCells) {
    console.error('The number of mines exceeds the grid size.');
    return;
  }

  // Create an array of indices representing cell positions
  const cellIndices = [...Array(totalCells).keys()];

  // Shuffle the cell indices randomly
  for (let i = totalCells - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
  }

  // Place mines by changing the class of the cell to 'mine'
  const mineIndices = cellIndices.slice(0, numberOfMines);
  mineIndices.forEach((cellIndex) => {
    cells[cellIndex].classList.add('mine');
  });

  // Mark adjacent cells
  for (let i = 0; i < totalCells; i++) {
    markAdjacentCells(i, cells);
  }
}

function markAdjacentCells(cellIndex, cells) {
  const gameGrid = document.getElementById('game-grid');
  const numRows = Math.sqrt(cells.length);
  const row = Math.floor(cellIndex / numRows);
  const col = cellIndex % numRows;

  let mineCount = 0; // Initialize the mine count to 0

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const adjacentRow = row + i;
      const adjacentCol = col + j;
      if (adjacentRow >= 0 && adjacentRow < numRows && adjacentCol >= 0 && adjacentCol < numRows) {
        const adjacentIndex = adjacentRow * numRows + adjacentCol;
        if (cellIndex !== adjacentIndex && cells[adjacentIndex].classList.contains('mine')) {
          mineCount++;
        }
      }
    }
  }

  if (mineCount > 0 && !cells[cellIndex].classList.contains('mine')) {
    // Add the "adjacent" class to the cell
    cells[cellIndex].classList.add('adjacent');
    // Create a tag with the mine count and add it as a child element
    const mineCountTag = document.createElement('span');
    mineCountTag.classList.add('mine-count');
    mineCountTag.textContent = mineCount;
    cells[cellIndex].appendChild(mineCountTag);
  }
}