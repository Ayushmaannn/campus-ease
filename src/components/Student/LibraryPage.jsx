import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBook, FaSearch, FaSpinner, FaExclamationCircle,
  FaCalendarAlt, FaHistory, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = () => localStorage.getItem('access_token');
const h = () => ({ Authorization: `Bearer ${token()}` });

const categoryColors = {
  CS: 'bg-blue-100 text-blue-700',
  ECE: 'bg-purple-100 text-purple-700',
  MBA: 'bg-green-100 text-green-700',
  General: 'bg-orange-100 text-orange-700',
  Reference: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-600',
};

export default function LibraryPage() {
  const [tab, setTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (tab === 'catalog') fetchBooks(); }, [search, category, availableOnly]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchMyIssues()]);
    setLoading(false);
  };

  const fetchBooks = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (availableOnly) params.append('available_only', 'true');
    const res = await fetch(`${API}/library/books?${params}`, { headers: h() });
    if (res.ok) setBooks(await res.json());
  };

  const fetchMyIssues = async () => {
    const res = await fetch(`${API}/library/my-issues`, { headers: h() });
    if (res.ok) setMyIssues(await res.json());
  };

  const activeIssues = myIssues.filter(i => !i.is_returned);
  const history = myIssues.filter(i => i.is_returned);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-3xl text-teal-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBook className="text-teal-600" /> Library
          </h1>
          <p className="text-gray-500 text-sm mt-1">Search books, view issued books and return history</p>
        </div>
        {activeIssues.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 text-teal-700 text-sm font-medium">
            📚 {activeIssues.length} book{activeIssues.length > 1 ? 's' : ''} borrowed
          </div>
        )}
      </div>

      {/* Active Loans Warning */}
      {activeIssues.some(i => i.overdue_days > 0) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-sm">
          <FaExclamationCircle />
          <span>You have overdue books! Fine of ₹5/day will be charged. Please return them immediately.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'catalog', label: 'Book Catalog', icon: <FaBook /> },
          { key: 'borrowed', label: `Borrowed (${activeIssues.length})`, icon: <FaCalendarAlt /> },
          { key: 'history', label: 'History', icon: <FaHistory /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-teal-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Book Catalog */}
      {tab === 'catalog' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, author or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500">
              <option value="">All Categories</option>
              {['CS','ECE','MBA','General','Reference'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors text-sm text-gray-600">
              <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="rounded" />
              Available only
            </label>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book, i) => (
              <motion.div key={book.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[book.category] || categoryColors.default}`}>
                        {book.category}
                      </span>
                      {book.available_copies > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                          <FaCheckCircle className="text-[10px]" /> Available
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
                          <FaTimesCircle className="text-[10px]" /> All Issued
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 leading-tight">{book.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">by {book.author}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {book.edition && <span>{book.edition} Ed.</span>}
                      {book.year && <span>{book.year}</span>}
                      {book.publisher && <span>{book.publisher}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-center bg-teal-50 border border-teal-100 rounded-xl p-2">
                      <div className="text-xl font-bold text-teal-700">{book.available_copies}</div>
                      <div className="text-xs text-teal-500">/{book.total_copies}</div>
                      <div className="text-xs text-gray-400 mt-0.5">copies</div>
                    </div>
                    {book.shelf_location && (
                      <span className="text-xs text-gray-400 font-mono">{book.shelf_location}</span>
                    )}
                  </div>
                </div>
                {book.isbn && (
                  <p className="text-xs text-gray-300 mt-3 font-mono">ISBN: {book.isbn}</p>
                )}
              </motion.div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaBook className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No books found</p>
            </div>
          )}
        </div>
      )}

      {/* Borrowed Books */}
      {tab === 'borrowed' && (
        <div className="space-y-4">
          {activeIssues.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaBook className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No books currently borrowed</p>
            </div>
          ) : activeIssues.map((issue, i) => (
            <motion.div key={issue.issue_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border p-5 ${issue.overdue_days > 0 ? 'border-red-200 shadow-red-50' : 'border-gray-100'} shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{issue.book?.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">by {issue.book?.author}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-gray-500">Issued: <strong>{new Date(issue.issued_at).toLocaleDateString('en-IN')}</strong></span>
                    <span className={`font-medium ${issue.overdue_days > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      Due: <strong>{issue.due_date}</strong>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {issue.overdue_days > 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-red-700">₹{issue.overdue_days * 5}</div>
                      <div className="text-xs text-red-500">{issue.overdue_days} days overdue</div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                      <div className="text-xs text-green-600 mt-1">On time</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FaHistory className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No return history yet</p>
            </div>
          ) : history.map((issue, i) => (
            <motion.div key={issue.issue_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-medium text-gray-800">{issue.book?.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Issued {new Date(issue.issued_at).toLocaleDateString('en-IN')} →
                  Returned {new Date(issue.returned_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {issue.fine_amount > 0 && (
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${issue.fine_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    ₹{issue.fine_amount} {issue.fine_paid ? 'paid' : 'due'}
                  </span>
                )}
                <FaCheckCircle className="text-green-400 text-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
