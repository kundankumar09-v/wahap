import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaQrcode,
  FaSearch,
  FaSignInAlt,
  FaUserAstronaut,
} from "react-icons/fa";
import axios from "axios";
import API_URL from "../config";
import { EVENT_TYPES, formatTypeLabel, normalizeType } from "../constants/eventTypes";
import { DEFAULT_HERO_BANNERS, fetchHeroBanners } from "../constants/heroBanners";
import Footer from "../components/Footer";
import "./Home.css";

const CITIES = ["All", "Hyderabad", "Mumbai", "Delhi", "Bangalore", "LB Nagar"];
const HOME_SECTION_PREVIEW_LIMIT = 10;

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreEvent = (event, query) => {
  if (!query) return 1;

  const tokens = query.split(" ").filter(Boolean);
  const name = normalizeText(event.name || event.title || "");
  const type = normalizeText(event.type || "");
  const city = normalizeText(event.city || event.location || "");
  const address = normalizeText(event.address || "");
  const about = normalizeText(event.aboutEvent || event.description || "");
  const language = normalizeText(event.language || "");

  const blendedText = [name, type, city, address, about, language].join(" ");
  let score = 0;

  if (name === query) score += 250;
  if (name.startsWith(query)) score += 160;
  if (name.includes(query)) score += 110;
  if (type.includes(query)) score += 90;
  if (blendedText.includes(query)) score += 40;

  let matchedTokenCount = 0;
  tokens.forEach((token) => {
    if (name.includes(token)) {
      score += 55;
      matchedTokenCount += 1;
      return;
    }
    if (type.includes(token)) {
      score += 38;
      matchedTokenCount += 1;
      return;
    }
    if (city.includes(token) || address.includes(token)) {
      score += 24;
      matchedTokenCount += 1;
      return;
    }
    if (about.includes(token) || language.includes(token)) {
      score += 16;
      matchedTokenCount += 1;
    }
  });

  if (tokens.length > 0 && matchedTokenCount === tokens.length) score += 65;
  return score;
};

const formatEventDate = (startDate, endDate) => {
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

function Home() {

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [user, setUser] = useState(null);
  const [rowArrows, setRowArrows] = useState({});
  const [heroBanners, setHeroBanners] = useState(DEFAULT_HERO_BANNERS);
  const rowRefs = useRef({});
  const bannerRef = useRef(null);
  const heroIndexRef = useRef(0);
  const heroTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for our temporary simulated session
    const activeUser = localStorage.getItem("wahap_temp_user");
    if (activeUser) {
      setUser(activeUser);
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const apiBanners = await fetchHeroBanners();
        setHeroBanners(apiBanners);
      } catch (error) {
        console.error("Failed to load hero banners:", error);
        setHeroBanners(DEFAULT_HERO_BANNERS);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(normalizeText(search));
    }, 220);

    return () => clearTimeout(debounce);
  }, [search]);

  const formatImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const rankedEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (selectedCity === "All") return true;
        const eventCity = normalizeText(event.city || event.location || "");
        const selected = normalizeText(selectedCity);
        return eventCity.includes(selected);
      })
      .map((event) => ({
        ...event,
        searchScore: scoreEvent(event, searchTerm),
      }))
      .filter((event) => event.searchScore > 0)
      .sort((a, b) => {
        if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;

        const timeA = new Date(a.date || 0).getTime() || 0;
        const timeB = new Date(b.date || 0).getTime() || 0;
        if (timeA !== timeB) return timeA - timeB;

        return (a.name || "").localeCompare(b.name || "");
      });
  }, [events, searchTerm, selectedCity]);

  const groupedEvents = useMemo(() => {
    const grouped = rankedEvents.reduce((acc, event) => {
      const key = normalizeType(event.type || "") || "others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});

    const orderedFromMaster = EVENT_TYPES.map((typeItem) => typeItem.value).filter(
      (key) => grouped[key]?.length
    );

    const dynamicKeys = Object.keys(grouped)
      .filter((key) => !orderedFromMaster.includes(key))
      .sort((a, b) => formatTypeLabel(a).localeCompare(formatTypeLabel(b)));

    return [...orderedFromMaster, ...dynamicKeys].map((typeKey) => ({
      typeKey,
      label: formatTypeLabel(typeKey),
      previewItems: grouped[typeKey].slice(0, HOME_SECTION_PREVIEW_LIMIT),
    }));
  }, [rankedEvents]);

  const buildViewAllLink = useCallback(
    (typeKey) => {
      const query = new URLSearchParams();
      query.set("type", typeKey);
      if (selectedCity !== "All") {
        query.set("city", selectedCity);
      }
      return `/events?${query.toString()}`;
    },
    [selectedCity]
  );

  const updateArrowState = useCallback((typeKey) => {
    const rowEl = rowRefs.current[typeKey];
    if (!rowEl) return;

    const maxLeft = rowEl.scrollWidth - rowEl.clientWidth;
    const showLeft = rowEl.scrollLeft > 8;
    const showRight = maxLeft - rowEl.scrollLeft > 8;

    setRowArrows((prev) => {
      const existing = prev[typeKey] || { showLeft: false, showRight: false };
      if (existing.showLeft === showLeft && existing.showRight === showRight) {
        return prev;
      }

      return {
        ...prev,
        [typeKey]: { showLeft, showRight },
      };
    });
  }, []);

  const scrollRowBy = useCallback(
    (typeKey, direction) => {
      const rowEl = rowRefs.current[typeKey];
      if (!rowEl) return;

      const cardWidth = rowEl.querySelector(".event-card-link")?.clientWidth || 220;
      const step = Math.max(cardWidth * 2, 300);
      rowEl.scrollBy({ left: direction * step, behavior: "smooth" });

      window.setTimeout(() => updateArrowState(typeKey), 340);
    },
    [updateArrowState]
  );

  useEffect(() => {
    groupedEvents.forEach((group) => updateArrowState(group.typeKey));

    const handleResize = () => {
      groupedEvents.forEach((group) => updateArrowState(group.typeKey));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [groupedEvents, updateArrowState]);

  useEffect(() => {
    const bannerEl = bannerRef.current;
    if (!bannerEl || heroBanners.length <= 1) return;

    const children = Array.from(bannerEl.querySelectorAll(".banner"));
    if (children.length <= 1) return;

    heroIndexRef.current = 0;
    bannerEl.scrollTo({ left: 0, behavior: "auto" });

    const moveToIndex = (targetIndex, behavior = "smooth") => {
      const target = children[targetIndex];
      if (!target) return;
      const scrollTo = target.offsetLeft;
      bannerEl.scrollTo({ left: scrollTo, behavior });
    };

    const startAuto = () => {
      if (heroTimerRef.current) window.clearInterval(heroTimerRef.current);
      heroTimerRef.current = window.setInterval(() => {
        heroIndexRef.current = (heroIndexRef.current + 1) % children.length;
        moveToIndex(heroIndexRef.current);
      }, 2600);
    };

    const syncIndexFromScroll = () => {
      const scrollLeft = bannerEl.scrollLeft;
      let nearest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      children.forEach((item, idx) => {
        const distance = Math.abs(item.offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = idx;
        }
      });

      heroIndexRef.current = nearest;
    };

    const handleManualIntent = () => {
      syncIndexFromScroll();
      startAuto();
    };

    bannerEl.addEventListener("wheel", handleManualIntent, { passive: true });
    bannerEl.addEventListener("touchstart", handleManualIntent, { passive: true });
    bannerEl.addEventListener("mousedown", handleManualIntent);
    startAuto();

    return () => {
      bannerEl.removeEventListener("wheel", handleManualIntent);
      bannerEl.removeEventListener("touchstart", handleManualIntent);
      bannerEl.removeEventListener("mousedown", handleManualIntent);
      if (heroTimerRef.current) {
        window.clearInterval(heroTimerRef.current);
        heroTimerRef.current = null;
      }
    };
  }, [heroBanners]);

  return (
    <div className="home-page">

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
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="search-bar-inner">
            <FaSearch className="search-icon" />
            <input
              className="search"
              placeholder="Search events by name, type, city, language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="qr" onClick={() => navigate("/scan-qr")}>
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
      <div className="banner-section" ref={bannerRef}>
        {heroBanners.map((banner) => (
          <img
            key={banner._id || banner.id}
            src={banner.image}
            className="banner"
            alt={banner.alt}
          />
        ))}
      </div>

      <div className="section-meta">
        <h2 className="section-title">Explore by Event Type</h2>
        <p>
          {searchTerm
            ? `Showing ${rankedEvents.length} result${rankedEvents.length === 1 ? "" : "s"} for "${search}"`
            : `Showing ${rankedEvents.length} event${rankedEvents.length === 1 ? "" : "s"} across curated sections`}
        </p>
      </div>

      {groupedEvents.length === 0 ? (
        <div className="empty-results">
          <h3>No events matched your search.</h3>
          <p>Try another keyword, choose a different city, or clear the query.</p>
        </div>
      ) : (
        groupedEvents.map((group) => (
          <section className="type-section" key={group.typeKey}>
            <div className="type-row-head">
              <h3>{group.label}</h3>
              <Link to={buildViewAllLink(group.typeKey)} className="view-all-link">
                View all
              </Link>
            </div>

            <div className="event-row-shell">
              {rowArrows[group.typeKey]?.showLeft && (
                <button
                  type="button"
                  className="row-arrow left"
                  aria-label={`Scroll ${group.label} left`}
                  onClick={() => scrollRowBy(group.typeKey, -1)}
                >
                  <FaChevronLeft />
                </button>
              )}

              <div
                className="event-row"
                ref={(el) => {
                  rowRefs.current[group.typeKey] = el;
                }}
                onScroll={() => updateArrowState(group.typeKey)}
              >
                {group.previewItems.map((event) => (
                  <Link to={`/event/${event._id}`} key={event._id} className="event-card-link">
                    <article className="event-card">
                      <div className="event-poster-wrap">
                        <img
                          src={formatImageUrl(event.eventImage || event.bannerImage || event.venueLayoutImage)}
                          className="event-poster"
                          alt={event.name || event.title}
                        />
                        <div className="event-bottom-strip">{formatEventDate(event.date, event.endDate)}</div>
                      </div>
                      <div className="event-caption">
                        <h4>{event.name || event.title}</h4>
                        <p>{formatTypeLabel(event.type)}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {rowArrows[group.typeKey]?.showRight && (
                <button
                  type="button"
                  className="row-arrow right"
                  aria-label={`Scroll ${group.label} right`}
                  onClick={() => scrollRowBy(group.typeKey, 1)}
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
          </section>
        ))
      )}

      <Footer />
    </div>
  );
}

export default Home;