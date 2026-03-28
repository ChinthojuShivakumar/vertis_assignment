import { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/SideMenu";
import { X } from "lucide-react";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { successMessage } from "../../../Utils/Alert";
import TextEditor from "../../../Components/Admin/TextEditor";

const ServiceDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    status: "active",
    icon: null, // For single icon/image
  });

  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const MAX_ICON_SIZE = 5; // MB (optional)

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle single icon upload
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed for icon.");
      return;
    }

    // Optional: size check (5MB)
    if (file.size > MAX_ICON_SIZE * 1024 * 1024) {
      alert(`Icon size should be less than ${MAX_ICON_SIZE}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        icon: reader.result, // For preview
        iconFile: file, // For FormData
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeIcon = () => {
    setForm((prev) => ({ ...prev, icon: null, iconFile: null }));
  };

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get("getservices/"); // Adjust endpoint
      if (response.data.status === 200) {
        setServices(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("status", form.status);

      // Append icon if exists
      if (form.iconFile) {
        formData.append("icon", form.iconFile);
      }

      const url = editingId ? "updateservice/" : "createservice/";
      const method = editingId ? axiosInstance.put : axiosInstance.post;

      const response = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      successMessage(response.data.message || "Service saved successfully");
      setIsModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      alert(error.response?.data?.message || "Failed to save service");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      status: "active",
      icon: null,
    });
    setEditingId(null);
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setForm({
      title: service.title || "",
      slug: service.slug || "",
      description: service.description || "",
      status: service.status || "active",
      icon: service.icon || null, // existing icon URL
    });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      const res = await axiosInstance.delete("deleteservice/", {
        data: { id },
      });

      if (res.data.status === 200) {
        fetchServices();
        successMessage("Service deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Failed to delete service");
    }
  };

  // Filtering & Pagination
  const filteredServices = services.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Service Management
            </h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
            >
              + Add New Service
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search services by title or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Icon
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedServices.length > 0 ? (
                    paginatedServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {service.icon ? (
                            <img
                              src={service.icon}
                              alt="Service Icon"
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                              No Icon
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {service.title}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                          {service.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              service.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {service.status
                              ? service.status.toUpperCase()
                              : "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(service)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-16 text-gray-500"
                      >
                        No services found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-5 py-2 border rounded-lg transition ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingId ? "Edit Service" : "Add New Service"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-73px)]"
            >
              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Icon
                </label>

                {form.icon && (
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src={form.icon}
                      alt="Icon Preview"
                      className="w-full h-full object-cover rounded-2xl border"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <label className="cursor-pointer block border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center transition">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="font-medium text-gray-700">
                    Click to upload icon
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    PNG, JPG, SVG • Recommended square image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter service title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={`w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="service-title-in-url"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextEditor
                  value={form.description}
                  onChange={(value) => setForm({ ...form, description: value })}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition"
                >
                  {editingId ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDashboard;
