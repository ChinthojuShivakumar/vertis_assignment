import React, { useState } from "react";
import { Link } from "react-router-dom";
import { successMessage } from "../../../Utils/Alert";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import CryptoJS from "crypto-js";

const SECRET_ENCRYPTION = "CRYPTOAGENCY";

const RegisterPage = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    switch (name) {
      case "first_name":
        if (!value) return "First name required";
        if (value.length < 2) return "Minimum 2 characters";
        return "";

      case "last_name":
        if (!value) return "Last name required";
        return "";

      case "email":
        if (!value) return "Email required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
        return "";

      case "password":
        if (!value) return "Password required";
        if (value.length < 6) return "Minimum 6 characters";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: validate(name, value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validate(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Encrypt password
      const encryptedPassword = CryptoJS.AES.encrypt(
        form.password,
        SECRET_ENCRYPTION,
      ).toString();

      // Prepare FormData
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("email", form.email);
      formData.append("password", encryptedPassword);

      // Send to backend
      const response = await axiosInstance.post("adduser/", formData);
      console.log("Response:", response.data);
      successMessage(response.data.message);
      setForm({ first_name: "", last_name: "", email: "", password: "" });
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Something went wrong, try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-b from-cyan-400 to-blue-500 text-white p-10 flex-col justify-between">
          <h2 className="font-bold tracking-wider">CREATIVE AGENCY</h2>

          <div>
            <h1 className="text-4xl font-bold mb-4">Join Us 🚀</h1>

            <p className="opacity-90">
              Create your account and start exploring amazing services provided
              by Creative Agency.
            </p>
          </div>

          <p className="text-sm opacity-80">
            Let's build something great together.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">Register</h2>

          <p className="text-gray-500 mb-6">Create a new account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FIRST NAME */}
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {errors.first_name && (
                <p className="text-red-500 text-sm">{errors.first_name}</p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {errors.last_name && (
                <p className="text-red-500 text-sm">{errors.last_name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition">
              CREATE ACCOUNT
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
