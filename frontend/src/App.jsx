import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/expenses";

const emptyForm = {
  description: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "Gotovina",
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Iskanje in filtriranje
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  async function loadExpenses() {
    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error("Napaka pri nalaganju stroškov.");
      }
      setExpenses(await response.json());
      setError("");
    } catch {
      setError(
        "Povezava z backendom ni uspela. Preveri, ali Spring Boot deluje."
      );
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function applySearchAndFilter(search = searchText, category = selectedCategory) {
    try {
      setError("");

      let url = API;

      if (search.trim()) {
        url = `${API}/search?description=${encodeURIComponent(search.trim())}`;
      } else if (category) {
        url = `${API}/filter?category=${encodeURIComponent(category)}`;
      }

      // Ce sta izbrana oba pogoja, uporabimo oba nad rezultati.
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Iskanje ali filtriranje ni uspelo.");
      }

      let results = await response.json();

      if (search.trim() && category) {
        results = results.filter(
          (expense) =>
            expense.category?.toLowerCase() === category.toLowerCase()
        );
      } else if (!search.trim() && !category) {
        results = results;
      }

      setExpenses(results);
    } catch (err) {
      setError(err.message || "Prišlo je do napake.");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    try {
      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Shranjevanje ni uspelo.");
      }

      setMessage(
        editingId === null
          ? "Strošek je dodan."
          : "Strošek je posodobljen."
      );
      setForm(emptyForm);
      setEditingId(null);
      await applySearchAndFilter();
    } catch (err) {
      setError(err.message || "Prišlo je do napake.");
    }
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({
      description: expense.description ?? "",
      amount: String(expense.amount ?? ""),
      category: expense.category ?? "",
      date: expense.date ?? "",
      paymentMethod: expense.paymentMethod ?? "Gotovina",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExpense(id) {
    if (!window.confirm("Ali res želiš izbrisati ta strošek?")) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Brisanje ni uspelo.");

      setMessage("Strošek je izbrisan.");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await applySearchAndFilter();
    } catch (err) {
      setError(err.message || "Prišlo je do napake.");
    }
  }

  function resetSearchAndFilter() {
    setSearchText("");
    setSelectedCategory("");
    loadExpenses();
  }

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const categories = [
    ...new Set(expenses.map((expense) => expense.category).filter(Boolean)),
  ];

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">OSEBNI FINANČNI PREGLED</p>
        <h1>Moji stroški</h1>
        <p>Enostavno spremljaj svoje vsakodnevne izdatke.</p>
      </header>

      <section className="summary">
        <div>
          <span>Število prikazanih stroškov</span>
          <strong>{expenses.length}</strong>
        </div>
        <div>
          <span>Skupni znesek prikazanih stroškov</span>
          <strong>
            {total.toLocaleString("sl-SI", {
              style: "currency",
              currency: "EUR",
            })}
          </strong>
        </div>
      </section>

      <section className="panel">
        <h2>{editingId === null ? "Dodaj strošek" : "Uredi strošek"}</h2>

        <form onSubmit={handleSubmit} className="expense-form">
          <label>
            Opis
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Npr. Kosilo"
              required
            />
          </label>

          <label>
            Znesek (€)
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0,00"
              required
            />
          </label>

          <label>
            Kategorija
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Npr. Hrana"
              required
            />
          </label>

          <label>
            Datum
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Način plačila
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Gotovina">Gotovina</option>
              <option value="Kartica">Kartica</option>
              <option value="Nakazilo">Nakazilo</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="primary">
              {editingId === null ? "Dodaj strošek" : "Shrani spremembe"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Prekliči
              </button>
            )}
          </div>
        </form>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Iskanje in filtriranje stroškov</h2>

        <div className="expense-form">
          <label>
            Iskanje po opisu
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Npr. Kafe"
            />
          </label>

          <label>
            Filtriranje po kategoriji
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">Vse kategorije</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="primary"
              onClick={() => applySearchAndFilter()}
            >
              Išči / filtriraj
            </button>
            <button
              type="button"
              className="secondary"
              onClick={resetSearchAndFilter}
            >
              Ponastavi
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Pregled stroškov</h2>

        {expenses.length === 0 ? (
          <p>Ni stroškov, ki ustrezajo izbranim pogojem.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Opis</th>
                  <th>Znesek</th>
                  <th>Kategorija</th>
                  <th>Datum</th>
                  <th>Način plačila</th>
                  <th>Dejanja</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>
                      {Number(expense.amount).toLocaleString("sl-SI", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                    <td>{expense.category}</td>
                    <td>{expense.date}</td>
                    <td>{expense.paymentMethod}</td>
                    <td className="actions">
                      <button
                        className="secondary small"
                        onClick={() => startEdit(expense)}
                      >
                        Uredi
                      </button>
                      <button
                        className="danger small"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Izbriši
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>Moji stroški · Pregled osebnih financ</footer>
    </main>
  );
}

export default App;
