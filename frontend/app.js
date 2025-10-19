const form = document.getElementById("postForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const post = {
    text: document.getElementById("text").value,
    platform: document.getElementById("platform").value,
    time: document.getElementById("time").value,
  };

  const res = await fetch("https://your-backend-url.onrender.com/add-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });

  const data = await res.json();
  document.getElementById("status").innerText = data.message;
});
