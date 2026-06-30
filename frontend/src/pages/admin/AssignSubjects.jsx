import { useEffect, useState } from "react";
import { FiCheckCircle, FiUsers, FiBookOpen, FiSave } from "react-icons/fi";
import { assignmentService } from "../../services/assignmentService.js";
import { subjectService } from "../../services/subjectService.js";
import { api } from "../../services/api.js";
import toast from "react-hot-toast";

export default function AssignSubjects() {
  const [facultyList, setFacultyList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: fData }, subjects] = await Promise.all([
          api.get("/admin/faculty"),
          subjectService.getAll(),
        ]);
        setFacultyList(fData.data?.faculty || []);
        setSubjectList(subjects);
        if (fData.data?.faculty?.length) {
          const first = fData.data.faculty[0];
          setSelectedFaculty(first);
          const subs = await assignmentService.getSubjectsForFaculty(first._id);
          setSelectedSubjects(subs);
        }
      } catch (err) { toast.error(err.message); }
    };
    load();
  }, []);

  const handleFacultySelect = async (faculty) => {
    setSelectedFaculty(faculty);
    try {
      const subs = await assignmentService.getSubjectsForFaculty(faculty._id);
      setSelectedSubjects(subs);
    } catch { setSelectedSubjects([]); }
  };

  const toggleSubject = (subjectName) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = async () => {
    if (!selectedFaculty) return;
    setSaving(true);
    try {
      await assignmentService.saveForFaculty(selectedFaculty._id, selectedSubjects);
      toast.success("Subjects assigned successfully.");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="card p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-soft hero-gradient">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-200">Admin Panel</p>
            <h2 className="mt-2 text-3xl font-semibold">Assign Subjects to Faculty</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">Select a faculty member and assign subjects from the database.</p>
          </div>
          {selectedFaculty && (
            <div className="rounded-3xl bg-white/10 p-4 text-sm text-slate-100">
              <div className="font-semibold">Assigned Faculty</div>
              <div className="mt-2 text-lg">{selectedFaculty.name}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          {/* Faculty list */}
          <div className="card p-5">
            <div className="flex items-center gap-3 text-brand-700 mb-4">
              <FiUsers size={20} />
              <h3 className="font-semibold text-slate-900">Select Faculty</h3>
            </div>
            <div className="flex flex-col gap-2">
              {facultyList.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No faculty added yet.</p>}
              {facultyList.map((f) => (
                <button key={f._id}
                  onClick={() => handleFacultySelect(f)}
                  style={{
                    background: selectedFaculty?._id === f._id ? "rgba(99,102,241,0.1)" : "var(--surface2)",
                    border: selectedFaculty?._id === f._id ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border2)",
                    borderRadius: 12, padding: "12px 16px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}>{f.name}</p>
                    <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{f.department}</p>
                  </div>
                  {selectedFaculty?._id === f._id && <FiCheckCircle color="#818cf8" />}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3 text-brand-700">
              <FiBookOpen size={18} />
              <p className="font-semibold text-slate-900">Assignment Summary</p>
            </div>
            <div style={{ borderRadius: 16, border: "1px solid var(--border2)", background: "var(--surface2)", padding: 16 }}>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Faculty</p>
              <p style={{ fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{selectedFaculty?.name || "None selected"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSubjects.length === 0
                  ? <span className="chip chip-muted">No subjects selected</span>
                  : selectedSubjects.map((s) => <span key={s} className="chip chip-blue">{s}</span>)
                }
              </div>
            </div>
            <button onClick={handleSave} className="btn btn-primary w-full" disabled={saving || !selectedFaculty}>
              <FiSave /> {saving ? "Saving…" : "Save Assignment"}
            </button>
          </div>
        </div>

        {/* Subject picker */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4" style={{ color: "var(--text)" }}>Select Subjects</h3>
          {subjectList.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No subjects in database. Add subjects from the Subjects page first.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {subjectList.map((s) => {
                const checked = selectedSubjects.includes(s.name);
                return (
                  <button key={s._id} onClick={() => toggleSubject(s.name)}
                    style={{
                      background: checked ? "rgba(99,102,241,0.1)" : "var(--surface2)",
                      border: checked ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border2)",
                      borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s"
                    }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: checked ? "2px solid #818cf8" : "2px solid var(--border2)", background: checked ? "#818cf8" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: checked ? "#818cf8" : "var(--text)" }}>{s.name}</p>
                      {s.code && <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{s.code}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-4 card p-4" style={{ background: "var(--surface2)" }}>
            <div className="flex items-center gap-3">
              <FiCheckCircle size={18} className="text-emerald-400" />
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>Assignment Rules</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Select subjects from the database. Changes are saved instantly when you click Save Assignment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
