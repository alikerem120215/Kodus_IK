# Kodus İK — Yeni Nesil Yapay Zeka Destekli İK SaaS Platformu

Kodus İK, modern kurumsal İnsan Kaynakları operasyonlarını **Web tabanlı SaaS mimarisi**, **çok kiracılı (multi-tenant) şirket ağı altyapısı**, **güvenli şirket katılım anahtarları (Invite Keys)**, **KVKK uyumlu hassas veri koruması** ve **Gemini AI Destekli Sandboxed Eklenti Stüdyosu** ile birleştiren vizyoner bir platformdur.

---

## 🌟 Yeni Nesil Kullanıcı ve Şirket Akışı (Auth & Multi-Tenant)

Sistem artık tamamen doğrudan kullanılabilir, gerçek dünya senaryolarına uygun kimlik doğrulama ve şirket ağı yönetimini destekler:

### 1. İlk Açılış: Giriş Yap & Kayıt Ol Portalı
Uygulama açıldığında kullanıcıyı modern, cam efektli **Kimlik Doğrulama Ekranı** karşılar:
* **Giriş Yap:** E-posta ve şifre ile mevcut hesaba giriş yapılır.
* **⚡ Hızlı Demo Girişi (1-Tıkla Test):**
  * `👔 Demo Şirket Yöneticisi (Ali Kerem)`
  * `💻 Demo Çalışan (Burak Kaya)`

### 2. Şirket Yöneticisi (İK Müdürü / Muhasebe) Kayıt Akışı
1. Kullanıcı *"Yeni Hesap Oluştur"* sekmesine geçer.
2. Ad, Soyad, E-Posta ve Şifre girer.
3. `[x] Şirket Yöneticisi / İK / Muhasebe Olarak Kaydol` kutucuğunu işaretler.
4. Yönetici hesabı oluşturulduğunda kullanıcı doğrudan **Dashboard**'a yönlendirilir.
5. **Boş Pano & Onboarding Ekranı:**
   * Panoda henüz hiçbir çalışan veya modül yoktur.
   * Karşılama kartında **"🏢 Yeni İK Şirket Ağı Oluştur"** butonu yer alır.
   * Butona basıldığında Şirket Adı ve Sektör girilir.
   * Sistem anında benzersiz, kopyalanabilir bir **Şirket Katılım Anahtarı** üretir (Örn: `KODUS-8F92-XA49-77BC-90M2`).
   * Panonun en üstünde bu anahtar bir rozet olarak yer alır ve **📋 Kodu Kopyala** butonuyla çalışanlara iletilmeye hazır hale gelir.

### 3. Çalışan Kayıt Akışı (Şirket Ağına Katılma)
1. Çalışan, yöneticisinin ilettiği şirket katılım kodunu alır.
2. *"Yeni Hesap Oluştur"* sekmesinde bilgilerini girer.
3. **🔑 Şirket Katılım Anahtarı** alanına bu kodu yapıştırır, departman ve unvanını seçer.
4. Kayıt tamamlandığı anda:
   * Çalışan ilgili şirketin ağına otomatik olarak bağlanır.
   * Yöneticinin dashboard'undaki **Kayıtlı Çalışan** sayısı anında artar ve çalışan personel rehberinde listelenir!

---

## ⚡ Yapay Zeka Eklenti Stüdyosu & Güvenli Sandbox

Kullanıcıların aklındaki İK ihtiyaçlarını doğal dille yazıp saniyeler içinde dinamik widget'a dönüştürdüğü devrimsel eklenti motoru:
* **İzole Kod Çalıştırma:** Gemini AI tarafından üretilen kodlar ana sayfada doğrudan `eval()` edilmez; `<iframe sandbox="allow-scripts">` içinde tamamen izole çalışır.
* **KodusSDK Güvenlik Köprüsü:** Eklentiler sisteme yalnızca kontrollü SDK ile bağlanır (`getEmployees()`, `getCurrentUser()`, `requestLeave()`, `notify()`, `storage`).
* **Ürün İlham Havuzu:** Eklenti üretirken *"Bu fikir ana ürüne ilham olması amacıyla anonim olarak paylaşılsın"* seçeneği onaylandığında, fikir **Topluluk & İlham Havuzu**'na aktarılır ve şirket içinde oylanabilir.

---

## 🚀 Sabah Uyandığınızda Hemen Kullanma ve Test Etme

Uygulama, hem sunucusuz doğrudan tarayıcı üzerinden (yerel akıllı simülasyon ve veritabanıyla) hem de Python backend sunucusuyla çalışır.

### Yöntem 1: Doğrudan Tarayıcıda Açma (Tavsiye Edilen)
Herhangi bir terminal komutuna gerek yoktur. Tarayıcınızda (Google Chrome / Safari / Edge) şu bağlantıyı açın:
```
file:///Users/alikerem/Documents/Kodus/İK yeni/frontend/index.html
```

#### Deneyebileceğiniz Senaryolar:
1. **Senaryo A (Sıfırdan Şirket Kuran Yönetici):**
   * "Yeni Hesap Oluştur"a tıklayın.
   * `[x] Şirket Yöneticisi / İK / Muhasebe Olarak Kaydol` kutucuğunu işaretleyin ve kaydolun.
   * Açılan panoda **"🏢 Yeni İK Şirket Ağı Oluştur"** butonuna basıp şirket adınızı girin.
   * Üretilen **KODUS-...** anahtarını kopyalayın!
2. **Senaryo B (Anahtarla Kaydolan Çalışan):**
   * Sol alttan *"Oturumu Kapat"* diyerek çıkış yapın.
   * "Yeni Hesap Oluştur"da bir çalışan profili girin ve kopyaladığınız şirket anahtarını yapıştırın.
   * Giriş yaptığınızda kendi çalışan panelinizi görün, izin talep edin.
   * Tekrar yönetici hesabınıza girdiğinizde çalışanın ve izin talebinin anında panonuza yansıdığını gözlemleyin!
3. **Senaryo C (Hızlı Demo):**
   * Giriş ekranındaki *"👔 Demo Şirket Yöneticisi"* veya *"💻 Demo Çalışan"* butonlarına basarak hazır şirket verileriyle test edin.

### Yöntem 2: Python Backend REST API ile Çalıştırma
```bash
python3 backend/server.py 8080
```
Ardından `http://localhost:8080` adresine gidin.
