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
    user ? `/api/weather?district=${user.district}` : null,
    {
      // Add a small delay to prevent flicker for very fast fetches
      // and ensure the spinner is visible for a moment.
      minDisplayTime: 300,
    }
  );

  // Placeholder for market prices, as they are not part of the weather API response
  const marketPrices = [ /* ... your market price data ... */ ];
  );

  return (
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-1">Weather & Markets</h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {loading ? ( // Display spinner while loading
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 text-sm ml-4">Loading weather...</p>
        </div>
      ) : weather ? (
        weather.current ? ( // Check if weather.current exists
          <>
            <div className="card p-6 mb-6 text-center flex flex-col items-center shadow-glow-sm relative overflow-hidden">
              <h2 className="text-white text-2xl font-bold mb-1">{weather.location}</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                {weather.current.icon && <img src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`} alt="weather icon" className="w-20 h-20 drop-shadow-glow" />}
                <h1 className="text-white text-5xl font-extrabold tracking-tight">{Math.round(weather.current.temp)}°C</h1>
              </div>
              <p className="text-emerald-400 font-semibold text-lg capitalize mb-6">
                {weather.current.description}
              </p>

              <div className="flex justify-between w-full border-t border-white/5 pt-5 mt-2">
                <div className="flex flex-col items-center flex-1">
                  <Thermometer size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">Feels {Math.round(weather.current.feelsLike)}°C</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-x border-white/5">
                  <Droplets size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">Humidity: {weather.current.humidity}%</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <Wind size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">Wind: {Math.round(weather.current.windSpeed * 3.6)} km/h</span>
                </div>
              </div>
            </div>

          <h3 className="text-white font-bold text-lg mb-3">5-Day Forecast</h3>
          <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {weather.forecast.map((day, idx) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={idx} className="card flex flex-col items-center justify-center p-4 min-w-[90px] shadow-glow-sm">
                  <span className="text-white text-xs font-semibold">{idx === 0 ? 'Today' : dayName}</span>
                  <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="icon" className="w-10 h-10 my-1 drop-shadow-glow" />
                  <div className="flex gap-2 text-xs font-bold mt-1">
                    <span className="text-emerald-400">{Math.round(day.max)}°</span>
                    <span className="text-slate-500">{Math.round(day.min)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        ) : ( // If weather data is available, but current weather data is not
          <p className="text-slate-400 text-sm text-center py-8">Current weather data not available.</p>
        </>
      ) : (
        <p className="text-center text-red-400 py-8">Failed to load weather data.</p>
      )}

      {/* Market Prices Placeholder */}
      <h3 className="text-white font-bold text-lg mb-3 mt-4">Local Market Prices (Mandi)</h3>
      <div className="card p-6 shadow-glow-md">
        <p className="text-slate-500 text-xs mb-4">
          *Live Mandi API integration coming soon. Showing reference prices.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3">Crop</th>
                <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3">Est. Price (₹/Quintal)</th>
                <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <tr>
                <td className="text-white font-medium py-3.5">Rice (Paddy)</td>
                <td className="text-slate-300 py-3.5">2,200 - 2,500</td>
                <td className="text-emerald-400 font-bold py-3.5 text-right">↑</td>
              </tr>
              <tr>
                <td className="text-white font-medium py-3.5">Sugarcane</td>
                <td className="text-slate-300 py-3.5">315 (per tonne)</td>
                <td className="text-slate-500 font-bold py-3.5 text-right">-</td>
              </tr>
              <tr>
                <td className="text-white font-medium py-3.5">Tomato</td>
                <td className="text-slate-300 py-3.5">1,800 - 2,200</td>
                <td className="text-emerald-400 font-bold py-3.5 text-right">↑</td>
              </tr>
              <tr>
                <td className="text-white font-medium py-3.5">Onion</td>
                <td className="text-slate-300 py-3.5">1,500 - 1,900</td>
                <td className="text-red-400 font-bold py-3.5 text-right">↓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Weather;
