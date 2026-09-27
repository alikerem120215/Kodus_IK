/**
 * Kodus HR - Community & Inspiration Hub View
 * Collects anonymized user plugin creations to inspire product roadmap.
 */

window.CommunityView = {
  render(container) {
    const ideas = window.AppState.communityIdeas || [];
    const totalVotes = ideas.reduce((acc, i) => acc + (i.upvotes || 0), 0);

    container.innerHTML = `
      <div class="fade-in">
        <!-- Inspiration Hero Banner -->
        <div class="inspiration-hero">
          <h3>
            <span>💡 Topluluk & Ürün İlham Havuzu</span>
            <span class="ai-tag">Kitle Kaynaklı Ar-Ge</span>
          </h3>
          <p>
            Kullanıcıların yapay zeka ile kendi ihtiyaçlarına özel ürettiği eklenti fikirleri, gizlilik izni alındığında anonim olarak burada toplanır. En çok oy alan modüller bir sonraki sürümde Kodus İK'nın çekirdek özelliklerine dönüştürülür!
          </p>
        </div>

        <!-- Inspiration Analytics Row -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-blue">💡</div>
            <div class="kpi-content">
              <h4>Toplanan Fikir</h4>
              <div class="kpi-value">${ideas.length} Modül</div>
              <div class="kpi-trend trend-up">Kullanıcı katkılı</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-rose">❤️</div>
            <div class="kpi-content">
              <h4>Toplam Beğeni / Oy</h4>
              <div class="kpi-value">${totalVotes}</div>
              <div class="kpi-trend trend-up">Şirket içi ilgi</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-emerald">🛡️</div>
            <div class="kpi-content">
              <h4>KVKK & Gizlilik</h4>
              <div class="kpi-value">%100</div>
              <div class="kpi-trend">Tamamen anonim veri</div>
            </div>
          </div>

          <div class="card kpi-card">
            <div class="kpi-icon-box kpi-icon-purple">🚀</div>
            <div class="kpi-content">
              <h4>Ürün Yol Haritasında</h4>
              <div class="kpi-value">3 Özellik</div>
              <div class="kpi-trend trend-up">Geliştirme aşamasında</div>
            </div>
          </div>
        </div>

        <!-- Community Ideas Grid -->
        <div class="community-grid">
          ${ideas.map(item => `
            <div class="community-card">
              <div>
                <div class="community-header">
                  <span class="community-title">${item.title}</span>
                  <span class="community-badge">${item.category}</span>
                </div>
                <p class="community-desc">${item.description}</p>
              </div>

              <div class="community-footer">
                <div style="display:flex; align-items:center; gap:8px;">
                  <button class="upvote-btn" onclick="window.CommunityView.upvote(${item.id})">
                    👍 <span>${item.upvotes || 0}</span>
                  </button>
                  <span style="font-size:11px; color:var(--text-muted);">${item.department_origin || 'Anonim'}</span>
                </div>

                ${item.plugin_payload ? `
                  <button class="btn-clone-plugin" onclick="window.CommunityView.cloneToDashboard(${item.id})">
                    Panoma Ekle +
                  </button>
                ` : `
                  <span style="font-size:11px; color:#38bdf8;">Planlama Sırasında</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async upvote(ideaId) {
    try {
      await window.KodusAPI.upvoteCommunityIdea(ideaId);
      const idea = (window.AppState.communityIdeas || []).find(i => i.id === ideaId);
      if (idea) idea.upvotes = (idea.upvotes || 0) + 1;
      this.render(document.getElementById("view-container"));
      window.App.showToast("Oyunuz Kaydedildi", "Fikir desteklendi ve yol haritasında öne çıkarıldı!", "success");
    } catch (err) {
      window.App.showToast("Hata", err.message, "error");
    }
  },

  async cloneToDashboard(ideaId) {
    const item = (window.AppState.communityIdeas || []).find(i => i.id === ideaId);
    if (!item || !item.plugin_payload) return;

    try {
      const plugin = JSON.parse(item.plugin_payload);
      plugin.id = "cloned_" + Math.random().toString(36).substring(2, 9);
      await window.KodusAPI.installPlugin(plugin);
      window.App.showToast("Eklenti Eklendi!", `'${plugin.name}' panonuza yüklendi.`, "success");
      await window.App.refreshData();
      window.App.navigate("dashboard");
    } catch (err) {
      window.App.showToast("Kurulum Hatası", err.message, "error");
    }
  }
};
