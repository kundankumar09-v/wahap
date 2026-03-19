import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { EVENT_TYPES } from "../constants/eventTypes";

function AdminCreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    duration: "",
    date: "",
    endDate: "",
    ticketType: "Free",
    ageLimit: "",
    language: "",
    aboutEvent: "",
  });

  const [eventImage, setEventImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [layoutImage, setLayoutImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!layoutImage || !eventImage) {
      alert("Please upload both event card image and layout image");
      return;
    }

    setLoading(true);

    const data = new FormData();

    // append text fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // append images
    data.append("eventImage", eventImage);
    data.append("layoutImage", layoutImage);
    if (bannerImage) {
      data.append("bannerImage", bannerImage);
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/events/create`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Event Created Successfully!");

      const eventId = res.data.event._id;
      const layoutPath = res.data.event.layoutImage;

      // ✅ IMPORTANT redirect with layout
      navigate(`/admin/map/${eventId}?layout=${layoutPath}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Create Event (Organizer)</h2>
      <p style={{ marginTop: "4px", marginBottom: "14px", color: "#475569" }}>
        For website hero banners, use the manager panel: <Link to="/admin/banners">Open Banner Manager</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Event Name"
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <select name="type" onChange={handleChange} style={inputStyle} required>
          <option value="">Select Event Type</option>
          {EVENT_TYPES.map((typeItem) => (
            <option key={typeItem.value} value={typeItem.value}>
              {typeItem.label}
            </option>
          ))}
        </select>

        <input
          name="city"
          placeholder="City"
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="address"
          placeholder="Full Address / Venue"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="duration"
          placeholder="Duration (e.g., 3 hours)"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="date"
          name="date"
          onChange={handleChange}
          style={inputStyle}
          placeholder="Start Date"
        />

        <input
          type="date"
          name="endDate"
          onChange={handleChange}
          style={inputStyle}
          placeholder="End Date (Optional)"
        />

        <select
          name="ticketType"
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>

        <input
          name="ageLimit"
          placeholder="Age Limit (e.g., 5yrs+)"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="language"
          placeholder="Language (for music events, etc.)"
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="aboutEvent"
          placeholder="About Event"
          onChange={handleChange}
          rows={4}
          style={inputStyle}
        />

        <label>Event Card Image:</label>
        <input
          type="file"
          onChange={(e) => setEventImage(e.target.files[0])}
          required
          style={inputStyle}
        />

        <label>Event Details Page Banner Image (Optional - for EventDetails page, leave blank to use card image):</label>
        <input
          type="file"
          onChange={(e) => setBannerImage(e.target.files[0])}
          style={inputStyle}
        />

        <label>Layout Image (Map):</label>
        <input
          type="file"
          onChange={(e) => setLayoutImage(e.target.files[0])}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "12px",
};

export default AdminCreateEvent;