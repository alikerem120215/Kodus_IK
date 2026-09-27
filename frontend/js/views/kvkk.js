/**
 * Kodus HR - KVKK Compliance & Architecture Analysis View
 * Highlights the advantages of Web-based SaaS and Sandboxed UI Injection over Desktop apps.
 */

window.KvkkView = {
  render(container) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="kvkk-info-banner">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <span style="font-size:24px;">🛡️</span>
            <div>
              <h3 style="font-size:18px; font-weight:800; color:var(--text-primary);">Kodus İK Mimari ve KVKK Güvenlik Beyanı</h3>
              <p style="font-size:12px; color:var(--text-muted);">Neden Masaüstü Yerine Web Tabanlı (SaaS) Mimari ve Sandboxing Seçildi?</p>
            </div>
          </div>

          <div class="kvkk-grid">
            <div class="kvkk-card-point">
              <h4>👥 1. Çok Kullanıcılı Rol ve Erişim Yönetimi</h4>
              <p>
                İK yazılımları sadece tek bir uzmanın kullandığı araçlar değildir. Çalışanlar izin girer, takım liderleri onaylar, muhasebe bordro inceler. Web ortamında rol bazlı yetkilendirme (RBAC) ile herkes sadece görmesi gereken veriye güvenle ulaşır.
              </p>
            </div>

            <div class="kvkk-card-point">
              <h4>🚀 2. Sıfır Kurulum ve Kolay Dağıtım</h4>
              <p>
                Yüzlerce personelin bilgisayarına masaüstü yazılım kurmak IT ekipleri için operasyonel yüktür ve sürüm uyumsuzluklarına yol açar. Web SaaS mimarisinde kullanıcılar tek bir bağlantı ve tarayıcı üzerinden en güncel sürüme anında erişir.
              </p>
            </div>

            <div class="kvkk-card-point">
              <h4>🔒 3. Merkezi Veritabanı ve KVKK Uyumu</h4>
              <p>
                Maaş, kimlik ve sağlık verilerinin çalışanların yerel bilgisayarlarında tutulması ciddi güvenlik zafiyeti yaratır. Kodus İK, verileri şifrelenmiş merkezi sunucuda barındırır, anlık veri maskeleme sağlar ve denetim loglarını tutar.
              </p>
            </div>

            <div class="kvkk-card-point">
              <h4>⚡ 4. Güvenli AI Sandboxing (İzole Kod Çalıştırma)</h4>
              <p>
                Masaüstü uygulamalarda (Python eval/exec, C# reflection) dinamik kod çalıştırmak sisteme doğrudan sızma riski oluşturur. Kodus İK'da yapay zeka tarafından üretilen eklentiler <strong>iframe sandbox</strong> içinde çalışır; yalnızca kontrollü <code>KodusSDK</code> arayüzüne erişebilir.
              </p>
            </div>
          </div>
        </div>

        <!-- Technical Comparison Table -->
        <div class="card" style="margin-top:20px; padding:0; overflow:hidden;">
          <div style="padding:16px 20px; border-bottom:1px solid var(--border-subtle);">
            <h4 style="font-size:15px; font-weight:700;">Teknik Karşılaştırma Matrisi: Web Tabanlı SaaS vs. Geleneksel Masaüstü</h4>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kriter</th>
                  <th>Geleneksel Masaüstü (Tkinter / C#)</th>
                  <th>Kodus İK Web Tabanlı SaaS (Önerilen)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dinamik AI Eklenti Çalıştırma</strong></td>
                  <td>❌ eval() / exec() doğrudan işletim sistemi riski taşır.</td>
                  <td>✅ <span style="color:#10b981; font-weight:600;">Tarayıcı sandbox + kısıtlı KodusSDK ile %100 izole güvenlik.</span></td>
                </tr>
                <tr>
                  <td><strong>Veri Güvenliği ve KVKK</strong></td>
                  <td>❌ Yerel SQLite dosyası çalınabilir, kopyalanabilir.</td>
                  <td>✅ <span style="color:#10b981; font-weight:600;">Merkezi şifreli veritabanı, dinamik alan maskeleme ve SSL/TLS.</span></td>
                </tr>
                <tr>
                  <td><strong>İzin & Bordro İş Akışları</strong></td>
                  <td>❌ Gerçek zamanlı onaylar için karmaşık senkronizasyon gerekir.</td>
                  <td>✅ <span style="color:#10b981; font-weight:600;">Çalışan - Yönetici - Muhasebe anında bildirimli akış.</span></td>
                </tr>
                <tr>
                  <td><strong>Masaüstü Deneyimi İhtiyacı</strong></td>
                  <td>✅ Doğal masaüstü penceresi.</td>
                  <td>✅ <span style="color:#10b981; font-weight:600;">PWA (Progressive Web App) veya Tauri ile tek tıkla masaüstü uygulamasına dönüşüm.</span></td>
                </tr>
                <tr>
                  <td><strong>Kullanıcı Fikirlerini Toplama</strong></td>
                  <td>❌ Yerel logları toplamak ve birleştirmek zordur.</td>
                  <td>✅ <span style="color:#10b981; font-weight:600;">Tek tık onay ile anonim ürün ilham havuzuna anında kayıt.</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
