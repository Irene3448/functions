// Buttons
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const taskArea = document.getElementById("taskarea");
const controlBtn = document.getElementById("start-timer");
const settingsBtn = document.getElementById("setting");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
let resetBtn;
let breakDuration = 600;

// Audio setup
const audioPlayer = new Audio();
const musicSources = {
  cozyjazz: "assets/audio/cozyjazz.mp3",
  rainyday: "assets/audio/rainyday.mp3",
  lofi: "assets/audio/lofi.mp3",
  stressfree: "assets/audio/stressfree.mp3",
  whitenoise: "assets/audio/whitenoise.mp3"
};

//break audio
const breakStartAudio = new Audio("assets/audio/break-start.mp3");
const breakEndAudio = new Audio("assets/audio/break-end.mp3");

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

  const duration = parseInt(document.getElementById("taskduration").value);
  const moodSelect = document.getElementById("mood");
  const moodValue = moodSelect.value;
  const moodText = moodSelect.options[moodSelect.selectedIndex].text;

  if (!duration || !moodValue) {
    alert("Please fill out both duration and mood.");
    return;
  }

  const formattedDuration = `${String(duration).padStart(2, "0")}:00`;
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
  });
}

// Play current task
function playCurrentTask() {
  if (currentTaskIndex >= taskQueue.length) {
    updateControlsVisibility();
    return;
  }

  const task = taskQueue[currentTaskIndex];
  const taskLi = taskList.children[currentTaskIndex];
  const durationEl = taskLi.querySelector(".task-duration");

  [...taskList.children].forEach(li => li.classList.remove("active"));
  taskLi.classList.add("active");

  remainingSeconds = task.duration * 60;

  function updateDisplay() {
    const min = Math.floor(remainingSeconds / 60);
    const sec = remainingSeconds % 60;
    const timeStr = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    durationEl.textContent = timeStr;
  }

  updateDisplay();

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
          const breakSelect = document.getElementById("break-duration");
          const breakSeconds = parseInt(breakSelect.value) || 600; // default to 10 minutes
          startBreak(breakSeconds);
        }
      }
    }
  }, 1000);
}

//break starts
function startBreak(durationInSeconds) {
  let breakTime = durationInSeconds;
  breakStartAudio.play();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    breakTime--;

    if (breakTime === 5) {
      breakEndAudio.play(); // 🔊 5 seconds before break ends
    }

    if (breakTime <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      currentTaskIndex++;
      playCurrentTask(); // Resume to next task
    }
  }, 1000);
}

//break time
function startBreakPeriod() {
  const restStartAudio = new Audio("assets/audio/rest-start.mp3");
  const restEndAudio = new Audio("assets/audio/rest-end.mp3");

  restStartAudio.play();

  let breakSeconds = breakDuration;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    breakSeconds--;

    // Optionally update UI with break countdown
    if (breakSeconds <= 5 && breakSeconds > 0) {
      // maybe flash something like "Get ready..."
    }

    if (breakSeconds <= 0) {
      clearInterval(timerInterval);
      restEndAudio.play();
      isPaused = true;
      controlBtn.textContent = "▶ Play";
      playCurrentTask(); // load the next task, but keep it paused
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
    [...taskList.children].forEach(li => li.classList.remove("active"));
    updateControlsVisibility();
  });
}

// Ensure correct state on load
updateControlsVisibility();

//setting modal
settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

//break duration
const breakSelect = document.getElementById("break-duration");

breakSelect.addEventListener("change", () => {
  breakDuration = parseInt(breakSelect.value, 10);
});