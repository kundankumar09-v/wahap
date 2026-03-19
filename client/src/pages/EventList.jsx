import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../config";
import { EVENT_TYPES, normalizeType } from "../constants/eventTypes";
import Footer from "../components/Footer";
import "./EventList.css";

function EventList() {

  const [events, setEvents] = useState([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [params] = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  const navigate = useNavigate();

  // Initialize filters from URL params on mount
  useEffect(() => {
    const selectedType = params.get("type");
    const selectedCity = params.get("city");

    if (selectedType) {
      setType(normalizeType(selectedType));
    } else {
      setType("");
    }

    if (selectedCity) {
      setCity(selectedCity);
    } else {
      setCity("");
    }

    setInitialized(true);
  }, [params]);

  // Fetch events when filters change (only after initialized)
  useEffect(() => {
    if (!initialized) return;

    const fetchEvents = async () => {
      try {
        const query = new URLSearchParams();
        if (city) query.set("city", city);
        if (type) query.set("type", type);

        const res = await axios.get(
          `${API_URL}/api/events${query.toString() ? `?${query.toString()}` : ""}`
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      }
    };

    fetchEvents();
  }, [city, type, initialized]);

  const formatDate = (startDate, endDate) => {
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

  return (
    <div className="event-page">

      <h2>Explore Events</h2>

      {/* Filters */}
      <div className="filters">

        <select 
          value={city} 
          onChange={(e) => {
            const newCity = e.target.value;
            setCity(newCity);
            // Update URL params when user manually changes city
            const newParams = new URLSearchParams(params);
            if (newCity) {
              newParams.set("city", newCity);
            } else {
              newParams.delete("city");
            }
            navigate(`?${newParams.toString()}`);
          }}
        >
          <option value="">All Cities</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Bangalore">Bangalore</option>
          <option value="LB Nagar">LB Nagar</option>
        </select>

        <select 
          value={type} 
          onChange={(e) => {
            const newType = e.target.value;
            setType(newType);
            // Update URL params when user manually changes type
            const newParams = new URLSearchParams(params);
            if (newType) {
              newParams.set("type", newType);
            } else {
              newParams.delete("type");
            }
            navigate(`?${newParams.toString()}`);
          }}
        >
          <option value="">All Types</option>
          {EVENT_TYPES.map((typeItem) => (
            <option key={typeItem.value} value={typeItem.value}>
              {typeItem.label}
            </option>
          ))}
        </select>

      </div>

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