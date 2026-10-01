import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaPlus, FaSpinner, FaMapMarkerAlt, FaUser, FaPhone, FaCar, FaCheck, FaTimes } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const emptyRoute = { route_name: '', route_number: '', origin: '', destination: '', distance_km: '', monthly_fee: 1500, driver_name: '', driver_phone: '', vehicle_number: '', vehicle_capacity: 40, stops: '' };

export default function TransportAdminPage() {
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyRoute);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editRoute, setEditRoute] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [routesRes, statsRes] = await Promise.all([
      fetch(`${API}/transport/routes`, { headers: h() }),
      fetch(`${API}/transport/stats`, { headers: h() }),
    ]);
    if (routesRes.ok) setRoutes(await routesRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  };

  const createRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, distance_km: form.distance_km ? parseFloat(form.distance_km) : undefined, vehicle_capacity: parseInt(form.vehicle_capacity), monthly_fee: parseFloat(form.monthly_fee), stops: form.stops ? JSON.stringify(form.stops.split(',').map(s => s.trim())) : undefined };
    const res = await fetch(`${API}/transport/routes`, { method: 'POST', headers: h(), body: JSON.stringify(payload) });
    if (res.ok) { setShowForm(false); setForm(emptyRoute); fetchData(); setMsg('Route created!'); }
    else { const d = await res.json(); setMsg(`Error: ${d.detail}`); }
    setSaving(false);
  };

  const toggleRoute = async (routeId, isActive) => {
    await fetch(`${API}/transport/routes/${routeId}?is_active=${!isActive}`, { method: 'PATCH', headers: h() });
    fetchData();
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaBus className="text-blue-600" /> Transport Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage bus routes and student passes</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700">
          <FaPlus /> Add Route
        </motion.button>
      </div>

      {msg && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm flex items-center gap-2 cursor-pointer" onClick={() => setMsg('')}>{msg}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Routes', value: stats.total_routes, color: 'bg-gray-700' },
            { label: 'Active Routes', value: stats.active_routes, color: 'bg-blue-600' },
            { label: 'Active Passes', value: stats.total_active_passes, color: 'bg-green-600' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-5 text-white text-center`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Route Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-white rounded-2xl shadow border overflow-hidden">
          <div className="bg-blue-600 px-6 py-4"><h2 className="text-white font-semibold">Add New Bus Route</h2></div>
          <form onSubmit={createRoute} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'route_name', label: 'Route Name *', required: true },
                { key: 'route_number', label: 'Route Number *', required: true, placeholder: 'R01' },
                { key: 'origin', label: 'Origin *', required: true },
                { key: 'destination', label: 'Destination *', required: true },
                { key: 'distance_km', label: 'Distance (km)', type: 'number' },
                { key: 'monthly_fee', label: 'Monthly Fee (₹)', type: 'number' },
                { key: 'driver_name', label: 'Driver Name' },
                { key: 'driver_phone', label: 'Driver Phone' },
                { key: 'vehicle_number', label: 'Vehicle Number' },
                { key: 'vehicle_capacity', label: 'Capacity', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} required={f.required} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stops (comma-separated)</label>
                <input value={form.stops} onChange={e => setForm({ ...form, stops: e.target.value })}
                  placeholder="Bus Stand, Market Square, Railway Station, Campus"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
                {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Create Route
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border rounded-xl text-gray-600">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route, i) => (
          <motion.div key={route.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${!route.is_active ? 'opacity-60' : ''}`}>
            <div className={`h-2 ${['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500'][i % 4]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">{route.route_number}</span>
                  <h3 className="font-semibold text-gray-800 mt-1">{route.route_name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${route.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => toggleRoute(route.id, route.is_active)}
                    className={`p-1.5 rounded-lg transition-colors ${route.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                    {route.is_active ? <FaTimes /> : <FaCheck />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaMapMarkerAlt className="text-red-500" /> <span>{route.origin}</span>
                <span className="text-gray-300">→</span>
                <FaMapMarkerAlt className="text-green-500" /> <span>{route.destination}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1 text-gray-500">
                  {route.driver_name && <div className="flex items-center gap-1.5"><FaUser className="text-gray-400 text-xs" /> {route.driver_name}</div>}
                  {route.driver_phone && <div className="flex items-center gap-1.5"><FaPhone className="text-gray-400 text-xs" /> {route.driver_phone}</div>}
                  {route.vehicle_number && <div className="flex items-center gap-1.5"><FaCar className="text-gray-400 text-xs" /> {route.vehicle_number} | {route.vehicle_capacity} seats</div>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-700">₹{Number(route.monthly_fee).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">/month</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {routes.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed">
            <FaBus className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No routes configured yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
