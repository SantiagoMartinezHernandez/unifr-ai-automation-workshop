/**
 * ============================================================================
 * SWISS-SAFE PII ANONYMIZER & DE-MASKING ENGINE (anonymizer.js)
 * University of Fribourg (UniFR) — Practical AI Automation Command Center
 * ============================================================================
 * 100% Client-Side In-Browser Memory (sessionStorage). Zero Server Transmission.
 */

window.AnonymizerApp = (function () {
  const SESSION_STORAGE_KEY = "unifr_pii_session_map_v1";

  // In-memory session dictionary: { "[TAG]": "Real Value" }
  let sessionMap = {};

  // Load session map from sessionStorage on load
  function loadSessionMap() {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        sessionMap = JSON.parse(saved);
      }
    } catch (e) {
      sessionMap = {};
    }
  }

  function saveSessionMap() {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionMap));
    } catch (e) {
      console.warn("Could not save to sessionStorage", e);
    }
    updateJsonPreview();
  }

  function updateJsonPreview() {
    const el = document.getElementById("session-json-preview");
    if (el) {
      el.textContent = JSON.stringify(sessionMap, null, 2);
    }
  }

  // Pre-canned realistic demo samples
  const PRESETS = {
    student: `Dear Prof. Dr. Santiago Martinez,

I hope you are doing well. My name is Lukas Müller (Student ID: 21-492-801, Email: lukas.mueller@unifr.ch, Phone: +41 26 300 71 11).

I am writing regarding my Master thesis evaluation and grade for the Spring Semester 2026. My AHV number is 756.9281.3829.44. In our last committee meeting, Prof. Dr. Jean-Pierre Dupont mentioned that the lab research grant of CHF 14,500 would be confirmed by March 15, 2026.

Could you please confirm if my thesis proposal has been accepted?

Best regards,
Lukas Müller`,

    grant: `CONFIDENTIAL RESEARCH PROPOSAL MEMORANDUM

Applicant: Prof. Dr. Elena Rossi
Co-Investigator: Dr. Marc Weber (marc.weber@unifr.ch)
Department: Department of Informatics, University of Fribourg
Contact Phone: +41 79 482 19 30

Total SNSF Requested Budget: CHF 248,500
Initial Lab Equipment Allocation: CHF 65,000
Project Start Date: October 01, 2026
Institutional Liaison: Madame Claire Fontaine (claire.fontaine@unifr.ch)

Summary: This research initiative investigates autonomous agentic workflow integrations with strict Swiss nDSG data sovereignty boundaries.`
  };

  function loadPreset(type) {
    const input = document.getElementById("raw-input-text");
    if (input && PRESETS[type]) {
      input.value = PRESETS[type];
      sanitizeText();
    }
  }

  /**
   * Core PII Detection & Tokenization Engine
   */
  function sanitizeText() {
    const inputEl = document.getElementById("raw-input-text");
    if (!inputEl) return;

    const rawText = inputEl.value;
    if (!rawText.trim()) {
      alert("Please enter or paste confidential text first.");
      return;
    }

    // Reset or expand session map
    const newMap = Object.assign({}, sessionMap);
    let sanitized = rawText;

    const stats = {
      emails: 0,
      phones: 0,
      ahv: 0,
      studentIds: 0,
      amounts: 0,
      dates: 0,
      names: 0,
      custom: 0
    };

    // Helper: Register token replacement
    function replaceEntity(value, tagPrefix, statKey) {
      const cleanVal = value.trim();
      if (!cleanVal || cleanVal.length < 2) return;

      // Check if value already has an existing tag in session
      let existingTag = Object.keys(newMap).find((k) => newMap[k].toLowerCase() === cleanVal.toLowerCase());
      if (!existingTag) {
        const count = Object.keys(newMap).filter((k) => k.startsWith(`[${tagPrefix}_`)).length + 1;
        existingTag = `[${tagPrefix}_${count}]`;
        newMap[existingTag] = cleanVal;
        stats[statKey]++;
      }

      // Safe replace all occurrences (escape regex special characters)
      const escaped = cleanVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      sanitized = sanitized.replace(regex, existingTag);
    }

    // 1. Custom Keywords (User Specified)
    const customInput = document.getElementById("custom-keywords-input");
    if (customInput && customInput.value.trim()) {
      const customs = customInput.value.split(",").map((s) => s.trim()).filter(Boolean);
      customs.forEach((c) => {
        replaceEntity(c, "CUSTOM_ENTITY", "custom");
      });
    }

    // 2. Email Addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = rawText.match(emailRegex) || [];
    emails.forEach((email) => replaceEntity(email, "EMAIL", "emails"));

    // 3. Swiss AHV/AVS Numbers (e.g. 756.9281.3829.44 or 756 9281 3829 44)
    const ahvRegex = /\b756[.\s]\d{4}[.\s]\d{4}[.\s]\d{2}\b/g;
    const ahvs = rawText.match(ahvRegex) || [];
    ahvs.forEach((ahv) => replaceEntity(ahv, "SWISS_AHV", "ahv"));

    // 4. Swiss & International Phone Numbers (+41 26 300 71 11, 079 123 45 67, etc.)
    const phoneRegex = /(?:\+41|0041|0)\s?(?:[1-9]\d{1})\s?(?:\d{3})\s?(?:\d{2})\s?(?:\d{2})|(?:\+41\s?[1-9]\d(?:\s?\d{3}){2})/g;
    const phones = rawText.match(phoneRegex) || [];
    phones.forEach((phone) => replaceEntity(phone, "PHONE", "phones"));

    // 5. Student & Matriculation IDs (e.g. 21-492-801, Matricule: 18-932-110, ID: 849204)
    const studentIdRegex = /\b\d{2}-\d{3}-\d{3}\b|\b(?:Student ID|Matricul[ea]|Matrikelnummer)[\s:]*([A-Za-z0-9-]+)\b/gi;
    let match;
    while ((match = studentIdRegex.exec(rawText)) !== null) {
      const idVal = match[1] || match[0];
      replaceEntity(idVal, "STUDENT_ID", "studentIds");
    }

    // 6. Monetary Amounts & Budgets (e.g. CHF 14,500, CHF 248'500, €45,000, $20,000)
    const amountRegex = /(?:CHF|EUR|USD|\$|€|£)\s?\d{1,3}(?:['.,\s]\d{3})*(?:\.\d{2})?|\d{1,3}(?:['.,\s]\d{3})*(?:\.\d{2})?\s?(?:CHF|EUR|USD|Fr\.)/gi;
    const amounts = rawText.match(amountRegex) || [];
    amounts.forEach((amt) => replaceEntity(amt, "AMOUNT", "amounts"));

    // 7. Academic Titles & Personal Names (Prof. Dr. First Last, Madame First Last, etc.)
    const nameWithTitleRegex = /(?:Prof\.|Professor|Dr\.|Doctor|Mr\.|Ms\.|Mrs\.|Monsieur|Madame|Herr|Frau)\s+(?:Dr\.\s+)?([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){1,3})/g;
    while ((match = nameWithTitleRegex.exec(rawText)) !== null) {
      const fullName = match[0].trim();
      replaceEntity(fullName, "PERSON", "names");
    }

    // Common greetings with names (e.g., Dear Lukas Müller, Chère Sophie Dubois, Best regards,\nLukas Müller)
    const greetingNameRegex = /(?:Dear|Chère?|Liebe[rn]?|Best regards,?\s+|Sincerely,?\s+)\s*([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){1,2})/g;
    while ((match = greetingNameRegex.exec(rawText)) !== null) {
      if (match[1]) {
        replaceEntity(match[1].trim(), "PERSON", "names");
      }
    }

    // Save active dictionary into session
    sessionMap = newMap;
    saveSessionMap();

    // Render Sanitized Container
    const container = document.getElementById("sanitized-result-container");
    const outputEl = document.getElementById("sanitized-output-text");
    const statsBadge = document.getElementById("detected-stats-badge");
    const pillsList = document.getElementById("detected-pills-list");

    if (container) container.classList.remove("hidden");
    if (outputEl) {
      // Highlight tags visually in output
      outputEl.textContent = sanitized;
    }

    const totalDetected = Object.keys(sessionMap).length;
    if (statsBadge) {
      statsBadge.textContent = `${totalDetected} Items Masked in Session`;
    }

    // Render detected pills
    if (pillsList) {
      pillsList.innerHTML = Object.keys(sessionMap)
        .map(
          (tag) => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-emerald-300 font-mono text-[11px] border border-slate-700">
            <span class="font-bold text-white">${tag}</span>
            <span class="text-slate-500">→</span>
            <span class="text-slate-300 italic truncate max-w-[140px]">${sessionMap[tag]}</span>
          </span>
        `
        )
        .join("");
    }

    // Pre-populate AI response input with simulated response if empty
    const aiInput = document.getElementById("ai-response-input");
    if (aiInput && !aiInput.value.trim()) {
      aiInput.value = generateSimulatedAiResponse(sanitized);
    }

    // Smooth scroll down to sanitized box
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /**
   * Helper: Generate a realistic AI response containing the masked tokens
   */
  function generateSimulatedAiResponse(sanitizedPrompt) {
    const personTags = Object.keys(sessionMap).filter((k) => k.startsWith("[PERSON_"));
    const emailTags = Object.keys(sessionMap).filter((k) => k.startsWith("[EMAIL_"));
    const studentIdTags = Object.keys(sessionMap).filter((k) => k.startsWith("[STUDENT_ID_"));
    const amountTags = Object.keys(sessionMap).filter((k) => k.startsWith("[AMOUNT_"));

    const recipient = personTags[0] || "[PERSON_1]";
    const email = emailTags[0] || "[EMAIL_1]";
    const studentId = studentIdTags[0] || "[STUDENT_ID_1]";
    const amount = amountTags[0] || "[AMOUNT_1]";

    return `Dear ${recipient},

Thank you for reaching out regarding your academic file and thesis registration.

We have reviewed the records for student ID ${studentId}. I am pleased to inform you that your registration is confirmed. In addition, the requested departmental grant allocation of ${amount} has been approved by the committee.

A formal notification has also been sent to your primary address at ${email}.

Please let me know if you require any additional certificates.

Kind regards,
Academic Examination Office
University of Fribourg (UniFR)`;
  }

  function loadSimulatedAiResponse() {
    const outputEl = document.getElementById("sanitized-output-text");
    const sanitized = outputEl ? outputEl.textContent : "";
    const aiInput = document.getElementById("ai-response-input");
    if (aiInput) {
      aiInput.value = generateSimulatedAiResponse(sanitized);
      restoreText();
    }
  }

  /**
   * Core De-Anonymization & Restoration Engine
   */
  function restoreText() {
    const aiInput = document.getElementById("ai-response-input");
    if (!aiInput) return;

    const rawAiText = aiInput.value;
    if (!rawAiText.trim()) {
      alert("Please paste the AI's response in the box above.");
      return;
    }

    let restored = rawAiText;

    // Substitute each session token back to its real value
    Object.keys(sessionMap).forEach((tag) => {
      const realValue = sessionMap[tag];
      const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      restored = restored.replace(regex, realValue);
    });

    const resultContainer = document.getElementById("restored-result-container");
    const outputEl = document.getElementById("restored-output-text");

    if (resultContainer) resultContainer.classList.remove("hidden");
    if (outputEl) {
      outputEl.textContent = restored;
    }

    // Trigger subtle confetti on successful restore
    if (typeof window.confetti === "function") {
      window.confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10B981", "#4F46E5", "#38BDF8"]
      });
    }

    if (resultContainer) {
      resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /**
   * Clipboard Copy Handlers with Visual Glow Feedback
   */
  function copySanitizedText(btnElement) {
    const outputEl = document.getElementById("sanitized-output-text");
    if (!outputEl) return;
    copyToClipboard(outputEl.textContent, btnElement, "Sanitized Text Copied ✓");
  }

  function copyRestoredText(btnElement) {
    const outputEl = document.getElementById("restored-output-text");
    if (!outputEl) return;
    copyToClipboard(outputEl.textContent, btnElement, "Restored Document Copied ✓");
  }

  function copyToClipboard(text, btnElement, successMsg) {
    const labelSpan = btnElement ? btnElement.querySelector(".copy-btn-label") : null;
    const origText = labelSpan ? labelSpan.textContent : "Copy";

    const onSuccess = () => {
      if (btnElement) btnElement.classList.add("copy-btn-copied");
      if (labelSpan) labelSpan.textContent = successMsg;

      if (typeof window.confetti === "function") {
        window.confetti({
          particleCount: 20,
          spread: 45,
          origin: { y: 0.7 },
          colors: ["#10B981", "#4F46E5"]
        });
      }

      setTimeout(() => {
        if (btnElement) btnElement.classList.remove("copy-btn-copied");
        if (labelSpan) labelSpan.textContent = origText;
      }, 2200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, callback) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      callback();
    } catch (e) {
      console.error(e);
    }
    document.body.removeChild(ta);
  }

  function clearSession() {
    if (confirm("Are you sure you want to purge all active PII session keys from browser memory?")) {
      sessionMap = {};
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      updateJsonPreview();

      const sanitizedBox = document.getElementById("sanitized-result-container");
      const restoredBox = document.getElementById("restored-result-container");
      if (sanitizedBox) sanitizedBox.classList.add("hidden");
      if (restoredBox) restoredBox.classList.add("hidden");

      const rawInput = document.getElementById("raw-input-text");
      const aiInput = document.getElementById("ai-response-input");
      if (rawInput) rawInput.value = "";
      if (aiInput) aiInput.value = "";

      alert("✅ Session purged. Browser memory is completely clean.");
    }
  }

  // Init
  function init() {
    loadSessionMap();
    updateJsonPreview();
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    sanitizeText,
    restoreText,
    loadPreset,
    loadSimulatedAiResponse,
    copySanitizedText,
    copyRestoredText,
    clearSession
  };
})();
