import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Project } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectCard";
import ProjectDetailView from "./components/ProjectDetailView";
import ContactForm from "./components/ContactForm";
import AdminPanel from "./components/AdminPanel";
import SkillsMatrix from "./components/SkillsMatrix";
import WorkTimeline from "./components/WorkTimeline";
import ServicesPricing from "./components/ServicesPricing";
import Guestbook from "./components/Guestbook";
import AIAssistant from "./components/AIAssistant";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { AVAILABLE_THEMES } from "./themes";
import { Laptop, Briefcase, Phone, Settings, ShieldAlert, Cpu, Heart, Code, Sparkles, MapPin, Layers, Loader2, Github, Facebook, Linkedin, MessageCircle, Sun, Moon, Search, X } from "lucide-react";

export default function App() {
  const [currentView, setView] = useState<string>("home");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  
  const [databaseProjects, setDatabaseProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Theme state choice of the viewer
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("portfolio-user-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const [adminDefaultTheme, setAdminDefaultTheme] = useState<string>("dark");

  // Load database-configured default theme on startup
  useEffect(() => {
    const fetchDefaultThemeSettings = async () => {
      try {
        const themeDocRef = doc(db, "settings", "theme");
        const themeSnap = await getDoc(themeDocRef);
        if (themeSnap.exists()) {
          const dbTheme = themeSnap.data().theme;
          if (dbTheme) {
            setAdminDefaultTheme(dbTheme);
            // Sync theme only if this user hasn't explicitly set their own manual visual choice override
            if (!localStorage.getItem("portfolio-user-theme")) {
              setTheme(dbTheme);
            }
          }
        }
      } catch (err) {
        console.warn("Dynamic settings reading skipped in sandbox.");
      }
    };
    fetchDefaultThemeSettings();
  }, []);

  // Synchronize Brand Icon with Browser Favicon dynamically
  useEffect(() => {
    const fetchBrandIconSettings = async () => {
      try {
        const installerDocRef = doc(db, "settings", "installer");
        const installerSnap = await getDoc(installerDocRef);
        if (installerSnap.exists()) {
          const data = installerSnap.data();
          if (data.appIconUrl) {
            // Update favicon link elements dynamically
            const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = data.appIconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);
          }
        }
      } catch (e) {
        console.warn("Favicon settings retrieval skipped or unconfigured.");
      }
    };
    fetchBrandIconSettings();
  }, []);

  // Update HTML data-attribute when theme changes
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
    } catch (e) {
      console.warn("Could not write data-theme attribute on root:", e);
    }
  }, [theme]);

  // Handler for user custom theme choice
  const handleUserThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("portfolio-user-theme", newTheme);
    } catch (e) {
      console.warn("LocalStorage access limits handled safely:", e);
    }
  };

  // Baseline templates as fallbacks if the Firestore database is empty or loading
  const baselineTemplateProjects: Project[] = [
    {
      id: "baseline-1",
      title: "Tele-Health Care Systems",
      description: "A comprehensive telemedicine web application featuring real-time calendar appointment slots booking, face-to-face secure encrypted peer video channels, responsive analytics trackers, and integrated prescription PDF invoices creation.",
      category: "Web",
      techStack: ["Next.js", "Firebase Firestore", "WebRTC", "Cloudinary Hosting", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      liveLink: "https://dev-nazrul.firebaseapp.com",
      guide: "1. Fork repository\n2. Setup Environment keys: CLOUDINARY_API_KEY, FIREBASE_DB_SECRET\n3. Run 'npm install'\n4. Invoke 'npm run dev' to boot dev server on localhost:3000.",
      versionLogs: [
        { version: "1.0.2", date: "2026-05-12", changes: ["Added encrypted WebRTC tunnels", "Optimized mobile layouts"] },
        { version: "1.0.0", date: "2026-04-20", changes: ["Initial baseline rollout"] }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "baseline-2",
      title: "Android Smart Agronomy Monitor",
      description: "Sleek IoT powered android application. Features direct Bluetooth low energy (BLE) soil conductivity sensors pairing, automated regional weather warning logs, offline local SQLite backups sync, and automatic PDF crop diagnosis dispatching.",
      category: "App",
      techStack: ["React Native", "Android SDK", "Node.js Helpers", "Cloudinary Storage", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80",
      apkLink: "https://dev-nazrul.firebaseapp.com/downloads/smart_agronomy.apk",
      guide: "1. Download Android APK file from download portal\n2. Allow 'Install from Unknown Sources' in system settings\n3. Start telemetry pairing.",
      versionLogs: [
        { version: "1.1.0", date: "2026-05-24", changes: ["Upgraded BLE pairing speed by 40%", "Integrated Push alert triggers"] }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Fetch real-time projects from cloud Firestore database
  const getProjectsFromCloud = async () => {
    setIsLoading(true);
    try {
      const projCollection = collection(db, "projects");
      const projQuery = query(projCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(projQuery);
      
      const loaded: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Project);
      });
      
      setDatabaseProjects(loaded);
    } catch (err) {
      console.warn("Could not query FireStore projects securely. Using local showcase templates instead.", err);
      // Reporting error inside compliant format
      try {
        handleFirestoreError(err, OperationType.LIST, "projects");
      } catch (e) {
        // Suppress message popups so client falls back beautifully.
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Slugify helper supporting custom routing
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Listen to browser URL path changes (and hash triggers) to load requested views dynamically
  useEffect(() => {
    const handleUrlRouting = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const queryView = urlParams.get("view");
      
      let cleanPath = pathname;
      if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
      if (cleanPath.endsWith("/")) cleanPath = cleanPath.slice(0, -1);
      
      if (
        pathname === "/admin" || 
        pathname === "/admin/" || 
        hash === "#/admin" || 
        hash === "#admin" || 
        queryView === "admin"
      ) {
        setView("admin");
        setActiveProject(null);
      } else if (
        pathname === "/gallery" || 
        pathname === "/gallery/" || 
        hash === "#/gallery" || 
        hash === "#gallery" || 
        queryView === "gallery"
      ) {
        setView("gallery");
        setActiveProject(null);
      } else if (
        pathname === "/contact" || 
        pathname === "/contact/" || 
        hash === "#/contact" || 
        hash === "#contact" || 
        queryView === "contact"
      ) {
        setView("contact");
        setActiveProject(null);
      } else if (
        pathname === "/budget" || 
        pathname === "/budget/" || 
        hash === "#/budget" || 
        hash === "#budget" || 
        queryView === "budget"
      ) {
        setView("budget");
        setActiveProject(null);
      } else if (cleanPath !== "" && cleanPath !== "home") {
        // Lookups will be executed once the projects are sync loaded
      } else {
        setView("home");
        setActiveProject(null);
      }
    };

    // Initialize on page load
    handleUrlRouting();

    // Listen to browser history buttons (fwd/back) or manual hash mutations
    window.addEventListener("popstate", handleUrlRouting);
    window.addEventListener("hashchange", handleUrlRouting);

    return () => {
      window.removeEventListener("popstate", handleUrlRouting);
      window.removeEventListener("hashchange", handleUrlRouting);
    };
  }, []);

  // Update URL history synchronously when clicking on-screen links without reloading the page
  const navigateToRoute = (newView: string) => {
    setView(newView);
    setActiveProject(null);

    const targetPath = newView === "home" ? "/" : `/${newView}`;
    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: newView }, "", targetPath);
      }
    } catch (e) {
      console.warn("pushState blocked by security restrictions in iframe:", e);
      // Fallback: update the URL hash to support seamless routing in iframe bounds
      window.location.hash = `#/${newView}`;
    }
  };

  useEffect(() => {
    getProjectsFromCloud();
  }, [currentView]);

  // Combined source: combines standard Firestore rows with templates for a full catalog
  const allProjects = databaseProjects.length > 0 ? databaseProjects : baselineTemplateProjects;

  // Scroll to top of window whenever the active view or selected project details changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentView, activeProject]);

  // Listen to load completion of projects to trigger custom layout matches
  useEffect(() => {
    if (allProjects.length > 0) {
      const pathname = window.location.pathname;
      let cleanPath = pathname;
      if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
      if (cleanPath.endsWith("/")) cleanPath = cleanPath.slice(0, -1);

      if (
        cleanPath !== "" && 
        cleanPath !== "admin" && 
        cleanPath !== "gallery" && 
        cleanPath !== "contact" && 
        cleanPath !== "budget" && 
        cleanPath !== "home"
      ) {
        const matched = allProjects.find(
          (p) => slugify(p.title) === cleanPath || p.id === cleanPath || (p.id && slugify(p.id) === cleanPath)
        );
        if (matched) {
          setActiveProject(matched);
        }
      }
    }
  }, [allProjects]);

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    const slug = slugify(project.title);
    try {
      if (window.location.pathname !== `/${slug}`) {
        window.history.pushState({ view: "project", id: project.id }, "", `/${slug}`);
      }
    } catch (e) {
      console.warn("pushState blocked by security restrictions:", e);
      window.location.hash = `#/${slug}`;
    }
  };

  // Selected Filter & Search settings
  const [galleryFilter, setGalleryFilter] = useState<"All" | "Web" | "App">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = allProjects.filter(p => {
    const matchesFilter = galleryFilter === "All" || p.category === galleryFilter;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technologies && p.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  // Transition helper navigation overrides
  const handleExploreTrigger = () => {
    navigateToRoute("gallery");
    setGalleryFilter("All");
    setActiveProject(null);
  };

  const handleContactTrigger = () => {
    navigateToRoute("contact");
    setActiveProject(null);
  };

  const activeThemeObj = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  return (
    <div id="app-root-container" className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-indigo-600/30 overflow-x-hidden">
      
      {/* Dynamic blurred backdrop image/graphic layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Transparent blurred background representation */}
        <img 
          src={activeThemeObj.image} 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.20] sm:opacity-[0.30] blur-[40px] sm:blur-[60px] scale-110 transition-all duration-1000 ease-out pointer-events-none"
          alt=""
          referrerPolicy="no-referrer"
        />
        
        {/* Floating Ambient Sun/Moon (For Light/Dark Theme) Or Big Atmospheric Fruit Emojis (For Fruits) */}
        <div className="absolute top-1/4 right-5 sm:right-[15%] opacity-[0.15] sm:opacity-[0.28] pointer-events-none select-none transition-all duration-1000 transform scale-110 rotate-12">
          {!activeThemeObj.isFruit ? (
            theme === "light" ? (
              <Sun className="w-80 h-80 text-orange-400 stroke-[1] animate-spin-slow" />
            ) : (
              <Moon className="w-80 h-80 text-indigo-400 stroke-[1] animate-pulse" />
            )
          ) : (
            // Big beautifully-designed floating fruit element! Since we want it blurred slightly ("ঝাপসা হয়ে"),
            // we can render a gorgeous jumbo size emoji inside a blurred layer!
            <div className="text-[19rem] leading-none select-none filter blur-[1.5px] animate-pulse">
              {activeThemeObj.emoji}
            </div>
          )}
        </div>
        
        {/* Complementary ambient corner light source glow */}
        <div className="absolute bottom-1/10 left-1/12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Complete Header Bar */}
      <Navbar 
        currentView={currentView} 
        setView={(v) => {
          navigateToRoute(v);
        }} 
        isAdmin={isAdminLoggedIn}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          navigateToRoute("home");
        }}
        theme={theme}
        onThemeChange={handleUserThemeChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Primary Routing Body */}
      <main className="flex-grow relative z-10">
        
        {/* Dynamic Project Detail Page overlay (Shown if clicking any card) */}
        {activeProject ? (
          <ProjectDetailView 
            project={activeProject} 
            onBack={() => {
              setActiveProject(null);
              navigateToRoute(currentView);
            }} 
          />
        ) : (
          <>
            {/* View: Homepage Layout */}
            {currentView === "home" && (
              <div id="home-view" className="space-y-16 animate-fade-in pb-16">
                <Hero 
                  onExploreProjects={handleExploreTrigger}
                  onContactMe={handleContactTrigger}
                />

                {/* Featured Products Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="text-center md:text-left space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-extrabold">Professional Showcase</span>
                    <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-100">Featured Builds</h2>
                    <p className="text-sm text-slate-400 max-w-xl font-sans">
                      A list of top hand-tailored web services and native apps compiled for production runtime.
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Cpu className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                      <p className="text-xs font-mono text-slate-400">Querying active cloud bucket...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allProjects.slice(0, 3).map((project) => (
                        <ProjectCard 
                          key={project.id || project.title} 
                          project={project} 
                          onSelection={handleSelectProject} 
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-center pt-4">
                    <button
                      onClick={handleExploreTrigger}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 font-semibold px-6 py-3 rounded-xl border border-slate-800 transition-all text-xs tracking-wide uppercase font-mono cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      Browse Full Projects Gallery ({allProjects.length})
                    </button>
                  </div>
                </div>

                {/* Quick Info Credentials banner */}
                <div className="bg-slate-900/40 border-y border-slate-800 py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
                    <div className="p-4 space-y-2">
                      <Code className="w-6 h-6 text-indigo-400 mx-auto sm:mx-0" />
                      <h4 className="text-base font-bold text-slate-200">Zero-Trust Security</h4>
                      <p className="text-xs text-slate-400 leading-normal font-sans">
                        Backend operations are locked down using bulletproof Attribute-Based Access Control security rules.
                      </p>
                    </div>
                    <div className="p-4 space-y-2">
                      <Sparkles className="w-6 h-6 text-amber-400 mx-auto sm:mx-0" />
                      <h4 className="text-base font-bold text-slate-200">Cloudinary Sync</h4>
                      <p className="text-xs text-slate-400 leading-normal font-sans">
                        Static assets, APK codes, mockups, and layout images stream directly from professional Unsigned presets.
                      </p>
                    </div>
                    <div className="p-4 space-y-2">
                      <MapPin className="w-6 h-6 text-emerald-400 mx-auto sm:mx-0" />
                      <h4 className="text-base font-bold text-slate-200">Engineering Quality</h4>
                      <p className="text-xs text-slate-400 leading-normal font-sans">
                        Coded modularly in TypeScript with direct real-time communication modules connecting to Firestore.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Matrix Panel */}
                <div id="skills-matrix-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <SkillsMatrix />
                </div>

                {/* RoadMap Career Milestones Timeline */}
                <div id="work-timeline-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <WorkTimeline />
                </div>

                {/* Dynamic Signature wall Guestbook */}
                <div id="guestbook-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
                  <Guestbook isAdmin={isAdminLoggedIn} />
                </div>
              </div>
            )}

            {/* View: Project Gallery View with dynamic category tab toggles */}
            {currentView === "gallery" && (
              <div id="gallery-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-100 tracking-tight">Project Hub</h2>
                  <p className="text-sm text-slate-400 max-w-xl mx-auto">
                    Browse and inspect live running links or download secure APK bundles directly. Use toggles below to narrow down your search.
                  </p>
                </div>

                {/* Search & Filters Toggle Header Bar */}
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
                  <div className="w-full sm:w-auto flex justify-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 flex-shrink-0">
                    {(["All", "Web", "App"] as const).map((filter) => (
                      <button
                        key={filter}
                        id={`filter-tab-${filter}`}
                        onClick={() => setGalleryFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wide cursor-pointer ${
                          galleryFilter === filter
                            ? "bg-indigo-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Search Input Bar */}
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Search className="w-4 h-4 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects by tech, title or tags (e.g. Next.js, Kotlin, Express)..."
                      className="w-full bg-slate-950/80 border border-slate-805 text-slate-100 pl-10 pr-10 py-2.5 rounded-xl outline-none focus:border-indigo-500 hover:border-slate-800 text-xs font-sans transition-all placeholder-slate-500 text-left"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid list display */}
                {isLoading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-455">Querying portfolio assets...</p>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                     {filteredProjects.map((project) => (
                      <ProjectCard 
                        key={project.id || project.title} 
                        project={project} 
                        onSelection={handleSelectProject} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/40 border border-slate-900 rounded-2xl max-w-lg mx-auto p-6 space-y-3">
                    <Search className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-sans text-slate-400">No projects matched your search criteria.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setGalleryFilter("All"); }} 
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-mono text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View: Interactive Feedback Form Portal */}
            {currentView === "contact" && (
              <div id="contact-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
                <ContactForm />
              </div>
            )}

            {/* View: Dedicated Services & Budget Estimator Section */}
            {currentView === "budget" && (
              <div id="budget-view" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 animate-fade-in space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">Interactive Budget Planner</h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
                    Get an instant cost assessment mapping to your system specifications. All rates are configured in real-time.
                  </p>
                </div>
                <div className="pt-6">
                  <ServicesPricing />
                </div>
              </div>
            )}

            {/* View: Firebase Audited Admin Control Panel */}
            {currentView === "admin" && (
              <div id="admin-view" className="py-2 animate-fade-in">
                <AdminPanel onAdminStateChange={(loggedIn) => setIsAdminLoggedIn(loggedIn)} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Complete Footer Section with Nazrul's Authentic Metadata */}
      <footer id="app-footer" className="bg-slate-950 border-t border-slate-900 py-10 text-xs sm:text-sm text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="space-y-1.5">
              <span className="font-sans font-bold text-slate-100 text-base block leading-none">Md. Nazrul Islam</span>
              <p className="text-xs text-slate-400 block font-sans">Full-stack Software & Android Developer</p>
              <p className="text-[10px] text-indigo-400 block leading-normal pt-1 break-all max-w-sm">
                Inquiries: <a href="mailto:dev.nazrul.bd@gmail.com" className="bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md text-indigo-350 hover:text-indigo-200 transition-all font-bold">dev.nazrul.bd@gmail.com</a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="text-[10px] text-slate-505 uppercase block">Direct Links:</span>
              <a 
                href="https://github.com/dev-nazrul-bd" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-indigo-405 transition-colors inline-flex items-center gap-1.5 font-sans font-medium text-slate-300 hover:underline"
              >
                <Github className="w-3.5 h-3.5 text-indigo-400" />
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/md-nazrul-islam-482722411" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-indigo-405 transition-colors inline-flex items-center gap-1.5 font-sans font-medium text-slate-300 hover:underline"
              >
                <Linkedin className="w-3.5 h-3.5 text-indigo-455" />
                LinkedIn
              </a>
              <a 
                href="https://www.facebook.com/4nazrul.islam" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-indigo-405 transition-colors inline-flex items-center gap-1.5 font-sans font-medium text-slate-300 hover:underline"
              >
                <Facebook className="w-3.5 h-3.5 text-indigo-400" />
                Facebook
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-900/40 text-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-slate-600">
            <p>© {new Date().getFullYear()} Md. Nazrul Islam. All rights reserved.</p>
            <p className="flex items-center justify-center gap-1 font-sans">
              Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> & synced to Cloud Firestore.
            </p>
          </div>
        </div>
      </footer>

      {/* Embedded Floating AI Advisor Expert Drawer */}
      <AIAssistant />

      {/* Modern PWA Install Controller Banner */}
      <PWAInstallPrompt />

    </div>
  );
}
