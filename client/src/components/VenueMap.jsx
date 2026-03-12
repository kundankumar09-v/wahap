import React, { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const getIcon = (type) => {
  const map = {
    stall: "🛍️",
    stage: "🎤",
    restroom: "🚻",
    food: "🍔",
    entry: "🚪",
    exit: "🏁",
    help: "🧭",
  };
  const emoji = map[type] || "📍";
  return L.divIcon({
    className: "custom-emoji-icon",
    html: `<div style="font-size: 28px; text-shadow: 0 4px 8px rgba(0,0,0,0.8); text-align: center; cursor: pointer;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function VenueMap({ eventId, layoutImage }) {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [activeStall, setActiveStall] = useState(null);
  const [stallFeedbackList, setStallFeedbackList] = useState([]);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/stalls/${eventId}`);
        setStalls(res.data);
      } catch (err) {
        console.error("Error fetching stalls:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchStalls();
  }, [eventId]);

  const fetchFeedback = async (stallId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/visits/feedback/${stallId}`);
      setStallFeedbackList(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const handleVisit = async (stall) => {
    const username = localStorage.getItem("wahap_temp_user") || "Anonymous";
    if (!feedback.trim()) return alert("Please enter some feedback first!");

    try {
      await axios.post("http://localhost:5000/api/visits/record", {
        username,
        stallId: stall._id,
        eventId,
        feedback
      });
      alert("Visit recorded and feedback submitted!");
      setFeedback("");
      fetchFeedback(stall._id);
    } catch (err) {
      console.error("Error recording visit:", err);
    }
  };

  const mapBounds = [[0, 0], [100, 100]];
  const imageUrl = layoutImage;

  if (loading) return <div>Loading Map...</div>;

  return (
    <div style={{ height: "600px", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid #ddd", boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={[50, 50]}
        zoom={2}
        crs={L.CRS.Simple}
        style={{ height: "100%", width: "100%", background: "#f1f5f9" }}
        bounds={mapBounds}
      >
        <ImageOverlay url={imageUrl} bounds={mapBounds} />
        
        {stalls.map((s, i) => (
          <Marker 
            key={i} 
            position={[100 - s.y, s.x]} 
            icon={getIcon(s.type)}
            eventHandlers={{
              click: () => {
                setActiveStall(s);
                fetchFeedback(s._id);
              },
            }}
          >
            <Popup>
              <div style={{ width: '220px', padding: '5px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{s.name}</h3>
                <p style={{ margin: '0 0 10px 0', textTransform: 'capitalize', color: '#64748b', fontSize: '13px' }}>{s.type}</p>
                
                <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px', fontSize: '12px', background: '#f8fafc', padding: '5px', borderRadius: '4px' }}>
                  <strong>Live Feedback:</strong>
                  {stallFeedbackList.length === 0 ? <p style={{ color: '#94a3b8', margin: '5px 0' }}>No feedback yet.</p> : 
                    stallFeedbackList.map((f, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}>
                        <span style={{ fontWeight: 'bold' }}>{f.username}:</span> {f.feedback}
                      </div>
                    ))
                  }
                </div>

                <textarea 
                  placeholder="Leave feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{ width: '100%', height: '50px', marginBottom: '5px', padding: '5px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                
                <button 
                  onClick={() => handleVisit(s)}
                  style={{
                    width: '100%',
                    background: '#ff0844',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  Mark as Visited
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default VenueMap;
