import React, { useEffect, useState } from "react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    tech: "",
    screenshot: null
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        setError("Could not load projects.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProjects();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "screenshot") {
      setForm({ ...form, screenshot: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      let projectRes;
      if (editingId) {
        // Update
        projectRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            link: form.link,
            tech: form.tech,
          }),
        });
      } else {
        // Create
        projectRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            link: form.link,
            tech: form.tech,
          }),
        });
      }
      if (!projectRes.ok) throw new Error("Failed to save project");
      const { project } = await projectRes.json();
      let newProject = project;
      // Handle screenshot upload
      if (form.screenshot) {
        const fd = new FormData();
        fd.append("screenshot", form.screenshot);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project._id}/screenshot`, {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: fd,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          newProject = uploadData.project;
        }
      }
      if (editingId) {
        setProjects((prev) => prev.map((p) => (p._id === editingId ? newProject : p)));
      } else {
        setProjects((prev) => [newProject, ...prev]);
      }
      setForm({ title: "", description: "", link: "", tech: "", screenshot: null });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError("Could not save project.");
    }
  };

  const handleEdit = (proj) => {
    setForm({
      title: proj.title,
      description: proj.description,
      link: proj.link,
      tech: proj.tech,
      screenshot: null,
    });
    setEditingId(proj._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error();
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Could not delete project.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">Your Projects Portfolio</h1>
        <p className="text-gray-600 mb-6">Showcase your coding projects! Add links, descriptions, tech stacks, and screenshots to build your portfolio.</p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
            setForm({ title: "", description: "", link: "", tech: "", screenshot: null });
          }}
        >
          {showForm ? "Cancel" : "Add New Project"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col gap-3" encType="multipart/form-data">
            <input
              className="border rounded px-3 py-2"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Project Title"
              required
            />
            <textarea
              className="border rounded px-3 py-2"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short Description"
              rows={3}
            />
            <input
              className="border rounded px-3 py-2"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="Project Link (GitHub, Live Demo, etc.)"
              type="url"
            />
            <input
              className="border rounded px-3 py-2"
              name="tech"
              value={form.tech}
              onChange={handleChange}
              placeholder="Tech Stack (comma separated)"
            />
            <input
              className="border rounded px-3 py-2"
              name="screenshot"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" type="submit">
              {editingId ? "Update Project" : "Add Project"}
            </button>
          </form>
        )}
        <div>
          {loading ? (
            <div className="text-indigo-600 text-center">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-gray-500 text-center">No projects yet. Add your first project!</div>
          ) : (
            <ul className="space-y-4">
              {projects.map((proj) => (
                <li key={proj._id} className="bg-white rounded-xl shadow p-5 relative">
                  <button
                    className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                    onClick={() => handleDelete(proj._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="absolute top-2 right-16 text-xs text-indigo-500 hover:underline"
                    onClick={() => handleEdit(proj)}
                  >
                    Edit
                  </button>
                  <h2 className="text-xl font-bold text-indigo-700 mb-1">{proj.title}</h2>
                  <p className="text-gray-700 mb-2">{proj.description}</p>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mb-2 inline-block"
                    >
                      View Project
                    </a>
                  )}
                  {proj.tech && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-semibold">Tech Stack:</span> {proj.tech}
                    </div>
                  )}
                  {proj.screenshot && (
                    <div className="mt-2">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${proj.screenshot}`}
                        alt="Screenshot"
                        className="rounded shadow max-h-48 border"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}