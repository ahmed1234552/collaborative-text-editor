import React, { useState } from 'react';
import '../styles/signup.css'; // Import CSS file for styling (create this file in the same directory)
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function Signup() {
  
  // State variables to store user input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook


  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate('/dashboard'); // Navigate to the dashboard route
    // Prepare the data object to send to the backend
    const data = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password
    };

    try {
      // Make a POST request to your backend endpoint
      const response = await axios.post('http://localhost:8082/api/v1/auth/register', data);

      // Log the response
      console.log('Signup successful:', response.data);
      
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      const accessToken = response.data.access_token;
      console.log(accessToken);
    // Set the access token in the Axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    } catch (error) {
      // Handle any errors
      console.error('Error signing up:', error);
    }
    
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div className="form-group">
          <button type="submit">Sign Up</button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
