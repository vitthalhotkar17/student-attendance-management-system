import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/api.js";
import toast from "react-hot-toast";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, rollNo: user.rollNo, department: user.department, year: user.year });
  const save = (e) => {
    e.preventDefault();
    const users = db.get("users").map((u) => (u.id === user.id ? { ...u, ...form } : u));
    db.set("users", users);
    updateUser(form);
    toast.success("Profile updated");
  };
  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-4">
      <h3 className="font-display font-bold">Edit Profile</h3>
      {["name","email","rollNo","department"].map((k) => (
        <div key={k}>
          <label className="label capitalize">{k}</label>
          <input required className="input" value={form[k] || ""} onChange={(e)=>setForm({...form,[k]:e.target.value})}/>
        </div>
      ))}
      <div>
        <label className="label">Year</label>
        <select className="input" value={form.year} onChange={(e)=>setForm({...form,year:+e.target.value})}>
          {[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>
      <button className="btn-primary">Save changes</button>
    </form>
  );
}
