// ========== TASK FORM LOGIC ========== //
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const taskArea = document.getElementById("taskarea");
const controlBtn = document.getElementById("start-timer");

let taskQueue = [];
let taskBeingEdited = null;
let currentTaskIndex = 0;
let remainingSeconds = 0;
let timerInterval = null;
let isPaused = true;

// Show the task input form
addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

// Hide task form on cancel
cancelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  inputForm.style.display = "none";
  taskBeingEdited = null;
});

// Submit task (add or edit)
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const duration = document.getElementById("taskduration").value;
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

    taskQueue[index] = {
      duration: parseInt(duration),
      music: moodValue
    };

    attachTaskButtons(li, duration, moodValue, moodText, index);
    taskBeingEdited = null;
  } else {
    const task = {
      duration: parseInt(duration),
      music: moodValue
    };

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
});

function attachTaskButtons(li, duration, moodValue, moodText, index) {
  li.querySelector(".delete-btn").addEventListener("click", () => {
    taskList.removeChild(li);
    taskQueue.splice(index, 1);
  });

  li.querySelector(".edit-btn").addEventListener("click", () => {
    document.getElementById("taskduration").value = duration;
    document.getElementById("mood").value = moodValue;
    inputForm.style.display = "flex";
    taskBeingEdited = { element: li, index: index };
  });
}

// ========== TIMER LOGIC ========== //
let countdownDisplay = document.createElement("div");
countdownDisplay.id = "countdown";
document.getElementById("timerbox").prepend(countdownDisplay);

function playCurrentTask() {
  if (currentTaskIndex >= taskQueue.length) {
    countdownDisplay.textContent = "Done!";
    audioPlayer.pause();
    controlBtn.textContent = "▶ Play";
    return;
  }

  const task = taskQueue[currentTaskIndex];
  const taskLi = taskList.children[currentTaskIndex];
  const durationEl = taskLi.querySelector(".task-duration");

  [...taskList.children].forEach(li => li.classList.remove("active"));
  taskLi.classList.add("active");

  remainingSeconds = task.duration * 60;

  function updateTaskDurationDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    durationEl.textContent = formatted;
    countdownDisplay.textContent = formatted;
  }

  updateTaskDurationDisplay();

  if (musicSources[task.music]) {
    audioPlayer.src = musicSources[task.music];
    audioPlayer.loop = true;
    if (!isPaused) audioPlayer.play();
  }

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateTaskDurationDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        currentTaskIndex++;
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
      audioPlayer.play();
    }
  } else {
    audioPlayer.pause();
  }
});

const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset";
resetBtn.id = "reset-timer";
resetBtn.style.marginLeft = "10px";
document.getElementById("timer-controls").appendChild(resetBtn);

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  currentTaskIndex = 0;
  isPaused = true;
  audioPlayer.pause();
  countdownDisplay.textContent = "00:00";
  controlBtn.textContent = "▶ Play";
  [...taskList.children].forEach(li => li.classList.remove("active"));
});