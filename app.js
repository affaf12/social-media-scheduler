/* ========================= 0. UTILITIES ========================= */
const ANIM_DURATION = 200; // ms — keep CSS/JS durations aligned

function animateOpen(content) {
  if (!content) return;
  content.style.display = "block";
  content.style.opacity = 0;
  content.style.transform = "translateY(-8px)";
  // Force style application then animate
  requestAnimationFrame(() => {
    content.style.transition = `opacity ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms ease`;
    content.style.opacity = 1;
    content.style.transform = "translateY(0)";
  });
}

function animateClose(content) {
  if (!content) return;
  content.style.transition = `opacity ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms ease`;
  content.style.opacity = 0;
  content.style.transform = "translateY(-8px)";
  setTimeout(() => {
    // hide after animation
    content.style.display = "none";
  }, ANIM_DURATION);
}

/**
 * Close all open dropdowns except optional exceptEl (DOM element)
 */
function closeAllOpenDropdowns(exceptEl = null) {
  document.querySelectorAll(".group-dropdown.show").forEach((open) => {
    if (exceptEl && open === exceptEl) return;
    open.classList.remove("show");
    const openContent = open.querySelector(".dropdown-content");
    if (openContent) animateClose(openContent);
    const openBtn = open.querySelector(".dropdown-btn");
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
    }
  });
}

/* ========================= 1. TAG DROPDOWN FUNCTION (Enhanced UX + Accessible) ========================= */
function initTagDropdown(dropdownEl, btnEl, contentEl, tagContainerEl) {
  if (!dropdownEl || !btnEl || !contentEl || !tagContainerEl) return;

  const checkboxes = Array.from(contentEl.querySelectorAll("input[type='checkbox']"));

  // Save default label for reset
  btnEl.setAttribute("data-default", btnEl.textContent.trim());
  btnEl.setAttribute("role", "button");
  btnEl.setAttribute("tabindex", "0");
  btnEl.setAttribute("aria-expanded", "false");

  // Toggle helper
  const toggle = (show) => {
    dropdownEl.classList.toggle("show", show);
    btnEl.setAttribute("aria-expanded", show ? "true" : "false");
    if (show) animateOpen(contentEl);
    else animateClose(contentEl);
  };

  // Toggle on click
  btnEl.addEventListener("click", (e) => {
    e.stopPropagation();
    const willShow = !dropdownEl.classList.contains("show");
    // Close others first
    closeAllOpenDropdowns(willShow ? dropdownEl : null);
    toggle(willShow);
  });

  // Keyboard support (Enter/Space/Escape)
  btnEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btnEl.click();
    } else if (e.key === "Escape") {
      toggle(false);
    }
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownEl.contains(e.target)) toggle(false);
  });

  // Close on Escape globally
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });

  // Update tags when a checkbox changes
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateTags);
  });

  // Build tag chips from selected checkboxes
  function updateTags() {
    tagContainerEl.innerHTML = "";
    const selected = [];

    checkboxes.forEach((cb) => {
      if (cb.checked) {
        selected.push(cb.value);
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.innerHTML = `
          ${escapeHtml(capitalize(cb.value))}
          <i title="Remove" role="button" tabindex="0">×</i>
        `;
        // Remove handler
        const removeBtn = chip.querySelector("i");
        removeBtn.addEventListener("click", () => {
          cb.checked = false;
          chip.classList.add("fade-out");
          setTimeout(updateTags, ANIM_DURATION);
        });
        removeBtn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            cb.checked = false;
            chip.classList.add("fade-out");
            setTimeout(updateTags, ANIM_DURATION);
          }
        });

        tagContainerEl.appendChild(chip);
      }
    });

    // Update dropdown button label and keep chevron icon
    const label = selected.length ? selected.join(", ") : btnEl.getAttribute("data-default");
    btnEl.innerHTML = `${escapeHtml(label)} <i class="fas fa-chevron-down" aria-hidden="true"></i>`;
  }

  // initialize UI
  updateTags();
}

/* small helpers */
function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
  });
}

/* ========================= 2. INITIALIZE DROPDOWNS ON DOM READY ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Platforms dropdown (specific)
  const platformDropdown = document.getElementById("platform-dropdown");
  const platformBtn = document.getElementById("platform-btn");
  const platformOptions = document.getElementById("platform-options");
  const platformTags = document.getElementById("platform-tags");
  if (platformDropdown && platformBtn && platformOptions && platformTags) {
    initTagDropdown(platformDropdown, platformBtn, platformOptions, platformTags);
  }

  // Groups dropdown(s) - there may be one or more
  const groupDropdowns = document.querySelectorAll(".group-dropdown:not(#platform-dropdown)");
  groupDropdowns.forEach((drop, index) => {
    // ensure tag container exists for group
    let tagContainer = drop.querySelector(".tag-container");
    if (!tagContainer) {
      tagContainer = document.createElement("div");
      tagContainer.className = "tag-container";
      // insert it before button's next sibling for consistency
      const btn = drop.querySelector(".dropdown-btn");
      if (btn && btn.parentNode) btn.parentNode.insertBefore(tagContainer, btn.nextSibling);
      else drop.insertBefore(tagContainer, drop.firstChild);
    }

    const btn = drop.querySelector(".dropdown-btn");
    const content = drop.querySelector(".dropdown-content");

    // give unique ids if not present
    const dropdownId = drop.id || `group-dropdown-${index}`;
    const btnId = btn.id || `group-btn-${index}`;
    const contentId = content.id || `group-options-${index}`;
    const tagContainerId = tagContainer.id || `group-tags-${index}`;

    drop.id = dropdownId;
    btn.id = btnId;
    content.id = contentId;
    tagContainer.id = tagContainerId;

    initTagDropdown(drop, btn, content, tagContainer);
  });

  // Accessibility: allow closing other dropdowns when opening one via keyboard Tab focus
  document.addEventListener("focusin", (e) => {
    const containing = e.target.closest(".group-dropdown");
    if (!containing) {
      // focus moved outside any dropdown: close all
      closeAllOpenDropdowns();
    }
  });
});

/* ========================= 3. LIVE MEDIA PREVIEW (safe guards) ========================= */
const imageInput = document.getElementById("image");
const videoInput = document.getElementById("video");
const previewImage = document.getElementById("preview-image");
const previewVideo = document.getElementById("preview-video");

function safeAddChange(inputEl, handler) {
  if (!inputEl) return;
  inputEl.addEventListener("change", handler);
}

function handleMediaPreview(input, previewEl, type) {
  if (!input || !previewEl) return;
  const file = input.files && input.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    previewEl.src = url;
    previewEl.style.display = "block";
    if (type === "video") previewEl.controls = true;
  } else {
    previewEl.style.display = "none";
    // release object URL if needed (optional)
    try {
      URL.revokeObjectURL(previewEl.src);
    } catch (e) {}
    previewEl.src = "";
  }
}

safeAddChange(imageInput, (e) => handleMediaPreview(e.target, previewImage, "image"));
safeAddChange(videoInput, (e) => handleMediaPreview(e.target, previewVideo, "video"));

/* ========================= 4. FORM SUBMISSION + DASHBOARD UPDATE (with resets) ========================= */
const form = document.getElementById("postForm");
const dashboardBody = document.querySelector("#dashboard tbody");
const statusEl = document.getElementById("status");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // collect selected platforms (platform dropdown inputs)
    const platformCheckboxes = document.querySelectorAll("#platform-options input[type='checkbox']");
    const selectedPlatforms = Array.from(platformCheckboxes).filter((cb) => cb.checked).map((cb) => cb.value);

    // collect selected groups (all group dropdowns)
    const groupCheckboxes = document.querySelectorAll(".group-dropdown .dropdown-content input[type='checkbox']");
    const selectedGroups = Array.from(groupCheckboxes).filter((cb) => cb.checked).map((cb) => cb.value);

    const textEl = document.getElementById("text");
    const tagsEl = document.getElementById("tags");
    const priorityEl = document.getElementById("priority");
    const timeEl = document.getElementById("time");

    const post = {
      text: textEl ? textEl.value.trim() : "",
      platform: selectedPlatforms,
      groups: selectedGroups,
      tags: tagsEl ? tagsEl.value.trim() : "",
      priority: priorityEl ? priorityEl.value : "medium",
      time: timeEl ? timeEl.value : "",
    };

    if (!post.text) {
      if (statusEl) {
        statusEl.innerText = "⚠️ Please enter some text before submitting.";
        statusEl.style.color = "red";
      }
      textEl && textEl.focus();
      return;
    }

    try {
      if (statusEl) {
        statusEl.innerText = "⏳ Posting...";
        statusEl.style.color = "#2563eb";
      }

      // send to server (if you have backend)
      const res = await fetch("https://social-media-scheduler-seven.vercel.app/add-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });

      // try parse server response (guard)
      let data;
      try {
        data = await res.json();
      } catch (err) {
        data = { message: "OK" };
      }

      if (statusEl) {
        statusEl.innerText = "✅ Post scheduled successfully!";
        statusEl.style.color = "green";
      }

      // Add row to dashboard
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${escapeHtml(post.text)}</td>
        <td>${escapeHtml((post.platform && post.platform.join(", ")) || "-")}</td>
        <td>${escapeHtml((post.groups && post.groups.join(", ")) || "-")}</td>
        <td>${escapeHtml(post.time || "-")}</td>
        <td>${escapeHtml(post.priority || "Medium")}</td>
      `;

      // Remove placeholder row if present
      const placeholder = dashboardBody.querySelector('tr td[colspan="5"]');
      if (placeholder) dashboardBody.innerHTML = "";

      dashboardBody.appendChild(newRow);

      // Reset UI fully: form, tag containers, previews, dropdown labels and checkboxes
      form.reset();

      // clear all tag containers
      document.querySelectorAll(".tag-container").forEach((c) => (c.innerHTML = ""));

      // hide previews and release object urls
      if (previewImage) {
        try {
          URL.revokeObjectURL(previewImage.src);
        } catch (e) {}
        previewImage.src = "";
        previewImage.style.display = "none";
      }
      if (previewVideo) {
        try {
          URL.revokeObjectURL(previewVideo.src);
        } catch (e) {}
        previewVideo.src = "";
        previewVideo.style.display = "none";
      }

      // uncheck all checkboxes inside dropdowns
      document.querySelectorAll(".group-dropdown .dropdown-content input[type='checkbox']").forEach((cb) => {
        cb.checked = false;
      });
      document.querySelectorAll("#platform-options input[type='checkbox']").forEach((cb) => {
        cb.checked = false;
      });

      // reset dropdown buttons to defaults
      document.querySelectorAll(".group-dropdown .dropdown-btn").forEach((btn) => {
        const defaultLabel = btn.getAttribute("data-default") || "Select";
        btn.innerHTML = `${escapeHtml(defaultLabel)} <i class="fas fa-chevron-down" aria-hidden="true"></i>`;
        btn.setAttribute("aria-expanded", "false");
      });

      // close any open dropdowns
      closeAllOpenDropdowns();

    } catch (err) {
      console.error("Error:", err);
      if (statusEl) {
        statusEl.innerText = "❌ Error sending post. Please try again later.";
        statusEl.style.color = "red";
      }
    }
  });
}

/* ========================= 5. SMALL UI TOUCHES (fade-out style) ========================= */
const style = document.createElement("style");
style.innerHTML = `
  .fade-out {
    opacity: 0;
    transform: scale(0.94);
    transition: all ${ANIM_DURATION}ms ease-out;
  }
`;
document.head.appendChild(style);


/* ========================= 6. API CONFIGURATION SECTION ========================= */
const apiForm = document.getElementById("apiForm");
const clearBtn = document.getElementById("clear-api");

// Load saved API keys from localStorage on startup
document.addEventListener("DOMContentLoaded", loadApiKeys);

function loadApiKeys() {
  const keys = JSON.parse(localStorage.getItem("apiKeys") || "{}");
  const platforms = ["facebook", "linkedin", "instagram", "twitter"];

  platforms.forEach((p) => {
    const input = document.getElementById(`${p}-api`);
    const status = document.getElementById(`${p}-status`);
    if (!input || !status) return;

    if (keys[p]) {
      input.value = keys[p];
      status.textContent = "✅ Connected";
      status.classList.add("connected");
      status.classList.remove("disconnected");
    } else {
      status.textContent = "❌ Not Connected";
      status.classList.add("disconnected");
      status.classList.remove("connected");
    }
  });
}

// Save API keys to localStorage
if (apiForm) {
  apiForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const keys = {
      facebook: document.getElementById("facebook-api").value.trim(),
      linkedin: document.getElementById("linkedin-api").value.trim(),
      instagram: document.getElementById("instagram-api").value.trim(),
      twitter: document.getElementById("twitter-api").value.trim(),
    };

    localStorage.setItem("apiKeys", JSON.stringify(keys));

    loadApiKeys();
    alert("✅ API tokens saved locally!");
  });
}

// Clear all API keys
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all API tokens?")) {
      localStorage.removeItem("apiKeys");
      loadApiKeys();
      alert("🧹 All API tokens cleared!");
    }
  });
}

