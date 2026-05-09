import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

const AddPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "ACTIVE",
    priority: "MEDIUM",
    riskScore: "",
    owner: "",
    dueDate: "",
    lastReviewedDate: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.owner.trim()) newErrors.owner = "Owner is required";
    if (!form.riskScore || isNaN(form.riskScore) || form.riskScore < 0 || form.riskScore > 100)
      newErrors.riskScore = "Risk score must be between 0 and 100";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    const controlData = { ...form, riskScore: Number(form.riskScore) };
    try {
      await API.post("/api/controls", controlData);
      navigate("/");
    } catch (err) {
      // ✅ Fallback to localStorage
      const controls = JSON.parse(localStorage.getItem("controls")) || [];
      const newControl = { id: Date.now(), ...controlData };
      localStorage.setItem("controls", JSON.stringify([...controls, newControl]));
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1B4F8A]">Add New Control</h2>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="Enter control title"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">⚠️ {errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe this control..." rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <input name="category" value={form.category} onChange={handleChange}
                placeholder="e.g. Security, Compliance, Risk"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Risk Score (0–100) <span className="text-red-500">*</span></label>
                <input name="riskScore" type="number" value={form.riskScore} onChange={handleChange}
                  placeholder="e.g. 85" min="0" max="100"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.riskScore && <p className="text-red-500 text-xs mt-1">⚠️ {errors.riskScore}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Owner <span className="text-red-500">*</span></label>
                <input name="owner" value={form.owner} onChange={handleChange}
                  placeholder="e.g. John Smith"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.owner && <p className="text-red-500 text-xs mt-1">⚠️ {errors.owner}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Reviewed Date</label>
                <input name="lastReviewedDate" type="date" value={form.lastReviewedDate} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#1B4F8A] hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                ) : "✅ Add Control"}
              </button>
              <button type="button" onClick={() => navigate("/")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition text-sm"
              >Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPage;