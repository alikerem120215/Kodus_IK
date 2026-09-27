/**
 * Kodus HR - Main Application Controller
 * Handles authentication gating, session lifecycle, routing, and PWA setup.
 */

window.App = {
  deferredPrompt: null,

  async init() {
    this.setupTheme();
    window.AppState.initSession();
    this.setupEventListeners();

    if (!window.AppState.isLoggedIn()) {
      this.navigate("auth");
    } else {
      await this.refreshData();
      this.navigate("dashboard");
    }

    this.setupPwa();
  },

  async refreshData() {
    if (!window.AppState.isLoggedIn()) return;

    try {
      const [stats, employees, leaves, payrolls, plugins, communityIdeas] = await Promise.all([
        window.KodusAPI.fetchStats().catch(() => ({})),
        window.KodusAPI.fetchEmployees().catch(() => []),
        window.KodusAPI.fetchLeaves().catch(() => []),
        window.KodusAPI.fetchPayrolls().catch(() => []),
        window.KodusAPI.fetchPlugins().catch(() => []),
        window.KodusAPI.fetchCommunityIdeas().catch(() => [])
      ]);

      window.AppState.stats = stats;
      window.AppState.employees = employees;
      window.AppState.leaves = leaves;
      window.AppState.payrolls = payrolls;
      window.AppState.plugins = plugins;
      window.AppState.communityIdeas = communityIdeas;

      this.updateBadges();
      this.updateUserProfileDisplay();
    } catch (err) {
      console.error("Data refresh error:", err);
    }
  },

  navigate(viewName) {
    // If not logged in, enforce auth view
    if (!window.AppState.isLoggedIn() && viewName !== "auth") {
      viewName = "auth";
    }

    window.AppState.currentView = viewName;

    // Toggle layout visibility for auth vs app
    const isAuth = viewName === "auth";
    const sidebar = document.querySelector(".sidebar");
    const topbar = document.querySelector(".topbar");
    const mainWrapper = document.querySelector(".main-wrapper");

    if (sidebar) sidebar.style.display = isAuth ? "none" : "flex";
    if (topbar) topbar.style.display = isAuth ? "none" : "flex";
    if (mainWrapper) mainWrapper.style.marginLeft = isAuth ? "0" : "var(--sidebar-width)";

    if (isAuth) {
      this.renderCurrentView();
      return;
    }

    // Update active nav styling
    document.querySelectorAll(".nav-item").forEach(item => {
      const target = item.getAttribute("data-view");
      item.classList.toggle("active", target === viewName);
    });

    // Update topbar title
    const titles = {
      dashboard: { title: "Genel Bakış & Pano", subtitle: "Kurumsal İK durumu ve yapay zeka eklentileri" },
      employees: { title: "Çalışan Rehberi", subtitle: "KVKK korumalı personel listesi ve departman yönetimi" },
      leaves: { title: "İzin Talepleri & Onay", subtitle: "Çalışan talepleri, onay süreçleri ve izin takvimleri" },
      payroll: { title: "Bordro & Maaşlar", subtitle: "Aylık maliyet, SGK kesintileri ve dijital hesap pusulaları" },
      "ai-studio": { title: "Yapay Zeka Eklenti Stüdyosu", subtitle: "Doğal dille anında sandboxed uygulama içi widget üretimi" },
      community: { title: "Topluluk & İlham Havuzu", subtitle: "Kullanıcı eklenti fikirleri ve ürün yol haritası ilhamları" },
      kvkk: { title: "KVKK & Mimari Güvenlik", subtitle: "Web tabanlı SaaS ve Sandboxing mimarisinin avantajları" }
    };

    const currentTitle = titles[viewName] || { title: "Kodus İK", subtitle: "" };
    const titleEl = document.getElementById("pageTitle");
    const subEl = document.getElementById("pageSubtitle");
    if (titleEl) titleEl.innerText = currentTitle.title;
    if (subEl) subEl.innerText = currentTitle.subtitle;

    this.renderCurrentView();
  },

  renderCurrentView() {
    const container = document.getElementById("view-container");
    if (!container) return;

    switch (window.AppState.currentView) {
      case "auth":
        window.AuthView.render(container);
        break;
      case "dashboard":
        window.DashboardView.render(container);
        break;
      case "employees":
        window.EmployeesView.render(container);
        break;
      case "leaves":
        window.LeavesView.render(container);
        break;
      case "payroll":
        window.PayrollView.render(container);
        break;
      case "ai-studio":
        window.AIStudioView.render(container);
        break;
      case "community":
        window.CommunityView.render(container);
        break;
      case "kvkk":
        window.KvkkView.render(container);
        break;
      default:
        window.DashboardView.render(container);
    }
  },

  updateUserProfileDisplay() {
    const user = window.AppState.currentUser;
    if (!user) return;

    const roleMeta = window.AppState.roles[user.role] || {};
    const company = window.AppState.currentCompany;

    const nameEl = document.getElementById("currentUserName");
    const roleEl = document.getElementById("currentUserRoleBadge");
    const avatarEl = document.getElementById("currentUserAvatar");
    const companyNameEl = document.getElementById("sidebarCompanyName");
    const companyKeyEl = document.getElementById("sidebarCompanyKey");

    if (nameEl) nameEl.innerText = `${user.name} ${user.surname}`;
    if (roleEl) {
      roleEl.innerText = roleMeta.badge || user.role;
      roleEl.style.color = roleMeta.color || "#818cf8";
    }
    if (avatarEl) avatarEl.src = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

    if (companyNameEl) {
      companyNameEl.innerText = company ? company.name : "Şirket Ağı Yok";
    }
    if (companyKeyEl) {
      if (company && company.company_key) {
        companyKeyEl.style.display = "inline-flex";
        companyKeyEl.innerHTML = `🔑 ${company.company_key.slice(0, 10)}... <span style="cursor:pointer;" onclick="window.DashboardView.copyCompanyKey('${company.company_key}')" title="Kopyala">📋</span>`;
      } else {
        companyKeyEl.style.display = "none";
      }
    }
  },

  updateBadges() {
    const pendingCount = (window.AppState.leaves || []).filter(l => l.status === "pending").length;
    const badgeEl = document.getElementById("pendingLeavesBadge");
    if (badgeEl) {
      badgeEl.innerText = pendingCount;
      badgeEl.style.display = pendingCount > 0 ? "inline-block" : "none";
    }
  },

  logout() {
    window.AppState.clearSession();
    this.showToast("Çıkış Yapıldı", "Oturumunuz güvenle sonlandırıldı.", "info");
    this.navigate("auth");
  },

  showToast(title, message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "✓",
      info: "ℹ",
      warning: "⚠️",
      error: "✕"
    };

    toast.innerHTML = `
      <div style="font-weight:700; font-size:16px;">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.3s, transform 0.3s";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  setupTheme() {
    document.documentElement.setAttribute("data-theme", window.AppState.theme);
  },

  toggleTheme() {
    const newTheme = window.AppState.theme === "dark" ? "light" : "dark";
    window.AppState.theme = newTheme;
    localStorage.setItem("kodus_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    this.showToast("Tema Güncellendi", `${newTheme === 'dark' ? 'Karanlık' : 'Aydınlık'} tema uygulandı.`, "info");
  },

  setupEventListeners() {
    // Nav Items
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        if (view) this.navigate(view);
      });
    });

    // Theme toggle button
    const themeBtn = document.getElementById("btnToggleTheme");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Topbar Search Keyboard Shortcut
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("topSearchInput");
        if (searchInput) searchInput.focus();
      }
    });
  },

  setupPwa() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const pwaBtn = document.getElementById("btnPwaInstall");
      if (pwaBtn) pwaBtn.style.display = "flex";
    });

    const pwaBtn = document.getElementById("btnPwaInstall");
    if (pwaBtn) {
      pwaBtn.addEventListener("click", async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          if (outcome === "accepted") {
            pwaBtn.style.display = "none";
          }
          this.deferredPrompt = null;
        } else {
          this.showToast("Masaüstü PWA", "Uygulamayı tarayıcınızın 'Uygulamayı Yükle' veya '+' butonuyla masaüstü uygulaması olarak kurabilirsiniz!", "info");
        }
      });
    }
  },

  async uninstallPlugin(pluginId) {
    if (!confirm("Bu eklentiyi panonuzdan kaldırmak istediğinize emin misiniz?")) return;
    try {
      await window.KodusAPI.deletePlugin(pluginId);
      this.showToast("Eklenti Kaldırıldı", "Seçilen eklenti sistemden silindi.", "info");
      await this.refreshData();
      this.renderCurrentView();
    } catch (err) {
      this.showToast("Hata", err.message, "error");
    }
  },

  inspectPlugin(pluginId) {
    const plugin = (window.AppState.plugins || []).find(p => p.id === pluginId);
    if (plugin) {
      window.AIStudioView.currentPlugin = plugin;
      this.navigate("ai-studio");
    }
  }
};

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
