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
let breakDuration = 300; //default 5min break

// background music for each mood
const audioPlayer = new Audio();
const musicSources = {
  cozyjazz: "assets/audio/cozyjazz.mp3",
  rainyday: "assets/audio/rainyday.mp3",
  lofi: "assets/audio/lofi.mp3",
  stressfree: "assets/audio/stressfree.mp3",
  whitenoise: "assets/audio/whitenoise.mp3"
};

let taskQueue = []; 
let currentTaskIndex = 0; 
let timerInterval = null; 
let remainingSeconds = 0;
let isPaused = true;

// Hide control/play button if no tasks yet
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
  controlBtn.disabled = (typeof breakDuration === 'undefined');
}


// Show task input form
//learned addEventListener from MDN: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
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

  //if no time or mood is selected, show alert
  if (!duration || !moodValue) {
    alert("Please fill out both duration and mood.");
    return;
  }

  const totalSeconds = Math.round(duration * 60);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  //I learned padStart from
  //MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
  const formattedDuration = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  
  //create the task object
  const task = { duration, music: moodValue };

  //creat a new list item for the task
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.innerHTML = `
    <div class="task-duration">${formattedDuration}</div>
    <div class="task-mood">${moodText}</div>
    <div class="task-actions">
      <button class="delete-btn">🗑️</button>
    </div>
  `;
  taskList.appendChild(li); //add to task list on page
  taskQueue.push(task); 

  attachTaskButtons(li, taskQueue.length - 1); //add delete function

  document.getElementById("taskform").reset();//clear form
  inputForm.style.display = "none";//hide form
  isPaused=true;
  controlBtn.textContent ="▶ Play";
  updateControlsVisibility(); //show play/reset

  if (!resetBtn) createResetButton(); //creat reset button if not made yet

});

// Delete button to each task
function attachTaskButtons(li, index) {
  li.querySelector(".delete-btn").addEventListener("click", () => {
    const isCurrentTask = li === taskList.children[currentTaskIndex];

    //don't allow delete if task is playing
    if (isCurrentTask && !isPaused) {
      alert("⏸ Pause the task before deleting.");
      return;
    }

    //remove from page and queue
    taskList.removeChild(li);
    //I needed to remove a task from the array
    //used MDN:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    taskQueue.splice(index, 1);

    //if current task is deleted, stop timer and music
    if (isCurrentTask) {
      clearInterval(timerInterval);
      timerInterval = null;
      isPaused = true;
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      controlBtn.textContent = "▶ Play";

      //remove active style
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

  //load any play the mood music
  if (musicSources[task.music]) {
    audioPlayer.src = musicSources[task.music];
    audioPlayer.loop = true;
    //wanted to play background music for each task
    if (!isPaused) audioPlayer.play().catch(err => console.log("Audio error:", err));
  }

  //countdown starts
  clearInterval(timerInterval);
  //wanted to run a countdown every second
  //sources from MDN: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateDisplay();
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        taskList.removeChild(taskLi); //remove from page
        taskQueue.splice(currentTaskIndex, 1); //remove from list
        audioPlayer.pause();
        new Audio("assets/audio/ding.mp3").play(); //bell sound
        
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
  // Skip break
  if (duration === 0) {
    isPaused = false;
    playCurrentTask();
    return;
  }

  let remaining = duration;
  isPaused = true;
  controlBtn.textContent = "▶ Play";
  controlBtn.disabled = true; //disable play button during break
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
      controlBtn.disabled = false; //re-enable after break

    if (taskQueue.length > 0) {
      controlBtn.textContent = "⏸ Pause";
      playCurrentTask();
    } else {
     }
    }
  }, 1000);
}


// Toggle play/pause button
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
    const confirmReset = confirm("Are you sure you want to remove all the tasks?");
    if (!confirmReset) return;

    // clearInterval(timerInterval);
    // timerInterval = null;
    // isPaused = true;
    resetTimerState();
    currentTaskIndex = 0;
    // audioPlayer.pause();
    controlBtn.textContent = "▶ Play";
  
    //Remove all tasks visually
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }
  
    //Clear task queue
    taskQueue = [];
  
    //Remove break countdown if it's showing
    const breakDisplay = document.getElementById("break-countdown");
    if (breakDisplay) {
      breakDisplay.remove();
    }
  
    // Reset break duration dropdown
    breakSelect.value = "";
    breakDuration = 300;
    // controlBtn.disabled = true;
  
    //Reset background
    updateBackground("default");
    updateControlsVisibility();
  });
}

// buttons are hidden properly when the app first opens
updateControlsVisibility();

//Open and close break modal
breakBtn.addEventListener("click", () => {
  breakModal.classList.remove("hidden");
});

closeBreakBtn.addEventListener("click", () => {
  breakModal.classList.add("hidden");
});

//break duration
const breakSelect = document.getElementById("break-duration");

//saves the user's break time and hides the modal
breakSelect.addEventListener("change", () => {
  breakDuration = parseInt(breakSelect.value, 10);
  breakModal.classList.add("hidden");

  // Enable Play button now that a break has been selected
  controlBtn.disabled = false;
});

// MDN was used as a reference and ChatGPT was used to help with debugging and code explanations