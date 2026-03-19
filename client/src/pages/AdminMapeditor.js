import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { MapContainer, ImageOverlay, SVGOverlay, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AdminMapeditor.css";
import "../components/VenueMap.css";

/* Dark Among Us style — with light grid lines */
const BG_SVG = (() => {
  const W = 800, H = 800, rw = 32;
  const xs = [0, 200, 400, 600, W];
  let s = `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
  for (let r = 0; r < xs.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const bx = xs[c] + rw, by = xs[r] + rw;
      const bw = xs[c+1] - xs[c] - rw*2, bh = xs[r+1] - xs[r] - rw*2;
      if (bw > 0 && bh > 0) {
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#111827" rx="4" stroke="#1e2d4a" stroke-width="1" opacity="0.7"/>`;
      }
    }
  }
  xs.forEach(x => s += `<rect x="${x}" y="0" width="${rw}" height="${H}" fill="#090d14"/>`);
  xs.forEach(y => s += `<rect x="0" y="${y}" width="${W}" height="${rw}" fill="#090d14"/>`);
  s += `<rect x="${W-rw}" y="0" width="${rw}" height="${H}" fill="#090d14"/>`;
  s += `<rect x="0" y="${H-rw}" width="${W}" height="${rw}" fill="#090d14"/>`;
  xs.forEach(x => s += `<line x1="${x+rw/2}" y1="0" x2="${x+rw/2}" y2="${H}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`);
  xs.forEach(y => s += `<line x1="0" y1="${y+rw/2}" x2="${W}" y2="${y+rw/2}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`);
  s += `<line x1="${W-rw/2}" y1="0" x2="${W-rw/2}" y2="${H}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`;
  s += `<line x1="0" y1="${H-rw/2}" x2="${W}" y2="${H-rw/2}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`;
  const rng = (seed, mx) => (Math.sin(seed * 9.341) * 0.5 + 0.5) * mx;
  for (let i = 0; i < 60; i++) {
    const sx = rng(i*7+1,W), sy = rng(i*13+3,H), r2 = (rng(i*3+2,1.2)+0.3).toFixed(1);
    s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${r2}" fill="#ffffff" opacity="${(rng(i*5+4,0.35)+0.05).toFixed(2)}"/>`;
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${s}</svg>`);
})();


function MapClickHandler({ setClickPos }) {
  useMapEvents({
    click(e) {
      const snapPoints = [12.5, 37.5, 62.5, 87.5];
      const snap = (v) => snapPoints.reduce((p, c) => Math.abs(c - v) < Math.abs(p - v) ? c : p);
      
      let rawX = Math.max(0, Math.min(100, e.latlng.lng));
      let rawY = Math.max(0, Math.min(100, 100 - e.latlng.lat));
      
      setClickPos({ x: snap(rawX), y: snap(rawY) });
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
    const fetchStalls = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/stalls/${eventId}`);
        setStalls(res.data);
      } catch (err) {
        console.error("Error fetching stalls:", err);
      }
    };
    if (eventId) fetchStalls();
  }, [eventId]);

  const getIcon = (type, name = "") => {
    const c = {
      stall:   { emoji: "🛍️", color: "#4285f4" },
      stage:   { emoji: "🎤", color: "#fbbc05" },
      restroom:{ emoji: "🚻", color: "#34a853" },
      food:    { emoji: "🍔", color: "#ea4335" },
      entry:   { emoji: "🚪", color: "#9c27b0" },
      exit:    { emoji: "🏁", color: "#607d8b" },
      help:    { emoji: "🧭", color: "#ff5722" },
      pointer: { emoji: "📍", color: "#ff0844" },
    }[type] || { emoji: "📍", color: "#ff0844" };
    return L.divIcon({
      className: "",
      html: `
        <div class="vm-marker-wrap">
          <div class="vm-room-pin" style="--pin-color:${c.color}">
            <span class="vm-room-emoji">${c.emoji}</span>
          </div>
          ${name ? `<div class="vm-room-label" style="--label-color:${c.color}">${name}</div>` : ""}
        </div>`,
      iconSize: [80, 80],
      iconAnchor: [40, 40],
      popupAnchor: [0, -50],
    });
  };

  // ✅ save stall
  const addStall = async () => {
    if (!clickPos || !stallName.trim()) {
      alert("Click map and enter name");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/stalls/add`, {
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



  const mapBounds = [[0, 0], [100, 100]];




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
          {/* Beige block-map — always shown */}
          <ImageOverlay url={BG_SVG} bounds={mapBounds} />

          {/* Dynamic Beige Block Zones & Highlight Circles */}
          <SVGOverlay bounds={mapBounds} attributes={{ style: "overflow:visible;pointer-events:none" }}>
            {stalls.map((s, i) => {
              const bx = s.x - 8.5, by = (100 - s.y) - 8.5;
              const c = { stall: "#4285f4", stage: "#fbbc05", restroom: "#34a853", food: "#ea4335", entry: "#9c27b0", exit: "#607d8b", help: "#ff5722" }[s.type] || "#4285f4";
              return (
                <g key={`zone-bg-${i}`}>
                  <rect x={bx} y={by} width={17} height={17} fill="#e5dece" rx="0.625"/>
                  <rect x={bx + 1} y={by + 1} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.6"/>
                  <rect x={bx + 9} y={by + 1} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.6"/>
                  <rect x={bx + 1} y={by + 9} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.5"/>
                  <rect x={bx + 9} y={by + 9} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.5"/>

                  <circle cx={s.x} cy={100 - s.y} r={6} fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.6" strokeDasharray="1.5,1.5" />
                  <circle cx={s.x} cy={100 - s.y} r={2} fill={c} fillOpacity="0.5" />
                </g>
              );
            })}
            
            {clickPos && (
              <g>
                <rect x={clickPos.x - 8.5} y={(100 - clickPos.y) - 8.5} width={17} height={17} fill="#e5dece" rx="0.625" opacity="0.8"/>
                <rect x={clickPos.x - 7.5} y={(100 - clickPos.y) - 7.5} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.6"/>
                <rect x={clickPos.x + 0.5} y={(100 - clickPos.y) - 7.5} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.6"/>
                <rect x={clickPos.x - 7.5} y={(100 - clickPos.y) + 0.5} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.5"/>
                <rect x={clickPos.x + 0.5} y={(100 - clickPos.y) + 0.5} width={7} height={7} fill="#d9d2be" rx="0.375" opacity="0.5"/>
              </g>
            )}
          </SVGOverlay>

          <MapClickHandler setClickPos={setClickPos} />

          {/* 🔴 saved markers */}
          {stalls.map((s, i) => (
            <Marker key={i} position={[100 - s.y, s.x]} icon={getIcon(s.type, s.name)}>
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