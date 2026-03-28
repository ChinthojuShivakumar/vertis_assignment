import { useState, useEffect } from "react";
import Sidebar from "../../../Components/Admin/SideMenu";
import { X, Save, Upload } from "lucide-react";
import { errorMessage } from "../../../Utils/Alert";
import { axiosInstance } from "../../../Utils/AxiosInstance";

const AboutPageAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // About Page Content State
  const [aboutData, setAboutData] = useState({
    title: "About Us",
    subtitle: "Empowering Businesses with Innovative Digital Solutions",
    description:
      "We are a passionate team of developers, designers, and strategists dedicated to creating exceptional digital experiences. With years of expertise, we help businesses grow through cutting-edge technology and creative solutions.",

    mission:
      "To deliver innovative technology solutions that drive business growth and create meaningful impact.",
    vision:
      "To be the most trusted digital transformation partner for businesses worldwide.",

    values: [
      "Innovation",
      "Quality",
      "Integrity",
      "Customer Focus",
      "Collaboration",
    ],

    stats: [
      { number: "150+", label: "Projects Completed" },
      { number: "85", label: "Happy Clients" },
      { number: "12", label: "Years Experience" },
      { number: "25", label: "Team Members" },
    ],

    image: "", // Base64 or URL for hero image
    imageFile: null
  });

  const [newValue, setNewValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data from localStorage (for demo) - Replace with API call later
  useEffect(() => {
    const savedData = localStorage.getItem("aboutPageData");
    if (savedData) {
      setAboutData(JSON.parse(savedData));
    }
  }, []);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAboutData((prev) => ({ ...prev, image: reader.result, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new value
  const addValue = () => {
    if (newValue.trim() && !aboutData.values.includes(newValue.trim())) {
      setAboutData((prev) => ({
        ...prev,
        values: [...prev.values, newValue.trim()],
      }));
      setNewValue("");
    }
  };

  // Remove value
  const removeValue = (index) => {
    setAboutData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  // Save About Page Content
  // const handleSave = async () => {
  //   setIsSaving(true);

  //   try {
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1200));

  //     // Save to localStorage (demo)
  //     localStorage.setItem("aboutPageData", JSON.stringify(aboutData));

  //     setSuccessMessage("About page content saved successfully!");

  //     setTimeout(() => {
  //       setSuccessMessage("");
  //     }, 3000);
  //   } catch (error) {
  //     alert("Failed to save. Please try again.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", aboutData.title);
      formDataToSend.append("subtitle", aboutData.subtitle);
      formDataToSend.append("description", aboutData.description);
      formDataToSend.append("mission", aboutData.mission);
      formDataToSend.append("vision", aboutData.vision);

      // Append values array
      aboutData.values.forEach((v) => formDataToSend.append("values[]", v));

      // Append stats array as JSON string
      formDataToSend.append("stats", JSON.stringify(aboutData.stats));

      // Append image file if exists
      if (aboutData.imageFile) {
        formDataToSend.append("image", aboutData.imageFile);
      } else {
        formDataToSend.append("image", aboutData.image);
      }

      // Send using axios instance
      const response = await axiosInstance.post(
        "createorupdateabout/",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setSuccessMessage("About page content saved successfully!");
      fetchAbout()
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);
      errorMessage("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchAbout = async () => {
    try {
      const res = await axiosInstance.get("getabout/"); // GET endpoint
      if (res.data.status === 200) {
        setAboutData(res.data.data); // Assume backend sends single object
      }
    } catch (error) {
      console.error("Failed to fetch about page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

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
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                About Page Management
              </h1>
              <p className="text-gray-600 mt-1">
                Edit the content displayed on your website's About page
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-3 transition"
            >
              <Save size={20} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3">
              ✅ {successMessage}
            </div>
          )}

          <div className="space-y-10">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl shadow p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Hero Section
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={aboutData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={aboutData.subtitle}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={aboutData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full border border-gray-300 rounded-3xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                  </div>
                </div>

                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hero Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-blue-400 transition">
                    {aboutData.image ? (
                      <div className="relative">
                        <img
                          src={aboutData.image}
                          alt="About Hero"
                          className="w-full h-80 object-cover rounded-2xl"
                        />
                        <button
                          onClick={() =>
                            setAboutData((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-xl text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload
                          size={48}
                          className="mx-auto text-gray-400 mb-4"
                        />
                        <p className="font-medium text-gray-700">
                          Click to upload hero image
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Recommended: 1200x800 px
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow p-8">
                <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
                <textarea
                  name="mission"
                  value={aboutData.mission}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-3xl p-5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="bg-white rounded-3xl shadow p-8">
                <h2 className="text-xl font-semibold mb-4">Our Vision</h2>
                <textarea
                  name="vision"
                  value={aboutData.vision}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-3xl p-5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-white rounded-3xl shadow p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Core Values</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Add new value"
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={addValue}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {aboutData.values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-5 py-3 rounded-2xl flex items-center gap-3 group"
                  >
                    <span className="font-medium">{value}</span>
                    <button
                      onClick={() => removeValue(index)}
                      className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-3xl shadow p-8">
              <h2 className="text-xl font-semibold mb-6">Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {aboutData.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-2xl p-6 text-center"
                  >
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index].number = e.target.value;
                        setAboutData((prev) => ({ ...prev, stats: newStats }));
                      }}
                      className="text-4xl font-bold text-blue-600 w-full text-center bg-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index].label = e.target.value;
                        setAboutData((prev) => ({ ...prev, stats: newStats }));
                      }}
                      className="text-gray-600 mt-2 w-full text-center bg-transparent outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPageAdmin;
