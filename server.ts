import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const PORT = 3000;

async function bootstrap() {
  const app = express();

  // Resolve the actual API key from process env (supports standard and user-defined variants)
  const getGeminiApiKey = () => {
    // 1. Check GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      return process.env.GEMINI_API_KEY.trim();
    }
    // 2. Check the custom key 'GE' shown in the user's screenshot
    if (process.env.GE && process.env.GE.trim()) {
      return process.env.GE.trim();
    }
    // 3. Auto-detect any environment variable starting with 'AIzaSy' (standard Google API Key signature)
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === "string") {
        const cleanVal = value.trim();
        if (cleanVal.startsWith("AIzaSy")) {
          console.log(`[LAZY CLIENT] Auto-detected Gemini Key in environment variable: ${key}`);
          return cleanVal;
        }
      }
    }
    // 4. Look for keys containing "GEMINI"
    for (const [key, value] of Object.entries(process.env)) {
      if (key.toUpperCase().includes("GEMINI") && typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
    return null;
  };

  // Lazy initialize Google GenAI client inside request handler to prevent startup crashes when key is missing/delayed
  const getAiClient = () => {
    const key = getGeminiApiKey();
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  app.use(express.json());

  // Secure API endpoint for Dev Nazrul AI Assistant proxying to Gemini
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages payload or structure." });
      }

      const client = getAiClient();
      if (!client) {
        return res.status(400).json({ 
          error: "আসা-যাওয়া ত্রুটি: Gemini API Key সেট করা নেই। দয়া করে Settings > Secrets থেকে 'GEMINI_API_KEY' নামে সঠিক কি (Key) যোগ করুন এবং 'Apply changes' এ ক্লিক করুন।" 
        });
      }

      const systemInstruction = 
        "You are Dev Nazrul AI Expert, a helpful and professional AI coding assistant designed for Nazrul Islam's official developer portfolio website. " +
        "Your objective is to provide elite advice, explain Nazrul's skills, talk about pricing, suggest custom software solutions, and assist visitors with any programming inquiries. " +
        "Be professional, inspiring, and direct. Explain Nazrul's expertise with absolute pride. " +
        "Key Facts about Nazrul:\n" +
        "- Role: Lead Full-Stack Developer & Android IoT/Agro Systems Architect.\n" +
        "- Key Stack: Next.js, React, Node.js + Express, Google Cloud Firestore, Zero-Zero Rules Auditing, and Kotlin Native Android SDK with Bluetooth Low Energy IoT telemetry.\n" +
        "- Projects range from customized web portals, online e-commerce solutions, IoT agro sensors pairing, and smart agricultural apps.\n" +
        "- WhatsApp number: +8801793840762 (Direct link: https://wa.me/8801793840762).\n" +
        "- GitHub handle: https://github.com/dev-nazrul-bd.\n" +
        "- Location: Bangladesh.\n" +
        "- Collaborative Pricing: Offers high-performance Web apps from ৳12,000 BDT, Android mobile apps from ৳16,050 BDT, and secure backends starting at ৳8,000 BDT. Visitors can try the visual cost calculator directly on this site.\n\n" +
        "Formatting Guidelines:\n" +
        "- Always respond in the same language the visitor uses (either Bengali or English).\n" +
        "- Keep explanations concise and beautifully structured using clean Markdown (such as tables, bullet lists, bold highlights) for extreme readability.\n" +
        "- Sound incredibly smart, expert, and client-friendly.";

      // Format chat history for @google/genai SDK
      // Convert role: 'assistant' to model constraints of gemini SDK: 'model'
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Generate output text using gemini-3.5-flash
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Assistant request failed:", error);
      res.status(500).json({ 
        error: "Our dynamic AI brain encountered an error (Gemini Assistant request failed). Please verify your Secrets in AI Studio have active status and are spelled correctly as GEMINI_API_KEY." 
      });
    }
  });

  // Dynamic slug helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Firestore REST fetching helper for SEO previews
  const getProjectsForMeta = async () => {
    try {
      const res = await fetch("https://firestore.googleapis.com/v1/projects/dev-nazrul/databases/(default)/documents/projects");
      if (!res.ok) throw new Error("Firestore REST request failed");
      const data: any = await res.json();
      if (!data.documents) return [];
      
      return data.documents.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          id: doc.name.split("/").pop(),
          title: fields.title?.stringValue || "",
          description: fields.description?.stringValue || "",
          imageUrl: fields.imageUrl?.stringValue || "",
        };
      });
    } catch (err) {
      console.warn("Could not load dynamic projects for OG meta tagging. Using fallback:", err);
      return [];
    }
  };

  // Setup Vite integration & custom dynamic metadata handler
  const distPath = path.join(process.cwd(), "dist");
  
  // Custom router to serve dynamically hydrated HTML for dynamic routes (both Dev & Prod)
  const handleHtmlServing = async (req: any, res: any, next: any) => {
    const urlPath = req.path;
    
    // Skip static assets or API routes
    if (urlPath.includes(".") || urlPath.startsWith("/api")) {
      return next();
    }
    
    let cleanPath = urlPath;
    if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
    if (cleanPath.endsWith("/")) cleanPath = cleanPath.slice(0, -1);
    
    const indexPath = process.env.NODE_ENV !== "production"
      ? path.join(process.cwd(), "index.html")
      : path.join(distPath, "index.html");
      
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("Index workspace template not found");
    }
    
    let html = fs.readFileSync(indexPath, "utf8");
    
    if (cleanPath !== "" && cleanPath !== "admin" && cleanPath !== "gallery" && cleanPath !== "contact" && cleanPath !== "home") {
      try {
        const projects = await getProjectsForMeta();
        const matched = projects.find(
          (p) => slugify(p.title) === cleanPath || p.id === cleanPath || (p.id && slugify(p.id) === cleanPath)
        );
        
        if (matched) {
          const titleEscaped = matched.title.replace(/"/g, "&quot;");
          const descEscaped = matched.description.replace(/"/g, "&quot;").substring(0, 150) + "...";
          const imageEscaped = matched.imageUrl.replace(/"/g, "&quot;");
          
          // Inject custom dynamic metadata tags
          html = html.replace(/<title>.*?<\/title>/, `<title>${titleEscaped} | Dev Nazrul</title>`);
          html = html.replace(/<meta name="title" content=".*?" \/>/g, `<meta name="title" content="${titleEscaped} | Dev Nazrul" />`);
          
          html = html.replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${titleEscaped}" />`);
          html = html.replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${descEscaped}" />`);
          html = html.replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${imageEscaped}" />`);
          
          html = html.replace(/<meta property="twitter:title" content=".*?" \/>/g, `<meta property="twitter:title" content="${titleEscaped}" />`);
          html = html.replace(/<meta property="twitter:description" content=".*?" \/>/g, `<meta property="twitter:description" content="${descEscaped}" />`);
          html = html.replace(/<meta property="twitter:image" content=".*?" \/>/g, `<meta property="twitter:image" content="${imageEscaped}" />`);
          
          // Support standard fallback meta matches as well if tags differ in spacing
          if (!html.includes(`content="${imageEscaped}"`)) {
            const injectBlock = `
              <title>${titleEscaped} | Dev Nazrul</title>
              <meta property="og:title" content="${titleEscaped}" />
              <meta property="og:description" content="${descEscaped}" />
              <meta property="og:image" content="${imageEscaped}" />
              <meta property="twitter:title" content="${titleEscaped}" />
              <meta property="twitter:description" content="${descEscaped}" />
              <meta property="twitter:image" content="${imageEscaped}" />
            `;
            html = html.replace("</head>", `${injectBlock}</head>`);
          }
        }
      } catch (err) {
        console.error("Meta tags generation error:", err);
      }
    }
    
    res.send(html);
  };

  if (process.env.NODE_ENV !== "production") {
    // We mount custom HTML middleware to custom match project routes
    app.use("/@vite/client", (req, res, next) => next());
    app.use("/node_modules", express.static(path.join(process.cwd(), "node_modules")));
    app.use("/src", express.static(path.join(process.cwd(), "src")));
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Serve HTML with custom dynamic meta tags FIRST if it's a dynamic slug
    app.get("*", async (req, res, next) => {
      const urlPath = req.path;
      if (
        urlPath === "/" || 
        urlPath === "/admin" || 
        urlPath === "/gallery" || 
        urlPath === "/contact" || 
        urlPath.includes(".") || 
        urlPath.startsWith("/api")
      ) {
        return next();
      }
      return handleHtmlServing(req, res, next);
    });

    app.use(vite.middlewares);
  } else {
    // Production routing
    app.use(express.static(distPath));
    app.get("*", handleHtmlServing);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ROUTER] Client-Server proxy active on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server bootstrap:", err);
});
