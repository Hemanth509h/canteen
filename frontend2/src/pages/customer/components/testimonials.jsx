import { useState } from "react";
import { Send, Star, CheckCircle, X } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";

const initialForm = {
  customerName: "",
  eventType: "",
  rating: 5,
  comment: "",
};

function SuccessPopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-2xl flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20">
          <CheckCircle size={36} className="text-amber-500" />
        </div>
        <h3 className="font-playfair text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Thank You!
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-jakarta leading-relaxed">
          Your review has been submitted successfully. We appreciate you sharing your experience!
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Testimonials({ reviews, onSubmitReview, isSubmittingReview = false }) {
  const list = reviews?.length ? reviews.slice(0, 3) : [];
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.customerName.trim() || !form.comment.trim()) {
      setErrorMessage("Please enter your name and review.");
      return;
    }

    try {
      await onSubmitReview?.({
        customerName: form.customerName.trim(),
        eventType: form.eventType.trim() || "Customer Review",
        rating: Number(form.rating || 5),
        comment: form.comment.trim(),
      });
      setForm(initialForm);
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(error?.message || "Could not add your review. Please try again.");
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900 py-20 px-6 transition-colors duration-300">
      {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-3">Reviews</p>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-zinc-900 dark:text-white transition-colors">What Clients Say</h2>
        </Reveal>
        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((r, i) => {
            const displayName = r.customerName || r.name;
            const displayComment = r.comment || r.message;
            const displayEventType = r.eventType || r.title;
            const rating = Math.max(1, Math.min(5, Number(r.rating || 5)));
            if (!displayName || !displayComment) return null;
            return (
            <Reveal key={i} delay={i * 200}>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex flex-col gap-4 transition-colors h-full">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className={j < rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"} />
                  ))}
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 font-jakarta text-sm leading-relaxed flex-1">"{displayComment}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center font-playfair font-bold text-amber-700 dark:text-amber-400">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-sm text-zinc-900 dark:text-white">{displayName}</p>
                    {displayEventType && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-jakarta">{displayEventType}</p>}
                  </div>
                </div>
              </div>
            </Reveal>
            );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">No reviews yet. Be the first to add one.</p>
        )}
        <Reveal className="mt-10">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4">
              <h3 className="font-playfair text-2xl font-bold text-zinc-900 dark:text-white">Add Your Review</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Share your experience with our catering service.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                placeholder="Your name"
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900"
                required
              />
              <input
                value={form.eventType}
                onChange={(event) => setForm({ ...form, eventType: event.target.value })}
                placeholder="Event type"
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <select
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} Star{rating === 1 ? "" : "s"}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <textarea
                value={form.comment}
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
                placeholder="Write your review"
                rows={4}
                className="sm:col-span-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-900"
                required
              />
            </div>
            {errorMessage && <p className="mt-3 text-sm font-semibold text-red-500">{errorMessage}</p>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
