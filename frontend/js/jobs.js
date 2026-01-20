console.log("JOB SEEKER JS LOADED");

const API = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login");
  window.location.href = "login.html";
}

// --------------------
// STATE
// --------------------
let myApplicationsMap = {}; // { jobId: status }

// --------------------
// LOAD MY APPLICATIONS
// --------------------
async function loadMyApplications() {
  const res = await fetch(`${API}/my-applications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  myApplicationsMap = {};

  if (data.applications) {
    data.applications.forEach(app => {
      myApplicationsMap[app.job_id] = app.status;
    });
  }
}

// --------------------
// LOAD JOBS
// --------------------
async function loadJobs() {
  const res = await fetch(`${API}/jobs`);
  const data = await res.json();

  const container = document.getElementById("jobs");
  container.innerHTML = "";

  if (data.jobs.length === 0) {
    container.innerHTML = "<p>No jobs available</p>";
    return;
  }

  data.jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    const appliedStatus = myApplicationsMap[job.id];

    let buttonHTML = "";
    let statusHTML = "";

    if (appliedStatus) {
      buttonHTML = `<button disabled>${appliedStatus}</button>`;
      statusHTML = `<p class="status ${appliedStatus.toLowerCase()}">
        Status: ${appliedStatus}
      </p>`;
    } else {
      buttonHTML = `<button onclick="applyForJob(${job.id}, this)">Apply</button>`;
    }

    card.innerHTML = `
      <h4>${job.title}</h4>
      <p>${job.company}</p>
      <p>${job.description}</p>
      ${buttonHTML}
      ${statusHTML}
    `;

    container.appendChild(card);
  });
}

// --------------------
// APPLY FOR JOB
// --------------------
async function applyForJob(jobId, button) {
  button.disabled = true;
  button.innerText = "Applying...";

  const res = await fetch(`${API}/jobs/${jobId}/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    button.disabled = false;
    button.innerText = "Apply";
    return;
  }

  alert("Applied successfully");

  await loadMyApplications();
  loadJobs();
}

// --------------------
// LOGOUT
// --------------------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// --------------------
// INIT
// --------------------
async function init() {
  await loadMyApplications();
  await loadJobs();
}

init();

// expose logout
window.logout = logout;
