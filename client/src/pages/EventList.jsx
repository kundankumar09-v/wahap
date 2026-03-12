import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EventList.css";

function EventList() {

  const [events, setEvents] = useState([]);
  const [city, setCity] = useState("Hyderabad");
  const [type, setType] = useState("");

  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/events?city=${city}&type=${type}`
      );
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [city, type]);

  return (
    <div className="event-page">

      <h2>Explore Events</h2>

      {/* Filters */}
      <div className="filters">

        <select onChange={(e) => setCity(e.target.value)}>
          <option>Hyderabad</option>
          <option>Mumbai</option>
          <option>Bangalore</option>
        </select>

        <select onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="concert">Concert</option>
          <option value="fest">Fest</option>
          <option value="exhibition">Exhibition</option>
          <option value="wedding">Wedding</option>
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

            <img
              src={`http://localhost:5000/${event.eventImage?.replace(/\\/g, "/")}`}
              alt={event.name}
              className="card-img"
            />

            <div className="card-info">

              <h4>{event.name}</h4>
              <p className="city"> {event.city}</p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default EventList;