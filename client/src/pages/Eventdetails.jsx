import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import VenueMap from "../components/VenueMap";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) return <div>Loading...</div>;
  
  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/" style={{ marginBottom: "20px", display: "inline-block" }}>
        ← Back to Events
      </Link>

      <img
        src={formatImageUrl(event.eventImage || event.bannerImage || event.venueLayoutImage)}
        alt={event.name || event.title}
        style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "20px", boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      />

      <h1 style={{ fontSize: '36px', marginTop: '20px' }}>{event.name || event.title}</h1>
      <p><strong>Type:</strong> {event.type || "N/A"}</p>
      <p><strong>City:</strong> {event.city || event.location || "N/A"}</p>
      <p><strong>Address:</strong> {event.address || "N/A"}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Duration:</strong> {event.duration}</p>
      <p><strong>Age Limit:</strong> {event.ageLimit}</p>
      <p><strong>Ticket:</strong> {event.ticketType}</p>
      <p><strong>Language:</strong> {event.language}</p>
      
      <h3>About Event</h3>
      <p>{event.aboutEvent || event.description || "No description provided."}</p>

      {(event.layoutImage || event.venueLayoutImage) && (
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "20px" }}>Interactive Venue Map</h3>
          <p style={{ color: "#64748b", marginBottom: "15px", fontSize: "14px" }}>
            Explore the venue and click on stalls to view details or mark your visit.
          </p>
          <VenueMap 
            eventId={event._id} 
            layoutImage={formatImageUrl(event.layoutImage || event.venueLayoutImage)} 
          />
        </div>
      )}
    </div>
  );
}

export default EventDetails;