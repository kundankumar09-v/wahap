import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaQrcode, FaSignInAlt, FaSearch, FaUserAstronaut } from "react-icons/fa";
import axios from "axios";
import "./Home.css";

function Home() {

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for our temporary simulated session
    const activeUser = localStorage.getItem("wahap_temp_user");
    if (activeUser) {
      setUser(activeUser);
    }
  }, []);

  // categories for Best of Live Events
  const categories = [
    {
      name: "Adventure",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    },
    {
      name: "Concert",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063"
    },
    {
      name: "College Fests",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
    },
    {
      name: "Comedy",
      // Updated broken Unsplash image
      image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca"
    },
    {
      name: "Exhibition",
      image: "https://images.unsplash.com/photo-1500534623283-312aade485b7"
    }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  const filteredEvents = events.filter((event) => {
    const name = event.name || event.title || "";
    const city = event.city || event.location || "";
    
    const nameMatch = name.toLowerCase().includes((search || "").toLowerCase());
    
    // Fuzzy city matching for typos like "lb nagat" vs "LB Nagar"
    const cityMatch = selectedCity === "All" || 
      city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (selectedCity === "LB Nagar" && city.toLowerCase().includes("lb naga"));
      
    return nameMatch && cityMatch;
  });

  const cities = ["All", "Hyderabad", "Mumbai", "Delhi", "Bangalore", "LB Nagar"];

  return (
    <div>

      {/* NAVBAR */}
      <div className="navbar">

        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" style={{ cursor: 'pointer' }}>WAHAP</div>
        </Link>

        <div className="search-wrapper">
          <div className="location-box">
            <FaMapMarkerAlt className="loc-icon" />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="location-select"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="search-bar-inner">
            <FaSearch className="search-icon" />
            <input
              className="search"
              placeholder="Search amazing events, music, comedy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="qr">
          <FaQrcode style={{ marginRight: '6px', fontSize: '16px', verticalAlign: 'middle' }} /> 
          Scan QR
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#1e293b' }}>
            <FaUserAstronaut style={{ fontSize: '24px', color: '#ff0844' }} />
            {user}
            <button 
              onClick={() => { localStorage.removeItem("wahap_temp_user"); setUser(null); }}
              style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', marginLeft: '10px', cursor: 'pointer', fontSize: '12px' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/signin">
            <button className="signin">
              <FaSignInAlt style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Sign In
            </button>
          </Link>
        )}

      </div>

      {/* BANNERS */}
      <div className="banner-section">

        <img
          src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&h=400"
          className="banner"
          alt="banner"
        />

        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&h=400"
          className="banner"
          alt="banner"
        />

      </div>

      {/* RECOMMENDED EVENTS */}
      <h2 className="section-title">All Events</h2>

      <div className="cards">

        {filteredEvents.map((event) => (
          <Link to={`/event/${event._id}`} key={event._id} className="card-link">
            <div className="card">
              <img
                src={formatImageUrl(event.eventImage || event.bannerImage || event.venueLayoutImage)}
                className="card-img"
                alt={event.name || event.title}
              />
              <div className="card-info">
              <h4>{event.name || event.title}</h4>
              <p className="city">📍 {event.city || event.location}</p>
            </div>
            </div>
          </Link>
        ))}

      </div>


      {/* BEST OF LIVE EVENTS */}
      <h2 className="section-title">Best of Live Events</h2>

      <div className="category-cards">

        {categories.map((cat) => (

          <div
            key={cat.name}
            className="category-card"
            onClick={() => window.location.href=`/events?type=${cat.name.toLowerCase()}`}
          >

            <img
              src={cat.image}
              className="category-img"
              alt={cat.name}
            />

            <div className="category-title">
              {cat.name}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Home;