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
      { username: "opham", password: "opham123", redirect: "../operator/operator.html" },
      { username: "admin", password: "admin123", redirect: "../admin/admin.html" },
      { username: "ophal", password: "ophal123", redirect: "../operator/operator-halton.html" }
    ];

    const matchedLogin = validLogins.find(function (login) {
      return login.username === username && login.password === password;
    });

    if (matchedLogin) {
      loginError.classList.remove("show");
      window.location.href = matchedLogin.redirect;
    } else {
      loginError.classList.add("show");
    }
  });
}