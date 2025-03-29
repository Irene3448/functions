const addBtn = document.getElementById("addtask");
const inputForm = document.getElementById("inputtask");
const cancelBtn = document.getElementById("cancel");
const submitBtn = document.getElementById("submit");
const taskList = document.getElementById("tasklist");

addBtn.addEventListener("click", () => {
  inputForm.style.display = "flex";
});

cancelBtn.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent form from resetting
  inputForm.style.display = "none";
});

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const type = document.getElementById("tasktype").value;
  const name = document.getElementById("taskname").value;
  const duration = document.getElementById("taskduration").value;
  const music = document.getElementById("backgroundmusic").value;

  // Create list item
  const li = document.createElement("li");
  li.textContent = `${type.toUpperCase()} – ${name} (${duration} min) 🎵 ${music}`;
  taskList.appendChild(li);

  // Reset form and hide modal
  document.getElementById("taskform").reset();
  inputForm.style.display = "none";
});