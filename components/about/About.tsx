"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

function ScrollToSection() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sectionId = searchParams.get("scrollTo");
    if (!sectionId) return;

    let attempts = 0;
    const navbarHeight = 72;
    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: "smooth" });
      } else if (attempts < 20) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, [searchParams]);

  return null;
}

const stats = [
  { value: "500+", label: "Families served" },
  { value: "30%", label: "Avg. savings" },
  { value: "1", label: "City so far" },
  { value: "2026", label: "Founded" },
];

const values = [
  {
    emoji: "🌿",
    title: "Fresh & Local",
    description:
      "We partner with local suppliers to bring your family the freshest produce, sourced as close to home as possible.",
  },
  {
    emoji: "🍁",
    title: "Canadian Families First",
    description:
      "Every feature, every price, every decision — made with Canadian families in mind. This platform exists for you.",
  },
  {
    emoji: "💸",
    title: "Real Savings",
    description:
      "Subsidised pricing isn't a gimmick. We've structured our model so families save 30% on average, every week.",
  },
  {
    emoji: "🤝",
    title: "Community-Driven",
    description:
      "Candian's Cart is invite-only and grows through trust. Our members refer neighbours, friends, and family.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ backgroundColor: "#f5f0e8" }}>

      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
          `,
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
        }}
      />

      <div className="relative z-10">

        <section className="pt-20 pb-16 flex items-center justify-center gap-0">
          <div className="hidden lg:flex flex-shrink-0 items-end justify-end w-[200px] xl:w-[260px] self-end">
            <Image
              src="https://ik.imagekit.io/h7w5h0hou/customer-aboutus-left.png"
              alt=""
              width={260}
              height={460}
              className="object-contain object-bottom w-full"
              priority
            />
          </div>

          <div className="text-center max-w-2xl px-6">
            <Badge
              variant="outline"
              className="mb-6 text-green-700 border-green-300 bg-green-50 font-medium px-3 py-1 rounded-full text-sm"
            >
              🍁 Our Story · Abbotsford, BC
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Grocery savings built{" "}
              <span className="text-green-600">for families like yours</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Candian&apos;s Cart started with a simple idea: every Canadian family
              deserves access to fresh, affordable groceries — without the hassle.
              We&apos;re a subsidised grocery pickup service exclusive to families in
              Abbotsford, BC.
            </p>
          </div>

          <div className="hidden lg:flex flex-shrink-0 items-end justify-start w-[200px] xl:w-[260px] self-end">
            <Image
              src="https://ik.imagekit.io/h7w5h0hou/customer-aboutus-right.png"
              alt=""
              width={260}
              height={460}
              className="object-contain object-bottom w-full"
              priority
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 mb-16">
          <div className="bg-green-700 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold">{s.value}</div>
                <div className="text-green-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 mb-16">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-green-700 font-semibold uppercase text-xs tracking-widest mb-2">
                Our Mission
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                Everything your family needs,{" "}
                <span className="text-green-600">for less</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We saw families spending too much on grocery staples. We built a
                better way — partnering with local stores to offer exclusive
                subsidised pricing, live inventory, and easy store pickup. No
                subscriptions, no hidden fees.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, over 500 families in Abbotsford save an average of 30%
                every month shopping with Candian&apos;s Cart. We&apos;re just getting
                started.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                This week&apos;s savings
              </div>
              <div className="text-4xl font-extrabold text-green-700 mb-1">
                $31.40 saved
              </div>
              <div className="text-sm text-gray-500 mb-4">
                On a 4-item cart · 37% avg off
              </div>
              <Separator className="mb-4" />
              {[
                { name: "Sher Atta 20lb", price: "$12.49", save: "34%" },
                { name: "Basmati Rice 10kg", price: "$15.99", save: "36%" },
                { name: "Yellow Onions 5lb", price: "$2.79", save: "38%" },
                { name: "Patak's Curry Paste", price: "$3.29", save: "40%" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center py-2 text-sm"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {item.price}
                    </span>
                    <Badge className="bg-green-100 text-green-700 text-xs font-medium hover:bg-green-100">
                      Save {item.save}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="values" className="max-w-4xl mx-auto px-4 mb-16">
          <p className="text-green-700 font-semibold uppercase text-xs tracking-widest mb-2 text-center">
            What We Stand For
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <Card
                key={v.title}
                className="bg-white border border-gray-100 shadow-none rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{v.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {v.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {v.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-green-700 rounded-2xl p-8 sm:p-12 text-center text-white">
            <div className="text-2xl sm:text-3xl font-extrabold mb-3">
              Ready to start saving?
            </div>
            <p className="text-green-200 mb-6 text-sm sm:text-base">
              Join 500+ families in Abbotsford who shop smarter every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/customer/signup">
                <Button
                  size="lg"
                  className="bg-white text-green-800 font-semibold hover:bg-green-50 rounded-full px-8"
                >
                  Sign Up
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-green-600 rounded-full px-8 bg-transparent"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;