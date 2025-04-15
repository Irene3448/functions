// Buttons
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const taskArea = document.getElementById("taskarea");
const controlBtn = document.getElementById("start-timer");
const breakBtn = document.getElementById("break");
const breakModal = document.getElementById("break-modal");
const closeBreakBtn = document.getElementById("close-break");
let resetBtn;
let breakDuration = null;

// Audio setup
const audioPlayer = new Audio();
const musicSources = {
  cozyjazz: "assets/audio/cozyjazz.mp3",
  rainyday: "assets/audio/rainyday.mp3",
  lofi: "assets/audio/lofi.mp3",
  stressfree: "assets/audio/stressfree.mp3",
  whitenoise: "assets/audio/whitenoise.mp3"
};

// App state
let taskQueue = [];
let currentTaskIndex = 0;
let timerInterval = null;
let remainingSeconds = 0;
let isPaused = true;

// Hide controls initially
controlBtn.style.display = "none";

// Show/hide play/reset buttons
function updateControlsVisibility() {
  if (taskQueue.length === 0) {
    controlBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";
    currentTaskIndex = 0;
  } else {
    controlBtn.style.display = "inline-block";
    controlBtn.textContent = isPaused ? "▶ Play" : "⏸ Pause";
    if (resetBtn) resetBtn.style.display = "inline-block";
  }

  // 👇 Add this here
  controlBtn.disabled = (breakDuration === null);
}


// Show task input form
addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

// Cancel input
cancelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  inputForm.style.display = "none";
});

// Submit task
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const duration = parseFloat(document.getElementById("taskduration").value);
  const moodSelect = document.getElementById("mood");
  const moodValue = moodSelect.value;
  const moodText = moodSelect.options[moodSelect.selectedIndex].text;

  if (!duration || !moodValue) {
    alert("Please fill out both duration and mood.");
    return;
  }

  const totalSeconds = Math.round(duration * 60);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  const formattedDuration = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  
  const task = { duration, music: moodValue };

  const li = document.createElement("li");
  li.classList.add("task-item");
  li.innerHTML = `
    <div class="task-duration">${formattedDuration}</div>
    <div class="task-mood">${moodText}</div>
    <div class="task-actions">
      <button class="delete-btn">🗑️</button>
    </div>
  `;
  taskList.appendChild(li);
  taskQueue.push(task);

  attachTaskButtons(li, taskQueue.length - 1);

  document.getElementById("taskform").reset();
  inputForm.style.display = "none";
  updateControlsVisibility();

  if (!resetBtn) createResetButton();

  // 🛑 Check if breakDuration is not selected yet
  if (breakDuration === null) {
    alert("Before starting, please choose your break duration.");
    breakModal.classList.remove("hidden");
  }
});

// Attach delete behavior
function attachTaskButtons(li, index) {
  li.querySelector(".delete-btn").addEventListener("click", () => {
    const isCurrentTask = li === taskList.children[currentTaskIndex];

    if (isCurrentTask && !isPaused) {
      alert("⏸ Pause the task before deleting.");
      return;
    }

    taskList.removeChild(li);
    taskQueue.splice(index, 1);

    if (isCurrentTask) {
      clearInterval(timerInterval);
      timerInterval = null;
      isPaused = true;
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      controlBtn.textContent = "▶ Play";

      [...taskList.children].forEach(li => li.classList.remove("active"));

      if (currentTaskIndex >= taskQueue.length) {
        currentTaskIndex = 0;
      }
    }

    if (index < currentTaskIndex) {
      currentTaskIndex--;
    }

    updateControlsVisibility();

    if (taskQueue.length === 0) {
      updateBackground("default");
    }
  });
}

// Play current task
function playCurrentTask() {
  if (currentTaskIndex >= taskQueue.length) {
    updateControlsVisibility();
    return;
  }

  const task = taskQueue[currentTaskIndex];
  updateBackground(task.music);
  const taskLi = taskList.children[currentTaskIndex];
  const durationEl = taskLi.querySelector(".task-duration");

  [...taskList.children].forEach(li => li.classList.remove("active"));
  taskLi.classList.add("active");

  remainingSeconds = Math.round(task.duration * 60);

  function updateDisplay() {
    const min = Math.floor(remainingSeconds / 60);
    const sec = Math.floor(remainingSeconds % 60);
    const timeStr = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    durationEl.textContent = timeStr;
  }

  updateDisplay();

  isPaused = false;
  controlBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";

  if (musicSources[task.music]) {
    audioPlayer.src = musicSources[task.music];
    audioPlayer.loop = true;
    if (!isPaused) audioPlayer.play().catch(err => console.log("Audio error:", err));
  }

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateDisplay();
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        taskList.removeChild(taskLi);
        taskQueue.splice(currentTaskIndex, 1);
        audioPlayer.pause();
        new Audio("assets/audio/ding.mp3").play();
        updateControlsVisibility();
        
        if (taskQueue.length > 0) {
          if (breakDuration !== null) {
            startBreak(breakDuration);
          } else {
            // Show break modal if no break duration has been selected
            document.getElementById("break-modal").classList.remove("hidden");
          }
        }
      }
    }
  }, 1000);
}

//break starts
function startBreak(duration) {
  // Check if user hasn't selected a break duration
  if (breakDuration === null) {
    alert("Please select your break duration first.");
    breakModal.classList.remove("hidden");
    return;
  }

  // Check if user selected "Skip break"
  if (duration === 0) {
    isPaused = false;
    playCurrentTask();
    return;
  }

  let remaining = duration;
  isPaused = true;
  controlBtn.textContent = "▶ Play";
  controlBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;

  // Show break timer
  const breakDisplay = document.createElement("div");
  breakDisplay.id = "break-countdown";
  breakDisplay.style.color = "white";
  breakDisplay.style.fontSize = "2rem";
  breakDisplay.style.marginTop = "10px";
  document.getElementById("timerbox").appendChild(breakDisplay);

  function updateBreakDisplay() {
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining % 60);
    breakDisplay.textContent = `Break: ${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  updateBreakDisplay();

  const breakInterval = setInterval(() => {
    remaining--;
    updateBreakDisplay();

    if (remaining <= 0) {
      clearInterval(breakInterval);
      breakDisplay.remove();
      isPaused = false;
      controlBtn.textContent = "⏸ Pause";
      playCurrentTask();
    }
  }, 1000);
}


// Toggle play/pause
controlBtn.addEventListener("click", () => {
  if (taskQueue.length === 0) return;

  isPaused = !isPaused;
  controlBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";

  if (!isPaused) {
    if (!timerInterval) {
      playCurrentTask();
    } else {
      audioPlayer.play().catch(err => console.log(err));
    }
  } else {
    audioPlayer.pause();
  }
});

// Reset button
function createResetButton() {
  resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";
  resetBtn.id = "reset-timer";
  resetBtn.style.marginLeft = "10px";
  document.getElementById("timer-controls").appendChild(resetBtn);

  resetBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = true;
    currentTaskIndex = 0;
    audioPlayer.pause();
    controlBtn.textContent = "▶ Play";

    // 🔄 Remove all tasks visually
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }

    // 🧼 Clear task queue
    taskQueue = [];

    // 🔁 Reset break duration selection to default (10 minutes)
    breakSelect.value = "10"; // or whatever your default is
    breakDuration = 10;

    // ✨ Reset background to default
    updateBackground("default");

    updateControlsVisibility();
  });
}



// Ensure correct state on load
updateControlsVisibility();

//break modal
breakBtn.addEventListener("click", () => {
  breakModal.classList.remove("hidden");
});

closeBreakBtn.addEventListener("click", () => {
  breakModal.classList.add("hidden");
});

//break duration
const breakSelect = document.getElementById("break-duration");

breakSelect.addEventListener("change", () => {
  breakDuration = parseInt(breakSelect.value, 10);
  breakModal.classList.add("hidden");

  // 👇 Enable Play button now that a break has been selected
  controlBtn.disabled = false;
});
