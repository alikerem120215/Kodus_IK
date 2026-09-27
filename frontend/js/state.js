/**
 * Kodus HR - Global Application State with Session Persistence & Multi-Tenancy
 */

window.AppState = {
  // Session details (loaded from local storage or null initially)
  currentUser: null,
  currentCompany: null,

  // Role metadata
  roles: {
    hr_admin: { label: "İK Direktörü / Admin", badge: "İK Yöneticisi", color: "#818cf8" },
    manager: { label: "Takım Lideri / Yönetici", badge: "Yönetici", color: "#38bdf8" },
    employee: { label: "Çalışan (Kullanıcı)", badge: "Çalışan", color: "#34d399" },
    finance: { label: "Finans & Bordro Uzmanı", badge: "Muhasebe", color: "#fbbf24" }
  },

  // Scoped Data
  stats: {},
  employees: [],
  leaves: [],
  payrolls: [],
  plugins: [],
  communityIdeas: [],

  // UI State
  currentView: "dashboard",
  maskSensitiveData: true,
  theme: localStorage.getItem("kodus_theme") || "dark",
  stagedPlugin: null,

  initSession() {
    const raw = localStorage.getItem("kodus_session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        this.currentUser = session.user || null;
        this.currentCompany = session.company || null;
      } catch (e) {
        this.currentUser = null;
        this.currentCompany = null;
      }
    }
  },

  setSession(user, company) {
    this.currentUser = user;
    this.currentCompany = company;
    localStorage.setItem("kodus_session", JSON.stringify({ user, company }));
    window.App.updateUserProfileDisplay();
  },

  clearSession() {
    this.currentUser = null;
    this.currentCompany = null;
    localStorage.removeItem("kodus_session");
  },

  isLoggedIn() {
    return this.currentUser !== null;
  }
};
