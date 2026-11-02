/**
 * ============================================================================
 * SWISS-SAFE PII ANONYMIZER & DE-MASKING ENGINE (anonymizer.js)
 * University of Fribourg (UniFR) — Practical AI Automation Command Center
 * ============================================================================
 * 100% Client-Side In-Browser Memory (sessionStorage). Zero Server Transmission.
 * Multi-format Document Support: PDF, Word (.docx), Excel (.xlsx, .csv), Plain Text.
 */

window.AnonymizerApp = (function () {
  const SESSION_STORAGE_KEY = "unifr_pii_session_map_v1";

  // In-memory session dictionary: { "[TAG]": "Real Value" }
  let sessionMap = {};
  let currentLoadedFileName = "";

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
      currentLoadedFileName = `sample_${type}.txt`;
      showFileSuccessState(`sample_${type}.txt`, PRESETS[type].length, PRESETS[type].length, "Sample Loaded");
      sanitizeText();
    }
  }

  /**
   * ==========================================================================
   * MULTI-FORMAT DOCUMENT EXTRACTION (PDF, DOCX, XLSX, TXT)
   * Extra careful PDF parsing: Preserves structural lines, headers & paragraphs!
   * ==========================================================================
   */

  /**
   * PDF.js Extractor:
   * Sorts visual items top-to-bottom (Y) and left-to-right (X), groups tokens
   * on the same baseline, detects vertical line gaps to emit clean paragraph breaks
   * instead of collapsing the entire document into a single line.
   */
  async function parsePdfTextPreservingStructure(arrayBuffer) {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js library is not loaded. Please verify your internet connection.");
    }

    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageOutputs = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });
      const items = textContent.items;

      if (!items || items.length === 0) continue;

      // Filter non-empty items
      const validItems = items.filter((item) => item.str && item.str.trim().length > 0);
      if (validItems.length === 0) continue;

      // PDF coordinate space has Y=0 at the bottom.
      // Top of page has highest Y. Sort descending Y (top to bottom), then ascending X (left to right).
      validItems.sort((a, b) => {
        const yA = a.transform[5];
        const yB = b.transform[5];
        const xA = a.transform[4];
        const xB = b.transform[4];

        if (Math.abs(yA - yB) <= 3.5) {
          return xA - xB;
        }
        return yB - yA;
      });

      // Group items into horizontal lines
      const lines = [];
      let currentLine = [];
      let currentY = validItems[0].transform[5];
      let currentLineHeight = validItems[0].height || 12;

      validItems.forEach((item) => {
        const itemY = item.transform[5];
        const itemH = item.height || 12;

        if (Math.abs(itemY - currentY) <= 3.5) {
          currentLine.push(item);
          if (itemH > currentLineHeight) currentLineHeight = itemH;
        } else {
          if (currentLine.length > 0) {
            lines.push({
              y: currentY,
              height: currentLineHeight,
              items: currentLine
            });
          }
          currentLine = [item];
          currentY = itemY;
          currentLineHeight = itemH;
        }
      });

      if (currentLine.length > 0) {
        lines.push({
          y: currentY,
          height: currentLineHeight,
          items: currentLine
        });
      }

      // Reconstruct lines into clean structured paragraphs
      let pageText = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        line.items.sort((a, b) => a.transform[4] - b.transform[4]);

        let lineStr = "";
        for (let j = 0; j < line.items.length; j++) {
          const it = line.items[j];
          if (j > 0) {
            const prev = line.items[j - 1];
            const prevRight = prev.transform[4] + (prev.width || 0);
            const gap = it.transform[4] - prevRight;
            if (gap > 2) {
              lineStr += " ";
            }
          }
          lineStr += it.str;
        }

        lineStr = lineStr.trim();
        if (!lineStr) continue;

        pageText += lineStr;

        if (i < lines.length - 1) {
          const nextLine = lines[i + 1];
          const verticalGap = line.y - nextLine.y;
          const threshold = line.height * 1.45;

          // Double newline for paragraph breaks, single newline for line wrap
          if (verticalGap > threshold) {
            pageText += "\n\n";
          } else {
            pageText += "\n";
          }
        }
      }

      if (numPages > 1) {
        pageOutputs.push(`--- [Page ${pageNum} of ${numPages}] ---\n\n${pageText.trim()}`);
      } else {
        pageOutputs.push(pageText.trim());
      }
    }

    return pageOutputs.join("\n\n");
  }

  /**
   * Word (.docx) Extractor via Mammoth.js
   */
  async function parseDocxText(arrayBuffer) {
    if (!window.mammoth) {
      throw new Error("Mammoth.js library is not available.");
    }
    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value.trim();
  }

  /**
   * Excel (.xlsx, .xls, .csv) Extractor via SheetJS
   */
  async function parseExcelText(arrayBuffer) {
    if (!window.XLSX) {
      throw new Error("SheetJS (XLSX) library is not available.");
    }
    const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
    const sheetOutputs = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const textData = window.XLSX.utils.sheet_to_csv(worksheet, { FS: "\t", blankrows: false });
      if (textData && textData.trim()) {
        if (workbook.SheetNames.length > 1) {
          sheetOutputs.push(`=== Sheet: ${sheetName} ===\n\n${textData.trim()}`);
        } else {
          sheetOutputs.push(textData.trim());
        }
      }
    });

    return sheetOutputs.join("\n\n");
  }

  /**
   * Plain text / Markdown Extractor
   */
  function parsePlainText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file, "UTF-8");
    });
  }

  /**
   * Unified File Upload Dispatcher
   */
  async function handleFileUpload(file) {
    if (!file) return;

    const fileName = file.name;
    const ext = fileName.split(".").pop().toLowerCase();

    showFileLoadingState(fileName);

    try {
      let extractedText = "";

      if (ext === "pdf") {
        const buffer = await file.arrayBuffer();
        extractedText = await parsePdfTextPreservingStructure(buffer);
      } else if (ext === "docx" || ext === "doc") {
        const buffer = await file.arrayBuffer();
        extractedText = await parseDocxText(buffer);
      } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const buffer = await file.arrayBuffer();
        extractedText = await parseExcelText(buffer);
      } else {
        extractedText = await parsePlainText(file);
      }

      if (!extractedText.trim()) {
        throw new Error("No readable text could be extracted. The file may be an image-only scan or empty.");
      }

      const rawInput = document.getElementById("raw-input-text");
      if (rawInput) {
        rawInput.value = extractedText;
      }

      currentLoadedFileName = fileName;
      showFileSuccessState(fileName, file.size, extractedText.length);

      // Auto-trigger PII sanitize
      sanitizeText();
    } catch (err) {
      console.error("File extraction error:", err);
      showFileErrorState(err.message || "Failed to process file.");
    }
  }

  function showFileLoadingState(fileName) {
    const banner = document.getElementById("loaded-file-banner");
    const nameEl = document.getElementById("loaded-file-name");
    const metaEl = document.getElementById("loaded-file-meta");

    if (banner && nameEl && metaEl) {
      banner.classList.remove("hidden");
      nameEl.textContent = fileName;
      metaEl.textContent = "Extracting document structure & paragraphs in browser RAM...";
    }
  }

  function showFileSuccessState(fileName, fileSize, charCount, customBadge) {
    const banner = document.getElementById("loaded-file-banner");
    const nameEl = document.getElementById("loaded-file-name");
    const metaEl = document.getElementById("loaded-file-meta");

    if (banner && nameEl && metaEl) {
      banner.classList.remove("hidden");
      nameEl.textContent = fileName;
      const sizeKb = Math.round(fileSize / 1024) || 1;
      metaEl.textContent = customBadge || `✅ ${sizeKb} KB • ${charCount.toLocaleString()} Characters • Layout & Structure Preserved`;
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function showFileErrorState(errorMsg) {
    const banner = document.getElementById("loaded-file-banner");
    const nameEl = document.getElementById("loaded-file-name");
    const metaEl = document.getElementById("loaded-file-meta");

    if (banner && nameEl && metaEl) {
      banner.classList.remove("hidden");
      nameEl.textContent = "Error reading file";
      metaEl.textContent = `⚠️ ${errorMsg}`;
    }
  }

  function clearLoadedFile() {
    currentLoadedFileName = "";
    const banner = document.getElementById("loaded-file-banner");
    const fileInput = document.getElementById("document-file-input");
    const rawInput = document.getElementById("raw-input-text");

    if (banner) banner.classList.add("hidden");
    if (fileInput) fileInput.value = "";
    if (rawInput) rawInput.value = "";
  }

  /**
   * Setup Drag-and-Drop Listeners on file drop zone
   */
  function setupDragAndDrop() {
    const dropZone = document.getElementById("file-drop-zone");
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("border-indigo-500", "bg-indigo-50/60");
        },
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("border-indigo-500", "bg-indigo-50/60");
        },
        false
      );
    });

    dropZone.addEventListener(
      "drop",
      (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          handleFileUpload(files[0]);
        }
      },
      false
    );
  }

  /**
   * ==========================================================================
   * CORE PII DETECTION & TOKENIZATION ENGINE
   * ==========================================================================
   */
  function sanitizeText() {
    const inputEl = document.getElementById("raw-input-text");
    if (!inputEl) return;

    const rawText = inputEl.value;
    if (!rawText.trim()) {
      alert("Please enter text or upload a document first.");
      return;
    }

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

    function replaceEntity(value, tagPrefix, statKey) {
      const cleanVal = value.trim();
      if (!cleanVal || cleanVal.length < 2) return;

      let existingTag = Object.keys(newMap).find((k) => newMap[k].toLowerCase() === cleanVal.toLowerCase());
      if (!existingTag) {
        const count = Object.keys(newMap).filter((k) => k.startsWith(`[${tagPrefix}_`)).length + 1;
        existingTag = `[${tagPrefix}_${count}]`;
        newMap[existingTag] = cleanVal;
        stats[statKey]++;
      }

      const escaped = cleanVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      sanitized = sanitized.replace(regex, existingTag);
    }

    // 1. Custom Keywords
    const customInput = document.getElementById("custom-keywords-input");
    if (customInput && customInput.value.trim()) {
      const customs = customInput.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      customs.forEach((c) => {
        replaceEntity(c, "CUSTOM_ENTITY", "custom");
      });
    }

    // 2. Email Addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = rawText.match(emailRegex) || [];
    emails.forEach((email) => replaceEntity(email, "EMAIL", "emails"));

    // 3. Swiss AHV/AVS Numbers
    const ahvRegex = /\b756[.\s]\d{4}[.\s]\d{4}[.\s]\d{2}\b/g;
    const ahvs = rawText.match(ahvRegex) || [];
    ahvs.forEach((ahv) => replaceEntity(ahv, "SWISS_AHV", "ahv"));

    // 4. Swiss & International Phone Numbers
    const phoneRegex =
      /(?:\+41|0041|0)\s?(?:[1-9]\d{1})\s?(?:\d{3})\s?(?:\d{2})\s?(?:\d{2})|(?:\+41\s?[1-9]\d(?:\s?\d{3}){2})/g;
    const phones = rawText.match(phoneRegex) || [];
    phones.forEach((phone) => replaceEntity(phone, "PHONE", "phones"));

    // 5. Student & Matriculation IDs
    const studentIdRegex = /\b\d{2}-\d{3}-\d{3}\b|\b(?:Student ID|Matricul[ea]|Matrikelnummer)[\s:]*([A-Za-z0-9-]+)\b/gi;
    let match;
    while ((match = studentIdRegex.exec(rawText)) !== null) {
      const idVal = match[1] || match[0];
      replaceEntity(idVal, "STUDENT_ID", "studentIds");
    }

    // 6. Monetary Amounts & Budgets
    const amountRegex =
      /(?:CHF|EUR|USD|\$|€|£)\s?\d{1,3}(?:['.,\s]\d{3})*(?:\.\d{2})?|\d{1,3}(?:['.,\s]\d{3})*(?:\.\d{2})?\s?(?:CHF|EUR|USD|Fr\.)/gi;
    const amounts = rawText.match(amountRegex) || [];
    amounts.forEach((amt) => replaceEntity(amt, "AMOUNT", "amounts"));

    // 7. Academic Titles & Personal Names
    const nameWithTitleRegex =
      /(?:Prof\.|Professor|Dr\.|Doctor|Mr\.|Ms\.|Mrs\.|Monsieur|Madame|Herr|Frau)\s+(?:Dr\.\s+)?([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){1,3})/g;
    while ((match = nameWithTitleRegex.exec(rawText)) !== null) {
      const fullName = match[0].trim();
      replaceEntity(fullName, "PERSON", "names");
    }

    // Common greetings with names
    const greetingNameRegex =
      /(?:Dear|Chère?|Liebe[rn]?|Best regards,?\s+|Sincerely,?\s+)\s*([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){1,2})/g;
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
      outputEl.textContent = sanitized;
    }

    const totalDetected = Object.keys(sessionMap).length;
    if (statsBadge) {
      statsBadge.textContent = `${totalDetected} Items Masked in Session`;
    }

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

    const aiInput = document.getElementById("ai-response-input");
    if (aiInput && !aiInput.value.trim()) {
      aiInput.value = generateSimulatedAiResponse(sanitized);
    }

    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

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

Thank you for reaching out regarding your academic file and evaluation.

We have reviewed the official records for student ID ${studentId}. I am pleased to inform you that the submission has been officially approved. In addition, the requested allocation of ${amount} has been validated by the committee.

A formal notification has also been sent to your primary address at ${email}.

Please let me know if you require any additional documentation.

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
   * ==========================================================================
   * CORE DE-ANONYMIZATION & RESTORATION ENGINE
   * ==========================================================================
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
   * ==========================================================================
   * FILE DOWNLOAD HELPERS
   * ==========================================================================
   */
  function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadSanitizedFile() {
    const outputEl = document.getElementById("sanitized-output-text");
    if (!outputEl || !outputEl.textContent.trim()) {
      alert("Please mask text or upload a document first.");
      return;
    }

    const baseName = currentLoadedFileName
      ? currentLoadedFileName.replace(/\.[^/.]+$/, "")
      : "sanitized_prompt";
    const ext = currentLoadedFileName && currentLoadedFileName.endsWith(".csv") ? "csv" : "txt";
    downloadTextFile(outputEl.textContent, `${baseName}_MASKED.${ext}`);
  }

  function downloadRestoredFile() {
    const outputEl = document.getElementById("restored-output-text");
    if (!outputEl || !outputEl.textContent.trim()) {
      alert("Please restore text first.");
      return;
    }

    const baseName = currentLoadedFileName
      ? currentLoadedFileName.replace(/\.[^/.]+$/, "")
      : "restored_document";
    const ext = currentLoadedFileName && currentLoadedFileName.endsWith(".csv") ? "csv" : "txt";
    downloadTextFile(outputEl.textContent, `${baseName}_RESTORED.${ext}`);
  }

  /**
   * ==========================================================================
   * CLIPBOARD COPY HANDLERS
   * ==========================================================================
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
      clearLoadedFile();

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
    setupDragAndDrop();
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
    downloadSanitizedFile,
    downloadRestoredFile,
    handleFileUpload,
    clearLoadedFile,
    clearSession
  };
})();
