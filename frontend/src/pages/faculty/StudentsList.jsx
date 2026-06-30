import { db } from "../../services/api.js";
export default function StudentsList() {
  const list = db.get("users").filter((u) => u.role === "student");
  return (
    <div className="card p-5">
      <h3 className="font-display font-bold mb-3">All Students</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-100">
          <tr><th className="py-2">Name</th><th>Roll</th><th>Dept</th><th>Year</th><th>Email</th></tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-3 font-medium">{u.name}</td>
              <td>{u.rollNo}</td><td>{u.department}</td><td>{u.year}</td>
              <td className="text-slate-500">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
