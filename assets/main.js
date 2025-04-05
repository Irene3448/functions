// ========== TASK FORM LOGIC ========== //
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const taskArea = document.getElementById("taskarea");
const controlBtn = document.getElementById("start-timer");
let resetBtn;

// App state
let taskQueue = [];
let currentTaskIndex = 0;
let timerInterval = null;
let remainingSeconds = 0;
let isPaused = true;
let taskBeingEdited = null;

// Hide controls initially
controlBtn.style.display = "none";

// Show form
addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

// Hide form
cancelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  inputForm.style.display = "none";
  taskBeingEdited = null;
});

// Submit or edit task
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

  if (taskBeingEdited) {
    const li = taskBeingEdited.element;
    const index = taskBeingEdited.index;

    li.innerHTML = `
      <div class="task-duration">${formattedDuration}</div>
      <div class="task-mood">${moodText}</div>
      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    taskQueue[index] = { duration, music: moodValue };
    attachTaskButtons(li, duration, moodValue, moodText, index);
    isPaused = true;
    clearInterval(timerInterval);
    timerInterval = null;
    controlBtn.textContent = "▶ Play";
  } else {
    const task = { duration, music: moodValue };
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.innerHTML = `
      <div class="task-duration">${formattedDuration}</div>
      <div class="task-mood">${moodText}</div>
      <div class="task-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
    taskQueue.push(task);
    attachTaskButtons(li, duration, moodValue, moodText, taskQueue.length - 1);
  }

  taskArea.appendChild(addBtn);
  document.getElementById("taskform").reset();
  inputForm.style.display = "none";

  controlBtn.style.display = "inline-block";
  if (!resetBtn) createResetButton();
});

function attachTaskButtons(li, duration, moodValue, moodText, index) {
  li.querySelector(".delete-btn").addEventListener("click", () => {
    const wasCurrent = index === currentTaskIndex;
    taskList.removeChild(li);
    taskQueue.splice(index, 1);
    if (wasCurrent) {
      clearInterval(timerInterval);
      isPaused = true;
      timerInterval = null;
      controlBtn.textContent = "▶ Play";
      playCurrentTask();
    }
  });

  li.querySelector(".edit-btn").addEventListener("click", () => {
    isPaused = true;
    clearInterval(timerInterval);
    timerInterval = null;
    controlBtn.textContent = "▶ Play";

    document.getElementById("taskduration").value = duration;
    document.getElementById("mood").value = moodValue;
    inputForm.style.display = "flex";
    taskBeingEdited = { element: li, index: index };
  });
}

function playCurrentTask() {
  if (currentTaskIndex >= taskQueue.length) return;

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
    if (!timerInterval) playCurrentTask();
    else audioPlayer.play();
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
  });
}