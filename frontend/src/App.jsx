
import { useEffect, useState } from "react";
import "./App.css";

const API = "/api/recipes";
const emptyRecipe = {
  name: "",
  category: "Breakfast",
  ingredients: "",
  steps: "",
  cookingTime: ""
};

const categories = [
  "All", "Breakfast", "Lunch", "Dinner",
  "Snack", "Dessert", "Other"
];

const icons = {
  Breakfast: "🍳",
  Lunch: "🥗",
  Dinner: "🍝",
  Snack: "🥪",
  Dessert: "🍰",
  Other: "🍲"
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState(emptyRecipe);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadRecipes() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load recipes.");
      const data = await response.json();
      setRecipes(data);
    } catch {
      setError(
        "Cannot connect to the server. Start the backend and check your database connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function startAdd() {
    setForm(emptyRecipe);
    setEditingId(null);
    setSelected(null);
    setShowForm(true);
    setMessage("");
  }

  function startEdit(recipe) {
    setForm({
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: String(recipe.cookingTime)
    });
    setEditingId(recipe._id);
    setSelected(null);
    setShowForm(true);
    setMessage("");
  }

  async function saveRecipe(event) {
    event.preventDefault();
    setMessage("");

    const cookingTime = Number(form.cookingTime);

    if (
      !form.name.trim() ||
      !form.ingredients.trim() ||
      !form.steps.trim() ||
      !Number.isInteger(cookingTime) ||
      cookingTime < 1
    ) {
      setMessage("Fill in every field and enter a positive whole cooking time.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      ingredients: form.ingredients.trim(),
      steps: form.steps.trim(),
      cookingTime
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save recipe.");
      }

      setShowForm(false);
      setForm(emptyRecipe);
      setEditingId(null);
      setMessage(editingId ? "Recipe updated successfully!" : "Recipe added successfully!");
      await loadRecipes();
    } catch (err) {
      setMessage(err.message || "Unable to connect to the server.");
    }
  }

  async function deleteRecipe(recipe) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${recipe.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${recipe._id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete recipe.");
      }

      setSelected(null);
      setMessage("Recipe deleted successfully!");
      await loadRecipes();
    } catch (err) {
      setMessage(err.message || "Unable to delete recipe.");
    }
  }

  const visibleRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || recipe.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home" onClick={() => {
          setSelected(null);
          setShowForm(false);
        }}>
          <span className="brand-icon">♨</span>
          <span>little<span className="brand-accent"> thyme</span></span>
        </a>

        <nav>
          <a href="#home" onClick={() => {
            setSelected(null);
            setShowForm(false);
          }}>My Recipes</a>
          <button className="nav-add" onClick={startAdd}>
            + Add Recipe
          </button>
        </nav>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR PERSONAL RECIPE COLLECTION</span>
            <h1>Good food.<br />Beautiful <em>memories.</em></h1>
            <p>
              Keep your favourite recipes in one place.
              Discover, save and revisit the meals you love.
            </p>
            <button className="primary-btn" onClick={startAdd}>
              + Add your first recipe
            </button>
          </div>

          <div className="hero-art" aria-label="Illustration of a bowl of food">
            <div className="art-circle">
              <span className="art-sprig">✳</span>
              <span className="art-food">🥑</span>
              <span className="art-food art-food-two">🍅</span>
              <span className="art-food art-food-three">🥬</span>
              <span className="art-food art-food-four">🥕</span>
              <span className="art-bowl">🥗</span>
            </div>
            <span className="art-note">Made with love ♡</span>
          </div>
        </section>

        <section className="collection">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>{selected ? selected.name : "Your recipe book"}</h2>
              <p>
                {selected
                  ? "A closer look at your delicious creation."
                  : `${recipes.length} recipe${recipes.length === 1 ? "" : "s"} saved and counting`}
              </p>
            </div>
            {selected && (
              <button className="secondary-btn" onClick={() => setSelected(null)}>
                ← All recipes
              </button>
            )}
          </div>

          {message && (
            <div className="notice" role="status">
              {message}
              <button onClick={() => setMessage("")} aria-label="Dismiss">×</button>
            </div>
          )}

          {selected ? (
            <article className="detail-card">
              <div className="detail-banner">
                <span className="detail-emoji">
                  {icons[selected.category] || "🍲"}
                </span>
                <div>
                  <span className="category-label">{selected.category}</span>
                  <h3>{selected.name}</h3>
                  <span>◷ {selected.cookingTime} minutes</span>
                </div>
              </div>

              <div className="detail-content">
                <div>
                  <h3>Ingredients</h3>
                  <ul className="ingredient-list">
                    {selected.ingredients.split(/\n|,/).filter(Boolean).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Preparation steps</h3>
                  <ol className="steps-list">
                    {selected.steps.split(/\n/).filter(Boolean).map((step, index) => (
                      <li key={index}>{step.trim()}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="detail-actions">
                <button className="secondary-btn" onClick={() => startEdit(selected)}>
                  ✎ Edit recipe
                </button>
                <button className="delete-btn" onClick={() => deleteRecipe(selected)}>
                  Delete recipe
                </button>
              </div>
            </article>
          ) : (
            <>
              <div className="toolbar">
                <label className="search-box">
                  <span>⌕</span>
                  <input
                    type="search"
                    placeholder="Search your recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <span className="recipe-count">{visibleRecipes.length} recipes</span>
              </div>

              <div className="category-tabs">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={category === item ? "category-tab active" : "category-tab"}
                    onClick={() => setCategory(item)}
                  >
                    {item === "All" ? "✦ " : `${icons[item] || ""} `}
                    {item}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="empty-state">
                  <span>🥣</span>
                  <h3>Preparing your recipe book...</h3>
                </div>
              ) : error ? (
                <div className="empty-state error-state">
                  <span>🔌</span>
                  <h3>Your recipe server isn't connected yet</h3>
                  <p>{error}</p>
                  <button className="primary-btn" onClick={loadRecipes}>
                    Try again
                  </button>
                </div>
              ) : visibleRecipes.length === 0 ? (
                <div className="empty-state">
                  <span>🍃</span>
                  <h3>{recipes.length ? "No recipes found" : "Your collection starts here"}</h3>
                  <p>
                    {recipes.length
                      ? "Try another search or category."
                      : "Save a favourite meal and it will appear here."}
                  </p>
                  {!recipes.length && (
                    <button className="primary-btn" onClick={startAdd}>
                      + Add a recipe
                    </button>
                  )}
                </div>
              ) : (
                <div className="recipe-grid">
                  {visibleRecipes.map((recipe) => (
                    <article className="recipe-card" key={recipe._id}>
                      <button
                        className={`recipe-cover cover-${categories.indexOf(recipe.category) % 5}`}
                        onClick={() => setSelected(recipe)}
                        aria-label={`View ${recipe.name}`}
                      >
                        <span className="cover-emoji">
                          {icons[recipe.category] || "🍲"}
                        </span>
                        <span className="cover-category">{recipe.category}</span>
                        <span className="cover-open">↗</span>
                      </button>

                      <div className="recipe-card-body">
                        <button className="recipe-title" onClick={() => setSelected(recipe)}>
                          {recipe.name}
                        </button>
                        <div className="recipe-meta">
                          <span>◷ {recipe.cookingTime} min</span>
                          <span>♡ Saved recipe</span>
                        </div>
                        <div className="card-actions">
                          <button className="text-action" onClick={() => setSelected(recipe)}>
                            View details →
                          </button>
                          <button
                            className="icon-action"
                            onClick={() => startEdit(recipe)}
                            aria-label={`Edit ${recipe.name}`}
                          >✎</button>
                          <button
                            className="icon-action delete-icon"
                            onClick={() => deleteRecipe(recipe)}
                            aria-label={`Delete ${recipe.name}`}
                          >×</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#home">little<span className="brand-accent"> thyme</span> ♡</a>
        <p>A little place for the recipes you love.</p>
      </footer>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowForm(false);
        }}>
          <section className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">FROM YOUR KITCHEN</span>
                <h2 id="form-title">{editingId ? "Edit recipe" : "Add a recipe"}</h2>
                <p>Every good meal starts with a little love.</p>
              </div>
              <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button>
            </div>

            {message && <div className="notice">{message}</div>}

            <form className="recipe-form" onSubmit={saveRecipe}>
              <label>
                Recipe name
                <input
                  required
                  maxLength={100}
                  placeholder="e.g. Creamy tomato pasta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.filter((item) => item !== "All").map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Cooking time (minutes)
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30"
                    value={form.cookingTime}
                    onChange={(e) => setForm({ ...form, cookingTime: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Ingredients
                <textarea
                  required
                  rows="4"
                  maxLength={10000}
                  placeholder={"One ingredient per line\n2 tomatoes\n1 onion\n1 tbsp olive oil"}
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                />
              </label>

              <label>
                Preparation steps
                <textarea
                  required
                  rows="5"
                  maxLength={15000}
                  placeholder={"Write each step on a new line...\n1. Prepare your ingredients.\n2. Cook and season to taste."}
                  value={form.steps}
                  onChange={(e) => setForm({ ...form, steps: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Save changes" : "Save recipe"} →
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
