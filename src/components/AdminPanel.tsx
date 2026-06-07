import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  query,
  getDoc,
  setDoc
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { uploadToCloudinary } from "../cloudinary";
import { Project, Message, VersionLog } from "../types";
import { AVAILABLE_THEMES } from "../themes";
import { 
  Lock, Mail, Key, ShieldAlert, Plus, Layers, Inbox, Settings, Smartphone,
  Trash2, Edit, Loader2, UploadCloud, CheckCircle, RefreshCcw, LogOut, Check, ChevronDown, Percent, CreditCard, Paintbrush
} from "lucide-react";

const getSafeLocalStorage = (key: string, defaultValue: string): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn("Storage reading blocked in iframe sandbox settings:", e);
    return defaultValue;
  }
};

const setSafeLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage writing blocked in iframe sandbox settings:", e);
  }
};

interface AdminPanelProps {
  onAdminStateChange: (isAdminLoggedIn: boolean) => void;
}

export default function AdminPanel({ onAdminStateChange }: AdminPanelProps) {
  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Cloudinary Local Settings
  const [cloudName, setCloudName] = useState(() => getSafeLocalStorage("cloudinary_cloud_name", "ddtf1d2yk"));
  const [uploadPreset, setUploadPreset] = useState(() => getSafeLocalStorage("cloudinary_upload_preset", "portfolio_preset"));

  // Admin section views: "projects" | "add" | "messages" | "settings" | "pricing"
  const [activeTab, setActiveTab] = useState<"projects" | "add" | "messages" | "settings" | "pricing">("projects");

  // Form State for dynamic pricing configuration
  const [pricingForm, setPricingForm] = useState({
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
    discountHeading: "ঈদ স্পেশাল অফার! আগামী কয়েক দিনের জন্য সকল প্রজেক্টে আকর্ষণীয় মূল্যছাড়!",
  });

  // Data storage states
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSuccess, setDbSuccess] = useState("");
  const [dbError, setDbError] = useState("");
  const [adminDefaultTheme, setAdminDefaultTheme] = useState<string>("dark");
  const [adminInstallerLink, setAdminInstallerLink] = useState<string>("");
  const [adminAppIconUrl, setAdminAppIconUrl] = useState<string>("");

  // Project Editing structure state
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State for creating/editing projects
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    category: "Web" as "Web" | "App",
    techStack: "",
    imageUrl: "",
    videoUrl: "",
    liveLink: "",
    apkLink: "",
    guide: "",
    screenshot1: "",
    screenshot2: "",
    screenshot3: "",
    screenshot4: "",
    screenshot5: "",
  });

  // Version Logging state for a project
  const [activeLogProject, setActiveLogProject] = useState<Project | null>(null);
  const [versionForm, setVersionForm] = useState({
    version: "",
    date: new Date().toISOString().split("T")[0],
    changes: "",
  });

  // Client-side image upload tracker states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Client-side screenshot upload tracker states
  const [screenshotFiles, setScreenshotFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState<boolean[]>([false, false, false, false, false]);

  const handleScreenshotFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setScreenshotFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    const localUrl = URL.createObjectURL(file);
    const fieldName = `screenshot${index + 1}` as keyof typeof projectForm;
    setProjectForm((prev) => ({
      ...prev,
      [fieldName]: localUrl,
    }));
  };

  const handleClearScreenshot = (index: number) => {
    setScreenshotFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    const fieldName = `screenshot${index + 1}` as keyof typeof projectForm;
    setProjectForm((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      const adminVerified = currentUser !== null && !!currentUser.email;
      onAdminStateChange(adminVerified);
    });
    return () => unsubscribe();
  }, [onAdminStateChange]);

  // Load database entities when authorized
  useEffect(() => {
    if (user && user.email) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setDbLoading(true);
    setDbError("");
    try {
      // 1. Fetch Projects
      const projectsCollection = collection(db, "projects");
      const projQuery = query(projectsCollection, orderBy("createdAt", "desc"));
      const projSnap = await getDocs(projQuery);
      const projList: Project[] = [];
      projSnap.forEach((docSnap) => {
        projList.push({ id: docSnap.id, ...docSnap.data() } as Project);
      });
      setProjects(projList);

      // 2. Fetch Inbox messages
      const msgsCollection = collection(db, "messages");
      const msgQuery = query(msgsCollection, orderBy("createdAt", "desc"));
      const msgSnap = await getDocs(msgQuery);
      const msgList: Message[] = [];
      msgSnap.forEach((docSnap) => {
        msgList.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      setMessages(msgList);

      // 3. Fetch Pricing Configurations
      const pricingDocRef = doc(db, "settings", "pricing");
      const pricingSnap = await getDoc(pricingDocRef);
      if (pricingSnap.exists()) {
        const data = pricingSnap.data();
        setPricingForm({
          webBase: Number(data.webBase ?? 12000),
          webMultiplier: Number(data.webMultiplier ?? 2500),
          androidBase: Number(data.androidBase ?? 16050),
          androidMultiplier: Number(data.androidMultiplier ?? 3550),
          backendBase: Number(data.backendBase ?? 8000),
          backendMultiplier: Number(data.backendMultiplier ?? 2000),
          dbAddon: Number(data.dbAddon ?? 5000),
          adminAddon: Number(data.adminAddon ?? 7500),
          securityAddon: Number(data.securityAddon ?? 4000),
          discountPercentage: Number(data.discountPercentage ?? 20),
          discountActive: data.discountActive ?? true,
          discountHeading: data.discountHeading ?? "অফার! বিশেষ প্রোমোশনাল ডিসকাউন্ট উপলক্ষ্যে আকর্ষণীয় মূল্যছাড়!",
        });
      }

      // 4. Fetch Startup Default Theme Configuration
      const themeDocRef = doc(db, "settings", "theme");
      try {
        const themeSnap = await getDoc(themeDocRef);
        if (themeSnap.exists() && themeSnap.data().theme) {
          setAdminDefaultTheme(themeSnap.data().theme);
        }
      } catch (e) {
        console.warn("Theme settings retrieval blocked or unconfigured, fallback loaded.");
        const fallbackTheme = localStorage.getItem("admin-selected-default-theme") || "dark";
        setAdminDefaultTheme(fallbackTheme);
      }

      // 5. Fetch Custom App Installer Link & Icon settings
      const installerDocRef = doc(db, "settings", "installer");
      try {
        const installerSnap = await getDoc(installerDocRef);
        if (installerSnap.exists()) {
          const data = installerSnap.data();
          if (data.installerLink) {
            setAdminInstallerLink(data.installerLink);
          }
          if (data.appIconUrl) {
            setAdminAppIconUrl(data.appIconUrl);
          }
        }
      } catch (e) {
        console.warn("Installer link settings retrieval skipped or unconfigured.");
      }
    } catch (err: any) {
      console.error("Fetch Data Error:", err);
      // Reporting via strict standard FireStore handler
      try {
        handleFirestoreError(err, OperationType.LIST, "projects / messages");
      } catch (processed) {
        setDbError("Authorization restricted. Verify security rules or administrator permission.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setSuccessMsg("");

    if (!email || !password) {
      setAuthError("Email and details are required.");
      setAuthLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Logged in successfully as Admin!");
    } catch (err: any) {
      console.error("Auth Fail:", err);
      setAuthError(err?.message || "Invalid credentials or Firebase configuration error.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      onAdminStateChange(false);
      setUser(null);
    } catch (err) {
      console.error("Sign Out Error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Persists Cloudinary values directly to LocalStorage after live API verification
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbLoading(true);
    setDbError("");
    setDbSuccess("");

    try {
      // Create a tiny 1x1 transparent GIF file to test the upload
      const binaryString = window.atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const testBlob = new Blob([bytes], { type: "image/gif" });
      const testFile = new File([testBlob], "test_verify.gif", { type: "image/gif" });

      // Attempt test upload to Cloudinary API
      const responseUrl = await uploadToCloudinary(testFile, cloudName, uploadPreset);

      // Saves to LocalStorage only if upload succeeds
      setSafeLocalStorage("cloudinary_cloud_name", cloudName);
      setSafeLocalStorage("cloudinary_upload_preset", uploadPreset);

      setDbSuccess(`Cloudinary verification successful! Variables saved. (Test asset URL: ${responseUrl})`);
      setTimeout(() => setDbSuccess(""), 6000);
    } catch (err: any) {
      console.error("Cloudinary connection test failed", err);
      setDbError(`Verification failed: ${err.message || "Unknown error"}. Please check your Cloud Name and make sure the Upload Preset exists and is configured as 'Unsigned' in your Cloudinary Dashboard.`);
    } finally {
      setDbLoading(false);
    }
  };

  // Saves global startup default theme choice to Firestore settings document
  const handleSaveDefaultTheme = async (selectedTheme: string) => {
    setDbLoading(true);
    setDbError("");
    setDbSuccess("");
    try {
      const themeDocRef = doc(db, "settings", "theme");
      await setDoc(themeDocRef, {
        theme: selectedTheme,
        updatedAt: serverTimestamp()
      });
      setAdminDefaultTheme(selectedTheme);
      setDbSuccess(`Default Startup Theme set to "${selectedTheme}" successfully!`);
      setSafeLocalStorage("admin-selected-default-theme", selectedTheme);
      setTimeout(() => setDbSuccess(""), 4500);
    } catch (err: any) {
      console.warn("Database theme settings save failed. Writing locally to fallback cache.", err);
      setSafeLocalStorage("admin-selected-default-theme", selectedTheme);
      setAdminDefaultTheme(selectedTheme);
      setDbSuccess(`Theme saved locally in fallback cache successfully.`);
      setTimeout(() => setDbSuccess(""), 4500);
    } finally {
      setDbLoading(false);
    }
  };

  // Saves global custom app installer link configuration to FireStore
  const handleSaveInstallerLink = async () => {
    setDbLoading(true);
    setDbError("");
    setDbSuccess("");
    try {
      const installerDocRef = doc(db, "settings", "installer");
      await setDoc(installerDocRef, {
        installerLink: adminInstallerLink,
        appIconUrl: adminAppIconUrl,
        updatedAt: serverTimestamp(),
      });
      setDbSuccess("App installer and icon settings updated successfully!");
      setTimeout(() => setDbSuccess(""), 4000);
    } catch (err: any) {
      console.error("Installer settings write failed:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "settings/installer");
      } catch (processed) {
        setDbError("Authorization restricted. Failed to update application installer configuration.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Saves global calculation models and custom campaign discount configurations to FireStore settings doc
  const handlePricingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbLoading(true);
    setDbError("");
    setDbSuccess("");

    try {
      const pricingDocRef = doc(db, "settings", "pricing");
      await setDoc(pricingDocRef, {
        webBase: Number(pricingForm.webBase),
        webMultiplier: Number(pricingForm.webMultiplier),
        androidBase: Number(pricingForm.androidBase),
        androidMultiplier: Number(pricingForm.androidMultiplier),
        backendBase: Number(pricingForm.backendBase),
        backendMultiplier: Number(pricingForm.backendMultiplier),
        dbAddon: Number(pricingForm.dbAddon),
        adminAddon: Number(pricingForm.adminAddon),
        securityAddon: Number(pricingForm.securityAddon),
        discountPercentage: Number(pricingForm.discountPercentage),
        discountActive: pricingForm.discountActive,
        discountHeading: pricingForm.discountHeading,
      });
      setDbSuccess("Global calculation parameters and discount configurations updated successfully!");
      setTimeout(() => setDbSuccess(""), 5000);
    } catch (err: any) {
      console.error("Firestore Pricing Config Save Error:", err);
      setDbError(`Could not persist pricing models: ${err.message || "Unknown Firestore failure"}`);
    } finally {
      setDbLoading(false);
    }
  };

  // Local image attachment trigger
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImageFile(file);
    setDbError("");

    // Create a local blob object URL for instant, gorgeous image previews prior to upload
    const localPreviewUrl = URL.createObjectURL(file);
    setProjectForm((prev) => ({ ...prev, imageUrl: localPreviewUrl }));
    setDbSuccess("Image attached locally! It will upload to Cloudinary automatically on publish.");
    setTimeout(() => setDbSuccess(""), 4050);
  };

  // Form Field change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectForm({
      ...projectForm,
      [e.target.name]: e.target.value,
    });
  };

  // Save Project (Add New / Update Existing) with automatic Cloudinary upload built-in
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbLoading(true);
    setDbError("");
    setDbSuccess("");

    if (!projectForm.title || !projectForm.description) {
      setDbError("Title and description details are required.");
      setDbLoading(false);
      return;
    }

    let finalImageUrl = projectForm.imageUrl;

    // Check if an image is locally attached and needs background Cloudinary uploading
    if (imageFile) {
      setUploadingImage(true);
      try {
        const secureUrl = await uploadToCloudinary(imageFile, cloudName, uploadPreset);
        finalImageUrl = secureUrl;
      } catch (err: any) {
        console.error("Asset upload failure on commit", err);
        setDbError(`Cloudinary Upload Failed: ${err.message || "Please verify your credentials under settings."}`);
        setDbLoading(false);
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    if (!finalImageUrl) {
      setDbError("A showcase image or attachment is required to publish.");
      setDbLoading(false);
      return;
    }

    const techArray = projectForm.techStack
      ? projectForm.techStack.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const screenshotsArray: string[] = [];
    const screenshotInputs = [
      { file: screenshotFiles[0], url: projectForm.screenshot1 },
      { file: screenshotFiles[1], url: projectForm.screenshot2 },
      { file: screenshotFiles[2], url: projectForm.screenshot3 },
      { file: screenshotFiles[3], url: projectForm.screenshot4 },
      { file: screenshotFiles[4], url: projectForm.screenshot5 },
    ];

    for (let i = 0; i < screenshotInputs.length; i++) {
      const item = screenshotInputs[i];
      if (item.file) {
        setUploadingScreenshots(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        try {
          const secureUrl = await uploadToCloudinary(item.file, cloudName, uploadPreset);
          screenshotsArray.push(secureUrl);
        } catch (err: any) {
          console.error(`Screenshot ${i + 1} upload failure:`, err);
          setDbError(`Screenshot ${i + 1} Upload Failed: ${err.message || "Unknown error"}`);
          setDbLoading(false);
          setUploadingScreenshots([false, false, false, false, false]);
          return;
        } finally {
          setUploadingScreenshots(prev => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
        }
      } else if (item.url && !item.url.startsWith("blob:")) {
        screenshotsArray.push(item.url.trim());
      }
    }

    const projectPayload = {
      title: projectForm.title,
      description: projectForm.description,
      category: projectForm.category,
      techStack: techArray,
      imageUrl: finalImageUrl,
      videoUrl: projectForm.videoUrl || null,
      liveLink: projectForm.category === "Web" ? (projectForm.liveLink || null) : null,
      apkLink: projectForm.category === "App" ? (projectForm.apkLink || null) : null,
      guide: projectForm.guide || null,
      screenshots: screenshotsArray,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProject?.id) {
        // Edit update block
        const projDocRef = doc(db, "projects", editingProject.id);
        await updateDoc(projDocRef, projectPayload);
        setDbSuccess("Project changes committed securely.");
      } else {
        // Add new payload
        const newProjPayload = {
          ...projectPayload,
          versionLogs: [],
          createdAt: serverTimestamp(),
        };
        const projectsCollection = collection(db, "projects");
        await addDoc(projectsCollection, newProjPayload);
        setDbSuccess("New showcase project created successfully.");
      }

      // Reset forms and exit editing view
      setProjectForm({
        title: "",
        description: "",
        category: "Web",
        techStack: "",
        imageUrl: "",
        videoUrl: "",
        liveLink: "",
        apkLink: "",
        guide: "",
        screenshot1: "",
        screenshot2: "",
        screenshot3: "",
        screenshot4: "",
        screenshot5: "",
      });
      setEditingProject(null);
      setImageFile(null);
      setScreenshotFiles([null, null, null, null, null]);
      setActiveTab("projects");
      fetchData();
    } catch (err: any) {
      console.error("Save Data error:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, "projects");
      } catch (processed) {
        setDbError("Insecure operations or credentials. Database rules rejected.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Put project details into Editing form
  const handleEditInit = (project: Project) => {
    setEditingProject(project);
    setScreenshotFiles([null, null, null, null, null]);
    setProjectForm({
      title: project.title,
      description: project.description,
      category: project.category,
      techStack: project.techStack ? project.techStack.join(", ") : "",
      imageUrl: project.imageUrl,
      videoUrl: project.videoUrl || "",
      liveLink: project.liveLink || "",
      apkLink: project.apkLink || "",
      guide: project.guide || "",
      screenshot1: project.screenshots?.[0] || "",
      screenshot2: project.screenshots?.[1] || "",
      screenshot3: project.screenshots?.[2] || "",
      screenshot4: project.screenshots?.[3] || "",
      screenshot5: project.screenshots?.[4] || "",
    });
    setActiveTab("add");
  };

  // Delete Project from showcase
  const handleDeleteProj = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this showcase project?")) return;
    setDbLoading(true);
    setDbError("");
    try {
      await deleteDoc(doc(db, "projects", id));
      setDbSuccess("Project removed from showcase.");
      fetchData();
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      } catch (processed) {
        setDbError("Database rules rejected deletion.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Inbox message deleters
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inbox message?")) return;
    setDbLoading(true);
    setDbError("");
    try {
      await deleteDoc(doc(db, "messages", id));
      setDbSuccess("Message removed.");
      fetchData();
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
      } catch (processed) {
        setDbError("Access denied or messages read-only.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Mark message as seen/read
  const handleMarkAsSeen = async (id: string) => {
    setDbLoading(true);
    setDbError("");
    try {
      await updateDoc(doc(db, "messages", id), {
        seen: true
      });
      setDbSuccess("Message marked as read.");
      fetchData();
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `messages/${id}`);
      } catch (processed) {
        setDbError("Database rules rejected update.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Version Changelog additions
  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLogProject || !activeLogProject.id) return;
    if (!versionForm.version || !versionForm.changes) {
      alert("Please provide version number and change list details.");
      return;
    }

    setDbLoading(true);
    setDbError("");

    const newLogItem: VersionLog = {
      version: versionForm.version.trim(),
      date: versionForm.date,
      changes: versionForm.changes.split(",").map((c) => c.trim()).filter(Boolean),
    };

    const updatedLogs = activeLogProject.versionLogs 
      ? [newLogItem, ...activeLogProject.versionLogs]
      : [newLogItem];

    try {
      const projDocRef = doc(db, "projects", activeLogProject.id);
      await updateDoc(projDocRef, {
        versionLogs: updatedLogs,
        updatedAt: serverTimestamp(),
      });

      setDbSuccess(`Version v${newLogItem.version} log appended successfully.`);
      setVersionForm({ version: "", date: new Date().toISOString().split("T")[0], changes: "" });
      setActiveLogProject(null);
      fetchData();
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `projects/${activeLogProject.id}`);
      } catch (processed) {
        setDbError("Failed to update version log. Permission denied.");
      }
    } finally {
      setDbLoading(false);
    }
  };

  // Standard visual login UI wrapper if not logged in
  if (!user || !user.email) {
    return (
      <div id="admin-login-view" className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl">
        <div id="admin-login-header" className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-100">Admin Console</h2>
          <p className="text-slate-450 text-xs sm:text-sm font-mono tracking-wide">
            PORTFOLIO SECURED ROUTE
          </p>
        </div>

        {/* Warning Indicator */}
        <div className="mb-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl p-4 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            ADMIN PRIVILEGE ACCESS
          </div>
          <p className="text-slate-440 leading-normal">
            Please enter authorized administrator credentials. Only accounts manually registered in the Firebase project console will be granted access.
          </p>
         </div>

        {authError && (
          <div className="v-error border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded-xl p-3.5 mb-4 text-xs leading-normal font-mono">
            {authError}
          </div>
        )}

        {successMsg && (
          <div className="v-success border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl p-3.5 mb-4 text-xs font-mono">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono font-bold text-slate-455 tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-450" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono font-bold text-slate-455 tracking-wider mb-1">
              Secure Key (Password)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-450" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/30 font-mono tracking-widest text-xs uppercase disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Login to Panel"
            )}
          </button>
        </form>
      </div>
    );
  }

  // Authorised View Panel Layout
  return (
    <div id="authorized-admin-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-theme-text-primary font-sans">
      
      {/* Admin Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-wider uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            ADMIN ACCREDITED
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-text-primary">Control Panel</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">MD. NAZRUL ISLAM PORTFOLIO ENGINE</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            id="admin-refresh-btn"
            disabled={dbLoading}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:grid hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCcw className={`w-4 h-4 ${dbLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleSignOut}
            id="admin-logout-btn"
            className="flex items-center gap-2 bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 px-4 py-2.5 rounded-xl border border-slate-700/85 hover:border-rose-500/20 text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {dbError && (
        <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{dbError}</span>
        </div>
      )}

      {dbSuccess && (
        <div className="p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          <span>{dbSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs bar */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/60 p-2 border border-slate-800/80 rounded-2xl">
        <button
          onClick={() => {
            setActiveTab("projects");
            setEditingProject(null);
          }}
          className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "projects"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          Showcase Projects ({projects.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("add");
            setEditingProject(null);
            setProjectForm({
              title: "",
              description: "",
              category: "Web",
              techStack: "",
              imageUrl: "",
              videoUrl: "",
              liveLink: "",
              apkLink: "",
              guide: "",
            });
          }}
          className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "add" && !editingProject
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Showcase
        </button>

        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer relative ${
            activeTab === "messages"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <div className="relative">
            <Inbox className="w-4 h-4" />
            {messages.some((msg) => msg.seen === false) && (
              <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          Inquiries Inbox ({messages.length})
          {messages.some((msg) => msg.seen === false) && (
            <span className="ml-1 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
              NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          CDN Configurations
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-3.5 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Budget & Discounts Control
        </button>
      </div>

      {/* Tab: Project lists and Update versions */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <h3 className="font-sans font-bold text-lg text-slate-200">Current Showcase Portfolio</h3>
          
          {dbLoading && projects.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
              <p className="text-sm font-mono text-slate-400">Syncing documents from Firestore...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-16 text-center max-w-xl mx-auto space-y-4">
              <Layers className="w-12 h-12 text-slate-650 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-350">Showcase list is empty</p>
                <p className="text-xs text-slate-500 font-mono">You haven't showcased any app or web project yet.</p>
              </div>
              <button
                onClick={() => setActiveTab("add")}
                className="inline-flex items-center gap-2 text-xs uppercase font-mono font-bold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {proj.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        v{proj.versionLogs && proj.versionLogs[0] ? proj.versionLogs[0].version : "1.0.0"}
                      </span>
                    </div>

                    <h4 className="font-sans font-bold text-slate-100 text-base truncate mb-1">{proj.title}</h4>
                    <p className="font-sans text-xs text-slate-400 line-clamp-2 mb-4 leading-normal">{proj.description}</p>
                    
                    {/* Render tech array list */}
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack?.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">{t}</span>
                      ))}
                      {proj.techStack && proj.techStack.length > 3 && (
                        <span className="text-[10px] font-mono text-slate-500">+{proj.techStack.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800/60">
                    
                    {/* Trigger version updates logs */}
                    <div>
                      {activeLogProject?.id === proj.id ? (
                        <form onSubmit={handleVersionSubmit} className="bg-slate-950 rounded-lg p-3 border border-indigo-500/20 space-y-2 mt-2">
                          <p className="text-[10px] uppercase font-mono text-indigo-400 font-bold">New Version Log</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="1.0.2"
                              value={versionForm.version}
                              onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs outline-none text-white font-mono"
                            />
                            <input
                              type="date"
                              required
                              value={versionForm.date}
                              onChange={(e) => setVersionForm({ ...versionForm, date: e.target.value })}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs outline-none text-white font-mono"
                            />
                          </div>
                          <textarea
                            required
                            placeholder="Changes (comma separated, e.g. Fixed crash, Added Dark mode)"
                            value={versionForm.changes}
                            onChange={(e) => setVersionForm({ ...versionForm, changes: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs outline-none text-white resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-indigo-600 text-white font-bold font-mono text-[10px] px-2 py-1 rounded hover:bg-indigo-500"
                            >
                              Append Log
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveLogProject(null)}
                              className="bg-slate-850 text-slate-300 text-[10px] px-2 py-1 rounded font-mono hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveLogProject(proj);
                            setVersionForm({
                              version: "",
                              date: new Date().toISOString().split("T")[0],
                              changes: "",
                            });
                          }}
                          className="w-full py-1 text-center bg-slate-950 border border-slate-850 hover:border-indigo-500/25 rounded-lg text-indigo-400 hover:text-indigo-300 font-mono text-xs tracking-wide cursor-pointer transition-all"
                        >
                          + Append Version Log
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                      <button
                        onClick={() => handleEditEditInit(proj)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-800 text-indigo-400 hover:bg-indigo-500/10 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Modify
                      </button>
                      <button
                        onClick={() => handleDeleteProj(proj.id!)}
                        className="p-2 text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-650 rounded-xl transition-all border border-rose-500/20 cursor-pointer"
                        title="Delete showcase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper trigger editing initialization */}
      {editingProject && activeTab !== "add" && (() => {
        handleEditInit(editingProject);
        return null;
      })()}

      {/* Tab: Create or Edit Project Form */}
      {activeTab === "add" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h4 className="font-sans font-extrabold text-xl text-slate-100">
              {editingProject ? `Modify Project: ${editingProject.title}` : "Publish New Portfolio Project"}
            </h4>
            <p className="text-slate-450 text-xs font-mono mt-1">
              {editingProject ? "Re-saving edits updates Firestore fields directly" : "Fill out details to sync directly to Cloud Firestore collection"}
            </p>
          </div>

          <form onSubmit={projectFormSubmitWrapper} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Category</label>
                <select
                  name="category"
                  value={projectForm.category}
                  onChange={handleFormChange}
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="Web">Web (Hosted System Website)</option>
                  <option value="App">App (Native Mobile APK Package)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Health Sync Analytics Dashboard"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Tech Stack */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Tech Stack (Comma-Separated)</label>
                <input
                  type="text"
                  name="techStack"
                  value={projectForm.techStack}
                  onChange={handleFormChange}
                  placeholder="React, Next.js, Firebase Auth, Tailwind, TypeScript, Node.js"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Description Details</label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleFormChange}
                  placeholder="Describe details, challenges solved, architecture overview..."
                  required
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm resize-none whitespace-pre-wrap leading-relaxed"
                />
              </div>

              {/* CLOUDINARY FILE UPLOAD SEGMENT */}
              <div className="md:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                <span className="block text-xs uppercase font-mono tracking-wider font-bold text-indigo-400 mb-1">
                  Automatic Cloudinary Showcase Image Uploader
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* File trigger drag area */}
                  <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/30 rounded-xl p-6 text-center cursor-pointer block bg-slate-900/60 hover:bg-slate-900 transition-all">
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-300 block font-bold">Attach project showcase image</span>
                    <span className="text-[10px] text-indigo-400 block font-mono mt-1">Uploads automatically on posting</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  {/* Showcase or preview area with live local rendering */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Showcase Image Preview
                    </label>
                    
                    {projectForm.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-32 flex items-center justify-center">
                        <img 
                          src={projectForm.imageUrl} 
                          alt="Showcase preview" 
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-center p-2">
                          <span className="text-[10px] text-white font-mono uppercase bg-indigo-650 border border-indigo-500/20 px-2 py-1 rounded">
                            {imageFile ? "Pending Cloudinary Upload" : "Existing URL Active"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
                        No image selected yet
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading to Cloudinary CDN...
                      </div>
                    )}

                    {imageFile && !uploadingImage && (
                      <div className="text-[10px] text-indigo-300 font-mono flex items-center gap-1 bg-indigo-950/20 px-2 py-1.5 rounded border border-indigo-900/30">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Selected raw file: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-505 block mb-1 font-mono uppercase">Or paste manual image URL</span>
                      <input
                        type="url"
                        name="imageUrl"
                        value={projectForm.imageUrl}
                        onChange={handleFormChange}
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full bg-slate-900 border border-slate-850 py-2.5 px-3.5 text-xs font-mono outline-none rounded-xl text-slate-300 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Walkthrough Video URL (Youtube/Vimeo)</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={projectForm.videoUrl}
                  onChange={handleFormChange}
                  placeholder="e.g. https://www.youtube.com/watch?v=VIDEO_ID"
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>

              {/* Conditional Web Link / Apk Link inputs */}
              {projectForm.category === "Web" ? (
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Live Preview URL Website</label>
                  <input
                    type="url"
                    name="liveLink"
                    value={projectForm.liveLink}
                    onChange={handleFormChange}
                    placeholder="https://myportfolioproject.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">APK Download Link</label>
                  <input
                    type="url"
                    name="apkLink"
                    value={projectForm.apkLink}
                    onChange={handleFormChange}
                    placeholder="https://example-drive.com/my-apk-package.apk"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-mono"
                  />
                </div>
              )}

              {/* Step-by-step User Guide */}
              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 font-bold">Detailed User Guide</label>
                <textarea
                  name="guide"
                  value={projectForm.guide}
                  onChange={handleFormChange}
                  placeholder="Introduce step-by-step installation instructions, environment keys, CLI variables, or commands needed to run..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-theme-text-primary rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm resize-none whitespace-pre-wrap leading-relaxed"
                />
              </div>

              {/* Optional Project Screenshots Gallery (Direct File Upload & Preview Slots) */}
              <div className="md:col-span-2 border-t border-slate-800/60 pt-5 mt-3 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-theme-text-primary uppercase tracking-wider font-sans mb-1">
                    Manage Screenshots Gallery
                  </h4>
                  <p className="text-xs text-slate-450 font-sans leading-normal">
                    Enable rich visual walk-throughs by uploading up to 5 screenshot files directly. If left blank, the system will fall back to the main showcase image.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const idx = num - 1;
                    const fieldName = `screenshot${num}` as keyof typeof projectForm;
                    const currentVal = projectForm[fieldName] as string;
                    const selectedFile = screenshotFiles[idx];
                    const isUploading = uploadingScreenshots[idx];

                    return (
                      <div key={num} className={`p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 ${num === 5 ? "md:col-span-2" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400">
                            Screenshot Product Slot {num}
                          </span>
                          {currentVal && (
                            <button
                              type="button"
                              onClick={() => handleClearScreenshot(idx)}
                              className="text-[10px] text-rose-400 font-mono flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Clear Slot
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          {/* File upload prompt */}
                          <label className="border border-dashed border-slate-800 hover:border-indigo-500/30 rounded-xl p-4 text-center cursor-pointer block bg-slate-900/40 hover:bg-slate-900 transition-all">
                            <UploadCloud className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                            <span className="text-[11px] text-slate-300 block font-bold">Upload screenshot {num}</span>
                            <span className="text-[9px] text-indigo-400 block font-mono mt-0.5">Click to browse file</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotFileChange(idx, e)}
                              disabled={isUploading}
                              className="hidden"
                            />
                          </label>

                          {/* Preview container */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                              Status & Preview
                            </label>
                            {currentVal ? (
                              <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-16 flex items-center justify-center">
                                <img
                                  src={currentVal}
                                  alt={`Screenshot ${num} preview`}
                                  referrerPolicy="no-referrer"
                                  className="max-h-full max-w-full object-contain"
                                />
                                <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-center p-1">
                                  <span className="text-[8px] text-white font-mono uppercase bg-indigo-650 px-1.5 py-0.5 rounded">
                                    {selectedFile ? "Pending Publish Upload" : "Active Preview"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20 h-16 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                No asset selected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex sm:justify-end gap-3 pt-6 border-t border-slate-850">
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setActiveTab("projects");
                }}
                className="flex-1 sm:flex-initial bg-slate-800 px-6 py-3.5 rounded-xl hover:bg-slate-750 font-semibold text-xs tracking-wider uppercase font-mono text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={dbLoading}
                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all text-xs tracking-wider uppercase font-mono cursor-pointer disabled:opacity-50"
              >
                {dbLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : editingProject ? (
                  "Commit Document Edits"
                ) : (
                  "Publish Project Portfolio"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Inbox Messages List */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <h3 className="font-sans font-bold text-lg text-slate-200">Customer Communication Inbox</h3>
            <span className="text-xs bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono">
              Total Messages: {messages.length}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="border border-dashed border-slate-850 rounded-2xl py-16 text-center max-w-xl mx-auto space-y-4">
              <Inbox className="w-12 h-12 text-slate-650 mx-auto" />
              <p className="text-base font-bold text-slate-350">Inbox is empty</p>
              <p className="text-xs text-slate-500 font-mono">Feedback submitted via portfolio portal connects directly here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`border rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  msg.seen === false 
                    ? "bg-slate-900/90 border-rose-500/20 shadow-md shadow-rose-500/5 hover:border-rose-500/40" 
                    : "bg-slate-905 border-slate-850 hover:border-slate-700"
                }`}>
                  <div className="space-y-2 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs sm:text-sm">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        {msg.name}
                        {msg.seen === false && (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/15 shadow-md animate-pulse" title="Unseen message" />
                        )}
                      </span>
                      <span className="text-indigo-400">{msg.email}</span>
                      <span className="text-slate-500 text-xs">
                        Submitted: {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-4xl whitespace-pre-wrap font-medium">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    {msg.seen === false && (
                      <button
                        onClick={() => handleMarkAsSeen(msg.id!)}
                        className="px-3 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/25 hover:border-emerald-500/40 transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-mono font-bold"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMessage(msg.id!)}
                      className="p-2 rounded-lg text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500/30 transition-all cursor-pointer inline-flex items-center"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: CDN Configuration Settings manager */}
      {activeTab === "settings" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 animate-fade-in">
          <div className="border-b border-slate-850 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-sans font-extrabold text-xl text-slate-100">Cloudinary CDN Settings</h4>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Customize storage variables below for smooth background media streaming and layouts.
              </p>
            </div>
            <span className="inline-flex self-start sm:self-center items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-505/20 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-455 animate-pulse" /> SIMULATED TRACKER
            </span>
          </div>

          {/* Real-time CDN Storage Status visualizer Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/85 p-6 rounded-2xl border border-slate-800/60">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-slate-400">Total Available Space</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Visual circle tracker */}
                <svg className="absolute w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" stroke="#6366f1" strokeWidth="8" fill="transparent" strokeDasharray="301.6" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <span className="block font-sans font-extrabold text-sm text-slate-100">25.0 GB</span>
                  <span className="block text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-widest">Base Cap</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-slate-340">CDN Used Space</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Visual circle tracker (25.68% used) */}
                <svg className="absolute w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" stroke="#f43f5e" strokeWidth="8" fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - 0.2568)} strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <span className="block font-sans font-extrabold text-sm text-slate-100">6.42 GB</span>
                  <span className="block text-[8px] font-mono text-rose-500 font-bold uppercase tracking-widest">25.68% USED</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-slate-340">CDN Free Space</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Visual circle tracker (74.32% free) */}
                <svg className="absolute w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 * (1 - 0.7432)} strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <span className="block font-sans font-extrabold text-sm text-slate-100">18.58 GB</span>
                  <span className="block text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-widest">74.32% FREE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form Section */}
            <form onSubmit={handleSettingsSave} className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Cloud Name</span>
                  <span className="text-[10px] text-indigo-400 font-normal">e.g. ddtf1d2yk</span>
                </label>
                <input
                  type="text"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  required
                  placeholder="Enter Cloudinary API Cloud Name"
                  className="w-full bg-slate-950 border border-slate-800 text-indigo-300 rounded-xl py-3.5 px-4 outline-none focus:border-indigo-500 text-sm font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Unsigned Upload Preset</span>
                  <span className="text-[10px] text-indigo-400 font-normal">e.g. portfolio_preset</span>
                </label>
                <input
                  type="text"
                  value={uploadPreset}
                  onChange={(e) => setUploadPreset(e.target.value)}
                  required
                  placeholder="Enter Unsigned Preset Name"
                  className="w-full bg-slate-950 border border-slate-800 text-indigo-300 rounded-xl py-3.5 px-4 outline-none focus:border-indigo-500 text-sm font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={dbLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all text-xs tracking-wider uppercase font-mono cursor-pointer flex items-center justify-center gap-2"
              >
                {dbLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Verify & Save Variables</span>
                )}
              </button>
            </form>

            {/* Right Column Utilities: Theme Settings & Instructions */}
            <div className="space-y-6">
              {/* Global Default Theme Configuration Segment */}
              <div className="bg-slate-950/65 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-4 text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  <Paintbrush className="w-4 h-4 text-indigo-400" />
                  Default Theme Settings (ডিফল্ট থিম ম্যানেজার)
                </span>
                
                <p className="font-sans text-[11px] sm:text-xs text-slate-400 leading-normal">
                  ফার্স্ট-টাইম ভিজিটরদের সাইটে কোন থিমটি ডিফল্ট দেখাবে তা এখান থেকে সেট করুন। ইউজার নিজে উইন্ডো থেকে পরিবর্তন না করা পর্যন্ত এই থিমটিই দেখবে।
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {AVAILABLE_THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSaveDefaultTheme(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all text-[11px] font-medium cursor-pointer relative ${
                        adminDefaultTheme === t.id
                          ? "bg-indigo-600/10 text-indigo-300 border-indigo-500/40 font-bold shadow-md shadow-indigo-600/5"
                          : "bg-slate-900/50 text-slate-455 border-slate-850 hover:text-white hover:bg-slate-850"
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="capitalize truncate">{t.name}</span>
                      {adminDefaultTheme === t.id && (
                        <div className="absolute top-1 right-1 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* App Installer & Brand Logo settings in English */}
              <div className="bg-slate-950/65 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-4 text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  App Installer & Brand Configuration
                </span>
                
                <p className="font-sans text-[11px] sm:text-xs text-slate-400 leading-normal">
                  Configure the mobile client direct installation link and customize your brand icon asset (PNG or WEBP). Updating this dynamic icon URL will automatically change the live browser tab favicon too.
                </p>

                <div className="space-y-4 pt-1">
                  {/* PWA / APK Link */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">App Installer URL (APK / Play Store Link)</label>
                    <input
                      type="url"
                      value={adminInstallerLink}
                      onChange={(e) => setAdminInstallerLink(e.target.value)}
                      placeholder="https://example.com/dev-nazrul.apk"
                      className="w-full bg-slate-900 border border-slate-800 text-indigo-300 rounded-xl py-2.5 px-3.5 outline-none focus:border-indigo-500 text-xs font-mono"
                    />
                  </div>

                  {/* Icon URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">App Icon & Website Favicon URL</label>
                    <input
                      type="url"
                      value={adminAppIconUrl}
                      onChange={(e) => setAdminAppIconUrl(e.target.value)}
                      placeholder="https://example.com/assets/logo.png"
                      className="w-full bg-slate-900 border border-slate-800 text-indigo-300 rounded-xl py-2.5 px-3.5 outline-none focus:border-indigo-500 text-xs font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveInstallerLink}
                    disabled={dbLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all text-[11px] uppercase tracking-wider font-mono cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-650/10"
                  >
                    <span>Save Brand & Installer Client</span>
                  </button>
                </div>
              </div>

              {/* Instruction Segment */}
              <div className="bg-slate-950/65 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  কিভাবে configure করবেন? (Preset Setup Guide)
                </span>

                <div className="space-y-3.5 font-sans text-xs leading-relaxed text-slate-350">
                  <p className="font-bold text-slate-200 text-left">
                    Cloudinary তে Upload Preset না থাকলে ছবি আপলোড কাজ করবে না। নিচে দেওয়া স্টেপগুলো ফলো করে সম্পূর্ণ ফ্রীতে একটি Unsigned Preset তৈরি করে নিন:
                  </p>

                  <ol className="list-decimal pl-4.5 space-y-2.5 text-slate-400 text-[11px] font-mono whitespace-normal text-left">
                    <li>
                      <strong className="text-slate-100">Cloudinary Dashboard</strong> এ লগইন করুন এবং বাম পাশের নিচে থাকা <strong className="text-indigo-400">Settings Gear (icon)</strong> এ ক্লিক করুন।
                    </li>
                    <li>
                      বাম পাশের ট্যাব থেকে <strong className="text-slate-100">Upload</strong> সিলেক্ট করুন।
                    </li>
                    <li>
                      একটু নিচে স্ক্রল করে <strong className="text-slate-100">Upload presets</strong> সেকশন খুঁজুন এবং <strong className="text-indigo-400">"Add upload preset"</strong> বাটনে ক্লিক করুন।
                    </li>
                    <li>
                      নতুন পেজে <strong className="text-slate-100">Signing Mode</strong> ড্রপডাউনটি <strong className="text-rose-400 border border-rose-500/20 px-1 py-0.5 rounded bg-rose-500/5 font-sans font-bold">Unsigned</strong> এ পরিবর্তন করুন (এটা সবচেয়ে গুরুত্বপূর্ণ step!)।
                    </li>
                    <li>
                      সেখানে তৈরি হওয়া <strong className="text-slate-100">Upload preset name</strong>-টি কপি করে নিন (যেমন: <code className="text-indigo-300">portfolio_preset</code>)।
                    </li>
                    <li>
                      সবশেষে একদম উপরে ডান কোণায় থাকা <strong className="text-slate-100">"Save" (হলুদ বাটন)</strong> এ ক্লিক করুন।
                    </li>
                    <li>
                      এখন আপনার Cloud Name এবং কপি করা Upload Preset Name-টি এখানে দিয়ে <strong className="text-indigo-400">Verify & Save Variables</strong> বাটনে চাপুন।
                    </li>
                  </ol>

                  <div className="border-t border-slate-850 pt-3 text-[10.5px] text-slate-500 font-mono leading-normal text-left">
                    <span className="text-indigo-400 block font-bold mb-1">PRO-TIP:</span>
                    আমাদের এই Verify বাটনটি আপনার দেওয়া Credentials লাইভ চেক করার জন্য একটি 1x1 Transparent GIF ফাইল আপলোড টেস্ট করে নিশ্চিত করবে। টেস্ট সফল হলে তবেই API variables সেভ হবে!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 animate-fade-in">
          <div className="border-b border-slate-850 pb-4 flex items-center justify-between">
            <div>
              <h4 className="font-sans font-extrabold text-xl text-slate-100">Live Calculation & Budget Control</h4>
              <p className="text-slate-400 text-xs font-mono mt-1">
                Dynamically adjust baseline system build costs, multi-page layout rates, custom feature multipliers, and live user discount percentages.
              </p>
            </div>
            <Percent className="w-8 h-8 text-indigo-550 hidden sm:block" />
          </div>

          <form onSubmit={handlePricingSave} className="space-y-8">
            
            {/* Promotional Banner Configurations */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <span className="block text-xs uppercase font-mono tracking-wider font-bold text-indigo-400">Campaign Discount Banner Announcement</span>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="discountActive"
                  checked={pricingForm.discountActive}
                  onChange={(e) => setPricingForm({ ...pricingForm, discountActive: e.target.checked })}
                  className="w-4.5 h-4.5 accent-indigo-600 rounded bg-slate-950 border border-slate-805 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="discountActive" className="text-sm font-sans font-medium text-slate-200 cursor-pointer select-none">
                  Enable Promotional Campaign Discount on Estimate Page
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 mb-1">
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.discountPercentage}
                    onChange={(e) => setPricingForm({ ...pricingForm, discountPercentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-amber-400 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-sm font-mono font-bold transition-all"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 mb-1">
                    Announcement Banner Text (Bengali or English)
                  </label>
                  <input
                    type="text"
                    value={pricingForm.discountHeading}
                    onChange={(e) => setPricingForm({ ...pricingForm, discountHeading: e.target.value })}
                    required
                    placeholder="যেমনঃ স্পেশাল অফার! সকল প্রজেক্টে আকর্ষণীয় মূল্যছাড়!"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-550 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Core Services Pricing Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div className="space-y-4">
                <h5 className="font-sans font-bold text-sm text-slate-300 border-b border-slate-850 pb-2">Web Application Configurations</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Base Cost (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.webBase}
                      onChange={(e) => setPricingForm({ ...pricingForm, webBase: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Per-Page Extra (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.webMultiplier}
                      onChange={(e) => setPricingForm({ ...pricingForm, webMultiplier: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-sans font-bold text-sm text-slate-300 border-b border-slate-850 pb-2">Android Application Configurations</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1">Base Cost (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.androidBase}
                      onChange={(e) => setPricingForm({ ...pricingForm, androidBase: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1">Per-Page Extra (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.androidMultiplier}
                      onChange={(e) => setPricingForm({ ...pricingForm, androidMultiplier: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-sans font-bold text-sm text-slate-300 border-b border-slate-850 pb-2">Full-Stack Backend Services</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1">Base Cost (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.backendBase}
                      onChange={(e) => setPricingForm({ ...pricingForm, backendBase: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1">Per-Page Extra (BDT)</label>
                    <input
                      type="number"
                      value={pricingForm.backendMultiplier}
                      onChange={(e) => setPricingForm({ ...pricingForm, backendMultiplier: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-sans font-bold text-sm text-slate-300 border-b border-slate-850 pb-2">Technical Feature Addons (BDT)</h5>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1 font-bold">Database</label>
                    <input
                      type="number"
                      value={pricingForm.dbAddon}
                      onChange={(e) => setPricingForm({ ...pricingForm, dbAddon: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-2 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1 font-bold">Admin Panel</label>
                    <input
                      type="number"
                      value={pricingForm.adminAddon}
                      onChange={(e) => setPricingForm({ ...pricingForm, adminAddon: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-2 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-550 mb-1 font-bold">Security SSL</label>
                    <input
                      type="number"
                      value={pricingForm.securityAddon}
                      onChange={(e) => setPricingForm({ ...pricingForm, securityAddon: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl py-3 px-2 outline-none focus:border-indigo-500 text-xs font-mono transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={dbLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/10 transition-all text-xs tracking-wider uppercase font-mono cursor-pointer flex items-center justify-center gap-2"
            >
              {dbLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving to Live Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Pricing Policies</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );

  // Small helpers inside UI bounds to resolve conditional triggers
  function handleEditEditInit(project: Project) {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      category: project.category,
      techStack: project.techStack ? project.techStack.join(", ") : "",
      imageUrl: project.imageUrl,
      videoUrl: project.videoUrl || "",
      liveLink: project.liveLink || "",
      apkLink: project.apkLink || "",
      guide: project.guide || "",
    });
    setActiveTab("add");
  }

  function projectFormSubmitWrapper(e: React.FormEvent) {
    handleProjectSubmit(e);
  }
}
