"""
Kodus HR Database Initialization and SQLite helper.
Supports multi-tenancy, companies, user accounts with password hashes,
invite keys, employees, leave requests, payrolls, plugins, and community ideas.
"""
import sqlite3
import json
import os
import hashlib
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "kodus_hr.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def generate_company_key() -> str:
    raw = uuid.uuid4().hex.upper()
    return f"KODUS-{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Companies Table (Multi-tenant)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_key TEXT UNIQUE NOT NULL,
        sector TEXT DEFAULT 'Teknoloji',
        owner_email TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Users Table (Authentication)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        role TEXT NOT NULL, -- 'hr_admin', 'manager', 'finance', 'employee'
        company_key TEXT,
        department TEXT DEFAULT 'Genel',
        title TEXT DEFAULT 'Çalışan',
        avatar_url TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (company_key) REFERENCES companies(company_key)
    )
    """)

    # Employees Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_key TEXT NOT NULL,
        user_id INTEGER,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        department TEXT NOT NULL,
        title TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee',
        salary REAL NOT NULL,
        start_date TEXT NOT NULL,
        annual_leave_days INTEGER DEFAULT 14,
        used_leave_days INTEGER DEFAULT 0,
        avatar_url TEXT,
        status TEXT DEFAULT 'active'
    )
    """)

    # Leave Requests Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_key TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days INTEGER NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        approved_by INTEGER,
        rejection_reason TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    # Payrolls Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payrolls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_key TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        gross_salary REAL NOT NULL,
        net_salary REAL NOT NULL,
        sgk_employee REAL NOT NULL,
        income_tax REAL NOT NULL,
        bonus REAL DEFAULT 0,
        status TEXT DEFAULT 'paid',
        paid_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    # Plugins Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        company_key TEXT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        icon TEXT,
        author TEXT NOT NULL,
        code_html TEXT NOT NULL,
        code_js TEXT NOT NULL,
        code_css TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        config_json TEXT DEFAULT '{}',
        is_community INTEGER DEFAULT 0
    )
    """)

    # Community Ideas Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        department_origin TEXT,
        plugin_payload TEXT,
        upvotes INTEGER DEFAULT 0,
        is_anonymized INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed demo company and demo users if empty
    cursor.execute("SELECT COUNT(*) FROM companies")
    if cursor.fetchone()[0] == 0:
        seed_demo_tenant(conn)

    conn.close()

def seed_demo_tenant(conn):
    cursor = conn.cursor()
    demo_key = "KODUS-DEMO-8A9F-2026-HQ01"

    # 1. Demo Company
    cursor.execute("""
    INSERT INTO companies (name, company_key, sector, owner_email, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, ("Kodus Yazılım ve Bilişim A.Ş.", demo_key, "Yazılım & Bilişim", "alikerem@kodus.ai", "2026-09-24 10:00:00"))

    # 2. Demo Users (Admin, Manager, Employee, Finance)
    # Password for all demo accounts: 123456
    pwd = hash_password("123456")
    users = [
        ("alikerem@kodus.ai", pwd, "Ali Kerem", "Aydın", "hr_admin", demo_key, "Yazılım & Teknoloji", "Lead Software Architect", "https://api.dicebear.com/7.x/bottts/svg?seed=AliKerem"),
        ("selin.yilmaz@kodus.ai", pwd, "Selin", "Yılmaz", "hr_admin", demo_key, "İnsan Kaynakları", "İK Direktörü", "https://api.dicebear.com/7.x/avataaars/svg?seed=Selin"),
        ("burak.kaya@kodus.ai", pwd, "Burak", "Kaya", "employee", demo_key, "Yazılım & Teknoloji", "Senior Backend Developer", "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak"),
        ("elif.demir@kodus.ai", pwd, "Elif", "Demir", "manager", demo_key, "Ürün Tasarımı", "Lead UI/UX Designer", "https://api.dicebear.com/7.x/avataaars/svg?seed=Elif"),
        ("can.ozturk@kodus.ai", pwd, "Can", "Öztürk", "finance", demo_key, "Finans & Muhasebe", "Bordro ve Mali İşler Uzmanı", "https://api.dicebear.com/7.x/avataaars/svg?seed=Can"),
        ("deniz.aksoy@kodus.ai", pwd, "Deniz", "Aksoy", "employee", demo_key, "Pazarlama & Büyüme", "Growth Marketing Lead", "https://api.dicebear.com/7.x/avataaars/svg?seed=Deniz"),
        ("mert.celik@kodus.ai", pwd, "Mert", "Çelik", "employee", demo_key, "Yazılım & Teknoloji", "Full Stack Developer", "https://api.dicebear.com/7.x/avataaars/svg?seed=Mert")
    ]

    for u in users:
        cursor.execute("""
        INSERT INTO users (email, password_hash, name, surname, role, company_key, department, title, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (*u, "2026-09-24 10:00:00"))

    # 3. Demo Employees
    employees = [
        (demo_key, 1, "Ali Kerem", "Aydın", "alikerem@kodus.ai", "+90 532 100 2030", "Yazılım & Teknoloji", "Lead Software Architect", "hr_admin", 135000.0, "2024-01-15", 20, 4, "https://api.dicebear.com/7.x/bottts/svg?seed=AliKerem", "active"),
        (demo_key, 2, "Selin", "Yılmaz", "selin.yilmaz@kodus.ai", "+90 533 211 4050", "İnsan Kaynakları", "İK Direktörü", "hr_admin", 95000.0, "2023-05-10", 18, 3, "https://api.dicebear.com/7.x/avataaars/svg?seed=Selin", "active"),
        (demo_key, 3, "Burak", "Kaya", "burak.kaya@kodus.ai", "+90 544 322 5060", "Yazılım & Teknoloji", "Senior Backend Developer", "employee", 88000.0, "2024-03-01", 14, 2, "https://api.dicebear.com/7.x/avataaars/svg?seed=Burak", "active"),
        (demo_key, 4, "Elif", "Demir", "elif.demir@kodus.ai", "+90 535 433 6070", "Ürün Tasarımı", "Lead UI/UX Designer", "manager", 92000.0, "2023-11-20", 16, 5, "https://api.dicebear.com/7.x/avataaars/svg?seed=Elif", "active"),
        (demo_key, 5, "Can", "Öztürk", "can.ozturk@kodus.ai", "+90 536 544 7080", "Finans & Muhasebe", "Bordro ve Mali İşler Uzmanı", "finance", 78000.0, "2024-02-01", 14, 0, "https://api.dicebear.com/7.x/avataaars/svg?seed=Can", "active"),
        (demo_key, 6, "Deniz", "Aksoy", "deniz.aksoy@kodus.ai", "+90 537 655 8090", "Pazarlama & Büyüme", "Growth Marketing Lead", "employee", 82000.0, "2024-04-12", 14, 1, "https://api.dicebear.com/7.x/avataaars/svg?seed=Deniz", "active"),
        (demo_key, 7, "Mert", "Çelik", "mert.celik@kodus.ai", "+90 538 766 9100", "Yazılım & Teknoloji", "Full Stack Developer", "employee", 72000.0, "2024-06-01", 14, 0, "https://api.dicebear.com/7.x/avataaars/svg?seed=Mert", "on_leave")
    ]

    cursor.executemany("""
    INSERT INTO employees (company_key, user_id, name, surname, email, phone, department, title, role, salary, start_date, annual_leave_days, used_leave_days, avatar_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, employees)

    # 4. Demo Leaves
    leaves = [
        (demo_key, 7, "Yıllık İzin", "2026-09-22", "2026-09-28", 5, "Sonbahar tatili ve dinlenme", "approved", "2026-09-18 10:30", 2, None),
        (demo_key, 3, "Mazeret İzni", "2026-09-30", "2026-10-01", 2, "Ailevi acil durum ve resmi daire işlemleri", "pending", "2026-09-24 14:15", None, None),
        (demo_key, 4, "Yıllık İzin", "2026-10-10", "2026-10-15", 4, "Tasarım konferansı katılımı ve izin", "pending", "2026-09-24 16:00", None, None),
        (demo_key, 6, "Hastalık / Rapor", "2026-09-10", "2026-09-11", 2, "Gribal enfeksiyon raporu", "approved", "2026-09-10 09:00", 2, None)
    ]

    cursor.executemany("""
    INSERT INTO leave_requests (company_key, employee_id, leave_type, start_date, end_date, days, reason, status, created_at, approved_by, rejection_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, leaves)

    # 5. Demo Payrolls
    payrolls = [
        (demo_key, 1, "2026-09", 185000.0, 135000.0, 25900.0, 24100.0, 10000.0, "paid", "2026-09-20"),
        (demo_key, 2, "2026-09", 130000.0, 95000.0, 18200.0, 16800.0, 5000.0, "paid", "2026-09-20"),
        (demo_key, 3, "2026-09", 120000.0, 88000.0, 16800.0, 15200.0, 0.0, "paid", "2026-09-20"),
        (demo_key, 4, "2026-09", 126000.0, 92000.0, 17640.0, 16360.0, 4000.0, "paid", "2026-09-20"),
        (demo_key, 5, "2026-09", 107000.0, 78000.0, 14980.0, 14020.0, 0.0, "paid", "2026-09-20"),
        (demo_key, 6, "2026-09", 112000.0, 82000.0, 15680.0, 14320.0, 0.0, "paid", "2026-09-20"),
        (demo_key, 7, "2026-09", 98000.0, 72000.0, 13720.0, 12280.0, 0.0, "paid", "2026-09-20")
    ]

    cursor.executemany("""
    INSERT INTO payrolls (company_key, employee_id, month, gross_salary, net_salary, sgk_employee, income_tax, bonus, status, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, payrolls)

    # 6. Default Plugins for demo company
    plugin_bday = {
        "id": "plugin_birthday_tracker",
        "company_key": demo_key,
        "name": "🎂 Doğum Günü & Kutlama Radarı",
        "description": "Şirkette bu ay doğan çalışanları listeler ve anında tebrik mesajı göndermeyi sağlar.",
        "category": "Kültür & Etkinlik",
        "icon": "cake",
        "author": "Yapay Zeka (Gemini)",
        "code_html": """
<div class="bday-container">
    <div class="bday-header">
        <span class="badge">Eylül / Ekim Dönemi</span>
        <button id="btnConfetti" class="btn-sm">🎉 Şirket Kutlaması Başlat</button>
    </div>
    <div id="bdayList" class="bday-list"></div>
</div>
""",
        "code_js": """
KodusSDK.getEmployees().then(employees => {
    const listEl = document.getElementById('bdayList');
    const bdays = [
        { name: 'Selin Yılmaz', dept: 'İnsan Kaynakları', date: '28 Eylül (4 Gün Sonra)' },
        { name: 'Ali Kerem Aydın', dept: 'Yazılım & Teknoloji', date: '5 Ekim' },
        { name: 'Burak Kaya', dept: 'Yazılım', date: '12 Ekim' }
    ];
    listEl.innerHTML = bdays.map(b => `
        <div class="bday-item">
            <div class="bday-info">
                <strong>${b.name}</strong>
                <span>${b.dept} • <small class="text-accent">${b.date}</small></span>
            </div>
            <button class="bday-btn" onclick="sendWish('${b.name}')">🎈 Kutla</button>
        </div>
    `).join('');
});
window.sendWish = function(name) {
    KodusSDK.notify('Tebrik İletildi', name + ' için tebrik mesajınız gönderildi!', 'success');
};
document.getElementById('btnConfetti').addEventListener('click', () => {
    KodusSDK.notify('Parti Zamanı!', 'Tüm ofis kanalında kutlama efekti tetiklendi! 🎊', 'info');
});
""",
        "code_css": """
.bday-container { font-family: inherit; }
.bday-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.badge { background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.btn-sm { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 5px 12px; border-radius: 8px; font-size: 11px; cursor: pointer; transition: 0.2s; }
.bday-list { display: flex; flex-direction: column; gap: 8px; }
.bday-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 8px 12px; border-radius: 10px; }
.bday-info strong { display: block; font-size: 13px; color: #f1f5f9; }
.bday-info span { font-size: 11px; color: #94a3b8; }
.text-accent { color: #f43f5e !important; font-weight: 600; }
.bday-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; }
.bday-btn:hover { background: #ec4899; color: white; border-color: #ec4899; }
""",
        "is_active": 1,
        "created_at": "2026-09-24 10:00:00"
    }

    cursor.execute("""
    INSERT INTO plugins (id, company_key, name, description, category, icon, author, code_html, code_js, code_css, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (plugin_bday["id"], demo_key, plugin_bday["name"], plugin_bday["description"], plugin_bday["category"], plugin_bday["icon"], plugin_bday["author"], plugin_bday["code_html"], plugin_bday["code_js"], plugin_bday["code_css"], plugin_bday["is_active"], plugin_bday["created_at"]))

    # 7. Community Ideas
    community_ideas = [
        ("Nöbetçi Eczane ve Sağlık Destek Widget'ı", "Ofis yakınındaki nöbetçi eczaneleri ve anlaşmalı özel sağlık kuruluşlarını listeleyen harita eklentisi.", "Sağlık & İSG", "İnsan Kaynakları", 42, 1, "2026-09-21 09:00:00"),
        ("İkram ve İhtiyaç Bildirim Zili", "Toplantı odalarına su, kahve veya teknik destek çağırmak için tek tık bildirim gönderme aracı.", "Ofis & Operasyon", "Yazılım & Teknoloji", 35, 1, "2026-09-22 14:20:00"),
        ("Taksi & Servis Güzergah Takibi", "Mesaiye kalanlar için ortak taksi çağırma ve akşam servis kalkış saatlerini canlı gösteren widget.", "Ulaşım & Yan Haklar", "Pazarlama", 29, 1, "2026-09-23 18:00:00"),
        ("Çalışan Teşekkür ve Alkış Duvarı", "Birbirine yardım eden takım arkadaşlarının kudos/teşekkür puanı verip şirket panosunda paylaştığı sosyal modül.", "Kültür & Motivasyon", "Ürün Tasarımı", 68, 1, "2026-09-24 11:10:00")
    ]

    cursor.executemany("""
    INSERT INTO community_ideas (title, description, category, department_origin, upvotes, is_anonymized, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, community_ideas)

    conn.commit()

if __name__ == "__main__":
    # If resetting database schema
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    init_db()
    print("Multi-tenant Database initialized successfully at", DB_PATH)
