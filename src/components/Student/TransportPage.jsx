import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBus, FaMapMarkerAlt, FaUser, FaPhone, FaCar,
  FaSpinner, FaTicketAlt, FaRoute, FaClock
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ Authorization: `Bearer ${token()}` });

export default function TransportPage() {
  const [routes, setRoutes] = useState([]);
  const [myPass, setMyPass] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('routes');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, passRes] = await Promise.all([
        fetch(`${API}/transport/routes`, { headers: h() }),
        fetch(`${API}/transport/passes/my`, { headers: h() }),
      ]);
      if (routesRes.ok) setRoutes(await routesRes.json());
      if (passRes.ok) setMyPass(await passRes.json());
    } catch { /* silent */ }
    setLoading(false);
  };

  const viewSchedule = async (routeId) => {
    setSelectedRoute(routeId);
    try {
      const res = await fetch(`${API}/transport/routes/${routeId}/schedule`, { headers: h() });
      if (res.ok) setSchedule(await res.json());
    } catch { /* silent */ }
  };

  const getStops = (stops) => {
    try { return JSON.parse(stops); } catch { return []; }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-3xl text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBus className="text-blue-600" /> Transport Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">View bus routes, schedules and your bus pass</p>
      </div>

      {/* My Bus Pass Banner */}
      {myPass.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Your Active Bus Pass</p>
              <h2 className="text-2xl font-bold mt-1">{myPass[0].pass_number}</h2>
              <p className="text-blue-200 text-sm mt-1">Valid: {myPass[0].valid_from} → {myPass[0].valid_until}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4">
              <FaTicketAlt className="text-4xl" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'routes', label: 'Bus Routes', icon: <FaRoute /> },
          { key: 'schedule', label: 'Schedule', icon: <FaClock /> },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSchedule(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Routes Grid */}
      {tab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route, i) => (
            <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Route Color Band */}
              <div className={`h-2 ${['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500'][i % 4]}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{route.route_number}</span>
                    <h3 className="font-semibold text-gray-800 mt-1">{route.route_name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-700">₹{Number(route.monthly_fee).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">/month</div>
                  </div>
                </div>

                {/* Origin → Destination */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                  <span className="font-medium">{route.origin}</span>
                  <span className="text-gray-300">→</span>
                  <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                  <span className="font-medium">{route.destination}</span>
                </div>

                {/* Stops */}
                {route.stops && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getStops(route.stops).slice(1, -1).map((stop, si) => (
                        <span key={si} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{stop}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Driver Info */}
                <div className="border-t border-gray-50 pt-3 space-y-1.5 text-xs text-gray-500">
                  {route.driver_name && (
                    <div className="flex items-center gap-1.5"><FaUser className="text-gray-400" /> {route.driver_name}</div>
                  )}
                  {route.driver_phone && (
                    <div className="flex items-center gap-1.5"><FaPhone className="text-gray-400" /> {route.driver_phone}</div>
                  )}
                  {route.vehicle_number && (
                    <div className="flex items-center gap-1.5"><FaCar className="text-gray-400" /> {route.vehicle_number} (Cap: {route.vehicle_capacity})</div>
                  )}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setTab('schedule'); viewSchedule(route.id); }}
                  className="mt-4 w-full py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <FaClock /> View Schedule
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule View */}
      {tab === 'schedule' && (
        <div>
          {/* Route Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {routes.map(route => (
              <button key={route.id} onClick={() => viewSchedule(route.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedRoute === route.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {route.route_number} — {route.route_name}
              </button>
            ))}
          </div>

          {schedule ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <h2 className="text-xl font-bold">{schedule.route.route_name}</h2>
                <p className="text-blue-200 text-sm mt-1">{schedule.route.origin} → {schedule.route.destination}</p>
                {schedule.route.vehicle_number && (
                  <p className="text-blue-200 text-xs mt-1">Vehicle: {schedule.route.vehicle_number} | Driver: {schedule.route.driver_name} ({schedule.route.driver_phone})</p>
                )}
              </div>

              {/* Stops */}
              {schedule.route.stops?.length > 0 && (
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Route Stops</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {schedule.route.stops.map((stop, i) => (
                      <React.Fragment key={i}>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${i === 0 || i === schedule.route.stops.length - 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200'}`}>
                          {stop}
                        </span>
                        {i < schedule.route.stops.length - 1 && <span className="text-blue-300 text-sm">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules Table */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Daily Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 rounded-xl">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium rounded-l-xl">Days</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Direction</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Departure</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium rounded-r-xl">Arrival</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {schedule.schedules.map((s, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-700">{s.day}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.direction === 'to_college' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {s.direction === 'to_college' ? '→ To College' : '← From College'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-blue-700">{s.departure}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{s.arrival}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaBus className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a route above to view its schedule</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
