import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../config";
import { EVENT_TYPES } from "../constants/eventTypes";
import Footer from "../components/Footer";
import "./EventList.css";

function EventList() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Extract filters from URL
  const city = params.get("city") || "";
  const type = params.get("type") || "";
  const search = params.get("query") || "";

  // Fetch events when params change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (city && city !== "All") queryParams.set("city", city);
        if (type) queryParams.set("type", type);
        if (search) queryParams.set("query", search);

        const res = await axios.get(
          `${API_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, type, search]);

  const formatDate = (startDate, endDate) => {
    if (!startDate) return "TBA";
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return "TBA";

    const startStr = start.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).replace(/,/g, '');

    if (!endDate) {
      return startStr;
    }

    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
      return startStr;
    }

    if (startDate === endDate || start.getTime() === end.getTime()) {
      return startStr;
    }

    return `${startStr} onwards`;
  };

  return (
    <div className="event-page">
      {loading && <div className="loading-overlay">✨ Discovering nearby events...</div>}

      {/* Cards */}
      <div className="cards">

        {events.map((event) => (

          <div
            key={event._id}
            className="card"
            onClick={() => navigate(`/event/${event._id}`)}
          >
            <div className="event-poster-wrap">
              <img
                src={`${API_URL}/${event.eventImage?.replace(/\\/g, "/")}`}
                alt={event.name}
                className="card-img"
              />
              <div className="event-bottom-strip">{formatDate(event.date, event.endDate)}</div>
            </div>

            <div className="card-info">
              <h4>{event.name}</h4>
              <p className="city">{event.type}</p>
            </div>

          </div>

        ))}

      </div>

      <Footer />
    </div>
  );
}

export default EventList;