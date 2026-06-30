import { useEffect, useRef, useState } from "react";
import { FiCamera, FiCheckCircle, FiUploadCloud, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ProfileImageUploader({ image, onSave }) {
  const [preview, setPreview] = useState(image || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(image || "");
    setSelectedFile(null);
    setError("");
  }, [image]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (file) => {
    if (!file) {
      setError("No file selected.");
      toast.error("Please select an image file.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP formats are supported.");
      toast.error("Unsupported file type. Please choose an image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File size must be 5 MB or less.");
      toast.error("The selected file is too large.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result || "");
      setSelectedFile(file);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleSave = () => {
    if (!selectedFile) {
      setError("No new image selected.");
      toast.error("Please choose an image before saving.");
      return;
    }
    onSave(preview);
    setSelectedFile(null);
    toast.success("Profile picture updated successfully.");
  };

  const handleCancel = () => {
    setPreview(image || "");
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50 shadow-soft w-full max-w-xs">
        {preview ? (
          <img src={preview} alt="Profile preview" className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400">
            <FiCamera size={48} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-col gap-3">
        <button type="button" onClick={openFilePicker} className="btn-outline w-full py-3 flex items-center justify-center gap-2">
          <FiUploadCloud size={18} /> Edit Profile Picture
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {selectedFile && (
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={handleSave} className="btn-primary w-full sm:w-auto flex-1 justify-center gap-2">
            <FiCheckCircle size={18} /> Save
          </button>
          <button type="button" onClick={handleCancel} className="btn-ghost w-full sm:w-auto flex-1 justify-center gap-2">
            <FiXCircle size={18} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
