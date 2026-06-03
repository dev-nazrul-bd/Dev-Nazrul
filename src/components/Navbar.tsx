import { useState } from "react";
import { Menu, X, ShieldAlert, Laptop, Briefcase, Phone, ChevronRight, Github, Facebook, Linkedin, MessageCircle, Landmark, Paintbrush, ChevronDown, Search } from "lucide-react";
import StylishLogo from "./StylishLogo";
import { AVAILABLE_THEMES } from "../themes";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  isAdmin: boolean;
  onLogout?: () => void;
  theme: string;
  onThemeChange: (newTheme: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ currentView, setView, isAdmin, onLogout, theme, onThemeChange, searchQuery, setSearchQuery }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentThemeConfig = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  const navItems = [
    { id: "home", label: "Home", icon: Laptop },
    { id: "gallery", label: "Projects", icon: Briefcase },
    { id: "budget", label: "Budget", icon: Landmark },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => setView("home")}>
            <StylishLogo size="sm" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setIsOpen(false);
                  }}
                  id={`nav-item-${item.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            {/* Elegant Search Toggle (Desktop) Next to Menu Items */}
            <div className="relative flex items-center mx-1.5 z-50">
              <div className={`flex items-center gap-1.5 transition-all duration-300 overflow-hidden ${isSearchOpen ? "max-w-[200px] sm:max-w-[240px] opacity-100 mr-2" : "max-w-0 opacity-0 pointer-events-none"}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== "gallery") {
                      setView("gallery");
                    }
                  }}
                  id="navbar-search-input"
                  placeholder="Search projects by tech/title..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-3 pr-8 py-1.5 rounded-lg text-xs outline-none focus:border-indigo-500 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-slate-450 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    if (currentView !== "gallery") {
                      setView("gallery");
                    }
                    setTimeout(() => {
                      document.getElementById("navbar-search-input")?.focus();
                    }, 150);
                  }
                }}
                className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ${isSearchOpen ? "bg-slate-800 text-indigo-400 border border-indigo-505/20" : ""}`}
                title="Search projects"
                id="desktop-search-trigger"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Dropdown Selector (Desktop) */}
            <div className="relative mx-1.5 z-50">
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase bg-slate-800/60 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/25 text-slate-200 hover:text-slate-100 transition-all cursor-pointer"
                title="Change Site Theme"
                id="desktop-theme-dropdown-trigger"
              >
                <Paintbrush className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-base">{currentThemeConfig.emoji}</span>
                <span className="hidden sm:inline lowercase first-letter:uppercase">{currentThemeConfig.name}</span>
                <ChevronDown className={`w-3 h-3 text-slate-405 transition-transform ${showThemeDropdown ? "rotate-180" : ""}`} />
              </button>

              {showThemeDropdown && (
                <>
                  {/* Invisible click-away backdrop listener */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowThemeDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 max-h-72 overflow-y-auto scrollbar-thin text-left">
                    <div className="px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-850 mb-1">
                      site background
                    </div>
                    {AVAILABLE_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setShowThemeDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-all ${
                          theme === t.id 
                            ? "text-indigo-400 bg-slate-800/50" 
                            : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{t.emoji}</span>
                          <span className="capitalize">{t.name}</span>
                        </div>
                        {theme === t.id && (
                          <span className="text-[8px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase font-black">
                            active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-800 mx-3 hidden lg:block" />

            {/* Direct Social Links with premium micro-hovers */}
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <a
                href="https://github.com/dev-nazrul-bd"
                target="_blank"
                rel="noreferrer"
                id="header-social-github"
                className="w-8 h-8 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/md-nazrul-islam-482722411"
                target="_blank"
                rel="noreferrer"
                id="header-social-linkedin"
                className="w-8 h-8 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/4nazrul.islam"
                target="_blank"
                rel="noreferrer"
                id="header-social-facebook"
                className="w-8 h-8 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/30 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all"
                title="Facebook Connect"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8801793840762"
                target="_blank"
                rel="noreferrer"
                id="header-social-whatsapp"
                className="w-8 h-8 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                title="WhatsApp Direct Msg"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            {/* Admin toggle shown ONLY if visiting admin directly */}
            {currentView === "admin" && (
              <>
                <div className="h-6 w-px bg-slate-800 mx-3" />
                <button
                  onClick={() => setView("admin")}
                  id="nav-item-admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === "admin"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {isAdmin ? "Admin Panel" : "Login"}
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={onLogout}
                id="nav-item-logout"
                className="ml-2 text-xs text-rose-450 hover:text-rose-300 hover:underline px-2 py-1 transition-all"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile hamburger menu with expanding localized search */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Elegant Search Toggle (Mobile) */}
            <div className="relative flex items-center z-50">
              <div className={`flex items-center gap-1 transition-all duration-300 overflow-hidden ${isSearchOpen ? "max-w-[135px] opacity-100 mr-1" : "max-w-0 opacity-0 pointer-events-none"}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== "gallery") {
                      setView("gallery");
                    }
                  }}
                  id="mobile-navbar-search-input"
                  placeholder="Search..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-2 py-1 rounded-lg text-xs outline-none focus:border-indigo-505 font-sans"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    if (currentView !== "gallery") {
                      setView("gallery");
                    }
                    setTimeout(() => {
                      document.getElementById("mobile-navbar-search-input")?.focus();
                    }, 150);
                  }
                }}
                className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ${isSearchOpen ? "text-indigo-400" : ""}`}
                title="Search projects"
                id="mobile-search-trigger"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {isAdmin && (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                Admin
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div id="mobile-nav" className="md:hidden bg-slate-900 border-b border-slate-800 shadow-xl overflow-hidden px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                id={`mobile-nav-item-${item.id}`}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            );
          })}
          {currentView === "admin" && (
            <>
              <div className="h-px bg-slate-800 my-2" />
              <button
                onClick={() => {
                  setView("admin");
                  setIsOpen(false);
                }}
                id="mobile-nav-item-admin"
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  currentView === "admin"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  <span>{isAdmin ? "Admin Panel" : "Admin Login"}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </>
          )}

          {/* Mobile Theme Switcher Grid Segment */}
          <div className="border-t border-slate-800 pt-3 mt-3 text-left">
            <span className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-2 pl-2">
              Select Site Theme
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
              {AVAILABLE_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all text-center border ${
                    theme === t.id
                      ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/35"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent"
                  }`}
                  style={{ minHeight: "44.5px" }}
                >
                  <span className="text-lg leading-none">{t.emoji}</span>
                  <span className="text-[9px] font-mono capitalize truncate w-full mt-0.5">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (onLogout) onLogout();
                setIsOpen(false);
              }}
              id="mobile-nav-item-logout"
              className="w-full text-left px-4 py-3 rounded-xl text-base text-rose-400 hover:bg-rose-500/10 font-medium"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
