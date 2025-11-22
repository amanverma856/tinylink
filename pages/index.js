import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url,
        customCode: customCode || undefined,
      }),
    });

    const data = await res.json();

    if (res.status === 201) {
      setUrl("");
      setCustomCode("");
      fetchLinks();
    } else {
      setError(data.error || "Something went wrong");
    }

    setLoading(false);
  }

  async function deleteLink(code) {
    const sure = confirm(`Delete link "${code}"?`);

    if (!sure) return;

    const res = await fetch(`/api/links/${code}`, {
      method: "DELETE",
    });

    if (res.status === 204) {
      fetchLinks();
    } else {
      alert("Failed to delete");
    }
  }

  return (
    <div className="container">

      <h1>TinyLink Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: 300, marginRight: 10 }}
        />

        <input
          type="text"
          placeholder="Custom code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Link"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <h2>All Links</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Code</th>
            <th>URL</th>
            <th>Clicks</th>
            <th>Last Clicked</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>
                <a href={`/${link.shortCode}`} target="_blank" rel="noreferrer">
                  {link.shortCode}
                </a>
              </td>

              <td style={{ maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis" }}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.url}
                </a>
              </td>

              <td>{link.clicks}</td>

              <td>
                {link.lastClicked
                  ? new Date(link.lastClicked).toLocaleString()
                  : "—"}
              </td>

              <td>
                <button onClick={() => deleteLink(link.shortCode)}>
                  Delete
                </button>
                <a
                  href={`/code/${link.shortCode}`}
                  style={{ marginLeft: 10 }}
                >
                  View Stats
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
