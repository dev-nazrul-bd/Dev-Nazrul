import React from "react";
import { Project } from "../types";
import { ExternalLink, Smartphone, Globe, Layers, ArrowUpRight } from "lucide-react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

interface ProjectCardProps {
  key?: any;
  project: Project;
  onSelection: (project: Project) => void;
}

export default function ProjectCard({ project, onSelection }: ProjectCardProps) {
  const isApp = project.category === "App";
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref as any}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div
        id={`project-card-${project.id || "temp"}`}
        className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full text-slate-100 cursor-pointer"
        onClick={() => onSelection(project)}
      >
      {/* Cloudinary Image Frame with Hover Zoom */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 border-b border-slate-800">
        <img
          src={project.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60"}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          onError={(e) => {
            // Unsplash fallback helper in case the Cloudinary image fails
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80";
          }}
        />
        
        {/* Category Pill Tag Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest leading-none ${
              isApp
                ? "bg-amber-500/95 text-slate-950 shadow-md"
                : "bg-indigo-600/95 text-white shadow-md border border-indigo-400/20"
            }`}
          >
            {isApp ? (
              <Smartphone className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <Globe className="w-3 h-3 stroke-[2.5]" />
            )}
            {project.category}
          </span>
        </div>
      </div>

      {/* Description Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-sans font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
              {project.title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
          </div>

          <p className="font-sans text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Render tech stack array */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.techStack?.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-800"
              >
                {tech}
              </span>
            ))}
            {project.techStack?.length > 4 && (
              <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono bg-slate-800 text-slate-400 border border-slate-800">
                +{project.techStack.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            View Project Details
          </span>
          <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
            Explore Details
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}
