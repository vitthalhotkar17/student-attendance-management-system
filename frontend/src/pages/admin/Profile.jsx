import { useAuth } from "../../context/AuthContext.jsx";
import ProfileImageUploader from "../../components/ProfileImageUploader.jsx";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";

export default function AdminProfile() {
  const { user, updateUser } = useAuth();

  if (!user) return null;

  const handleSaveImage = async (src) => {
    try {
      // Update backend (change endpoint if your backend uses a different one)
      await api.put("/users/profile-image", {
        profileImage: src,
      });

      updateUser({
        profileImage: src,
      });

      toast.success("Profile image updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="card p-6 space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src={
              user.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=4f46e5&color=fff&rounded=true&size=128`
            }
            alt="Profile"
            className="h-36 w-36 rounded-full object-cover border-4 border-slate-100 shadow-soft"
          />

          <div>
            <h2 className="font-display text-2xl font-bold">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <span className="chip bg-brand-50 text-brand-700 mt-2 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <ProfileImageUploader
          image={user.profileImage}
          onSave={handleSaveImage}
        />
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="font-display font-bold">Profile Information</h3>

        <div className="grid gap-4">
          <div>
            <p className="text-slate-500">Full Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>

          <div>
            <p className="text-slate-500">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>

          <div>
            <p className="text-slate-500">Role</p>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>

          <div>
            <p className="text-slate-500">User ID</p>
            <p className="font-semibold">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}