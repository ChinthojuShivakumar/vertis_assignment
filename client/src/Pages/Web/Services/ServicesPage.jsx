import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WebsiteNavbar from "../Navbar/Navbar";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { getPreview } from "../../../Utils/Functions";
import Metadata from "../../../Utils/Metadata";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get("getservices/");

      if (res.data?.status === 200 && Array.isArray(res.data.data)) {
        setServices(res.data.data);
      } else {
        setServices([]); // fallback if unexpected structure
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getIconUrl = (icon) => {
    if (!icon) return null;
    if (icon.startsWith("http")) return icon;
    return `http://127.0.0.1:8000/media/${icon.replace(/^\/media\//, "")}`;
  };

  // ✅ Loading UI (unchanged)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WebsiteNavbar />
        <div className="flex items-center justify-center h-[70vh]">
          Loading services...
        </div>
      </div>
    );
  }

  // ✅ Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WebsiteNavbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>

          <button
            onClick={fetchServices}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Empty Data UI
  if (!services || services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WebsiteNavbar />

        <Metadata
          title="Services Page - Creative Agency"
          description="Visit Creative Agency Services page"
        />

        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Services Available
          </h2>
          <p className="text-gray-600">Please contact admin to add data.</p>
        </div>
      </div>
    );
  }

  // ✅ Main UI (UNCHANGED)
  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteNavbar />

      <Metadata
        title="Services Page - Creative Agency"
        description="Visit Creative Agency Services page"
      />

      <div className="px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Our Services
          </h1>
          <p className="text-gray-600 text-center text-lg max-w-2xl mx-auto mb-12">
            Professional solutions tailored to help your business grow
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* Icon Section */}
                  <div className="pt-10 pb-6 flex justify-center bg-gray-50">
                    {getIconUrl(service.icon) ? (
                      <img
                        src={getIconUrl(service.icon)}
                        alt={service.title}
                        className="w-28 h-28 object-contain transition-transform group-hover:scale-110 duration-300"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center text-6xl">
                        📌
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200 mx-8" />

                  {/* Content */}
                  <div className="p-8 pt-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h2>

                    <p className="text-gray-600 leading-relaxed flex-1">
                      {getPreview(service.description, 130)}
                    </p>

                    <div className="mt-6 text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all text-sm">
                      Read More
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
