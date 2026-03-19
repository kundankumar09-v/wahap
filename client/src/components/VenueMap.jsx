import React, { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, SVGOverlay, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import API_URL from "../config";
import "leaflet/dist/leaflet.css";
import "./VenueMap.css";

const TYPE_CFG = {
  stall:    { icon: "🛍️", color: "#4fc3f7", label: "Stall" },
  stage:    { icon: "🎤", color: "#ffd54f", label: "Stage" },
  restroom: { icon: "🚻", color: "#81c784", label: "Restroom" },
  food:     { icon: "🍔", color: "#ef9a9a", label: "Food Court" },
  entry:    { icon: "🚪", color: "#ce93d8", label: "Entry Gate" },
  exit:     { icon: "🏁", color: "#b0bec5", label: "Exit" },
  help:     { icon: "🧭", color: "#ffab91", label: "Help Desk" },
};
const cfg = (t) => TYPE_CFG[t] || { icon: "📍", color: "#4fc3f7", label: t };

const BG_SVG = (() => {
  const W = 800, H = 800, rw = 32;
  const xs = [0, 200, 400, 600, W];
  let s = `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
  // Grid cell outlines (light, subtle) — full 4×4 grid always visible
  for (let r = 0; r < xs.length - 1; r++) {
    for (let c = 0; c < xs.length - 1; c++) {
      const bx = xs[c] + rw, by = xs[r] + rw;
      const bw = xs[c+1] - xs[c] - rw*2, bh = xs[r+1] - xs[r] - rw*2;
      if (bw > 0 && bh > 0) {
        // Faint cell outline — rooms appear on top for occupied cells
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#111827" rx="4" stroke="#1e2d4a" stroke-width="1" opacity="0.7"/>`;
      }
    }
  }
  // Corridor strips
  xs.forEach(x => s += `<rect x="${x}" y="0" width="${rw}" height="${H}" fill="#090d14"/>`);
  xs.forEach(y => s += `<rect x="0" y="${y}" width="${W}" height="${rw}" fill="#090d14"/>`);
  s += `<rect x="${W-rw}" y="0" width="${rw}" height="${H}" fill="#090d14"/>`;
  s += `<rect x="0" y="${H-rw}" width="${W}" height="${rw}" fill="#090d14"/>`;
  // Bright grid lines along corridor centers
  xs.forEach(x => s += `<line x1="${x+rw/2}" y1="0" x2="${x+rw/2}" y2="${H}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`);
  xs.forEach(y => s += `<line x1="0" y1="${y+rw/2}" x2="${W}" y2="${y+rw/2}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`);
  // Edge grid lines
  s += `<line x1="${W-rw/2}" y1="0" x2="${W-rw/2}" y2="${H}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`;
  s += `<line x1="0" y1="${H-rw/2}" x2="${W}" y2="${H-rw/2}" stroke="#2a4a8a" stroke-width="1.5" stroke-dasharray="10,6" opacity="0.8"/>`;
  // Stars
  const rng = (seed, mx) => (Math.sin(seed * 9.341) * 0.5 + 0.5) * mx;
  for (let i = 0; i < 60; i++) {
    const sx = rng(i*7+1,W), sy = rng(i*13+3,H), r2 = (rng(i*3+2,1.2)+0.3).toFixed(1);
    s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${r2}" fill="#ffffff" opacity="${(rng(i*5+4,0.35)+0.05).toFixed(2)}"/>`;
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${s}</svg>`);
})();

const MAP_BOUNDS = [[0, 0], [100, 100]];

function buildRoutes(from, to) {
  // Corridor snap centers (in the 100-unit map space)
  const snap = [12.5, 37.5, 62.5, 87.5];
  const near = (v) => snap.reduce((p, c) => Math.abs(c-v) < Math.abs(p-v) ? c : p);
  const midX = near((from.x + to.x) / 2);
  const midY = near((from.y + to.y) / 2);
  // Each point is stored as [lat, lng] = [100-y, x] for Leaflet
  // Route 1: horizontal first (bend at midX)
  const p1 = [
    [100 - from.y, from.x],
    [100 - from.y, midX],
    [100 - to.y,   midX],
    [100 - to.y,   to.x],
  ];
  // Route 2: vertical first (bend at midY)
  const p2 = [
    [100 - from.y, from.x],
    [100 - midY,   from.x],
    [100 - midY,   to.x],
    [100 - to.y,   to.x],
  ];
  const diffX = Math.abs(from.x - to.x);
  const diffY = Math.abs(from.y - to.y);
  return (diffX > 1 && diffY > 1) ? [p1, p2] : [p1];
}

const makeIcon = (stall, visited, active) => {
  const c = cfg(stall.type);
  return L.divIcon({
    className: "",
    html: `<div class="vm-marker-wrap">
      <div class="vm-room-pin${active ? " vm-room-active" : ""}" style="--pin-color:${c.color}">
        <span class="vm-room-emoji">${c.icon}</span>
        ${active ? '<div class="vm-room-pulse"></div>' : ''}
      </div>
      <div class="vm-room-label" style="--label-color:${c.color}">${stall.name}</div>
      ${visited ? '<div class="vm-visited-badge">✔</div>' : ""}
    </div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -50],
  });
};

export default function VenueMap({ eventId }) {
  const [stalls, setStalls]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [feedback, setFeedback]         = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [routeStart, setRouteStart]     = useState(null);
  const [routeEnd, setRouteEnd]         = useState(null);
  const [visitedIds, setVisitedIds]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("vm_visited_" + eventId) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    axios.get(`${API_URL}/api/stalls/${eventId}`)
      .then(r => { setStalls(r.data); const e = r.data.find(s => s.type === "entry"); if (e) setRouteStart(e); })
      .catch(console.error).finally(() => setLoading(false));
  }, [eventId]);

  const fetchFeedback = (sid) => axios.get(`${API_URL}/api/visits/feedback/${sid}`).then(r => setFeedbackList(r.data)).catch(console.error);
  const handleSetStart = (stall) => { setRouteStart(stall); alert(`🚩 Start: ${stall.name}`); };
  const handleSetEnd   = (stall) => { setRouteEnd(stall === routeEnd ? null : stall); };
  const handleVisit = async (stall) => {
    const username = localStorage.getItem("wahap_temp_user") || "Anonymous";
    if (!feedback.trim()) return alert("Please write feedback first!");
    await axios.post(`${API_URL}/api/visits/record`, { username, stallId: stall._id, eventId, feedback });
    const updated = [...new Set([...visitedIds, stall._id])];
    setVisitedIds(updated);
    localStorage.setItem("vm_visited_" + eventId, JSON.stringify(updated));
    setFeedback(""); fetchFeedback(stall._id); alert("✅ Marked as visited!");
  };

  const allPaths = routeStart
    ? stalls.filter(s => s._id !== routeStart._id).flatMap(s =>
        buildRoutes(routeStart, s).map((pts, idx) => ({
          id: `${s._id}-${idx}`, pts, color: cfg(s.type).color,
          isActive: routeEnd?._id === s._id,
        })))
    : [];

  const activeRoutes = routeEnd && routeStart ? buildRoutes(routeStart, routeEnd) : [];

  if (loading) return (
    <div className="vm-loading">
      <div className="vm-loading-hex">⬡</div>
      <p>Scanning Venue…</p>
    </div>
  );

  return (
    <div className="vm-wrapper">
      <div className="vm-legend">
        <span className="vm-legend-title">🗺️ Venue Map</span>
        {Object.entries(TYPE_CFG).map(([t, c]) => (
          <div key={t} className="vm-legend-item">
            <span className="vm-legend-dot" style={{ background: c.color, boxShadow: `0 0 5px ${c.color}` }} />
            {c.label}
          </div>
        ))}
        {routeEnd && <button className="vm-clear-route" onClick={() => setRouteEnd(null)}>✖ Clear</button>}
      </div>

      {stalls.length > 0 && (
        <div className="vm-progress-bar">
          <span>🚀 Explored: <strong>{visitedIds.length}</strong> / {stalls.length}</span>
          <div className="vm-progress-track">
            <div className="vm-progress-fill" style={{ width: `${(visitedIds.length/stalls.length)*100}%` }} />
          </div>
        </div>
      )}

      <MapContainer crs={L.CRS.Simple} bounds={MAP_BOUNDS}
        style={{ height: "560px", width: "100%", background: "#0d1117" }}
        zoomControl scrollWheelZoom={false}
        whenReady={({ target }) => setTimeout(() => target.fitBounds(MAP_BOUNDS, { padding: [24,24] }), 80)}>

        <ImageOverlay url={BG_SVG} bounds={MAP_BOUNDS} />

        {/* Zone rooms — one full grid-cell per stall, centered on stall coords */}
        <SVGOverlay bounds={MAP_BOUNDS} attributes={{ style: "overflow:visible;pointer-events:none" }}>
          {stalls.map(s => {
            // rw_u = corridor half-width in 100-unit space = 32/800*100/2 = 2
            // cell size = 200/800*100 = 25; room = cell - 2*corridor = 25-2*4 = 17; half = 8.5
            const c = cfg(s.type), hw = 8.5, cx = s.x, cy = 100 - s.y;
            const ca = 2.5; // corner accent length in units
            return (
              <g key={`zone-${s._id}`}>
                {/* Outer glow */}
                <rect x={cx-hw-1} y={cy-hw-1} width={(hw+1)*2} height={(hw+1)*2}
                  fill={c.color} fillOpacity="0.04" rx="0.8"/>
                {/* Main room floor */}
                <rect x={cx-hw} y={cy-hw} width={hw*2} height={hw*2}
                  fill="#161b2e" rx="0.6"
                  stroke={c.color} strokeWidth="0.6" strokeOpacity="0.75"/>
                {/* Inner dashed border */}
                <rect x={cx-hw+1.2} y={cy-hw+1.2} width={(hw-1.2)*2} height={(hw-1.2)*2}
                  fill="none" stroke={c.color} strokeWidth="0.25"
                  strokeDasharray="1.5,2.5" strokeOpacity="0.4" rx="0.3"/>
                {/* Color fill layer */}
                <rect x={cx-hw+1.2} y={cy-hw+1.2} width={(hw-1.2)*2} height={(hw-1.2)*2}
                  fill={c.color} fillOpacity="0.07" rx="0.3"/>
                {/* Corner bracket accents — top-left */}
                <line x1={cx-hw} y1={cy-hw+ca} x2={cx-hw} y2={cy-hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                <line x1={cx-hw} y1={cy-hw} x2={cx-hw+ca} y2={cy-hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                {/* top-right */}
                <line x1={cx+hw-ca} y1={cy-hw} x2={cx+hw} y2={cy-hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                <line x1={cx+hw} y1={cy-hw} x2={cx+hw} y2={cy-hw+ca} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                {/* bottom-left */}
                <line x1={cx-hw} y1={cy+hw-ca} x2={cx-hw} y2={cy+hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                <line x1={cx-hw} y1={cy+hw} x2={cx-hw+ca} y2={cy+hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                {/* bottom-right */}
                <line x1={cx+hw} y1={cy+hw-ca} x2={cx+hw} y2={cy+hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
                <line x1={cx+hw-ca} y1={cy+hw} x2={cx+hw} y2={cy+hw} stroke={c.color} strokeWidth="1.2" strokeOpacity="1"/>
              </g>
            );
          })}
        </SVGOverlay>

        {/* Faint background paths to all stalls using native Polyline */}
        {allPaths.filter(r => !r.isActive).map(r => (
          <Polyline key={`fp-${r.id}`} positions={r.pts}
            pathOptions={{
              color: '#3a5aad', weight: 2, opacity: 0.35,
              dashArray: '6 10', lineCap: 'round', lineJoin: 'round'
            }}
          />
        ))}

        {/* Active animated route(s) — thick, bright, clearly visible */}
        {activeRoutes.map((pts, idx) => (
          <React.Fragment key={`ar-${idx}`}>
            {/* Glow underlayer */}
            <Polyline positions={pts}
              pathOptions={{
                color: idx === 1 ? '#ff9100' : '#FFD600',
                weight: 16, opacity: 0.12,
                lineCap: 'round', lineJoin: 'round'
              }}
            />
            {/* Main solid path */}
            <Polyline positions={pts}
              pathOptions={{
                color: idx === 1 ? '#ff9100' : '#FFD600',
                weight: 5, opacity: 0.95,
                lineCap: 'round', lineJoin: 'round'
              }}
            />
            {/* White moving dashes overlay */}
            <Polyline positions={pts}
              pathOptions={{
                color: 'white', weight: 2, opacity: 0.7,
                dashArray: '4 12', lineCap: 'round', lineJoin: 'round'
              }}
            />
          </React.Fragment>
        ))}

        {stalls.map((s, i) => (
          <Marker key={i} position={[100-s.y, s.x]}
            icon={makeIcon(s, visitedIds.includes(s._id), routeEnd?._id===s._id || routeStart?._id===s._id)}
            eventHandlers={{ click: () => fetchFeedback(s._id) }}>
            <Popup maxWidth={280} minWidth={250}>
              <div className="vm-popup">
                <div className="vm-popup-header" style={{ borderBottom: `1px solid ${cfg(s.type).color}33` }}>
                  <span className="vm-popup-emoji">{cfg(s.type).icon}</span>
                  <div>
                    <h3 className="vm-popup-title">{s.name}</h3>
                    <p className="vm-popup-type" style={{ color: cfg(s.type).color }}>{cfg(s.type).label}</p>
                  </div>
                  {visitedIds.includes(s._id) && <span className="vm-popup-visited-tag">✔ Done</span>}
                </div>
                <div className="vm-popup-actions">
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button className="vm-btn vm-btn-start" style={{ flex:1 }} onClick={() => handleSetStart(s)}>🚩 Start</button>
                    <button className="vm-btn vm-btn-nav" style={{ flex:1 }} onClick={() => handleSetEnd(s)}>
                      {routeEnd?._id===s._id ? "✖ Clear" : "🧭 Route"}
                    </button>
                  </div>
                </div>
                <div className="vm-feedback-list">
                  <strong>💬 Reviews</strong>
                  {feedbackList.length===0 ? <p className="vm-no-feedback">No reviews yet!</p>
                    : feedbackList.map((f,j) => (
                      <div key={j} className="vm-feedback-item">
                        <span className="vm-feedback-user">{f.username}</span> {f.feedback}
                      </div>
                    ))}
                </div>
                <div className="vm-visit-form">
                  <textarea className="vm-textarea" placeholder="Share your experience…" value={feedback} onChange={e => setFeedback(e.target.value)}/>
                  <button className="vm-btn vm-btn-submit" onClick={() => handleVisit(s)}>✔ Mark Visited</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
