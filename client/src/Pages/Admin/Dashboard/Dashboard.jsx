import { useState, useEffect } from "react";
import Sidebar from "../../../Components/Admin/SideMenu";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Eye,
  Clock,
} from "lucide-react";
import { axiosInstance } from "../../../Utils/AxiosInstance";

const AdminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Stats Data (You can fetch from backend later)
  const [stats, setStats] = useState({
    totalBlogs: 24,
    totalEnquiries: 18,
    unreadEnquiries: 7,
    lastUpdated: "2 hours ago",
  });

  // Recent Blogs (Sample data)
  const [recentBlogs, setRecentBlogs] = useState([
    {
      id: 1,
      title: "How AI is Transforming Web Development",
      createdAt: "2026-03-26",
      status: "active",
    },
    {
      id: 2,
      title: "10 Best Practices for React Performance",
      createdAt: "2026-03-25",
      status: "active",
    },
    {
      id: 3,
      title: "Why Your Business Needs a Modern Website",
      createdAt: "2026-03-24",
      status: "inactive",
    },
  ]);

  // Recent Enquiries
  const [recentEnquiries, setRecentEnquiries] = useState([
    {
      id: 101,
      name: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      type: "Business Proposal",
      createdAt: "2026-03-27 10:15",
      status: "new",
    },
    {
      id: 102,
      name: "Priya Patel",
      email: "priya.patel@yahoo.com",
      type: "Support Request",
      createdAt: "2026-03-26 16:40",
      status: "read",
    },
  ]);

  // Quick Stats Cards
  const statCards = [
    {
      title: "Total Blogs",
      value: stats.totalBlogs,
      icon: <FileText size={28} />,
      color: "bg-blue-500",
      change: `+${stats.totalBlogs} this week`,
    },
    {
      title: "Total Enquiries",
      value: stats.totalEnquiries,
      icon: <MessageSquare size={28} />,
      color: "bg-emerald-500",
      change: `${stats.totalEnquiries} unread`,
    },
    {
      title: "Unread Messages",
      value: stats.unreadEnquiries,
      icon: <Users size={28} />,
      color: "bg-amber-500",
      change: "Needs attention",
    },
  ];

  console.log(statCards);

  const getDashboard = async () => {
    try {
      const response = await axiosInstance.get("getdashboard/");
      const data = response.data.data;

      console.log(data, "data");

      // Stats
      setStats({
        totalBlogs: data.blogs.total,
        totalEnquiries: data.enquiries.total,
        unreadEnquiries: data.enquiries.unread,
        lastUpdated: "Just now",
      });

      // Recent Blogs
      setRecentBlogs(
        data.blogs.latest.map((blog) => ({
          id: blog.id,
          title: blog.title,
          createdAt: blog.created_at,
          status: blog.status,
        })),
      );

      // Recent Enquiries
      setRecentEnquiries(
        data.enquiries.latest.map((contact) => ({
          id: contact.id,
          name: `${contact.first_name} ${contact.last_name}`,
          email: contact.email,
          type: contact.enquiry_type,
          createdAt: contact.created_at,
          status: contact.status,
        })),
      );
    } catch (error) {
      console.error("Dashboard API error:", error);
    }
  };

  useEffect(() => {
    getDashboard();
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock size={18} />
              Last updated: {stats.lastUpdated}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow p-8 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-5xl font-bold text-gray-800 mt-3">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} text-white p-4 rounded-2xl`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm mt-6 text-emerald-600 font-medium">
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Blogs */}
            <div className="bg-white rounded-3xl shadow p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Recent Blogs
                </h2>
                <a
                  href="/admin/blogs"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <span>→</span>
                </a>
              </div>

              <div className="space-y-5">
                {recentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between border-b pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-2">
                        {blog.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                        blog.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {blog.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Contact Enquiries */}
            <div className="bg-white rounded-3xl shadow p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Recent Enquiries
                </h2>
                <a
                  href="/admin/contact"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View All <span>→</span>
                </a>
              </div>

              <div className="space-y-5">
                {recentEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="flex items-start gap-4 border-b pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-800">
                          {enq.name}
                        </p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            enq.status === "new"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {enq.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{enq.email}</p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {enq.type}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {new Date(enq.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-3xl shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/admin/blogs"
                className="group border border-gray-200 hover:border-blue-500 rounded-3xl p-8 transition-all hover:shadow-md"
              >
                <FileText className="text-blue-600 mb-4" size={32} />
                <h3 className="font-semibold text-xl mb-2 group-hover:text-blue-600">
                  Create New Blog
                </h3>
                <p className="text-gray-600">
                  Write and publish a new blog post
                </p>
              </a>

              <a
                href="/admin/contact"
                className="group border border-gray-200 hover:border-emerald-500 rounded-3xl p-8 transition-all hover:shadow-md"
              >
                <MessageSquare className="text-emerald-600 mb-4" size={32} />
                <h3 className="font-semibold text-xl mb-2 group-hover:text-emerald-600">
                  View Enquiries
                </h3>
                <p className="text-gray-600">Check latest contact messages</p>
              </a>

              <a
                href="/admin/about"
                className="group border border-gray-200 hover:border-purple-500 rounded-3xl p-8 transition-all hover:shadow-md"
              >
                <TrendingUp className="text-purple-600 mb-4" size={32} />
                <h3 className="font-semibold text-xl mb-2 group-hover:text-purple-600">
                  Update About Page
                </h3>
                <p className="text-gray-600">Edit company information</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
