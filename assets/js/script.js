var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function(){
  let text = $(this)
    .text()
    .trim();
  let textInput = $("<textarea>");
  $(this).replaceWith(textInput);
  textInput.trigger("focus")
    .addClass("form-control")
    .val(text)
});

$(".list-group").on("blur", "textarea", function() {
  // Get the textarea's current value/text
  let text = $(this)
    .val()
    .trim();

  // Get the parents ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // Recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text)

  // Replace textarea with p element
  $(this).replaceWith(taskP);
});


// Due Date was Clicked
$(".list-group").on("click", "span", function() {
  // Get Current Text
  let date = $(this)
    .text()
    .trim();

  // Create New Input Element
  let dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // Swap Out Elements
  $(this).replaceWith(dateInput);

  // Automatically Focus on New Element
  dateInput.trigger("focus");
});

// Value of Due Date was Changed
$(".list-group").on("blur", "input[type='text']", function () {
  // Get Current Text
  let date = $(this)
    .val()
    .trim();

  // Get the Parent ul's id attribute
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the Tasks Position in the List of Other li Elements
  let index = $(this)
    .closest("list-group-item")
    .index();

  // Update Task in Array and Re-save to Local Storage
  tasks[status][index].date = date;
  saveTasks();

  // Recreate span Element with Bootstrap Classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // Replace input with span Element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();