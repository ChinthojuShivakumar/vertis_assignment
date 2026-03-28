import { useEffect, useState } from "react";
import WebsiteNavbar from "../Navbar/Navbar";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";

const BlogDetailPage = () => {
  const { slug } = useParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchBlogs = async () => {
    try {
      const res = await axiosInstance.get("getblogs/");
      if (res.data.status === 200) {
        setBlogs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
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
  const relatedBlogs = blogs.filter((blog) => blog.slug !== slug);

  // AUTO SLIDE
  useEffect(() => {
    if (!currentBlog?.images?.length) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === currentBlog.images.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBlog]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === currentBlog.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? currentBlog.images.length - 1 : prev - 1,
    );
  };

  if (loading) {
    return <div className="pt-24 text-center">Loading...</div>;
  }

  if (!currentBlog) {
    return (
      <>
        <WebsiteNavbar />
        <div className="pt-24 text-center text-2xl">Blog not found!</div>
      </>
    );
  }

  return (
    <>
      <WebsiteNavbar />

      <div className="pt-24 max-w-5xl mx-auto px-6">
        {/* IMAGE CAROUSEL */}
        {currentBlog.images.length > 0 && (
          <div className="relative mb-6">
            <img
              src={currentBlog.images[currentImageIndex]}
              alt={currentBlog.title}
              className="w-full h-96 object-fill rounded-3xl"
            />

            {/* PREVIOUS BUTTON */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full"
            >
              ❮
            </button>

            {/* NEXT BUTTON */}
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full"
            >
              ❯
            </button>

            {/* DOTS */}
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
          </div>
        )}

        {/* BLOG CONTENT */}
        <h1 className="text-4xl font-bold mb-4">{currentBlog.title}</h1>

        {/* <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-6 ${
            currentBlog.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {currentBlog.status}
        </span> */}

        {/* <p className="text-gray-700 text-lg mb-16">{currentBlog.content}</p> */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: currentBlog.content }}
        />

        {/* RELATED BLOGS */}
        {relatedBlogs.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">Related Blogs</h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((blog, index) => (
                <Link key={index} to={`/blog/${blog.slug}`}>
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                    {blog.images.length > 0 && (
                      <img
                        src={blog.images[0]}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{blog.title}</h3>

                      {/* <p className="text-gray-600 mb-2">
                        {blog.content.substring(0, 80)}...
                      </p> */}

                      <p className="text-gray-600 mb-4">
                        {getPreview(blog.content, 120)}
                      </p>

                      {/* <span
                        className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
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
          </>
        )}
      </div>
    </>
  );
};

export default BlogDetailPage;
