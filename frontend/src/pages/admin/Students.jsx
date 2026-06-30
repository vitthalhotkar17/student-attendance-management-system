import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { Plus, Trash2, Search, Edit2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = { name: "", email: "", rollNo: "", department: "", year: 1, contact: "", password: "student123" };

export default function AdminStudents() {
  const [list, setList]     = useState([]);
  const [q, setQ]           = useState("");
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null); // student being edited
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/students");
      setList(data.data?.students || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/students", form);
      toast.success("Student added successfully");
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const startEdit = (student) => {
    setEditing({ ...student });
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/students/${editing._id}`, editing);
      toast.success("Student updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("Student deleted");
      load();
    } catch (err) { toast.error(err.message); }
  };

  const filtered = list.filter((u) =>
    (u.name + u.email + u.rollNo).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "grid", placeItems: "center", backdropFilter: "blur(4px)" }}>
          <div className="card" style={{ width: 480, padding: 28, position: "relative" }}>
            <button onClick={() => setEditing(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Edit Student</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["name","Full Name"],["email","Email"],["rollNo","Roll No."],["department","Department"],["contact","Contact"]].map(([field, label]) => (
                <div key={field}>
                  <div className="label">{label}</div>
                  <input className="input" value={editing[field] || ""} onChange={(e) => setEditing({...editing, [field]: e.target.value})} />
                </div>
              ))}
              <div>
                <div className="label">Year</div>
                <select className="input" value={editing.year || 1} onChange={(e) => setEditing({...editing, year: +e.target.value})}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={loading}><Check size={14} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, alignItems: "start" }}>
        {/* Add form */}
        <form onSubmit={add} className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Add New Student</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["name","Full Name","text"],["email","Email","email"],["rollNo","Roll No.","text"],["department","Department","text"],["contact","Contact Number","text"]].map(([field,placeholder,type]) => (
              <div key={field}>
                <div className="label">{placeholder}</div>
                <input required={field !== "contact"} type={type} className="input" placeholder={placeholder}
                  value={form[field]} onChange={(e) => setForm({...form, [field]: e.target.value})} />
              </div>
            ))}
            <div>
              <div className="label">Year</div>
              <select className="input" value={form.year} onChange={(e) => setForm({...form, year: +e.target.value})}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Default Password</div>
              <input className="input" placeholder="Default password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              <Plus size={15} /> {loading ? "Adding…" : "Add Student"}
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
              All Students <span style={{ color: "var(--muted)", fontWeight: 400 }}>({filtered.length})</span>
            </h3>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input className="input" style={{ paddingLeft: 34, width: 200 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table-base" style={{ width: "100%" }}>
              <thead>
                <tr><th>Name</th><th>Roll</th><th>Dept</th><th>Year</th><th>Contact</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>No students found</td></tr>
                )}
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{u.email}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{u.rollNo}</td>
                    <td>{u.department}</td>
                    <td>{u.year}</td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.contact}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(u)} style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer" }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => remove(u._id)} style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)", color: "#f87171", cursor: "pointer" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
