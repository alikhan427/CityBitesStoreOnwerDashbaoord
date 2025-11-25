// components/LocationComponent.js
import React, { useState, useEffect } from 'react';
import locationService from '../services/locationService';

const LocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize location service when component mounts
    const initLocationService = async () => {
      try {
        await locationService.initialize();
        console.log('Location service ready');
      } catch (err) {
        console.error('Failed to initialize location service:', err);
      }
    };
    
    initLocationService();
  }, []);

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const locationDetails = await locationService.getCurrentLocationWithDetails();
      setLocation(locationDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={loading}>
        {loading ? 'Getting Location...' : 'Get Current Location'}
      </button>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      {location && (
        <div>
          <h3>Location Details:</h3>
          <p><strong>Address:</strong> {location.fullAddress}</p>
          <p><strong>City:</strong> {location.city || 'N/A'}</p>
          <p><strong>State:</strong> {location.state || 'N/A'}</p>
          <p><strong>Country:</strong> {location.country || 'N/A'}</p>
          <p><strong>Coordinates:</strong> {location.latitude}, {location.longitude}</p>
        </div>
      )}
    </div>
  );
};

export default LocationComponent;