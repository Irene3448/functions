// buttons
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const taskArea = document.getElementById("taskarea");
const controlBtn = document.getElementById("start-timer");
let resetBtn;

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

// Hide play/reset buttons initially
controlBtn.style.display = "none";

// Show/hide play/reset buttons
function updateControlsVisibility() {
  if (taskQueue.length === 0) {
    controlBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";
  } else {
    controlBtn.style.display = "inline-block";
    controlBtn.textContent = "▶ Play";
    if (resetBtn) resetBtn.style.display = "inline-block";
  }
}

// Show task input
addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

// Hide form on cancel
cancelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  inputForm.style.display = "none";
});

// Add new task
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

  taskArea.appendChild(addBtn);
  document.getElementById("taskform").reset();
  inputForm.style.display = "none";

  updateControlsVisibility();
  if (!resetBtn) createResetButton();
});

function attachTaskButtons(li, duration, moodValue, moodText, index) {
  li.querySelector(".delete-btn").addEventListener("click", () => {
    const wasCurrent = index === currentTaskIndex;

    taskList.removeChild(li);
    taskQueue.splice(index, 1);


    // If task being deleted is the one currently playing
    if (wasCurrent) {
      clearInterval(timerInterval);
      timerInterval = null;
      isPaused = true;

      // Stop music
      if (!audioPlayer.paused) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0; // Reset to beginning
      }

      // Reset button to ▶ Play
      controlBtn.textContent = "▶ Play";

      // Reset current index if necessary
      if (currentTaskIndex >= taskQueue.length) {
        currentTaskIndex = 0;
      }

      // Remove glow from all tasks
      [...taskList.children].forEach(li => li.classList.remove("active"));
    }

    updateControlsVisibility();
  });
}

//music playing current task
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

  // Set and play music only if not paused
  if (musicSources[task.music]) {
    audioPlayer.src = musicSources[task.music];
    audioPlayer.loop = true;
    if (!isPaused) audioPlayer.play();
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
        playCurrentTask();
      }
    }
  }, 1000);
}

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