/**
 * ============================================================================
 * MODULAR VIEW RENDERERS & INTERACTIVE COMPONENTS (views.js)
 * Each of the 7 workshop modules is encapsulated in its own clean builder.
 * ============================================================================
 */

window.WorkshopViews = (function () {
  const cfg = window.WORKSHOP_CONFIG;

  // Helper: Escape HTML for safe code rendering
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Helper: Lightweight syntax highlighting for Prompts & Google Apps Script
  function highlightSyntax(rawCode, language) {
    let html = escapeHtml(rawCode);
    if (language === "javascript") {
      // Highlight ALL CAPS placeholders
      html = html.replace(
        /(PASTE_YOUR_FREE_GEMINI_API_KEY_HERE|EDIT THIS[^\n]*)/g,
        '<span class="bg-amber-400/25 text-amber-200 px-1.5 py-0.5 rounded font-bold border border-amber-400/40">$1</span>'
      );
      // Comments
      html = html.replace(
        /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
        '<span class="text-slate-400 italic">$1</span>'
      );
      // Keywords
      html = html.replace(
        /\b(const|let|var|function|return|if|try|catch|new|throw)\b/g,
        '<span class="text-indigo-300 font-semibold">$1</span>'
      );
      // Built-in GAS services
      html = html.replace(
        /\b(SpreadsheetApp|UrlFetchApp|ScriptApp|JSON|console)\b/g,
        '<span class="text-emerald-300 font-semibold">$1</span>'
      );
    } else {
      // Highlight bracket placeholders like [INSERT TRIGGER...]
      html = html.replace(
        /(\[[^\]]+\])/g,
        '<span class="bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-400/40">$1</span>'
      );
      // Highlight ALL CAPS words in instructions
      html = html.replace(
        /\b(ONLY|ALL CAPS|INSERT|PASTE)\b/g,
        '<span class="text-emerald-300 font-bold underline decoration-emerald-400/50">$1</span>'
      );
    }
    return html;
  }

  // ==========================================================================
  // SHARED COMPONENT 1: ONE-CLICK COPY PROMPT / CODE CARD
  // ==========================================================================
  function renderPromptCard(promptObj, extraActionLabel) {
    const badgeStyles = {
      indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
      emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
      amber: "bg-amber-500/20 text-amber-300 border-amber-400/30",
      purple: "bg-purple-500/20 text-purple-300 border-purple-400/30"
    };
    const badgeClass = badgeStyles[promptObj.badgeColor] || badgeStyles.indigo;
    const buttonLabel = extraActionLabel || "Copy to Clipboard";

    return `
      <div class="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all duration-200 hover:border-indigo-500/50 group">
        <!-- Card Header -->
        <div class="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeClass}">
                <i data-lucide="terminal" class="w-3.5 h-3.5"></i>
                ${escapeHtml(promptObj.badge)}
              </span>
              <h4 class="text-white font-display font-bold text-base sm:text-lg">
                ${escapeHtml(promptObj.title)}
              </h4>
            </div>
            <p class="text-slate-400 text-xs sm:text-sm projector-hide">
              ${escapeHtml(promptObj.subtitle)}
            </p>
          </div>

          <!-- Large Animated One-Click Copy Button -->
          <button
            type="button"
            onclick="window.WorkshopApp.copyPrompt('${promptObj.id}', this)"
            class="copy-trigger-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-display font-semibold text-sm border border-indigo-400/30 shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer shrink-0"
          >
            <i data-lucide="copy" class="w-4 h-4"></i>
            <span class="copy-btn-label">${escapeHtml(buttonLabel)}</span>
          </button>
        </div>

        <!-- Code / Prompt Body -->
        <div class="p-5 bg-slate-900/95 relative">
          <pre id="raw-${promptObj.id}" class="hidden">${escapeHtml(promptObj.content)}</pre>
          <pre class="prompt-code-pre code-scroll font-mono text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words overflow-x-auto max-h-[440px] select-all">${highlightSyntax(promptObj.content, promptObj.language)}</pre>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // SHARED COMPONENT 2: QUICK-LAUNCH EXTERNAL TOOL DOCK
  // ==========================================================================
  function renderToolDock(title, tools) {
    const colorMap = {
      indigo: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 border-indigo-500",
      emerald: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 border-emerald-500",
      slate: "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/15 border-slate-700",
      amber: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 border-amber-500",
      purple: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 border-purple-500",
      blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 border-blue-500"
    };

    const buttonsHtml = tools
      .map((t) => {
        const cls = colorMap[t.color] || colorMap.indigo;
        return `
          <a
            href="${t.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl font-display font-semibold text-sm border shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${cls}"
          >
            <i data-lucide="${t.icon}" class="w-4 h-4 shrink-0"></i>
            <span>${escapeHtml(t.label)}</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75 ml-0.5"></i>
          </a>
        `;
      })
      .join("");

    return `
      <div class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-indigo-600 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <i data-lucide="rocket" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-semibold block">Quick-Launch Tool Dock</span>
            <h3 class="font-display font-bold text-slate-900 text-base">${escapeHtml(title)}</h3>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // SHARED COMPONENT 3: MODULE INTERACTIVE CHECKLIST & VIEW FOOTER NAV
  // ==========================================================================
  function renderModuleChecklist(viewId) {
    const items = cfg.checklists[viewId] || [];
    if (!items.length) return "";

    const rowsHtml = items
      .map((item) => {
        const isChecked = window.WorkshopApp && window.WorkshopApp.isStepCompleted(item.id);
        return `
          <label
            for="chk-${item.id}"
            class="flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
              isChecked
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
            }"
          >
            <input
              id="chk-${item.id}"
              type="checkbox"
              ${isChecked ? "checked" : ""}
              onchange="window.WorkshopApp.toggleStep('${item.id}', this.checked)"
              class="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0 accent-emerald-600"
            />
            <div class="flex-1">
              <div class="font-display font-semibold text-sm sm:text-base flex items-center gap-2">
                <span class="${isChecked ? "line-through decoration-emerald-500/60 text-emerald-900" : ""}">
                  ${escapeHtml(item.title)}
                </span>
                ${
                  isChecked
                    ? '<span class="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white">Completed ✓</span>'
                    : ""
                }
              </div>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">${escapeHtml(item.detail)}</p>
            </div>
          </label>
        `;
      })
      .join("");

    return `
      <div class="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/90 mt-8">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i data-lucide="check-square" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="font-display font-bold text-slate-900 text-base">Module Action Checklist</h3>
              <p class="text-xs text-slate-500 projector-hide">Check off completed steps to update your live Workshop Progress Bar</p>
            </div>
          </div>
          <span class="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            +XP Progress
          </span>
        </div>
        <div class="space-y-2.5">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  function renderViewPagination(currentIndex) {
    const prevMod = currentIndex > 0 ? cfg.modules[currentIndex - 1] : null;
    const nextMod = currentIndex < cfg.modules.length - 1 ? cfg.modules[currentIndex + 1] : null;

    return `
      <div class="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        ${
          prevMod
            ? `<button
                type="button"
                onclick="window.WorkshopApp.switchView('${prevMod.id}')"
                class="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-display font-semibold text-sm shadow-sm transition-all cursor-pointer"
              >
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                <span>Prev: ${escapeHtml(prevMod.number)}. ${escapeHtml(prevMod.shortTitle)}</span>
              </button>`
            : `<div></div>`
        }
        ${
          nextMod
            ? `<button
                type="button"
                onclick="window.WorkshopApp.switchView('${nextMod.id}')"
                class="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Next Module: ${escapeHtml(nextMod.number)}. ${escapeHtml(nextMod.shortTitle)}</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>`
            : `<button
                type="button"
                onclick="window.WorkshopApp.triggerCelebration()"
                class="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <i data-lucide="party-popper" class="w-4 h-4"></i>
                <span>Celebrate Workshop Completion!</span>
              </button>`
        }
      </div>
    `;
  }

  function getModuleMeta(viewId) {
    return (
      (cfg.modules && cfg.modules.find((m) => m.id === viewId)) || {
        id: viewId,
        number: "01",
        shortTitle: "",
        fullTitle: "",
        timeSlot: "",
        icon: "sparkles",
        badge: ""
      }
    );
  }

  // ==========================================================================
  // VIEW 1: 01. WELCOME & THE AGENTIC SHIFT (08:15 – 09:00)
  // ==========================================================================
  function renderView1() {
    const mod1 = getModuleMeta("view-1");
    const mod2 = getModuleMeta("view-2");
    const mod4 = getModuleMeta("view-4");

    const titleParts = (cfg.meta.title || "").split(":");
    const mainTitleHtml =
      titleParts.length > 1
        ? `${escapeHtml(titleParts[0])}: <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-300">${escapeHtml(
            titleParts.slice(1).join(":").trim()
          )}</span>`
        : escapeHtml(cfg.meta.title);

    const scheduleCardsHtml = cfg.schedule
      .map((slot, idx) => {
        const isBreak = slot.type === "break";
        const isFinale = slot.type === "finale";
        const badgeStyle = isBreak
          ? "bg-amber-100 text-amber-800 border-amber-300"
          : isFinale
          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
          : "bg-indigo-50 text-indigo-700 border-indigo-200";

        return `
          <div class="glass-card glass-card-interactive rounded-2xl p-4 sm:p-5 border ${
            isBreak ? "border-amber-200/90 bg-amber-50/40" : "border-slate-200/90"
          } flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2.5">
                <span class="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle}">
                  <i data-lucide="${escapeHtml(slot.icon || "clock")}" class="w-3.5 h-3.5"></i>
                  <span>${escapeHtml(slot.time)}</span>
                </span>
                <button
                  type="button"
                  onclick="window.WorkshopApp.switchView('${slot.targetView}')"
                  class="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Jump</span>
                  <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </button>
              </div>
              <h4 class="font-display font-bold text-slate-900 text-base mb-1.5">
                ${escapeHtml(slot.title)}
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ${escapeHtml(slot.description)}
              </p>
            </div>
            ${
              slot.interactivePrompt
                ? `
                <div class="mt-3 pt-3 border-t border-amber-200/80 bg-white/80 rounded-xl p-3">
                  <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider mb-1">
                    <i data-lucide="sticky-note" class="w-3.5 h-3.5"></i>
                    <span>Physical Sticky-Note Prompt (Coffee Station):</span>
                  </div>
                  <p class="text-xs text-slate-700 italic">"${escapeHtml(slot.interactivePrompt)}"</p>
                </div>
              `
                : ""
            }
          </div>
        `;
      })
      .join("");

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Hero Banner (Connected to config.js meta, modules & links) -->
        <div class="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
          <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 max-w-4xl space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-wider text-indigo-200">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${escapeHtml(cfg.meta.initiative)} • ${escapeHtml(cfg.meta.duration)}</span>
              </div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs font-mono text-emerald-300">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                <span>${escapeHtml(cfg.meta.location)}</span>
              </div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-mono text-indigo-200">
                <span>${escapeHtml(mod1.fullTitle)} (${escapeHtml(mod1.timeSlot)})</span>
              </div>
            </div>

            <h1 class="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              ${mainTitleHtml}
            </h1>

            <p class="text-lg sm:text-xl text-slate-200 font-display font-medium">
              ${escapeHtml(cfg.meta.subtitle)}
            </p>

            <p class="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Welcome to your interactive Automation Command Center. Today, you will learn how to escape <em>"work for the sake of work"</em> by turning LLMs into senior software architects that build zero-code flows across <strong>Microsoft Power Automate</strong> and <strong>Google Apps Script</strong>—bypassing premium paywalls via <strong>The Spreadsheet Bridge</strong>.
            </p>

            <div class="pt-2 space-y-3">
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onclick="window.WorkshopApp.switchView('view-2')"
                  class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <i data-lucide="${escapeHtml(mod2.icon)}" class="w-4 h-4"></i>
                  <span>Launch ${escapeHtml(mod2.shortTitle)} (${escapeHtml(mod2.number)})</span>
                </button>
                <button
                  type="button"
                  onclick="window.WorkshopApp.switchView('view-4')"
                  class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-display font-semibold text-sm transition-all cursor-pointer"
                >
                  <i data-lucide="${escapeHtml(mod4.icon)}" class="w-4 h-4 text-emerald-400"></i>
                  <span>Preview ${escapeHtml(mod4.shortTitle)} (${escapeHtml(mod4.number)})</span>
                </button>
              </div>

              <!-- Instructor Presentation & Quick Links Bar -->
              <div class="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                <span class="text-xs font-mono uppercase tracking-wider text-slate-400 mr-1">
                  Instructor &amp; Resources:
                </span>
                <a
                  href="${cfg.links.githubProfile}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-display font-semibold text-xs sm:text-sm transition-all"
                >
                  <i data-lucide="globe" class="w-4 h-4 text-amber-400"></i>
                  <span>Instructor Portfolio</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
                </a>
                <a
                  href="${cfg.links.linkedin}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-display font-semibold text-xs sm:text-sm transition-all"
                >
                  <i data-lucide="linkedin" class="w-4 h-4 text-indigo-300"></i>
                  <span>LinkedIn</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
                </a>
                <a
                  href="${cfg.links.githubRepo}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-display font-semibold text-xs sm:text-sm transition-all"
                >
                  <i data-lucide="git-branch" class="w-4 h-4 text-emerald-300"></i>
                  <span>Workshop Repo</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
                </a>
                ${
                  cfg.links.consultancyCalendar
                    ? `<a
                        href="${cfg.links.consultancyCalendar}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-display font-semibold text-xs sm:text-sm transition-all"
                      >
                        <i data-lucide="calendar" class="w-4 h-4 text-emerald-300"></i>
                        <span>Book a Meeting</span>
                        <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
                      </a>`
                    : ""
                }
                <a
                  href="${cfg.links.email}"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-display font-semibold text-xs sm:text-sm transition-all"
                >
                  <i data-lucide="mail" class="w-4 h-4 text-slate-300"></i>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Concept Switcher (3 Tabs) -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">Core Paradigm Shift</span>
              <h2 class="font-display font-bold text-xl sm:text-2xl text-slate-900">
                Interactive Concept Switcher: The 3 Eras of Workplace AI
              </h2>
            </div>
            <span class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              Click each tab to compare architectures
            </span>
          </div>

          <!-- 3 Tab Buttons -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6" role="tablist">
            <button
              type="button"
              onclick="window.WorkshopApp.switchConceptTab('tab-intern')"
              id="btn-tab-intern"
              class="concept-tab-btn text-left p-4 rounded-xl border-2 transition-all cursor-pointer bg-slate-50 border-slate-200 hover:border-indigo-300"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-xs font-bold uppercase text-slate-500">Tab A • Level 1</span>
                <i data-lucide="message-square" class="w-4 h-4 text-slate-500"></i>
              </div>
              <div class="font-display font-bold text-slate-900 text-base">Generative AI (The Intern)</div>
              <p class="text-xs text-slate-500 mt-1">You remain the human copy-paste middleware.</p>
            </button>

            <button
              type="button"
              onclick="window.WorkshopApp.switchConceptTab('tab-train')"
              id="btn-tab-train"
              class="concept-tab-btn text-left p-4 rounded-xl border-2 transition-all cursor-pointer bg-slate-50 border-slate-200 hover:border-indigo-300"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-xs font-bold uppercase text-blue-600">Tab B • Level 2</span>
                <i data-lucide="train-track" class="w-4 h-4 text-blue-600"></i>
              </div>
              <div class="font-display font-bold text-slate-900 text-base">Deterministic Automation (The Train Track)</div>
              <p class="text-xs text-slate-500 mt-1">Rigid If-This-Then-That rules without reasoning.</p>
            </button>

            <button
              type="button"
              onclick="window.WorkshopApp.switchConceptTab('tab-agentic')"
              id="btn-tab-agentic"
              class="concept-tab-btn text-left p-4 rounded-xl border-2 transition-all cursor-pointer bg-indigo-50/80 border-indigo-600 shadow-md"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-xs font-bold uppercase text-emerald-600">Tab C • Level 3 ★</span>
                <i data-lucide="sparkles" class="w-4 h-4 text-emerald-600"></i>
              </div>
              <div class="font-display font-bold text-slate-900 text-base">Agentic Workflows (The Unfair Advantage)</div>
              <p class="text-xs text-slate-600 mt-1">Triggers + LLM Brain + Autonomous Execution.</p>
            </button>
          </div>

          <!-- Tab Content Panels -->
          <div id="panel-tab-intern" class="concept-tab-panel hidden rounded-2xl bg-slate-50 border border-slate-200 p-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div class="lg:col-span-7 space-y-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
                  Manual Bottleneck • 95% of Users Stop Here
                </span>
                <h3 class="font-display font-bold text-xl text-slate-900">
                  Tab A: Generative AI (The Intern)
                </h3>
                <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                  <strong>You ask it to write an email; you still do the copy-pasting.</strong> Every time a student or colleague sends a request, you manually open Outlook, copy the text, switch tabs to ChatGPT/Claude, type a prompt, copy the reply, switch back to Outlook, and paste it.
                </p>
                <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                  <strong>Why it fails at scale:</strong> The AI is smart, but <em>you</em> are still acting as the biological API cable between your inbox, spreadsheets, and documents.
                </div>
              </div>
              <div class="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-inner">
                <div class="text-xs font-mono text-slate-400 uppercase mb-3 text-center">Architecture: Human-in-the-Middle</div>
                <div class="flex items-center justify-between gap-2 text-center text-xs font-semibold">
                  <div class="p-3 rounded-lg bg-slate-100 border border-slate-300 flex-1">📧 Inbox</div>
                  <div class="text-rose-500 font-mono">── You Copy ──▶</div>
                  <div class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex-1">🤖 Chatbot</div>
                  <div class="text-rose-500 font-mono">── You Paste ──▶</div>
                  <div class="p-3 rounded-lg bg-slate-100 border border-slate-300 flex-1">📊 Sheet</div>
                </div>
              </div>
            </div>
          </div>

          <div id="panel-tab-train" class="concept-tab-panel hidden rounded-2xl bg-blue-50/50 border border-blue-200 p-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div class="lg:col-span-7 space-y-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  Rigid Rules • Classic IT Automation
                </span>
                <h3 class="font-display font-bold text-xl text-slate-900">
                  Tab B: Deterministic Automation (The Train Track)
                </h3>
                <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                  <strong>Rigid <code>If This Then That</code> rules in Power Automate. Great, until someone formats an email weirdly.</strong> Traditional flows move data automatically on fixed rails, but they have zero reading comprehension.
                </p>
                <div class="p-3.5 rounded-xl bg-blue-100/70 border border-blue-300 text-blue-950 text-xs sm:text-sm">
                  <strong>Why it breaks:</strong> If a rule checks for <code>Subject contains "Thesis"</code> and a student writes <em>"Masterarbeit Supervision Question"</em> in French or German, the train misses the station completely.
                </div>
              </div>
              <div class="lg:col-span-5 bg-white p-5 rounded-xl border border-blue-200 shadow-inner">
                <div class="text-xs font-mono text-blue-500 uppercase mb-3 text-center">Architecture: Blind Rule Engine</div>
                <div class="flex items-center justify-between gap-2 text-center text-xs font-semibold">
                  <div class="p-3 rounded-lg bg-blue-50 border border-blue-200 flex-1">⚡ Trigger</div>
                  <div class="text-blue-500 font-mono">── Exact Match? ──▶</div>
                  <div class="p-3 rounded-lg bg-amber-50 border border-amber-300 flex-1">❓ Rigid If/Else</div>
                  <div class="text-blue-500 font-mono">──▶</div>
                  <div class="p-3 rounded-lg bg-slate-100 border border-slate-300 flex-1">📁 Move File</div>
                </div>
              </div>
            </div>
          </div>

          <div id="panel-tab-agentic" class="concept-tab-panel rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/80 border-2 border-indigo-500/40 p-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div class="lg:col-span-7 space-y-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
                  ★ Today's Mission • Autonomous Intelligence
                </span>
                <h3 class="font-display font-bold text-xl text-slate-900">
                  Tab C: Agentic Workflows (The Unfair Advantage)
                </h3>
                <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                  <strong>Combining deterministic triggers with an LLM brain to read, decide, and execute autonomously.</strong> Event triggers capture emails, forms, or files automatically; an embedded LLM brain reads unstructured human text in any language, classifies intent, extracts structured JSON, and triggers downstream actions while you sleep.
                </p>
                <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm">
                  <strong>Your Unfair Advantage:</strong> You don't write the code by hand—you use LLMs to architect the flow AND act as the reasoning engine inside the flow!
                </div>
              </div>
              <div class="lg:col-span-5 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xl">
                <div class="text-xs font-mono text-emerald-400 uppercase mb-3 text-center">Architecture: Trigger + Brain + Action</div>
                <div class="flex items-center justify-between gap-2 text-center text-xs font-semibold">
                  <div class="p-3 rounded-lg bg-slate-800 border border-slate-700 flex-1">⚡ Event Trigger</div>
                  <div class="text-emerald-400 font-mono">──▶</div>
                  <div class="p-3 rounded-lg bg-indigo-600/40 border border-indigo-400 flex-1 emerald-pulse">🧠 LLM Brain</div>
                  <div class="text-emerald-400 font-mono">──▶</div>
                  <div class="p-3 rounded-lg bg-emerald-600/30 border border-emerald-400 flex-1">🚀 Auto-Execute</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Schedule Timeline -->
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">Morning Blueprint • ${escapeHtml(cfg.meta.location)}</span>
              <h2 class="font-display font-bold text-xl sm:text-2xl text-slate-900">
                Interactive Workshop Schedule (${escapeHtml(cfg.meta.duration)})
              </h2>
            </div>
            <span class="text-xs font-mono text-slate-500">Click any session card to jump directly to its module</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${scheduleCardsHtml}
          </div>
        </div>

        <!-- ==================================================================
             SWISS DATA PROTECTION (nDSG / revFADP) & DATA SOVEREIGNTY
             ================================================================== -->
        <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/30 space-y-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div class="flex items-start sm:items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-red-600 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
                +
              </div>
              <div>
                <div class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                  <span>Swiss Data Protection (nDSG / revFADP)</span>
                </div>
                <h2 class="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight">
                  The Safe Sandbox: Knowing Where Your Data Lives
                </h2>
                <p class="text-xs sm:text-sm text-slate-600 mt-1">
                  Understanding institutional boundaries vs. public consumer AI tiers under Swiss federal privacy laws.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="${cfg.links.anonymizerTool || './anonymizer.html'}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
              >
                <i data-lucide="shield" class="w-4 h-4 text-emerald-300"></i>
                <span>Open Safe PII Anonymizer Page</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
              </a>
              <a
                href="${cfg.links.notebookLM}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0"
              >
                <i data-lucide="lock" class="w-4 h-4"></i>
                <span>Open Safe Research Vault (NotebookLM)</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-75"></i>
              </a>
            </div>
          </div>

          <!-- The Safe Sandbox: Platform Training & Privacy Policy Table -->
          <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div class="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <i data-lucide="table" class="w-4 h-4 text-indigo-600"></i>
                <span>Platform Governance &amp; Training Policy Matrix</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                Institutional vs Consumer Tiers
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 font-display font-bold text-xs bg-slate-50/50">
                    <th class="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Platform</th>
                    <th class="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Access Tier</th>
                    <th class="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Model Training Policy</th>
                    <th class="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Approved Workshop Use Case</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-display font-bold text-slate-900 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <i data-lucide="mail" class="w-4 h-4"></i>
                      </div>
                      <span>M365 Copilot &amp; Power Automate</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">UniFR Enterprise License</td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Zero training (Tenant isolated)</span>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">Internal emails, calendar, institutional workflows</td>
                  </tr>

                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-display font-bold text-slate-900 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <i data-lucide="book-open" class="w-4 h-4"></i>
                      </div>
                      <span>Google NotebookLM</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">Free Consumer Account</td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Zero training on uploaded sources</span>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">Literature synthesis, Apps Script code generation</td>
                  </tr>

                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3.5 px-4 font-display font-bold text-slate-900 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <i data-lucide="palette" class="w-4 h-4"></i>
                      </div>
                      <span>Adobe Express &amp; Firefly</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">UniFR Premium Access</td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Commercially safe Stock training</span>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">Automated certificates, visual academic assets</td>
                  </tr>

                  <tr class="bg-amber-50/60 hover:bg-amber-50 transition-colors">
                    <td class="py-3.5 px-4 font-display font-bold text-amber-950 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                      </div>
                      <span>Public Free Chatbots</span>
                    </td>
                    <td class="py-3.5 px-4 text-amber-900">Consumer Web Tier</td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        <span>Trains on inputs by default</span>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-amber-900">
                      Anonymized logic only — never paste raw PII
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3 Institutional Pillars -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Pillar 1 -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center gap-2 text-indigo-600 font-display font-bold text-sm sm:text-base">
                <i data-lucide="building-2" class="w-4 h-4 shrink-0"></i>
                <span>1. M365 Swiss Tenant Boundaries</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                When signed into your <strong>@unifr.ch</strong> Microsoft 365 account (Outlook, SharePoint, OneDrive, Teams, M365 Copilot with Commercial Data Protection), your data stays governed by institutional tenant agreements and Swiss <strong>nDSG / revFADP</strong> compliance.
              </p>
            </div>

            <!-- Pillar 2 -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center gap-2 text-amber-600 font-display font-bold text-sm sm:text-base">
                <i data-lucide="user-x" class="w-4 h-4 shrink-0"></i>
                <span>2. The Anonymization Golden Rule</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Before sending student evaluations, clinical notes, or unpublished peer reviews across an external bridge or free LLM, strip PII (Names, Matriculation IDs, Grades). Pass <code>[PERSON_1]</code> or <code>[STUDENT_ID_042]</code> instead of real names.
              </p>
            </div>

            <!-- Pillar 3 -->
            <div class="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-2">
              <div class="flex items-center gap-2 text-emerald-700 font-display font-bold text-sm sm:text-base">
                <i data-lucide="book-lock" class="w-4 h-4 shrink-0"></i>
                <span>3. Google NotebookLM's Zero-Training SLA</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Under Google's NotebookLM SLA, your uploaded PDFs, grant drafts, and source documents are <strong>never used to train foundation models</strong> and remain strictly isolated to your private notebook.
              </p>
            </div>
          </div>

          <!-- Interactive Swiss-Safe PII Anonymizer Feature Card -->
          <div class="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-400/30 shadow-xl space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span class="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    Interactive Workshop Tool • Row 4 Protection
                  </span>
                </div>
                <h3 class="font-display font-bold text-lg sm:text-xl text-white">
                  Swiss-Safe PII Anonymizer &amp; De-Masking Vault
                </h3>
                <p class="text-xs text-slate-300 max-w-2xl">
                  Using free ChatGPT, Claude, or Gemini? Automatically detect and replace names, Swiss phone numbers, emails, and student IDs with reversible tags. The key map stays <strong>strictly in browser session memory</strong>. Paste the AI's response back to restore the original details.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="${cfg.links.anonymizerTool || './anonymizer.html'}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                  <span>Launch Dedicated Anonymizer Tab</span>
                </a>
              </div>
            </div>

            <!-- In-Page Quick Test Console -->
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-mono text-indigo-200">
                  Quick Live Demo (Test right here on the projector):
                </span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick="if (window.AnonymizerApp) window.AnonymizerApp.loadPreset('student')"
                    class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 cursor-pointer"
                  >
                    Load Student Sample
                  </button>
                  <button
                    type="button"
                    onclick="if (window.AnonymizerApp) window.AnonymizerApp.loadPreset('grant')"
                    class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 cursor-pointer"
                  >
                    Load Grant Sample
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Step 1: Input & Mask -->
                <div class="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/10">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="text-xs font-mono font-bold text-indigo-300">1. Confidential Text or File:</span>
                    <div class="flex items-center gap-2">
                      <label class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 border border-white/15" title="Load PDF, Word (.docx), or Excel (.xlsx)">
                        <i data-lucide="upload" class="w-3 h-3 text-indigo-300"></i>
                        <span>Load File</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
                          class="hidden"
                          onchange="if (window.AnonymizerApp) window.AnonymizerApp.handleFileUpload(this.files[0])"
                        />
                      </label>
                      <button
                        type="button"
                        onclick="if (window.AnonymizerApp) window.AnonymizerApp.sanitizeText()"
                        class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs shadow cursor-pointer inline-flex items-center gap-1"
                      >
                        <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                        <span>Mask PII</span>
                      </button>
                    </div>
                  </div>

                  <!-- Loaded file indicator banner if file parsed -->
                  <div id="loaded-file-banner" class="hidden p-2 rounded-lg bg-indigo-900/60 border border-indigo-500/40 text-[11px] font-mono text-indigo-200 flex items-center justify-between gap-2">
                    <div class="truncate">
                      <span id="loaded-file-name" class="font-bold text-white truncate">document.pdf</span>
                      <span id="loaded-file-meta" class="text-indigo-300 text-[10px] block truncate">Parsed with layout preserved</span>
                    </div>
                    <button type="button" onclick="if (window.AnonymizerApp) window.AnonymizerApp.clearLoadedFile()" class="text-[10px] text-rose-300 hover:text-rose-100 underline shrink-0 cursor-pointer">Remove</button>
                  </div>

                  <textarea
                    id="raw-input-text"
                    rows="4"
                    placeholder="Upload a PDF/Word/Excel file or paste confidential student inquiry, grade, or email..."
                    class="w-full p-3 rounded-lg border border-slate-700 bg-slate-900 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-400"
                  ></textarea>

                  <div id="sanitized-result-container" class="hidden space-y-2 pt-2 border-t border-white/10">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-mono text-emerald-400 font-bold">Sanitized (Send to ChatGPT):</span>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          onclick="if (window.AnonymizerApp) window.AnonymizerApp.copySanitizedText(this)"
                          class="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <i data-lucide="copy" class="w-3 h-3"></i>
                          <span class="copy-btn-label">Copy</span>
                        </button>
                        <button
                          type="button"
                          onclick="if (window.AnonymizerApp) window.AnonymizerApp.downloadSanitizedFile()"
                          class="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 border border-slate-700"
                          title="Download sanitized file"
                        >
                          <i data-lucide="download" class="w-3 h-3 text-emerald-400"></i>
                          <span>File</span>
                        </button>
                      </div>
                    </div>
                    <div
                      id="sanitized-output-text"
                      class="p-2.5 rounded-lg bg-slate-900 text-[11px] font-mono text-emerald-200 border border-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto select-all"
                    ></div>
                    <div id="detected-pills-list" class="flex flex-wrap gap-1"></div>
                  </div>
                </div>

                <!-- Step 2: Response & Restore -->
                <div class="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/10">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-emerald-300">2. AI Response (with [TAGS]):</span>
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        onclick="if (window.AnonymizerApp) window.AnonymizerApp.loadSimulatedAiResponse()"
                        class="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] cursor-pointer"
                        title="Simulate ChatGPT output"
                      >
                        Simulate AI
                      </button>
                      <button
                        type="button"
                        onclick="if (window.AnonymizerApp) window.AnonymizerApp.restoreText()"
                        class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs shadow cursor-pointer inline-flex items-center gap-1"
                      >
                        <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="ai-response-input"
                    rows="4"
                    placeholder="Paste AI response containing [PERSON_1], [STUDENT_ID_1]..."
                    class="w-full p-3 rounded-lg border border-slate-700 bg-slate-900 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                  ></textarea>

                  <div id="restored-result-container" class="hidden space-y-2 pt-2 border-t border-white/10">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-mono text-emerald-300 font-bold">Restored Original Details:</span>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          onclick="if (window.AnonymizerApp) window.AnonymizerApp.copyRestoredText(this)"
                          class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 border border-slate-600"
                        >
                          <i data-lucide="copy" class="w-3 h-3"></i>
                          <span class="copy-btn-label">Copy</span>
                        </button>
                        <button
                          type="button"
                          onclick="if (window.AnonymizerApp) window.AnonymizerApp.downloadRestoredFile()"
                          class="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                          title="Download restored document"
                        >
                          <i data-lucide="download" class="w-3 h-3"></i>
                          <span>File</span>
                        </button>
                      </div>
                    </div>
                    <div
                      id="restored-output-text"
                      class="p-2.5 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-100 border border-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto select-all"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${renderModuleChecklist("view-1")}
        ${renderViewPagination(0)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 2: 02. THE META-PROMPTING ENGINE (09:00 – 09:30)
  // ==========================================================================
  function renderView2() {
    const mod = getModuleMeta("view-2");
    const dockTools = [
      { label: "Launch M365 Copilot", url: cfg.links.m365Copilot, icon: "shield", color: "indigo" },
      { label: "Launch Google NotebookLM", url: cfg.links.notebookLM, icon: "book-open", color: "emerald" },
      { label: "Launch Google Gemini", url: cfg.links.gemini, icon: "sparkles", color: "blue" },
      { label: "Launch Claude", url: cfg.links.claude, icon: "bot", color: "slate" },
      { label: "Launch ChatGPT", url: cfg.links.chatgpt, icon: "message-square", color: "purple" }
    ];

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Module Header -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="space-y-2 max-w-3xl">
              <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
                <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)}</span>
                <span>•</span>
                <span>${escapeHtml(mod.badge)}</span>
              </div>
              <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                ${escapeHtml(mod.fullTitle)}
              </h1>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                <strong>Core Lesson:</strong> You don't need to know how to code; you need to know how to turn an LLM into a <strong>Senior Automation Architect</strong>. Instead of asking an AI to do a single task, we prompt the AI to write the exact blueprint, formulas, and scripts that automate the task forever.
              </p>
            </div>

            <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 max-w-xs">
              <div class="font-display font-bold text-indigo-700 flex items-center gap-1.5 mb-1">
                <i data-lucide="lightbulb" class="w-4 h-4"></i>
                <span>The 3-Part Meta-Prompt Formula</span>
              </div>
              <ol class="list-decimal list-inside space-y-1 text-slate-700 text-xs">
                <li><strong>Role & License Constraint</strong> (No Premium!)</li>
                <li><strong>Trigger + Desired Outcome</strong></li>
                <li><strong>Non-Coder Output Format</strong> (ALL CAPS edits)</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Quick-Launch Tool Dock -->
        ${renderToolDock("Open Your AI Architect Engine in a Side Tab", dockTools)}

        <!-- 3 Copy-Paste Prompt Cards -->
        <div class="space-y-6">
          ${renderPromptCard(cfg.prompts.powerAutomateArchitect)}
          ${renderPromptCard(cfg.prompts.gasZeroCodeGenerator)}
          ${renderPromptCard(cfg.prompts.selfHealingDebugger)}
        </div>

        ${renderModuleChecklist("view-2")}
        ${renderViewPagination(1)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 3: 03. SANDBOX 1: M365 & POWER AUTOMATE (09:50 – 10:20)
  // ==========================================================================
  function renderView3() {
    const mod = getModuleMeta("view-3");
    const dockTools = [
      { label: "Open Power Automate", url: cfg.links.powerAutomate, icon: "zap", color: "indigo" },
      { label: "Launch M365 Copilot", url: cfg.links.m365Copilot, icon: "bot", color: "slate" }
    ];

    const greenConnectors = [
      { name: "Outlook 365", desc: "Trigger on new emails, calendar invites, flag items, send auto-replies", icon: "mail" },
      { name: "Microsoft Teams", desc: "Post adaptive cards, message channels, notify research groups", icon: "message-circle" },
      { name: "SharePoint", desc: "Create list items, archive PDFs, manage department folders", icon: "folder-kanban" },
      { name: "OneDrive for Business", desc: "Convert files, save email attachments automatically", icon: "cloud" },
      { name: "Microsoft Forms", desc: "Capture student registrations, survey responses & graduation data", icon: "clipboard-list" },
      { name: "Microsoft Planner", desc: "Auto-create tasks from flagged emails or meeting notes", icon: "kanban" },
      { name: "Google Sheets ★", desc: "FREE Standard Connector! Insert rows directly into Google Workspace", icon: "table" }
    ];

    const redConnectors = [
      { name: "Custom HTTP Requests", desc: "Paywalled (Premium Diamond Icon) — Blocks direct external REST/API webhooks", icon: "globe-lock" },
      { name: "Built-in AI Builder Blocks", desc: "Paywalled AI credits required after trial expires", icon: "lock" },
      { name: "SQL Server / External Enterprise APIs", desc: "Requires per-user or per-flow Power Automate Premium license", icon: "database" }
    ];

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Module Header -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="space-y-2 max-w-3xl">
            <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
              <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)}</span>
              <span>•</span>
              <span>${escapeHtml(mod.badge)}</span>
            </div>
            <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              ${escapeHtml(mod.fullTitle)}
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              <strong>Core Lesson:</strong> Mastering Standard Connectors without hitting the Microsoft Premium Paywall. Look closely at the connector list below—notice which surprise guest is sitting inside the <strong>Green Light (Free Standard)</strong> column!
            </p>
          </div>
        </div>

        <!-- Quick-Launch Button -->
        ${renderToolDock("Launch Microsoft Power Automate (Sign in with @unifr.ch)", dockTools)}

        <!-- Interactive Visual Graphic: Green Light vs Red Light Comparison Matrix -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Green Light Column -->
          <div class="lg:col-span-7 glass-card rounded-2xl p-6 border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-white">
            <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-200">
              <div class="flex items-center gap-2.5">
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 emerald-pulse"></span>
                <h2 class="font-display font-bold text-lg sm:text-xl text-emerald-950">
                  🟢 Green Light: Free Standard Connectors
                </h2>
              </div>
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                Included in UniFR License
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${greenConnectors
                .map(
                  (c) => `
                  <div class="p-3.5 rounded-xl border ${
                    c.name.includes("Google Sheets")
                      ? "bg-emerald-100/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200"
                  } flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg ${
                      c.name.includes("Google Sheets")
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-600"
                    } flex items-center justify-center shrink-0 mt-0.5">
                      <i data-lucide="${c.icon}" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <div class="font-display font-bold text-sm text-slate-900">${escapeHtml(c.name)}</div>
                      <p class="text-xs text-slate-600 mt-0.5 leading-snug">${escapeHtml(c.desc)}</p>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>

          <!-- Red Light Column -->
          <div class="lg:col-span-5 glass-card rounded-2xl p-6 border-2 border-rose-300 bg-gradient-to-b from-rose-50/50 to-white flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-rose-200">
                <div class="flex items-center gap-2.5">
                  <span class="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                  <h2 class="font-display font-bold text-lg sm:text-xl text-rose-950">
                    🔴 Red Light: Paywalled Premium
                  </h2>
                </div>
                <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  💎 Extra License Required
                </span>
              </div>

              <div class="space-y-3">
                ${redConnectors
                  .map(
                    (c) => `
                    <div class="p-3.5 rounded-xl bg-white/90 border border-rose-200 flex items-start gap-3 opacity-90">
                      <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <i data-lucide="${c.icon}" class="w-4 h-4"></i>
                      </div>
                      <div>
                        <div class="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>${escapeHtml(c.name)}</span>
                          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">PREMIUM</span>
                        </div>
                        <p class="text-xs text-slate-600 mt-0.5 leading-snug">${escapeHtml(c.desc)}</p>
                      </div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <div class="mt-5 p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
              <div class="text-xs font-mono text-emerald-400 uppercase font-bold mb-1">💡 The Loophole Discovery:</div>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Microsoft blocks direct HTTP API calls unless you pay for Premium—<strong>but they left the Google Sheets connector 100% FREE!</strong> In Module 04, we use Google Sheets as our Trojan Horse to unlock unlimited free Gemini AI calls.
              </p>
            </div>
          </div>
        </div>

        <!-- Step-by-Step Interactive Walkthrough (Build 1: Smart Inbox & Calendar Triage) -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <div>
            <span class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">Hands-On Blueprint</span>
            <h2 class="font-display font-bold text-xl sm:text-2xl text-slate-900">
              Build 1: The Smart Inbox & Calendar Triage Flow
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span class="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white">STEP 1</span>
              <h4 class="font-display font-bold text-slate-900 text-base">Create Automated Cloud Flow</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Open <strong>Power Automate</strong> → Click <strong>+ Create</strong> in the left menu → Select <strong>Automated cloud flow</strong>. Name it <code>UniFR Smart Triage</code>.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span class="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white">STEP 2</span>
              <h4 class="font-display font-bold text-slate-900 text-base">Choose Your M365 Trigger</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Search for <strong>Office 365 Outlook</strong> and choose either <code>When a new email arrives (V3)</code> or <code>When an event is added, updated or deleted</code>.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <span class="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white">STEP 3</span>
              <h4 class="font-display font-bold text-slate-900 text-base">Add Trigger Condition Filter</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Click the Trigger node → <strong>Settings (⚙️)</strong> → Scroll to <strong>Trigger Conditions</strong> → Click <strong>+ Add</strong> and paste the expression below so it only fires on <code>[URGENT]</code> or <code>[THESIS]</code>.
              </p>
            </div>

            <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span class="inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-600 text-white">STEP 4</span>
              <h4 class="font-display font-bold text-slate-900 text-base">Add Standard Action</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Click <strong>+ New Step</strong> → Choose <strong>Google Sheets (Insert row)</strong>, <strong>Excel/SharePoint</strong>, or <strong>Teams</strong> to log Sender, Subject & Body Preview!
              </p>
            </div>
          </div>

          <!-- Copilot Expression Helper Prompt Card + Direct Formula -->
          <div class="space-y-4 pt-2">
            ${renderPromptCard(cfg.prompts.copilotTriggerExpression, "Copy Copilot Expression Prompt")}
            ${renderPromptCard(cfg.prompts.readyTriggerFormula, "Copy Direct @or(...) Formula")}
          </div>
        </div>

        ${renderModuleChecklist("view-3")}
        ${renderViewPagination(2)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 4: 04. THE SPREADSHEET BRIDGE (ESCAPING THE PAYWALL) (10:20 – 10:35)
  // ==========================================================================
  function renderView4() {
    const activeStep = (window.WorkshopApp && window.WorkshopApp.getActiveBridgeNode()) || 1;
    const selectedNode = cfg.bridgeNodes.find((n) => n.step === activeStep) || cfg.bridgeNodes[0];

    const nodesHtml = cfg.bridgeNodes
      .map((node, index) => {
        const isSelected = node.step === activeStep;
        return `
          <!-- Pipeline Node ${node.step} -->
          <div class="flex flex-col lg:flex-row items-center flex-1 w-full">
            <button
              type="button"
              onclick="window.WorkshopApp.selectBridgeNode(${node.step})"
              id="bridge-node-btn-${node.step}"
              class="w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                isSelected
                  ? "bridge-node-active border-indigo-600 shadow-xl"
                  : "bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm"
              }"
            >
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono text-xs font-bold ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                }">
                  0${node.step}
                </span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  node.step === 4
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "bg-slate-100 text-slate-600"
                }">
                  ${escapeHtml(node.badge)}
                </span>
              </div>

              <div class="flex items-center gap-2.5 my-1.5">
                <div class="w-9 h-9 rounded-xl ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                } flex items-center justify-center shrink-0">
                  <i data-lucide="${node.icon}" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="font-display font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    ${escapeHtml(node.title)}
                  </h4>
                  <p class="text-xs text-slate-500">${escapeHtml(node.subtitle)}</p>
                </div>
              </div>

              <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-indigo-600">
                <span>${isSelected ? "● Active Inspecting" : "Click to inspect"}</span>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
              </div>
            </button>

            ${
              index < cfg.bridgeNodes.length - 1
                ? `
                <!-- Animated SVG Connector Arrow -->
                <div class="hidden lg:flex items-center justify-center px-1 shrink-0">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="2" y1="12" x2="30" y2="12" stroke="#4F46E5" stroke-width="2.5" class="animated-dashed-line"/>
                    <path d="M26 6L34 12L26 18" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="flex lg:hidden items-center justify-center py-1">
                  <i data-lucide="arrow-down" class="w-5 h-5 text-indigo-500 animate-bounce"></i>
                </div>
              `
                : ""
            }
          </div>
        `;
      })
      .join("");

    const mod = getModuleMeta("view-4");

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Module Header -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="space-y-2 max-w-3xl">
              <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
                <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)}</span>
                <span>•</span>
                <span>${escapeHtml(mod.badge)}</span>
              </div>
              <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                ${escapeHtml(mod.fullTitle)}
              </h1>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                <strong>Core Lesson:</strong> How do we get free AI reasoning <em>inside</em> a Microsoft 365 flow when Microsoft blocks the HTTP connector? We build <strong>The Spreadsheet Bridge</strong>! Click each of the 5 nodes below to trace how an incoming UniFR email crosses into Google Apps Script and Gemini AI for CHF 0.00.
              </p>
            </div>

            <button
              type="button"
              onclick="window.WorkshopApp.simulateBridgeFlow()"
              class="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
            >
              <i data-lucide="play" class="w-4 h-4"></i>
              <span>Simulate Data Packet (1 → 5)</span>
            </button>
          </div>
        </div>

        <!-- Interactive 5-Node Horizontal Pipeline Diagram -->
        <div class="glass-card rounded-3xl p-5 sm:p-7 border-2 border-indigo-500/25 space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Interactive 5-Node Architecture Pipeline (Click any node to inspect)
            </span>
            <span class="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Total License Cost: CHF 0.00 / month
            </span>
          </div>

          <!-- 5-Node Flex Container -->
          <div class="flex flex-col lg:flex-row items-stretch justify-between gap-2">
            ${nodesHtml}
          </div>

          <!-- Live Node Inspector Panel -->
          <div id="bridge-inspector-panel" class="rounded-2xl bg-slate-900 text-white p-6 sm:p-7 border border-slate-800 shadow-xl transition-all">
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-lg bg-indigo-600 font-mono text-xs font-bold uppercase">
                  Node 0${selectedNode.step} of 05
                </span>
                <h3 class="font-display font-bold text-xl text-white">
                  ${escapeHtml(selectedNode.title)} — <span class="text-indigo-300 font-normal">${escapeHtml(selectedNode.subtitle)}</span>
                </h3>
              </div>
              <span class="font-mono text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ${escapeHtml(selectedNode.paywallStatus)}
              </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
              <div class="lg:col-span-7 space-y-4">
                <div>
                  <div class="text-xs font-mono uppercase text-slate-400 mb-1">What Happens at This Node</div>
                  <p class="text-sm sm:text-base text-slate-100 leading-relaxed">
                    ${escapeHtml(selectedNode.whatHappens)}
                  </p>
                </div>
                <div>
                  <div class="text-xs font-mono uppercase text-indigo-300 mb-1">Under-the-Hood Configuration</div>
                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    ${escapeHtml(selectedNode.technicalDetail)}
                  </p>
                </div>
              </div>

              <div class="lg:col-span-5 bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                    <span>LIVE DATA PAYLOAD AT NODE 0${selectedNode.step}</span>
                    <span>JSON / ROW</span>
                  </div>
                  <pre class="font-mono text-xs text-slate-200 whitespace-pre-wrap break-words bg-slate-900/90 p-3 rounded-lg border border-slate-800">${escapeHtml(selectedNode.dataPayload)}</pre>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onclick="window.WorkshopApp.selectBridgeNode(${selectedNode.step > 1 ? selectedNode.step - 1 : 5})"
                    class="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
                    <span>Previous Node</span>
                  </button>
                  <button
                    type="button"
                    onclick="window.WorkshopApp.selectBridgeNode(${selectedNode.step < 5 ? selectedNode.step + 1 : 1})"
                    class="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <span>Inspect Next Node</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${renderModuleChecklist("view-4")}
        ${renderViewPagination(3)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 5: 05. SANDBOX 2: GOOGLE APPS SCRIPT & GEMINI API (10:35 – 10:50)
  // ==========================================================================
  function renderView5() {
    const dockTools = [
      { label: "Open Google Sheets", url: cfg.links.googleSheetsNew, icon: "table", color: "emerald" },
      { label: "Open Google Apps Script Dashboard", url: cfg.links.googleAppsScript, icon: "code-2", color: "indigo" },
      { label: "Get Free Gemini API Key (Google AI Studio)", url: cfg.links.googleAiStudio, icon: "key", color: "amber" }
    ];

    const activeClickStep = (window.WorkshopApp && window.WorkshopApp.getActiveClickGuideStep()) || 1;

    const clickGuideSteps = [
      {
        step: 1,
        title: "1. Prepare Sheet Headers (A–G)",
        desc: "In your new Google Sheet, add headers in Row 1: A: Sender | B: Subject | C: Body | D: AI Category | E: Summary | F: Draft Reply | G: Status.",
        visualTitle: "Google Sheet Row 1 Layout",
        visualHtml: `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr class="bg-emerald-600 text-white">
                  <th class="p-2 border border-emerald-700">A: Sender</th>
                  <th class="p-2 border border-emerald-700">B: Subject</th>
                  <th class="p-2 border border-emerald-700">C: Body</th>
                  <th class="p-2 border border-indigo-700 bg-indigo-600">D: AI Category</th>
                  <th class="p-2 border border-indigo-700 bg-indigo-600">E: Summary</th>
                  <th class="p-2 border border-indigo-700 bg-indigo-600">F: Draft Reply</th>
                  <th class="p-2 border border-slate-700 bg-slate-800">G: Status</th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-white text-slate-800">
                  <td class="p-2 border border-slate-200">lukas@unifr.ch</td>
                  <td class="p-2 border border-slate-200">[THESIS] Question</td>
                  <td class="p-2 border border-slate-200">Dear Prof, can we meet...</td>
                  <td class="p-2 border border-indigo-100 bg-indigo-50 font-bold text-indigo-700">THESIS & SUPERVISION</td>
                  <td class="p-2 border border-indigo-100 bg-indigo-50">Requests thesis meeting</td>
                  <td class="p-2 border border-indigo-100 bg-indigo-50">Hi Lukas, happy to meet...</td>
                  <td class="p-2 border border-slate-200 text-emerald-700 font-bold">✅ Processed</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        step: 2,
        title: "2. Click Extensions → Apps Script",
        desc: "In the top menu bar of Google Sheets, click Extensions -> Apps Script. This opens a browser tab tied directly to your spreadsheet.",
        visualTitle: "Top Menu Bar Navigation",
        visualHtml: `
          <div class="bg-slate-100 p-4 rounded-xl border border-slate-300 font-sans text-xs sm:text-sm space-y-2">
            <div class="flex items-center gap-4 text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200">
              <span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span>
              <span class="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold shadow">Extensions ▼</span>
              <span>Help</span>
            </div>
            <div class="ml-48 w-56 bg-white rounded-lg shadow-lg border border-slate-200 p-2">
              <div class="px-3 py-1.5 text-slate-500">Add-ons</div>
              <div class="px-3 py-1.5 text-slate-500">Macros</div>
              <div class="px-3 py-2 rounded bg-emerald-50 border border-emerald-400 text-emerald-900 font-bold flex items-center justify-between">
                <span>⚡ Apps Script</span>
                <span class="text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded">CLICK HERE</span>
              </div>
            </div>
          </div>
        `
      },
      {
        step: 3,
        title: "3. Paste Code, Add API Key & Save (💾)",
        desc: "Delete the empty myFunction() stub, paste the complete Code.gs script below, paste your Gemini API key into line 14, and click the Save floppy disk icon (or Ctrl+S / Cmd+S).",
        visualTitle: "Apps Script Editor Toolbar",
        visualHtml: `
          <div class="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 font-mono text-xs space-y-3">
            <div class="flex items-center gap-3 pb-2 border-b border-slate-700">
              <span class="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold shadow">💾 Save Project (Click First!)</span>
              <span class="px-3 py-1.5 rounded bg-slate-800 text-slate-200">▶️ Run</span>
              <span class="px-3 py-1.5 rounded bg-slate-800 text-slate-200">🐞 Debug</span>
              <span class="px-3 py-1.5 rounded bg-indigo-900/60 border border-indigo-400 text-indigo-200">processPendingRows ▼</span>
            </div>
            <div class="text-amber-300">const GEMINI_API_KEY = "AIzaSyYourFreeKeyFromGoogleAIStudio"; // &lt;-- ONLY EDIT THIS LINE</div>
          </div>
        `
      },
      {
        step: 4,
        title: "4. Enable Trigger (⏰ Alarm Clock Icon)",
        desc: "Either refresh your Google Sheet and click '⚡ UniFR AI Bridge -> Enable 5-Minute Auto-Pilot Trigger', OR click the ⏰ Triggers (Alarm Clock) icon in the left sidebar of Apps Script!",
        visualTitle: "Apps Script Left Sidebar (⏰ Triggers)",
        visualHtml: `
          <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div class="space-y-2 border-r border-slate-200 pr-4 font-display">
              <div class="px-3 py-1.5 text-slate-500">📄 Overview</div>
              <div class="px-3 py-1.5 text-slate-700">&lt;/&gt; Editor</div>
              <div class="px-3 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow flex items-center gap-2">
                <span>⏰ Triggers</span>
                <span class="text-[10px] font-mono bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">ALARM ICON</span>
              </div>
              <div class="px-3 py-1.5 text-slate-500">▶️ Executions</div>
            </div>
            <div class="space-y-1 text-slate-700">
              <div class="font-display font-bold text-slate-900">Trigger Configuration:</div>
              <div>• Function to run: <code class="bg-slate-100 px-1.5 py-0.5 rounded font-bold">processPendingRows</code></div>
              <div>• Event source: <code class="bg-slate-100 px-1.5 py-0.5 rounded font-bold">Time-driven (Every 5 minutes)</code> or <code class="bg-slate-100 px-1.5 py-0.5 rounded font-bold">From spreadsheet -> On change</code></div>
            </div>
          </div>
        `
      }
    ];

    const mod = getModuleMeta("view-5");
    const currentGuide = clickGuideSteps.find((s) => s.step === activeClickStep) || clickGuideSteps[0];

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Module Header -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="space-y-2 max-w-3xl">
            <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
              <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)}</span>
              <span>•</span>
              <span>${escapeHtml(mod.badge)}</span>
            </div>
            <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              ${escapeHtml(mod.fullTitle)}
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              Now we wire the brain to our Spreadsheet Bridge. With a single copy-paste into <code>Extensions -> Apps Script</code>, your Google Sheet will automatically call <strong>Gemini 2.5 Flash</strong> via <code>UrlFetchApp.fetch()</code>, parse the structured JSON response, and write the category, 1-sentence summary, and draft reply into adjacent columns.
            </p>
          </div>
        </div>

        <!-- Quick-Launch Tool Dock -->
        ${renderToolDock("Launch Your Google Workspace & Free Gemini Key Studio", dockTools)}

        <!-- Interactive "Where Do I Click?" Visual Guide -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">Zero-Code Visual Navigation</span>
              <h2 class="font-display font-bold text-xl text-slate-900">
                Interactive "Where Do I Click?" Guide
              </h2>
            </div>
            <span class="text-xs font-mono text-slate-500">Click Steps 1 → 4 below</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${clickGuideSteps
              .map(
                (s) => `
                <button
                  type="button"
                  onclick="window.WorkshopApp.selectClickGuideStep(${s.step})"
                  class="text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    s.step === activeClickStep
                      ? "bg-indigo-50/90 border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  }"
                >
                  <div class="font-display font-bold text-sm text-slate-900">${escapeHtml(s.title)}</div>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(s.desc)}</p>
                </button>
              `
              )
              .join("")}
          </div>

          <!-- Active Visual Guide Display -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-display font-bold text-base text-indigo-950">${escapeHtml(currentGuide.title)}</h4>
              <span class="text-xs font-mono text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">${escapeHtml(currentGuide.visualTitle)}</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-700">${escapeHtml(currentGuide.desc)}</p>
            <div class="pt-2">
              ${currentGuide.visualHtml}
            </div>
          </div>
        </div>

        <!-- Complete Copy-Pasteable Code.gs Starter Script -->
        ${renderPromptCard(cfg.prompts.completeBridgeScript, "Copy Complete Script (Code.gs)")}

        ${renderModuleChecklist("view-5")}
        ${renderViewPagination(4)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 6: 06. CREATIVE AI, VIBE-CODING & NEXT STEPS (11:05 – 11:40)
  // ==========================================================================
  function renderView6() {
    const mod = getModuleMeta("view-6");
    const creativeDock = [
      { label: "Launch Adobe Firefly (UniFR License)", url: cfg.links.adobeFirefly, icon: "flame", color: "purple" },
      { label: "Launch Adobe Express", url: cfg.links.adobeExpress, icon: "sparkles", color: "indigo" },
      { label: "GitHub Portfolio", url: cfg.links.githubProfile, icon: "globe", color: "emerald" },
      { label: "View Workshop Source on GitHub", url: cfg.links.githubRepo, icon: "github", color: "slate" }
    ];

    const enterpriseHorizons = [
      {
        title: "Multi-Agent Research & Literature Pipelines",
        icon: "network",
        desc: "Automated PubMed / arXiv ingestion, structured synthesis, and PDF extraction pipelines feeding directly into private departmental knowledge bases."
      },
      {
        title: "Automated Grant, SNSF & Budget Tracking",
        icon: "coins",
        desc: "Zero-touch financial reconciliation, milestone reminders, and multi-partner deliverable tracking across SharePoint, SAP exports, and Google Workspace."
      },
      {
        title: "Custom nDSG-Compliant Local AI Architectures",
        icon: "shield-check",
        desc: "Air-gapped or Swiss-hosted LLM endpoints for highly sensitive clinical, legal, or human-subject datasets requiring strict revFADP governance."
      },
      {
        title: "Cross-Departmental Workflow Overhauls",
        icon: "workflow",
        desc: "Replacing legacy manual email chains, PDF forms, and grading rubrics with end-to-end autonomous triage and student onboarding portals."
      }
    ];

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Module Header -->
        <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200">
          <div class="space-y-2 max-w-3xl">
            <div class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
              <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)}</span>
              <span>•</span>
              <span>${escapeHtml(mod.badge)}</span>
            </div>
            <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              ${escapeHtml(mod.fullTitle)}
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              Now that your back-end workflows run autonomously, how do you package your work with world-class design and custom interactive web applications?
            </p>
          </div>
        </div>

        <!-- Quick-Launch Creative Dock -->
        ${renderToolDock("Section A: The Creative & Prototyping Powerhouse", creativeDock)}

        <!-- Section A Grid: Adobe Express/Firefly + Google Antigravity Vibe-Coding -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Card 1: Adobe Firefly & Express -->
          <div class="glass-card rounded-2xl p-6 border-2 border-purple-500/30 bg-gradient-to-br from-white to-purple-50/40 space-y-4">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                Included in UniFR Campus License!
              </span>
              <i data-lucide="palette" class="w-5 h-5 text-purple-600"></i>
            </div>
            <h2 class="font-display font-bold text-xl text-slate-900">
              Adobe Firefly & Adobe Express for Academics
            </h2>
            <p class="text-slate-600 text-sm leading-relaxed">
              Stop using pixelated stock photos on academic posters and lecture slides. Because Adobe Firefly is trained exclusively on licensed Adobe Stock and public domain content, it generates <strong>100% copyright-safe academic graphics</strong>, graphical abstracts, conference posters, and custom certificate templates in seconds.
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <a href="${cfg.links.adobeFirefly}" target="_blank" rel="noopener noreferrer" class="text-xs font-display font-bold text-purple-700 hover:text-purple-900 underline inline-flex items-center gap-1">
                <span>firefly.adobe.com</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
              <span class="text-slate-300">•</span>
              <a href="${cfg.links.adobeExpress}" target="_blank" rel="noopener noreferrer" class="text-xs font-display font-bold text-purple-700 hover:text-purple-900 underline inline-flex items-center gap-1">
                <span>new.express.adobe.com</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
          </div>

          <!-- Card 2: Google Antigravity & Vibe-Coding -->
          <div class="glass-card rounded-2xl p-6 border-2 border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Behind the Curtain • Meta-Architecture
              </span>
              <i data-lucide="code" class="w-5 h-5 text-emerald-400"></i>
            </div>
            <h2 class="font-display font-bold text-xl text-white">
              "Wait—how did I build this entire interactive web app for today's lecture?"
            </h2>
            <p class="text-slate-300 text-sm leading-relaxed">
              Meet <strong>Google Antigravity</strong> & <strong>Vibe-Coding</strong>. Instead of spending 40 hours clicking around PowerPoint slides, I used the exact same meta-prompting logic you just learned for Apps Script inside <strong>Google Antigravity</strong> to architect this entire multi-view web application—ready to host for free on <strong>GitHub Pages</strong> or <strong>Vercel</strong>.
            </p>
            <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-indigo-200 font-mono">
              You can use this exact workflow to build interactive lab dashboards, conference companion sites, and student portals in a single afternoon!
            </div>
          </div>
        </div>

        <!-- Copyable Prompts for Firefly & Antigravity Vibe-Coding -->
        <div class="space-y-6">
          ${renderPromptCard(cfg.prompts.adobeFireflyAcademicPrompt, "Copy Adobe Firefly Visual Prompt")}
          ${renderPromptCard(cfg.prompts.antigravityVibeCodingPrompt, "Copy Antigravity Web App Prompt")}
        </div>

        <!-- Section B: Enterprise & Academic Horizons (The Tacit Consultancy Showcase) -->
        <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 border-slate-800 bg-slate-900 text-white space-y-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Section B • Enterprise & Academic Horizons
              </span>
              <h2 class="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                What's Possible at Scale for Labs, Institutes & Businesses
              </h2>
            </div>
            <span class="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-slate-300">
              Custom Architecture & Advisory
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${enterpriseHorizons
              .map(
                (item) => `
                <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-400/50 transition-all space-y-2">
                  <div class="flex items-center gap-2.5 text-indigo-300 font-display font-bold text-base">
                    <i data-lucide="${item.icon}" class="w-5 h-5 text-emerald-400"></i>
                    <span>${escapeHtml(item.title)}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    ${escapeHtml(item.desc)}
                  </p>
                </div>
              `
              )
              .join("")}
          </div>

          <!-- Subtle Classy Consultancy Callout (Connected to config.js links) -->
          <div class="rounded-2xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-emerald-900/60 p-6 border border-indigo-400/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-1.5 max-w-2xl">
              <div class="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 uppercase tracking-wider">
                <i data-lucide="coffee" class="w-4 h-4"></i>
                <span>Let's Architect Together</span>
              </div>
              <p class="font-display font-semibold text-base sm:text-lg text-white leading-snug">
                "Want to architect custom, high-security automation pipelines for your research group, department, or company? Let's talk over coffee or connect below."
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 shrink-0">
              ${
                cfg.links.consultancyCalendar
                  ? `<a
                      href="${cfg.links.consultancyCalendar}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm shadow-md transition-all"
                    >
                      <i data-lucide="calendar" class="w-4 h-4"></i>
                      <span>Book a Meeting</span>
                    </a>`
                  : ""
              }
              <a
                href="${cfg.links.linkedin}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-sm shadow-md transition-all"
              >
                <i data-lucide="linkedin" class="w-4 h-4"></i>
                <span>Connect on LinkedIn</span>
              </a>
              <a
                href="${cfg.links.email}"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-sm shadow-md transition-all"
              >
                <i data-lucide="mail" class="w-4 h-4"></i>
                <span>Email Direct</span>
              </a>
              <a
                href="${cfg.links.githubProfile}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-semibold text-sm transition-all"
              >
                <i data-lucide="github" class="w-4 h-4"></i>
                <span>GitHub Portfolio</span>
              </a>
            </div>
          </div>
        </div>

        ${renderModuleChecklist("view-6")}
        ${renderViewPagination(5)}
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 7: 07. 🎓 THE GRAND FINALE: AUTOMATED GRADUATION (11:40 – 12:00)
  // ==========================================================================
  function renderView7() {
    const mod = getModuleMeta("view-7");
    const activeFormUrl = (window.WorkshopApp && window.WorkshopApp.getGraduationUrl()) || cfg.links.graduationFormUrl;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=0F172A&bgcolor=FFFFFF&data=${encodeURIComponent(activeFormUrl)}`;

    return `
      <section class="space-y-8 view-animate-in">
        <!-- Grand Finale Hero -->
        <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-indigo-500/30">
          <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-3 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono uppercase tracking-wider">
                <i data-lucide="${escapeHtml(mod.icon)}" class="w-4 h-4"></i>
                <span>Module ${escapeHtml(mod.number)} • ${escapeHtml(mod.timeSlot)} • ${escapeHtml(mod.badge)}</span>
              </div>
              <h1 class="font-display font-extrabold text-2xl sm:text-4xl text-white">
                ${escapeHtml(mod.fullTitle)}
              </h1>
              <p class="text-slate-200 text-sm sm:text-base leading-relaxed">
                Don't just take our word for it—experience a live end-to-end automation pipeline right now! Submit your Name, Email, and Favorite Takeaway below, and watch the live flow populate an <strong>Adobe Express</strong> certificate template, convert it to PDF, and deliver it straight to your inbox in real time.
              </p>
            </div>

            <!-- Celebratory Confetti Button -->
            <div class="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onclick="window.WorkshopApp.triggerCelebration()"
                class="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <i data-lucide="party-popper" class="w-5 h-5"></i>
                <span>🎉 Test Celebration / Confetti!</span>
              </button>
              <span class="text-[11px] font-mono text-center text-emerald-300">
                Click when your PDF certificate hits your inbox!
              </span>
            </div>
          </div>
        </div>

        <!-- Visual Pipeline of How Graduation Works -->
        <div class="glass-card rounded-2xl p-6 border border-slate-200">
          <div class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold mb-4">
            Behind the Scenes: Your Live Graduation Pipeline
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">01</div>
              <div>
                <div class="font-display font-bold text-sm text-slate-900">Submit Form</div>
                <p class="text-xs text-slate-600 mt-0.5">Enter your Name, Email & Favorite Workshop Takeaway via QR or button.</p>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-purple-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">02</div>
              <div>
                <div class="font-display font-bold text-sm text-slate-900">Adobe Express Template</div>
                <p class="text-xs text-slate-600 mt-0.5">Automation merges your name & AI-polished takeaway into a custom visual template.</p>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">03</div>
              <div>
                <div class="font-display font-bold text-sm text-slate-900">Instant PDF Render</div>
                <p class="text-xs text-slate-600 mt-0.5">Exports a high-resolution, print-ready PDF certificate in the cloud.</p>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">04</div>
              <div>
                <div class="font-display font-bold text-sm text-emerald-950">Real-Time Inbox Delivery</div>
                <p class="text-xs text-emerald-800 mt-0.5">Arrives in your inbox within 60 seconds—ready to share on LinkedIn!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- High-Impact "Trigger My Graduation Certificate" Card + Dynamic QR Code -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Form Trigger & Live URL Configurator -->
          <div class="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border-2 border-indigo-600/40 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <span class="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                <span>Live Action Trigger</span>
              </span>

              <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                Trigger My Graduation Certificate
              </h2>

              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                Click the button below on your laptop—or scan the dynamic QR code with your phone—to open the official Graduation Form and fire the live certificate pipeline.
              </p>

              <div class="pt-2 flex flex-wrap items-center gap-3">
                <a
                  id="graduation-form-btn"
                  href="${activeFormUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  onclick="window.WorkshopApp.triggerCelebration()"
                  class="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
                >
                  <i data-lucide="award" class="w-5 h-5"></i>
                  <span>Open Graduation Form & Claim Certificate</span>
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                </a>
              </div>
            </div>

            <!-- Instructor Live Form URL Quick-Updater (Also editable in config.js) -->
            <div class="pt-5 border-t border-slate-200 projector-hide">
              <label class="block text-xs font-mono uppercase text-slate-500 font-semibold mb-2">
                ⚙️ Instructor Quick-Override (Default set in <code class="text-indigo-600">config.js → links.graduationFormUrl</code>):
              </label>
              <div class="flex gap-2">
                <input
                  id="input-graduation-url"
                  type="url"
                  value="${escapeHtml(activeFormUrl)}"
                  placeholder="https://forms.office.com/r/..."
                  class="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onclick="window.WorkshopApp.updateGraduationUrl(document.getElementById('input-graduation-url').value)"
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold text-xs cursor-pointer shrink-0"
                >
                  Update QR & Link
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Dynamic QR Code Card -->
          <div class="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 bg-white">
            <div class="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Scan With Your Smartphone Camera
            </div>
            <div class="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-lg">
              <img
                id="graduation-qr-img"
                src="${qrImageUrl}"
                alt="Graduation Form QR Code"
                class="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
              />
            </div>
            <div class="space-y-1">
              <div class="font-display font-bold text-slate-900 text-base">Instant Mobile Trigger</div>
              <p id="graduation-url-caption" class="text-xs font-mono text-slate-400 break-all max-w-xs">
                ${escapeHtml(activeFormUrl)}
              </p>
            </div>
          </div>
        </div>

        ${renderModuleChecklist("view-7")}
        ${renderViewPagination(6)}
      </section>
    `;
  }

  // Expose public render router
  return {
    renderViewById: function (viewId) {
      switch (viewId) {
        case "view-1":
          return renderView1();
        case "view-2":
          return renderView2();
        case "view-3":
          return renderView3();
        case "view-4":
          return renderView4();
        case "view-5":
          return renderView5();
        case "view-6":
          return renderView6();
        case "view-7":
          return renderView7();
        default:
          return renderView1();
      }
    }
  };
})();
