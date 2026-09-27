/**
 * Kodus HR - Dashboard View
 * Supports empty state onboarding for fresh admins (creating company network & invite key),
 * as well as the active company dashboard with sandboxed AI plugins.
 */

window.DashboardView = {
  render(container) {
    const user = window.AppState.currentUser;
    const company = window.AppState.currentCompany;
    const stats = window.AppState.stats || {};
    const plugins = window.AppState.plugins || [];
    const employees = window.AppState.employees || [];
    const pendingLeaves = (window.AppState.leaves || []).filter(l => l.status === "pending");

    // Case 1: Fresh Admin who has NOT created a company network yet!
    if (!company && (user.role === "hr_admin" || user.role === "finance")) {
      container.innerHTML = `
        <div class="fade-in onboarding-container">
          <div class="card onboarding-hero-card">
            <div class="onboarding-icon">🏢</div>
            <div class="onboarding-badge">Yeni Yönetici Karşılama</div>
            <h2>Hoş Geldiniz, ${user.name} 👋</h2>
            <p>
              Yönetici hesabınız hazır. Kodus İK'yı kullanmaya başlamak için öncelikle şirketinizin <strong>İK Ağını</strong> başlatmanız gerekmektedir.
            </p>

            <div class="onboarding-step-box">
              <div class="step-item">
                <span class="step-num">1</span>
                <div>
                  <strong>Şirket Adınızı Belirleyin</strong>
                  <p>İK ağınızın kurumsal kimliğini oluşturun.</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-num">2</span>
                <div>
                  <strong>Benzersiz Katılım Anahtarı Üretin</strong>
                  <p>Çalışanlarınızın panele güvenle bağlanması için uzun bir güvenlik anahtarı oluşturulur.</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-num">3</span>
                <div>
                  <strong>Çalışanları Panele Dahil Edin</strong>
                  <p>Çalışanlar bu kodla kaydoldukça anında dashboard'unuzda listelenmeye başlar.</p>
                </div>
              </div>
            </div>

            <button class="btn-primary-auth btn-lg-action" onclick="window.DashboardView.openCreateCompanyModal()">
              🏢 Yeni İK Şirket Ağı Oluştur →
            </button>
          </div>
        </div>

        <!-- Modal for Creating Company Network -->
        <div id="createCompanyModal" class="modal-overlay">
          <div class="modal-dialog" style="max-width: 520px;">
            <div class="modal-header">
              <h3>🏢 Şirket İK Ağı Kurulumu</h3>
              <button class="widget-control-btn" onclick="window.DashboardView.closeCreateCompanyModal()">✕</button>
            </div>
            <form onsubmit="window.DashboardView.submitCreateCompany(event)">
              <div class="modal-body">
                <div class="form-group">
                  <label>Şirket Resmi Ünvanı / Adı</label>
                  <input type="text" id="newCompanyName" class="form-control" placeholder="Örn: Acme Teknoloji A.Ş." required>
                </div>

                <div class="form-group">
                  <label>Faaliyet Sektörü</label>
                  <select id="newCompanySector" class="form-control">
                    <option value="Yazılım & Teknoloji">Yazılım & Teknoloji</option>
                    <option value="E-Ticaret & Perakende">E-Ticaret & Perakende</option>
                    <option value="Finans & Bankacılık">Finans & Bankacılık</option>
                    <option value="Sağlık & Medikal">Sağlık & Medikal</option>
                    <option value="Üretim & Sanayi">Üretim & Sanayi</option>
                    <option value="Hizmet & Danışmanlık">Hizmet & Danışmanlık</option>
                  </select>
                </div>

                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px; padding: 12px; font-size: 12px; color: #a5b4fc;">
                  🔑 <em>Butona bastığınız anda çalışanlarınızın kayıt olurken gireceği özel bir anahtar kod (Invite Key) üretilecektir.</em>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="chip-btn" onclick="window.DashboardView.closeCreateCompanyModal()">Vazgeç</button>
                <button type="submit" class="btn-generate-ai">Ağı Başlat ve Anahtar Üret</button>
              </div>
            </form>
          </div>
        </div>
      `;
      return;
    }

    // Case 2: Active Company Dashboard!
    container.innerHTML = `
      <div class="fade-in">
        <!-- Prominent Company & Invite Key Banner -->
        ${company ? `
          <div class="company-invite-banner card">
            <div class="invite-banner-left">
              <div class="company-badge-icon">🏢</div>
              <div>
                <h3 class="company-title-text">${company.name}</h3>
                <span class="company-sector-text">${company.sector || 'Kurumsal Şirket'} • İK Yönetim Ağı</span>
              </div>
            </div>

            <div class="invite-banner-right">
              <div class="key-display-box">
                <span class="key-label">Şirket Katılım Anahtarı:</span>
                <code class="key-code" id="companyKeyCode">${company.company_key}</code>
              </div>
              <button class="btn-copy-key" onclick="window.DashboardView.copyCompanyKey('${company.company_key}')" title="Panoya Kopyala">
                📋 Kodu Kopyala
              </button>
            </div>
          </div>
        ` : ''}

        <!-- KPI Stat Cards -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-blue">👥</div>
            <div class="kpi-content">
              <h4>Kayıtlı Çalışan</h4>
              <div class="kpi-value">${employees.length} Kişi</div>
              <div class="kpi-trend trend-up">● Şirket kadrosu</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-emerald">🌴</div>
            <div class="kpi-content">
              <h4>İzinli Personel</h4>
              <div class="kpi-value">${stats.on_leave_employees ?? 0}</div>
              <div class="kpi-trend">Bu hafta izinli</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-amber">⏳</div>
            <div class="kpi-content">
              <h4>Bekleyen Onaylar</h4>
              <div class="kpi-value">${pendingLeaves.length}</div>
              <div class="kpi-trend trend-warning">⚠️ Aksiyon bekleyen</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-purple">⚡</div>
            <div class="kpi-content">
              <h4>Aktif AI Eklentileri</h4>
              <div class="kpi-value">${plugins.length}</div>
              <div class="kpi-trend trend-up">🚀 Sandbox runtime</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-rose">💳</div>
            <div class="kpi-content">
              <h4>Aylık Bordro</h4>
              <div class="kpi-value">${window.AppState.maskSensitiveData ? "₺•••.•••" : (stats.monthly_payroll_total ? "₺" + Number(stats.monthly_payroll_total).toLocaleString("tr-TR") : "₺" + Number(employees.reduce((acc, e) => acc + (e.salary || 70000), 0)).toLocaleString("tr-TR"))}</div>
              <div class="kpi-trend trend-up">Eylül 2026 dönemi</div>
            </div>
          </div>
        </div>

        <!-- If only 1 employee (admin), show helper invite card -->
        ${employees.length <= 1 ? `
          <div class="card invite-notice-card" style="margin-bottom: 24px;">
            <div style="display:flex; align-items:center; gap:16px;">
              <span style="font-size:28px;">📢</span>
              <div style="flex:1;">
                <h4 style="font-size:14.5px; font-weight:700; color:#38bdf8;">Çalışanlarınızı Şirket Ağına Davet Edin</h4>
                <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                  Yukarıdaki <strong>${company?.company_key}</strong> anahtarını çalışma arkadaşlarınıza iletin. Çalışanlar kayıt olurken bu kodu girdiğinde otomatik olarak bu ekranda listelenecektir.
                </p>
              </div>
              <button class="chip-btn" onclick="window.DashboardView.copyCompanyKey('${company?.company_key}')" style="background:#0284c7; color:white; border:none; padding:8px 16px; font-size:12px; font-weight:600;">
                Anahtarı Kopyala
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Dashboard Layout: Dynamic Plugins Grid & Right Activity Column -->
        <div class="dashboard-layout">
          <!-- Left Column: AI-Generated Sandboxed Plugins -->
          <div class="plugins-section">
            <div class="section-header">
              <h3>
                <span>⚡ Dinamik AI Eklenti Panosu</span>
                <span class="ai-tag">Sandbox Canlı Çalıştırma</span>
              </h3>
              <div class="section-actions">
                <button class="chip-btn" onclick="window.App.navigate('ai-studio')">+ Yeni AI Eklentisi Üret</button>
              </div>
            </div>

            <div class="plugins-masonry" id="dashboardPluginsContainer">
              ${plugins.length === 0 ? `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                  <p style="color: var(--text-muted); margin-bottom: 12px;">Henüz bu şirket için aktif eklenti bulunmuyor.</p>
                  <button class="btn-generate-ai" onclick="window.App.navigate('ai-studio')" style="margin: 0 auto;">✨ Yapay Zeka ile Eklenti Üret</button>
                </div>
              ` : ""}
            </div>
          </div>

          <!-- Right Column: Pending Approvals & Quick Workflow -->
          <div class="activity-section">
            <div class="card" style="margin-bottom: 20px;">
              <div class="section-header">
                <h3>🗓️ Bekleyen İzin Talepleri</h3>
                <span class="nav-badge">${pendingLeaves.length}</span>
              </div>
              <div class="pending-list" style="display: flex; flex-direction: column; gap: 10px;">
                ${pendingLeaves.length === 0 ? '<p style="color:var(--text-muted);font-size:12px;">Bekleyen talep bulunmuyor.</p>' : ''}
                ${pendingLeaves.map(leave => `
                  <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <strong style="font-size:13px;">${leave.emp_name} ${leave.emp_surname}</strong>
                      <span class="status-pill status-pending">${leave.days} Gün</span>
                    </div>
                    <p style="font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">${leave.leave_type} • ${leave.start_date} - ${leave.end_date}</p>
                    <p style="font-size:11.5px; color:var(--text-secondary); margin-bottom:10px; font-style:italic;">"${leave.reason || 'Mazeret belirtilmedi'}"</p>
                    
                    ${user.role === 'hr_admin' || user.role === 'manager' ? `
                      <div style="display:flex; gap:6px;">
                        <button class="chip-btn" style="background:#10b981; color:white; border:none; padding:4px 10px; font-size:11px;" onclick="window.LeavesView.handleApproval(${leave.id}, 'approved')">✓ Onayla</button>
                        <button class="chip-btn" style="background:rgba(239,68,68,0.2); color:#f87171; border:none; padding:4px 10px; font-size:11px;" onclick="window.LeavesView.handleApproval(${leave.id}, 'rejected')">✕ Reddet</button>
                      </div>
                    ` : `
                      <span style="font-size:11px; color:#fbbf24;">⏳ Yönetici onayı bekleniyor</span>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Architecture Banner -->
            <div class="card" style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08)); border-color: rgba(99,102,241,0.25);">
              <h4 style="font-size:13px; font-weight:700; color:#c084fc; margin-bottom:6px;">💡 SaaS ve Çok Kiracılı Mimari</h4>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:10px;">
                Masaüstü uygulamaların aksine, çalışanlarınız yalnızca şirket katılım koduyla anında ağınıza dahil olur ve veriler merkezi olarak izole edilir.
              </p>
              <button class="chip-btn" onclick="window.App.navigate('kvkk')" style="font-size:11px;">Mimarinin Detayları →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.mountPlugins();
  },

  mountPlugins() {
    const container = document.getElementById("dashboardPluginsContainer");
    if (!container) return;

    const plugins = (window.AppState.plugins || []).filter(p => p.is_active);

    plugins.forEach(plugin => {
      const widgetDiv = document.createElement("div");
      widgetDiv.className = "plugin-widget-container";
      widgetDiv.innerHTML = `
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-title">${plugin.name}</span>
            <span class="widget-badge">${plugin.category}</span>
          </div>
          <div class="widget-controls">
            <button class="widget-control-btn" title="Kodu İncele" onclick="window.App.inspectPlugin('${plugin.id}')">⚙️</button>
            <button class="widget-control-btn" title="Kaldır" onclick="window.App.uninstallPlugin('${plugin.id}')">✕</button>
          </div>
        </div>
        <div class="widget-body" id="widget-body-${plugin.id}"></div>
      `;

      container.appendChild(widgetDiv);

      const bodyEl = widgetDiv.querySelector(`#widget-body-${plugin.id}`);
      window.SandboxBridge.mount(bodyEl, plugin);
    });
  },

  openCreateCompanyModal() {
    document.getElementById("createCompanyModal")?.classList.add("active");
  },

  closeCreateCompanyModal() {
    document.getElementById("createCompanyModal")?.classList.remove("active");
  },

  async submitCreateCompany(e) {
    e.preventDefault();
    const name = document.getElementById("newCompanyName").value.trim();
    const sector = document.getElementById("newCompanySector").value;
    const user = window.AppState.currentUser;

    try {
      const res = await window.KodusAPI.createCompany(name, sector, user);
      user.company_key = res.company.company_key;
      window.AppState.setSession(user, res.company);
      this.closeCreateCompanyModal();
      window.App.showToast("Şirket Ağı Kuruldu! 🎉", `Katılım anahtarınız: ${res.company.company_key}`, "success");
      await window.App.refreshData();
      this.render(document.getElementById("view-container"));
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  },

  copyCompanyKey(key) {
    if (!key) return;
    navigator.clipboard.writeText(key).then(() => {
      window.App.showToast("Anahtar Kopyalandı 📋", `Şirket Kodu: ${key} panoya kopyalandı. Çalışanlarınızla paylaşabilirsiniz!`, "success");
    }).catch(() => {
      // Fallback
      window.App.showToast("Şirket Kodu", key, "info");
    });
  }
};
