/**
 * Kodus HR - Authentication View (Login, Register & Multi-Tenant Onboarding)
 */

window.AuthView = {
  currentTab: "login", // 'login' | 'register'
  isAdminRegister: false,

  render(container) {
    container.innerHTML = `
      <div class="auth-viewport fade-in">
        <div class="auth-card">
          <!-- Auth Brand Header -->
          <div class="auth-brand">
            <div class="logo-icon" style="width: 46px; height: 46px; font-size: 22px; margin: 0 auto 12px;">K</div>
            <h2>Kodus İK Platformu</h2>
            <p>Yapay Zeka Destekli Kurumsal İnsan Kaynakları SaaS</p>
          </div>

          <!-- Auth Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab-btn ${this.currentTab === 'login' ? 'active' : ''}" onclick="window.AuthView.switchTab('login')">
              Giriş Yap
            </button>
            <button class="auth-tab-btn ${this.currentTab === 'register' ? 'active' : ''}" onclick="window.AuthView.switchTab('register')">
              Yeni Hesap Oluştur
            </button>
          </div>

          <!-- Tab 1: Login Form -->
          ${this.currentTab === 'login' ? `
            <form onsubmit="window.AuthView.submitLogin(event)" class="auth-form">
              <div class="form-group">
                <label>Kurumsal E-Posta</label>
                <input type="email" id="loginEmail" class="form-control" placeholder="ad.soyad@sirketiniz.com" required value="alikerem@kodus.ai">
              </div>

              <div class="form-group">
                <label>Şifre</label>
                <input type="password" id="loginPassword" class="form-control" placeholder="••••••" required value="123">
              </div>

              <button type="submit" class="btn-primary-auth">
                Sisteme Giriş Yap →
              </button>

              <div class="auth-divider">
                <span>VEYA TEST İÇİN HIZLI DEMO GİRİŞİ</span>
              </div>

              <div class="quick-demo-buttons">
                <button type="button" class="btn-demo-chip" onclick="window.AuthView.quickLogin('alikerem@kodus.ai')">
                  👔 Demo Şirket Yöneticisi (Ali Kerem)
                </button>
                <button type="button" class="btn-demo-chip" onclick="window.AuthView.quickLogin('burak.kaya@kodus.ai')">
                  💻 Demo Çalışan (Burak Kaya)
                </button>
              </div>
            </form>
          ` : `
            <!-- Tab 2: Register Form -->
            <form onsubmit="window.AuthView.submitRegister(event)" class="auth-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Ad</label>
                  <input type="text" id="regName" class="form-control" placeholder="Örn: Ayşe" required>
                </div>
                <div class="form-group">
                  <label>Soyad</label>
                  <input type="text" id="regSurname" class="form-control" placeholder="Örn: Yılmaz" required>
                </div>
              </div>

              <div class="form-group">
                <label>E-Posta Adresi</label>
                <input type="email" id="regEmail" class="form-control" placeholder="ad.soyad@sirket.com" required>
              </div>

              <div class="form-group">
                <label>Şifre Belirleyin</label>
                <input type="password" id="regPassword" class="form-control" placeholder="En az 6 karakter" required minlength="3">
              </div>

              <!-- Admin or Employee Mode Toggle -->
              <div class="admin-checkbox-card">
                <label class="optin-label">
                  <input type="checkbox" id="regIsAdmin" onchange="window.AuthView.toggleAdminRegister(this.checked)">
                  <div class="optin-text">
                    <strong>👑 Şirket Yöneticisi / İK / Muhasebe Olarak Kaydol</strong>
                    <p>İşaretlendiğinde şirketinizin İK ağını kurabilir ve çalışanlarınıza katılım anahtarı dağıtabilirsiniz.</p>
                  </div>
                </label>
              </div>

              ${!this.isAdminRegister ? `
                <!-- Employee Specific Fields: Company Invite Key Required! -->
                <div class="company-key-input-card">
                  <div class="form-group" style="margin-bottom:6px;">
                    <label style="color:#38bdf8; font-weight:700;">🔑 Şirket Katılım Anahtarı (Zorunlu)</label>
                    <input type="text" id="regCompanyKey" class="form-control key-input" 
                      placeholder="Örn: KODUS-DEMO-8A9F-2026-HQ01" required>
                  </div>
                  <span style="font-size:11.5px; color:var(--text-muted); display:block;">
                    💡 Şirketinizin İK yöneticisinden aldığınız anahtar kodunu buraya giriniz. Otomatik olarak şirket ağına bağlanacaksınız.
                  </span>
                </div>

                <div class="form-row" style="margin-top:10px;">
                  <div class="form-group">
                    <label>Departmanınız</label>
                    <select id="regDept" class="form-control">
                      <option value="Yazılım & Teknoloji">Yazılım & Teknoloji</option>
                      <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                      <option value="Ürün Tasarımı">Ürün Tasarımı</option>
                      <option value="Finans & Muhasebe">Finans & Muhasebe</option>
                      <option value="Pazarlama & Büyüme">Pazarlama & Büyüme</option>
                      <option value="Satış & Operasyon">Satış & Operasyon</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Unvanınız</label>
                    <input type="text" id="regTitle" class="form-control" placeholder="Örn: Frontend Developer" required>
                  </div>
                </div>
              ` : `
                <!-- Admin Specific Notice & Role -->
                <div class="admin-role-select-box">
                  <div class="form-group">
                    <label>Yönetici Rolü</label>
                    <select id="regAdminRole" class="form-control">
                      <option value="hr_admin">İK Direktörü / Müdürü (Tüm Yetkiler)</option>
                      <option value="finance">Muhasebe & Bordro Yöneticisi</option>
                    </select>
                  </div>
                  <div style="font-size:12px; color:#a5b4fc; background:rgba(99,102,241,0.12); padding:10px 12px; border-radius:8px; border:1px solid rgba(99,102,241,0.25);">
                    ℹ️ Kaydınızın hemen ardından panelinizde <strong>"Yeni İK Şirket Ağı Oluştur"</strong> butonu çıkacak; şirket adınızı girdiğinizde çalışanlarınıza dağıtacağınız katılım anahtarınız üretilecektir.
                  </div>
                </div>
              `}

              <button type="submit" class="btn-primary-auth" style="margin-top: 14px;">
                ${this.isAdminRegister ? 'Yönetici Hesabı Oluştur →' : 'Şirket Ağına Katıl →'}
              </button>
            </form>
          `}
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render(document.getElementById("view-container"));
  },

  toggleAdminRegister(checked) {
    this.isAdminRegister = checked;
    this.render(document.getElementById("view-container"));
  },

  async submitLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await window.KodusAPI.login(email, password);
      window.AppState.setSession(res.user, res.company);
      window.App.showToast("Giriş Başarılı", `Hoş geldiniz, ${res.user.name}!`, "success");
      await window.App.refreshData();
      window.App.navigate("dashboard");
    } catch (err) {
      window.App.showToast("Giriş Hatası", err.message, "error");
    }
  },

  async submitRegister(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const surname = document.getElementById("regSurname").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    const data = {
      name,
      surname,
      email,
      password,
      isAdmin: this.isAdminRegister
    };

    if (this.isAdminRegister) {
      data.role = document.getElementById("regAdminRole")?.value || "hr_admin";
      data.department = "Yönetim & İK";
      data.title = data.role === "finance" ? "Muhasebe Müdürü" : "İK Direktörü";
    } else {
      data.companyKey = document.getElementById("regCompanyKey").value.trim().toUpperCase();
      data.department = document.getElementById("regDept").value;
      data.title = document.getElementById("regTitle").value.trim();
      data.role = "employee";
    }

    try {
      const res = await window.KodusAPI.register(data);
      window.AppState.setSession(res.user, res.company);
      window.App.showToast("Kayıt Başarılı", `Hesabınız başarıyla oluşturuldu!`, "success");
      await window.App.refreshData();
      window.App.navigate("dashboard");
    } catch (err) {
      window.App.showToast("Kayıt Başarısız", err.message, "error");
    }
  },

  async quickLogin(email) {
    try {
      const res = await window.KodusAPI.login(email, "123");
      window.AppState.setSession(res.user, res.company);
      window.App.showToast("Hızlı Giriş Yapıldı", `Profil: ${res.user.name} (${res.user.role})`, "success");
      await window.App.refreshData();
      window.App.navigate("dashboard");
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  }
};
