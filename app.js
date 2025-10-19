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


// ===== Simple Email Gate =====
    const signupForm = document.getElementById('signupForm');
    const userEmail = document.getElementById('userEmail');
    const signupStatus = document.getElementById('signup-status');
    const formSection = document.getElementById('form-section');

    signupForm.addEventListener('submit', function(e){
      e.preventDefault();
      const email = userEmail.value.trim();
      if(email && email.endsWith('@gmail.com')){
        signupStatus.innerText = `✅ Welcome ${email}! You can now schedule posts.`;
        formSection.style.display = 'block'; // Show scheduler form
        document.getElementById('signup-section').style.display = 'none'; // Hide signup
      } else {
        signupStatus.innerText = '❌ Please enter a valid Gmail address.';
      }
    });


