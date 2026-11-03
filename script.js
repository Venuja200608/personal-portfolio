
const $ = (selector) => document.querySelector(selector);


function safe(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}


const html = document.documentElement;
const themeBtn = $("#themeBtn");

function setTheme(theme) {
  html.setAttribute("data-bs-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
setTheme(savedTheme || "light");

themeBtn.addEventListener("click", () => {
  setTheme(html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
});

// ===== 2. Animate skill bars when they scroll into view =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width;
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".bar-brand").forEach((bar) => observer.observe(bar));

let repos = [];

async function loadRepos() {
  const user = $("#username").value.trim();
  const status = $("#status");
  const box = $("#repos");

  if (!user) {
    status.textContent = "Please enter a GitHub username.";
    return;
  }

  status.textContent = "Loading repositories...";
  box.innerHTML = "";

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=9`);

    if (response.status === 404) throw new Error(`No GitHub user called "${user}".`);
    if (!response.ok) throw new Error("GitHub is busy. Please try again in a few minutes.");

    repos = await response.json();
    status.textContent = repos.length ? "" : `${user} has no public repositories yet.`;
    showRepos();
  } catch (error) {
    status.textContent = error.message === "Failed to fetch"
      ? "Could not reach GitHub. Check your internet connection."
      : error.message;
  }
}

function showRepos() {
  // Build one Bootstrap card for each repository
  $("#repos").innerHTML = repos.map((repo) => `
    <div class="col-md-6 col-lg-4">
      <button class="card repo-card w-100 p-0" data-id="${repo.id}">
        <div class="card-body">
          ${repo.language ? `<span class="badge lang-tag mb-2">${safe(repo.language)}</span>` : ""}
          <h3 class="card-title fs-5">${safe(repo.name)}</h3>
          <p class="card-text text-body-secondary">${safe(repo.description || "No description yet.")}</p>
        </div>
        <div class="card-footer text-body-secondary small">★ ${repo.stargazers_count} &nbsp; ⑂ ${repo.forks_count}</div>
      </button>
    </div>`).join("");
}

const modal = new bootstrap.Modal($("#repoModal"));

$("#repos").addEventListener("click", (event) => {
  const card = event.target.closest(".repo-card");
  if (!card) return;

  const repo = repos.find((r) => r.id == card.dataset.id);
  $("#modalTitle").textContent = repo.name;
  $("#modalDesc").textContent = repo.description || "No description yet.";
  $("#modalInfo").innerHTML = `
    <li><strong>Language:</strong> ${safe(repo.language || "Not set")}</li>
    <li><strong>Stars:</strong> ${repo.stargazers_count}</li>
    <li><strong>Forks:</strong> ${repo.forks_count}</li>
    <li><strong>Last updated:</strong> ${new Date(repo.pushed_at).toLocaleDateString()}</li>`;
  $("#modalLink").href = repo.html_url;
  modal.show();
});

$("#loadBtn").addEventListener("click", loadRepos);
$("#username").addEventListener("keydown", (e) => { if (e.key === "Enter") loadRepos(); });
loadRepos();   // load once when the page opens

$("#contactForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const message = $("#formMsg");

  form.classList.add("was-validated");

  if (form.checkValidity()) {
    message.textContent = `Thanks, ${$("#name").value.trim()}! Your message is ready to send.`;
    form.reset();
    form.classList.remove("was-validated");
  } else {
    message.textContent = "";
  }

$("#year").textContent = new Date().getFullYear();
