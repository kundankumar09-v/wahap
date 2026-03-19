import { FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">WAHAP</div>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/events">Events</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><a href="/events?type=music">Music</a></li>
            <li><a href="/events?type=comedy">Comedy Shows</a></li>
            <li><a href="/events?type=festivals">Festivals</a></li>
            <li><a href="/events?type=workshops">Workshops</a></li>
            <li><a href="/events?type=sports">Sports</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact Info</h4>
          <ul className="footer-contact">
            <li className="contact-item">
              <MdEmail className="contact-icon" />
              <a href="mailto:wahap123@gmail.com">wahap123@gmail.com</a>
            </li>
            <li className="contact-item">
              <MdPhone className="contact-icon" />
              <a href="tel:+919876543210">+91 9876543210</a>
            </li>
            <li className="contact-item">
              <MdLocationOn className="contact-icon" />
              <span>India</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <ul className="footer-social">
            <li>
              <a href="https://instagram.com/wahap_official" target="_blank" rel="noopener noreferrer">
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a href="https://twitter.com/wahap_live" target="_blank" rel="noopener noreferrer">
                <FaTwitter /> Twitter
              </a>
            </li>
            <li>
              <a href="https://linkedin.com/company/wahap-events" target="_blank" rel="noopener noreferrer">
                <FaLinkedin /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 WAHAP. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
