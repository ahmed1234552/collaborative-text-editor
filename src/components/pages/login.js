import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import '../styles/login.css'; // Import CSS file
import axios from 'axios'; // Import axios for making HTTP requests

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a login request to the backend
      const response = await axios.post('http://localhost:8082/api/v1/auth/login', {
        email,
        password,
        
      });

      const accessToken = response.data.access_token;
      console.log("login:");
      console.log(response);
      console.log(accessToken);
      // Set the access token in the Axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // If login is successful, navigate to the dashboard route
      navigate('/dashboard');
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
