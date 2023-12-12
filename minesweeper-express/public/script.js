let numMines;
const gameGrid = document.getElementById('game-grid');
const newGameBtn = document.getElementById('new-game');
const hintButton = document.getElementById('hint-button');
const loginButton = document.getElementById('login-button');
const btnTestEndgame = document.getElementById("testEndGame");

const openLoginModalBtn = document.getElementById('openLoginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModal');
const loginModal = document.getElementById('loginModal');
const submitLoginBtn = document.getElementById('submitLogin');
const createProfileLink = document.getElementById('createProfileLink');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

let gameEnded = false;
let isLoggedIn = false;
let timerInterval; // Variable to store the timer interval
let timeElapsed = 0; // Variable to store the elapsed time in seconds
const gridSize = 25;
let numberOfHints = 3; // Add this variable for hint counter

document.addEventListener('DOMContentLoaded', function () {

  promptLogin();
  fetchLeaderboards();

  // Function to remove the existing grid
  function removeGrid() {
    while (gameGrid.firstChild) {
      gameGrid.removeChild(gameGrid.firstChild);
    }
  }
  // Function to create a modal dialog with level buttons
  function createLevelModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const easyBtn = document.createElement('button');
    easyBtn.textContent = 'Easy';
    easyBtn.addEventListener('click', function () {
      startGame('easy');
      modal.style.display = 'none';
      newGameBtn.style.display = 'block'; // Display the "New Game" button
    });
    const mediumBtn = document.createElement('button');
    mediumBtn.textContent = 'Medium';
    mediumBtn.addEventListener('click', function () {
      startGame('medium');
      modal.style.display = 'none';
      newGameBtn.style.display = 'block'; // Display the "New Game" button
    });
    const hardBtn = document.createElement('button');
    hardBtn.textContent = 'Hard';
    hardBtn.addEventListener('click', function () {
      startGame('hard');
      modal.style.display = 'none';
      newGameBtn.style.display = 'block'; // Display the "New Game" button
    });
    modal.appendChild(easyBtn);
    modal.appendChild(mediumBtn);
    modal.appendChild(hardBtn);
    return modal;
  }
  // Function to display the level modal
  function displayLevelModal() {
    const modal = createLevelModal();
    document.body.appendChild(modal);
    newGameBtn.style.display = 'none'; // Hide the "New Game" button
  }
  // Function to remove the modal
  function removeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  }

  function startGame(level) {
    removeModal(); // Remove the level selection modal
    removeGrid(); // Remove the existing grid
    timeElapsed = 0; // Reset the elapsed time when starting a new game
    updateTimerDisplay(); // Update the timer display
    startTimer(); // Start the timer

    switch (level) {
      case 'easy':
        numMines = 50;
        break;
      case 'medium':
        numMines = 75;
        break;
      case 'hard':
        numMines = 100;
        break;
      default:
        numMines = 25;
    }
    generateGrid();
    placeMines(numMines);
  }

  createProfileLink.addEventListener('click', (event) => {
    event.preventDefault();
    const username = prompt('Enter your desired username:');
    if (isValidUsername(username)) {
      const password = prompt('Enter your password:');
      registerUser(username, password);
    } else {
      alert('Invalid username. Please enter a valid username.');
    }
  });

  // Add a click event listener to the "New Game" button
  newGameBtn.addEventListener('click', function () {
    newGameBtn.style.display = 'none';
    displayLevelModal();
  });

  hintButton.addEventListener('click', useHint);
  btnTestEndgame.addEventListener('click', function () {
    testEndGame();
  });
  loginButton.addEventListener('click', performLogin);

  function promptLogin() {
    usernameInput.value = '';
    passwordInput.value = '';
    loginModal.style.display = 'block';
  
    submitLoginBtn.addEventListener('click', async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;
  
      // Basic validation, you should perform more thorough validation on the server
      if (!username || !password) {
        window.alert('Please enter both username and password.');
        return;
      }
  
      try {
        // Assuming a server-side endpoint for login, replace with your actual API endpoint
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });
  
        if (response.ok) {
          // Successful login
          isLoggedIn = true;
          loginModal.style.display = 'none';
          removeModal();
          displayLevelModal();
        } else {
          // Failed login
          window.alert('Invalid username or password. Please try again.');
          // Optionally, clear the password field
          passwordInput.value = '';
        }
      } catch (error) {
        console.error('Error during login:', error);
        window.alert('An error occurred during login. Please try again.');
      }
    });
  }

  async function performLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;
  
    // Check if the username is valid
    if (!isValidUsername(username)) {
      alert('Invalid username. Please enter a valid username.');
      return;
    }
  
    // Perform login
    await loginUser(username, password);
    
    if (isLoggedIn) {
      loginModal.style.display = 'none';
      removeModal();
      displayLevelModal();
    } else {
      // Reprompt the user for credentials if desired
      // This can be implemented based on your specific requirements
      // Currently, it does nothing and closes the modal
      loginModal.style.display = 'none';
    }
  }

  function generateGrid()
  {
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
              const flagImageURL = 'https://static.vecteezy.com/system/resources/previews/010/966/261/original/red-flag-cartoon-free-vector.jpg';
              cell.style.backgroundImage = `url(${flagImageURL})`; // Change image to flag when flagged
              cell.style.backgroundSize = 'cover';
              if (cell.classList.contains('adjacent')) {
                const mineCountTag = cell.querySelector('.mine-count');
                mineCountTag.style.color = '#c12028'; // Change text color to red when flagged
              }
            } else {
              cell.style.backgroundColor = ''; // Reset background color when unflagged
              cell.style.color = '';
              cell.style.backgroundImage = '';  // Reset background iamge when unflagged
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
  }
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
  function startTimer() {
    // Start the timer interval
    timerInterval = setInterval(function () {
      timeElapsed++;
      updateTimerDisplay();
    }, 1000); // Update every 1000 milliseconds (1 second)
  }

  function stopTimer() {
    // Stop the timer interval
    clearInterval(timerInterval);
  }

  function updateTimerDisplay() {
    // Display the elapsed time in seconds
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `Time: ${timeElapsed}s`;
  }

  function testEndGame() {
    const win = confirm('Simulate a win?'); // Ask the user if they want to simulate a win
    endGame(win);
  }

  function endGame(win) {
    gameEnded = true;
    stopTimer();
  
    if (!win) {
      revealMines();
      setTimeout(function () {
        alert('Game over! Play again?');
        location.reload();
      }, 500);
    } else {
      setTimeout(async function () {
        let validUsername = false;
  
        while (!validUsername) {
          const addEntry = window.confirm('Congratulations! You won! Add Score to Leaderboard?');
  
          if (addEntry) {
            const username = prompt('Enter your username:');
            const difficulty = getDifficulty(); // Add this line
            if (username && isValidUsername(username)) {
              await addLeaderboardEntry(username, difficulty);
              validUsername = true;
            } else {
              alert('Invalid username. Please enter a valid username.');
            }
          } else {
            validUsername = true;
          }
        }
  
        location.reload();
      }, 500);
    }
  }
  
  async function addLeaderboardEntry(username, difficulty) {
    const response = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        currentDate: new Date(),
        elapsedTime: timeElapsed,
        difficulty: difficulty,
      }),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    alert('Score added to leaderboard successfully!');
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
  function revealMines() {
    const cells = gameGrid.getElementsByTagName('td');
    const bombImageURL = 'https://png.pngtree.com/png-vector/20191113/ourmid/pngtree-retro-bomb-icon-cartoon-style-png-image_1965877.jpg';
  
    for (let cell of cells) {
      if (cell.classList.contains('mine')) {
        cell.style.backgroundImage = `url(${bombImageURL})`;
        cell.style.backgroundSize = 'cover';
        cell.innerHTML = ''; // Clear any mine count tags
      }
    }
  }
  function useHint() {
    if (!gameEnded) {
      const unrevealedCells = getUnrevealedNonMineCells();
      if (unrevealedCells.length > 0) {
        // Pick a random unrevealed non-mine cell
        const randomIndex = Math.floor(Math.random() * unrevealedCells.length);
        const randomCell = unrevealedCells[randomIndex];
        // Reveal the selected cell
        revealCell(randomCell);
      } else {
        // Handle the case when there are no unrevealed non-mine cells
        window.alert('No unrevealed non-mine cells left.');
      }
    }
  }
  // Function to get all unrevealed non-mine cells
  function getUnrevealedNonMineCells() {
    const cells = gameGrid.getElementsByTagName('td');
    const unrevealedNonMineCells = [];
    for (let cell of cells) {
      if (!cell.classList.contains('revealed') && !cell.classList.contains('mine')) {
        unrevealedNonMineCells.push(cell);
      }
    }
    return unrevealedNonMineCells;
  }
  function useHint() {
    if (!gameEnded && numberOfHints > 0) {
      const unrevealedCells = getUnrevealedNonMineCells();
      if (unrevealedCells.length > 0) {
        // Pick a random unrevealed non-mine cell
        const randomIndex = Math.floor(Math.random() * unrevealedCells.length);
        const randomCell = unrevealedCells[randomIndex];
        // Reveal the selected cell
        revealCell(randomCell);
        // Decrement the hint counter
        numberOfHints--;
        // Update the hint counter display
        updateHintCounter();
        // Check if the user has used all hints
        if (numberOfHints === 0) {
          hintButton.disabled = true; // Disable the hint button
        }
      } else {
        // Handle the case when there are no unrevealed non-mine cells
        window.alert('No unrevealed non-mine cells left.');
      }
    }
  }
  // Function to update the hint counter display
  function updateHintCounter() {
    const hintCounter = document.getElementById('hint-counter');
    hintCounter.textContent = `Hints: ${numberOfHints}`;
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

function isValidUsername(username) {
  // Check if the username is less than 15 characters
  if (username.length > 14) {
    return false;
  }

  // Check if the username contains only alphanumeric characters and underscores
  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  return validUsernameRegex.test(username);
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

async function fetchLeaderboards() {
  await fetchLeaderboard('easy', 'easy-leaderboard-body');
  await fetchLeaderboard('medium', 'medium-leaderboard-body');
  await fetchLeaderboard('hard', 'hard-leaderboard-body');
}

async function fetchLeaderboard(difficulty, tableBodyId) {
  try {
    const response = await fetch(`/api/leaderboard?difficulty=${difficulty}`);
    const data = await response.json();

    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = '';

    data.forEach((entry, index) => {
      const row = tableBody.insertRow();
      const rankCell = row.insertCell(0);
      const usernameCell = row.insertCell(1);
      const dateCell = row.insertCell(2);
      const timeCell = row.insertCell(3);

      rankCell.textContent = index + 1;
      usernameCell.textContent = entry.username;
      dateCell.textContent = new Date(entry.currentDate).toLocaleDateString();
      timeCell.textContent = entry.elapsedTime;
    });
  } catch (error) {
    console.error(`Error fetching ${difficulty} leaderboard:`, error);
  }
}

async function registerUser(username, password) {
  try {
    const response = await fetch('/api/user-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        sessionID: 'someUniqueSessionID', // You may want to generate a unique session ID
      }),
    });

    if (response.ok) {
      alert('Registration successful!');
    } else {
      const errorMessage = await response.text();
      alert(`Registration failed: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('Registration failed: Internal Server Error');
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch('/api/user-profile?username=' + encodeURIComponent(username));

    if (response.ok) {
      const result = await response.text();
      if (result === 'User found') {
        // Perform login actions, e.g., show the game grid
        isLoggedIn = true;
        alert('Login successful!');
      } else {
        alert('Login failed: User not found');
      }
    } else {
      alert('Login failed: Internal Server Error');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed: Internal Server Error');
  }
}