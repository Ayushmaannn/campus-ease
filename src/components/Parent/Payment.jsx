import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoneyBillWave, FaDownload, FaCreditCard, FaQrcode,
  FaCheckCircle, FaTimes, FaSpinner, FaUniversity, FaReceipt
} from "react-icons/fa";

const Payment = () => {
  const [payments, setPayments] = useState([
    { id: 1, month: "Semester 5 Tuition Fee", amount: 40000, status: "Paid", date: "12-Aug-2026", receiptNo: "RCP-2026-8912" },
    { id: 2, month: "Hostel & Amenities Fee", amount: 25000, status: "Paid", date: "15-Jul-2026", receiptNo: "RCP-2026-7840" },
    { id: 3, month: "Semester 6 Advance Tuition", amount: 40000, status: "Pending", date: "Due 15-Feb-2027", receiptNo: null },
    { id: 4, month: "Examination & Lab Charges", amount: 5000, status: "Pending", date: "Due 20-Feb-2027", receiptNo: null },
  ]);

  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const totalPaid = payments.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.amount, 0);
  const totalDue = payments.filter(p => p.status === "Pending").reduce((acc, p) => acc + p.amount, 0);

  const handleOpenPayModal = (payment) => {
    setActivePaymentModal(payment);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      const generatedReceipt = `RCP-2027-${Math.floor(1000 + Math.random() * 9000)}`;
      setPayments(prev => prev.map(p => {
        if (p.id === activePaymentModal.id) {
          return {
            ...p,
            status: "Paid",
            date: new Date().toLocaleDateString('en-GB'),
            receiptNo: generatedReceipt
          };
        }
        return p;
      }));

      setTimeout(() => {
        setActivePaymentModal(null);
        setPaymentSuccess(false);
      }, 2000);
    }, 1800);
  };

  const handleDownloadInvoice = (payment) => {
    const text = `QUICKCAMPUS UNIVERSITY - FEE PAYMENT RECEIPT\n` +
      `Receipt No: ${payment.receiptNo || 'RCP-PROVISIONAL'}\n` +
      `Student Name: Ayushman Sharma | Roll No: 2024CS108\n` +
      `Fee Head: ${payment.month}\n` +
      `Amount: INR ₹${payment.amount.toLocaleString('en-IN')}\n` +
      `Date: ${payment.date}\n` +
      `Status: ${payment.status}\n` +
      `Digitally signed and cryptographically verified.`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${payment.month.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleDownloadAll = () => {
    const text = `QUICKCAMPUS UNIVERSITY - COMPLETE FEE STATEMENT\n` +
      `Student: Ayushman Sharma | Roll No: 2024CS108 | Department: B.Tech CSE\n` +
      `Total Fees Paid: INR ₹${totalPaid.toLocaleString('en-IN')}\n` +
      `Total Fees Due: INR ₹${totalDue.toLocaleString('en-IN')}\n\n` +
      payments.map(p => `${p.month} | Amount: ₹${p.amount.toLocaleString('en-IN')} | Status: ${p.status} | Date: ${p.date}`).join('\n');

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Complete_Fee_Statement_2024CS108.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003566]">Parent Fee Portal</h1>
          <p className="text-gray-600 mt-1">
            Secure tuition and hostel installment payments, tax receipts, and ledger statements.
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl text-sm font-semibold shadow-md transition"
        >
          <FaDownload /> Download Complete Statement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Paid</h2>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Cleared installments</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Pending Dues</h2>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">₹{totalDue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-rose-500 font-semibold mt-1">Next due: 15-Feb-2027</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FaMoneyBillWave />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Payment Verification</h2>
            <p className="text-sm font-bold text-gray-800 mt-1">Instant Bank Settlement</p>
            <p className="text-xs text-emerald-600 mt-1">256-Bit SSL Encrypted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <FaReceipt />
          </div>
        </motion.div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Fee Schedule & Transaction History</h3>
          <span className="text-xs text-gray-400">AY 2026-2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-slate-50 text-gray-600 uppercase text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Fee Particulars</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date / Due</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {payment.month}
                    {payment.receiptNo && (
                      <span className="block text-[11px] text-gray-400 font-normal">
                        Receipt: {payment.receiptNo}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === "Pending" ? (
                      <button
                        onClick={() => handleOpenPayModal(payment)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#003566] text-white rounded-xl text-xs font-semibold hover:bg-[#00284d] transition shadow-xs"
                      >
                        <FaCreditCard /> Pay Online
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownloadInvoice(payment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition"
                      >
                        <FaDownload size={10} /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      <AnimatePresence>
        {activePaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActivePaymentModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={16} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-1">Online Fee Payment</h3>
              <p className="text-xs text-gray-500 mb-4">
                Paying for <strong>{activePaymentModal.month}</strong>
              </p>

              {paymentSuccess ? (
                <div className="p-8 text-center text-emerald-600 space-y-2">
                  <FaCheckCircle size={48} className="mx-auto" />
                  <h4 className="text-lg font-bold">Payment Succeeded!</h4>
                  <p className="text-xs text-gray-600">
                    ₹{activePaymentModal.amount.toLocaleString('en-IN')} has been credited. The official invoice receipt has been added to your portal.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                  {/* Amount Banner */}
                  <div className="bg-slate-50 p-4 rounded-2xl border text-center">
                    <span className="text-gray-500">Payable Amount:</span>
                    <h2 className="text-2xl font-black text-[#003566] mt-0.5">
                      ₹{activePaymentModal.amount.toLocaleString('en-IN')}
                    </h2>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="flex border rounded-xl overflow-hidden p-1 bg-slate-100">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition ${
                        paymentMethod === "upi" ? "bg-white text-indigo-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      <FaQrcode /> UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition ${
                        paymentMethod === "card" ? "bg-white text-indigo-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      <FaCreditCard /> Debit / Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition ${
                        paymentMethod === "netbanking" ? "bg-white text-indigo-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      <FaUniversity /> Net Banking
                    </button>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="space-y-3 text-center py-2">
                      <div className="w-36 h-36 mx-auto bg-slate-50 border-2 border-dashed border-indigo-300 rounded-2xl flex flex-col items-center justify-center p-2">
                        <FaQrcode size={64} className="text-indigo-800" />
                        <span className="text-[9px] text-gray-500 mt-1">Scan with any UPI app</span>
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1 text-left font-semibold">Or enter UPI ID / VPA</label>
                        <input
                          type="text"
                          placeholder="e.g. parent@oksbi or 9876543210@paytm"
                          defaultValue="ayushman.parent@upi"
                          className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="block text-gray-600 mb-1 font-semibold">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 •••• •••• 1234"
                          defaultValue="4532 8912 3456 7890"
                          className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-600 mb-1 font-semibold">Valid Thru</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            defaultValue="08/28"
                            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1 font-semibold">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            defaultValue="882"
                            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-3 text-left">
                      <label className="block text-gray-600 mb-1 font-semibold">Select Popular Bank</label>
                      <select className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Punjab National Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 bg-[#003566] hover:bg-[#00284d] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="animate-spin" /> Verifying Bank Gateway...
                        </>
                      ) : (
                        `Pay ₹${activePaymentModal.amount.toLocaleString('en-IN')} Securely`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
