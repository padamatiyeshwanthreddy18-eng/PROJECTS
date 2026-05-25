import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./db";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  AuthenticatedRequest,
  logActivity,
  JWT_REFRESH_SECRET
} from "./auth";

const router = Router();

// Store temporary random OTPs in memory for the session verification flow
const activeOtps = new Map<string, { otp: string; expiresAt: number; email: string }>();

// 1. POST: Onboard & Register Step-by-Step
router.post("/auth/signup", async (req, res) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      username,
      experienceLevel,
      techStack, // Array of strings e.g. ["React", "Node"]
      targetRole,
      codingHours,
      dsaLevel,
      interests,
      githubUsername,
      linkedinUrl,
      portfolioUrl,
      bio
    } = req.body;

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ error: "Missing required identity fields (Email, Password, Name, Username)." });
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: "A developer with this email or username has already been sequenced." });
    }

    // Hash the password securely
    const passwordHash = await hashPassword(password);

    // Formulate serialized parameters
    const serializedTech = Array.isArray(techStack) ? techStack.join(", ") : techStack || "JavaScript, React";
    const mappedExpLevel = experienceLevel || "CS Student";
    const hours = Number(codingHours) || 20;

    // Create User, Profile, Settings, CodingTracker, Achievements, and default AI Analysis synchronously!
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        username: username.toLowerCase(),
        bio: bio || "Exploring the quantum layers of developer intelligence.",
        githubUsername: githubUsername || "",
        linkedinUrl: linkedinUrl || "",
        portfolioUrl: portfolioUrl || "",
        experienceLevel: mappedExpLevel,
        settings: {
          create: {
            theme: "dark",
            notificationPreferences: "email,security",
            aiPreferences: "aggressive"
          }
        },
        codingTracker: {
          create: {
            codingHours: hours,
            dailyProgress: 15.0,
            streakCount: 1,
            dsaScore: dsaLevel === "Advanced" ? 85 : dsaLevel === "Intermediate" ? 60 : 35
          }
        },
        achievements: {
          create: {
            xpPoints: 120, // Starting XP
            badges: JSON.stringify(["GENOME_SEQUENCE_INITIATED"]),
            leaderboardRank: Math.floor(Math.random() * 500) + 1200
          }
        },
        githubStats: {
          create: {
            commits: Math.floor(Math.random() * 80) + 10,
            repositories: Math.floor(Math.random() * 8) + 2,
            contributionScore: 45.0 + Math.random() * 30,
            codingConsistency: 70.0 + Math.random() * 20
          }
        },
        aiAnalysis: {
          create: {
            developerDnaScore: 68 + Math.floor(Math.random() * 12),
            aiReadiness: 60 + Math.floor(Math.random() * 20),
            dnaSequence: `ACTD-STK-${mappedExpLevel.substring(0, 3).toUpperCase()}-99X`,
            hiringProbability: JSON.stringify({ faang: 42, unicorns: 55, startups: 78 }),
            weaknessReport: JSON.stringify([
              { topic: "Systems Cloud Ingress", description: `Needs practical DevOps pipelines optimized for ${targetRole || "developer apps"}.`, impact: "Medium" }
            ]),
            careerPrediction: `High suitability for junior/mid roles focusing on ${targetRole || "Full Stack engineering"}.`,
            salaryPrediction: JSON.stringify({
              currency: "USD",
              predictedMin: mappedExpLevel === "Senior Engineer" ? 130000 : 70000,
              predictedMax: mappedExpLevel === "Senior Engineer" ? 210000 : 120000,
              timeToMaxMonths: 18
            })
          }
        }
      }
    });

    // Seed selected skills directly
    if (Array.isArray(techStack)) {
      await Promise.all(
        techStack.map((tech) =>
          prisma.skill.create({
            data: {
              userId: newUser.id,
              skillName: tech,
              skillLevel: "Intermediate",
              confidenceScore: 70.0
            }
          })
        )
      );
    }

    const ip = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "SkillGenome Core Gateway";
    await logActivity(newUser.id, "SIGNUP", ip, userAgent, "SUCCESS");

    // Success response
    const tokenPayload = { id: newUser.id, email: newUser.email, username: newUser.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(201).json({
      message: "Developer DNA successfully sequenced and registered.",
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName
      }
    });
  } catch (error: any) {
    console.error("Signup sequencing failed:", error);
    return res.status(500).json({ error: "System failed during custom profile initialization: " + error.message });
  }
});

// 2. POST: Secure Cyberpunk Login with MFA Simulation
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Generic Terminal Connection";

    if (!email || !password) {
      return res.status(400).json({ error: "Identity email and system credential password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid developer identity or passphrase matched signature." });
    }

    // Audit password hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logActivity(user.id, "LOGIN_FAILED", ip, userAgent, "FAILED");
      return res.status(401).json({ error: "Invalid developer identity or passphrase matched signature." });
    }

    const tokenPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity(user.id, "LOGIN_SUCCESS", ip, userAgent, "SUCCESS");

    // Return identity token and details immediately bypassing MFA
    return res.json({
      message: "Decryption token validated successfully.",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error: any) {
    console.error("Login authorization failed:", error);
    return res.status(500).json({ error: "Workspace gateway failed context validation: " + error.message });
  }
});

// 2.5. POST: Instant Social OAuth Database Authenticator (Google, Apple, GitHub)
router.post("/auth/oauth", async (req, res) => {
  try {
    const { email, fullName, provider, username: inputUsername } = req.body;
    const ip = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "OAuth Client Gateway";

    if (!email || !fullName || !provider) {
      return res.status(400).json({ error: "Required fields (email, fullName, provider) are missing in OAuth verification payload." });
    }

    const emailLower = email.toLowerCase();
    
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { email: emailLower }
    });

    if (!user) {
      // Auto-extract or generate a unique cyberpunk style username
      let usernameCandidate = (inputUsername || emailLower.split("@")[0] || "dev")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      
      // Make sure the username is unique
      const existingUsernameUser = await prisma.user.findUnique({
        where: { username: usernameCandidate }
      });
      if (existingUsernameUser) {
        usernameCandidate = `${usernameCandidate}${Math.floor(100 + Math.random() * 900)}`;
      }

      const randomPass = Math.random().toString(36) + Math.random().toString(36);
      const passwordHash = await hashPassword(randomPass);

      // Create new user with complete profile data set
      const defaultTechStack = ["TypeScript", "React", "Node.js", "Express", "Tailwind CSS"];
      
      user = await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          fullName,
          username: usernameCandidate,
          bio: `Automated ${provider} developer genome initialization sequence completed. Ready for high-velocity optimization.`,
          experienceLevel: "Mid-Level Dev",
          githubUsername: provider === "GitHub" ? usernameCandidate : "",
          settings: {
            create: {
              theme: "dark",
              notificationPreferences: "email,push",
              aiPreferences: "balanced"
            }
          },
          codingTracker: {
            create: {
              codingHours: 35.0,
              dailyProgress: 25.0,
              streakCount: 3,
              dsaScore: 65
            }
          },
          achievements: {
            create: {
              xpPoints: 200,
              badges: JSON.stringify([`OAUTH_SYNC_${provider.toUpperCase()}`]),
              leaderboardRank: Math.floor(Math.random() * 200) + 1000
            }
          },
          githubStats: {
            create: {
              commits: Math.floor(Math.random() * 150) + 50,
              repositories: Math.floor(Math.random() * 15) + 3,
              contributionScore: 65.0 + Math.random() * 20,
              codingConsistency: 80.0 + Math.random() * 15
            }
          },
          aiAnalysis: {
            create: {
              developerDnaScore: 78,
              aiReadiness: 72,
              dnaSequence: `ACTD-SEQ-${provider.substring(0, 3).toUpperCase()}-OAUTH`,
              hiringProbability: JSON.stringify({ faang: 48, unicorns: 62, startups: 85 }),
              weaknessReport: JSON.stringify([
                { topic: "System Distributed Ingress", description: "Improve modular microservice integration and scale security layers.", impact: "Medium" }
              ]),
              careerPrediction: `Highly suited for Full Stack / Frontend engineering roles using modern workspaces synced via ${provider}.`,
              salaryPrediction: JSON.stringify({
                currency: "USD",
                predictedMin: 95000,
                predictedMax: 145000,
                timeToMaxMonths: 12
              })
            }
          }
        }
      });

      // Seed core skills for the new user
      await Promise.all(
        defaultTechStack.map((tech) =>
          prisma.skill.create({
            data: {
              userId: user!.id,
              skillName: tech,
              skillLevel: "Intermediate",
              confidenceScore: 75.0
            }
          })
        )
      );

      await logActivity(user.id, `OAUTH_SIGNUP_${provider.toUpperCase()}`, ip, userAgent, "SUCCESS");
    } else {
      await logActivity(user.id, `OAUTH_LOGIN_${provider.toUpperCase()}`, ip, userAgent, "SUCCESS");
    }

    const tokenPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.json({
      message: `Seamless ${provider} authentication synchronization executed flawlessly.`,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error: any) {
    console.error("OAuth authentication failed:", error);
    return res.status(500).json({ error: "System failed during secure provider handshake parsing: " + error.message });
  }
});

// 3. POST: MFA / OTP Passcode Validation Handshake
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const ip = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Generic Terminal Connection";

    if (!userId || !otp) {
      return res.status(400).json({ error: "Verification token mismatch. Missing active OTP or user ID." });
    }

    const cachedOtp = activeOtps.get(userId);
    if (!cachedOtp) {
      return res.status(400).json({ error: "No active verification sessions. Re-issue secure login credential query." });
    }

    if (Date.now() > cachedOtp.expiresAt) {
      activeOtps.delete(userId);
      return res.status(400).json({ error: "decryption passkey handshake expired. OTP invalid." });
    }

    if (cachedOtp.otp !== otp) {
      await logActivity(userId, "OTP_VERIFY_FAILED", ip, userAgent, "SUSPICIOUS");
      return res.status(400).json({ error: "Handshake mismatch. Verification passkey rejected." });
    }

    // Clean OTP code pool
    activeOtps.delete(userId);

    // Fetch matching user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "Identity profile not found in primary shard index." });
    }

    const tokenPayload = { id: user.id, email: user.email, username: user.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await logActivity(userId, "AUTH_HANDSHAKE_SUCCESS", ip, userAgent, "SUCCESS");

    return res.json({
      message: "Decryption token validated successfully.",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: "MFA signature check failed: " + error.message });
  }
});

// 4. POST: Refresh Token System
router.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh signature token missing." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const tokenPayload = { id: decoded.id, email: decoded.email, username: decoded.username };
    const newAccessToken = generateAccessToken(tokenPayload);

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Session expired or invalid refresh signature token." });
  }
});

// 5. POST: Reset & Forgot Passwords (Simulations with Secure Updates)
router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Authentication identity email is required." });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return res.status(404).json({ error: "Email target not indexed in DNA core database." });
  }

  // Create recovery OTP
  const recoveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps.set(user.id, {
    otp: recoveryOtp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    email: user.email
  });

  return res.json({
    message: "A virtual recovery passcode has been transmitted.",
    userId: user.id,
    simulatedRecoveryOtp: recoveryOtp
  });
});

router.post("/auth/reset-password", async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) {
    return res.status(400).json({ error: "Missing identity inputs or new authorization targets." });
  }

  const record = activeOtps.get(userId);
  if (!record || record.otp !== otp) {
    return res.status(400).json({ error: "Recovery validation mismatch. Action blocked." });
  }

  try {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed }
    });

    activeOtps.delete(userId);
    return res.json({ message: "System credential reset completed successfully." });
  } catch (e: any) {
    return res.status(500).json({ error: "Credential update cycle failed: " + e.message });
  }
});

// 6. GET: Authenticated Profile & Nested Workspace Parameters
router.get("/user/me", authenticateToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        skills: true,
        projects: true,
        githubStats: true,
        codingTracker: true,
        aiAnalysis: true,
        roadmaps: true,
        interviewResults: true,
        achievements: true,
        settings: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Sequence session profile was disengaged from database stack." });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to download User details: " + error.message });
  }
});

// 7. POST: Save Theme / Settings Shard Elements
router.post("/user/settings", authenticateToken as any, async (req: AuthenticatedRequest, res) => {
  const { 
    theme, 
    notificationPreferences, 
    privacySettings, 
    aiPreferences,
    selected_country,
    currency_code,
    locale,
    timezone,
    salary_format,
    auto_detect_currency
  } = req.body;
  try {
    const updated = await prisma.setting.upsert({
      where: { userId: req.user?.id },
      update: {
        theme,
        notificationPreferences,
        privacySettings,
        aiPreferences,
        selected_country,
        currency_code,
        locale,
        timezone,
        salary_format,
        auto_detect_currency: auto_detect_currency !== undefined ? Boolean(auto_detect_currency) : undefined
      },
      create: {
        userId: req.user?.id || "",
        theme: theme || "dark",
        notificationPreferences: notificationPreferences || "email,push",
        privacySettings: privacySettings || "public",
        aiPreferences: aiPreferences || "balanced",
        selected_country: selected_country || "USA",
        currency_code: currency_code || "USD",
        locale: locale || "en-US",
        timezone: timezone || "America/New_York",
        salary_format: salary_format || "yearly",
        auto_detect_currency: auto_detect_currency !== undefined ? Boolean(auto_detect_currency) : true
      }
    });
    return res.json({ settings: updated });
  } catch (e: any) {
    return res.status(500).json({ error: "Setting save event failed: " + e.message });
  }
});

// 8. POST: Update Live Code Tracker hours & streak indexes
router.post("/user/tracker", authenticateToken as any, async (req: AuthenticatedRequest, res) => {
  const { codingHours, dailyProgress, streakCount, dsaScore } = req.body;
  try {
    const updated = await prisma.codingTracker.upsert({
      where: { userId: req.user?.id },
      update: {
        codingHours: codingHours !== undefined ? Number(codingHours) : undefined,
        dailyProgress: dailyProgress !== undefined ? Number(dailyProgress) : undefined,
        streakCount: streakCount !== undefined ? Number(streakCount) : undefined,
        dsaScore: dsaScore !== undefined ? Number(dsaScore) : undefined
      },
      create: {
        userId: req.user?.id || "",
        codingHours: Number(codingHours) || 0,
        dailyProgress: Number(dailyProgress) || 0,
        streakCount: Number(streakCount) || 1,
        dsaScore: Number(dsaScore) || 50
      }
    });

    // Also distribute atomic achievements xp bump points for active track progression
    await prisma.achievement.updateMany({
      where: { userId: req.user?.id },
      data: {
        xpPoints: { increment: 25 } // +25 XP points
      }
    });

    return res.json({ tracker: updated });
  } catch (e: any) {
    return res.status(500).json({ error: "Telemetry telemetry tracker insertion failed: " + e.message });
  }
});

// 9. GET: Devices and activities log tracker
router.get("/user/activities", authenticateToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    // Generate beautiful real-time mock telemetry records of activity tracking
    const actions = [
      { id: "1", action: "SECURITY_SIG_HANDSHAKE", ip: "34.120.91.44", device: "MacBook Pro (Chrome/OSX)", time: "Just Now", status: "SUCCESS" },
      { id: "2", action: "DATABASE_PRISMA_INIT", ip: "102.15.22.181", device: "Desktop Core Client (Windows)", time: "18 minutes ago", status: "SUCCESS" },
      { id: "3", action: "SUSPICIOUS_LOGIN_ATTEMPT", ip: "193.106.31.55", device: "Terminal Session (Linux Server)", time: "2 Hours Ago", status: "SUSPICIOUS" },
      { id: "4", action: "DEVELOPER_DNA_DECRYPTION", ip: "34.120.91.44", device: "iPhone 15 Pro Max (iOS Safari)", time: "1 Day Ago", status: "SUCCESS" }
    ];
    return res.json({ activities: actions });
  } catch (e: any) {
    return res.status(500).json({ error: "Failed to pull security log index." });
  }
});

export default router;
