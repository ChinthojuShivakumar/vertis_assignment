import { useEffect, useState } from "react";
import Sidebar from "../../../Components/Admin/SideMenu";
import { X, Eye, Send } from "lucide-react";
import { axiosInstance } from "../../../Utils/AxiosInstance";
import { errorMessage, successMessage } from "../../../Utils/Alert";

const ContactEnquiries = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reply Modal State
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("getcontacts/");
      if (res.data.status === 200) {
        setEnquiries(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      errorMessage("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Update Contact Status
  const updateStatus = async (contactId, newStatus) => {
    try {
      const response = await axiosInstance.put("updatecontactstatus/", {
        id: contactId,
        status: newStatus,
      });

      successMessage(response.data.message || "Status updated successfully");
      fetchContacts(); // Refresh list
    } catch (err) {
      errorMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  // Send Reply Email
  const sendReply = async () => {
    if (!selectedEnquiry || !replySubject || !replyMessage) {
      errorMessage("Please fill subject and message");
      return;
    }

    setSendingReply(true);

    try {
      const response = await axiosInstance.post("sendcontactreply/", {
        id: selectedEnquiry.id,
        subject: replySubject,
        message: replyMessage,
      });

      successMessage(response.data.message || "Reply sent successfully");

      // Close reply modal and refresh
      setIsReplyModalOpen(false);
      setReplySubject("");
      setReplyMessage("");
      fetchContacts();
    } catch (err) {
      errorMessage(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  // Open View Modal
  const viewEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);

    // Auto mark as "read" when viewed
    if (enquiry.status === "new") {
      updateStatus(enquiry.id, "read");
    }
  };

  const openReplyModal = () => {
    setIsModalOpen(false);
    setIsReplyModalOpen(true);
    setReplySubject(`Re: ${selectedEnquiry.enquiry_type}`);
    setReplyMessage(
      `Dear ${selectedEnquiry.first_name},\n\nThank you for your enquiry.\n\n Soon Our Agent will contact you`,
    );
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsReplyModalOpen(false);
    setSelectedEnquiry(null);
    setReplySubject("");
    setReplyMessage("");
  };

  // Filter & Sort
  const filteredEnquiries = enquiries
    .filter((enq) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        enq.first_name?.toLowerCase().includes(searchTerm) ||
        enq.last_name?.toLowerCase().includes(searchTerm) ||
        enq.email?.toLowerCase().includes(searchTerm) ||
        enq.enquiry_type?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        filterStatus === "all" || enq.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-700",
      read: "bg-yellow-100 text-yellow-700",
      replied: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700",
    };

    const labels = {
      new: "New",
      read: "Read",
      replied: "Replied",
      closed: "Closed",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Contact Enquiries
            </h1>
            <div className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-semibold text-gray-700">
                {filteredEnquiries.length}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, email or enquiry type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Enquiry Type
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnquiries.length > 0 ? (
                    filteredEnquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {enq.first_name} {enq.last_name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{enq.email}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {enq.enquiry_type}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(enq.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(enq.status)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => viewEnquiry(enq)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <Eye size={18} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-16 text-gray-500"
                      >
                        No enquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* View Enquiry Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Enquiry Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedEnquiry.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={26} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">
                    {selectedEnquiry.first_name} {selectedEnquiry.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-blue-600">
                    {selectedEnquiry.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Enquiry Type</p>
                <p className="inline-block bg-gray-100 px-5 py-2 rounded-2xl">
                  {selectedEnquiry.enquiry_type}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Message</p>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-gray-700 leading-relaxed">
                  {selectedEnquiry.summary}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-4 border rounded-2xl font-medium hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={openReplyModal}
                disabled={selectedEnquiry.status === "replied"}
                className={`flex-1 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 
  ${
    selectedEnquiry.status === "replied"
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
              >
                <Send size={18} />
                {selectedEnquiry.status === "replied"
                  ? "Already Replied"
                  : "Reply via Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {isReplyModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-semibold">Send Reply</h2>
              <p className="text-sm text-gray-500">
                To: {selectedEnquiry.email}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Re: Enquiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 resize-y min-h-[200px]"
                  placeholder="Write your reply here..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-4 border rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                disabled={sendingReply}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2"
              >
                {sendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactEnquiries;
