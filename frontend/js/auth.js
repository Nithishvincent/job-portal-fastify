const API = "http://localhost:3000";

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const res = await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  });

  const data = await res.json();
  alert(data.message || data.error);
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);

    // Decode role (simple decode, no library)
    const payload = JSON.parse(atob(data.token.split(".")[1]));

    if (payload.role === "EMPLOYER") {
      window.location.href = "employer.html";
    } else {
      window.location.href = "seeker.html";
    }
  } else {
    alert(data.error);
  }
}
