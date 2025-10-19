const form = document.getElementById("postForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const post = {
    text: document.getElementById("text").value,
    platform: document.getElementById("platform").value,
    time: document.getElementById("time").value,
  };

  const res = await fetch("https://social-media-scheduler-seven.vercel.app/add-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });

  const data = await res.json();
  document.getElementById("status").innerText = data.message;
});


// ===== Login & Signup JS =====
const signupContainer = document.getElementById('signup-container');
const loginContainer = document.getElementById('login-container');

// Toggle between Signup/Login forms
document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  signupContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});

document.getElementById('showSignup').addEventListener('click', (e) => {
  e.preventDefault();
  loginContainer.style.display = 'none';
  signupContainer.style.display = 'block';
});

// Signup functionality
document.getElementById('signupBtn').addEventListener('click', () => {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if(email && password){
    // Save user in localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);
    document.getElementById('signup-status').innerText = "✅ Signup successful! Please login.";
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  } else {
    document.getElementById('signup-status').innerText = "❌ Please enter email & password.";
  }
});

// Login functionality
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const storedEmail = localStorage.getItem('userEmail');
  const storedPassword = localStorage.getItem('userPassword');

  if(email === storedEmail && password === storedPassword){
    document.getElementById('login-status').innerText = "✅ Login successful!";
    loginContainer.style.display = 'none';
    // Call a function to show your main app/dashboard here
    alert("You are logged in! Now you can access the scheduler.");
  } else {
    document.getElementById('login-status').innerText = "❌ Invalid credentials!";
  }
});

// Auto display login if user already signed up
window.addEventListener('load', () => {
  if(localStorage.getItem('userEmail')){
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  } else {
    signupContainer.style.display = 'block';
    loginContainer.style.display = 'none';
  }
});
