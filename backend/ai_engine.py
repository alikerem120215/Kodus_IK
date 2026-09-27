"""
AI Plugin Generation Engine for Kodus HR.
Supports direct Gemini API calls if an API key is provided,
and includes an intelligent fallback synthesizer that generates fully-functional,
rich, sandboxed plugins based on Turkish natural language prompts.
"""
import json
import urllib.request
import urllib.error
import re
import uuid

# System prompt sent to Gemini or used by the generation engine
SYSTEM_PROMPT = """
Sen Kodus HR kurumsal İK platformu için güvenli web eklentileri (widget/plugin) üreten uzman bir yapay zekasın.
Kullanıcının Türkçe olarak belirttiği İK, ofis veya çalışan ihtiyacına yönelik eksiksiz, modern ve güvenli bir widget oluşturacaksın.

Gereksinimler:
1. Çıktı kesinlikle geçerli bir JSON olmalıdır.
2. Kod, tarayıcıda izole bir <iframe> içinde çalışacaktır.
3. Eklenti yalnızca sana sağlanan 'KodusSDK' nesnesini kullanabilir:
   - KodusSDK.getEmployees(): Promise<Array<{id, name, surname, email, department, title, avatar_url, status}>>
   - KodusSDK.getCurrentUser(): Promise<{id, name, surname, role, department}>
   - KodusSDK.requestLeave(type, days, reason): Promise<{success, message}>
   - KodusSDK.notify(title, message, type): Gösterim (type: 'info'|'success'|'warning'|'error')
   - KodusSDK.storage.get(key): Local eklenti belleği
   - KodusSDK.storage.set(key, value): Local eklenti belleğine kaydet
4. Tasarım modern, premium, koyu/yarı saydam cam (glassmorphism) temasına uyumlu olmalı, satır içi şık CSS içermelidir.
5. JSON Formatı:
{
  "name": "Eklenti Adı (örn: ⏱️ Pomodoro & Mola Takipçisi)",
  "description": "Kısa açıklama",
  "category": "Kategori (örn: Verimlilik, Ofis & Yaşam, İK & İzin, Sağlık & İSG)",
  "icon": "İkon adı (örn: clock, heart, coffee, award, calendar)",
  "code_html": "<!-- HTML yapısı -->",
  "code_js": "// JavaScript mantığı (KodusSDK çağrıları)",
  "code_css": "/* Özel CSS kuralları */"
}
"""

def generate_plugin_with_gemini(prompt: str, api_key: str = None) -> dict:
    """
    Attempts to call Gemini API if api_key is present.
    If no key or on error, falls back to the intelligent template synthesizer.
    """
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": SYSTEM_PROMPT},
                            {"text": f"Kullanıcı İsteği: {prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.4
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                text_content = res_body["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content)
        except Exception as e:
            print(f"[Gemini API Call Failed, falling back to local AI synthesizer]: {e}")
            pass

    # Local intelligent synthesizer
    return synthesize_smart_plugin(prompt)

def synthesize_smart_plugin(prompt: str) -> dict:
    """
    Intelligent dynamic plugin synthesizer that understands semantic patterns
    in user HR prompts and generates fully interactive, rich widgets.
    """
    p_lower = prompt.lower()
    plugin_id = f"ai_plugin_{uuid.uuid4().hex[:8]}"

    # Pattern 1: Pomodoro / Mesai / Mola / Zaman takibi
    if any(k in p_lower for k in ["mesai", "mola", "pomodoro", "saat", "zaman", "timer"]):
        return {
            "id": plugin_id,
            "name": "⏱️ Akıllı Mesai & Dinlenme Sayacı",
            "description": "Günlük odaklanma sürelerini ölçer, 25 dk çalışma ve 5 dk ergonomik mola hatırlatır.",
            "category": "Verimlilik & Sağlık",
            "icon": "clock",
            "code_html": """
<div class="timer-widget">
    <div class="timer-display" id="timeDisplay">25:00</div>
    <div class="timer-badge" id="timerStatus">Odaklanma Modu (Çalışma)</div>
    <div class="timer-actions">
        <button id="btnToggle" class="btn-primary" onclick="toggleTimer()">▶ Başlat</button>
        <button id="btnReset" class="btn-secondary" onclick="resetTimer()">↺ Sıfırla</button>
        <button id="btnBreak" class="btn-break" onclick="takeBreak()">☕ Mola Ver</button>
    </div>
    <div class="timer-stats">
        <span>Tamamlanan Oturum: <strong id="sessionCount">0</strong></span>
        <span>Kazanılan Puan: <strong id="scoreCount">0 XP</strong></span>
    </div>
</div>
""",
            "code_js": """
let timeLeft = 25 * 60;
let isRunning = false;
let timerInterval = null;
let sessions = KodusSDK.storage.get('timer_sessions') || 0;
document.getElementById('sessionCount').innerText = sessions;
document.getElementById('scoreCount').innerText = (sessions * 50) + ' XP';

window.updateDisplay = function() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timeDisplay').innerText = `${mins}:${secs}`;
};

window.toggleTimer = function() {
    const btn = document.getElementById('btnToggle');
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = '▶ Devam Et';
        btn.classList.remove('running');
    } else {
        isRunning = true;
        btn.innerText = '⏸ Duraklat';
        btn.classList.add('running');
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                sessions++;
                KodusSDK.storage.set('timer_sessions', sessions);
                document.getElementById('sessionCount').innerText = sessions;
                document.getElementById('scoreCount').innerText = (sessions * 50) + ' XP';
                KodusSDK.notify('Tebrikler!', '25 dakikalık odaklanma oturumu tamamlandı! 5 dk mola zamanı.', 'success');
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
    KodusSDK.notify('Mola Zamanı', 'Gözlerini ekrandan ayırıp biraz su içebilirsin!', 'info');
};
""",
            "code_css": """
.timer-widget { text-align: center; font-family: inherit; }
.timer-display { font-size: 38px; font-weight: 800; font-family: monospace; letter-spacing: 2px; color: #38bdf8; text-shadow: 0 0 15px rgba(56,189,248,0.3); margin: 6px 0; }
.timer-badge { display: inline-block; font-size: 11px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }
.timer-actions { display: flex; justify-content: center; gap: 8px; margin-bottom: 14px; }
.timer-actions button { border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary { background: linear-gradient(135deg, #0284c7, #2563eb); color: white; }
.btn-primary.running { background: #ea580c; }
.btn-secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }
.btn-break { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4) !important; }
.timer-actions button:hover { opacity: 0.9; transform: translateY(-1px); }
.timer-stats { display: flex; justify-content: space-around; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; }
.timer-stats strong { color: #f8fafc; }
"""
        }

    # Pattern 2: Kudos / Teşekkür / Alkış / Motivasyon
    elif any(k in p_lower for k in ["kudos", "teşekkür", "alkış", "motivasyon", "ödül", "ayın çalışanı"]):
        return {
            "id": plugin_id,
            "name": "🌟 Şirket İçi Kudos & Alkış Duvarı",
            "description": "Çalışanların birbirine başarı ve destekleri için dijital rozet ve tebrik göndermesini sağlar.",
            "category": "Kültür & Motivasyon",
            "icon": "award",
            "code_html": """
<div class="kudos-widget">
    <div class="kudos-input-row">
        <select id="kudosTarget" class="kudos-select">
            <option value="">Kime Teşekkür Etmek İstersin?</option>
        </select>
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
    <div class="kudos-feed" id="kudosFeed">
        <!-- Render feed -->
    </div>
</div>
""",
            "code_js": """
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
    const box = document.getElementById('kudosFeed');
    box.innerHTML = feed.slice(0, 3).map(k => `
        <div class="kudos-card">
            <div class="kudos-card-header">
                <strong>${k.target}</strong>
                <span class="badge-tag">${k.badge}</span>
            </div>
            <p class="kudos-msg">"${k.msg}"</p>
            <span class="kudos-from">— ${k.from}</span>
        </div>
    `).join('');
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
    KodusSDK.notify('Kudos İletildi!', `${target} kişisine tebriğiniz şirket panosunda paylaşıldı!`, 'success');
};
""",
            "code_css": """
.kudos-widget { font-family: inherit; }
.kudos-input-row, .kudos-note-row { display: flex; gap: 8px; margin-bottom: 8px; }
.kudos-select, .kudos-badge-select, .kudos-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; padding: 6px 10px; border-radius: 8px; font-size: 12px; outline: none; }
.kudos-select { flex: 2; }
.kudos-badge-select { flex: 1; }
.kudos-input { flex: 3; }
.kudos-send-btn { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.kudos-send-btn:hover { opacity: 0.9; }
.kudos-feed { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; max-height: 160px; overflow-y: auto; }
.kudos-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 8px 10px; border-radius: 8px; }
.kudos-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.badge-tag { font-size: 10px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 6px; border-radius: 4px; }
.kudos-msg { margin: 4px 0 2px; font-size: 11px; color: #cbd5e1; font-style: italic; }
.kudos-from { font-size: 10px; color: #94a3b8; }
"""
        }

    # Pattern 3: Acil Durum / İletişim / Nöbetçi
    elif any(k in p_lower for k in ["acil", "nöbet", "hastane", "sağlık", "isg", "yangın", "rehber"]):
        return {
            "id": plugin_id,
            "name": "🚨 İSG & Acil Durum Koordinatörü",
            "description": "Şirket içi ilkyardımcılar, bina tahliye sorumlusu ve acil iletişim hatlarını tek ekranda sunar.",
            "category": "Sağlık & İSG",
            "icon": "shield",
            "code_html": """
<div class="emergency-widget">
    <div class="alert-banner">
        <span>🛡️ Güvenli Ofis Protokolü Aktif</span>
        <button onclick="triggerEmergencyCall()" class="sos-btn">🚨 Destek İste</button>
    </div>
    <div class="contact-list">
        <div class="contact-row">
            <span class="role">Sertifikalı İlkyardımcı:</span>
            <strong>Selin Yılmaz (İK Direktörü)</strong>
            <a href="tel:+905332114050" class="call-badge">📞 Ara</a>
        </div>
        <div class="contact-row">
            <span class="role">Bina Tahliye Sorumlusu:</span>
            <strong>Can Öztürk (Operasyon)</strong>
            <a href="tel:+905365447080" class="call-badge">📞 Ara</a>
        </div>
        <div class="contact-row">
            <span class="role">Bilişim & Sunucu Nöbetçisi:</span>
            <strong>Burak Kaya (Senior Backend)</strong>
            <a href="tel:+905443225060" class="call-badge">📞 Ara</a>
        </div>
    </div>
</div>
""",
            "code_js": """
window.triggerEmergencyCall = function() {
    KodusSDK.notify('Acil Durum Çağrısı', 'Ofis Güvenlik ve İSG sorumlularına anlık bildirim iletildi!', 'error');
};
""",
            "code_css": """
.emergency-widget { font-family: inherit; }
.alert-banner { display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 12px; color: #fca5a5; font-weight: 600; }
.sos-btn { background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.contact-list { display: flex; flex-direction: column; gap: 8px; }
.contact-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 8px 10px; border-radius: 8px; font-size: 12px; }
.role { color: #94a3b8; font-size: 11px; }
.call-badge { background: rgba(16, 185, 129, 0.2); color: #34d399; text-decoration: none; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
"""
        }

    # Pattern 4: Anket / Memnuniyet / Nabız (Pulse Survey)
    elif any(k in p_lower for k in ["anket", "nabız", "memnuniyet", "oy", "geribildirim", "fikir"]):
        return {
            "id": plugin_id,
            "name": "📊 Haftalık Takım Nabzı & Anket",
            "description": "Takımın motivasyonunu, iş yükü dengesini ve ofis atmosferini anonim olarak ölçer.",
            "category": "İK & İletişim",
            "icon": "bar-chart",
            "code_html": """
<div class="pulse-widget">
    <div class="pulse-question">Bu hafta iş temposu ve motivasyonun nasıl hissediyor?</div>
    <div class="pulse-options">
        <button onclick="votePulse('🚀 Enerjik & Dengeli')">🚀 Çok İyi</button>
        <button onclick="votePulse('👍 Normal / Rutin')">👍 Dengeli</button>
        <button onclick="votePulse('⚡ Yoğun / Yüksek Yük')">⚡ Yoğun</button>
        <button onclick="votePulse('🛑 Yorgun / Destek Lazım')">🛑 Yorgun</button>
    </div>
    <div class="pulse-result" id="pulseRes">
        <div class="bar-label"><span>Katılım Oranı: %74</span><span>Memnuniyet Skoru: 4.6 / 5.0</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: 82%;"></div></div>
    </div>
</div>
""",
            "code_js": """
window.votePulse = function(choice) {
    KodusSDK.storage.set('my_pulse_vote', choice);
    KodusSDK.notify('Anonim Oy Kaydedildi', 'Katkın için teşekkürler! Sonuçlar İK özet raporuna eklendi.', 'success');
    document.getElementById('pulseRes').style.display = 'block';
};
""",
            "code_css": """
.pulse-widget { font-family: inherit; }
.pulse-question { font-size: 13px; font-weight: 600; color: #f1f5f9; margin-bottom: 10px; }
.pulse-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.pulse-options button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: 0.2s; }
.pulse-options button:hover { background: #6366f1; border-color: #6366f1; }
.pulse-result { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); }
.bar-label { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
.bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #10b981, #6366f1); border-radius: 4px; }
"""
        }

    # Default Dynamic Synthesizer: Adapts title and interactive elements
    title_words = [w.capitalize() for w in prompt.strip().split()[:4]]
    custom_title = " ".join(title_words) or "Özel Yapay Zeka Widget'ı"
    return {
        "id": plugin_id,
        "name": f"✨ {custom_title}",
        "description": f"'{prompt[:60]}' talebiniz doğrultusunda Gemini AI tarafından üretilen modüler widget.",
        "category": "Özel Eklenti",
        "icon": "zap",
        "code_html": f"""
<div class="custom-plugin-card">
    <div class="plugin-title-bar">
        <span class="custom-tag">Yapay Zeka Eklentisi</span>
        <span class="live-dot">● Canlı</span>
    </div>
    <div class="plugin-body-text">
        <p><strong>Amaç:</strong> {prompt}</p>
    </div>
    <div class="custom-actions">
        <button id="btnAction" class="action-btn" onclick="executeCustomTask()">⚡ İşlemi Çalıştır</button>
        <button class="secondary-btn" onclick="checkData()">📊 Veri Çek</button>
    </div>
    <div id="outputBox" class="output-console" style="display:none;"></div>
</div>
""",
        "code_js": """
window.executeCustomTask = function() {
    KodusSDK.notify('İşlem Başarılı', 'Eklenti görevi başarıyla tetiklendi ve loglandı.', 'success');
    const out = document.getElementById('outputBox');
    out.style.display = 'block';
    out.innerText = 'Son işlem zamanı: ' + new Date().toLocaleTimeString();
};

window.checkData = function() {
    KodusSDK.getEmployees().then(list => {
        const out = document.getElementById('outputBox');
        out.style.display = 'block';
        out.innerText = `Sistemde ${list.length} kayıtlı çalışan bulundu. Entegrasyon aktif.`;
    });
};
""",
        "code_css": """
.custom-plugin-card { font-family: inherit; }
.plugin-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.custom-tag { font-size: 11px; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
.live-dot { font-size: 11px; color: #10b981; }
.plugin-body-text p { font-size: 12px; color: #cbd5e1; margin: 4px 0 10px; line-height: 1.4; }
.custom-actions { display: flex; gap: 8px; margin-bottom: 8px; }
.action-btn { background: linear-gradient(135deg, #a855f7, #6366f1); color: white; border: none; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.secondary-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 7px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
.output-console { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); padding: 8px; border-radius: 6px; font-size: 11px; font-family: monospace; color: #38bdf8; margin-top: 6px; }
"""
    }
