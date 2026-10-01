import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationTriangle, FaSpinner, FaFilter, FaCheck,
  FaReply, FaChevronDown, FaChevronUp, FaBell
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const statusConfig = {
  open:        { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Open' },
  in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200',        label: 'In Progress' },
  resolved:    { color: 'bg-green-100 text-green-700 border-green-200',     label: 'Resolved' },
  closed:      { color: 'bg-gray-100 text-gray-600 border-gray-200',        label: 'Closed' },
};
const priorityBadge = { low: 'bg-gray-100 text-gray-600', medium: 'bg-orange-100 text-orange-700', high: 'bg-red-100 text-red-700' };

export default function GrievanceAdmin() {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [expanded, setExpanded] = useState(null);
  const [replyForm, setReplyForm] = useState({ id: null, response: '', status: 'in_progress' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchGrievances(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchGrievances(), fetchStats()]);
    setLoading(false);
  };

  const fetchGrievances = async () => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.category) params.append('category', filter.category);
    const res = await fetch(`${API}/grievances/all?${params}`, { headers: h() });
    if (res.ok) setGrievances(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/grievances/stats/summary`, { headers: h() });
    if (res.ok) setStats(await res.json());
  };

  const submitReply = async () => {
    setSaving(true);
    const res = await fetch(`${API}/grievances/${replyForm.id}`, {
      method: 'PATCH',
      headers: h(),
      body: JSON.stringify({ status: replyForm.status, response: replyForm.response }),
    });
    if (res.ok) {
      fetchData();
      setReplyForm({ id: null, response: '', status: 'in_progress' });
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-3xl text-orange-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" /> Grievance Management
        </h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'from-gray-500 to-gray-700' },
            { label: 'Open', value: stats.open, color: 'from-yellow-500 to-orange-500' },
            { label: 'In Progress', value: stats.in_progress, color: 'from-blue-500 to-indigo-500' },
            { label: 'Resolved', value: stats.resolved, color: 'from-green-500 to-teal-500' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 capitalize">
          <option value="">All Categories</option>
          {['academic','hostel','fee','transport','library','administration','other'].map(c => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {grievances.map((g) => {
          const cfg = statusConfig[g.status] || statusConfig.open;
          const isExpanded = expanded === g.id;
          const isReplying = replyForm.id === g.id;

          return (
            <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : g.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.color}`}>{cfg.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${priorityBadge[g.priority]}`}>{g.priority}</span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full capitalize">{g.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{g.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date(g.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                  {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Complaint</p>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">{g.description}</p>
                  </div>

                  {g.response && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">Previous Response</p>
                      <p className="text-green-800 text-sm">{g.response}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {isReplying ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Update Status</label>
                          <select value={replyForm.status} onChange={e => setReplyForm({ ...replyForm, status: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Response Message</label>
                        <textarea rows={3} value={replyForm.response} onChange={e => setReplyForm({ ...replyForm, response: e.target.value })}
                          placeholder="Write your response to the student..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={submitReply} disabled={saving || !replyForm.response}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                          {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Response
                        </button>
                        <button onClick={() => setReplyForm({ id: null, response: '', status: 'in_progress' })}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyForm({ id: g.id, response: g.response || '', status: g.status })}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
                      <FaReply /> Respond
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        {grievances.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
            <FaExclamationTriangle className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No grievances found</p>
          </div>
        )}
      </div>
    </div>
  );
}
