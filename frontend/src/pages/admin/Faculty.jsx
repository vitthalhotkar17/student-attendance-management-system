import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = { name: "", email: "", department: "", employeeId: "", contact: "", password: "faculty123" };

export default function AdminFaculty() {
  const [list, setList]     = useState([]);
  const [form, setForm]     = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/faculty");
      setList(data.data?.faculty || []);
    } catch (err) { toast.error(err.message); }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/faculty", form);
      toast.success("Faculty added");
      setForm(emptyForm);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/faculty/${editing._id}`, editing);
      toast.success("Faculty updated");
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this faculty member?")) return;
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("Deleted");
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "grid", placeItems: "center", backdropFilter: "blur(4px)" }}>
          <div className="card" style={{ width: 460, padding: 28, position: "relative" }}>
            <button onClick={() => setEditing(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={18} /></button>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Edit Faculty</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["name","Full Name"],["email","Email"],["department","Department"],["employeeId","Employee ID"],["contact","Contact"]].map(([field,label]) => (
                <div key={field}>
                  <div className="label">{label}</div>
                  <input className="input" value={editing[field] || ""} onChange={(e) => setEditing({...editing,[field]:e.target.value})} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={loading}><Check size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* Add form */}
        <form onSubmit={add} className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Add Faculty</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["name","Full Name","text"],["email","Email","email"],["department","Department","text"],["employeeId","Employee ID","text"],["contact","Contact Number","text"]].map(([field,placeholder,type]) => (
              <div key={field}>
                <div className="label">{placeholder}</div>
                <input required={field !== "contact" && field !== "employeeId"} type={type} className="input" placeholder={placeholder}
                  value={form[field]} onChange={(e) => setForm({...form,[field]:e.target.value})} />
              </div>
            ))}
            <div>
              <div className="label">Default Password</div>
              <input className="input" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              <Plus size={15} /> {loading ? "Adding…" : "Add Faculty"}
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            All Faculty <span style={{ color: "var(--muted)", fontWeight: 400 }}>({list.length})</span>
          </h3>
          <table className="table-base" style={{ width: "100%" }}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Department</th><th>Employee ID</th><th>Contact</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)" }}>No faculty members yet</td></tr>
              )}
              {list.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600, color: "var(--text)" }}>{u.name}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</td>
                  <td>{u.department}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{u.employeeId || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{u.contact}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setEditing(u)} style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer" }}><Edit2 size={13} /></button>
                      <button onClick={() => remove(u._id)} style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)", color: "#f87171", cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
