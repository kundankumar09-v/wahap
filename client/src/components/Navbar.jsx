import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaQrcode,
  FaSignInAlt,
  FaChevronDown
} from "react-icons/fa";
import "./Navbar.css";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bangalore"];

function Navbar() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SEARCH
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Real-time search as user types
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      navigate(`/events?query=${value}`);
    } else {
      navigate("/events");
    }
  };

  // 🔥 AUTO LOCATION (FIXED)
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `http://localhost:5000/api/location/reverse?lat=${lat}&lng=${lng}`
          );

          const data = await res.json();

          if (data.city) {
            setSelectedCity(data.city);
            navigate(`/events?city=${data.city}`);
          } else {
            alert("Select location manually");
          }
        } catch (err) {
          console.error(err);
          alert("Error detecting location");
        }

        setIsDetecting(false);
        setIsDropdownOpen(false);
      },
      () => {
        alert("Location permission denied");
        setIsDetecting(false);
      }
    );
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="logo">WAHAP</Link>
      </div>

      {/* CENTER */}
      <form className="nav-search" onSubmit={handleSearch}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={handleSearchChange}
        />
      </form>

      {/* RIGHT */}
      <div className="nav-right">
        {/* LOCATION */}
        <div className="location-box" ref={dropdownRef}>
          <div
            className="location-display"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaMapMarkerAlt />
            <span>{selectedCity}</span>
            <FaChevronDown />
          </div>

          {isDropdownOpen && (
            <div className="location-dropdown">
              <div className="dropdown-item" onClick={detectLocation}>
                {isDetecting ? "Detecting..." : "📍 Use My Location"}
              </div>

              {CITIES.map((city) => (
                <div
                  key={city}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsDropdownOpen(false);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR */}
        <button className="qr-btn" onClick={() => navigate("/scan-qr")}>
          <FaQrcode /> Scan QR
        </button>

        {/* SIGN IN */}
        <button className="signin-btn" onClick={() => navigate("/signin")}>
          <FaSignInAlt /> Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;