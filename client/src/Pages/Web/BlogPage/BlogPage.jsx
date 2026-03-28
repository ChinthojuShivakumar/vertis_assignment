import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WebsiteNavbar from "../Navbar/Navbar";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";
import Metadata from "../../../Utils/Metadata";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get("getblogs/");

      if (res.data?.status === 200 && Array.isArray(res.data.data)) {
        setBlogs(res.data.data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setError("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ✅ Loading UI
  if (loading) {
    return (
      <>
        <WebsiteNavbar />
        <div className="flex items-center justify-center h-[70vh]">
          Loading blogs...
        </div>
      </>
    );
  }

  // ✅ Error UI
  if (error) {
    return (
      <>
        <WebsiteNavbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>

          <button
            onClick={fetchBlogs}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  // ✅ Empty Data UI
  if (!blogs || blogs.length === 0) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title="Blog Page - Creative Agency"
          description="Visit Creative Agency Blog page"
        />

        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No Blogs Available</h2>
          <p className="text-gray-600">Please contact admin to add data.</p>
        </div>
      </>
    );
  }

  // ✅ Main UI (UNCHANGED)
  return (
    <>
      <WebsiteNavbar />
      <Metadata
        title="Blog Page - Creative Agency"
        description="Visit Creative Agency Blog page"
      />

      <div className="pt-20 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold text-center mb-12">Our Blog</h1>

        <div className="text-center text-gray-500 text-xl mb-12">
          Latest insights, trends, and thoughts from our team.
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <Link key={index} to={`/blog/${blog.slug}`}>
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                {blog.images && blog.images.length > 0 && (
                  <img
                    src={blog.images[0]}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>

                  <p className="text-gray-600 mb-4">
                    {getPreview(blog.content, 120)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
