import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "./Login.css"
import Signup from '../SignUp/Signup';
import { Link } from 'react-router-dom';
import api from '../../Service/api';
// Ensure this component accepts props if needed, but navigate hook is local
function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(""); // Make sure 'setError' is spelled correctly here

  const navigate = useNavigate(); // Initialize the hook inside the component

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'STUDENT') {
        navigate('/student');
      }
    }
  }, [navigate]);


  const handleLoginSubmit = (event) => {
    event.preventDefault();

    let loginDetails = {
      userName: name.trim(),
      password: password
    };

    api.post("/api/auth/login", loginDetails)
      .then(response => {
        const data = response.data;
        console.log("Response from server:", data);

        // Check if data contains a token (adjust based on actual backend response)
        // Assuming backend returns { token: "..." } or similar, or just the token string
        if (data && data.token) {
          const token = data.token;
          const role = data.role; // Extract role from response
          const userId = data.userId;
          const name = data.userName; // FIX: LoginResponse uses userName, not name
          const email = data.email;

          console.log("Login successful! Token:", token, "Role:", role, "User:", name);

          localStorage.setItem('token', token);
          localStorage.setItem('userName', name); // Store username for profile
          localStorage.setItem('userId', userId);
          localStorage.setItem('email', email);

          if (role) {
            localStorage.setItem('role', role);
          }

          // Clear any previous errors
          setError("");

          // Trigger storage event for Header to update (works in same tab)
          window.dispatchEvent(new Event('storage'));

          // Conditional Redirect based on Role
          if (role === 'ADMIN') {
            navigate('/admin');
          } else if (role === 'STUDENT') {
            navigate('/student');
          } else {
            // Strict Mode: No fallback to landing. Show error if role is unknown.
            console.error("Unknown role:", role);
            setError("Login successful, but no valid role assigned. Contact Admin.");
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
          }

        } else {
          // Invalid credentials or user not found
          setError("Invalid credentials. Please check your username/email and password.");
        }
      })
      .catch(err => {
        console.error("Login Error:", err);
        const serverError = err.response?.data?.error;
        if (serverError) {
          setError(serverError);
        } else if (err.response?.status === 401) {
          setError("Invalid username/email or password.");
        } else if (err.message && err.message.includes("Network")) {
          setError("Network error: Cannot reach the backend server at http://localhost:8080.");
        } else {
          setError("Login failed. Please verify your credentials and try again.");
        }
      });
  };


  return (
    <>

      <div className="login-wrapper" style={{ position: 'relative' }}>
        <div className="Login">
          <h2>Login</h2>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
          <form onSubmit={handleLoginSubmit} autoComplete="off">
            {/* Inputs use your state variables: */}
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Username or Email" autoComplete="off" /><br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" autoComplete="new-password" /><br />
            <button type="submit">Log In</button>
            don't have an account?  <Link to="/Signup">Signup</Link>
          </form>
        </div>
      </div>

    </>
  );
}

export default Login;


