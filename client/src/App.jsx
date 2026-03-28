import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./Pages/Admin/Dashboard/Dashboard";
import BlogPage from "./Pages/Admin/Blog/BlogPage";
import ContactForm from "./Pages/Admin/Contactform/ContactForm";
import RegisterPage from "./Pages/Admin/Auth/RegisterPage";
import LoginPage from "./Pages/Admin/Auth/LoginPage";
import { ToastContainer } from "react-toastify";
import AboutPageAdmin from "./Pages/Admin/About/AboutPage";
import Home from "./Pages/Web/HomePage/HomePage";
import About from "./Pages/Web/AboutPage/AboutPage";
import Blog from "./Pages/Web/BlogPage/BlogPage";
import ContactEnquiries from "./Pages/Admin/Contactform/ContactForm";
import AddContactSupport from "./Pages/Web/ContactPage/ContactForm";
import BlogDetailPage from "./Pages/Web/BlogPage/BlogDetails";
import ServicesPage from "./Pages/Web/Services/ServicesPage";
import AdminServices from "./Pages/Admin/Services/AdminServices";
import ServiceDetail from "./Pages/Web/Services/ServiceDetailPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<HomePage />} />
          <Route path="/admin/blogs" element={<BlogPage />} />
          <Route path="/admin/contact" element={<ContactForm />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/contact/support" element={<ContactEnquiries />} />
          <Route path="/admin/about" element={<AboutPageAdmin />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/contact" element={<AddContactSupport />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
        </Routes>
        <ToastContainer limit={1} />
      </BrowserRouter>
    </div>
  );
}

export default App;
