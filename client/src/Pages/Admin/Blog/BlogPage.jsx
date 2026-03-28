import { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/SideMenu";
import { X } from "lucide-react";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { successMessage } from "../../../Utils/Alert";
import TextEditor from "../../../Components/Admin/TextEditor";

const BlogDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    images: [],
    status: "active",
    blogImages: [],
  });

  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const MAX_IMAGES = 5;

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.content.trim()) errs.content = "Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (form.images.length + files.length > MAX_IMAGES) {
      alert(`You can upload maximum ${MAX_IMAGES} images per blog.`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
          blogImages: [...(prev.blogImages || []), file],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const fetchBlogs = async () => {
    try {
      const response = await axiosInstance.get("getblogs/");
      if (response.data.status === 200) {
        setBlogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("content", form.content);
      formData.append("status", form.status);

      // Append new images (if any)
      form.blogImages?.forEach((file) => {
        formData.append("images", file);
      });

      let response;

      if (editingId) {
        // UPDATE - Send ID in body as requested
        formData.append("id", editingId);

        response = await axiosInstance.post("updateblog/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        successMessage(response.data.message || "Blog updated successfully");
      } else {
        // CREATE
        response = await axiosInstance.post("createblog/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        successMessage(response.data.message || "Blog created successfully");
      }

      // Reset form
      setForm({
        title: "",
        slug: "",
        content: "",
        images: [],
        status: "active",
        blogImages: [],
      });

      setIsModalOpen(false);
      setEditingId(null);
      setErrors({});

      fetchBlogs(); // Refresh list
    } catch (error) {
      console.error("Error saving blog:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save blog. Please try again.",
      );
    }
  };

  const openAddModal = () => {
    setForm({
      title: "",
      slug: "",
      content: "",
      images: [],
      status: "active",
      blogImages: [],
    });
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      images: blog.images || [],
      status: blog.status || "active",
      blogImages: [], // Clear new uploads when editing
    });
    setEditingId(blog.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await axiosInstance.delete("deleteblog/", {
        data: { id },
      });
      if (res.data.status === 200) {
        fetchBlogs();
        successMessage("Blog deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog");
    }
  };

  // Filtering & Pagination
  const filteredBlogs = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.slug?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));

  return (
    <div className="flex min-h-screen bg-gray-50">
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
              Blog Management
            </h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              + Add New Blog
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search blogs by title or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
          </div>

          {/* Table remains same */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Images
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
                  {paginatedBlogs.length > 0 ? (
                    paginatedBlogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {blog.images?.length > 0 ? (
                              blog.images
                                .slice(0, 3)
                                .map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt=""
                                    className="w-12 h-12 object-cover rounded-lg border"
                                  />
                                ))
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                                No Img
                              </div>
                            )}
                            {blog.images?.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs">
                                +{blog.images.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{blog.title}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                          {blog.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              blog.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {blog.status?.toUpperCase() || "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(blog)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
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
                        No blogs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - same as before */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-5 py-2 border rounded-lg transition ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal - same as before */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingId ? "Edit Blog" : "Add New Blog"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-73px)]"
            >
              {/* Image Upload Section - unchanged */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Images (Max {MAX_IMAGES})
                </label>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-28 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.images.length < MAX_IMAGES && (
                  <label className="cursor-pointer block border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <div className="font-medium text-gray-700">
                      Click to upload images
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title, Slug, Content, Status fields - unchanged */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full border rounded-xl p-4 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={`w-full border rounded-xl p-4 ${errors.slug ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <TextEditor
                  value={form.content}
                  onChange={(value) => setForm({ ...form, content: value })}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl"
                >
                  {editingId ? "Update Blog" : "Add Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDashboard;
