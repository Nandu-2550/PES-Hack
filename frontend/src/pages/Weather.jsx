import React, { useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { CloudSun, Droplets, Wind, Thermometer, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SyncBadge from '../components/SyncBadge';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { useLanguage } from '../context/LanguageContext';
import { TranslatedText } from '../utils/translate';

const Weather = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { data: weather, syncedAt, loading, isStale } = useCachedFetch(
    `weather_${user?.district}`,
    user ? `/api/weather?district=${user.district}` : null,
    {
      minDisplayTime: 300,
    }
  );

  const [mandiPrices, setMandiPrices] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(true);

  useEffect(() => {
    const fetchMandi = async () => {
      try {
        const res = await client.get('/api/weather/mandi');
        setMandiPrices(res.data);
      } catch (err) {
        console.error('Error fetching Mandi prices:', err);
      } finally {
        setMandiLoading(false);
      }
    };
    fetchMandi();
  }, []);

  return (
    <div className="page-container pb-20">
      <h1 className="text-white text-3xl font-extrabold mb-1">
        {t('weather')} & {t('market')}
      </h1>
      <SyncBadge syncedAt={syncedAt} isStale={isStale} />

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 text-sm ml-4">
            <TranslatedText text="Loading weather..." />
          </p>
        </div>
      ) : weather ? (
        weather.current ? (
          <>
            <div className="card p-6 mb-6 text-center flex flex-col items-center shadow-glow-sm relative overflow-hidden">
              <h2 className="text-white text-2xl font-bold mb-1">
                <TranslatedText text={weather.location} />
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                {weather.current.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`}
                    alt="weather icon"
                    className="w-20 h-20 drop-shadow-glow"
                  />
                )}
                <h1 className="text-white text-5xl font-extrabold tracking-tight">
                  {Math.round(weather.current.temp)}°C
                </h1>
              </div>
              <p className="text-emerald-400 font-semibold text-lg capitalize mb-6">
                <TranslatedText text={weather.current.description} />
              </p>

              <div className="flex justify-between w-full border-t border-white/5 pt-5 mt-2">
                <div className="flex flex-col items-center flex-1">
                  <Thermometer size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">
                    <TranslatedText text="Feels" /> {Math.round(weather.current.feelsLike)}°C
                  </span>
                </div>
                <div className="flex flex-col items-center flex-1 border-x border-white/5">
                  <Droplets size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">
                    <TranslatedText text="Humidity" />: {weather.current.humidity}%
                  </span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <Wind size={20} className="text-emerald-400" />
                  <span className="text-slate-400 text-xs mt-1.5 font-medium">
                    <TranslatedText text="Wind" />: {Math.round(weather.current.windSpeed * 3.6)} km/h
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-white font-bold text-lg mb-3">
              <TranslatedText text="5-Day Forecast" />
            </h3>
            <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {weather.forecast.map((day, idx) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString(t('lang') === 'hi' ? 'hi-IN' : t('lang') === 'kn' ? 'kn-IN' : 'en-US', { weekday: 'short' });
                return (
                  <div key={idx} className="card flex flex-col items-center justify-center p-4 min-w-[90px] shadow-glow-sm">
                    <span className="text-white text-xs font-semibold">
                      {idx === 0 ? <TranslatedText text="Today" /> : dayName}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt="icon"
                      className="w-10 h-10 my-1 drop-shadow-glow"
                    />
                    <div className="flex gap-2 text-xs font-bold mt-1">
                      <span className="text-emerald-400">{Math.round(day.max)}°</span>
                      <span className="text-slate-500">{Math.round(day.min)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">
            <TranslatedText text="Current weather data not available." />
          </p>
        )
      ) : (
        <p className="text-center text-red-400 py-8">
          <TranslatedText text="Failed to load weather data." />
        </p>
      )}

      {/* Market Prices Dynamic Feed */}
      <h3 className="text-white font-bold text-lg mb-3 mt-4">
        <TranslatedText text="Local Market Prices (Mandi)" />
      </h3>
      <div className="card p-6 shadow-glow-md">
        <p className="text-slate-500 text-xs mb-4">
          📍 <TranslatedText text="Live commodity rates in Karnataka. Updated today." />
        </p>
        <div className="overflow-x-auto">
          {mandiLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : mandiPrices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3">
                    <TranslatedText text="Crop" />
                  </th>
                  <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3">
                    <TranslatedText text="Price" />
                  </th>
                  <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3">
                    <TranslatedText text="Market" />
                  </th>
                  <th className="text-slate-400 text-xs font-semibold uppercase tracking-wider pb-3 text-right">
                    <TranslatedText text="Trend" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {mandiPrices.map((crop, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="text-white font-medium py-3.5">
                      <TranslatedText text={crop.cropName} />
                    </td>
                    <td className="text-slate-300 py-3.5 font-bold">
                      ₹{crop.price.toLocaleString('en-IN')}{' '}
                      <span className="text-slate-500 text-xs font-normal">
                        / <TranslatedText text={crop.unit} />
                      </span>
                    </td>
                    <td className="text-slate-400 py-3.5 text-xs">
                      <TranslatedText text={crop.market} />
                    </td>
                    <td className="py-3.5 text-right">
                      {crop.trend === 'up' ? (
                        <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <TrendingUp size={14} /> ↑
                        </span>
                      ) : crop.trend === 'down' ? (
                        <span className="text-red-400 font-bold flex items-center justify-end gap-1">
                          <TrendingDown size={14} /> ↓
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold flex items-center justify-end gap-1">
                          <Minus size={14} /> -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-xs py-4 text-center">
              <TranslatedText text="No commodity price data available." />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;

