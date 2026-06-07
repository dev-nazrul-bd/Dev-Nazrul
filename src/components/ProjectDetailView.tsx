import { useState } from "react";
import { Project } from "../types";
import { ArrowLeft, Globe, Smartphone, Play, LogIn, ChevronDown, ChevronUp, Download, Eye, QrCode, Share2, Check, X } from "lucide-react";

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const [activeAccordion, setActiveAccordion] = useState<"guide" | "changelog" | null>("guide");
  const [copiedShare, setCopiedShare] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const isApp = project.category === "App";

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleShare = () => {
    const slug = slugify(project.title);
    const origin = window.location.origin;
    const shareUrl = `${origin}/${slug}`;

    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: shareUrl,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    }
    
    // Always fall back to copy to clipboard for robust UX
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2005);
      })
      .catch(err => {
        console.warn("Clipboard copying failed", err);
      });
  };

  // Helper to extract Embeddable YouTube or Vimeo URLs from regular watch links for iframe support
  const getEmbedVideoUrl = (url?: string): string | null => {
    if (!url) return null;
    
    try {
      // YouTube Embed convertor
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (url.includes("youtube.com/embed/")) {
        return url;
      }
      
      // Vimeo Embed convertor
      if (url.includes("vimeo.com/")) {
        const vId = url.split("vimeo.com/")[1]?.split("?")[0];
        return vId ? `https://player.vimeo.com/video/${vId}` : null;
      }
    } catch (e) {
      console.warn("Invalid video URL format", e);
    }
    
    return null;
  };

  const embedVideoUrl = getEmbedVideoUrl(project.videoUrl);

  const toggleAccordion = (section: "guide" | "changelog") => {
    if (activeAccordion === section) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(section);
    }
  };

  return (
    <div id="project-detail-view" className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation anchor */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-mono text-indigo-400 hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </button>

        {/* Title and Category Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-100 mb-2">
              {project.title}
            </h1>
            <p className="font-mono text-xs text-indigo-400 tracking-wide">
              Created At: {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-widest ${
                isApp
                  ? "bg-amber-500 text-slate-950"
                  : "bg-indigo-600 text-white border border-indigo-500/20"
              }`}
            >
              {isApp ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {project.category} Showcase
            </span>

            <button
               onClick={handleShare}
               className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-widest bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Media Layout & Core Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Showcase (Image / Video Embed) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Embedded Video Walkthrough if present */}
            {embedVideoUrl && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-extrabold block">
                  Interactive Video Walkthrough
                </span>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl relative animate-fade-in">
                  <iframe
                    src={`${embedVideoUrl}?autoplay=0`}
                    title={`${project.title} walk-through`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Showcase Image Section (Full Width, ALWAYS shown on top) */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-extrabold block">
                Primary Showcase Image
              </span>
              <div 
                className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl relative group cursor-zoom-in"
                onClick={() => setFullscreenImage(project.imageUrl)}
              >
                <img
                  src={project.imageUrl}
                  alt={`${project.title} showcase`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-350"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="px-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-indigo-400 font-mono tracking-wider uppercase shadow-xl flex items-center gap-1.5 animate-pulse">
                    <Eye className="w-4 h-4" /> Click to view full screen
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots Gallery Section (Google Play Store Style, shown below primary featured image) */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-extrabold block">
                  Project Screenshots (Height: 1.5")
                </span>
                <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-indigo-900/40 select-none">
                  {project.screenshots.map((screen, idx) => (
                    <div
                      key={idx}
                      className="h-[1.5in] flex-shrink-0 aspect-[9/16] rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900 shadow-md relative group cursor-zoom-in snap-start hover:border-indigo-500 transition-all duration-300"
                      onClick={() => setFullscreenImage(screen)}
                    >
                      <img
                        src={screen}
                        alt={`Screenshot ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-1.5 py-0.5 bg-slate-950/95 rounded text-[8px] font-mono tracking-wider text-indigo-400 border border-slate-850 uppercase shadow-lg">
                          Zoom
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">About the Project</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          </div>

          {/* Right Column: Call to Actions & Accordions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Instant Actions Panel with Live Link or APK QR Code */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <h3 className="font-sans font-bold text-base text-slate-200 uppercase tracking-wider text-center border-b border-slate-800 pb-3">
                Project Interactions
              </h3>

              {isApp ? (
                <div id="apk-info-box" className="text-center space-y-4 flex flex-col items-center">
                  {project.apkLink ? (
                    <>
                      {/* Live generated QR Code of the apk download link via standard secure QR API */}
                      <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(
                            project.apkLink
                          )}`}
                          alt="Download Link QR Code"
                          className="w-[140px] h-[140px] block"
                        />
                      </div>
                      <p className="text-xs text-slate-400 font-mono max-w-xs leading-normal">
                        Scan the QR Code with your Android phone camera to download the installer directly.
                      </p>

                      <a
                        href={project.apkLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/10 transition-all font-mono text-sm uppercase cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        Download APK Installer
                      </a>
                    </>
                  ) : (
                    <p className="text-slate-500 text-xs font-mono py-4">APK Link not provided by developer</p>
                  )}
                </div>
              ) : (
                <div id="web-info-box" className="space-y-4">
                  {project.liveLink ? (
                    <>
                      <p className="text-xs text-center text-slate-400 font-mono leading-normal">
                        This web portal is in production and live on the internet! Click below to visit.
                      </p>
                      
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all font-mono text-sm uppercase cursor-pointer animate-pulse"
                      >
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                        Visit Live Preview
                      </a>
                    </>
                  ) : (
                    <p className="text-slate-500 text-xs text-center font-mono py-4">Live Link not provided by developer</p>
                  )}
                </div>
              )}

              {/* Technologies Stack tags */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-2 font-bold select-none">
                  Core Technologies used
                </span>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 border border-slate-800 text-indigo-400 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialized Sharing Distribution segment */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold select-none">
                  Share & Promote Project
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const slug = slugify(project.title);
                      const url = `${window.location.origin}/${slug}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/25 text-[#1877F2] rounded-xl transition-all cursor-pointer"
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={() => {
                      const slug = slugify(project.title);
                      const url = `${window.location.origin}/${slug}`;
                      const text = `Check out this amazing project: ${project.title}`;
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/25 text-[#1DA1F2] rounded-xl transition-all cursor-pointer"
                  >
                    <span>Twitter (X)</span>
                  </button>

                  <button
                    onClick={() => {
                      const slug = slugify(project.title);
                      const url = `${window.location.origin}/${slug}`;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/25 text-[#0A66C2] rounded-xl transition-all cursor-pointer"
                  >
                    <span>LinkedIn Network</span>
                  </button>
                </div>
              </div>
            </div>

            {/* User Guide & Changelogs in distinct elegant Accordions */}
            <div className="space-y-3">
              
              {/* Accordion 1: User Guide */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleAccordion("guide")}
                  id="accordion-toggle-guide"
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-850/50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-200">
                    Step-by-Step User Guide
                  </span>
                  {activeAccordion === "guide" ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {activeAccordion === "guide" && (
                  <div className="p-4 border-t border-slate-800 text-sm text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-line font-medium text-slate-300">
                    {project.guide ? (
                      project.guide
                    ) : (
                      <span className="italic text-slate-500 font-mono text-xs">No configuration or installation guide available.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Changelogs / Version Tracker */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleAccordion("changelog")}
                  id="accordion-toggle-changelog"
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-850/50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-200">
                    Version Changelog History
                  </span>
                  {activeAccordion === "changelog" ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {activeAccordion === "changelog" && (
                  <div className="p-4 border-t border-slate-800 space-y-4 max-h-[300px] overflow-y-auto">
                    {project.versionLogs && project.versionLogs.length > 0 ? (
                      project.versionLogs.map((log, index) => (
                        <div key={index} className="p-3 bg-slate-950/50 rounded-lg border border-slate-850 space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-mono font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              v{log.version}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">
                              {log.date}
                            </span>
                          </div>
                          
                          {/* Rendering changes array list */}
                          <ul className="list-disc pl-4 space-y-1">
                            {log.changes?.map((ch, idx) => (
                              <li key={idx} className="text-xs text-slate-400">
                                {ch}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <span className="italic text-slate-500 font-mono text-xs block p-2">Initial production release (v1.0.0). No newer update records.</span>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          {/* Close trigger button */}
          <button 
            type="button"
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900/65 border border-slate-800 text-white hover:text-indigo-400 hover:scale-105 transition-all cursor-pointer z-50"
            onClick={() => setFullscreenImage(null)}
            aria-label="Close Fullscreen View"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={fullscreenImage} 
            alt="Fullscreen Screenshot" 
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl border border-slate-900 select-none animate-in zoom-in-95 duration-150"
          />
          <p className="mt-4 font-mono text-center text-xs text-slate-400 select-none">
            Click anywhere on background to exit fullscreen
          </p>
        </div>
      )}

    </div>
  );
}
