import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WebsiteNavbar from "../Navbar/Navbar";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";
import Metadata from "../../../Utils/Metadata";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await axiosInstance.get("getblogs/");
      if (res.data.status === 200) {
        setBlogs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch about page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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
                {blog.images.length > 0 && (
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

                  {/* <p className="text-gray-600 mb-4">{blog.content}</p> */}
                  {/* <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      blog.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {blog.status}
                  </span> */}
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
