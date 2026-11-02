/**
 * ============================================================================
 * APPLICATION CONTROLLER & STATE ENGINE (app.js)
 * Handles view switching, hash routing (GitHub Pages compatible), progress
 * tracking, projector mode, clipboard actions, and confetti celebrations.
 * ============================================================================
 */

window.WorkshopApp = (function () {
  const cfg = window.WORKSHOP_CONFIG;
  const STORAGE_KEY = "unifr_ai_workshop_state_v1";

  // Default state
  let state = {
    activeView: "view-1",
    completedSteps: {},
    projectorMode: false,
    sidebarCollapsed: false,
    activeBridgeNode: 1,
    activeClickGuideStep: 1,
    customGraduationUrl: ""
  };

  let bridgeSimulationTimer = null;

  // Load persisted state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign({}, state, parsed);
      }
    } catch (e) {
      console.warn("State load fallback:", e);
    }

    // Check URL hash for direct view routing (e.g., #view-4)
    const hash = window.location.hash.replace("#", "");
    if (hash && cfg.modules.some((m) => m.id === hash)) {
      state.activeView = hash;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  // Calculate total checklist items & completed count
  function getProgressStats() {
    let total = 0;
    let completed = 0;
    Object.keys(cfg.checklists).forEach((viewId) => {
      cfg.checklists[viewId].forEach((item) => {
        total++;
        if (state.completedSteps[item.id]) {
          completed++;
        }
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  }

  // Check if all checklist items in a specific view are completed
  function isModuleCompleted(viewId) {
    const list = cfg.checklists[viewId] || [];
    if (!list.length) return false;
    return list.every((item) => Boolean(state.completedSteps[item.id]));
  }

  // Render Left Sidebar Navigation Menu
  function renderSidebar() {
    const navContainer = document.getElementById("sidebar-nav-list");
    if (!navContainer) return;

    const countEl = document.getElementById("sidebar-modules-count");
    if (countEl) {
      countEl.textContent = `${cfg.modules.length} Interactive Modules`;
    }

    navContainer.innerHTML = cfg.modules
      .map((mod) => {
        const isActive = state.activeView === mod.id;
        const isDone = isModuleCompleted(mod.id);

        return `
          <button
            type="button"
            onclick="window.WorkshopApp.switchView('${mod.id}')"
            title="${mod.fullTitle} (${mod.timeSlot}) • ${mod.badge || ""}"
            class="sidebar-item-btn w-full text-left px-3.5 py-3 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-700 hover:bg-slate-100/90 hover:text-slate-900"
            }"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-white/20 text-white"
                  : isDone
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              }">
                ${isDone && !isActive ? "✓" : mod.number}
              </div>
              <div class="sidebar-text truncate">
                <div class="font-display font-bold text-xs sm:text-sm truncate leading-snug">
                  ${mod.shortTitle}
                </div>
                <div class="font-mono text-[11px] flex items-center gap-1.5 ${
                  isActive ? "text-indigo-200" : "text-slate-400"
                }">
                  <span>${mod.timeSlot}</span>
                </div>
              </div>
            </div>

            <span class="sidebar-badge shrink-0">
              ${
                isDone
                  ? `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>`
                  : `<i data-lucide="${mod.icon || "chevron-right"}" class="w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-300 group-hover:text-slate-500"
                    }"></i>`
              }
            </span>
          </button>
        `;
      })
      .join("");
  }

  // Update Top Utility Bar Progress & Active Module Breadcrumb
  function updateTopBar() {
    const stats = getProgressStats();
    const progressBar = document.getElementById("workshop-progress-bar");
    const progressText = document.getElementById("workshop-progress-text");

    if (progressBar) {
      progressBar.style.width = `${stats.pct}%`;
    }
    if (progressText) {
      progressText.textContent = `${stats.completed}/${stats.total} Steps (${stats.pct}%)`;
    }

    // Update Projector Mode button visual state
    const projBtn = document.getElementById("projector-mode-btn");
    const projBadge = document.getElementById("projector-mode-status");
    if (state.projectorMode) {
      document.documentElement.classList.add("projector-mode");
      if (projBtn) {
        projBtn.classList.add("bg-indigo-600", "text-white", "border-indigo-600");
        projBtn.classList.remove("bg-white", "text-slate-700", "border-slate-200");
      }
      if (projBadge) projBadge.textContent = "ON (+20%)";
    } else {
      document.documentElement.classList.remove("projector-mode");
      if (projBtn) {
        projBtn.classList.remove("bg-indigo-600", "text-white", "border-indigo-600");
        projBtn.classList.add("bg-white", "text-slate-700", "border-slate-200");
      }
      if (projBadge) projBadge.textContent = "OFF";
    }

    // Update Sidebar Collapsed visual state
    const sidebarEl = document.getElementById("left-sidebar");
    if (sidebarEl) {
      if (state.sidebarCollapsed) {
        sidebarEl.classList.add("sidebar-collapsed");
      } else {
        sidebarEl.classList.remove("sidebar-collapsed");
      }
    }
  }

  // Render the active view inside the main viewport container
  function renderActiveView(scrollToTop = true) {
    const viewport = document.getElementById("main-viewport-container");
    if (!viewport) return;

    viewport.innerHTML = window.WorkshopViews.renderViewById(state.activeView);
    renderSidebar();
    updateTopBar();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    if (scrollToTop) {
      const scrollWrapper = document.getElementById("main-scroll-area");
      if (scrollWrapper) {
        scrollWrapper.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Switch active view (strictly 1 view visible at a time)
  function switchView(viewId) {
    if (bridgeSimulationTimer) {
      clearInterval(bridgeSimulationTimer);
      bridgeSimulationTimer = null;
    }
    state.activeView = viewId;
    saveState();

    if (history.replaceState) {
      history.replaceState(null, "", `#${viewId}`);
    } else {
      window.location.hash = viewId;
    }

    renderActiveView(true);

    // Close mobile sidebar if open
    const mobileBackdrop = document.getElementById("mobile-sidebar-backdrop");
    const sidebarEl = document.getElementById("left-sidebar");
    if (mobileBackdrop && sidebarEl && window.innerWidth < 1024) {
      mobileBackdrop.classList.add("hidden");
      sidebarEl.classList.add("-translate-x-full");
    }
  }

  // View 1 Concept Tab Switcher (Tab A, Tab B, Tab C)
  function switchConceptTab(tabId) {
    const tabs = ["tab-intern", "tab-train", "tab-agentic"];
    tabs.forEach((t) => {
      const panel = document.getElementById(`panel-${t}`);
      const btn = document.getElementById(`btn-${t}`);
      if (panel) {
        if (t === tabId) {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      }
      if (btn) {
        if (t === tabId) {
          btn.classList.add("bg-indigo-50/80", "border-indigo-600", "shadow-md");
          btn.classList.remove("bg-slate-50", "border-slate-200");
        } else {
          btn.classList.remove("bg-indigo-50/80", "border-indigo-600", "shadow-md");
          btn.classList.add("bg-slate-50", "border-slate-200");
        }
      }
    });
  }

  // One-Click Copy to Clipboard with Emerald Glow & Feedback
  function copyPrompt(promptId, btnElement) {
    const rawEl = document.getElementById(`raw-${promptId}`);
    if (!rawEl) return;

    const textToCopy = rawEl.textContent;

    const onCopySuccess = () => {
      if (!btnElement) return;
      const labelSpan = btnElement.querySelector(".copy-btn-label");
      const originalText = labelSpan ? labelSpan.textContent : "Copy to Clipboard";

      btnElement.classList.add("copy-btn-copied");
      if (labelSpan) {
        labelSpan.textContent = "Copied! Ready to Paste ✓";
      }

      // Subtle micro-confetti burst from button
      if (typeof window.confetti === "function") {
        const rect = btnElement.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        window.confetti({
          particleCount: 28,
          spread: 55,
          origin: { x, y },
          colors: ["#10B981", "#4F46E5", "#34D399"]
        });
      }

      setTimeout(() => {
        btnElement.classList.remove("copy-btn-copied");
        if (labelSpan) {
          labelSpan.textContent = originalText;
        }
      }, 2400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(onCopySuccess).catch(() => {
        fallbackCopy(textToCopy, onCopySuccess);
      });
    } else {
      fallbackCopy(textToCopy, onCopySuccess);
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
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(ta);
  }

  // Toggle interactive checklist step completion
  function toggleStep(stepId, isChecked) {
    if (isChecked) {
      state.completedSteps[stepId] = true;
      if (typeof window.confetti === "function") {
        window.confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.75 },
          colors: ["#10B981", "#4F46E5", "#F59E0B"]
        });
      }
    } else {
      delete state.completedSteps[stepId];
    }
    saveState();
    renderActiveView(false);
  }

  function isStepCompleted(stepId) {
    return Boolean(state.completedSteps[stepId]);
  }

  // View 4: Select Bridge Architecture Node (1-5)
  function selectBridgeNode(stepNumber) {
    state.activeBridgeNode = stepNumber;
    saveState();
    renderActiveView(false);
  }

  function getActiveBridgeNode() {
    return state.activeBridgeNode || 1;
  }

  // View 4: Animated Simulation across all 5 Bridge Nodes
  function simulateBridgeFlow() {
    if (bridgeSimulationTimer) {
      clearInterval(bridgeSimulationTimer);
    }
    let current = 1;
    selectBridgeNode(current);
    bridgeSimulationTimer = setInterval(() => {
      current++;
      if (current <= 5) {
        selectBridgeNode(current);
      } else {
        clearInterval(bridgeSimulationTimer);
        bridgeSimulationTimer = null;
        if (typeof window.confetti === "function") {
          window.confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    }, 1100);
  }

  // View 5: Select "Where do I click?" visual guide step
  function selectClickGuideStep(stepNumber) {
    state.activeClickGuideStep = stepNumber;
    saveState();
    renderActiveView(false);
  }

  function getActiveClickGuideStep() {
    return state.activeClickGuideStep || 1;
  }

  // View 7: Graduation Form URL & Dynamic QR Code Updater
  function getGraduationUrl() {
    return state.customGraduationUrl || cfg.links.graduationFormUrl;
  }

  function updateGraduationUrl(newUrl) {
    const trimmed = (newUrl || "").trim();
    if (!trimmed) return;
    state.customGraduationUrl = trimmed;
    saveState();
    renderActiveView(false);
  }

  // Toggle Projector / Lecture Mode (+20% font scale & hide secondary clutter)
  function toggleProjectorMode() {
    state.projectorMode = !state.projectorMode;
    saveState();
    updateTopBar();
  }

  // Toggle Left Sidebar Collapse (Desktop)
  function toggleSidebarCollapse() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    saveState();
    updateTopBar();
  }

  // Toggle Mobile Sidebar Drawer
  function toggleMobileSidebar() {
    const sidebarEl = document.getElementById("left-sidebar");
    const backdrop = document.getElementById("mobile-sidebar-backdrop");
    if (!sidebarEl || !backdrop) return;

    const isHidden = sidebarEl.classList.contains("-translate-x-full");
    if (isHidden) {
      sidebarEl.classList.remove("-translate-x-full");
      backdrop.classList.remove("hidden");
    } else {
      sidebarEl.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
    }
  }

  // Toggle Schedule Modal
  function toggleScheduleModal() {
    const modal = document.getElementById("schedule-modal");
    if (!modal) return;
    modal.classList.toggle("hidden");
  }

  // Full Celebration Confetti (View 7 & Finale)
  function triggerCelebration() {
    if (typeof window.confetti !== "function") return;

    const duration = 2600;
    const end = Date.now() + duration;

    (function frame() {
      window.confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#4F46E5", "#10B981", "#F59E0B", "#EC4899"]
      });
      window.confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#4F46E5", "#10B981", "#F59E0B", "#EC4899"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  // Populate static metadata & links in Top Bar, Sidebar & Schedule Modal from config.js
  function hydrateStaticLinks() {
    if (cfg.meta && cfg.meta.title) {
      document.title = `${cfg.meta.title} | ${cfg.meta.initiative || "UniFR"}`;
    }

    // Bind all [data-config-meta="..."] elements in index.html
    document.querySelectorAll("[data-config-meta]").forEach((el) => {
      const key = el.getAttribute("data-config-meta");
      if (cfg.meta && cfg.meta[key]) {
        el.textContent = cfg.meta[key];
      }
    });

    // Bind all [data-config-link="..."] elements in index.html
    document.querySelectorAll("[data-config-link]").forEach((el) => {
      const key = el.getAttribute("data-config-link");
      if (cfg.links && cfg.links[key]) {
        el.href = cfg.links[key];
      }
    });

    // Ensure #top-github-btn points to githubProfile or githubRepo from config.js
    const ghBtn = document.getElementById("top-github-btn");
    if (ghBtn) {
      ghBtn.href = cfg.links.githubProfile || cfg.links.githubRepo;
    }

    const modalScheduleList = document.getElementById("modal-schedule-list");
    if (modalScheduleList) {
      modalScheduleList.innerHTML = cfg.schedule
        .map(
          (s) => `
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <i data-lucide="${s.icon || "clock"}" class="w-3.5 h-3.5 text-indigo-600"></i>
                <span class="font-mono text-xs font-bold text-indigo-600">${s.time}</span>
              </div>
              <div class="font-display font-bold text-sm text-slate-900">${s.title}</div>
              <p class="text-xs text-slate-500 mt-0.5">${s.description}</p>
            </div>
            <button
              type="button"
              onclick="window.WorkshopApp.toggleScheduleModal(); window.WorkshopApp.switchView('${s.targetView}')"
              class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-display font-semibold text-xs shrink-0 cursor-pointer"
            >
              Open
            </button>
          </div>
        `
        )
        .join("");
    }
  }

  // Initialize application on DOMContentLoaded
  function init() {
    loadState();
    hydrateStaticLinks();
    renderActiveView(false);

    // Listen to browser hash changes (back/forward navigation)
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && cfg.modules.some((m) => m.id === hash) && hash !== state.activeView) {
        state.activeView = hash;
        saveState();
        renderActiveView(true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    switchView,
    switchConceptTab,
    copyPrompt,
    toggleStep,
    isStepCompleted,
    selectBridgeNode,
    getActiveBridgeNode,
    simulateBridgeFlow,
    selectClickGuideStep,
    getActiveClickGuideStep,
    getGraduationUrl,
    updateGraduationUrl,
    toggleProjectorMode,
    toggleSidebarCollapse,
    toggleMobileSidebar,
    toggleScheduleModal,
    triggerCelebration
  };
})();

