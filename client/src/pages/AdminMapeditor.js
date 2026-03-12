import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AdminMapeditor.css";

function MapClickHandler({ setClickPos }) {
  useMapEvents({
    click(e) {
      // Map Leaflet [lat, lng] to original percentage [y, x] with origin at top-left
      // Make sure values stay between 0 and 100
      let x = Math.max(0, Math.min(100, e.latlng.lng));
      let y = Math.max(0, Math.min(100, 100 - e.latlng.lat));
      setClickPos({ x, y });
    },
  });
  return null;
}

function AdminMapEditor() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  // 🔥 read layout from URL
  const layoutImage = searchParams.get("layout");

  const [stalls, setStalls] = useState([]);
  const [clickPos, setClickPos] = useState(null);
  const [stallName, setStallName] = useState("");
  const [stallType, setStallType] = useState("stall");

  // 🧪 DEBUG
  useEffect(() => {
    console.log("EVENT ID:", eventId);
    console.log("LAYOUT IMAGE:", layoutImage);
  }, [eventId, layoutImage]);

  // 🎨 icons
  const getIcon = (type) => {
    const map = {
      "stall": "🛍️",
      "stage": "🎤",
      "restroom": "🚻",
      "food": "🍔",
      "entry": "🚪",
      "exit": "🏁",
      "help": "🧭",
      "pointer": "📍"
    };
    const emoji = map[type] || "📍";
    return L.divIcon({
      className: "custom-emoji-icon",
      html: `<div style="font-size: 28px; text-shadow: 0 4px 8px rgba(0,0,0,0.8); text-align: center;">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18], // Center the icon
    });
  };

  // ✅ save stall
  const addStall = async () => {
    if (!clickPos || !stallName.trim()) {
      alert("Click map and enter name");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/stalls/add", {
        eventId,
        name: stallName,
        type: stallType,
        x: clickPos.x,
        y: clickPos.y,
      });

      // update locally
      setStalls((prev) => [
        ...prev,
        { name: stallName, type: stallType, x: clickPos.x, y: clickPos.y },
      ]);

      setStallName("");
      setClickPos(null);
    } catch (err) {
      console.error("STALL SAVE ERROR:", err);
      alert("Error saving stall");
    }
  };

  // 🚨 guard: no layout
  if (!layoutImage) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>❌ Layout not found</h3>
        <p>Make sure event creation redirect worked.</p>
      </div>
    );
  }

  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  const mapBounds = [[0, 0], [100, 100]];
  const imageUrl = formatImageUrl(layoutImage);

  // 🟦 Draw Grid Overlay
  const renderGrid = () => {
    const lines = [];
    const spacing = 10; // Every 10%
    // Note: Leaflet CRS.Simple uses [y, x] for positions on standard Cartesian, mapped here to [100-y, x] typically for ImageOverlay, 
    // but our image overlay is from [0,0] to [100,100]. 

    // Vertical lines
    for (let i = 0; i <= 100; i += spacing) {
      lines.push(
        <Polyline
          key={`v-${i}`}
          positions={[[0, i], [100, i]]}
          color="rgba(148, 163, 184, 0.4)" // lighter color for dark bg
          weight={1.5}
          dashArray="4, 4"
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= 100; i += spacing) {
      lines.push(
        <Polyline
          key={`h-${i}`}
          positions={[[i, 0], [i, 100]]}
          color="rgba(148, 163, 184, 0.4)" // lighter color for dark bg
          weight={1.5}
          dashArray="4, 4"
        />
      );
    }
    return lines;
  };

  return (
    <div className="map-editor-container">
      {/* 🗺️ MAP */}
      <div className="map-editor-wrapper">
        <MapContainer
          center={[50, 50]}
          zoom={2}
          crs={L.CRS.Simple}
          minZoom={0}
          maxZoom={4}
          style={{ height: "100%", width: "100%", backgroundColor: "transparent" }}
          bounds={mapBounds}
          maxBounds={[[ -20, -20 ], [ 120, 120 ]]} // Allow some dragging outside but bounce back
        >
          <ImageOverlay url={imageUrl} bounds={mapBounds} />
          {renderGrid()}
          <MapClickHandler setClickPos={setClickPos} />

          {/* 🔴 saved markers */}
          {stalls.map((s, i) => (
            <Marker key={i} position={[100 - s.y, s.x]} icon={getIcon(s.type)}>
              <Popup>
                <strong>{s.name}</strong> <br /> 
                <span style={{ textTransform: "capitalize" }}>{s.type}</span>
              </Popup>
            </Marker>
          ))}

          {/* 🟢 temporary click marker */}
          {clickPos && (
            <Marker position={[100 - clickPos.y, clickPos.x]} icon={getIcon("pointer")}>
              <Popup>New Element Here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* 🎛️ SIDE PANEL */}
      <div className="map-sidebar">
        <h3>Design Venue</h3>

        <input
          placeholder="Element Name"
          value={stallName}
          onChange={(e) => setStallName(e.target.value)}
          className="map-input"
        />

        <select
          value={stallType}
          onChange={(e) => setStallType(e.target.value)}
          className="map-select"
        >
          <option value="stall">🛍️ Stall</option>
          <option value="stage">🎤 Stage</option>
          <option value="restroom">🚻 Restroom</option>
          <option value="food">🍔 Food Court</option>
          <option value="entry">🚪 Entry</option>
          <option value="exit">🏁 Exit</option>
          <option value="help">🧭 Help Desk</option>
        </select>

        <button 
          onClick={addStall} 
          className="map-save-btn"
        >
          Save to Map
        </button>

        {clickPos ? (
          <div className="status-box status-success">
            ✅ Highlighted location perfectly captured! Start typing the name and save this element.
          </div>
        ) : (
          <div className="status-box status-info">
            👉 Tap precisely where you want to drop a new venue element on your interactive canvas.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMapEditor;