
// ========= Config =========
const API_KEY = 'BFTBjzcn7K3QfXONJ2eWYw==zmL8MApeL0JSN6fb';
const API_URL = 'https://api.api-ninjas.com/v2/recipe';

// Keep results in memory to show details without a second fetch
let currentResults = [];

// Tiny sanitizer to avoid HTML injection in titles, etc.
const escapeHTML = (s) =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ========= Search handler =========
document.querySelector(".search-btn").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  // Clear previous content
  document.getElementById("recipe-list").innerHTML = "";
  document.getElementById("recipe-detail").classList.add("hidden");
  document.getElementById("ingredient-list").innerHTML = "";
  document.getElementById("technique-text").innerHTML = "";
  document.getElementById("recipe-title").innerHTML = "";

  try {
    const resp = await fetch(`${API_URL}?title=${encodeURIComponent(query)}`,
      {headers: { 'X-Api-Key': API_KEY }
    });
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const recipes = await resp.json(); // API Ninjas returns an array

    currentResults = Array.isArray(recipes) ? recipes : [];

    const recipeList = document.getElementById("recipe-list");
    if (currentResults.length) {
      currentResults.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
          <h4>${escapeHTML(item.title)}</h4>
          <p><small>${escapeHTML(item.servings) || ''}</small></p>
          <button class="view-btn" data-idx="${idx}">View Details</button>
        `;
        recipeList.appendChild(card);
      });
    } else {
      document.getElementById("recipe-list").innerHTML = "<p>No recipes found.</p>";
    }

    document.getElementById("recipe-list").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    document.getElementById("recipe-list").innerHTML =
      "<p>Sorry, something went wrong fetching recipes.</p>";
  }
});

// ========= Details handler =========
document.getElementById("recipe-list").addEventListener("click", (e) => {
  if (!e.target.classList.contains("view-btn")) return;

  const idx = Number(e.target.getAttribute("data-idx"));
  const meal = currentResults[idx];
  if (!meal) return;

  document.getElementById("recipe-title").innerText = meal.title || "Recipe";

  // Ingredients (API Ninjas returns an array of strings)
  const ingredientsList = document.getElementById("ingredient-list");
  ingredientsList.innerHTML = "";
  (meal.ingredients || []).forEach((ing) => {
    const li = document.createElement("li");
    li.textContent = ing;
    ingredientsList.appendChild(li);
  });

  // Instructions
  document.getElementById("technique-text").innerText = meal.instructions || "—";

  // Toggle views
  document.getElementById("recipe-detail").classList.remove("hidden");
  document.getElementById("recipe-list").classList.add("hidden");
});

