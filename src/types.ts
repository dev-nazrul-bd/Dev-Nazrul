export interface VersionLog {
  version: string;
  date: string;
  changes: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  category: "Web" | "App";
  techStack: string[];
  imageUrl: string;
  videoUrl?: string; // YouTube or Vimeo embed video URL
  liveLink?: string; // If Web
  apkLink?: string;  // If App
  guide?: string;    // Step-by-step user guide
  screenshots?: string[]; // Up to 5 presentation screenshots
  versionLogs?: VersionLog[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any; // Firestore Timestamp
  seen?: boolean;
}
