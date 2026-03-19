import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call for dynamic feeling
    setTimeout(() => {
      setLoading(false);
      // Navigate exactly to what the abstract says - generating a temporary username and pushing to Home.
      localStorage.setItem("wahap_temp_user", `Attendee_${Math.floor(Math.random() * 1000)}`);
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue exploring events</p>
        </div>

        <form className="auth-form" onSubmit={handleSignIn}>
          
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
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link to="/signup">Sign Up here</Link>
        </div>

      </div>
    </div>
  );
}

export default SignIn;
