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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch all services (for current service + related)
  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("getservices/"); // or "getservices/"
      if (res.data.status === 200) {
        setServices(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentImageIndex(0);
  }, [slug]);

  const currentService = services.find((service) => service.slug === slug);
  const relatedServices = services
    .filter((service) => service.slug !== slug)
    .slice(0, 3);

  // Auto slide for images (if multiple images added in future)
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

  if (loading) {
    return (
      <>
        <WebsiteNavbar />
        <div className="pt-24 text-center">Loading service details...</div>
      </>
    );
  }

  if (!currentService) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata
          title={`Services Page - ${currentService.title} - Creative Agency`}
          description="Visit Creative Agency Blog page"
        />
        <div className="pt-24 text-center text-2xl text-red-600">
          Service not found!
        </div>
      </>
    );
  }

  return (
    <>
      <WebsiteNavbar />

      <Metadata
        title={`Services Page - ${currentService.title} - Creative Agency`}
        description="Visit Creative Agency Blog page"
      />

      <div className="pt-24 max-w-5xl mx-auto px-6 pb-16">
        {/* IMAGE / ICON CAROUSEL */}
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

              {/* Navigation Buttons - Show only if multiple images */}
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

                  {/* Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {currentService.images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-3 w-3 rounded-full transition-all ${
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
            // Fallback Icon
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

        {/* Status */}
        {/* {currentService.status && (
          <div className="flex justify-center mb-12">
            <span
              className={`inline-block px-6 py-2 rounded-full text-sm font-medium ${
                currentService.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentService.status.toUpperCase()}
            </span>
          </div>
        )} */}

        {/* Main Content - Full HTML Description */}
        <div
          className="prose prose-lg max-w-none mx-auto text-gray-700 leading-relaxed mb-16"
          dangerouslySetInnerHTML={{ __html: currentService.description }}
        />

        {/* Call to Action */}
        <div className="text-center mb-20">
          <button
            onClick={() => (window.location.href = "/contact")}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl transition shadow-lg"
          >
            Get In Touch For This Service
          </button>
        </div>

        {/* RELATED SERVICES */}
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
                    {/* Icon */}
                    <div className="pt-8 pb-6 flex justify-center bg-gray-50">
                      {service.icon ? (
                        <img
                          src={service.icon}
                          alt={service.title}
                          className="w-24 h-24 object-contain transition-transform group-hover:scale-110"
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
