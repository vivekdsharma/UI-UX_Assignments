const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

function createTaskElement(titleText, descText, completed = false) {
  const li = document.createElement("li");
  li.className = "task";

  const main = document.createElement("div");
  main.className = "task-main";

  const h3 = document.createElement("h3");
  h3.textContent = titleText;

  const p = document.createElement("p");
  p.textContent = descText;

  if (completed) {
    h3.classList.add("completed");
    p.classList.add("completed");
  }

  main.appendChild(h3);
  main.appendChild(p);

  const controls = document.createElement("div");
  controls.className = "controls";

  const completeBtn = document.createElement("button");
  completeBtn.textContent = completed
    ? "Mark as Incomplete"
    : "Mark as Completed";
  completeBtn.className = "completeBtn";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "editBtn";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "deleteBtn";

  controls.appendChild(completeBtn);
  controls.appendChild(editBtn);
  controls.appendChild(deleteBtn);

  li.appendChild(main);
  li.appendChild(controls);

  completeBtn.addEventListener("click", () => {
    const isCompleted = h3.classList.toggle("completed");
    p.classList.toggle("completed");
    completeBtn.textContent = isCompleted
      ? "Mark as Incomplete"
      : "Mark as Completed";
  });

  deleteBtn.addEventListener("click", () => {
    taskList.removeChild(li);
  });

  editBtn.addEventListener("click", () => {
    const currentlyEditing = editBtn.dataset.editing === "true";
    if (!currentlyEditing) {
      editBtn.dataset.editing = "true";
      editBtn.textContent = "Save";

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.value = h3.textContent;
      titleInput.style.width = "100%";

      const descInput = document.createElement("input");
      descInput.type = "text";
      descInput.value = p.textContent;
      descInput.style.width = "100%";

      li._old = { title: h3.textContent, desc: p.textContent };

      main.replaceChild(titleInput, h3);
      main.replaceChild(descInput, p);

      titleInput.focus();
    } else {
      const titleInput = main.querySelector('input[type="text"]');
      const descInput = main.querySelectorAll('input[type="text"]')[1];

      const newTitle = titleInput.value.trim();
      const newDesc = descInput.value.trim();

      if (newTitle === "" || newDesc === "") {
        alert("Please enter both title and description.");
        return;
      }

      const newH3 = document.createElement("h3");
      newH3.textContent = newTitle;
      const newP = document.createElement("p");
      newP.textContent = newDesc;

      if (titleInput.classList.contains("completed") || li._wasCompleted) {
        newH3.classList.add("completed");
        newP.classList.add("completed");
      }

      main.replaceChild(newH3, titleInput);
      main.replaceChild(newP, descInput);
      editBtn.dataset.editing = "false";
      editBtn.textContent = "Edit";
    }
  });

  return li;
}
addTaskBtn.addEventListener("click", () => {
  const title = taskTitle.value.trim();
  const desc = taskDesc.value.trim();

  if (!title || !desc) {
    alert("Please enter both task title and description.");
    return;
  }

  const taskEl = createTaskElement(title, desc, false);
  taskList.appendChild(taskEl);

  taskTitle.value = "";
  taskDesc.value = "";
  taskTitle.focus();
});

[taskTitle, taskDesc].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });
});
