const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

if (loginForm && usernameInput && passwordInput && loginError) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const validLogins = [
      { username: "operator", password: "op123" },
      { username: "admin", password: "admin123" }
    ];

    const isValidLogin = validLogins.some(function (login) {
      return login.username === username && login.password === password;
    });

    if (isValidLogin) {
      loginError.classList.remove("show");
      window.location.href = "../index.html";
    } else {
      loginError.classList.add("show");
    }
  });
}