const API = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

const user = getUserFromToken();
if (!user) {
  alert("Please login first");
  window.location.href = "login.html";
}

document.getElementById("userInfo").innerText =
  `Logged in as ${user.email} (${user.role})`;

async function loadJobs() {
  const res = await fetch(`${API}/jobs`);
  const data = await res.json();

  const jobsDiv = document.getElementById("jobs");
  jobsDiv.innerHTML = "";

  data.jobs.forEach(job => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${job.title}</h4>
      <p>${job.description}</p>
      <button id="apply-${job.id}" onclick="apply(${job.id})">Apply</button>
      <hr>
    `;
    jobsDiv.appendChild(div);
  });
}

async function apply(jobId) {
  const btn = document.getElementById(`apply-${jobId}`);
  btn.disabled = true;
  btn.innerText = "Applying...";

  const res = await fetch(`${API}/jobs/${jobId}/apply`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  alert(data.message || data.error);

  btn.innerText = "Applied";
}


loadJobs();
