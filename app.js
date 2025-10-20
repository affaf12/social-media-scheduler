/* ========================= 1. TAG DROPDOWN FUNCTION ========================= */
function initTagDropdown(dropdownId, btnId, contentId, tagContainerId) {
  const dropdown = document.getElementById(dropdownId);
  const btn = document.getElementById(btnId);
  const content = document.getElementById(contentId);
  const tagContainer = document.getElementById(tagContainerId);

  const checkboxes = content.querySelectorAll('input[type="checkbox"]');

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
    content.style.display = dropdown.classList.contains('show') ? 'block' : 'none';
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
      content.style.display = 'none';
    }
  });

  // Handle checkbox selection
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateTags);
  });

  // Update tags function
  function updateTags() {
    tagContainer.innerHTML = '';
    const selected = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selected.push(checkbox.value);
        const chip = document.createElement('span');
        chip.classList.add('tag-chip');
        chip.textContent = checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1);

        // Remove icon
        const remove = document.createElement('i');
        remove.textContent = '×';
        remove.addEventListener('click', () => {
          checkbox.checked = false;
          updateTags();
        });
        chip.appendChild(remove);
        tagContainer.appendChild(chip);
      }
    });

    // Update button text
    btn.textContent = selected.length ? selected.join(', ') : btn.getAttribute('data-default');
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-chevron-down');
    btn.appendChild(icon);
  }

  // Initialize with default text
  btn.setAttribute('data-default', btn.textContent);
}

/* ========================= 2. INITIALIZE DROPDOWNS ========================= */
document.addEventListener('DOMContentLoaded', () => {
  // Platforms dropdown
  initTagDropdown('platform-dropdown', 'platform-btn', 'platform-options', 'platform-tags');

  // Groups dropdown(s)
  const groupDropdowns = document.querySelectorAll('.group-dropdown:not(#platform-dropdown)');
  groupDropdowns.forEach((drop, index) => {
    const tagContainer = drop.querySelector('.tag-container');
    const btn = drop.querySelector('.dropdown-btn');
    const content = drop.querySelector('.dropdown-content');

    // Assign unique IDs
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
const imageInput = document.getElementById('image');
const videoInput = document.getElementById('video');
const previewImage = document.getElementById('preview-image');
const previewVideo = document.getElementById('preview-video');

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = 'block';
  } else {
    previewImage.style.display = 'none';
  }
});

videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    previewVideo.src = URL.createObjectURL(file);
    previewVideo.style.display = 'block';
  } else {
    previewVideo.style.display = 'none';
  }
});

/* ========================= 4. FORM SUBMISSION & DASHBOARD UPDATE ========================= */
const form = document.getElementById("postForm");
const dashboardBody = document.querySelector('#dashboard tbody');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get selected platforms
  const platformCheckboxes = document.querySelectorAll('#platform-options input[type="checkbox"]');
  const selectedPlatforms = Array.from(platformCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  // Get selected groups
  const groupCheckboxes = document.querySelectorAll('.group-dropdown .dropdown-content input[type="checkbox"]');
  const selectedGroups = Array.from(groupCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

  const post = {
    text: document.getElementById("text").value,
    platform: selectedPlatforms,
    groups: selectedGroups,
    tags: document.getElementById("tags").value,
    priority: document.getElementById("priority").value,
    time: document.getElementById("time").value,
  };

  try {
    const res = await fetch("https://social-media-scheduler-seven.vercel.app/add-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    const data = await res.json();
    document.getElementById("status").innerText = data.message;

    // ========================= UPDATE DASHBOARD =========================
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
      <td>${post.text}</td>
      <td>${post.platform.join(', ')}</td>
      <td>${post.groups.join(', ')}</td>
      <td>${post.time}</td>
      <td>${post.priority}</td>
    `;

    // Remove placeholder row if exists
    const emptyRow = dashboardBody.querySelector('tr td[colspan="5"]');
    if (emptyRow) dashboardBody.innerHTML = '';

    dashboardBody.appendChild(newRow);

  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Error sending post. Try again!";
  }
});
