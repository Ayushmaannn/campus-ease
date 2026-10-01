import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExclamationTriangle, FaPlus, FaSpinner, FaCheckCircle,
  FaClock, FaTools, FaTimesCircle, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const CATEGORIES = ['academic', 'hostel', 'fee', 'transport', 'library', 'administration', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

const statusConfig = {
  open:        { icon: <FaClock />,         color: 'bg-yellow-100 text-yellow-700 border-yellow-200',  label: 'Open' },
  in_progress: { icon: <FaTools />,          color: 'bg-blue-100 text-blue-700 border-blue-200',        label: 'In Progress' },
  resolved:    { icon: <FaCheckCircle />,    color: 'bg-green-100 text-green-700 border-green-200',     label: 'Resolved' },
  closed:      { icon: <FaTimesCircle />,    color: 'bg-gray-100 text-gray-600 border-gray-200',        label: 'Closed' },
};

const priorityBadge = { low: 'bg-gray-100 text-gray-600', medium: 'bg-orange-100 text-orange-700', high: 'bg-red-100 text-red-700' };

export default function GrievancePage() {
  const [grievances, setGrievances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'academic', priority: 'medium' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchGrievances(); }, []);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/grievances/my`, { headers: h() });
      if (res.ok) setGrievances(await res.json());
    } catch { setError('Failed to load grievances'); }
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/grievances/`, {
        method: 'POST',
        headers: h(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Grievance submitted successfully! You will be notified of updates.');
        setShowForm(false);
        setForm({ title: '', description: '', category: 'academic', priority: 'medium' });
        fetchGrievances();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const d = await res.json();
        setError(d.detail || 'Submission failed');
      }
    } catch { setError('Network error'); }
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-500" /> Grievance Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Submit and track your complaints & requests</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlus /> New Grievance
        </motion.button>
      </div>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
            <FaCheckCircle /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Grievance Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Submit New Grievance</h2>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief title of your grievance"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 capitalize">
                    {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your grievance in detail..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none" />
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : 'Submit Grievance'}
                </motion.button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grievances List */}
      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-3xl text-orange-500" /></div>
      ) : grievances.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FaExclamationTriangle className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No grievances submitted yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Grievance" to raise a complaint</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grievances.map((g) => {
            const cfg = statusConfig[g.status] || statusConfig.open;
            const isExpanded = expanded === g.id;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : g.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${priorityBadge[g.priority]}`}>
                          {g.priority} priority
                        </span>
                        <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full capitalize">
                          {g.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mt-1">{g.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-gray-400">{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-gray-100">
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Complaint</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{g.description}</p>
                        </div>
                        {g.response && (
                          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Admin Response</p>
                            <p className="text-green-800 text-sm leading-relaxed">{g.response}</p>
                            {g.resolved_at && (
                              <p className="text-xs text-green-500 mt-2">
                                Resolved on {new Date(g.resolved_at).toLocaleDateString('en-IN')}
                              </p>
                            )}
                          </div>
                        )}
                        {!g.response && (
                          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm text-yellow-700">
                            ⏳ Awaiting response from administration
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
