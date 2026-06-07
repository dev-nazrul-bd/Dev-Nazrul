import React, { useState, useEffect } from "react";
import { BadgeCheck, Sparkles, MessageSquare, Phone, Landmark, HelpCircle, ChevronRight, Zap } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

type ServiceType = "android" | "web" | "backend";

export default function ServicesPricing() {
  const [service, setService] = useState<ServiceType>("web");
  const [pagesCount, setPagesCount] = useState<number>(3);
  const [dbAddon, setDbAddon] = useState<boolean>(true);
  const [adminAddon, setAdminAddon] = useState<boolean>(false);
  const [securityAddon, setSecurityAddon] = useState<boolean>(true);
  const [costText, setCostText] = useState<number>(0);
  const [unDiscountedCost, setUnDiscountedCost] = useState<number>(0);

  // Fallback baseline rates, to be sync updated if live Firebase document exists
  const [rates, setRates] = useState({
    webBase: 12000,
    webMultiplier: 2500,
    androidBase: 16050,
    androidMultiplier: 3500,
    backendBase: 8000,
    backendMultiplier: 2000,
    dbAddon: 5000,
    adminAddon: 7500,
    securityAddon: 4000,
    discountPercentage: 20,
    discountActive: true,
    discountHeading: "অফার! বিশেষ প্রোমোショナル ডিসকাউন্ট উপলক্ষ্যে আকর্ষণীয় মূল্যছাড়!",
  });

  // Load dynamic rate states from Live Firebase on component mount
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const pricingDocRef = doc(db, "settings", "pricing");
        const pricingSnap = await getDoc(pricingDocRef);
        if (pricingSnap.exists()) {
          const data = pricingSnap.data();
          setRates({
            webBase: Number(data.webBase ?? 12000),
            webMultiplier: Number(data.webMultiplier ?? 2500),
            androidBase: Number(data.androidBase ?? 16050),
            androidMultiplier: Number(data.androidMultiplier ?? 3500),
            backendBase: Number(data.backendBase ?? 8000),
            backendMultiplier: Number(data.backendMultiplier ?? 2000),
            dbAddon: Number(data.dbAddon ?? 5000),
            adminAddon: Number(data.adminAddon ?? 7500),
            securityAddon: Number(data.securityAddon ?? 4000),
            discountPercentage: Number(data.discountPercentage ?? 20),
            discountActive: data.discountActive ?? true,
            discountHeading: data.discountHeading ?? "অফার! বিশেষ প্রোমোショナル ডিসকাউন্ট উপলক্ষ্যে আকর্ষণীয় মূল্যছাড়!",
          });
        }
      } catch (err) {
        console.warn("Could not query dynamic rates. Falling back to default baseline configurations.", err);
      }
    };
    fetchLiveRates();
  }, []);

  // Calculated estimates based on fetched rates
  useEffect(() => {
    let baseRate = 0;
    let multiplier = 0;

    if (service === "web") {
      baseRate = rates.webBase;
      multiplier = rates.webMultiplier;
    } else if (service === "android") {
      baseRate = rates.androidBase;
      multiplier = rates.androidMultiplier;
    } else {
      baseRate = rates.backendBase;
      multiplier = rates.backendMultiplier;
    }

    let calculated = baseRate + (pagesCount * multiplier);

    if (dbAddon) calculated += rates.dbAddon;
    if (adminAddon) calculated += rates.adminAddon;
    if (securityAddon) calculated += rates.securityAddon;

    setUnDiscountedCost(calculated);

    if (rates.discountActive) {
      const discount = Math.round((calculated * rates.discountPercentage) / 100);
      setCostText(calculated - discount);
    } else {
      setCostText(calculated);
    }
  }, [service, pagesCount, dbAddon, adminAddon, securityAddon, rates]);

  const handleEmailProposalRoute = () => {
    const serviceLabels: Record<ServiceType, string> = {
      web: "Full-Stack Web Application (Next.js / React)",
      android: "Native Android Mobile App (Kotlin / React Native)",
      backend: "Secure Backend Server & Firebase Rules Integration"
    };

    const text = `Hello Dev Nazrul! I visited your portfolio and used your Budget Planner. 

I am interested in collaborating on:
- Service: ${serviceLabels[service]}
- Scale/Scope: ${pagesCount} ${service === "android" ? "Feature Modules" : "Pages / API routes"}
- Firestore DB + Auth Addon: ${dbAddon ? "Yes" : "No"}
- Admin Controls Portal Addon: ${adminAddon ? "Yes" : "No"}
- Security Auditing Rules Addon: ${securityAddon ? "Yes" : "No"}

Estimated Quote: BDT ৳${costText.toLocaleString()}

Please let me know your availability to discuss further!`;

    const encoded = encodeURIComponent(text);
    window.open(`mailto:dev.nazrul.bd@gmail.com?subject=Collaborative%20Budget%20Proposal%20-%20Dev%20Nazrul&body=${encoded}`, "_self");
  };

  return (
    <div id="services-pricing-wrapper" className="space-y-6 w-full relative z-10">
      
      {/* Glow highlight */}
      <div className="absolute bottom-4 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Dynamic Campaign Discount Header Announcement Banner */}
      {rates.discountActive && (
        <div className="bg-indigo-650/15 border border-indigo-500/25 p-4 rounded-xl flex items-center gap-3 animate-pulse text-indigo-300 font-sans text-xs sm:text-sm font-semibold select-none leading-relaxed">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
          <span>
            {rates.discountHeading} <strong className="text-amber-400 text-sm">({rates.discountPercentage}% flat discount applied!)</strong>
          </span>
        </div>
      )}

      <div id="services-pricing-section" className="flex flex-col xl:flex-row gap-8 items-stretch">
        {/* Left column: Quick Service Cards */}
        <div className="w-full xl:w-1/2 space-y-4 text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Zap className="w-3 h-3" /> Collaboration Offerings
            </div>
            <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-slate-100 tracking-tight">Services & Professional Standards</h3>
            <p className="text-xs text-slate-400 font-sans">
              Guaranteed high-performance deliverables designed to scale and optimize conversion rates.
            </p>
          </div>

          {/* Categories description columns */}
          <div className="space-y-3 pt-2">
            <div onClick={() => setService("web")} className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${service === "web" ? "bg-slate-900 border-indigo-500" : "bg-slate-900/30 border-slate-800 hover:border-slate-700/80"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sans font-extrabold text-xs tracking-wider uppercase text-indigo-400">01. Web App Specialist</span>
                <span className="text-[10px] font-mono text-slate-450 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Next.js / React</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-100 mb-1">Full-Stack Cloud Portals</h4>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Production-ready single page systems loaded with seamless local/cloud synchronization pipelines, image-compression and interactive tables.
              </p>
            </div>

            <div onClick={() => setService("android")} className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${service === "android" ? "bg-slate-900 border-indigo-500" : "bg-slate-900/30 border-slate-800 hover:border-slate-700/80"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sans font-extrabold text-xs tracking-wider uppercase text-indigo-400">02. Mobile App Specialist</span>
                <span className="text-[10px] font-mono text-slate-455 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Kotlin / React Native</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-100 mb-1">Android IoT Telemetry APKs</h4>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Native SDK configurations paired with BLE telemetry monitors, bluetooth adapters integrations, and high-performance offline SQLite buffers.
              </p>
            </div>

            <div onClick={() => setService("backend")} className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${service === "backend" ? "bg-slate-900 border-indigo-500" : "bg-slate-900/30 border-slate-800 hover:border-slate-700/80"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-sans font-extrabold text-xs tracking-wider uppercase text-indigo-400">03. Database Specialist</span>
                <span className="text-[10px] font-mono text-slate-455 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Serverless & Rules Auditing</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-100 mb-1">Secure Systems Architecture</h4>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Firebase configuration setups, zero-trust granular access control rules, robust express routes mapping, and security auditing logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Rich Cost Estimator Planner */}
        <div className="w-full xl:w-1/2 bg-slate-900/50 border border-slate-850 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-sans font-extrabold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-400" /> Dynamic Quote Planner
              </h4>
              <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-300 px-2 py-0.5 border border-indigo-500/20 rounded">
                Real-time calculations
              </span>
            </div>

            {/* Interactive Parameters Selector */}
            <div className="space-y-4">
              {/* Service Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Select Target Stream:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                  {(["web", "android", "backend"] as ServiceType[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setService(st);
                        setPagesCount(st === "backend" ? 2 : 3);
                      }}
                      className={`text-[10px] font-mono font-bold uppercase py-2 rounded-md tracking-wider transition-all cursor-pointer ${
                        service === st ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-250"
                      }`}
                    >
                      {st === "web" ? "Web UI" : st === "android" ? "Android" : "Cloud DB"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider track */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {service === "android" ? "Feature Modules / Views:" : service === "backend" ? "Database Collections:" : "Quantity of Layout Pages:"}
                  </span>
                  <span className="text-slate-100 font-extrabold bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">{pagesCount}</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={15} 
                  step={1}
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg outline-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>1 Minimum</span>
                  <span>15 Custom Scale</span>
                </div>
              </div>

              {/* Add-on toggles list */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <label className="text-xs font-mono text-slate-400 block">Optional Technical Milestones Adds:</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setDbAddon(!dbAddon)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-950 border border-slate-800/80 hover:border-slate-850 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={dbAddon} readOnly className="accent-indigo-500" />
                      <span className="font-sans text-slate-300">Firestore Real-time DB & Auth Integration</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">+৳{rates.dbAddon.toLocaleString()}</span>
                  </button>

                  <button 
                    onClick={() => setAdminAddon(!adminAddon)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-950 border border-slate-800/80 hover:border-slate-850 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={adminAddon} readOnly className="accent-indigo-500" />
                      <span className="font-sans text-slate-300">Custom Admin Panel Dashboard View</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">+৳{rates.adminAddon.toLocaleString()}</span>
                  </button>

                  <button 
                    onClick={() => setSecurityAddon(!securityAddon)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-950 border border-slate-800/80 hover:border-slate-850 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={securityAddon} readOnly className="accent-indigo-500" />
                      <span className="font-sans text-slate-300">Zero-Trust Rules Security Auditing</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">+৳{rates.securityAddon.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic quote output header */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-500">Formulated Investment:</span>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                {rates.discountActive && (
                  <span className="text-xs font-mono text-slate-500 line-through">
                    ৳{unDiscountedCost.toLocaleString()}
                  </span>
                )}
                <div className="font-sans font-black text-xl sm:text-2xl text-emerald-400 tracking-tight">
                  ৳{costText.toLocaleString()} <span className="text-xs font-mono font-medium text-slate-400">BDT</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEmailProposalRoute}
              className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-lg transition-all text-[11px] uppercase tracking-wide cursor-pointer font-mono shadow-lg shadow-indigo-600/20"
            >
              Email Proposal <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
