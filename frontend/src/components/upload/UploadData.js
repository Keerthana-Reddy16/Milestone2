import React, { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function UploadData() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first.");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ File uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Upload New CSV Data</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
