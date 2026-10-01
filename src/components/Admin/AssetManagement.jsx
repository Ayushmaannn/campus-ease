import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaDesktop, FaPlus, FaSpinner, FaSearch, FaEdit,
  FaCheck, FaTimes, FaTools, FaTrash, FaBox
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const CATEGORIES = ['computer', 'projector', 'furniture', 'lab', 'other'];
const STATUSES   = ['available', 'in_use', 'maintenance', 'disposed'];

const statusStyle = {
  available:   'bg-green-100 text-green-700',
  in_use:      'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  disposed:    'bg-red-100 text-red-700',
};

const categoryIcon = {
  computer: '💻', projector: '📽️', furniture: '🪑', lab: '🔬', other: '📦',
};

const emptyForm = { name: '', asset_tag: '', category: 'computer', description: '', location: '', purchase_date: '', purchase_cost: '', vendor: '', warranty_until: '' };

export default function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchAssets(); }, [search, filterCat, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAssets(), fetchStats()]);
    setLoading(false);
  };

  const fetchAssets = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterCat) params.append('category', filterCat);
    if (filterStatus) params.append('status', filterStatus);
    const res = await fetch(`${API}/assets?${params}`, { headers: h() });
    if (res.ok) setAssets(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/assets/stats`, { headers: h() });
    if (res.ok) setStats(await res.json());
  };

  const createAsset = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form };
    if (!payload.purchase_date) delete payload.purchase_date;
    if (!payload.warranty_until) delete payload.warranty_until;
    if (!payload.purchase_cost) delete payload.purchase_cost;
    const res = await fetch(`${API}/assets/`, { method: 'POST', headers: h(), body: JSON.stringify(payload) });
    if (res.ok) {
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } else {
      const d = await res.json();
      setError(d.detail || 'Failed to create asset');
    }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/assets/${id}`, { method: 'PATCH', headers: h(), body: JSON.stringify({ status }) });
    setEditId(null);
    fetchData();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-3xl text-indigo-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaDesktop className="text-indigo-600" /> Asset Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all campus assets</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg">
          <FaPlus /> Add Asset
        </motion.button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-700' },
            { label: 'Available', value: stats.available, color: 'bg-green-600' },
            { label: 'In Use', value: stats.in_use, color: 'bg-blue-600' },
            { label: 'Maintenance', value: stats.maintenance, color: 'bg-yellow-600' },
            { label: 'Disposed', value: stats.disposed, color: 'bg-red-600' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-4 text-white text-center`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-white font-semibold">Register New Asset</h2>
          </div>
          <form onSubmit={createAsset} className="p-6">
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'name', label: 'Asset Name *', placeholder: 'Dell Laptop', required: true },
                { key: 'asset_tag', label: 'Asset Tag *', placeholder: 'ASSET-001', required: true },
                { key: 'location', label: 'Location', placeholder: 'CSE Lab Room 201' },
                { key: 'vendor', label: 'Vendor', placeholder: 'Dell India' },
                { key: 'purchase_cost', label: 'Cost (₹)', placeholder: '65000', type: 'number' },
                { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
                { key: 'warranty_until', label: 'Warranty Until', type: 'date' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type || 'text'} required={field.required} placeholder={field.placeholder}
                    value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm capitalize">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
                {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Asset
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm capitalize focus:outline-none">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm capitalize focus:outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Asset', 'Tag', 'Category', 'Location', 'Status', 'Purchase', 'Vendor', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcon[asset.category] || '📦'}</span>
                      <div>
                        <div className="font-medium text-gray-800">{asset.name}</div>
                        {asset.description && <div className="text-xs text-gray-400 truncate max-w-32">{asset.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.asset_tag}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{asset.category}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.location || '—'}</td>
                  <td className="px-4 py-3">
                    {editId === asset.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        onBlur={() => updateStatus(asset.id, editStatus)}
                        className="text-xs border rounded-lg px-2 py-1 focus:outline-none capitalize" autoFocus>
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize cursor-pointer ${statusStyle[asset.status]}`}
                        onClick={() => { setEditId(asset.id); setEditStatus(asset.status); }}>
                        {asset.status?.replace('_',' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{asset.purchase_date ? `₹${Number(asset.purchase_cost || 0).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{asset.vendor || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditId(asset.id); setEditStatus(asset.status); }}
                      className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FaBox className="text-4xl mx-auto mb-2 opacity-30" />
              <p>No assets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
