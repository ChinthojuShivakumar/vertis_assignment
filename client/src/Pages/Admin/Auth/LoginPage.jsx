import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import CryptoJS from "crypto-js";
import { errorMessage, successMessage } from "../../../Utils/Alert";

const SECRET_ENCRYPTION = "CRYPTOAGENCY";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
        return "";

      case "password":
        if (!value) return "Password required";
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
      formData.append("email", form.email);
      formData.append("password", encryptedPassword);

      // Send to backend
      const response = await axiosInstance.post("login/", formData);
      successMessage(response.data.message);
      localStorage.setItem("token", JSON.stringify(response.data.token));
      setForm({ email: "", password: "" });
      navigate("/admin");

      window.location.reload();
    } catch (error) {
      errorMessage(
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
            <h1 className="text-4xl font-bold mb-4">Welcome Back 👋</h1>

            <p className="opacity-90">
              Login to access your dashboard and manage your projects with
              Creative Agency.
            </p>
          </div>

          <p className="text-sm opacity-80">
            Build amazing digital experiences with us.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">Login</h2>

          <p className="text-gray-500 mb-6">
            Welcome! Please login to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* REMEMBER */}
            <div className="flex items-center justify-start text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" />
                Remember me
              </label>
            </div>

            <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition">
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
