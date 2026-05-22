import React, { useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { CloudSun, Droplets, Wind, Thermometer } from 'lucide-react';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';

const Weather = () => {
  const { user } = useContext(AuthContext);
  const { data: weather, syncedAt, loading, isStale } = useCachedFetch(
    `weather_${user?.district}`,
    user ? `/api/weather?district=${user.district}` : null
  );

  return (
    <div className="page-container">
      <h1 className="mb-1">Weather & Markets</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {loading ? (
        <p className="text-center">Loading weather...</p>
      ) : weather ? (
        <>
          <div className="surface-card mb-3 text-center flex-col items-center">
            <h2 className="mb-1">{weather.location}</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`} alt="weather icon" />
              <h1 style={{ fontSize: '48px', margin: 0 }}>{Math.round(weather.current.temp)}°</h1>
            </div>
            <p style={{ textTransform: 'capitalize', fontSize: '18px', color: 'var(--text-highlight)' }} className="mb-3">
              {weather.current.description}
            </p>

            <div className="flex justify-between w-full" style={{ borderTop: '1px solid var(--primary-color)', paddingTop: '16px' }}>
              <div className="flex-col items-center">
                <Thermometer size={20} color="var(--accent-color)" />
                <span style={{ fontSize: '14px', marginTop: '4px' }}>Feels {Math.round(weather.current.feelsLike)}°</span>
              </div>
              <div className="flex-col items-center">
                <Droplets size={20} color="var(--accent-color)" />
                <span style={{ fontSize: '14px', marginTop: '4px' }}>{weather.current.humidity}%</span>
              </div>
              <div className="flex-col items-center">
                <Wind size={20} color="var(--accent-color)" />
                <span style={{ fontSize: '14px', marginTop: '4px' }}>{Math.round(weather.current.windSpeed * 3.6)} km/h</span>
              </div>
            </div>
          </div>

          <h3 className="mb-2">5-Day Forecast</h3>
          <div className="flex gap-2 mb-3" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            {weather.forecast.map((day, idx) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={idx} className="surface-card flex-col items-center" style={{ minWidth: '80px', padding: '12px' }}>
                  <span style={{ fontSize: '14px' }}>{idx === 0 ? 'Today' : dayName}</span>
                  <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="icon" style={{ width: '40px' }} />
                  <div className="flex gap-2" style={{ fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-highlight)' }}>{Math.round(day.max)}°</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{Math.round(day.min)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-center text-red-500">Failed to load weather data.</p>
      )}

      {/* Market Prices Placeholder */}
      <h3 className="mb-2 mt-3">Local Market Prices (Mandi)</h3>
      <div className="surface-card">
        <p className="mb-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          *Live Mandi API integration coming soon. Showing reference prices.
        </p>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--primary-color)' }}>
              <th style={{ padding: '8px 0' }}>Crop</th>
              <th style={{ padding: '8px 0' }}>Est. Price (₹/Quintal)</th>
              <th style={{ padding: '8px 0' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0' }}>Rice (Paddy)</td>
              <td style={{ padding: '8px 0' }}>2,200 - 2,500</td>
              <td style={{ padding: '8px 0', color: 'var(--accent-color)' }}>↑</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>Sugarcane</td>
              <td style={{ padding: '8px 0' }}>315 (per tonne)</td>
              <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>-</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>Tomato</td>
              <td style={{ padding: '8px 0' }}>1,800 - 2,200</td>
              <td style={{ padding: '8px 0', color: 'var(--accent-color)' }}>↑</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>Onion</td>
              <td style={{ padding: '8px 0' }}>1,500 - 1,900</td>
              <td style={{ padding: '8px 0', color: '#ff4d4d' }}>↓</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Weather;
