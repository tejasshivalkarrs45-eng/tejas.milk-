// Switch to Login
function showLogin() {
  document.getElementById("slider").style.transform = "translateX(-50%)";
}

// Switch to Signup
function showSignup() {
  document.getElementById("slider").style.transform = "translateX(0)";
}

// Signup
function signup() {

  let name = document.getElementById("name").value;
  let mobile = document.getElementById("mobile").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // Validation
  if (!name || !mobile || !email || !password) {
    alert("Please fill all details ❌");
    return;
  }

  let user = {
    name: name,
    mobile: mobile,
    email: email,
    password: password
  };

  // Save in localStorage
  localStorage.setItem("user", JSON.stringify(user));

  alert("धन्यवाद! आपका अकाउंट बन गया है 🙏");

  // Go to login
  showLogin();
}

// Login
function login() {

  let mobile = document.getElementById("loginMobile").value;
  let password = document.getElementById("loginPassword").value;

  let user = JSON.parse(localStorage.getItem("user"));

  if (user && user.mobile == mobile && user.password == password) {

    alert("Login Successful ✅");

    // 🔥 FINAL REDIRECT
    window.location.href = "/home/home.html";

  } else {
    alert("Wrong Details ❌");
  }
}