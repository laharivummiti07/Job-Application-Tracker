import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "jobApplications";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  status: "Applied",
  appliedDate: "",
  jobType: "Full-time",
  notes: ""
};

const demoJobs = [
  {
    id: crypto.randomUUID(),
    company: "TCS",
    role: "Software Engineer",
    location: "Hyderabad",
    status: "Applied",
    appliedDate: "2026-09-20",
    jobType: "Full-time",
    notes: "Campus hiring"
  },
  {
    id: crypto.randomUUID(),
    company: "ServiceNow",
    role: "Associate Developer",
    location: "Remote",
    status: "Interview",
    appliedDate: "2026-09-18",
    jobType: "Full-time",
    notes: "Technical round scheduled"
  }
];

function App() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : demoJobs;
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === "Applied").length,
      interview: jobs.filter(j => j.status === "Interview").length,
      offer: jobs.filter(j => j.status === "Offer").length,
      rejected: jobs.filter(j => j.status === "Rejected").length
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(job => {
      const text = `${job.company} ${job.role} ${job.location}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    });

    return result;
  }, [jobs, search, statusFilter, sortBy]);

  function validate() {
    const newErrors = {};
    if (!form.company.trim()) newErrors.company = "Company is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.appliedDate) newErrors.appliedDate = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setJobs(prev =>
        prev.map(job =>
          job.id === editingId ? { ...form, id: editingId } : job
        )
      );
      setEditingId(null);
    } else {
      setJobs(prev => [{ ...form, id: crypto.randomUUID() }, ...prev]);
    }

    setForm(emptyForm);
    setErrors({});
  }

  function handleEdit(job) {
    setForm({
      company: job.company,
      role: job.role,
      location: job.location,
      status: job.status,
      appliedDate: job.appliedDate,
      jobType: job.jobType,
      notes: job.notes
    });
    setEditingId(job.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (window.confirm("Delete this application?")) {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="header">
        <div>
          <h1>Job Application Tracker</h1>
          <p>Track your applications, interviews and offers in one place.</p>
        </div>
        <button className="theme-btn" onClick={() => setDarkMode(v => !v)}>
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="container">
        <section className="stats">
          <Stat title="Total" value={stats.total} />
          <Stat title="Applied" value={stats.applied} />
          <Stat title="Interview" value={stats.interview} />
          <Stat title="Offers" value={stats.offer} />
          <Stat title="Rejected" value={stats.rejected} />
        </section>

        <section className="card form-card">
          <div className="section-title">
            <h2>{editingId ? "Edit Application" : "Add Application"}</h2>
            {editingId && (
              <button className="secondary" onClick={cancelEdit}>Cancel</button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Field label="Company" error={errors.company}>
                <input
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. TCS"
                />
              </Field>

              <Field label="Job Role" error={errors.role}>
                <input
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
              </Field>

              <Field label="Location">
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Hyderabad"
                />
              </Field>

              <Field label="Application Status">
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </Field>

              <Field label="Applied Date" error={errors.appliedDate}>
                <input
                  type="date"
                  value={form.appliedDate}
                  onChange={e => setForm({ ...form, appliedDate: e.target.value })}
                />
              </Field>

              <Field label="Job Type">
                <select
                  value={form.jobType}
                  onChange={e => setForm({ ...form, jobType: e.target.value })}
                >
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Add interview details, recruiter notes, etc."
                rows="3"
              />
            </Field>

            <button className="primary" type="submit">
              {editingId ? "Update Application" : "Add Application"}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="toolbar">
            <input
              className="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search company, role or location..."
            />

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="company">Company A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <h3>No applications found</h3>
              <p>Try changing your search/filter or add a new application.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id}>
                      <td><strong>{job.company}</strong></td>
                      <td>{job.role}</td>
                      <td>{job.location || "—"}</td>
                      <td><span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span></td>
                      <td>{job.appliedDate}</td>
                      <td>{job.jobType}</td>
                      <td className="actions">
                        <button onClick={() => handleEdit(job)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(job.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <small className="error">{error}</small>}
    </div>
  );
}

export default App;