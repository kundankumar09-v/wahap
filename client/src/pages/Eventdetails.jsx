import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUsers, FaGlobe, FaMapMarkerAlt, FaTag, FaHourglass, FaQrcode } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import API_URL from "../config";
import "./Eventdetails.css";
import Footer from "../components/Footer";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
      <button onClick={() => navigate(-1)} className="back-link">
        <FaArrowLeft /> Back
      </button>

      <div className="details-container">
        <div className="details-left">
          <h1 className="event-name">{event.name}</h1>

          {bannerImg && (
            <div className="event-banner">
              <img src={bannerImg} alt={event.name} className="banner-img" />
            </div>
          )}

          <div className="event-tags">
            <span className="tag">{event.type || "Event"}</span>
            {event.city && <span className="tag">{event.city}</span>}
          </div>

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

        <div className="details-right">
          <div className="details-card">
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <FaCalendarAlt />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatEventDate(event.date, event.endDate)}</span>
                </div>
              </div>

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

              <div className="detail-item">
                <div className="detail-icon">
                  <FaTag />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Event Type</span>
                  <span className="detail-value">{event.type || "N/A"}</span>
                </div>
              </div>

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

            <div className="qr-reveal-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
                <button 
                  onClick={() => setShowQR(!showQR)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', fontSize: '14px', fontWeight: '600' }}
                >
                  <FaQrcode /> {showQR ? "Hide Event QR" : "Generate Event QR"}
                </button>
                
                {showQR && (
                  <div style={{ marginTop: '15px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'inline-block' }}>
                    <QRCodeCanvas value={id} size={160} level="H" includeMargin={true} />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>Scan this code to enter the event</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EventDetails;