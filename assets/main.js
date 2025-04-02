// Timer
function updateCountdownDisplay() {
	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;
	countdownDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  
  function playCurrentTask() {
	if (currentTaskIndex >= taskQueue.length) {
		countdownDisplay.textContent = "Done!";
		audioPlayer.pause();
		console.log("🎉 All tasks completed!");
		return;
	  }
	
	  const task = taskQueue[currentTaskIndex];
	  console.log("🎯 Now starting task:", task);
	
	  remainingSeconds = task.duration * 60;
	  updateCountdownDisplay();
	
	  if (musicSources[task.music]) {
		audioPlayer.src = musicSources[task.music];
		audioPlayer.loop = true;
		audioPlayer.play();
	  }
	
	  clearInterval(timerInterval);
	  timerInterval = setInterval(() => {
		if (!isPaused) {
		  remainingSeconds--;
		  updateCountdownDisplay();
		  console.log("⏳ Time left:", remainingSeconds, "seconds");
	
		  if (remainingSeconds <= 0) {
			clearInterval(timerInterval);
			console.log("✅ Task complete. Moving to next...");
			currentTaskIndex++;
			playCurrentTask();
		  }
		}
	  }, 1000);
	}
  
  // Controls
  controlBtn.addEventListener("click", () => {
	if (taskQueue.length === 0) return;
  
	if (isPaused) {
	  isPaused = false;
	  controlBtn.textContent = "⏸ Pause";
	  audioPlayer.play();
  
	  if (timerInterval === undefined || timerInterval === null) {
		playCurrentTask();
	  }
	} else {
	  isPaused = true;
	  controlBtn.textContent = "▶ Resume";
	  audioPlayer.pause();
	}
  });

// Reset Button
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
	});