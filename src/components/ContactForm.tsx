import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("Please fill out all the input fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const messagesCollection = collection(db, "messages");
      
      // Save directly to Firestoremessages collection
      await addDoc(messagesCollection, {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp(),
        seen: false, // Mark newly saved messages as unseen by default
      });

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error("Feedback Save Error:", err);
      // Complies with strict Firebase integration error reporting requirement
      try {
        handleFirestoreError(err, OperationType.WRITE, "messages");
      } catch (processedErr: any) {
        setErrorMsg("Failed to deliver message. Firebase protection rejected the transmission.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-form-component" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 max-w-xl mx-auto text-slate-100">
      <div className="text-center mb-6">
        <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-slate-100">Send a Message</h3>
        <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
          Have an idea or project? Let's talk and build it together!
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Transmission Successful!</span>
            <span>Your message has been safely logged in Dev Nazrul's inbox. We will reach back to you soon.</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="contact-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={loading}
            className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/75 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm disabled:opacity-50"
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="contact-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            disabled={loading}
            className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/75 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm disabled:opacity-50"
          />
        </div>

        {/* Detailed Message */}
        <div>
          <label htmlFor="contact-message" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Detailed Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="What is your product idea, target budget, or general inquiry?..."
            required
            disabled={loading}
            className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 rounded-xl py-3 px-4 outline-none focus:border-indigo-500/75 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm resize-none disabled:opacity-50"
          />
        </div>

        {/* Send Trigger Button */}
        <button
          type="submit"
          id="contact-submit-btn"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98] transition-all text-sm uppercase font-mono tracking-wider cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Sending message...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Secure Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
