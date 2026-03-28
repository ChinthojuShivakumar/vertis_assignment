import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import WebsiteNavbar from "../Navbar/Navbar";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";
import Metadata from "../../../Utils/Metadata";

const ServiceDetail = () => {
  const { slug } = useParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get("getservices/");

      if (res.data?.status === 200 && Array.isArray(res.data.data)) {
        setServices(res.data.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load service details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentImageIndex(0);
  }, [slug]);

  const currentService = services.find((service) => service.slug === slug);
  const relatedServices = services
    .filter((service) => service.slug !== slug)
    .slice(0, 3);

  // Auto slider
  useEffect(() => {
    if (!currentService?.images?.length || currentService.images.length <= 1)
      return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === currentService.images.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [currentService]);

  const nextImage = () => {
    if (!currentService?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === currentService.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    if (!currentService?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? currentService.images.length - 1 : prev - 1,
    );
  };

  // ✅ Loading UI (same)
  if (loading) {
    return (
      <>
        <WebsiteNavbar />
        <div className="pt-24 text-center">Loading service details...</div>
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
            onClick={fetchServices}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  // ✅ Empty API data
  if (!services || services.length === 0) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title="Services - Creative Agency"
          description="No services available"
        />

        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No Services Available</h2>
          <p className="text-gray-600">Please contact admin to add data.</p>
        </div>
      </>
    );
  }

  // ✅ Service not found (slug wrong)
  if (!currentService) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title="Service Not Found - Creative Agency"
          description="Service not found"
        />

        <div className="pt-24 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl text-red-600 font-semibold mb-2">
            Service not found!
          </h2>
          <p className="text-gray-600 mb-6">
            The requested service does not exist.
          </p>

          <Link
            to="/services"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Services
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
        title={`Services Page - ${currentService.title} - Creative Agency`}
        description="Visit Creative Agency Blog page"
      />

      <div className="pt-24 max-w-5xl mx-auto px-6 pb-16">
        {/* IMAGE / ICON */}
        <div className="relative mb-10">
          {currentService.icon ||
          (currentService.images && currentService.images.length > 0) ? (
            <div className="relative">
              <img
                src={
                  currentService.images && currentService.images.length > 0
                    ? currentService.images[currentImageIndex]
                    : currentService.icon
                }
                alt={currentService.title}
                className="w-full h-96 object-cover rounded-3xl shadow-lg"
              />

              {currentService.images && currentService.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full transition"
                  >
                    ❮
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full transition"
                  >
                    ❯
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {currentService.images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-3 w-3 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white scale-110"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-52 h-52 bg-gray-100 rounded-3xl flex items-center justify-center text-8xl shadow-inner">
                📌
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          {currentService.title}
        </h1>

        {/* Description */}
        <div
          className="prose prose-lg max-w-none mx-auto text-gray-700 leading-relaxed mb-16"
          dangerouslySetInnerHTML={{
            __html: currentService.description,
          }}
        />

        {/* CTA */}
        <div className="text-center mb-20">
          <button
            onClick={() => (window.location.href = "/contact")}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl transition shadow-lg"
          >
            Get In Touch For This Service
          </button>
        </div>

        {/* RELATED */}
        {relatedServices.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center">
              Related Services
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition h-full flex flex-col">
                    <div className="pt-8 pb-6 flex justify-center bg-gray-50">
                      {service.icon ? (
                        <img
                          src={service.icon}
                          alt={service.title}
                          className="w-24 h-24 object-contain group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl">
                          📌
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>

                      <p className="text-gray-600 mb-4 flex-1">
                        {getPreview(service.description, 110)}
                      </p>

                      <div className="text-blue-600 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        View Details →
                      </div>
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

export default ServiceDetail;
