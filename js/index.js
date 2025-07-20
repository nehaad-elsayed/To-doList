const FormElement = document.querySelector("form");
const InputElement = document.querySelector("input");
const LoadingElement = document.querySelector(".loading");
let MenuTasksElement = document.querySelector("#menuTasks");
const btnAdd = document.querySelector("#addTask");
const ulCotainer = document.querySelector(".ul-container");

let Tasks = [];
let isSubmitting = false; // prevent rapid requests

const apiKey = "6876bb7f34a1869ccb28dec9"; 

//* security and protection functions // =>>>>>
//* this function is used to check if the text contains any dangerous characters
function containsScript(text) {
  //* check for dangerous HTML tags // =>>>>>
  const dangerousTags =
    /<script|<iframe|<object|<embed|<form|<input|<textarea|<select|<button|<link|<meta|<style/i;

  //* check for JavaScript events // =>>>>>
  const jsEvents = /on\w+\s*=|javascript:|vbscript:|data:text\/html/i;

  //* check for dangerous URLs // =>>>>>
  const dangerousUrls = /data:|file:|ftp:|javascript:|vbscript:/i;

  //* check for dangerous characters // =>>>>>
  const dangerousChars = /[<>\"'&]/;

  return (
    dangerousTags.test(text) ||
    jsEvents.test(text) ||
    dangerousUrls.test(text) ||
    dangerousChars.test(text)
  );
}

//* this function is used to remove all dangerous characters from the text
function testInput(text) {
  //* remove all dangerous characters // =>>>>>
  return text
    .replace(/[<>\"'&]/g, "") // remove < > " ' &
    .replace(/javascript:/gi, "") // remove javascript:
    .replace(/vbscript:/gi, "") // remove vbscript:
    .replace(/on\w+\s*=/gi, "") // remove event handlers
    .replace(/data:/gi, "") // remove data URLs
    .trim();
}

function validateInput(text) {
  const validPattern =
    /^[a-zA-Z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-_.,!?()]+$/;
  return validPattern.test(text);
}

function escapeHtml(text) {
  //* convert dangerous characters to safe entities // =>>>>>
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
//* form submit event // =>>>>>
FormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  //* prevent rapid requests // =>>>>>
  if (isSubmitting) {
    toastr.warning("please waiting");
    return;
  }

  const inputValue = InputElement.value.trim();

  //* check if the field is not empty // =>>>>>
  if (inputValue.length === 0) {
    toastr.error(" please enter a task");
    return;
  }

  //* check if the text is too long // =>>>>>
  if (inputValue.length > 500) {
    toastr.error("the text is too long, the maximum is 500 characters");
    return;
  }

  //* check if there is any JavaScript or HTML code // =>>>>>
  if (containsScript(inputValue)) {
    toastr.error(" incripted content ");
    return;
  }

  //* clean the text from dangerous characters // =>>>>>
  const validValue = testInput(inputValue);

  if (validValue.length === 0) {
    toastr.error("Enter a valid text");
    return;
  }

  isSubmitting = true;
  addTask(validValue);
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

async function addTask(sanitizedTitle) {
  try {
    showLoading();

    const taskInfo = {
      title: sanitizedTitle,
      apiKey,
    };
    const obj = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskInfo),
    };
    const response = await fetch(
      "https://todos.routemisr.com/api/v1/todos",
      obj
    );
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      toastr.success("task added successfully");
      await getAllTasks();
      FormElement.reset();
    } else {
      toastr.error("an error occurred while adding the task");
    }
  } catch (error) {
    console.error("an error occurred in adding the task:", error);
    toastr.error("an error occurred in the connection");
  } finally {
    hideLoading();
    isSubmitting = false;
  }
}

function displayTasks() {
  let container = "";

  if (Tasks.length > 0) {
    container += `<ul style="background-color: transparent;"
      id="menuTasks"
      class="menutasks list-styled-none bg-white rounded mt-5 p-4"
      role="list"
      aria-label="Task list"
    >`;

    for (let i = 0; i < Tasks.length; i++) {
      const task = Tasks[i];
      const safeTitle = escapeHtml(task.title);

      container += `
        <li class="d-flex align-items-center justify-content-between p-2 my-3 border-bottom pb-2">
          ${
            task.completed
              ? ` <span onclick="taskCompleted('${task._id}')" style="text-decoration: line-through;"  class="taskName"> ${safeTitle} </span>`
              : ` <span  onclick="taskCompleted('${task._id}')" class="taskName"> ${safeTitle}  </span>`
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

    // close ul
    container += `</ul>`;
  } else {
    
    container += `
      <div class="text-center mt-5 p-4">
        <i class="fa-solid fa-clipboard-list text-white" style="font-size: 3rem; opacity: 0.7;"></i>
        <p class="text-white mt-3" style="font-size: 1.2rem; opacity: 0.8;">No tasks yet</p>
        <p class="text-white-50 mt-2" style="font-size: 0.9rem;">Add your first task to get started!</p>
      </div>`;
  }

  ulCotainer.innerHTML = container;
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
