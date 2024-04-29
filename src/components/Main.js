import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import './Main.css';

const Main = () => {
  const [search, setSearch] = useState('');
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [seemore, setSeemore] = useState(false);
  const [seeless,setSeeless]=useState(true);
  
  const handleInputChange = (event) => {
    setSearch(event.target.value);
    setError(null);
  };

  const handleSeeMore = () => {
    setSeemore(true);
    setSeeless(false);
  };
  const handleSeeLess = () => {
    setSeemore(false);
    setSeeless(true);
  };
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const ipRegex =
      /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|((([0-9a-fA-F]{1,4}:){1,6}:)|(::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}))$/;
    if (!ipRegex.test(search) && !ipv6Regex.test(search)) {
      alert('Please enter correct IP address format');
      setItem(null);
      return;
    }

    handleSearchClick();
    setSeemore(false);
    setSeeless(true);
  };

  const handleSearchClick = () => {
    if (search !== '') {
      setLoading(true);

      if (map) {
        map.off();
        map.remove();
        setMap(null);
      }

      fetch(`https://ipapi.co/${search}/json/`)
        .then((response) => response.json())
        .then((data) => {
          console.log('API Response:', data);
          if (data && data.error === true) {
            setError(data.reason);
            setItem(null);
          }
          if (data && data.city === null) {
            setError('This IP address does not exist');
            setItem(null);
          }
          if (data && data.reserved === true) {
            setError('Reserved IP Address');
            setItem(null);
          } else if (data) {
            setItem(data);
            setError(null);

            if (!data.error && data.latitude !== null && data.longitude !== null) {
              const mapInstance = L.map('map').setView([data.latitude, data.longitude], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en', {
                attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
              }).addTo(mapInstance);
              setMap(mapInstance);
              const marker = L.marker([data.latitude, data.longitude]).addTo(mapInstance);
            }
          }
        })
        .catch((error) => {
          console.error('API Error:', error);
          setError('An error occurred. Please try again.');
          setItem(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setItem(null);
      setError(null);
      if (map) {
        map.off();
        map.remove();
        setMap(null);
      }
    }
  };

  useEffect(() => {
    if (map && item && !item.error && search === item.ip) {
      map.setView([item.latitude, item.longitude], 13);
    }
  }, [map, item, search]);

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginTop: '20px' }}>FIND YOUR LOCATION WITH YOUR IP ADDRESS</h1>
      <form className="search-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          placeholder="ENTER YOUR IP ADDRESS"
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading || search === ''}>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon className="search-fill-color" icon={faSearch} />}
        </button>
      </form>
      <div className="result">
        {error && (
          <div className="error mx-auto" style={{ maxWidth: '560px' }}>
            <ul class="list-group list-group-flush mt-5" style={{ padding: '10px' }}>
              <li class="list-group-item" style={{ color: 'red' }}>
                {error}
              </li>
            </ul>
          </div>
        )}
        {item && search !== '' && !item.error && search === item.ip && (
          <>
            <div className="card">
              <ul className="list-group list-group-flush" style={{ padding: '10px' }}>
                <li className="list-group-item">YOUR COUNTRY IS: {item.country_name}</li>
                <li className="list-group-item">CITY IS: {item.city}</li>
                <li className="list-group-item">IP VERSION IS: {item.version}</li>
                <li className="list-group-item">LATITUDE IS: {item.latitude}</li>
                <li className="list-group-item">LONGITUDE IS: {item.longitude}</li>
                {seemore && (
                  <>
                    <li className="list-group-item">CURRENCY IS: {item.currency}</li>
                    <li className="list-group-item">COUNTRY CAPITAL IS: {item.country_capital}</li>
                  </>
                )}
              </ul>
            </div>
           
            {!seemore && (
              <button className="btn btn-primary mb-5" onClick={handleSeeMore}>
                See More
              </button>
            )}
            {!seeless && (
              <button className="btn btn-primary mb-5" onClick={handleSeeLess}>
                See Less
              </button>
            )}
          </>
        )}
        <div
          id="map"
          className="map-container"
          style={{ width: '100%', height: '400px', visibility: item && search !== '' && !item.error && search === item.ip ? 'visible' : 'hidden' }}
        ></div>
      </div>
    </div>
  );
};
export default Main;