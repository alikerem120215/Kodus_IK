/**
 * Kodus HR - Payroll & Finance View
 */

window.PayrollView = {
  render(container) {
    const payrolls = window.AppState.payrolls || [];
    const isMasked = window.AppState.maskSensitiveData;

    const totalGross = payrolls.reduce((acc, p) => acc + p.gross_salary, 0);
    const totalNet = payrolls.reduce((acc, p) => acc + p.net_salary, 0);
    const totalSgk = payrolls.reduce((acc, p) => acc + p.sgk_employee, 0);
    const totalTax = payrolls.reduce((acc, p) => acc + p.income_tax, 0);

    const formatCurrency = (val) => isMasked ? "₺•••.•••" : "₺" + Number(val).toLocaleString("tr-TR");

    container.innerHTML = `
      <div class="fade-in">
        <!-- Payroll Overview KPIs -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-blue">💼</div>
            <div class="kpi-content">
              <h4>Toplam Brüt Maliyet</h4>
              <div class="kpi-value">${formatCurrency(totalGross)}</div>
              <div class="kpi-trend trend-up">Eylül 2026 Bordrosu</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-emerald">💵</div>
            <div class="kpi-content">
              <h4>Ödenen Net Ücret</h4>
              <div class="kpi-value">${formatCurrency(totalNet)}</div>
              <div class="kpi-trend trend-up">Hesaba geçen toplam</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-purple">🏛️</div>
            <div class="kpi-content">
              <h4>SGK İşçi Kesintisi</h4>
              <div class="kpi-value">${formatCurrency(totalSgk)}</div>
              <div class="kpi-trend">%14 SGK + %1 İşsizlik</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-amber">📑</div>
            <div class="kpi-content">
              <h4>Gelir Vergisi Matrahı</h4>
              <div class="kpi-value">${formatCurrency(totalTax)}</div>
              <div class="kpi-trend">Stopaj ve Damga Vergisi</div>
            </div>
          </div>
        </div>

        <!-- Payroll List Table -->
        <div class="card" style="padding:0; overflow:hidden;">
          <div style="padding:16px 24px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size:15px; font-weight:700;">📊 Eylül 2026 Personel Ücret Dökümü</h3>
            <button class="chip-btn" onclick="window.EmployeesView.toggleDataMask()">
              ${isMasked ? '🔒 Değerleri Göster' : '🔒 Değerleri Maskele'}
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Personel</th>
                  <th>Departman / Unvan</th>
                  <th>Dönem</th>
                  <th>Brüt Maaş</th>
                  <th>SGK Kesintisi</th>
                  <th>Gelir Vergisi</th>
                  <th>Prim / Bonus</th>
                  <th>Net Ödenen</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${payrolls.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">
                      Henüz bu şirket için bordro kaydı bulunmuyor. Personel eklendikçe aylık bordro dökümleri otomatik hesaplanır.
                    </td>
                  </tr>
                ` : payrolls.map(p => `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.emp_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.emp_name}" style="width:32px; height:32px; border-radius:8px;">
                        <strong>${p.emp_name} ${p.emp_surname}</strong>
                      </div>
                    </td>
                    <td>
                      <div>${p.emp_title}</div>
                      <div style="font-size:11px; color:var(--text-muted);">${p.emp_dept}</div>
                    </td>
                    <td><span class="badge" style="background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:4px; font-size:11.5px;">${p.month}</span></td>
                    <td><strong style="color:var(--text-primary);">${formatCurrency(p.gross_salary)}</strong></td>
                    <td style="color:#f87171;">-${formatCurrency(p.sgk_employee)}</td>
                    <td style="color:#f87171;">-${formatCurrency(p.income_tax)}</td>
                    <td style="color:#34d399;">+${formatCurrency(p.bonus || 0)}</td>
                    <td><strong style="color:#38bdf8; font-size:14px;">${formatCurrency(p.net_salary + (p.bonus || 0))}</strong></td>
                    <td>
                      <button class="chip-btn" onclick="window.PayrollView.showSlip(${p.id})">📄 Dijital Bordro</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Digital Payroll Slip Modal -->
      <div id="payrollSlipModal" class="modal-overlay">
        <div class="modal-dialog" style="max-width: 620px;">
          <div class="modal-header">
            <h3>📑 Resmi Ücret Hesap Pusulası (Bordro)</h3>
            <button class="widget-control-btn" onclick="window.PayrollView.closeSlip()">✕</button>
          </div>
          <div class="modal-body" id="slipModalContent">
            <!-- Dynamically populated -->
          </div>
          <div class="modal-footer">
            <button type="button" class="chip-btn" onclick="window.PayrollView.closeSlip()">Kapat</button>
            <button type="button" class="btn-generate-ai" onclick="window.PayrollView.printSlip()">🖨️ Yazdır / PDF Kaydet</button>
          </div>
        </div>
      </div>
    `;
  },

  showSlip(payrollId) {
    const p = (window.AppState.payrolls || []).find(item => item.id === payrollId);
    if (!p) return;

    const modal = document.getElementById("payrollSlipModal");
    const container = document.getElementById("slipModalContent");

    container.innerHTML = `
      <div class="payroll-slip">
        <div class="payroll-slip-header">
          <div>
            <div class="payroll-company-title">KODUS YAZILIM VE TEKNOLOJİ A.Ş.</div>
            <div style="font-size:11.5px; color:#64748b;">Mersis No: 0548002938100012 • SGK Sicil: 34102948291</div>
          </div>
          <div style="text-align:right;">
            <div class="payroll-period-tag">DÖNEM: ${p.month}</div>
            <div style="font-size:11px; color:#10b981; font-weight:700;">DURUM: ÖDENDİ</div>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:14px; display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
          <div><strong>Çalışan:</strong> ${p.emp_name} ${p.emp_surname}</div>
          <div><strong>Departman:</strong> ${p.emp_dept}</div>
          <div><strong>Unvan:</strong> ${p.emp_title}</div>
          <div><strong>Ödeme Tarihi:</strong> ${p.paid_at || '2026-09-20'}</div>
        </div>

        <table class="payroll-table">
          <thead>
            <tr style="background:#f1f5f9; text-align:left; font-size:11px; text-transform:uppercase; color:#475569;">
              <th style="padding:8px 10px;">Kalem Açıklaması</th>
              <th style="padding:8px 10px; text-align:right;">Tutar (TRY)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aylık Temel Brüt Ücret</td>
              <td style="text-align:right; font-weight:600;">${Number(p.gross_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
            </tr>
            <tr>
              <td>SGK İşçi Primi Kesintisi (%14)</td>
              <td style="text-align:right; color:#dc2626;">-${Number(p.sgk_employee * 0.933).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
            </tr>
            <tr>
              <td>İşsizlik Sigortası Kesintisi (%1)</td>
              <td style="text-align:right; color:#dc2626;">-${Number(p.sgk_employee * 0.067).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
            </tr>
            <tr>
              <td>Gelir Vergisi Matrahı Kesintisi</td>
              <td style="text-align:right; color:#dc2626;">-${Number(p.income_tax).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
            </tr>
            ${p.bonus > 0 ? `
              <tr>
                <td>Performans Primi / Ek Haklar</td>
                <td style="text-align:right; color:#16a34a; font-weight:600;">+${Number(p.bonus).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
              </tr>
            ` : ''}
            <tr class="payroll-total-row">
              <td style="padding:12px 10px;">Banka Hesabına Net Transfer</td>
              <td style="padding:12px 10px; text-align:right; color:#0284c7; font-size:16px;">
                ${Number(p.net_salary + (p.bonus || 0)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:16px; font-size:11px; color:#94a3b8; text-align:center;">
          Bu bordro 5070 sayılı Elektronik İmza Kanunu kapsamında güvenli e-imza ile oluşturulmuştur.
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  closeSlip() {
    document.getElementById("payrollSlipModal").classList.remove("active");
  },

  printSlip() {
    window.print();
  }
};
