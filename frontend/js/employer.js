const API = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login");
  window.location.href = "login.html";
}

// CREATE JOB
async function createJob() {
  const res = await fetch(`${API}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title: title.value,
      description: description.value,
      company: company.value
    })
  });

  const data = await res.json();
  alert(data.message || data.error);
}

// VIEW APPLICANTS
async function viewApplicants() {
  const id = document.getElementById("jobId").value;

  const res = await fetch(`${API}/jobs/${id}/applicants`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  const div = document.getElementById("applicants");
  div.innerHTML = `<p>Applicants (${data.applicantsCount}):</p>`;

  if (data.applicants.length === 0) {
    div.innerHTML += "<p>No applicants yet</p>";
    return;
  }

  data.applicants.forEach(email => {
    const p = document.createElement("p");
    p.textContent = email;
    div.appendChild(p);
  });
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  window.location.href = "login.html";
}
