import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBook, FaPlus, FaSpinner, FaSearch, FaCheck,
  FaUndo, FaExclamationCircle, FaHistory
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const emptyBook = { title: '', author: '', isbn: '', publisher: '', edition: '', year: '', category: 'CS', total_copies: 1, shelf_location: '' };

export default function LibraryAdminPage() {
  const [tab, setTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [issueForm, setIssueForm] = useState({ book_id: '', student_id: '', due_date: '' });
  const [issueSaving, setIssueSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (tab === 'catalog') fetchBooks(); }, [search]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchIssues(), fetchStats()]);
    setLoading(false);
  };

  const fetchBooks = async () => {
    const params = search ? `?search=${search}` : '';
    const res = await fetch(`${API}/library/books${params}`, { headers: h() });
    if (res.ok) setBooks(await res.json());
  };

  const fetchIssues = async () => {
    const res = await fetch(`${API}/library/all-issues?returned=false`, { headers: h() });
    if (res.ok) setIssues(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/library/stats`, { headers: h() });
    if (res.ok) setStats(await res.json());
  };

  const addBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, year: form.year ? parseInt(form.year) : undefined, total_copies: parseInt(form.total_copies) };
    const res = await fetch(`${API}/library/books`, { method: 'POST', headers: h(), body: JSON.stringify(payload) });
    if (res.ok) { setShowForm(false); setForm(emptyBook); fetchData(); setMsg('Book added successfully!'); }
    setSaving(false);
  };

  const returnBook = async (issueId) => {
    const res = await fetch(`${API}/library/return/${issueId}`, { method: 'POST', headers: h() });
    if (res.ok) { fetchData(); setMsg('Book returned successfully!'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-3xl text-teal-600" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaBook className="text-teal-600" /> Library Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage book catalog, issue and return books</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium shadow-lg hover:bg-teal-700">
          <FaPlus /> Add Book
        </motion.button>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2 cursor-pointer" onClick={() => setMsg('')}><FaCheck />{msg}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Books', value: stats.total_books, color: 'bg-teal-600' },
            { label: 'Available', value: stats.available, color: 'bg-green-600' },
            { label: 'Issued', value: stats.currently_issued, color: 'bg-blue-600' },
            { label: 'Overdue', value: stats.overdue, color: 'bg-red-600' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-4 text-white text-center`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Book Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="bg-teal-600 px-6 py-4"><h2 className="text-white font-semibold">Add New Book</h2></div>
          <form onSubmit={addBook} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'title', label: 'Title *', required: true },
                { key: 'author', label: 'Author *', required: true },
                { key: 'isbn', label: 'ISBN' },
                { key: 'publisher', label: 'Publisher' },
                { key: 'edition', label: 'Edition' },
                { key: 'year', label: 'Year', type: 'number' },
                { key: 'total_copies', label: 'Copies *', type: 'number', required: true },
                { key: 'shelf_location', label: 'Shelf Location' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} required={f.required} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                  {['CS','ECE','MBA','General','Reference'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2">
                {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />} Add Book
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border rounded-xl text-gray-600">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[{ key: 'catalog', label: 'Catalog' }, { key: 'issued', label: `Issued (${issues.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-teal-700' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div>
          <div className="relative mb-4"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                {['Title','Author','ISBN','Category','Copies','Available','Shelf'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {books.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.title}</td>
                    <td className="px-4 py-3 text-gray-600">{b.author}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{b.isbn || '—'}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{b.category}</span></td>
                    <td className="px-4 py-3 text-center">{b.total_copies}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${b.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>{b.available_copies}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.shelf_location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'issued' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {['Student','Roll No','Book','Issued','Due Date','Fine','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {issues.map(issue => {
                const overdue = new Date(issue.due_date) < new Date();
                return (
                  <tr key={issue.issue_id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{issue.student_name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{issue.roll_number}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{issue.book_title}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(issue.issued_at).toLocaleDateString('en-IN')}</td>
                    <td className={`px-4 py-3 text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>{issue.due_date}</td>
                    <td className="px-4 py-3">
                      {issue.fine_amount > 0 ? <span className="text-xs text-red-600 font-bold">₹{issue.fine_amount}</span> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => returnBook(issue.issue_id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700">
                        <FaUndo /> Return
                      </button>
                    </td>
                  </tr>
                );
              })}
              {issues.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No books currently issued</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
