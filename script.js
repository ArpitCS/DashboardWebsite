document.addEventListener("DOMContentLoaded", function () {
  // Variables
  const loginUsername = document.getElementById("username");
  const loginPassword = document.getElementById("password");
  const loginSubmitBtn = document.getElementById("login-submit");
  const loginForm = document.getElementById("login-page");
  const landingPage = document.getElementById("landing-page");
  const adminDashboard = document.getElementById("admin-dashboard");
  const employeeDashboard = document.getElementById("employee-dashboard");
  const loginBtns = document.getElementsByClassName("login-btn");
  const jsonFile = "data.json";

  // Default Div Views
  landingPage.style.display = "block";
  adminDashboard.style.display = "none";
  loginForm.style.display = "none";
  employeeDashboard.style.display = "none";

  // Login Form & Authentication
  Array.from(loginBtns).forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      loginForm.style.display = "block";
      landingPage.style.display = "none";
    });
  });

  // Handle Logout for Admin and Employee
  function handleLogout(e) {
    if (e.target && (e.target.id === "logout-btn-admin" || e.target.id === "logout-btn-employee")) {
      adminDashboard.style.display = "none";
      employeeDashboard.style.display = "none";
      loginForm.style.display = "none";
      landingPage.style.display = "block";
    }
  }

  adminDashboard.addEventListener("click", handleLogout);
  employeeDashboard.addEventListener("click", handleLogout);

  // Handle Form Submission
  const formElement = loginForm.querySelector("form");
  formElement.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form from submitting

    const role = document.getElementById("role").value;
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (role === "" || username === "" || password === "") {
      alert("Please select role and enter both username and password.");
      return;
    }

    fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
        if (role === "manager") {
          const manager = data.managers.find(
            (manager) =>
              manager.managerUsername === username &&
              manager.managerPassword === password
          );
          if (manager) {
            loginForm.style.display = "none";
            adminDashboard.style.display = "block";

            loadAdminDashboard(manager);
          } else {
            alert("Invalid manager credentials.");
          }
        } else if (role === "employee") {
          let found = false;
          let employeeData = null;
          data.managers.forEach((manager) => {
            manager.teams.forEach((team) => {
              team.members.forEach((member) => {
                if (
                  member.username === username &&
                  member.password === password
                ) {
                  found = true;
                  employeeData = {
                    name: member.name,
                    team: team.teamName
                  };
                }
              });
            });
          });
          if (found) {
            loginForm.style.display = "none";
            employeeDashboard.style.display = "block";

            loadEmployeeDashboard(employeeData);
          } else {
            alert("Invalid employee credentials.");
          }
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  // Load Admin Dashboard
  const adminProfileContainer = document.getElementById("admin-profile");
  const teamsList = document.getElementById("team-list");

  function loadAdminDashboard(manager) {
    adminProfileContainer.innerHTML = `
      <div class="left">
        <img src="https://placehold.co/100" alt="Admin Avatar" />
        <div class="welcome-text">
          <p>Welcome, Manager</p>
          <h2>${manager.managerName}</h2>
        </div>
      </div>

      <div class="right">
        <button id="logout-btn-admin" class="btn btn-primary">Logout</button>
      </div>
    `;

    let teamsCardContent = "";
    manager.teams.forEach((team) => {
      teamsCardContent += `
        <div class="team-card">
          <h3 class="team-name">${team.teamName}</h3>
          <p class="team-members">Members: ${team.teamStrength}</p>
          <hr />
          <ul>
            <li class="team-member team-leader">${team.leader}</li>
            ${team.members
              .map(
                (member) => `<li class="team-member">${member.name}</li>`
              )
              .join("")}
          </ul>
        </div>
      `;
    });
    teamsList.innerHTML = teamsCardContent;

    const leaderSelect = document.getElementById("leader-select");
    const graphCanvas = document.getElementById("team-performance-chart");

    leaderSelect.addEventListener("change", (e) => {
      let selectedLeader = e.target.value;
      console.log(selectedLeader);

      const teamPerformanceData = manager.teams.find(
        (team) => team.leader === selectedLeader
      );
      const ctx = graphCanvas.getContext("2d");

      if (window.myChart) {
        window.myChart.destroy();
      }

      // Create a new chart
      window.myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: teamPerformanceData.leaderPerformace.map(
            (performance, index) => `Week ${index + 1}`
          ),
          datasets: [
            {
              label: "Team Performance",
              data: teamPerformanceData.leaderPerformace,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Leaves Section
      const leavesContainer = document.getElementById("leaves");
      leavesContainer.innerHTML = `
        <div>
          <div id="sick-leaves">
            <p>Sick Leaves:  ${teamPerformanceData.sickLeaves.length}</p>
          </div>
          <div id="paid-leaves">
            <p>Paid Leaves: ${teamPerformanceData.paidLeaves.length}</p>
          </div>
          <div id="non-paid-leaves">
            <p>Non-Paid Leaves: ${teamPerformanceData.nonPaidLeaves.length}</p>
          </div>
        </div>
      `;

      const calendarTable = document.getElementById("event-list");
      

      function markLeaves(leaves, type) {
        const leaveDates = leaves.map(leave => leave.date.split('-').slice(1).join('-'));
        const tableRows = calendarTable.rows;
        for (let i = 1; i < tableRows.length; i++) {
          const rowCells = tableRows[i].cells;
          for (let j = 0; j < rowCells.length; j++) {
            const cellText = rowCells[j].textContent;
            if (leaveDates.includes(cellText)) {
              rowCells[j].style.background = type === 'sick' ? 'red' : type === 'paid' ? 'green' : 'yellow';
            }
          }
        }
      }
  
      // Mark sick leaves
      markLeaves(teamPerformanceData.sickLeaves, 'sick');
  
      // Mark paid leaves
      markLeaves(teamPerformanceData.paidLeaves, 'paid');
  
      // Mark non-paid leaves
      markLeaves(teamPerformanceData.nonPaidLeaves, 'non-paid');
    });

    // Task Assignment Feature
    addTaskAssignmentFeature(manager);
  }

  // Task Assignment Feature
  function addTaskAssignmentFeature(manager) {
    // Create Task Assignment Form in Admin Dashboard
    const assignTaskContainer = document.createElement("div");
    assignTaskContainer.classList.add("container", "mt-5");
    assignTaskContainer.innerHTML = `
      <h2>Assign Task to Employee</h2>
      <form id="admin-assign-task-form">
        <div class="mb-3">
          <label for="select-team" class="form-label">Select Team</label>
          <select class="form-select" id="select-team" required>
            <option value="">Select Team</option>
            ${manager.teams
              .map(
                (team) => `<option value="${team.teamName}">${team.teamName}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="mb-3">
          <label for="select-employee" class="form-label">Select Employee</label>
          <select class="form-select" id="select-employee" required>
            <option value="">Select Employee</option>
            <!-- Employees will be populated based on selected team -->
          </select>
        </div>
        <div class="mb-3">
          <label for="task-title-admin" class="form-label">Task Title</label>
          <input
            type="text"
            class="form-control"
            id="task-title-admin"
            name="task-title-admin"
            required
          />
        </div>
        <div class="mb-3">
          <label for="task-desc-admin" class="form-label">Task Description</label>
          <textarea
            class="form-control"
            id="task-desc-admin"
            name="task-desc-admin"
            rows="3"
            required
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="task-due-date-admin" class="form-label">Due Date</label>
          <input
            type="date"
            class="form-control"
            id="task-due-date-admin"
            name="task-due-date-admin"
            required
          />
        </div>
        <button type="submit" class="btn btn-success" id="admin-assign-task-submit">
          Assign Task
        </button>
      </form>
    `;
    adminDashboard.appendChild(assignTaskContainer);

    const selectTeam = document.getElementById("select-team");
    const selectEmployee = document.getElementById("select-employee");
    const adminAssignTaskForm = document.getElementById("admin-assign-task-form");

    // Populate Employees based on selected team
    selectTeam.addEventListener("change", function () {
      const selectedTeam = this.value;
      selectEmployee.innerHTML = `<option value="">Select Employee</option>`;
      if (selectedTeam !== "") {
        const team = manager.teams.find(
          (team) => team.teamName === selectedTeam
        );
        team.members.forEach((member) => {
          selectEmployee.innerHTML += `<option value="${member.username}">${member.name}</option>`;
        });
      }
    });

    // Handle Task Assignment
    adminAssignTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const teamName = selectTeam.value;
      const employeeUsername = selectEmployee.value;
      const taskTitle = document.getElementById("task-title-admin").value.trim();
      const taskDesc = document.getElementById("task-desc-admin").value.trim();
      const taskDueDate = document.getElementById("task-due-date-admin").value;

      if (
        teamName === "" ||
        employeeUsername === "" ||
        taskTitle === "" ||
        taskDesc === "" ||
        taskDueDate === ""
      ) {
        alert("Please fill in all fields.");
        return;
      }

      const task = {
        title: taskTitle,
        description: taskDesc,
        status: "Pending",
        dueDate: taskDueDate
      };

      // Retrieve existing tasks from local storage
      let tasks = JSON.parse(localStorage.getItem("tasks")) || {};

      if (!tasks[employeeUsername]) {
        tasks[employeeUsername] = [];
      }

      tasks[employeeUsername].push(task);

      // Save back to local storage
      localStorage.setItem("tasks", JSON.stringify(tasks));

      alert("Task assigned successfully!");

      // Reset the form
      adminAssignTaskForm.reset();
      selectEmployee.innerHTML = `<option value="">Select Employee</option>`;
    });
  }

  // Load Employee Dashboard
  const employeeProfileContainer = document.getElementById("employee-profile");
  const tasksList = document.getElementById("tasks-list");
  const leavesList = document.getElementById("leaves-list");

  function loadEmployeeDashboard(employeeData) {
    employeeProfileContainer.innerHTML = `
      <div class="left">
        <img src="https://placehold.co/100" alt="Employee Avatar" />
        <div class="welcome-text">
          <p>Welcome,</p>
          <h2>${employeeData.name}</h2>
          <p>Team: ${employeeData.team}</p>
        </div>
      </div>

      <div class="right">
        <button id="logout-btn-employee" class="btn btn-primary">Logout</button>
      </div>
    `;

    loadEmployeeTasks(employeeData);
    loadEmployeeLeaves(employeeData);
  }

  // Load Employee Tasks from Local Storage
  function loadEmployeeTasks(employeeData) {
    const tasksContainer = document.getElementById("tasks-list");
    tasksContainer.innerHTML = ""; // Clear existing tasks

    const tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    const employeeTasks = tasks[employeeData.name] || [];

    if (employeeTasks.length === 0) {
      tasksContainer.innerHTML = `<p>No tasks assigned.</p>`;
      return;
    }

    employeeTasks.forEach((task, index) => {
      const taskCard = document.createElement("div");
      taskCard.classList.add("task-card", "col-md-6");

      taskCard.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p class="task-status ${task.status.toLowerCase().replace(" ", "-")}"><strong>Status:</strong> ${task.status}</p>
        <button class="btn btn-sm btn-secondary update-status-btn" data-task-index="${index}">
          Update Status
        </button>
      `;
      tasksContainer.appendChild(taskCard);
    });

    // Add Event Listeners to Update Status Buttons
    const updateStatusButtons = document.querySelectorAll(".update-status-btn");
    updateStatusButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const taskIndex = this.getAttribute("data-task-index");
        const newStatus = prompt("Enter new status (Pending, In Progress, Completed):");
        if (
          newStatus === "Pending" ||
          newStatus === "In Progress" ||
          newStatus === "Completed"
        ) {
          updateTaskStatus(employeeData.name, taskIndex, newStatus);
        } else {
          alert("Invalid status entered.");
        }
      });
    });
  }

  // Update Task Status in Local Storage
  function updateTaskStatus(employeeName, taskIndex, newStatus) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || {};
    if (tasks[employeeName] && tasks[employeeName][taskIndex]) {
      tasks[employeeName][taskIndex].status = newStatus;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      alert("Task status updated successfully!");
      loadEmployeeTasks({ name: employeeName, team: "" }); // Reload tasks
    } else {
      alert("Task not found.");
    }
  }

  // Load Employee Leaves
  function loadEmployeeLeaves(employeeData) {
    const leavesContainer = document.getElementById("leaves-list");
    leavesContainer.innerHTML = ""; // Clear existing leaves

    // For simplicity, we'll mock leave data. In a real application, leaves would be managed similarly to tasks.
    const leaves = JSON.parse(localStorage.getItem("leaves")) || {};
    const employeeLeaves = leaves[employeeData.name] || [];

    if (employeeLeaves.length === 0) {
      leavesContainer.innerHTML = `<p>No leaves taken.</p>`;
      return;
    }

    employeeLeaves.forEach((leave) => {
      const leaveCard = document.createElement("div");
      leaveCard.classList.add("leave-card", "col-md-6");

      leaveCard.innerHTML = `
        <h4>${leave.type} Leave</h4>
        <p><strong>Date:</strong> ${leave.date}</p>
        <p><strong>Reason:</strong> ${leave.reason}</p>
        <p><strong>Status:</strong> ${leave.status}</p>
      `;
      leavesContainer.appendChild(leaveCard);
    });
  }

  // Handle Leave Requests
  const requestLeaveForm = document.getElementById("request-leave-form");
  requestLeaveForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const leaveType = document.getElementById("leave-type").value;
    const leaveDate = document.getElementById("leave-date").value;
    const leaveReason = document.getElementById("leave-reason").value.trim();

    if (leaveType === "" || leaveDate === "" || leaveReason === "") {
      alert("Please fill in all fields.");
      return;
    }

    // Retrieve existing leaves from local storage
    let leaves = JSON.parse(localStorage.getItem("leaves")) || {};

    // Assuming the employee is already logged in, retrieve their name
    const employeeName = employeeProfileContainer.querySelector("h2").textContent;

    if (!leaves[employeeName]) {
      leaves[employeeName] = [];
    }

    const leave = {
      type: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
      date: leaveDate,
      reason: leaveReason,
      status: "Pending"
    };

    leaves[employeeName].push(leave);

    // Save back to local storage
    localStorage.setItem("leaves", JSON.stringify(leaves));

    alert("Leave request submitted successfully!");

    // Reset the form
    requestLeaveForm.reset();
    loadEmployeeLeaves({ name: employeeName, team: "" });
  });

  // Employee Task Assignment Form (Hidden in Employee Dashboard)
  // Since only managers can assign tasks, employees don't have this form

});
