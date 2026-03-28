import { useEffect, useState } from "react";
import WebsiteNavbar from "../Navbar/Navbar";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";
import Metadata from "../../../Utils/Metadata";

const BlogDetailPage = () => {
  const { slug } = useParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      setError("Failed to load blog details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentImageIndex(0);
  }, [slug]);

  const currentBlog = blogs.find((blog) => blog.slug === slug);
  const relatedBlogs = blogs.filter((blog) => blog.slug !== slug).slice(0, 3);

  // AUTO SLIDE
  useEffect(() => {
    if (!currentBlog?.images?.length || currentBlog.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === currentBlog.images.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBlog]);

  const nextImage = () => {
    if (!currentBlog?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === currentBlog.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    if (!currentBlog?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? currentBlog.images.length - 1 : prev - 1,
    );
  };

  // ✅ Loading
  if (loading) {
    return (
      <>
        <WebsiteNavbar />
        <div className="pt-24 text-center">Loading...</div>
      </>
    );
  }

  // ✅ Error
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

  // ✅ Empty API
  if (!blogs || blogs.length === 0) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title="Blog - Creative Agency"
          description="No blogs available"
        />

        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No Blogs Available</h2>
          <p className="text-gray-600">Please contact admin to add data.</p>
        </div>
      </>
    );
  }

  // ✅ Blog Not Found (FIXED BUG)
  if (!currentBlog) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title="Blog Not Found - Creative Agency"
          description="Blog not found"
        />

        <div className="pt-24 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold mb-2 text-red-600">
            Blog not found!
          </h2>
          <p className="text-gray-600 mb-6">
            The requested blog does not exist.
          </p>

          <Link
            to="/blog"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Blogs
          </Link>
        </div>
      </>
    );
  }

  // ✅ MAIN UI (UNCHANGED)
  return (
    <>
      <WebsiteNavbar />

      <Metadata
        title={`Blog Page - ${currentBlog.title} - Creative Agency`}
        description="Visit Creative Agency Blog page"
      />

      <div className="pt-24 max-w-5xl mx-auto px-6">
        {/* IMAGE CAROUSEL */}
        {currentBlog.images && currentBlog.images.length > 0 && (
          <div className="relative mb-6">
            <img
              src={currentBlog.images[currentImageIndex]}
              alt={currentBlog.title}
              className="w-full h-96 object-fill rounded-3xl"
            />

            {currentBlog.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full"
                >
                  ❮
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full"
                >
                  ❯
                </button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {currentBlog.images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 w-3 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CONTENT */}
        <h1 className="text-4xl font-bold mb-4">{currentBlog.title}</h1>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: currentBlog.content }}
        />

        {/* RELATED */}
        {relatedBlogs.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6 mt-16">Related Blogs</h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((blog, index) => (
                <Link key={index} to={`/blog/${blog.slug}`}>
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                    {blog.images && blog.images.length > 0 && (
                      <img
                        src={blog.images[0]}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>

                      <p className="text-gray-600 mb-4">
                        {getPreview(blog.content, 120)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BlogDetailPage;
