import React, { useState } from "react";
import { Briefcase, Calendar, Star, Milestone, Award, Circle } from "lucide-react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

interface TimelineMilestone {
  year: string;
  role: string;
  organization: string;
  description: string;
  bullets: string[];
  techUsed: string[];
}

export default function WorkTimeline() {
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [ref, isVisible] = useIntersectionObserver();

  const milestones: TimelineMilestone[] = [
    {
      year: "2025 - Present",
      role: "Lead Full-stack Specialist",
      organization: "Full-Stack Web & Android Architect",
      description: "Engineering secure, scalable systems with automated database integrations and advanced rule parameters.",
      bullets: [
        "Architecting robust server structures paired with real-time cloud notifications",
        "Implementing zero-trust attribute security layers on production Firebase backends",
        "Optimizing data retrieval performance of dynamic projects by 45%"
      ],
      techUsed: ["Next.js", "TypeScript", "Vite", "Firebase Rules", "Cloudinary SDK"]
    },
    {
      year: "2024",
      role: "Native Android & Android IoT Telemetry Engineer",
      organization: "Smart Agro IoT & Mobile Systems",
      description: "Designed cross-platform and native products with BLE telemetry trackers, bluetooth local caching, and custom sensors pairing.",
      bullets: [
        "Programmed Direct Bluetooth Low Energy soil conductivity pairing channels",
        "Configured secure local SQLite files storage to support robust offline operations",
        "Distributed offline-safe custom APK packages tested over diverse real-world Android runtimes"
      ],
      techUsed: ["Kotlin/Java SDK", "Android Studio", "React Native", "SQLite Engine"]
    },
    {
      year: "2023",
      role: "Backend Architect & Database Coordinator",
      organization: "Enterprise Systems Integration Portfolio",
      description: "Focused on structural scalability, database integrity, and high-performance server pipelines.",
      bullets: [
        "Built server environments using express backend modules under serverless architectures",
        "Coordinated massive secure cloud assets hosting utilizing unsigned secure Cloudinary presets",
        "Authored modular client libraries to query high-integrity document trees"
      ],
      techUsed: ["Node.js", "Express API", "Firestore Integration", "Git Hooks"]
    },
    {
      year: "2022",
      role: "Junior Web Developer & Independent Consultant",
      organization: "Freelance System Launches",
      description: "Developed customized responsive web dashboards, responsive portfolio sites, and administrative utilities.",
      bullets: [
        "Designed and shipped 15+ pixel-perfect client landing configurations with rich interactive animations",
        "Enforced clean, accessible responsive typography rules using desktop-first layouts and mobile wrappers",
        "Interfaced with multiple payment gateways and secure custom contact web panels"
      ],
      techUsed: ["React.js", "HTML5/CSS3", "JavaScript", "Tailwind CSS", "Unsplash Assets"]
    }
  ];

  return (
    <div 
      ref={ref as any}
      id="work-timeline-section" 
      className="relative bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden"
    >
      
      {/* Background decoration */}
      <div className="absolute top-12 left-10 w-48 h-48 bg-emerald-505/5 rounded-full blur-2xl pointer-events-none" />

      {/* Specialty Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold tracking-wider uppercase">
          <Milestone className="w-3 h-3" /> Career Milestones
        </div>
        <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-slate-100 tracking-tight">Professional Roadmap & Journey</h3>
        <p className="text-xs text-slate-400 max-w-lg font-sans">
          A track record of technological achievements, key project deployments, and complex engineering solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left Side: Milestones selection buttons (vertical rail) */}
        <div className={`lg:col-span-4 space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none gap-2 transition-all duration-700 ease-out transform ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-y-4 lg:-translate-y-0 lg:-translate-x-12"
        }`}>
          {milestones.map((ms, index) => {
            const isSelected = selectedMilestone === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedMilestone(index)}
                className={`flex-shrink-0 w-48 lg:w-full flex items-center gap-3 p-4 rounded-xl text-left border cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-indigo-600/10 border-indigo-650 text-white shadow shadow-indigo-600/5" 
                    : "bg-slate-950/45 border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-indigo-400 animate-ping" : "bg-slate-700"}`} />
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80 text-indigo-300 font-extrabold">
                    {ms.year}
                  </span>
                  <h4 className="font-sans font-bold text-xs truncate mt-1 text-slate-100">{ms.role}</h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Showcase values details */}
        <div className={`lg:col-span-8 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all duration-700 delay-150 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0 text-slate-100" : "opacity-0 translate-y-12 text-slate-100"
        }`}>
          <div className="space-y-4">
            {/* Header metadata */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-900 pb-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 tracking-wider">
                  {milestones[selectedMilestone].year}
                </span>
                <h3 className="font-sans font-extrabold text-lg text-slate-100">
                  {milestones[selectedMilestone].role}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                  {milestones[selectedMilestone].organization}
                </p>
              </div>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-flex items-center gap-1 font-mono text-[10px] text-indigo-300 uppercase self-start">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Verified Active
              </div>
            </div>

            {/* Description and detailed list */}
            <p className="text-xs text-slate-350 leading-relaxed font-sans italic">
              "{milestones[selectedMilestone].description}"
            </p>

            <ul className="space-y-2.5">
              {milestones[selectedMilestone].bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 leading-normal">
                  <Circle className="w-1.5 h-1.5 text-indigo-500 fill-indigo-500 mt-1.5 flex-shrink-0" />
                  <span className="font-sans">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech badges used list */}
          <div className="pt-4 border-t border-slate-905 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Core Stack:</span>
            {milestones[selectedMilestone].techUsed.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-900 border border-slate-800/80 rounded font-mono text-[10px] text-slate-300 font-bold"
              >
                {tech}
              </span>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
