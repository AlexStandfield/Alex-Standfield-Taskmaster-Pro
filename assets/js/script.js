let tasks = {};


let createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  let taskLi = $("<li>").addClass("list-group-item");

  let taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);

  let taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // Check Due Date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


let loadTasks = function() {
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
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};


let saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


$(".list-group").on("click", "p", function(){
  let text = $(this).text().trim();
  let textInput = $("<textarea>");
  $(this).replaceWith(textInput);
  textInput.trigger("focus").addClass("form-control").val(text)
});


$(".list-group").on("blur", "textarea", function() {
  // Get the textarea's current value/text
  let text = $(this).val().trim();

  // Get the parents ul's id attribute
  let status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // Get the task's position in the list of other li elements
  let index = $(this).closest(".list-group-item").index();

  tasks[status][index].text = text;
  saveTasks();

  // Recreate p element
  let taskP = $("<p>").addClass("m-1").text(text)

  // Replace textarea with p element
  $(this).replaceWith(taskP);
});


// Due Date was Clicked
$(".list-group").on("click", "span", function() {
  // Get Current Text
  let date = $(this).text().trim();

  // Create New Input Element
  let dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  // Swap Out Elements
  $(this).replaceWith(dateInput);

  // Enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      // When Calendar is Closed, Force a "change" Event on the "dateInput"
      $(this).trigger("change");
    }
  });

  // Automatically Focus on New Element
  dateInput.trigger("focus");
});


// Value of Due Date was Changed
$(".list-group").on("change", "input[type='text']", function () {
  // Get Current Text
  let date = $(this).val()

  // Get the Parent ul's id attribute
  let status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // Get the Tasks Position in the List of Other li Elements
  let index = $(this).closest("list-group-item").index();

  // Update Task in Array and Re-save to Local Storage
  tasks[status][index].date = date;
  saveTasks();

  // Recreate span Element with Bootstrap Classes
  let taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  // Replace input with span Element
  $(this).replaceWith(taskSpan);

  // Pass Task's <li> Element into auditTask() to Check New Due Date
  auditTask($(taskSpan).closest(".list-group-item"));
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
  let taskText = $("#modalTaskDescription").val();
  let taskDate = $("#modalDueDate").val();

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
  for (let key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});


$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    console.log("activate", this)
  },
  deactivate: function (event) {
    console.log("deactivate", this)
  },
  over: function (event) {
    console.log("over", event.target)
  },
  out: function (event) {
    console.log("out", event.target)
  },
  update: function (event) {
    let tempArr = [];

    // Loop over current set of children in sortable list
    $(this).children().each(function() {
      let text = $(this).find("p").text().trim();

      let date = $(this).find("span").text().trim();

      // Add Task Data to the temp array as an Object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // Trim Down List's ID to Match Object Property
    let arrName = $(this).attr("id").replace("list-", "");
    
    // Update Array on Tasks Object and Save
    tasks[arrName] = tempArr;
    saveTasks();
    
    console.log(tempArr);
  }
});


$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  }
});


$("#modalDueDate").datepicker({
  minDate: 1
});

let auditTask = function(taskEl) {
  // Get Date from Task Element
  let date = $(taskEl).find("span").text().trim()

  // Convert to Moment Object at 5:00pm
  let time = moment(date, "L").set("hour", 17);
  
  // Apply New Class if Task is near/over Due Date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};


// load tasks for the first time
loadTasks();