// Buttons
const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");
const countdownDisplay = document.getElementById("countdown");
const controlBtn = document.getElementById("start-timer");

//Task logic
let taskQueue = [];
let currentTaskIndex = 0;
let timerInterval;
let isPaused = true;
let remainingSeconds = 0;

//Form buttons
addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

cancelBtn.addEventListener("click", (e) => {
  e.preventDefault(); 
  inputForm.style.display = "none";
});

//Submit button
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const duration = parseInt(document.getElementById("taskduration").value);
  const music = document.getElementById("backgroundmusic").value;

  // Add to queue
  taskQueue.push({ duration, music });

  // Add to visible list
  const li = document.createElement("li");
  li.textContent = `${duration}:00 🎵 ${music}`;
  taskList.appendChild(li);

  // Reset form and hide input
  document.getElementById("taskform").reset();
  inputForm.style.display = "none";

  console.log("✅ Task added:", { duration, music });
  console.log("📝 Updated Task Queue:", taskQueue);
});
