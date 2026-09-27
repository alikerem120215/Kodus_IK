/**
 * Kodus HR - REST API & Local Multi-Tenant Database Engine
 * Seamlessly works with Python backend or directly inside the browser (offline/file://).
 */

const DEFAULT_DEMO_KEY = "KODUS-DEMO-8A9F-2026-HQ01";

const SEED_COMPANIES = [
  {
    id: 1,
    name: "Kodus Yazılım ve Bilişim A.Ş.",
    company_key: DEFAULT_DEMO_KEY,
    sector: "Yazılım & Bilişim",
    owner_email: "alikerem@kodus.ai",
    created_at: "2026-09-24 10:00:00"
  }
];

const SEED_USERS = [
  { id: 1, email: "alikerem@kodus.ai", password: "123", name: "Ali Kerem", surname: "Aydın", role: "hr_admin", company_key: DEFAULT_DEMO_KEY, department: "Yazılım & Teknoloji", title: "Lead Software Architect", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=AliKerem" },
  { id: 2, email: "selin.yilmaz@kodus.ai", password: "123", name: "Selin", surname: "Yılmaz", role: "hr_admin", company_key: DEFAULT_DEMO_KEY, department: "İnsan Kaynakları", title: "İK Direktörü", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selin" },
  { id: 3, email: "burak.kaya@kodus.ai", password: "123", name: "Burak", surname: "Kaya", role: "employee", company_key: DEFAULT_DEMO_KEY, department: "Yazılım & Teknoloji", title: "Senior Backend Developer", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak" },
  { id: 4, email: "elif.demir@kodus.ai", password: "123", name: "Elif", surname: "Demir", role: "manager", company_key: DEFAULT_DEMO_KEY, department: "Ürün Tasarımı", title: "Lead UI/UX Designer", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elif" },
  { id: 5, email: "can.ozturk@kodus.ai", password: "123", name: "Can", surname: "Öztürk", role: "finance", company_key: DEFAULT_DEMO_KEY, department: "Finans & Muhasebe", title: "Bordro ve Mali İşler Uzmanı", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Can" }
];

const SEED_EMPLOYEES = [
  { id: 1, company_key: DEFAULT_DEMO_KEY, user_id: 1, name: "Ali Kerem", surname: "Aydın", email: "alikerem@kodus.ai", phone: "+90 532 100 2030", department: "Yazılım & Teknoloji", title: "Lead Software Architect", role: "hr_admin", salary: 135000, start_date: "2024-01-15", annual_leave_days: 20, used_leave_days: 4, avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=AliKerem", status: "active" },
  { id: 2, company_key: DEFAULT_DEMO_KEY, user_id: 2, name: "Selin", surname: "Yılmaz", email: "selin.yilmaz@kodus.ai", phone: "+90 533 211 4050", department: "İnsan Kaynakları", title: "İK Direktörü", role: "hr_admin", salary: 95000, start_date: "2023-05-10", annual_leave_days: 18, used_leave_days: 3, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selin", status: "active" },
  { id: 3, company_key: DEFAULT_DEMO_KEY, user_id: 3, name: "Burak", surname: "Kaya", email: "burak.kaya@kodus.ai", phone: "+90 544 322 5060", department: "Yazılım & Teknoloji", title: "Senior Backend Developer", role: "employee", salary: 88000, start_date: "2024-03-01", annual_leave_days: 14, used_leave_days: 2, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak", status: "active" },
  { id: 4, company_key: DEFAULT_DEMO_KEY, user_id: 4, name: "Elif", surname: "Demir", email: "elif.demir@kodus.ai", phone: "+90 535 433 6070", department: "Ürün Tasarımı", title: "Lead UI/UX Designer", role: "manager", salary: 92000, start_date: "2023-11-20", annual_leave_days: 16, used_leave_days: 5, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elif", status: "active" },
  { id: 5, company_key: DEFAULT_DEMO_KEY, user_id: 5, name: "Can", surname: "Öztürk", email: "can.ozturk@kodus.ai", phone: "+90 536 544 7080", department: "Finans & Muhasebe", title: "Bordro ve Mali İşler Uzmanı", role: "finance", salary: 78000, start_date: "2024-02-01", annual_leave_days: 14, used_leave_days: 0, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Can", status: "active" }
];

const SEED_LEAVES = [
  { id: 1, company_key: DEFAULT_DEMO_KEY, employee_id: 3, leave_type: "Mazeret İzni", start_date: "2026-09-30", end_date: "2026-10-01", days: 2, reason: "Ailevi acil durum ve resmi daire işlemleri", status: "pending", emp_name: "Burak", emp_surname: "Kaya", emp_dept: "Yazılım & Teknoloji", emp_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak" },
  { id: 2, company_key: DEFAULT_DEMO_KEY, employee_id: 4, leave_type: "Yıllık İzin", start_date: "2026-10-10", end_date: "2026-10-15", days: 4, reason: "Tasarım konferansı katılımı ve izin", status: "pending", emp_name: "Elif", emp_surname: "Demir", emp_dept: "Ürün Tasarımı", emp_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elif" }
];

const SEED_PAYROLLS = [
  { id: 1, company_key: DEFAULT_DEMO_KEY, employee_id: 1, month: "2026-09", gross_salary: 185000, net_salary: 135000, sgk_employee: 25900, income_tax: 24100, bonus: 10000, emp_name: "Ali Kerem", emp_surname: "Aydın", emp_dept: "Yazılım & Teknoloji", emp_title: "Lead Software Architect", paid_at: "2026-09-20" },
  { id: 2, company_key: DEFAULT_DEMO_KEY, employee_id: 2, month: "2026-09", gross_salary: 130000, net_salary: 95000, sgk_employee: 18200, income_tax: 16800, bonus: 5000, emp_name: "Selin", emp_surname: "Yılmaz", emp_dept: "İnsan Kaynakları", emp_title: "İK Direktörü", paid_at: "2026-09-20" },
  { id: 3, company_key: DEFAULT_DEMO_KEY, employee_id: 3, month: "2026-09", gross_salary: 120000, net_salary: 88000, sgk_employee: 16800, income_tax: 15200, bonus: 0, emp_name: "Burak", emp_surname: "Kaya", emp_dept: "Yazılım & Teknoloji", emp_title: "Senior Backend Developer", paid_at: "2026-09-20" },
  { id: 4, company_key: DEFAULT_DEMO_KEY, employee_id: 4, month: "2026-09", gross_salary: 126000, net_salary: 92000, sgk_employee: 17640, income_tax: 16360, bonus: 4000, emp_name: "Elif", emp_surname: "Demir", emp_dept: "Ürün Tasarımı", emp_title: "Lead UI/UX Designer", paid_at: "2026-09-20" },
  { id: 5, company_key: DEFAULT_DEMO_KEY, employee_id: 5, month: "2026-09", gross_salary: 107000, net_salary: 78000, sgk_employee: 14980, income_tax: 14020, bonus: 0, emp_name: "Can", emp_surname: "Öztürk", emp_dept: "Finans & Muhasebe", emp_title: "Bordro ve Mali İşler Uzmanı", paid_at: "2026-09-20" }
];

const SEED_PLUGINS = [
  {
    id: "plugin_birthday_tracker",
    company_key: DEFAULT_DEMO_KEY,
    name: "🎂 Doğum Günü & Kutlama Radarı",
    description: "Şirkette bu ay doğan çalışanları listeler ve anında tebrik mesajı göndermeyi sağlar.",
    category: "Kültür & Etkinlik",
    icon: "cake",
    author: "Yapay Zeka (Gemini)",
    is_active: 1,
    code_html: `
<div class="bday-container">
  <div class="bday-header">
    <span class="badge">Eylül / Ekim Dönemi</span>
    <button id="btnConfetti" class="btn-sm">🎉 Şirket Kutlaması Başlat</button>
  </div>
  <div id="bdayList" class="bday-list"></div>
</div>`,
    code_js: `
KodusSDK.getEmployees().then(employees => {
  const listEl = document.getElementById('bdayList');
  const bdays = [
    { name: 'Selin Yılmaz', dept: 'İnsan Kaynakları', date: '28 Eylül (4 Gün Sonra)' },
    { name: 'Ali Kerem Aydın', dept: 'Yazılım & Teknoloji', date: '5 Ekim' },
    { name: 'Burak Kaya', dept: 'Yazılım', date: '12 Ekim' }
  ];
  listEl.innerHTML = bdays.map(b => \`
    <div class="bday-item">
      <div class="bday-info">
        <strong>\${b.name}</strong>
        <span>\${b.dept} • <small class="text-accent">\${b.date}</small></span>
      </div>
      <button class="bday-btn" onclick="sendWish('\${b.name}')">🎈 Kutla</button>
    </div>
  \`).join('');
});
window.sendWish = function(name) {
  KodusSDK.notify('Tebrik İletildi', name + ' için tebrik mesajınız gönderildi!', 'success');
};
document.getElementById('btnConfetti').addEventListener('click', () => {
  KodusSDK.notify('Parti Zamanı!', 'Tüm ofis kanalında kutlama efekti tetiklendi! 🎊', 'info');
});`,
    code_css: `
.bday-container { font-family: inherit; }
.bday-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.badge { background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.btn-sm { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 11px; cursor: pointer; transition: 0.2s; }
.bday-list { display: flex; flex-direction: column; gap: 8px; }
.bday-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 8px 12px; border-radius: 10px; }
.bday-info strong { display: block; font-size: 13px; color: #f1f5f9; }
.bday-info span { font-size: 11px; color: #94a3b8; }
.text-accent { color: #f43f5e !important; font-weight: 600; }
.bday-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; }`
  }
];

const SEED_COMMUNITY = [
  { id: 1, title: "Nöbetçi Eczane ve Sağlık Destek Widget'ı", description: "Ofis yakınındaki nöbetçi eczaneleri ve anlaşmalı özel sağlık kuruluşlarını listeleyen harita eklentisi.", category: "Sağlık & İSG", department_origin: "İnsan Kaynakları", upvotes: 42 },
  { id: 2, title: "İkram ve İhtiyaç Bildirim Zili", description: "Toplantı odalarına su, kahve veya teknik destek çağırmak için tek tık bildirim gönderme aracı.", category: "Ofis & Operasyon", department_origin: "Yazılım & Teknoloji", upvotes: 35 },
  { id: 3, title: "Taksi & Servis Güzergah Takibi", description: "Mesaiye kalanlar için ortak taksi çağırma ve akşam servis kalkış saatlerini canlı gösteren widget.", category: "Ulaşım & Yan Haklar", department_origin: "Pazarlama", upvotes: 29 },
  { id: 4, title: "Çalışan Teşekkür ve Alkış Duvarı", description: "Birbirine yardım eden takım arkadaşlarının kudos/teşekkür puanı verip şirket panosunda paylaştığı sosyal modül.", category: "Kültür & Motivasyon", department_origin: "Ürün Tasarımı", upvotes: 68 }
];

function getLocal(key, seed) {
  const item = localStorage.getItem("kodus_db_" + key);
  if (!item) {
    localStorage.setItem("kodus_db_" + key, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(item); } catch (e) { return seed; }
}

function setLocal(key, data) {
  localStorage.setItem("kodus_db_" + key, JSON.stringify(data));
}

function generateRandomKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `KODUS-${part()}-${part()}-${part()}-${part()}`;
}

window.KodusAPI = {
  isLocalMode: window.location.protocol === "file:" || !window.location.origin.includes(":8080"),

  getCompanyKey() {
    return window.AppState?.currentUser?.company_key || "";
  },

  async request(endpoint, options = {}) {
    if (this.isLocalMode) {
      return this.handleLocalMock(endpoint, options);
    }

    try {
      const companyKey = this.getCompanyKey();
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "X-Company-Key": companyKey,
          ...(options.headers || {})
        },
        ...options
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`Server request failed on [${endpoint}], falling back to browser engine:`, err.message);
      this.isLocalMode = true;
      return this.handleLocalMock(endpoint, options);
    }
  },

  handleLocalMock(endpoint, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    const companyKey = this.getCompanyKey();

    // 1. Auth: Login
    if (endpoint === "/api/auth/login" && method === "POST") {
      const users = getLocal("users", SEED_USERS);
      const email = (body.email || "").trim().toLowerCase();
      const user = users.find(u => u.email.toLowerCase() === email && u.password === body.password);
      if (!user) {
        throw new Error("E-posta veya şifre hatalı.");
      }

      const companies = getLocal("companies", SEED_COMPANIES);
      const company = companies.find(c => c.company_key === user.company_key) || null;

      return { success: true, user, company };
    }

    // 2. Auth: Register
    if (endpoint === "/api/auth/register" && method === "POST") {
      const users = getLocal("users", SEED_USERS);
      const email = (body.email || "").trim().toLowerCase();

      if (users.find(u => u.email.toLowerCase() === email)) {
        throw new Error("Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.");
      }

      const companies = getLocal("companies", SEED_COMPANIES);
      let company = null;
      let userCompanyKey = null;

      if (!body.isAdmin) {
        const key = (body.companyKey || "").trim().toUpperCase();
        if (!key) throw new Error("Çalışan kaydı için şirket katılım anahtarı girmelisiniz.");
        company = companies.find(c => c.company_key.toUpperCase() === key);
        if (!company) throw new Error("Geçersiz şirket katılım kodu! Lütfen yöneticinizden aldığınız anahtarı kontrol ediniz.");
        userCompanyKey = company.company_key;
      }

      const newUser = {
        id: Date.now(),
        email,
        password: body.password,
        name: body.name,
        surname: body.surname,
        role: body.role || (body.isAdmin ? "hr_admin" : "employee"),
        company_key: userCompanyKey,
        department: body.department || "Genel",
        title: body.title || "Çalışan",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name}${body.surname}`
      };

      users.push(newUser);
      setLocal("users", users);

      // If registered as employee, immediately add to employees list so admin sees them!
      if (!body.isAdmin && userCompanyKey) {
        const emps = getLocal("employees", SEED_EMPLOYEES);
        emps.push({
          id: Date.now() + 1,
          company_key: userCompanyKey,
          user_id: newUser.id,
          name: newUser.name,
          surname: newUser.surname,
          email: newUser.email,
          phone: "+90 5XX XXX XX XX",
          department: newUser.department,
          title: newUser.title,
          role: newUser.role,
          salary: 75000,
          start_date: new Date().toISOString().split("T")[0],
          annual_leave_days: 14,
          used_leave_days: 0,
          avatar_url: newUser.avatar_url,
          status: "active"
        });
        setLocal("employees", emps);
      }

      return { success: true, user: newUser, company };
    }

    // 3. Create Company (Admin onboarding)
    if (endpoint === "/api/company/create" && method === "POST") {
      const companies = getLocal("companies", SEED_COMPANIES);
      const newKey = generateRandomKey();
      const newCompany = {
        id: Date.now(),
        name: body.name,
        company_key: newKey,
        sector: body.sector || "Teknoloji",
        owner_email: body.adminEmail,
        created_at: new Date().toISOString().replace("T", " ").slice(0, 19)
      };
      companies.push(newCompany);
      setLocal("companies", companies);

      // Link current admin user to this company
      const users = getLocal("users", SEED_USERS);
      const u = users.find(x => x.id === body.userId);
      if (u) {
        u.company_key = newKey;
        setLocal("users", users);
      }

      // Add admin as first employee in the directory
      const emps = getLocal("employees", SEED_EMPLOYEES);
      emps.push({
        id: Date.now() + 2,
        company_key: newKey,
        user_id: body.userId,
        name: u ? u.name : "Yönetici",
        surname: u ? u.surname : "Admin",
        email: body.adminEmail,
        phone: "+90 532 100 2030",
        department: "Yönetim & İK",
        title: "Şirket Yöneticisi & İK",
        role: "hr_admin",
        salary: 135000,
        start_date: new Date().toISOString().split("T")[0],
        annual_leave_days: 20,
        used_leave_days: 0,
        avatar_url: u ? u.avatar_url : "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
        status: "active"
      });
      setLocal("employees", emps);

      return { success: true, company: newCompany };
    }

    // 4. Stats (Scoped by company)
    if (endpoint === "/api/stats") {
      const employees = getLocal("employees", SEED_EMPLOYEES).filter(e => !companyKey || e.company_key === companyKey);
      const leaves = getLocal("leaves", SEED_LEAVES).filter(l => !companyKey || l.company_key === companyKey);
      const payrolls = getLocal("payrolls", SEED_PAYROLLS).filter(p => !companyKey || p.company_key === companyKey);
      const plugins = getLocal("plugins", SEED_PLUGINS).filter(p => !companyKey || !p.company_key || p.company_key === companyKey);
      const ideas = getLocal("community", SEED_COMMUNITY);

      return {
        active_employees: employees.filter(e => e.status === "active").length,
        on_leave_employees: employees.filter(e => e.status === "on_leave").length,
        pending_leaves: leaves.filter(l => l.status === "pending").length,
        monthly_payroll_total: payrolls.reduce((acc, p) => acc + p.gross_salary, 0),
        active_plugins: plugins.filter(p => p.is_active).length,
        community_ideas_count: ideas.length
      };
    }

    // 5. Employees (Scoped by company)
    if (endpoint === "/api/employees") {
      const allEmps = getLocal("employees", SEED_EMPLOYEES);
      if (method === "GET") {
        return allEmps.filter(e => !companyKey || e.company_key === companyKey);
      }
      if (method === "POST") {
        const newEmp = {
          id: Date.now(),
          company_key: companyKey,
          name: body.name,
          surname: body.surname,
          email: body.email,
          phone: body.phone || "+90 5XX XXX XX XX",
          department: body.department || "Yazılım & Teknoloji",
          title: body.title || "Uzman",
          role: body.role || "employee",
          salary: parseFloat(body.salary) || 75000,
          start_date: new Date().toISOString().split("T")[0],
          annual_leave_days: 14,
          used_leave_days: 0,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.name}${body.surname}`,
          status: "active"
        };
        allEmps.push(newEmp);
        setLocal("employees", allEmps);
        return { success: true, id: newEmp.id };
      }
    }

    // 6. Leaves (Scoped by company)
    if (endpoint === "/api/leaves") {
      const allLeaves = getLocal("leaves", SEED_LEAVES);
      if (method === "GET") {
        return allLeaves.filter(l => !companyKey || l.company_key === companyKey);
      }
      if (method === "POST") {
        const emp = getLocal("employees", SEED_EMPLOYEES).find(e => e.id === body.employee_id) || {};
        const newLeave = {
          id: Date.now(),
          company_key: companyKey,
          employee_id: body.employee_id,
          leave_type: body.leave_type || "Yıllık İzin",
          start_date: body.start_date,
          end_date: body.end_date,
          days: body.days || 1,
          reason: body.reason || "",
          status: "pending",
          emp_name: emp.name || "Kullanıcı",
          emp_surname: emp.surname || "",
          emp_dept: emp.department || "Yazılım",
          emp_avatar: emp.avatar_url || ""
        };
        allLeaves.unshift(newLeave);
        setLocal("leaves", allLeaves);
        return { success: true, id: newLeave.id };
      }
    }

    if (endpoint.startsWith("/api/leaves/") && method === "PATCH") {
      const id = parseInt(endpoint.split("/")[3]);
      const leaves = getLocal("leaves", SEED_LEAVES);
      const leave = leaves.find(l => l.id === id);
      if (leave) {
        leave.status = body.status;
        setLocal("leaves", leaves);

        if (body.status === "approved") {
          const emps = getLocal("employees", SEED_EMPLOYEES);
          const emp = emps.find(e => e.id === leave.employee_id);
          if (emp) {
            emp.used_leave_days = (emp.used_leave_days || 0) + leave.days;
            setLocal("employees", emps);
          }
        }
      }
      return { success: true };
    }

    // 7. Payrolls
    if (endpoint === "/api/payrolls") {
      return getLocal("payrolls", SEED_PAYROLLS).filter(p => !companyKey || p.company_key === companyKey);
    }

    // 8. Plugins
    if (endpoint === "/api/plugins") {
      const plugins = getLocal("plugins", SEED_PLUGINS);
      if (method === "GET") {
        return plugins.filter(p => !p.company_key || p.company_key === companyKey);
      }
      if (method === "POST") {
        const p = { ...body, company_key: companyKey, is_active: 1 };
        const idx = plugins.findIndex(x => x.id === p.id);
        if (idx >= 0) plugins[idx] = p;
        else plugins.unshift(p);
        setLocal("plugins", plugins);
        return { success: true, id: p.id };
      }
    }

    if (endpoint.startsWith("/api/plugins/") && method === "DELETE") {
      const id = endpoint.split("/")[3];
      const plugins = getLocal("plugins", SEED_PLUGINS).filter(p => p.id !== id);
      setLocal("plugins", plugins);
      return { success: true };
    }

    // 9. Community Ideas
    if (endpoint === "/api/community-ideas") {
      return getLocal("community", SEED_COMMUNITY);
    }

    if (endpoint.startsWith("/api/community-ideas/") && endpoint.endsWith("/upvote")) {
      const id = parseInt(endpoint.split("/")[3]);
      const ideas = getLocal("community", SEED_COMMUNITY);
      const target = ideas.find(i => i.id === id);
      if (target) target.upvotes = (target.upvotes || 0) + 1;
      setLocal("community", ideas);
      return { success: true };
    }

    // 10. AI Generate Plugin
    if (endpoint === "/api/ai/generate") {
      const plugin = this.synthesizeClientPlugin(body.prompt);
      if (body.shareAnonymously) {
        const ideas = getLocal("community", SEED_COMMUNITY);
        ideas.unshift({
          id: Date.now(),
          title: plugin.name,
          description: plugin.description,
          category: plugin.category,
          department_origin: body.departmentOrigin || "Genel",
          upvotes: 1,
          plugin_payload: JSON.stringify(plugin)
        });
        setLocal("community", ideas);
      }
      return { success: true, plugin, shared_anonymously: body.shareAnonymously };
    }

    return {};
  },

  synthesizeClientPlugin(prompt) {
    const p = prompt.toLowerCase();
    const id = "ai_plugin_" + Math.random().toString(36).substring(2, 9);

    if (p.includes("mesai") || p.includes("mola") || p.includes("pomodoro") || p.includes("saat") || p.includes("timer")) {
      return {
        id,
        name: "⏱️ Akıllı Mesai & Dinlenme Sayacı",
        description: "Günlük odaklanma sürelerini ölçer, 25 dk çalışma ve 5 dk ergonomik mola hatırlatır.",
        category: "Verimlilik & Sağlık",
        icon: "clock",
        code_html: `
<div class="timer-widget">
  <div class="timer-display" id="timeDisplay">25:00</div>
  <div class="timer-badge" id="timerStatus">Odaklanma Modu (Çalışma)</div>
  <div class="timer-actions">
    <button id="btnToggle" class="btn-primary" onclick="toggleTimer()">▶ Başlat</button>
    <button class="btn-secondary" onclick="resetTimer()">↺ Sıfırla</button>
    <button class="btn-break" onclick="takeBreak()">☕ Mola Ver</button>
  </div>
  <div class="timer-stats">
    <span>Tamamlanan: <strong id="sessionCount">0</strong> Oturum</span>
    <span>Puan: <strong id="scoreCount">0 XP</strong></span>
  </div>
</div>`,
        code_js: `
let timeLeft = 25 * 60, isRunning = false, timerInterval = null;
let sessions = KodusSDK.storage.get('sessions') || 0;
document.getElementById('sessionCount').innerText = sessions;
document.getElementById('scoreCount').innerText = (sessions * 50) + ' XP';

window.updateDisplay = function() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timeDisplay').innerText = m + ':' + s;
};

window.toggleTimer = function() {
  const btn = document.getElementById('btnToggle');
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    btn.innerText = '▶ Devam Et';
  } else {
    isRunning = true;
    btn.innerText = '⏸ Duraklat';
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        sessions++;
        KodusSDK.storage.set('sessions', sessions);
        document.getElementById('sessionCount').innerText = sessions;
        document.getElementById('scoreCount').innerText = (sessions * 50) + ' XP';
        KodusSDK.notify('Tebrikler!', '25 dakikalık odaklanma tamamlandı! 5 dk mola zamanı.', 'success');
        resetTimer();
      }
    }, 1000);
  }
};

window.resetTimer = function() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 25 * 60;
  document.getElementById('btnToggle').innerText = '▶ Başlat';
  document.getElementById('timerStatus').innerText = 'Odaklanma Modu (Çalışma)';
  updateDisplay();
};

window.takeBreak = function() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 5 * 60;
  document.getElementById('timerStatus').innerText = '☕ 5 Dakika Dinlenme Molası';
  document.getElementById('btnToggle').innerText = '▶ Molayı Başlat';
  updateDisplay();
  KodusSDK.notify('Mola Zamanı', 'Gözlerini dinlendir ve su içmeyi unutma!', 'info');
};`,
        code_css: `
.timer-widget { text-align: center; font-family: inherit; }
.timer-display { font-size: 38px; font-weight: 800; font-family: monospace; color: #38bdf8; text-shadow: 0 0 15px rgba(56,189,248,0.3); margin: 6px 0; }
.timer-badge { display: inline-block; font-size: 11px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }
.timer-actions { display: flex; justify-content: center; gap: 8px; margin-bottom: 14px; }
.timer-actions button { border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary { background: linear-gradient(135deg, #0284c7, #2563eb); color: white; }
.btn-secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }
.btn-break { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.timer-stats { display: flex; justify-content: space-around; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; }
.timer-stats strong { color: #f8fafc; }`
      };
    }

    if (p.includes("kudos") || p.includes("teşekkür") || p.includes("alkış") || p.includes("motivasyon") || p.includes("ödül")) {
      return {
        id,
        name: "🌟 Şirket İçi Kudos & Alkış Duvarı",
        description: "Çalışanların birbirine başarı ve destekleri için dijital rozet ve tebrik göndermesini sağlar.",
        category: "Kültür & Motivasyon",
        icon: "award",
        code_html: `
<div class="kudos-widget">
  <div class="kudos-input-row">
    <select id="kudosTarget" class="kudos-select"><option value="">Kime Teşekkür Etmek İstersin?</option></select>
    <select id="kudosBadge" class="kudos-badge-select">
      <option value="🚀 Süper Hızlı Çözüm">🚀 Hız</option>
      <option value="💡 Harika Fikir">💡 Fikir</option>
      <option value="🤝 Takım Oyuncusu">🤝 Takım</option>
      <option value="🎯 Kusursuz Teslim">🎯 Teslim</option>
    </select>
  </div>
  <div class="kudos-note-row">
    <input type="text" id="kudosMsg" placeholder="Kısa bir teşekkür notu yaz..." class="kudos-input" />
    <button onclick="sendKudos()" class="kudos-send-btn">Gönder 🎉</button>
  </div>
  <div class="kudos-feed" id="kudosFeed"></div>
</div>`,
        code_js: `
KodusSDK.getEmployees().then(employees => {
  const sel = document.getElementById('kudosTarget');
  employees.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.name + ' ' + e.surname;
    opt.innerText = e.name + ' ' + e.surname + ' (' + e.department + ')';
    sel.appendChild(opt);
  });
});
let feed = KodusSDK.storage.get('kudos_items') || [
  { target: 'Burak Kaya', badge: '🚀 Süper Hızlı Çözüm', msg: 'Veritabanı optimizasyonundaki desteğin için çok sağ ol!', from: 'Ali Kerem' },
  { target: 'Elif Demir', badge: '💡 Harika Fikir', msg: 'Yeni tasarım sistemimiz harika oldu!', from: 'Selin Y.' }
];
window.renderFeed = function() {
  document.getElementById('kudosFeed').innerHTML = feed.slice(0, 3).map(k => \`
    <div class="kudos-card">
      <div class="kudos-card-header">
        <strong>\${k.target}</strong>
        <span class="badge-tag">\${k.badge}</span>
      </div>
      <p class="kudos-msg">"\${k.msg}"</p>
      <span class="kudos-from">— \${k.from}</span>
    </div>
  \`).join('');
};
renderFeed();
window.sendKudos = function() {
  const target = document.getElementById('kudosTarget').value;
  const badge = document.getElementById('kudosBadge').value;
  const msg = document.getElementById('kudosMsg').value;
  if (!target || !msg) {
    KodusSDK.notify('Eksik Alan', 'Lütfen çalışma arkadaşı ve teşekkür notu girin.', 'warning');
    return;
  }
  feed.unshift({ target, badge, msg, from: 'Siz' });
  KodusSDK.storage.set('kudos_items', feed);
  renderFeed();
  document.getElementById('kudosMsg').value = '';
  KodusSDK.notify('Kudos İletildi!', target + ' kişisine tebriğiniz şirket panosunda paylaşıldı!', 'success');
};`,
        code_css: `
.kudos-widget { font-family: inherit; }
.kudos-input-row, .kudos-note-row { display: flex; gap: 8px; margin-bottom: 8px; }
.kudos-select, .kudos-badge-select, .kudos-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; padding: 6px 10px; border-radius: 8px; font-size: 12px; outline: none; }
.kudos-select { flex: 2; }
.kudos-badge-select { flex: 1; }
.kudos-input { flex: 3; }
.kudos-send-btn { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.kudos-feed { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; max-height: 160px; overflow-y: auto; }
.kudos-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 8px 10px; border-radius: 8px; }
.kudos-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.badge-tag { font-size: 10px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 6px; border-radius: 4px; }
.kudos-msg { margin: 4px 0 2px; font-size: 11px; color: #cbd5e1; font-style: italic; }
.kudos-from { font-size: 10px; color: #94a3b8; }`
      };
    }

    const titleWords = prompt.trim().split(" ").slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      id,
      name: `✨ ${titleWords || "Özel İK Widget'ı"}`,
      description: `'${prompt.slice(0, 50)}' talebiniz doğrultusunda Gemini AI tarafından üretilen modüler widget.`,
      category: "Özel Eklenti",
      icon: "zap",
      code_html: `
<div class="custom-plugin-card">
  <div class="plugin-title-bar">
    <span class="custom-tag">Yapay Zeka Eklentisi</span>
    <span class="live-dot">● Canlı</span>
  </div>
  <div class="plugin-body-text"><p><strong>Talep:</strong> ${prompt}</p></div>
  <div class="custom-actions">
    <button class="action-btn" onclick="executeCustomTask()">⚡ Görevi Çalıştır</button>
    <button class="secondary-btn" onclick="checkData()">📊 Veri Çek</button>
  </div>
  <div id="outputBox" class="output-console" style="display:none;"></div>
</div>`,
      code_js: `
window.executeCustomTask = function() {
  KodusSDK.notify('İşlem Başarılı', 'Eklenti görevi başarıyla tetiklendi.', 'success');
  const out = document.getElementById('outputBox');
  out.style.display = 'block';
  out.innerText = 'Son işlem zamanı: ' + new Date().toLocaleTimeString();
};
window.checkData = function() {
  KodusSDK.getEmployees().then(list => {
    const out = document.getElementById('outputBox');
    out.style.display = 'block';
    out.innerText = 'Sistemde ' + list.length + ' kayıtlı çalışan bulundu. Entegrasyon aktif.';
  });
};`,
      code_css: `
.custom-plugin-card { font-family: inherit; }
.plugin-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.custom-tag { font-size: 11px; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
.live-dot { font-size: 11px; color: #10b981; }
.plugin-body-text p { font-size: 12px; color: #cbd5e1; margin: 4px 0 10px; }
.custom-actions { display: flex; gap: 8px; }
.action-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; border: none; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.secondary-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 7px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
.output-console { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); padding: 8px; border-radius: 6px; font-size: 11px; font-family: monospace; color: #38bdf8; margin-top: 8px; }`
    };
  },

  // Auth Methods
  login(email, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  register(userData) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  createCompany(name, sector, adminUser) {
    return this.request("/api/company/create", {
      method: "POST",
      body: JSON.stringify({
        name,
        sector,
        userId: adminUser.id,
        adminEmail: adminUser.email
      })
    });
  },

  // Entity Methods
  fetchStats() { return this.request("/api/stats"); },
  fetchEmployees() { return this.request("/api/employees"); },
  createEmployee(data) { return this.request("/api/employees", { method: "POST", body: JSON.stringify(data) }); },
  fetchLeaves() { return this.request("/api/leaves"); },
  createLeaveRequest(data) { return this.request("/api/leaves", { method: "POST", body: JSON.stringify(data) }); },
  updateLeaveStatus(leaveId, status, approvedBy = 1) { return this.request(`/api/leaves/${leaveId}`, { method: "PATCH", body: JSON.stringify({ status, approved_by: approvedBy }) }); },
  fetchPayrolls() { return this.request("/api/payrolls"); },
  fetchPlugins() { return this.request("/api/plugins"); },
  installPlugin(pluginData) { return this.request("/api/plugins", { method: "POST", body: JSON.stringify(pluginData) }); },
  deletePlugin(pluginId) { return this.request(`/api/plugins/${pluginId}`, { method: "DELETE" }); },
  generatePlugin(prompt, apiKey = "", shareAnonymously = false, departmentOrigin = "Yazılım") {
    return this.request("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt, apiKey, shareAnonymously, departmentOrigin }) });
  },
  fetchCommunityIdeas() { return this.request("/api/community-ideas"); },
  upvoteCommunityIdea(ideaId) { return this.request(`/api/community-ideas/${ideaId}/upvote`, { method: "POST" }); }
};
