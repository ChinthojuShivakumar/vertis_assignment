import { useState, useEffect } from "react";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import WebsiteNavbar from "../Navbar/Navbar";
import Metadata from "../../../Utils/Metadata";

const About = () => {
  const [aboutData, setAboutData] = useState({
    title: "",
    subtitle: "",
    description: "",
    mission: "",
    vision: "",
    values: [],
    stats: [],
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("getabout/");
      if (res.data?.status === 200 && res.data.data) {
        setAboutData(res.data.data);
      } else {
        setAboutData(null);
      }
    } catch (err) {
      console.error("Failed to fetch about page:", err);
      setError("Failed to load About page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  // Loading
  if (loading) {
    return (
      <>
        <WebsiteNavbar />
        <div className="pt-20 text-center">Loading About page...</div>
      </>
    );
  }

  // Error
  if (error) {
    return (
      <>
        <WebsiteNavbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAbout}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  // Empty / No Data
  if (!aboutData) {
    return (
      <>
        <WebsiteNavbar />
        <Metadata title="About - Creative Agency" description="No about data" />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No About Data Available</h2>
          <p className="text-gray-600">Please contact admin to add data.</p>
        </div>
      </>
    );
  }

  // Main UI
  return (
    <>
      <WebsiteNavbar />
      <Metadata
        title="About Page - Creative Agency"
        description="Visit Creative Agency About page"
      />

      <div className="pt-20 max-w-7xl mx-auto px-6 py-20">
        {/* TITLE */}
        <h1 className="text-5xl font-bold text-center mb-6">{aboutData.title}</h1>

        {/* SUBTITLE */}
        <p className="text-2xl text-gray-600 text-center max-w-3xl mx-auto">
          {aboutData.subtitle}
        </p>

        {/* DESCRIPTION */}
        <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto mt-6">
          {aboutData.description}
        </p>

        {/* IMAGE */}
        {aboutData.image && (
          <div className="flex justify-center mt-10">
            <img
              src={aboutData.image}
              alt="about"
              className="rounded-lg shadow-lg max-h-96"
            />
          </div>
        )}

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-16 mt-20">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{aboutData.mission}</p>
          </div>

          <div>
            <h2 className="text-3xl font-semibold mb-6">Our Vision</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{aboutData.vision}</p>
          </div>
        </div>

        {/* VALUES */}
        {aboutData.values?.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-semibold text-center mb-8">Our Values</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {aboutData.values.map((value, index) => (
                <span
                  key={index}
                  className="px-6 py-2 bg-gray-100 rounded-full text-gray-700"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {aboutData.stats?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-20 text-center">
            {aboutData.stats.map((stat, index) => (
              <div key={index}>
                <h3 className="text-4xl font-bold text-blue-600">{stat.number}</h3>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default About;