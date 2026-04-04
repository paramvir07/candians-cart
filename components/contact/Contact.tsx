"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TOPICS = [
  "General Inquiry",
  "Savings & Pricing",
  "Store Pickup",
  "Family Plans",
  "Gift Wallet & Rewards",
  "Technical Support",
  "Partnership",
  "Other",
];

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col" style={{ backgroundColor: "#f5f0e8" }}>

      {/* Diagonal cross grid — top-left fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, #c8c2b8 49%, #c8c2b8 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #c8c2b8 49%, #c8c2b8 51%, transparent 51%)
          `,
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%)",
          opacity: 0.5,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 lg:py-20">

        {/* Breadcrumb */}
        <p className="text-center text-sm text-gray-400 mb-3">
          Candian&apos;s Cart{" "}
          <span className="mx-1.5 text-gray-300">•</span>
          <span className="text-gray-500 font-medium">Contact us</span>
        </p>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 text-center mb-4 tracking-tight">
          Contact us
        </h1>
        <p className="text-center text-gray-500 text-base sm:text-lg leading-relaxed mb-10 max-w-sm sm:max-w-md">
          Got a question about savings, pickup, or your family plan? Fill in the
          form and we&apos;ll get back to you shortly.
        </p>

        {/* Characters + Card shell */}
        <div className="relative w-full max-w-[640px]">

          {/* Left character */}
          <img
            src="https://ik.imagekit.io/h7w5h0hou/contact-us-guy-left"
            alt=""
            aria-hidden="true"
            className="hidden xl:block absolute -left-[260px] bottom-0 h-[420px] w-auto object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* Right character */}
          <img
            src="https://ik.imagekit.io/h7w5h0hou/contact-us-girl-left"
            alt=""
            aria-hidden="true"
            className="hidden xl:block absolute -right-[260px] bottom-0 h-[420px] w-auto object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* ── Form card ── */}
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-16 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                Message sent!
              </h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                Thanks for reaching out. Our team will get back to you within 1
                business day.
              </p>
              <Button
                className="mt-8 bg-green-700 hover:bg-green-800 text-white rounded-full px-10 font-semibold shadow-md shadow-green-900/10"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", topic: "", message: "" });
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 sm:px-10 py-8 sm:py-10 flex flex-col gap-5"
            >
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Your name <span className="text-green-600">*</span>
                  </label>
                  <Input
                    name="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-gray-200 bg-[#fafaf8] h-12 text-sm focus-visible:ring-green-500 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Email address <span className="text-green-600">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="jane@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl border-gray-200 bg-[#fafaf8] h-12 text-sm focus-visible:ring-green-500 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Phone number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 604 000 0000"
                    value={form.phone}
                    onChange={handleChange}
                    className="rounded-xl border-gray-200 bg-[#fafaf8] h-12 text-sm focus-visible:ring-green-500 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Interested in <span className="text-green-600">*</span>
                  </label>
                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, topic: val }))
                    }
                    value={form.topic}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200 bg-[#fafaf8] h-12 text-sm focus:ring-green-500">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TOPICS.map((t) => (
                        <SelectItem key={t} value={t} className="text-sm">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  How can we help? <span className="text-green-600">*</span>
                </label>
                <Textarea
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="rounded-xl border-gray-200 bg-[#fafaf8] resize-none text-sm focus-visible:ring-green-500 placeholder:text-gray-400"
                />
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3 pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-700 hover:bg-green-800 active:scale-95 text-white font-semibold rounded-full px-12 h-12 text-sm transition-all w-full sm:w-auto shadow-md shadow-green-900/10"
                >
                  Send your message
                </Button>
                {/* <p className="text-xs text-gray-400 text-center">
                  By clicking, you agree to our{" "}
                  <a href="#" className="text-green-700 underline underline-offset-2 hover:text-green-800 transition-colors">
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-700 underline underline-offset-2 hover:text-green-800 transition-colors">
                    Privacy Policy
                  </a>
                  .
                </p> */}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;