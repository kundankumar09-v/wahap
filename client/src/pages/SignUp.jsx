import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate generation of a temporary user profile securely
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("wahap_temp_user", name || `Attendee_${Math.floor(Math.random() * 1000)}`);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo">WAHAP</div>
          </Link>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to get real-time event updates</p>
        </div>

        <form className="auth-form" onSubmit={handleSignUp}>

          <div className="auth-input-group">
            <label>Full Name</label>
            <input 
               type="text" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               required 
            />
          </div>
          
          <div className="auth-input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/signin">Sign In here</Link>
        </div>

      </div>
    </div>
  );
}

export default SignUp;
