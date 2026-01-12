function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("Logged out successfully");
  window.location.href = "login.html";
}
