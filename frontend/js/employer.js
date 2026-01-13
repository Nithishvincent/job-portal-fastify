console.log("EMPLOYER JS LOADED");

const API = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login");
  window.location.href = "login.html";
}

// --------------------
// STATE
// --------------------
let myJobsCache = [];

// --------------------
// CREATE JOB
// --------------------
async function createJob() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const company = document.getElementById("company").value.trim();

  if (!title || !description || !company) {
    alert("All fields are required");
    return;
  }

  const res = await fetch(`${API}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, company })
  });

  const data = await res.json();
  alert(data.message || data.error);
  loadMyJobs();
}

// --------------------
// LOAD MY JOBS
// --------------------
async function loadMyJobs() {
  const res = await fetch(`${API}/my-jobs`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  myJobsCache = data.jobs || [];

  const container = document.getElementById("myJobs");
  container.innerHTML = "";

  if (myJobsCache.length === 0) {
    container.innerHTML = "<p class='muted'>No jobs created yet</p>";
    return;
  }

  myJobsCache.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <h4>${job.title}</h4>
      <p>${job.company}</p>
      <p class="muted">Job ID: ${job.id}</p>

      <div class="actions">
        <button class="edit-btn">Edit Job</button>
        <button class="danger delete-btn">Delete Job</button>
        <button class="view-btn">View Applicants</button>
      </div>

      <div class="applicants-section"></div>
    `;

    // buttons
    card.querySelector(".edit-btn")
      .addEventListener("click", () => openEditForm(job.id, card));

    card.querySelector(".delete-btn")
      .addEventListener("click", () => deleteJob(job.id));

    const applicantsContainer = card.querySelector(".applicants-section");

    card.querySelector(".view-btn")
      .addEventListener("click", () =>
        viewApplicants(job.id, applicantsContainer)
      );

    container.appendChild(card);
  });
}

// --------------------
// VIEW APPLICANTS (JOB-SPECIFIC)
// --------------------
async function viewApplicants(jobId, container) {
  container.innerHTML = "<p class='muted'>Loading applicants...</p>";

  const res = await fetch(`${API}/jobs/${jobId}/applicants`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    container.innerHTML = `<p class="error">${data.error}</p>`;
    return;
  }

  if (data.applicants.length === 0) {
    container.innerHTML = "<p class='muted'>No applicants yet</p>";
    return;
  }

  container.innerHTML = "<h3>Applicants</h3>";

  data.applicants.forEach(email => {
    const div = document.createElement("div");
    div.className = "applicant-card";
    div.innerText = email;
    container.appendChild(div);
  });
}

// --------------------
// EDIT FORM
// --------------------
function openEditForm(jobId, card) {
  const job = myJobsCache.find(j => j.id === jobId);

  card.innerHTML = `
    <input id="edit-title" value="${job.title}">
    <input id="edit-company" value="${job.company}">
    <textarea id="edit-description">${job.description}</textarea>

    <button class="save-btn">Save</button>
    <button class="cancel-btn">Cancel</button>
  `;

  card.querySelector(".save-btn")
    .addEventListener("click", () => saveJob(jobId));

  card.querySelector(".cancel-btn")
    .addEventListener("click", loadMyJobs);
}

// --------------------
// SAVE JOB
// --------------------
async function saveJob(jobId) {
  const title = document.getElementById("edit-title").value.trim();
  const company = document.getElementById("edit-company").value.trim();
  const description = document.getElementById("edit-description").value.trim();

  if (!title || !company || !description) {
    alert("All fields required");
    return;
  }

  const res = await fetch(`${API}/jobs/${jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, company, description })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Job updated successfully");
  loadMyJobs();
}

// --------------------
// DELETE JOB
// --------------------
async function deleteJob(jobId) {
  if (!confirm("Delete this job?")) return;

  const res = await fetch(`${API}/jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Job deleted");
  loadMyJobs();
}

// --------------------
// LOGOUT
// --------------------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// --------------------
// EXPOSE FUNCTIONS
// --------------------
window.createJob = createJob;
window.loadMyJobs = loadMyJobs;
window.logout = logout;
