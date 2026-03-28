import { useState } from "react";
import { X } from "lucide-react"; // Optional: if you want a success modal close button
import { errorMessage, successMessage } from "../../../Utils/Alert";

const AddContactSupport = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    enquiry_type: "",
    summary: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const enquiryOptions = [
    "General Inquiry",
    "Business Proposal",
    "Support Request",
    "Feedback",
    "Partnership",
    "Other",
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.enquiry_type)
      newErrors.enquiry_type = "Please select enquiry type";
    if (!formData.summary.trim()) newErrors.summary = "Summary is required";
    if (formData.summary.trim().length < 20) {
      newErrors.summary = "Summary must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call (Replace with your actual backend call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Contact Form Data:", formData);

      setSuccess(true);

      // Reset form after successful submission
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        enquiry_type: "",
        summary: "",
      });
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">✅</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-8">
                Your enquiry has been submitted successfully.
                <br />
                We'll get back to you soon.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full border rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full border rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Enquiry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enquiry Type *
                </label>
                <select
                  name="enquiry_type"
                  value={formData.enquiry_type}
                  onChange={handleChange}
                  className={`w-full border rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    errors.enquiry_type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Enquiry Type</option>
                  {enquiryOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.enquiry_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.enquiry_type}
                  </p>
                )}
              </div>

              {/* Summary / Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message / Summary *
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={7}
                  className={`w-full border rounded-3xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[160px] transition ${
                    errors.summary ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Please describe your enquiry in detail..."
                />
                {errors.summary && (
                  <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl transition text-lg mt-4"
              >
                {isSubmitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          We respect your privacy. Your information will only be used to respond
          to your enquiry.
        </p>
      </div>
    </div>
  );
};

export default AddContactSupport;
