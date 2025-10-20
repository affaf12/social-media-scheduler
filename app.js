/* ========================= 1. TAG DROPDOWN FUNCTION (Enhanced UX) ========================= */
function initTagDropdown(dropdownId, btnId, contentId, tagContainerId) {
  const dropdown = document.getElementById(dropdownId);
  const btn = document.getElementById(btnId);
  const content = document.getElementById(contentId);
  const tagContainer = document.getElementById(tagContainerId);

  const checkboxes = content.querySelectorAll('input[type="checkbox"]');

  // Smooth dropdown animation
  const toggleDropdown = (show) => {
    if (show) {
      content.style.display = "block";
      content.style.opacity = 0;
      content.style.transform = "translateY(-10px)";
      requestAnimationFrame(() => {
        content.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        content.style.opacity = 1;
        content.style.transform = "translateY(0)";
      });
    } else {
      content.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      content.style.opacity = 0;
      content.style.transform = "translateY(-10px)";
      setTimeout(() => (content.style.display = "none"), 200);
    }
  };

  // Toggle dropdown visibility
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const show = !dropdown.classList.contains("show");
    document.querySelectorAll(".group-dropdown.show").forEach((open) => {
      open.classList.remove("show");
      toggleDropdown(false);
    });
    dropdown.classList.toggle("show", show);
    toggleDropdown(show);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
      toggleDropdown(false);
    }
  });

  // Handle checkbox selection
  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", updateTags));

  // Create & display tag chips
  function updateTags() {
    tagContainer.innerHTML = "";
    const selected = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selected.push(checkbox.value);
        const chip = document.createElement("span");
        chip.classList.add("tag-chip");
        chip.innerHTML = `
          ${checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1)}
          <i title="Remove">×</i>
        `;
        chip.querySelector("i").addEventListener("click", () => {
          checkbox.checked = false;
          chip.classList.add("fade-out");
          setTimeout(updateTags, 150);
        });
        tagContainer.appendChild(chip);
      }
    });

    // Update button label with selected values
    btn.innerHTML = selected.length
      ? `${selected.join(", ")} <i class="fas fa-chevron-down"></i>`
      : `${btn.getAttribute("data-default")} <i class="fas fa-chevron-down"></i>`;
  }

  // Save default label
  btn.setAttribute("data-default", btn.textContent.trim());
}

/* ========================= 2. INITIALIZE DROPDOWNS ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Platform dropdown
  initTagDropdown("platform-dropdown", "platform-btn", "platform-options", "platform-tags");

  // Group dropdowns (dynamic)
  const groupDropdowns = document.querySelectorAll(".group-dropdown:not(#platform-dropdown)");
  groupDropdowns.forEach((drop, index) => {
    const tagContainer = drop.querySelector(".tag-container");
    const btn = drop.querySelector(".dropdown-btn");
    const content = drop.querySelector(".dropdown-content");

    const dropdownId = `group-dropdown-${index}`;
    const btnId = `group-btn-${index}`;
    const contentId = `group-options-${index}`;
    const tagContainerId = `group-tags-${index}`;

    drop.id = dropdownId;
    btn.id = btnId;
    content.id = contentId;
    tagContainer.id = tagContainerId;

    initTagDropdown(dropdownId, btnId, contentId, tagContainerId);
  });
});

/* ========================= 3. LIVE MEDIA PREVIEW ========================= */
const imageInput = document.getElementById("image");
const videoInput = document.getElementById("video");
const previewImage = document.getElementById("preview-image");
const previewVideo = document.getElementById("preview-video");

const handleMediaPreview = (input, previewEl, type) => {
  const file = input.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    previewEl.src = url;
    previewEl.style.display = "block";
    if (type === "video") previewEl.controls = true;
  } else {
    previewEl.style.display = "none";
    previewEl.src = "";
  }
};

imageInput.addEventListener("change", (e) => handleMediaPreview(e.target, previewImage, "image"));
videoInput.addEventListener("change", (e) => handleMediaPreview(e.target, previewVideo, "video"));

/* ========================= 4. FORM SUBMISSION & DASHBOARD UPDATE ========================= */
const form = document.getElementById("postForm");
const dashboardBody = document.querySelector("#dashboard tbody");
const statusEl = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedPlatforms = Array.from(
    document.querySelectorAll("#platform-options input[type='checkbox']:checked")
  ).map((cb) => cb.value);

  const selectedGroups = Array.from(
    document.querySelectorAll(".group-dropdown .dropdown-content input[type='checkbox']:checked")
  ).map((cb) => cb.value);

  const post = {
    text: document.getElementById("text").value.trim(),
    platform: selectedPlatforms,
    groups: selectedGroups,
    tags: document.getElementById("tags").value.trim(),
    priority: document.getElementById("priority").value,
    time: document.getElementById("time").value,
  };

  if (!post.text) {
    statusEl.innerText = "⚠️ Please enter some text before submitting.";
    statusEl.style.color = "red";
    return;
  }

  try {
    statusEl.innerText = "⏳ Posting...";
    statusEl.style.color = "#2563eb";

    const res = await fetch("https://social-media-scheduler-seven.vercel.app/add-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    const data = await res.json();
    statusEl.innerText = "✅ Post scheduled successfully!";
    statusEl.style.color = "green";

    // Create new row in dashboard
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${post.text}</td>
      <td>${post.platform.join(", ") || "-"}</td>
      <td>${post.groups.join(", ") || "-"}</td>
      <td>${post.time || "-"}</td>
      <td>${post.priority || "Medium"}</td>
    `;

    // Remove placeholder row if any
    const placeholder = dashboardBody.querySelector('tr td[colspan="5"]');
    if (placeholder) dashboardBody.innerHTML = "";

    dashboardBody.appendChild(newRow);

    // Reset form
    form.reset();
    document.querySelectorAll(".tag-container").forEach((c) => (c.innerHTML = ""));
    previewImage.style.display = "none";
    previewVideo.style.display = "none";
  } catch (err) {
    console.error("Error:", err);
    statusEl.innerText = "❌ Error sending post. Please try again later.";
    statusEl.style.color = "red";
  }
});

/* ========================= 5. SMALL UI TOUCHES ========================= */
// Fade-out animation for tag removal
const style = document.createElement("style");
style.innerHTML = `
  .fade-out {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease-out;
  }
`;
document.head.appendChild(style);
