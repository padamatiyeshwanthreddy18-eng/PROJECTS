import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createHttpServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount multi-step Auth & Database Router
app.use("/api", authRoutes);

// Lazy-loaded Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set. SkillGenome AI will run in simulator mode with high-quality fallback presets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// 1. API: Analyze Developer DNA
app.post("/api/analyze-dna", async (req, res) => {
  const { name, level, techStack, rawInput, targetRole, codingHours } = req.body;
  const client = getGeminiClient();

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
        Analyze the following developer profile and generate a comprehensive Developer DNA Profile.
        
        Developer Info:
        - Name: ${name || "Anonymous Developer"}
        - Current Level: ${level || "CS Student / Entry"}
        - Core Tech Stack: ${Array.isArray(techStack) ? techStack.join(", ") : "JavaScript, React"}
        - Career Target: ${targetRole || "Full Stack Engineer"}
        - Self-described experience/details: ${rawInput || "Passionate coder working on personal portfolio websites."}
        - Reported Weekly Coding Hours: ${codingHours || 15}

        Return a highly customized and detailed JSON response matching this EXACT schema:
        {
          "developerDNA": {
            "score": number, (overall engineering score out of 100)
            "dnaSequence": "string", (a stylized DNA string e.g. "ACTG-TTA-GGC-[your letters]")
            "hiringProbability": {
              "faang": number, (percentage probability out of 100)
              "unicorns": number,
              "startups": number
            },
            "salaryHelix": {
              "currency": "USD",
              "predictedMin": number, (realistic and futuristic predictions)
              "predictedMax": number,
              "timeToMaxMonths": number
            },
            "industryFitScore": number,
            "aiReadinessScore": number,
            "scores": {
              "frontend": number,
              "backend": number,
              "aiMl": number,
              "dsa": number,
              "systemDesign": number,
              "devOps": number
            },
            "strengths": ["string", "string", "string"], (at least 3 strengths)
            "weaknesses": [
              { "topic": "string", "description": "string", "impact": "High" | "Medium" | "Low" }
            ],
            "roleFitAnalysis": "string" (2-sentence direct advice based on their targetRole)
          }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              developerDNA: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  dnaSequence: { type: Type.STRING },
                  hiringProbability: {
                    type: Type.OBJECT,
                    properties: {
                      faang: { type: Type.NUMBER },
                      unicorns: { type: Type.NUMBER },
                      startups: { type: Type.NUMBER }
                    },
                    required: ["faang", "unicorns", "startups"]
                  },
                  salaryHelix: {
                    type: Type.OBJECT,
                    properties: {
                      currency: { type: Type.STRING },
                      predictedMin: { type: Type.NUMBER },
                      predictedMax: { type: Type.NUMBER },
                      timeToMaxMonths: { type: Type.NUMBER }
                    },
                    required: ["currency", "predictedMin", "predictedMax", "timeToMaxMonths"]
                  },
                  industryFitScore: { type: Type.NUMBER },
                  aiReadinessScore: { type: Type.NUMBER },
                  scores: {
                    type: Type.OBJECT,
                    properties: {
                      frontend: { type: Type.NUMBER },
                      backend: { type: Type.NUMBER },
                      aiMl: { type: Type.NUMBER },
                      dsa: { type: Type.NUMBER },
                      systemDesign: { type: Type.NUMBER },
                      devOps: { type: Type.NUMBER }
                    },
                    required: ["frontend", "backend", "aiMl", "dsa", "systemDesign", "devOps"]
                  },
                  strengths: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  weaknesses: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topic: { type: Type.STRING },
                        description: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["topic", "description", "impact"]
                    }
                  },
                  roleFitAnalysis: { type: Type.STRING }
                },
                required: ["score", "dnaSequence", "hiringProbability", "salaryHelix", "industryFitScore", "aiReadinessScore", "scores", "strengths", "weaknesses", "roleFitAnalysis"]
              }
            },
            required: ["developerDNA"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (e: any) {
      console.error("Gemini DNA formulation failed, using simulator backup:", e);
    }
  }

  // Simulator Fallback
  res.json({
    developerDNA: {
      score: 72 + Math.floor(Math.random() * 15),
      dnaSequence: `ATGC-STK-${Array.isArray(techStack) && techStack.length > 0 ? techStack[0].substring(0, 3).toUpperCase() : "JS"}-${level === "Senior" ? "PRO" : "MID"}-99X`,
      hiringProbability: {
        faang: level === "Senior" ? 78 : 45 + Math.floor(Math.random() * 20),
        unicorns: 55 + Math.floor(Math.random() * 25),
        startups: 75 + Math.floor(Math.random() * 20)
      },
      salaryHelix: {
        currency: "USD",
        predictedMin: level === "Senior" ? 140000 : 70000 + Math.floor(Math.random() * 15000),
        predictedMax: level === "Senior" ? 220000 : 125000 + Math.floor(Math.random() * 30000),
        timeToMaxMonths: level === "Senior" ? 12 : 24
      },
      industryFitScore: 68 + Math.floor(Math.random() * 22),
      aiReadinessScore: 50 + Math.floor(Math.random() * 40),
      scores: {
        frontend: techStack?.includes("React") || techStack?.includes("Tailwind") ? 85 : 55 + Math.floor(Math.random() * 20),
        backend: techStack?.includes("Node.js") || techStack?.includes("Python") ? 80 : 50 + Math.floor(Math.random() * 25),
        aiMl: techStack?.includes("Python") || techStack?.includes("Gemini") ? 85 : 40 + Math.floor(Math.random() * 30),
        dsa: 60 + Math.floor(Math.random() * 30),
        systemDesign: level === "Senior" ? 85 : 45 + Math.floor(Math.random() * 30),
        devOps: 50 + Math.floor(Math.random() * 35)
      },
      strengths: [
        `Strong motivation in acquiring ${Array.isArray(techStack) && techStack[0] ? techStack[0] : "modern development frameworks"}.`,
        "Solid foundations in computer science structures and basic database workflows.",
        "Demonstrated consistent workspace curiosity with high career target potential."
      ],
      weaknesses: [
        { topic: "Systems Cloud Ingress", description: `Lack of practical DevOps and automated CI/CD pipeline deployments optimized for ${targetRole || "modern apps"}.`, impact: "Medium" },
        { topic: "Advanced DSA Optimization", description: "Complex memory-bound backtracking paradigms can be executed with improved optimal spatial complexity.", impact: "High" }
      ],
      roleFitAnalysis: `You show a highly visual affinity to the standard criteria of ${targetRole || "Software Engineer"}. Accelerating focused system architecture exposure will catapult your profile immediately.`
    }
  });
});

// 2. API: Generate Smart Roadmap
app.post("/api/generate-roadmap", async (req, res) => {
  const { techStack, goal, months } = req.body;
  const client = getGeminiClient();

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
        Draft a personalized developer career evolution learning roadmap.
        Inputs:
        - Technologies: ${Array.isArray(techStack) ? techStack.join(", ") : "JavaScript"}
        - Ultimate Goal: ${goal || "Get a high-paying software job"}
        - Target Timeline: ${months || 3} months

        Return a stunning, highly precise developmental plan in JSON:
        {
          "roadmap": {
            "title": "string",
            "estimatedCompletion": "string",
            "phases": [
              {
                "phaseNumber": number,
                "title": "string",
                "weeks": "string",
                "topics": ["string", "string"],
                "projectDeliverable": {
                  "name": "string",
                  "description": "string",
                  "tech": "string"
                }
              }
            ]
          }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roadmap: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estimatedCompletion: { type: Type.STRING },
                  phases: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phaseNumber: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        weeks: { type: Type.STRING },
                        topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        projectDeliverable: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tech: { type: Type.STRING }
                          },
                          required: ["name", "description", "tech"]
                        }
                      },
                      required: ["phaseNumber", "title", "weeks", "topics", "projectDeliverable"]
                    }
                  }
                },
                required: ["title", "estimatedCompletion", "phases"]
              }
            },
            required: ["roadmap"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (e: any) {
      console.error("Roadmap generation failed, returning simulated response:", e);
    }
  }

  // Backup Simulated Roadmap
  res.json({
    roadmap: {
      title: `Ultimate ${goal || "Developer Journey"} Evolution Track`,
      estimatedCompletion: `${months || 3} Months Dynamic Path`,
      phases: [
        {
          phaseNumber: 1,
          title: "Architecture & Framework Foundations",
          weeks: "Weeks 1 - 4",
          topics: ["Core advanced features", "State synchronization models", "API integration & design"],
          projectDeliverable: {
            name: "Holographic Asset Hub",
            description: "High performance rendering engine incorporating atomic state and reactive elements.",
            tech: "TypeScript, React, Vite"
          }
        },
        {
          phaseNumber: 2,
          title: "Scalability, Core Performance & Analytics",
          weeks: "Weeks 5 - 8",
          topics: ["Performance optimization tools", "Memory benchmarking", "Multi-thread simulations"],
          projectDeliverable: {
            name: "Genome Telemetry Server",
            description: "Real-time metrics hub analyzing pipeline efficiency and high latency points.",
            tech: "Express, WebSocket, Recharts"
          }
        },
        {
          phaseNumber: 3,
          title: "AI Integration, Cloud Operations & Sandbox",
          weeks: "Weeks 9 - 12",
          topics: ["Large language modeling agents", "Container deployment pipelines", "Production resilience patterns"],
          projectDeliverable: {
            name: "SkillGenome Enterprise Platform",
            description: "Fully redundant cloud application hosting secure microservice clusters.",
            tech: "Docker, Cloud Run, Gemini CLI"
          }
        }
      ]
    }
  });
});

// 3. API: AI Coding Mentor & Chat
app.post("/api/chat-mentor", async (req, res) => {
  const { messages, userProfile } = req.body; // messages: { role: 'user'|'model', content: string }[]
  const client = getGeminiClient();

  if (process.env.GEMINI_API_KEY && messages && messages.length > 0) {
    try {
      const lastMessage = messages[messages.length - 1].content;
      
      const systemPrompt = `You are "SkillGenome AI Coding Mentor" - a highly diagnostic technical mentor with a cyberpunk developer personality.
        The user has this profile: ${JSON.stringify(userProfile || {})}.
        Respond code-sensitively and include brief, high-contrast, production-ready code examples where fitting.
        Always guide them visually and keep responses highly structured, practical, and under 300 words.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: lastMessage,
        config: {
          systemInstruction: systemPrompt
        }
      });

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    } catch (e: any) {
      console.error("Mentor chat failed:", e);
    }
  }

  // Fallback simulator Response
  const defaultReplies = [
    "That is an interesting technical approach! To avoid state desynchronization in large React nodes, you should ensure state transitions happen atomically or utilize structured state reducers. Let's write a optimal state hooks container to test.",
    "Excellent diagnostic thinking. When styling glassmorphic cards in Tailwind CSS, ensure you apply a combination of `backdrop-blur-md bg-white/5 border border-white/10 shadow-lg shadow-cyan-500/5` to catch the lights symmetrically.",
    "Understood. When writing competitive programming solutions in JavaScript/TypeScript, keep array creations stabilized outside primary loops. Spurious array allocations triggers rapid garbage collection which degrades execution speeds."
  ];
  return res.json({ reply: defaultReplies[Math.floor(Math.random() * defaultReplies.length)] });
});

// 4. API: Analyze Resume
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, targetRole } = req.body;
  const client = getGeminiClient();

  if (process.env.GEMINI_API_KEY && resumeText) {
    try {
      const prompt = `
        Act as an elite ATS system and technical headhunter scanner.
        Evaluate the following resume text against the target role: "${targetRole || "Software Engineer"}".

        Resume text:
        ${resumeText}

        Generate a detailed JSON analysis with this EXACT structure:
        {
          "resumeAnalysis": {
            "atsScore": number, (out of 100)
            "verdict": "string", (Short verdict, e.g. "Highly Competitive" or "Needs Core Enhancements")
            "improvements": ["string", "string"], (At least 2 concrete visual or structural improvements)
            "missingKeywords": ["string", "string"], (At least 4 technical target keywords missing)
            "optimizedBullets": [
              {
                "original": "string",
                "starOptimized": "string" (Using STAR method: Situation, Task, Action, Result)
              }
            ]
          }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumeAnalysis: {
                type: Type.OBJECT,
                properties: {
                  atsScore: { type: Type.NUMBER },
                  verdict: { type: Type.STRING },
                  improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  optimizedBullets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: { type: Type.STRING },
                        starOptimized: { type: Type.STRING }
                      },
                      required: ["original", "starOptimized"]
                    }
                  }
                },
                required: ["atsScore", "verdict", "improvements", "missingKeywords", "optimizedBullets"]
              }
            },
            required: ["resumeAnalysis"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (e: any) {
      console.error("Resume analysis failed, using backup:", e);
    }
  }

  // Backup Simulated Resume Analysis
  res.json({
    resumeAnalysis: {
      atsScore: 65 + Math.floor(Math.random() * 15),
      verdict: "Moderate Industry Alignment - Structural Upgrades Necessary",
      improvements: [
        "Include quantitative impact statements (e.g., benchmarked latency reductions, scaled metrics).",
        "Introduce missing core DevOps paradigms like CI/CD, Container pipelines, or Cloud deployment."
      ],
      missingKeywords: ["CI/CD Pipeline", "Kubernetes", "Redis Event Streaming", "Cloud Run Container Orchestration"],
      optimizedBullets: [
        {
          original: "Worked on frontend and created interactive forms and charts.",
          starOptimized: "Engineered scalable telemetry dashboards by deploying atomic states and Recharts, resulting in a 34% reduction in frontend frame drops."
        },
        {
          original: "Fixed backend bugs and handled API requests in Node.",
          starOptimized: "Re-architected legacy API proxy routes in Express server, reducing database connection bottle-necks and improving endpoint throughput by 1.8x."
        }
      ]
    }
  });
});

// 5. API: Mock Interview Session
app.post("/api/interview-session", async (req, res) => {
  const { mode, questionId, chatHistory, currentAnswer, targetRole } = req.body;
  const client = getGeminiClient();

  // Mode can be: "start" or "answer"
  if (process.env.GEMINI_API_KEY) {
    try {
      if (mode === "start") {
        const prompt = `
          Create an elite coding, system design, or cultural mock interview question that targets: "${targetRole || "Software Engineer"}".
          Make it feel like a standard interactive high-tech FAANG/Startup whiteboard selection.
          
          Return a strict JSON result:
          {
            "question": {
              "id": "string",
              "title": "string",
              "type": "System Design" | "Coding" | "Behavioral",
              "scenario": "string",
              "hints": ["string", "string"]
            }
          }
        `;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: { type: Type.STRING },
                    scenario: { type: Type.STRING },
                    hints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "title", "type", "scenario", "hints"]
                }
              },
              required: ["question"]
            }
          }
        });

        if (response && response.text) {
          return res.json(JSON.parse(response.text));
        }
      } else {
        const prompt = `
          Evaluate the user's mock interview response for the target: "${targetRole || "Software Engineer"}".
          The question scenario: "${chatHistory?.find((h: any) => h.role === 'question')?.content || "Initial coding question"}"
          The user's answer: "${currentAnswer}"

          Evaluate technically and behaviorally.
          Return a detailed JSON evaluation:
          {
            "evaluation": {
              "score": number, (rating from 0 to 100)
              "confidenceAnalysis": "string", (e.g., "High technical assurance but lacked quantitative trade-off discussions")
              "feedback": "string", (detailed, actionable guidance)
              "revisedCodeExample": "string" (If relevant, code snippet improving their answer or structure)
            }
          }
        `;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                evaluation: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    confidenceAnalysis: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                    revisedCodeExample: { type: Type.STRING }
                  },
                  required: ["score", "confidenceAnalysis", "feedback", "revisedCodeExample"]
                }
              },
              required: ["evaluation"]
            }
          }
        });

        if (response && response.text) {
          return res.json(JSON.parse(response.text));
        }
      }
    } catch (e: any) {
      console.error("Interview session failed, simulating response:", e);
    }
  }

  // Backup Simulated Mock Interview
  if (mode === "start") {
    res.json({
      question: {
        id: "sys-092",
        title: "Optimizing High-Throughput URL Analytics Pipeline",
        type: "System Design",
        scenario: "You have a streaming pipeline handling 50,000 requests per second. The client wishes to find real-time active users and aggregate metrics over a 15-minute tumbling window. Describe your service tier, storage caches, and streaming mechanism.",
        hints: [
          "Think about Redis sorted sets or HyperLogLog for real-time unique active counts.",
          "How would message brokers like Kafka handle the ingestion spike without lagging?"
        ]
      }
    });
  } else {
    res.json({
      evaluation: {
        score: 74 + Math.floor(Math.random() * 15),
        confidenceAnalysis: "Demonstrates standard architectural overview but lacks memory overhead calculations.",
        feedback: "Your suggestion of incorporating a Redis caching block is perfect. However, you should supplement this with a partition/sharding key strategy on Kafka. In a production environment, lacking explicit sharding leads to asymmetric node workloads.",
        revisedCodeExample: `// Example optimized pipeline key router using generic hash rings:
import crypto from "crypto";

function distributeKey(userId: string, totalPartitions: number): number {
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  const numericValue = parseInt(hash.substring(0, 8), 16);
  return numericValue % totalPartitions;
}`
      }
    });
  }
});

// 6. API: Project Generator
app.post("/api/generate-projects", async (req, res) => {
  const { techStack, difficulty } = req.body;
  const client = getGeminiClient();

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
        Act as a genius venture incubator and Silicon Valley Principal Architect.
        Suggest 3 cutting-edge, highly monetizable open-source, or startup project ideas.
        Technologies: ${Array.isArray(techStack) ? techStack.join(", ") : "TypeScript"}
        Target difficulty: ${difficulty || "Advanced"}

        Return a strict JSON response with exact layout:
        {
          "projects": [
            {
              "title": "string",
              "tagline": "string",
              "elevatorPitch": "string",
              "architecture": "string",
              "suggestedStack": "string",
              "complexityTicks": number (1 to 5)
            }
          ]
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    elevatorPitch: { type: Type.STRING },
                    architecture: { type: Type.STRING },
                    suggestedStack: { type: Type.STRING },
                    complexityTicks: { type: Type.NUMBER }
                  },
                  required: ["title", "tagline", "elevatorPitch", "architecture", "suggestedStack", "complexityTicks"]
                }
              }
            },
            required: ["projects"]
          }
        }
      });

      if (response && response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (e: any) {
      console.error("Project generation failed, returning simulated payload:", e);
    }
  }

  // Backup Project Simulator
  res.json({
    projects: [
      {
        title: "OmniMetrics Neural Gateway",
        tagline: "Ultra-low-latency real-time telemetry interceptor proxy with automated event streaming",
        elevatorPitch: "A decentralized proxy gateway sitting between modern container networks and observability suites. It intercepts trace metrics, operates intelligent client-side aggregations, and decreases Cloud Watch billing overheads.",
        architecture: "Microservice routing with persistent ring buffers for backpressure management.",
        suggestedStack: "Rust or Bun TS, WebSockets, Grafana Agent",
        complexityTicks: 4
      },
      {
        title: "CryptoGenome Ledger Sync",
        tagline: "Automated distributed state syncing validator with predictive latency balancing",
        elevatorPitch: "A database sync hook that validates write consistency across multiple global SQL replicas with active-active states. It analyzes query execution delays dynamically utilizing simple linear models.",
        architecture: "Distributed Paxos-like consensus middleware layer configured with zero-dependency TCP sockets.",
        suggestedStack: "Go or Python, gRPC, PostgreSQL Replicas",
        complexityTicks: 5
      },
      {
        title: "AI-Gen Smart Sandbox Orchestrator",
        tagline: "Ephemeral secure container environment triggered via webhooks",
        elevatorPitch: "An API-driven execution server simulating multi-tenant terminal structures, enabling users to isolate untrusted user-submitted logic with complete file-system security overlays.",
        architecture: "Restricted child processes linked with internal sandboxed memory-fs virtual layers.",
        suggestedStack: "Node.js (tsx), Docker Virtual SDKs, Redis Pub/Sub",
        complexityTicks: 3
      }
    ]
  });
});

// Vite Middleware for Development VS Static Serve for Production
async function startServer() {
  const httpServer = createHttpServer(app);
  const io = new SocketIoServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Quantum neural link established: ${socket.id}`);

    socket.on("client_heartbeat", (data) => {
      socket.emit("server_heartbeat", { systemLoad: "0.02%", socketStatus: "OPTIMIZED_SYNC" });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Coder disengaged link: ${socket.id}`);
    });
  });

  // Dynamic interval feed dispatcher for live ticker
  setInterval(() => {
    const mockEvents = [
      "Zane_AlgoMaster successfully cleared LRU Cache under 8ms.",
      "NeonByte_X hit active streak of 35 days commitment.",
      "Prism core router synchronized at 144 FPS payload.",
      "Zane_AlgoMaster sequenced an entry-FAANG profile grade of 92.",
      "Dev_Genesis has deployed Holographic Asset Hub to Cloud Run.",
      "AlphaCoded completed Step 3 AI validation in 400ms."
    ];
    const pick = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    io.emit("realtime_dev_ticks", { text: pick });
  }, 9000);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[SkillGenome AI] Running on http://localhost:${PORT} with HTTP and Sockets in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
