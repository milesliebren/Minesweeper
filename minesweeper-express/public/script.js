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
let loggedInUser = null;
let isLoggedIn = false;
let timerInterval; // Variable to store the timer interval
let timeElapsed = 0; // Variable to store the elapsed time in seconds
const gridSize = 25;
let numberOfHints = 3; // Add this variable for hint counter

document.addEventListener('DOMContentLoaded', function () {

  promptLogin();
  fetchLeaderboards();

  function removeGrid() {
    while (gameGrid.firstChild) {
      gameGrid.removeChild(gameGrid.firstChild);
    }
  }

  // Function to remove the modal
  function removeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  }

  function initializeGridEventListeners() {
    const cells = gameGrid.getElementsByTagName('td');

    for (let cell of cells) {
      cell.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        console.log('Right-clicked on cell');
        if (!gameEnded) {
          cell.classList.toggle('flagged');
          if (cell.classList.contains('flagged')) {
            const flagImageURL = 'https://static.vecteezy.com/system/resources/previews/010/966/261/original/red-flag-cartoon-free-vector.jpg';
            cell.style.backgroundImage = `url(${flagImageURL})`;
            cell.style.backgroundSize = 'cover';
            if (cell.classList.contains('adjacent')) {
              const mineCountTag = cell.querySelector('.mine-count');
              mineCountTag.style.color = '#c12028';
            }
          } else {
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.style.backgroundImage = '';
            if (cell.classList.contains('adjacent')) {
              const mineCountTag = cell.querySelector('.mine-count');
              mineCountTag.style.color = '';
            }
          }
          checkWinCondition();
        }
      });

      cell.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Clicked on cell');
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
    gameEnded = false;
    initializeGridEventListeners();
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

  newGameBtn.addEventListener('click', function () {
    stopTimer();
    if (isLoggedIn) {
      newGameBtn.style.display = 'none';
      gameEnded = false;
      displayLevelModal();
    } else {
      promptLogin();
    }
  });

  loginButton.addEventListener('click', function() {
    if (!isLoggedIn)
    {
      location.reload();
    } else alert("You're already logged in, " + loggedInUser + "!");
  });

  closeLoginModalBtn.addEventListener('click', function () {
    loginModal.style.display = 'none';
    isLoggedIn = false; // Set isLoggedIn to false
    softReload();
  });

  hintButton.addEventListener('click', useHint);

  btnTestEndgame.addEventListener('click', function () {
    testEndGame();
  });

  async function promptLogin() {
    usernameInput.value = '';
    passwordInput.value = '';
    loginModal.style.display = 'block';
  
    const loginHandler = async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;
  
      // Basic validation, you should perform more thorough validation on the server
      if (!username || !password) {
        window.alert('Please enter both username and password.');
        return;
      }
  
      try {
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
  
        console.log('Response:', response); // Add this line for debugging
  
        if (response.ok) {
          // Successful login
          isLoggedIn = true;
          loggedInUser = username;
          loginModal.style.display = 'none';
          //performLogin(username, password);
          softReload();
          alert('Login successful!');
        } else {
          // Failed login
          isLoggedIn = false;
          console.error('Login failed. Response:', response); // Add this line for debugging
          window.alert('Invalid username or password. Please try again.');
          // Optionally, clear the password field
          passwordInput.value = '';
        }
      } catch (error) {
        console.error('Error during login:', error);
        window.alert('An error occurred during login. Please try again.');
      }
    };
  
    // Add the new event listener
    submitLoginBtn.addEventListener('click', loginHandler);
  }

  function generateGrid() {
    for (let i = 0; i < gridSize; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement('td');
        row.appendChild(cell);
      }
      gameGrid.appendChild(row);
    }
  }


  function revealCell(cell) {
    if (!cell.classList.contains('revealed') && !cell.classList.contains('flagged')) {
        cell.classList.add('revealed');
    
        if (cell.classList.contains('adjacent')) {
            const mineCountTag = cell.querySelector('.mine-count');
            mineCountTag.classList.add('revealed'); // Add this line
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

  async function endGame(win) {
    gameEnded = true;
    stopTimer();
  
    if (!win) {
      revealMines();
      setTimeout(function () {
        alert('Game over! Play again?');
        softReload();
      }, 500);
    } else {
      setTimeout(async function () {
        if (isLoggedIn) {
          const addEntry = window.confirm('Congratulations! You won! Add Score to Leaderboard?');
          if (addEntry) {
            try {
              await addLeaderboardEntry();
              await fetchAndDisplayBestTimes();
            } catch (error) {
              console.error(error);
            }
          }
        } else {
          alert('You Win! Play Again?');
        }
        softReload();
      }, 500);
    }
  }

  function softReload() //display level modal without refreshing i.e. logging out
  {
    console.log("Soft Reloading...");
    gameEnded = false;
    removeModal();
    displayLevelModal();
    fetchAndDisplayBestTimes();
  }

  function getDifficulty()
  {
    switch (numMines)
    {
      case 50: return 'easy';
      case 75: return 'medium';
      case 100: return 'hard';
    }
  }
  
  async function addLeaderboardEntry() {
    if (loggedInUser) {
      try {
        const response = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: { username: loggedInUser }, // Send the user object
            currentDate: new Date(),
            elapsedTime: timeElapsed,
            difficulty: getDifficulty(),
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        alert('Score added to leaderboard successfully!');
        console.log('Added leaderboard entry for difficulty ' + difficulty);
      } catch (error) {
        console.error('Error adding leaderboard entry:', error);
        alert('An error occurred while adding the score to the leaderboard.');
      }
      await fetchLeaderboards();
      await fetchAndDisplayBestTimes();
    } else {
      alert('Error: User not logged in');
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

  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  return validUsernameRegex.test(username);
}

function markAdjacentCells(cellIndex, cells) {
  const gameGrid = document.getElementById('game-grid');
  const numRows = Math.sqrt(cells.length);
  const row = Math.floor(cellIndex / numRows);
  const col = cellIndex % numRows;
  let mineCount = 0;
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
      usernameCell.textContent = entry.user.username;
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
    const userProfileResponse = await fetch('/api/user-profile?username=' + encodeURIComponent(username));

    if (userProfileResponse.ok) {
      const userProfile = await userProfileResponse.json(); // Assuming the response is JSON

      if (userProfile && userProfile.userFound) {
        // Perform login actions, e.g., show the game grid
        isLoggedIn = true;
        await performLogin(username, password);
        fetchAndDisplayBestTimes();
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

async function fetchAndDisplayBestTimes() {
  try {
    if (!loggedInUser) {
      // If the user is not logged in, display a message
      const btTableBody = document.getElementById('user-best-times-table-body');
      btTableBody.innerHTML = '';
      displayMessage(btTableBody, "Please log in for best times.");
      return;
    }

    const response = await fetch(`/api/best-times?user=${loggedInUser}`);
    const bestTimes = await response.json();
    const btTableBody = document.getElementById('user-best-times-table-body');
    btTableBody.innerHTML = '';

    if (response.ok) {
      displayBestTimes(bestTimes, btTableBody);
    } else if (response.status === 401) {
      displayMessage(btTableBody, "You are either not logged in or have not added any leaderboard entries.");
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching and displaying best times:', error);
    handleFetchError('user-best-times-table-body');
  }
}
function displayBestTimes(bestTimes, tb) {
  if (bestTimes !== null && bestTimes.length > 0) {
    bestTimes.forEach((entry, index) => {
      const row = tb.insertRow();
      const rankCell = row.insertCell(0);
      const difficultyCell = row.insertCell(1);
      const timeCell = row.insertCell(2);

      rankCell.textContent = index + 1;
      difficultyCell.textContent = entry.difficulty;
      timeCell.textContent = entry.elapsedTime;
    });
  } else {
    displayMessage(tb, "You have not added any leaderboard entries.");
  }
}

function displayMessage(tableBody, message) {
  const messageRow = tableBody.insertRow();
  const messageCell = messageRow.insertCell(0);
  messageCell.colSpan = 3;
  messageCell.textContent = message;
}

function handleFetchError(tableBodyId) {
  const tableBody = document.getElementById(tableBodyId);
  tableBody.innerHTML = '';

  const message = "An error occurred while fetching your best times.";
  displayMessage(tableBody, message);
}

async function performLogin(username, password) {
  try {
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
      isLoggedIn = true;
      loginModal.style.display = 'none';
      removeModal();
      displayLevelModal();
      fetchAndDisplayBestTimes();
      alert('Login successful!');
    } else {
      // Failed login
      console.error('Login failed. Response:', response);
      alert('Invalid username or password. Please try again.');
      // Optionally, clear the password field
      passwordInput.value = '';
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred during login. Please try again.');
  }
}

