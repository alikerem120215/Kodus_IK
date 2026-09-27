/**
 * Kodus HR - Employee Management View (KVKK Compliant)
 */

window.EmployeesView = {
  selectedDept: "all",
  searchQuery: "",

  render(container) {
    const employees = window.AppState.employees || [];
    const isMasked = window.AppState.maskSensitiveData;

    // Filter employees
    const filtered = employees.filter(emp => {
      const matchDept = this.selectedDept === "all" || emp.department === this.selectedDept;
      const fullText = `${emp.name} ${emp.surname} ${emp.title} ${emp.department}`.toLowerCase();
      const matchSearch = fullText.includes(this.searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });

    const departments = [
      "all",
      "Yazılım & Teknoloji",
      "İnsan Kaynakları",
      "Ürün Tasarımı",
      "Finans & Muhasebe",
      "Pazarlama & Büyüme"
    ];

    container.innerHTML = `
      <div class="fade-in">
        <!-- Top Toolbar -->
        <div class="card" style="margin-bottom: 24px; padding: 18px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <div class="quick-search" style="width: 260px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Personel veya unvan ara..." value="${this.searchQuery}" oninput="window.EmployeesView.onSearch(this.value)">
              </div>

              <!-- Masking Toggle Button -->
              <button class="chip-btn" onclick="window.EmployeesView.toggleDataMask()" style="display:flex; align-items:center; gap:6px;">
                <span>${isMasked ? "🔒 KVKK Maskesi: Aktif" : "🔓 Hassas Veri Açık"}</span>
              </button>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:12px; color:var(--text-muted);">${filtered.length} Çalışan Listelendi</span>
              ${window.AppState.currentUser.role === 'hr_admin' ? `
                <button class="btn-generate-ai" onclick="window.EmployeesView.openAddModal()" style="font-size:12.5px; padding:8px 14px;">
                  + Yeni Personel Ekle
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Department Pills -->
          <div style="display:flex; gap:8px; margin-top:16px; overflow-x:auto; padding-bottom:4px;">
            ${departments.map(dept => `
              <button class="chip-btn ${this.selectedDept === dept ? 'active' : ''}" 
                style="${this.selectedDept === dept ? 'background:rgba(99,102,241,0.25); color:#818cf8; border-color:#818cf8;' : ''}"
                onclick="window.EmployeesView.onSelectDept('${dept}')">
                ${dept === 'all' ? 'Tüm Departmanlar' : dept}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Employees Grid -->
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
          ${filtered.length === 0 ? `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
              <span style="font-size: 32px; display: block; margin-bottom: 8px;">👥</span>
              <h4 style="font-size: 15px; margin-bottom: 6px;">Kayıtlı Çalışan Bulunamadı</h4>
              <p style="color: var(--text-muted); font-size: 12.5px; margin-bottom: 12px;">Çalışanlarınız henüz şirket katılım anahtarıyla kaydolmadı veya arama kriterine uygun personel yok.</p>
              ${window.AppState.currentCompany ? `
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); padding: 8px 14px; border-radius: 8px; font-size: 12px; color: #38bdf8;">
                  <span>Şirket Katılım Anahtarınız: <strong>${window.AppState.currentCompany.company_key}</strong></span>
                  <button class="chip-btn" onclick="window.DashboardView.copyCompanyKey('${window.AppState.currentCompany.company_key}')" style="font-size: 11px;">Kopyala</button>
                </div>
              ` : ''}
            </div>
          ` : ''}
          ${filtered.map(emp => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; position:relative;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${emp.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + emp.name}" alt="" style="width:48px; height:48px; border-radius:12px; border:1px solid var(--border-subtle); background:#1e293b;">
                    <div>
                      <h4 style="font-size:15px; font-weight:700;">${emp.name} ${emp.surname}</h4>
                      <p style="font-size:12px; color:#818cf8; font-weight:600;">${emp.title}</p>
                    </div>
                  </div>
                  <span class="status-pill ${emp.status === 'active' ? 'status-active' : 'status-pending'}">
                    ${emp.status === 'active' ? '● Aktif' : '🌴 İzinli'}
                  </span>
                </div>

                <div style="background:rgba(0,0,0,0.15); border:1px solid var(--border-subtle); border-radius:8px; padding:10px; margin-bottom:12px; font-size:11.5px; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Departman:</span>
                    <span style="color:var(--text-primary); font-weight:600;">${emp.department}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">E-Posta:</span>
                    <span style="color:var(--text-secondary);">${isMasked ? emp.email.replace(/(.{3})(.*)(@.*)/, "$1•••$3") : emp.email}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Kalan Yıllık İzin:</span>
                    <span style="color:#34d399; font-weight:700;">${(emp.annual_leave_days || 14) - (emp.used_leave_days || 0)} Gün</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-muted);">Maaş Bilgisi:</span>
                    <span style="color:#fbbf24; font-weight:700;">${isMasked ? "₺•••.•••" : "₺" + Number(emp.salary).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:10px;">
                <span style="font-size:11px; color:var(--text-muted);">İşe Giriş: ${emp.start_date}</span>
                <button class="chip-btn" onclick="window.EmployeesView.viewDetail(${emp.id})" style="font-size:11px;">Detay / Bordro</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div id="addEmployeeModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>👥 Yeni Çalışan Tanımla</h3>
            <button class="widget-control-btn" onclick="window.EmployeesView.closeAddModal()">✕</button>
          </div>
          <form id="addEmployeeForm" onsubmit="window.EmployeesView.submitEmployee(event)">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Ad</label>
                  <input type="text" name="name" class="form-control" required placeholder="Örn: Ayşe">
                </div>
                <div class="form-group">
                  <label>Soyad</label>
                  <input type="text" name="surname" class="form-control" required placeholder="Örn: Çetin">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>E-Posta Adresi</label>
                  <input type="email" name="email" class="form-control" required placeholder="ayse.cetin@kodus.ai">
                </div>
                <div class="form-group">
                  <label>Telefon</label>
                  <input type="text" name="phone" class="form-control" placeholder="+90 5XX XXX XX XX">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Departman</label>
                  <select name="department" class="form-control">
                    <option value="Yazılım & Teknoloji">Yazılım & Teknoloji</option>
                    <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                    <option value="Ürün Tasarımı">Ürün Tasarımı</option>
                    <option value="Finans & Muhasebe">Finans & Muhasebe</option>
                    <option value="Pazarlama & Büyüme">Pazarlama & Büyüme</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Unvan / Görev</label>
                  <input type="text" name="title" class="form-control" required placeholder="Frontend Developer">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Sistem Rolü</label>
                  <select name="role" class="form-control">
                    <option value="employee">Çalışan (Kullanıcı)</option>
                    <option value="manager">Yönetici / Takım Lideri</option>
                    <option value="finance">Muhasebe & Bordro</option>
                    <option value="hr_admin">İK Direktörü / Admin</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Brüt Aylık Maaş (₺)</label>
                  <input type="number" name="salary" class="form-control" required value="75000">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="chip-btn" onclick="window.EmployeesView.closeAddModal()">Vazgeç</button>
              <button type="submit" class="btn-generate-ai">Kaydet ve Sisteme Ekle</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  onSelectDept(dept) {
    this.selectedDept = dept;
    this.render(document.getElementById("view-container"));
  },

  onSearch(query) {
    this.searchQuery = query;
    this.render(document.getElementById("view-container"));
  },

  toggleDataMask() {
    window.AppState.maskSensitiveData = !window.AppState.maskSensitiveData;
    this.render(document.getElementById("view-container"));
    window.App.showToast("KVKK Görünümü Değiştirildi", window.AppState.maskSensitiveData ? "Hassas personel verileri maskelendi." : "Hassas veriler açık modda.", "info");
  },

  openAddModal() {
    document.getElementById("addEmployeeModal").classList.add("active");
  },

  closeAddModal() {
    document.getElementById("addEmployeeModal").classList.remove("active");
  },

  async submitEmployee(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await window.KodusAPI.createEmployee(data);
      this.closeAddModal();
      window.App.showToast("Başarılı", `${data.name} ${data.surname} sisteme eklendi!`, "success");
      await window.App.refreshData();
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  },

  viewDetail(empId) {
    window.App.navigate("payroll");
  }
};
