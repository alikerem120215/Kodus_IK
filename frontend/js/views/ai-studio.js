/**
 * Kodus HR - AI Plugin Studio View
 * Dynamic, sandboxed plugin generator powered by Gemini AI and KodusSDK.
 */

window.AIStudioView = {
  activeTab: "html",
  previewSize: "card",
  currentPlugin: null,
  isGenerating: false,

  render(container) {
    // If no plugin staged yet, provide a ready-to-run template
    if (!this.currentPlugin) {
      this.currentPlugin = {
        id: "ai_plugin_welcome",
        name: "✨ Yeni Nesil Yapay Zeka Eklentisi",
        description: "Gemini AI ile dinamik olarak üretilen widget.",
        category: "Kişiselleştirilmiş",
        icon: "sparkles",
        code_html: `
<div style="text-align: center; padding: 10px;">
  <h3 style="font-size: 15px; margin-bottom: 6px; color: #818cf8;">🚀 Eklenti Stüdyosuna Hoş Geldiniz!</h3>
  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">Yukarıdaki kutuya şirketiniz için istediğiniz herhangi bir özelliği Türkçe yazın.</p>
  <button id="btnDemo" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;">
    ⚡ SDK Testini Çalıştır
  </button>
  <div id="demoResult" style="margin-top: 10px; font-size: 11.5px; color: #34d399;"></div>
</div>
        `,
        code_js: `
document.getElementById('btnDemo').addEventListener('click', () => {
  KodusSDK.getCurrentUser().then(user => {
    KodusSDK.notify('SDK Başarıyla Bağlandı', 'Aktif Kullanıcı: ' + user.name + ' ' + user.surname + ' (' + user.role + ')', 'success');
    document.getElementById('demoResult').innerText = '✓ Güvenli KodusSDK bağlantısı doğrulandı.';
  });
});
        `,
        code_css: `
body { font-family: inherit; }
button:hover { opacity: 0.9; transform: scale(1.02); }
        `
      };
    }

    container.innerHTML = `
      <div class="fade-in ai-studio-container">
        <!-- Hero Prompt Generator -->
        <div class="ai-prompt-hero">
          <div class="ai-prompt-header">
            <h2>
              <span>⚡ Kodus AI Eklenti & Özellik Stüdyosu</span>
              <span class="ai-tag">Gemini API Destekli</span>
            </h2>
            <p>
              Doğal dille aklınızdaki İK ihtiyacını belirtin; yapay zeka saniyeler içinde izole tarayıcı sandbox'ında çalışan, güvenli SDK fonksiyonları içeren dinamik bir widget üretsin.
            </p>
          </div>

          <form onsubmit="window.AIStudioView.handleGenerate(event)">
            <div class="ai-input-group">
              <input type="text" id="aiPromptInput" class="ai-input-field" 
                placeholder="Örn: 'Yaklaşan doğum günlerini kutlama kartı', 'Mesai & mola sayacı', 'Takım alkış duvarı'..." required>
              <button type="submit" id="btnSubmitAi" class="btn-ai-submit">
                <span>✨ Eklentiyi Üret</span>
              </button>
            </div>
          </form>

          <!-- Quick Starter Chips -->
          <div class="quick-prompt-chips">
            <span>Örnek Şablonlar:</span>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('⏱️ Mesai ve mola takipçisi pomodoro sayacı')">⏱️ Pomodoro Sayacı</button>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('🌟 Şirket içi kudos, teşekkür ve alkış duvarı')">🌟 Kudos Duvarı</button>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('🎂 Yaklaşan doğum günleri ve kutlama panosu')">🎂 Doğum Günü Radarı</button>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('🥗 Günlük şirket yemek menüsü ve oylama kartı')">🥗 Yemek Menüsü & Oylama</button>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('🚨 İSG ve bina acil durum sorumluları listesi')">🚨 Acil Durum Rehberi</button>
            <button class="chip-btn" onclick="window.AIStudioView.useStarter('📊 Haftalık takım motivasyonu ve nabız anketi')">📊 Takım Nabzı Anketi</button>
          </div>

          <!-- Privacy & Inspiration Opt-in (Directly from User Prompt Specification) -->
          <div class="privacy-optin-box">
            <label class="optin-label">
              <input type="checkbox" id="chkShareAnonymously" checked>
              <div class="optin-text">
                <strong>💡 Ürün Gelişimine İlham Ol (Anonim Paylaşım)</strong>
                <p>Yazdığın bu eklenti fikri ana ürüne ilham olması amacıyla şirket ve personel verisi olmadan anonim olarak genel havuza aktarılsın.</p>
              </div>
            </label>
            <span class="optin-badge">KVKK Uyumlu</span>
          </div>
        </div>

        <!-- Studio Workspace: Code Editor & Sandboxed Live Preview -->
        <div class="studio-workspace-grid">
          <!-- Left: Code & Schema Inspector -->
          <div class="card editor-card" style="padding: 0; overflow: hidden;">
            <div class="editor-tabs">
              <button class="tab-btn ${this.activeTab === 'html' ? 'active' : ''}" onclick="window.AIStudioView.switchTab('html')">HTML Şablonu</button>
              <button class="tab-btn ${this.activeTab === 'js' ? 'active' : ''}" onclick="window.AIStudioView.switchTab('js')">JavaScript (KodusSDK)</button>
              <button class="tab-btn ${this.activeTab === 'css' ? 'active' : ''}" onclick="window.AIStudioView.switchTab('css')">Özel CSS</button>
              <button class="tab-btn ${this.activeTab === 'schema' ? 'active' : ''}" onclick="window.AIStudioView.switchTab('schema')">JSON Şeması</button>
            </div>

            <textarea id="studioCodeEditor" class="code-editor-area" spellcheck="false" oninput="window.AIStudioView.onCodeEdit(this.value)">${this.getActiveCodeContent()}</textarea>
            
            <div style="padding: 10px 16px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size: 11px; color: var(--text-muted);">● Güvenli Sandbox: eval() ve direkt window erişimi sınırlandırılmıştır.</span>
              <button class="chip-btn" onclick="window.AIStudioView.refreshPreview()">🔄 Kodu Derle & Önizle</button>
            </div>
          </div>

          <!-- Right: Sandboxed Live Preview -->
          <div class="preview-card">
            <div class="preview-toolbar">
              <div class="preview-title">
                <span id="previewPluginIcon">⚡</span>
                <span id="previewPluginName">${this.currentPlugin.name}</span>
                <span class="widget-badge" id="previewPluginCategory">${this.currentPlugin.category}</span>
              </div>

              <!-- Device Size Selectors -->
              <div class="device-selectors">
                <button class="device-btn ${this.previewSize === 'card' ? 'active' : ''}" onclick="window.AIStudioView.setPreviewSize('card')">Kart (420px)</button>
                <button class="device-btn ${this.previewSize === 'banner' ? 'active' : ''}" onclick="window.AIStudioView.setPreviewSize('banner')">Geniş (100%)</button>
                <button class="device-btn ${this.previewSize === 'mobile' ? 'active' : ''}" onclick="window.AIStudioView.setPreviewSize('mobile')">Mobil (320px)</button>
              </div>
            </div>

            <div class="preview-body">
              <div class="preview-sandbox-shell size-${this.previewSize}" id="previewSandboxContainer">
                <!-- Sandboxed iframe mounts here -->
              </div>
            </div>

            <div class="preview-actions">
              <button type="button" class="chip-btn" onclick="window.AIStudioView.downloadCode()">💾 JSON Olarak İndir</button>
              <button type="button" class="btn-install-plugin" onclick="window.AIStudioView.installToDashboard()">
                🚀 Sisteme / Panoya Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mount preview
    this.mountPreview();
  },

  useStarter(promptText) {
    document.getElementById("aiPromptInput").value = promptText;
    this.generate(promptText);
  },

  async handleGenerate(e) {
    e.preventDefault();
    const prompt = document.getElementById("aiPromptInput").value.trim();
    if (!prompt) return;
    this.generate(prompt);
  },

  async generate(prompt) {
    const btn = document.getElementById("btnSubmitAi");
    const shareOptin = document.getElementById("chkShareAnonymously")?.checked || false;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Yapay Zeka Kodluyor...</span>`;
    }

    try {
      const res = await window.KodusAPI.generatePlugin(
        prompt,
        "",
        shareOptin,
        window.AppState.currentUser.department
      );

      this.currentPlugin = res.plugin;
      if (res.shared_anonymously) {
        window.App.showToast("Topluluğa İlham Oldunuz", "Eklenti fikriniz anonimleştirilerek ürün ilham havuzuna eklendi!", "info");
      }

      window.App.showToast("Eklenti Üretildi", `'${this.currentPlugin.name}' hazır! Canlı önizlemede test edebilirsiniz.`, "success");
      this.render(document.getElementById("view-container"));

    } catch (err) {
      window.App.showToast("Üretim Hatası", err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>✨ Eklentiyi Üret</span>`;
      }
    }
  },

  getActiveCodeContent() {
    if (!this.currentPlugin) return "";
    switch (this.activeTab) {
      case "html": return this.currentPlugin.code_html.trim();
      case "js": return this.currentPlugin.code_js.trim();
      case "css": return this.currentPlugin.code_css.trim();
      case "schema": return JSON.stringify(this.currentPlugin, null, 2);
      default: return "";
    }
  },

  onCodeEdit(val) {
    if (!this.currentPlugin) return;
    if (this.activeTab === "html") this.currentPlugin.code_html = val;
    else if (this.activeTab === "js") this.currentPlugin.code_js = val;
    else if (this.activeTab === "css") this.currentPlugin.code_css = val;
    else if (this.activeTab === "schema") {
      try {
        this.currentPlugin = JSON.parse(val);
      } catch (e) {}
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    const editor = document.getElementById("studioCodeEditor");
    if (editor) editor.value = this.getActiveCodeContent();

    document.querySelectorAll(".editor-tabs .tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.innerText.toLowerCase().includes(tab));
    });
  },

  setPreviewSize(size) {
    this.previewSize = size;
    const shell = document.getElementById("previewSandboxContainer");
    if (shell) {
      shell.className = `preview-sandbox-shell size-${size}`;
    }
    document.querySelectorAll(".device-selectors .device-btn").forEach(b => {
      b.classList.toggle("active", b.innerText.toLowerCase().includes(size === 'card' ? 'kart' : (size === 'banner' ? 'geniş' : 'mobil')));
    });
  },

  mountPreview() {
    const container = document.getElementById("previewSandboxContainer");
    if (!container || !this.currentPlugin) return;
    window.SandboxBridge.mount(container, this.currentPlugin);
  },

  refreshPreview() {
    this.mountPreview();
    window.App.showToast("Önizleme Yenilendi", "Düzenlemeler sandbox ortamında derlendi.", "info");
  },

  async installToDashboard() {
    if (!this.currentPlugin) return;

    try {
      await window.KodusAPI.installPlugin(this.currentPlugin);
      window.App.showToast("Panoya Eklendi!", `'${this.currentPlugin.name}' genel bakış panosuna başarıyla kuruldu.`, "success");
      await window.App.refreshData();
      window.App.navigate("dashboard");
    } catch (err) {
      window.App.showToast("Kurulum Hatası", err.message, "error");
    }
  },

  downloadCode() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentPlugin, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${this.currentPlugin.id || 'kodus-plugin'}.json`);
    dlAnchorElem.click();
  }
};
