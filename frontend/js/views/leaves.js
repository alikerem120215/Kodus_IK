/**
 * Kodus HR - Leave Management View
 */

window.LeavesView = {
  currentTab: "all",

  render(container) {
    const leaves = window.AppState.leaves || [];
    const user = window.AppState.currentUser;
    const isApprover = user.role === "hr_admin" || user.role === "manager";

    const filtered = leaves.filter(l => {
      if (this.currentTab === "pending") return l.status === "pending";
      if (this.currentTab === "approved") return l.status === "approved";
      return true;
    });

    // Find current user's employee record to get real leave days
    const currentEmp = (window.AppState.employees || []).find(e => (user && (e.user_id === user.id || e.id === user.id || e.email === user.email))) || { 
      name: user ? user.name : "Kullanıcı", 
      surname: user ? user.surname : "",
      annual_leave_days: 14, 
      used_leave_days: 0 
    };
    const remainingDays = (currentEmp.annual_leave_days || 14) - (currentEmp.used_leave_days || 0);

    container.innerHTML = `
      <div class="fade-in">
        <!-- Leave Balance Header Cards -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-emerald">🌴</div>
            <div class="kpi-content">
              <h4>Kalan Yıllık İzin</h4>
              <div class="kpi-value">${remainingDays} Gün</div>
              <div class="kpi-trend trend-up">${currentEmp.name} ${currentEmp.surname}</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-purple">📅</div>
            <div class="kpi-content">
              <h4>Kullanılan İzin</h4>
              <div class="kpi-value">${currentEmp.used_leave_days || 0} Gün</div>
              <div class="kpi-trend">Bu yıl toplamı</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-amber">⏳</div>
            <div class="kpi-content">
              <h4>Bekleyen Talepler</h4>
              <div class="kpi-value">${leaves.filter(l => l.status === "pending").length}</div>
              <div class="kpi-trend trend-warning">Şirket geneli onay bekleyen</div>
            </div>
          </div>
        </div>

        <!-- Controls Toolbar -->
        <div class="card" style="margin-bottom: 20px; padding: 16px 22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:8px;">
            <button class="chip-btn ${this.currentTab === 'all' ? 'active' : ''}" onclick="window.LeavesView.switchTab('all')">Tüm Talepler</button>
            <button class="chip-btn ${this.currentTab === 'pending' ? 'active' : ''}" onclick="window.LeavesView.switchTab('pending')">⏳ Bekleyenler</button>
            <button class="chip-btn ${this.currentTab === 'approved' ? 'active' : ''}" onclick="window.LeavesView.switchTab('approved')">✓ Onaylananlar</button>
          </div>

          <button class="btn-generate-ai" onclick="window.LeavesView.openRequestModal()">
            + Yeni İzin Talebi Oluştur
          </button>
        </div>

        <!-- Leave Requests Table -->
        <div class="card" style="padding: 0; overflow:hidden;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Personel</th>
                  <th>İzin Türü</th>
                  <th>Tarih Aralığı</th>
                  <th>Gün</th>
                  <th>Gerekçe / Not</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Kayıtlı izin talebi bulunmuyor.</td>
                  </tr>
                ` : filtered.map(item => `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${item.emp_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.emp_name}" style="width:32px; height:32px; border-radius:8px;">
                        <div>
                          <strong>${item.emp_name} ${item.emp_surname}</strong>
                          <div style="font-size:11px; color:var(--text-muted);">${item.emp_dept}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge" style="background:rgba(99,102,241,0.15); color:#a5b4fc; padding:3px 8px; border-radius:6px; font-size:11.5px;">${item.leave_type}</span></td>
                    <td style="font-size:12px;">${item.start_date} → ${item.end_date}</td>
                    <td><strong>${item.days} Gün</strong></td>
                    <td style="max-width:260px; font-size:12px; color:var(--text-secondary);">${item.reason || '—'}</td>
                    <td>
                      <span class="status-pill status-${item.status}">
                        ${item.status === 'approved' ? '✓ Onaylandı' : (item.status === 'pending' ? '⏳ Beklemede' : '✕ Reddedildi')}
                      </span>
                    </td>
                    <td>
                      ${item.status === 'pending' && isApprover ? `
                        <div style="display:flex; gap:6px;">
                          <button class="chip-btn" style="background:#10b981; color:white; border:none; padding:4px 8px; font-size:11px;" onclick="window.LeavesView.handleApproval(${item.id}, 'approved')">Onayla</button>
                          <button class="chip-btn" style="background:rgba(239,68,68,0.2); color:#f87171; border:none; padding:4px 8px; font-size:11px;" onclick="window.LeavesView.handleApproval(${item.id}, 'rejected')">Reddet</button>
                        </div>
                      ` : `
                        <span style="font-size:11px; color:var(--text-muted);">${item.status === 'approved' ? 'Tamamlandı' : 'İşlem Yetkisi Yok'}</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- New Leave Request Modal -->
      <div id="requestLeaveModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>🗓️ İzin Talebi Bildirimi</h3>
            <button class="widget-control-btn" onclick="window.LeavesView.closeRequestModal()">✕</button>
          </div>
          <form onsubmit="window.LeavesView.submitLeaveRequest(event)">
            <div class="modal-body">
              <div class="form-group">
                <label>İzin Türü</label>
                <select name="leave_type" class="form-control" required>
                  <option value="Yıllık İzin">Yıllık İzin (Ücretli)</option>
                  <option value="Mazeret İzni">Mazeret İzni</option>
                  <option value="Hastalık / Rapor">Hastalık / Sağlık Raporu</option>
                  <option value="Evlilik İzni">Evlilik İzni</option>
                  <option value="Doğum / Babalık İzni">Doğum / Babalık İzni</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Başlangıç Tarihi</label>
                  <input type="date" id="leaveStartDate" name="start_date" class="form-control" required onchange="window.LeavesView.calcDays()">
                </div>
                <div class="form-group">
                  <label>Bitiş Tarihi</label>
                  <input type="date" id="leaveEndDate" name="end_date" class="form-control" required onchange="window.LeavesView.calcDays()">
                </div>
              </div>

              <div class="form-group">
                <label>Hesaplanan Gün Sayısı</label>
                <input type="number" id="leaveDaysCount" name="days" class="form-control" readonly value="1">
              </div>

              <div class="form-group">
                <label>İzin Gerekçesi / Açıklama</label>
                <textarea name="reason" class="form-control" rows="3" placeholder="İzin nedeninizi kısaca açıklayınız..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="chip-btn" onclick="window.LeavesView.closeRequestModal()">Vazgeç</button>
              <button type="submit" class="btn-generate-ai">Onaya Gönder</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render(document.getElementById("view-container"));
  },

  openRequestModal() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("requestLeaveModal").classList.add("active");
    document.getElementById("leaveStartDate").value = today;
    document.getElementById("leaveEndDate").value = today;
    this.calcDays();
  },

  closeRequestModal() {
    document.getElementById("requestLeaveModal").classList.remove("active");
  },

  calcDays() {
    const s = document.getElementById("leaveStartDate").value;
    const e = document.getElementById("leaveEndDate").value;
    if (s && e) {
      const d1 = new Date(s);
      const d2 = new Date(e);
      const diffTime = Math.max(0, d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      document.getElementById("leaveDaysCount").value = diffDays;
    }
  },

  async submitLeaveRequest(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.employee_id = window.AppState.currentUser.id;
    data.days = parseInt(data.days) || 1;

    try {
      await window.KodusAPI.createLeaveRequest(data);
      this.closeRequestModal();
      window.App.showToast("Talep İletildi", "İzin talebiniz yöneticinize iletildi.", "success");
      await window.App.refreshData();
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  },

  async handleApproval(leaveId, status) {
    try {
      await window.KodusAPI.updateLeaveStatus(leaveId, status, window.AppState.currentUser.id);
      window.App.showToast("İşlem Tamamlandı", `İzin talebi ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`, status === 'approved' ? 'success' : 'info');
      await window.App.refreshData();
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  }
};
