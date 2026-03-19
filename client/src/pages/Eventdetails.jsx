import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUsers, FaGlobe, FaMapMarkerAlt, FaTag, FaHourglass } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import API_URL from "../config";
import "./Eventdetails.css";
import Footer from "../components/Footer";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return "TBA";
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return "TBA";

    const startStr = start.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!endDate) {
      return `${startStr} onwards`;
    }

    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
      return `${startStr} onwards`;
    }

    if (startDate === endDate || start.getTime() === end.getTime()) {
      return startStr;
    }

    return `${startStr} onwards`;
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <button onClick={() => navigate("/")} className="back-link">
          <FaArrowLeft /> Back to Home
        </button>
        <div className="error">
          <h2>Event Not Found</h2>
        </div>
      </div>
    );
  }

  const bannerImg = formatImageUrl(event.bannerImage || event.eventImage || "");
  const description = event.aboutEvent || "No description available";
  const isLongDescription = description.length > 200;

  return (
    <div className="event-details-page">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-link">
        <FaArrowLeft /> Back
      </button>

      {/* Main Content */}
      <div className="details-container">
        {/* Left Column: Image and Description */}
        <div className="details-left">
          {/* Event Name */}
          <h1 className="event-name">{event.name}</h1>

          {/* Banner Image */}
          {bannerImg && (
            <div className="event-banner">
              <img src={bannerImg} alt={event.name} className="banner-img" />
            </div>
          )}

          {/* Event Tags */}
          <div className="event-tags">
            <span className="tag">{event.type || "Event"}</span>
            {event.city && <span className="tag">{event.city}</span>}
          </div>

          {/* About Section */}
          <div className="about-section">
            <h3 className="section-title">About the Event</h3>
            <p className={`about-text ${expanded ? "expanded" : ""}`}>
              {description}
            </p>
            {isLongDescription && (
              <button
                className="read-more-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Event Details Card */}
        <div className="details-right">
          <div className="details-card">
            {/* Details Grid */}
            <div className="details-grid">
              {/* Date */}
              <div className="detail-item">
                <div className="detail-icon">
                  <FaCalendarAlt />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatEventDate(event.date, event.endDate)}</span>
                </div>
              </div>

              {/* Start Time */}
              {event.startTime && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaClock />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Start Time</span>
                    <span className="detail-value">{event.startTime}</span>
                  </div>
                </div>
              )}

              {/* Duration */}
              {event.duration && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaHourglass />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{event.duration}</span>
                  </div>
                </div>
              )}

              {/* Age Limit */}
              {event.ageLimit && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaUsers />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Age Limit</span>
                    <span className="detail-value">{event.ageLimit}+</span>
                  </div>
                </div>
              )}

              {/* Language */}
              {event.language && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <FaGlobe />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Language</span>
                    <span className="detail-value">{event.language}</span>
                  </div>
                </div>
              )}

              {/* Event Type */}
              <div className="detail-item">
                <div className="detail-icon">
                  <FaTag />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Event Type</span>
                  <span className="detail-value">{event.type || "N/A"}</span>
                </div>
              </div>

              {/* Location */}
              <div className="detail-item">
                <div className="detail-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Location</span>
                  <div className="location-info">
                    <span className="detail-value">{event.city || "N/A"}</span>
                    {event.address && (
                      <span className="detail-address">{event.address}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket Type */}
              {event.ticketType && (
                <div className="detail-item">
                  <div className="detail-icon">
                    <MdLocalOffer />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Ticket Type</span>
                    <span className="detail-value">{event.ticketType}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default EventDetails;