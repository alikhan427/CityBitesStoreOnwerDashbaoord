// services/locationService.js
import { Country, State, City } from 'country-state-city';

class LocationService {
  constructor() {
    this.countries = [];
    this.statesCache = new Map();
    this.citiesCache = new Map();
    this.isInitialized = false;
    this.googleMapsApiKey = 'AIzaSyCuVTYbYdLC5h1cULTh8W40C_vnQF67IlU'; // Your Google Maps API key
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.countries = Country.getAllCountries();
      this.isInitialized = true;
      console.log('📍 Location service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize location service:', error);
      throw error;
    }
  }

  getCountries() {
    if (!this.isInitialized) {
      throw new Error('LocationService not initialized');
    }
    return this.countries;
  }

  async getStates(countryCode) {
    if (!this.isInitialized) {
      throw new Error('LocationService not initialized');
    }

    if (this.statesCache.has(countryCode)) {
      return this.statesCache.get(countryCode);
    }

    const states = State.getStatesOfCountry(countryCode);
    this.statesCache.set(countryCode, states);
    return states;
  }

  async getCities(countryCode, stateCode) {
    if (!this.isInitialized) {
      throw new Error('LocationService not initialized');
    }

    const cacheKey = `${countryCode}-${stateCode}`;
    if (this.citiesCache.has(cacheKey)) {
      return this.citiesCache.get(cacheKey);
    }

    const cities = City.getCitiesOfState(countryCode, stateCode);
    this.citiesCache.set(cacheKey, cities);
    return cities;
  }

  // Google Maps Geocoding API for React.js
  async reverseGeocodeWithDetails(latitude, longitude) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}&language=en`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];

        // Helper function to extract address components
        const getComponent = (components, types) => {
          for (let type of types) {
            const component = components.find(c => c.types.includes(type));
            if (component) return component;
          }
          return null;
        };

        const addressComponents = result.address_components;

        // Extract location details
        const cityComponent = getComponent(addressComponents, [
          'locality',
          'sublocality',
          'postal_town',
          'administrative_area_level_2'
        ]);

        const stateComponent = getComponent(addressComponents, [
          'administrative_area_level_1',
        ]);

        const countryComponent = getComponent(addressComponents, ['country']);

        const postalCodeComponent = getComponent(addressComponents, ['postal_code']);

        return {
          city: cityComponent ? cityComponent.long_name : null,
          state: stateComponent ? stateComponent.long_name : null,
          stateCode: stateComponent ? stateComponent.short_name : null,
          country: countryComponent ? countryComponent.long_name : null,
          countryCode: countryComponent ? countryComponent.short_name : null,
          postalCode: postalCodeComponent ? postalCodeComponent.long_name : null,
          fullAddress: result.formatted_address,
          latitude,
          longitude,
        };
      } else {
        throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Alternative free geocoding service (OpenStreetMap Nominatim) as fallback
  async reverseGeocodeWithNominatim(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        return {
          city: address.city || address.town || address.village || address.municipality,
          state: address.state,
          stateCode: address.state_code,
          country: address.country,
          countryCode: address.country_code?.toUpperCase(),
          postalCode: address.postcode,
          fullAddress: data.display_name,
          latitude,
          longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      throw error;
    }
  }

  // Fallback method using country-state-city if geocoding fails
  async getApproximateLocationDetails(latitude, longitude) {
    try {
      // First try Google Maps geocoding
      try {
        const precise = await this.reverseGeocodeWithDetails(latitude, longitude);
        if (precise) return precise;
      } catch (e) {
        console.log('Google Maps geocoding failed, trying Nominatim:', e.message);
      }

      // Try Nominatim as second option
      try {
        const nominatimResult = await this.reverseGeocodeWithNominatim(latitude, longitude);
        if (nominatimResult) return nominatimResult;
      } catch (e) {
        console.log('Nominatim geocoding failed, falling back to country approximation:', e.message);
      }

      // Fallback to country-state-city approximation
      const allCountries = this.getCountries();
      let closestCountry = null;
      let minDistance = Infinity;

      // Find closest country based on coordinates
      for (const country of allCountries) {
        if (country.latitude && country.longitude) {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            parseFloat(country.latitude),
            parseFloat(country.longitude),
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestCountry = country;
          }
        }
      }

      if (!closestCountry) return null;

      // Try to find state if we have country
      let closestState = null;
      if (closestCountry) {
        const states = await this.getStates(closestCountry.isoCode);
        minDistance = Infinity;

        for (const state of states) {
          if (state.latitude && state.longitude) {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              parseFloat(state.latitude),
              parseFloat(state.longitude),
            );

            if (distance < minDistance) {
              minDistance = distance;
              closestState = state;
            }
          }
        }
      }

      return {
        city: null,
        state: closestState ? closestState.name : null,
        stateCode: closestState ? closestState.isoCode : null,
        country: closestCountry.name,
        countryCode: closestCountry.isoCode,
        fullAddress: [
          closestState ? closestState.name : null,
          closestCountry.name,
        ]
          .filter(Boolean)
          .join(', '),
        latitude,
        longitude,
      };
    } catch (error) {
      console.error('Approximate location error:', error);
      throw error;
    }
  }

  // Forward geocoding (address to coordinates)
  async forwardGeocode(address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`
      );

      if (!response.ok) {
        throw new Error(`Forward geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        return {
          latitude: location.lat,
          longitude: location.lng,
          fullAddress: result.formatted_address,
          addressComponents: result.address_components,
        };
      } else {
        throw new Error(`Forward geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('Forward geocoding error:', error);
      throw error;
    }
  }

  // Helper function to calculate distance between coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Get user's current location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Comprehensive method to get current location with address details
  async getCurrentLocationWithDetails() {
    try {
      // Get coordinates
      const location = await this.getCurrentLocation();
      
      // Get address details
      const addressDetails = await this.getApproximateLocationDetails(
        location.latitude,
        location.longitude
      );

      return {
        ...location,
        ...addressDetails,
      };
    } catch (error) {
      console.error('Error getting current location with details:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const locationService = new LocationService();

export default locationService;