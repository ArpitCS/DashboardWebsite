document.addEventListener("DOMContentLoaded", function () {
  // Variables
  const loginUsername = document.getElementById("username");
  const loginPassword = document.getElementById("password");
  const loginButton = document.getElementById("login-button");

  const jsonFile = "data.json";

  const loginForm = document.getElementById("login-page");
  const landingPage = document.getElementById("landing-page");
  const adminDashboard = document.getElementById("admin-dashboard");

  const loginBtn = document.getElementsByClassName("login-btn");
  const loginSubmitBtn = document.getElementById("login-submit");

  // Default Div Views
  landingPage.style.display = "block";
  adminDashboard.style.display = "none";
  loginForm.style.display = "none";

  // Login Form & Authentication
  loginBtn[0].addEventListener("click", function () {
    loginForm.style.display = "block";
    landingPage.style.display = "none";
  });

  loginBtn[1].addEventListener("click", function () {
    loginForm.style.display = "block";
    landingPage.style.display = "none";
  });

  loginSubmitBtn.addEventListener("click", function () {
    const username = loginUsername.value;
    const password = loginPassword.value;

    fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
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
          alert("Invalid username or password");
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  // Load Content in Admin Dashboard
  const adminProfileContainer = document.getElementById("admin-profile");
  const teamsList = document.getElementById("team-list");

  function loadAdminDashboard(manager) {
    adminProfileContainer.innerHTML = `
            <div class="left">
                <img src="https://placehold.co/100" alt="Admin Avatar" />
                <div class="welcome-text">
                    <p>Welcome, Manager</p>
                    <h2>John Doe</h2>
                </div>
            </div>

            <div class="right">
                <a href="#" class="btn btn-primary">Logout</a>
            </div>
        `;

    let teamsCardContent = "";
    manager.teams.forEach((team) => {
        console.log(team);
        teamsCardContent += `
            <div class="team-card">
                <h3 class="team-name">${team.teamName}</h3>
                <p class="team-members">Members: ${team.teamStrength}</p>
                <hr />
                <ul>
                    <li class="team-member team-leader">${team.leader}</li>
                    ${team.members.map(member => `<li class="team-member">${member.name}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    teamsList.innerHTML = teamsCardContent;
  }
});
