const FormElement = document.querySelector("form");
const InputElement = document.querySelector("input");
const LoadingElement = document.querySelector(".loading");
let MenuTasksElement = document.querySelector("#menuTasks");
const btnAdd = document.querySelector("#addTask");

let Tasks = [];

const apiKey = "6876bb7f34a1869ccb28dec9";

FormElement.addEventListener("submit", (e) => {
  e.preventDefault();
  if (InputElement.value.trim().length > 0) {
    addTask();
  }
});

async function getAllTasks() {
  showLoading();
  const response = await fetch(
    `https://todos.routemisr.com/api/v1/todos/${apiKey}`
  );
  const data = await response.json();
  console.log(data);
  if (response.ok) {
    Tasks = data.todos;
    displayTasks();
  }
  hideLoading();
}

getAllTasks();

async function addTask() {
  showLoading();

  const taskInfo = {
    title: InputElement.value,
    apiKey,
  };
  const obj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskInfo),
  };
  const response = await fetch("https://todos.routemisr.com/api/v1/todos", obj);
  const data = await response.json();
  console.log(data);
  toastr.success("Your Task Added");
  await getAllTasks();
  FormElement.reset();
  hideLoading();
}

function displayTasks() {
  let container = "";
  for (let i = 0; i < Tasks.length; i++) {
    const task = Tasks[i];
    container += `
     <li class="d-flex align-items-center justify-content-between p-2 my-3 border-bottom pb-2">
            ${
              task.completed
                ? ` <span onclick="taskCompleted('${task._id}')" style="text-decoration: line-through;"  class="taskName"> ${task.title} </span>`
                : ` <span  onclick="taskCompleted('${task._id}')" class="taskName"> ${task.title}  </span>`
            }
              <div class="d-flex align-items-center justify-content-center gap-3">
                <span class="trashicon" onclick="deleteTask('${
                  task._id
                }')"><i class="fa-solid fa-trash-can"></i>
                </span>
                ${
                  task.completed
                    ? `<span class="checkIcon"><i class="fa-regular fa-circle-check" style="color: #63e6be"></i></span>`
                    : ""
                }
              </div>
            </li>`;
  }
  MenuTasksElement.innerHTML = container;
  updateProgress();
}

async function taskCompleted(id) {
  Swal.fire({
    title: " mark as complete?",
    text: "You won't be able to change this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, complete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      showLoading();
      console.log(id);
      const todoData = {
        todoId: id,
      };

      const obj = {
        method: "PUT",
        body: JSON.stringify(todoData),
        headers: {
          "content-type": "application/json",
        },
      };

      const response = await fetch(
        `https://todos.routemisr.com/api/v1/todos`,
        obj
      );
      const data = await response.json();
      if (data.message == "success") {
        Swal.fire({
          title: "Completed!",
          icon: "success",
        });
        await getAllTasks();
        updateProgress();
      }
      hideLoading();
    }
  });
}

async function deleteTask(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      showLoading();
      console.log(id);
      const todoData = {
        todoId: id,
      };

      const obj = {
        method: "DELETE",
        body: JSON.stringify(todoData),
        headers: {
          "content-type": "application/json",
        },
      };

      const response = await fetch(
        `https://todos.routemisr.com/api/v1/todos`,
        obj
      );

      if (response.ok) {
        const data = await response.json();

        toastr.success("Your Task Deleted");
        await getAllTasks(); // to display tasks the new list after deleting
      }

      hideLoading();
    }
  });
}

function showLoading() {
  LoadingElement.classList.remove("d-none");
}
function hideLoading() {
  LoadingElement.classList.add("d-none");
}

function updateProgress() {
  let completedTaskNumber = Tasks.filter((task) => task.completed).length;
  let totalTasks = Tasks.length;

  if (Tasks.length > 0) {
    document.getElementById("progress").style.width = `${
      (completedTaskNumber / totalTasks) * 100
    }%`;
  } else {
    document.getElementById("progress").style.width = 0;
  }

  const Spans = document.querySelectorAll(".right-content span");
  Spans[0].innerHTML = completedTaskNumber;
  Spans[1].innerHTML = totalTasks;
}
