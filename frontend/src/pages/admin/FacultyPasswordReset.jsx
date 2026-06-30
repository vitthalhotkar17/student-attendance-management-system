import { useState } from "react";
import { db } from "../../services/api.js";
import { authService } from "../../services/authService.js";
import toast from "react-hot-toast";
import PasswordInput from "../../components/PasswordInput.jsx";

export default function FacultyPasswordReset() {
  const users = db.get("users").filter((u) => u.role === "faculty");
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { await authService.resetPassword(userId, pwd); toast.success("Password updated"); setPwd(""); }
    catch (err) { toast.error(err.message); }
  };
  return (
    <form onSubmit={submit} className="card p-6 max-w-xl space-y-4">
      <h3 className="font-display font-bold">Faculty password reset</h3>
      <div>
        <label className="label">Faculty</label>
        <select required className="input" value={userId} onChange={(e)=>setUserId(e.target.value)}>
          <option value="">Select faculty</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
        </select>
      </div>
      <PasswordInput
        id="new-password"
        name="new-password"
        label="New password"
        required
        minLength={6}
        value={pwd}
        onChange={(e)=>setPwd(e.target.value)}
      />
      <button className="btn-primary">Reset password</button>
    </form>
  );
}
