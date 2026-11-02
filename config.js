/**
 * ============================================================================
 * CENTRALIZED WORKSHOP CONFIGURATION (config.js)
 * "The Unfair Advantage: Practical AI Automation" — University of Fribourg (UniFR)
 * Teach and Learn Together Days
 * ============================================================================
 * Edit URLs, contact info, schedule blocks, and prompts in one place.
 */

window.WORKSHOP_CONFIG = {
  meta: {
    title: "The Unfair Advantage: Practical AI Automation",
    subtitle: "Stop chatting with AI. Start making it work for you.",
    initiative: "Teach and Learn Together Days",
    duration: "08:15 – 12:00 (4 Hours)",
    location: "University of Fribourg • Hybrid (PER 21 Salle B205)",
    version: "2026.1 • Swiss Precision Edition"
  },

  // --------------------------------------------------------------------------
  // EXTERNAL LINKS & PORTFOLIO / CONTACT URLS (EDIT THESE)
  // --------------------------------------------------------------------------
  links: {
    // Instructor / Portfolio Links
    githubProfile: "https://santiagomartinezhernandez.github.io/",
    githubRepo: "https://github.com/santiagomartinezhernandez/unifr-ai-automation-workshop",
    linkedin: "https://www.linkedin.com/in/santiagomartinezhernandez/",
    email: "mailto:andres.martinezhernandez@unifr.ch?subject=UniFR%20AI%20Automation%20Inquiry",
    consultancyCalendar: "https://calendly.com/santiago-m-art-inez/executive-meeting",

    // View 7: Graduation Form Link (Used for Live Button & Dynamic QR Code)
    graduationFormUrl: "https://forms.office.com/r/UNIFR-GRADUATION-DEMO",

    // Quick-Launch Platform Tools
    m365Copilot: "https://copilot.microsoft.com",
    notebookLM: "https://notebooklm.google.com",
    gemini: "https://gemini.google.com",
    claude: "https://claude.ai",
    chatgpt: "https://chatgpt.com",
    powerAutomate: "https://make.powerautomate.com",
    googleSheetsNew: "https://sheets.new",
    googleAppsScript: "https://script.google.com",
    googleAiStudio: "https://aistudio.google.com",
    adobeFirefly: "https://firefly.adobe.com",
    adobeExpress: "https://new.express.adobe.com"
  },

  // --------------------------------------------------------------------------
  // SIDEBAR NAVIGATION MODULES (7 VIEWS)
  // --------------------------------------------------------------------------
  modules: [
    {
      id: "view-1",
      number: "01",
      shortTitle: "Welcome & Agentic Shift",
      fullTitle: "01. Welcome & The Agentic Shift",
      timeSlot: "08:15 – 09:00",
      icon: "sparkles",
      badge: "Mindset & Privacy"
    },
    {
      id: "view-2",
      number: "02",
      shortTitle: "Meta-Prompting Engine",
      fullTitle: "02. The Meta-Prompting Engine",
      timeSlot: "09:00 – 09:30",
      icon: "cpu",
      badge: "LLM Architect"
    },
    {
      id: "view-3",
      number: "03",
      shortTitle: "Sandbox 1: Power Automate",
      fullTitle: "03. Sandbox 1: M365 & Power Automate",
      timeSlot: "09:50 – 10:20",
      icon: "zap",
      badge: "Hands-On Build"
    },
    {
      id: "view-4",
      number: "04",
      shortTitle: "The Spreadsheet Bridge",
      fullTitle: "04. The Spreadsheet Bridge (Escaping the Paywall)",
      timeSlot: "10:20 – 10:35",
      icon: "git-commit",
      badge: "Core Architecture"
    },
    {
      id: "view-5",
      number: "05",
      shortTitle: "Sandbox 2: GAS & Gemini",
      fullTitle: "05. Sandbox 2: Google Apps Script & Gemini API",
      timeSlot: "10:35 – 10:50",
      icon: "code-2",
      badge: "Zero-Paywall AI"
    },
    {
      id: "view-6",
      number: "06",
      shortTitle: "Creative AI & Vibe-Coding",
      fullTitle: "06. Creative AI, Vibe-Coding & Next Steps",
      timeSlot: "11:05 – 11:40",
      icon: "wand-2",
      badge: "Scale & Design"
    },
    {
      id: "view-7",
      number: "07",
      shortTitle: "🎓 Automated Graduation",
      fullTitle: "07. 🎓 The Grand Finale: Automated Graduation",
      timeSlot: "11:40 – 12:00",
      icon: "graduation-cap",
      badge: "Live Finale"
    }
  ],

  // --------------------------------------------------------------------------
  // MORNING SCHEDULE TIMELINE (08:15 - 12:00)
  // --------------------------------------------------------------------------
  schedule: [
    {
      time: "08:15 - 09:30",
      startHour: 8,
      startMin: 15,
      endHour: 9,
      endMin: 30,
      title: "Mindset, Swiss Privacy & The Toolkit",
      type: "session",
      icon: "shield-check",
      description: "Escaping 'work for the sake of work', moving from chatbot intern to autonomous agentic workflows, Swiss nDSG/revFADP compliance, and the Meta-Prompting Engine.",
      targetView: "view-1"
    },
    {
      time: "09:30 - 09:50",
      startHour: 9,
      startMin: 30,
      endHour: 9,
      endMin: 50,
      title: "☕ Coffee, Croissants & Bottleneck Board",
      type: "break",
      icon: "coffee",
      description: "Grab a coffee and croissant! Write your biggest weekly repetitive time-sink on a physical sticky note and place it on the Bottleneck Board by the coffee station.",
      interactivePrompt: "What task steals 2+ hours of your week every single week? (e.g., grading rubrics, sorting student emails, formatting references, copying form data into spreadsheets)",
      targetView: "view-1"
    },
    {
      time: "09:50 - 10:50",
      startHour: 9,
      startMin: 50,
      endHour: 10,
      endMin: 50,
      title: "Live Sandbox Builds (Power Automate + The Spreadsheet Bridge)",
      type: "hands-on",
      icon: "wrench",
      description: "Hands-on builds: Mastering M365 Standard Connectors, bypassing the Microsoft HTTP/AI Builder paywall via Google Sheets, and wiring free Gemini API calls with Google Apps Script.",
      targetView: "view-3"
    },
    {
      time: "10:50 - 11:05",
      startHour: 10,
      startMin: 50,
      endHour: 11,
      endMin: 5,
      title: "🥐 Espresso Refill & Self-Healing Debugging Lounge",
      type: "break",
      icon: "sparkles",
      description: "Refill your cup! Bring any red error messages from your sandbox flows and watch how the Self-Healing Debugger Prompt fixes broken expressions in 15 seconds.",
      targetView: "view-2"
    },
    {
      time: "11:05 - 12:00",
      startHour: 11,
      startMin: 5,
      endHour: 12,
      endMin: 0,
      title: "Advanced Horizons, Creative AI & Automated Graduation",
      type: "finale",
      icon: "graduation-cap",
      description: "Adobe Firefly & Express under the UniFR campus license, Vibe-Coding full web apps with Google Antigravity, enterprise research pipelines, and triggering your live PDF graduation certificate.",
      targetView: "view-6"
    }
  ],

  // --------------------------------------------------------------------------
  // COPY-PASTE PROMPTS & CODE SNIPPETS
  // --------------------------------------------------------------------------
  prompts: {
    // View 2 Prompts
    powerAutomateArchitect: {
      id: "prompt-pa-architect",
      badge: "System Prompt • M365 Architect",
      badgeColor: "indigo",
      title: "Prompt 1: The Power Automate Architect",
      subtitle: "Forces the LLM to respect your standard UniFR license and output exact click-by-click steps & OData expressions.",
      language: "markdown",
      content: `Act as a Senior Microsoft Power Automate Architect. I have a standard UniFR M365 license (no premium HTTP or AI Builder connectors). I want to build an automated cloud flow that triggers when [INSERT TRIGGER, e.g., a new email arrives or calendar invite is received] and performs [INSERT ACTION]. Give me a step-by-step click-by-click blueprint using ONLY Standard Connectors, including exact dynamic content expressions and OData filter queries if needed.`
    },

    gasZeroCodeGenerator: {
      id: "prompt-gas-generator",
      badge: "System Prompt • Google Workspace",
      badgeColor: "emerald",
      title: "Prompt 2: The Google Apps Script Zero-Code Generator",
      subtitle: "Generates production-ready Code.gs scripts with custom menu buttons and ALL-CAPS configuration placeholders.",
      language: "markdown",
      content: `Act as an Expert Google Workspace Developer. Write a complete, production-ready Google Apps Script (\`Code.gs\`) that accomplishes the following task: [INSERT TASK]. Requirements: 1) Include clear comments for a non-coder. 2) Add a custom menu button or time-driven trigger setup function so I don't have to run it manually. 3) Tell me exactly which lines I need to edit (like my Folder ID, Sheet Name, or API Key) in ALL CAPS.`
    },

    selfHealingDebugger: {
      id: "prompt-debugger",
      badge: "Error Debugger • Self-Healing",
      badgeColor: "amber",
      title: "Prompt 3: The \"Self-Healing\" Debugger Prompt",
      subtitle: "Never Google an obscure error code again. Paste the raw error + your steps to get an instant drop-in fix.",
      language: "markdown",
      content: `My automation failed with the following error message: [PASTE ERROR HERE]. Here is my current setup/code: [PASTE CODE OR FLOW STEPS]. Explain in one simple sentence why it broke, and give me the exact fixed code block or Power Automate expression to copy and paste.`
    },

    // View 3 Prompts
    copilotTriggerExpression: {
      id: "prompt-trigger-condition",
      badge: "Expression Helper • Power Automate",
      badgeColor: "indigo",
      title: "Copilot Trigger Condition Expression Generator",
      subtitle: "Prevents your flow from firing on every single email—only triggers when specific keywords like [URGENT] or [THESIS] appear.",
      language: "markdown",
      content: `Write a Microsoft Power Automate Trigger Condition expression for the "When a new email arrives (V3)" trigger. The flow should ONLY fire if the email Subject contains either "[URGENT]" or "[THESIS]" (case-insensitive) AND the email is not from my own address. Give me the exact @or(...) / @contains(...) expression I can paste directly into Settings -> Trigger Conditions, plus a 1-line explanation.`
    },

    readyTriggerFormula: {
      id: "prompt-ready-formula",
      badge: "Ready-to-Paste • Power Automate Formula",
      badgeColor: "emerald",
      title: "Direct Trigger Condition Formula (Settings → Trigger Conditions)",
      subtitle: "Want to skip prompting? Paste this exact expression into your Trigger Settings to filter for [URGENT] or [THESIS].",
      language: "plaintext",
      content: `@or(contains(toUpper(triggerOutputs()?['body/subject']), '[URGENT]'), contains(toUpper(triggerOutputs()?['body/subject']), '[THESIS]'))`
    },

    // View 5 Complete GAS Code
    completeBridgeScript: {
      id: "code-gas-bridge",
      badge: "GAS Code • Code.gs",
      badgeColor: "emerald",
      title: "Complete Spreadsheet Bridge & Gemini AI Triage Script (Code.gs)",
      subtitle: "Reads incoming rows from Power Automate, calls Gemini 2.5 Flash via UrlFetchApp (100% free tier), and writes Category, Summary & Draft Reply back to your Sheet.",
      language: "javascript",
      content: `/**
 * ============================================================================
 * THE SPREADSHEET BRIDGE: AUTONOMOUS AI TRIAGE ENGINE (Code.gs)
 * University of Fribourg (UniFR) — Practical AI Automation Workshop
 * ============================================================================
 * HOW TO USE (FOR NON-CODERS):
 * 1. In your Google Sheet, click Extensions -> Apps Script.
 * 2. Delete any code in the editor and paste this entire script.
 * 3. Edit ONLY the 2 ALL-CAPS lines in the CONFIGURATION block below.
 * 4. Click the Save icon (💾), refresh your Google Sheet, and use the new
 *    "⚡ UniFR AI Bridge" menu at the top of your spreadsheet!
 */

// ======================= 1. CONFIGURATION (EDIT HERE) =======================
const GEMINI_API_KEY = "PASTE_YOUR_FREE_GEMINI_API_KEY_HERE"; // <-- EDIT THIS IN ALL CAPS
const SHEET_NAME = "Sheet1"; // <-- EDIT THIS IF YOUR TAB HAS A DIFFERENT NAME
// ============================================================================

const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Adds a custom one-click button menu to your Google Sheet on open.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ UniFR AI Bridge")
    .addItem("▶️ Process Unanswered Rows Now", "processPendingRows")
    .addItem("⏰ Enable 5-Minute Auto-Pilot Trigger", "setupTimeDrivenTrigger")
    .addToUi();
}

/**
 * Scans the active sheet for rows where Column D (AI Category) is still empty,
 * sends the email/form text to Gemini API, and writes the structured output back.
 *
 * Expected Columns:
 * Col A: Sender | Col B: Subject | Col C: Body/Message
 * Col D: AI Category (Output) | Col E: 1-Sentence Summary (Output) | Col F: Draft Reply (Output)
 */
function processPendingRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) 
                || SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // Only header row exists

  // Read all rows from Row 2 down to the last row (Columns A to F)
  const range = sheet.getRange(2, 1, lastRow - 1, 6);
  const rows = range.getValues();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const sender = row[0];
    const subject = row[1];
    const messageBody = row[2];
    const existingCategory = row[3];

    // Only process rows that have content in Column B or C and haven't been processed yet
    if ((subject || messageBody) && !existingCategory) {
      try {
        const aiResult = callGeminiBrain(sender, subject, messageBody);

        // Write AI outputs into Columns D, E, and F
        sheet.getRange(rowNumber, 4).setValue(aiResult.category);
        sheet.getRange(rowNumber, 5).setValue(aiResult.summary);
        sheet.getRange(rowNumber, 6).setValue(aiResult.draftReply);
        sheet.getRange(rowNumber, 7).setValue("✅ Processed " + new Date().toLocaleTimeString());
      } catch (err) {
        sheet.getRange(rowNumber, 7).setValue("⚠️ Error: " + err.message);
      }
    }
  });
}

/**
 * Calls the Google Gemini API using UrlFetchApp (Zero Microsoft Premium Paywall!).
 */
function callGeminiBrain(sender, subject, messageBody) {
  const endpoint = \`https://generativelanguage.googleapis.com/v1beta/models/\${GEMINI_MODEL}:generateContent?key=\${GEMINI_API_KEY}\`;

  const prompt = \`
You are an executive academic assistant at the University of Fribourg.
Analyze this incoming message and return ONLY valid JSON with three keys:
- "category": Choose ONE from ["THESIS & SUPERVISION", "ADMIN & GRANTS", "TEACHING & EXAMS", "URGENT ACTION", "FYI / LOW PRIORITY"]
- "summary": A crisp 1-sentence summary of what the sender needs.
- "draftReply": A polite, professional 2-sentence reply ready to send.

Incoming Message:
From: \${sender}
Subject: \${subject}
Body: \${messageBody}
\`.trim();

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const statusCode = response.getResponseCode();
  const rawText = response.getContentText();

  if (statusCode !== 200) {
    throw new Error(\`Gemini API HTTP \${statusCode}: \${rawText.substring(0, 120)}\`);
  }

  const json = JSON.parse(rawText);
  const modelText = json.candidates[0].content.parts[0].text;
  return JSON.parse(modelText);
}

/**
 * Run once to create an automatic background trigger every 5 minutes.
 */
function setupTimeDrivenTrigger() {
  // Remove duplicate triggers first
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "processPendingRows") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("processPendingRows")
    .timeBased()
    .everyMinutes(5)
    .create();

  SpreadsheetApp.getUi().alert("✅ Auto-Pilot Activated! Your Sheet will now check for new rows every 5 minutes.");
}`
    },

    // View 6 Prompts
    adobeFireflyAcademicPrompt: {
      id: "prompt-adobe-firefly",
      badge: "Creative Prompt • Adobe Firefly",
      badgeColor: "purple",
      title: "High-End Academic Key Visual & Poster Asset Prompt",
      subtitle: "Generate 100% commercially safe, copyright-clean visuals for conference posters, grant slides, and workshop headers using your UniFR Adobe Campus License.",
      language: "markdown",
      content: `Minimalist isometric 3D editorial illustration of an autonomous research laboratory workflow, translucent glass data nodes connected by glowing electric indigo and emerald light fibers, Swiss typographic grid precision, crisp matte white and slate background, soft studio lighting, octanerender style, ultra-clean vector aesthetic, no text.`
    },

    antigravityVibeCodingPrompt: {
      id: "prompt-vibe-coding",
      badge: "Vibe-Coding • Google Antigravity",
      badgeColor: "indigo",
      title: "The \"Build Me a Full Web App\" Meta-Prompt (Google Antigravity)",
      subtitle: "The exact meta-prompting blueprint used to architect interactive research portals, lab dashboards, and this very lecture app.",
      language: "markdown",
      content: `Build an interactive, single-page research dashboard web application for my university lab focused on [INSERT RESEARCH TOPIC OR WORKFLOW]. 
Design Aesthetic: Swiss Precision meets Modern SaaS (crisp typography, high contrast, Indigo #4F46E5 & Emerald #10B981 accents).
Architecture Requirements:
1) Persistent left sidebar view-switcher with zero endless scrolling.
2) Centralized config.js file so non-coders in my lab can update dataset links, prompts, and KPIs in one place.
3) Interactive data pipeline diagram showing how our raw data moves from collection to publication.
4) Ready for instant static deployment on GitHub Pages.`
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 4: THE 5-NODE SPREADSHEET BRIDGE ARCHITECTURE DATA
  // --------------------------------------------------------------------------
  bridgeNodes: [
    {
      step: 1,
      id: "node-outlook",
      title: "Outlook / M365 Trigger",
      subtitle: "UniFR Standard Account",
      badge: "Microsoft 365 • Free",
      color: "indigo",
      icon: "mail",
      whatHappens: "An email arrives in your UniFR Outlook inbox (e.g., a student thesis inquiry) or someone submits a Microsoft Form.",
      technicalDetail: "Trigger: 'When a new email arrives (V3)' or 'When a new response is submitted'. Filtered cleanly with a Trigger Condition so only relevant items enter the pipeline.",
      paywallStatus: "✅ Included in standard UniFR M365 license",
      dataPayload: "{ from: 'student@unifr.ch', subject: '[THESIS] Master Inquiry', body: '...' }"
    },
    {
      step: 2,
      id: "node-power-automate",
      title: "Power Automate (Standard)",
      subtitle: "Insert Row Action",
      badge: "Standard Connector • Free",
      color: "blue",
      icon: "zap",
      whatHappens: "Instead of calling a paywalled Premium HTTP or AI Builder block, Power Automate uses the free Google Sheets 'Insert Row' Standard Connector.",
      technicalDetail: "Action: Google Sheets -> 'Insert row'. Maps Dynamic Content (From, Subject, Body Preview, Received Time) directly into Columns A, B, and C.",
      paywallStatus: "✅ Bypasses Microsoft's CHF 15–40/mo Premium HTTP & AI Builder Paywall!",
      dataPayload: "Action: Insert Row -> Sheet1 (Cols A:C populated, Col D left blank)"
    },
    {
      step: 3,
      id: "node-sheets",
      title: "Google Sheets",
      subtitle: "The Data Bridge & Audit Log",
      badge: "Neutral Bridge • Free",
      color: "emerald",
      icon: "table",
      whatHappens: "Acts as the secure, human-readable bridge between Microsoft 365 and Google's free developer ecosystem. Every transaction is logged transparently in a row.",
      technicalDetail: "Columns A–C hold raw incoming M365 data. Columns D–F wait for AI enrichment (Category, Summary, Draft Reply). You can inspect or override any row at any time.",
      paywallStatus: "✅ 100% Free & doubles as a live audit trail",
      dataPayload: "Row #14: [student@unifr.ch | [THESIS] Inquiry | Body... | <PENDING AI>]"
    },
    {
      step: 4,
      id: "node-gas",
      title: "Google Apps Script (UrlFetchApp)",
      subtitle: "Unrestricted HTTP & Gemini API",
      badge: "Zero Paywall • Free",
      color: "amber",
      icon: "code-2",
      whatHappens: "Unlike Power Automate, Google Apps Script gives every user unrestricted HTTP requests (`UrlFetchApp.fetch`) for free! It detects the new row and calls the Gemini API.",
      technicalDetail: "Executes on an `onChange` or 5-minute time-driven trigger. Packages the email text into a structured JSON prompt and hits `generativelanguage.googleapis.com`.",
      paywallStatus: "🔓 UNLOCKED: Free HTTP Webhook calls + Free Gemini API Tier!",
      dataPayload: "POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    },
    {
      step: 5,
      id: "node-action",
      title: "Autonomous Action",
      subtitle: "Close the Loop",
      badge: "Full Autonomy • Done",
      color: "purple",
      icon: "check-circle-2",
      whatHappens: "Apps Script writes the AI Category, 1-Sentence Summary, and Draft Reply back into Columns D–F, organizes Drive folders, or sends the automated response.",
      technicalDetail: "Can immediately send a formatted HTML email via `GmailApp.sendEmail()`, create a Google Calendar slot, or trigger a second Power Automate flow watching the sheet!",
      paywallStatus: "🚀 End-to-End Agentic Workflow Complete",
      dataPayload: "{ category: 'THESIS & SUPERVISION', summary: '...', status: '✅ Replied & Logged' }"
    }
  ],

  // --------------------------------------------------------------------------
  // INTERACTIVE STEP COMPLETION CHECKLIST (DRIVES TOP PROGRESS BAR)
  // --------------------------------------------------------------------------
  checklists: {
    "view-1": [
      {
        id: "chk-v1-1",
        title: "Explore the 3-Tab Agentic Shift Switcher (Intern → Train Track → Agentic)",
        detail: "Understand why combining deterministic triggers with an LLM brain creates the Unfair Advantage."
      },
      {
        id: "chk-v1-2",
        title: "Review the Swiss Safe Sandbox (nDSG / revFADP & NotebookLM SLA)",
        detail: "Know how to anonymize sensitive student/research data and stay inside safe institutional boundaries."
      }
    ],
    "view-2": [
      {
        id: "chk-v2-1",
        title: "Copy Prompt 1 (Power Automate Architect) & test it in Copilot or Gemini",
        detail: "Generate your first custom standard-connector blueprint without writing a single formula by hand."
      },
      {
        id: "chk-v2-2",
        title: "Bookmark Prompt 3 (The Self-Healing Debugger Prompt)",
        detail: "Ready to paste any error message during our hands-on sandbox sessions."
      }
    ],
    "view-3": [
      {
        id: "chk-v3-1",
        title: "Step 1: Open Power Automate → Click 'Create' → Select 'Automated Cloud Flow'",
        detail: "Sign in with your UniFR Microsoft 365 credentials at make.powerautomate.com."
      },
      {
        id: "chk-v3-2",
        title: "Step 2: Set Trigger to 'When a new email arrives (V3)' or Calendar Event Trigger",
        detail: "Choose Office 365 Outlook (Standard Green-Light Connector)."
      },
      {
        id: "chk-v3-3",
        title: "Step 3: Apply the Trigger Condition Filter ([URGENT] or [THESIS])",
        detail: "Open Trigger Settings (⚙️) → Add Trigger Condition so your flow only fires on target keywords."
      },
      {
        id: "chk-v3-4",
        title: "Step 4: Add a Standard Action (Insert Row in Google Sheets / SharePoint / Teams)",
        detail: "Pass dynamic content (Sender, Subject, Body Preview) to your destination table."
      }
    ],
    "view-4": [
      {
        id: "chk-v4-1",
        title: "Inspect all 5 Nodes of The Spreadsheet Bridge Architecture Diagram",
        detail: "Click through Nodes 1 to 5 to see how data crosses from M365 into Google Apps Script for free."
      }
    ],
    "view-5": [
      {
        id: "chk-v5-1",
        title: "Create a Google Sheet with Columns A–G & open Extensions → Apps Script",
        detail: "Headers: Sender | Subject | Body | AI Category | Summary | Draft Reply | Status."
      },
      {
        id: "chk-v5-2",
        title: "Copy the Complete Code.gs Script & insert your free Gemini API Key",
        detail: "Get your key from Google AI Studio (aistudio.google.com) and paste it into the ALL-CAPS constant."
      },
      {
        id: "chk-v5-3",
        title: "Save (💾) & activate the Time-Driven Trigger (⏰ Alarm Clock Icon)",
        detail: "Run 'processPendingRows' or enable the 5-minute Auto-Pilot from the custom Sheet menu."
      }
    ],
    "view-6": [
      {
        id: "chk-v6-1",
        title: "Test the Adobe Firefly Academic Visual Prompt or Antigravity Vibe-Coding Prompt",
        detail: "Discover how to pair back-end automations with world-class visuals and custom web apps."
      }
    ],
    "view-7": [
      {
        id: "chk-v7-1",
        title: "🎓 Submit the Graduation Form to trigger your live PDF Certificate!",
        detail: "Watch the automated pipeline generate and email your personalized UniFR Workshop Certificate."
      }
    ]
  }
};
