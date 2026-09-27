"""
Kodus HR - Next-Gen AI SaaS Platform Backend Server.
Multi-tenant architecture with real Auth, Company Invite Keys, and Isolated Workspaces.
"""
import os
import sys
import json
import sqlite3
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import urllib.parse
from datetime import datetime

# Local imports
try:
    from backend.database import get_connection, init_db, hash_password, generate_company_key
    from backend.ai_engine import generate_plugin_with_gemini
except ImportError:
    from database import get_connection, init_db, hash_password, generate_company_key
    from ai_engine import generate_plugin_with_gemini

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
PORT = 8080

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class KodusHRRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Company-Key")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Company-Key")
        self.end_headers()

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_data = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_data)
        return {}

    def _get_company_key(self, query_params):
        # Read from header or query param
        header_key = self.headers.get("X-Company-Key")
        if header_key:
            return header_key
        if "company_key" in query_params:
            return query_params["company_key"][0]
        return None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            self.handle_api_get(path, urllib.parse.parse_qs(parsed.query))
        else:
            super().do_GET()

    def handle_api_get(self, path, query_params):
        conn = get_connection()
        cursor = conn.cursor()
        company_key = self._get_company_key(query_params)

        try:
            # 1. Company Info & Stats
            if path == "/api/company/info":
                if not company_key:
                    self._send_json({"error": "Şirket anahtarı gereklidir"}, 400)
                    return
                cursor.execute("SELECT * FROM companies WHERE company_key = ?", (company_key,))
                comp = cursor.fetchone()
                if not comp:
                    self._send_json({"error": "Şirket bulunamadı"}, 404)
                    return
                self._send_json(dict(comp))

            elif path == "/api/stats":
                ck = company_key or "KODUS-DEMO-8A9F-2026-HQ01"
                cursor.execute("SELECT COUNT(*) FROM employees WHERE company_key = ? AND status = 'active'", (ck,))
                active_emp = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM employees WHERE company_key = ? AND status = 'on_leave'", (ck,))
                on_leave_emp = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM leave_requests WHERE company_key = ? AND status = 'pending'", (ck,))
                pending_leaves = cursor.fetchone()[0]

                cursor.execute("SELECT SUM(gross_salary) FROM payrolls WHERE company_key = ? AND month = '2026-09'", (ck,))
                payroll_sum = cursor.fetchone()[0] or 0.0

                cursor.execute("SELECT COUNT(*) FROM plugins WHERE (company_key = ? OR company_key IS NULL) AND is_active = 1", (ck,))
                active_plugins = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM community_ideas")
                total_ideas = cursor.fetchone()[0]

                self._send_json({
                    "active_employees": active_emp,
                    "on_leave_employees": on_leave_emp,
                    "pending_leaves": pending_leaves,
                    "monthly_payroll_total": payroll_sum,
                    "active_plugins": active_plugins,
                    "community_ideas_count": total_ideas
                })

            # 2. Employees API (Company Scoped)
            elif path == "/api/employees":
                ck = company_key or "KODUS-DEMO-8A9F-2026-HQ01"
                cursor.execute("""
                    SELECT id, company_key, name, surname, email, phone, department, title, role, salary, 
                           start_date, annual_leave_days, used_leave_days, avatar_url, status 
                    FROM employees 
                    WHERE company_key = ?
                    ORDER BY id ASC
                """, (ck,))
                rows = [dict(row) for row in cursor.fetchall()]
                self._send_json(rows)

            # 3. Leave Requests API (Company Scoped)
            elif path == "/api/leaves":
                ck = company_key or "KODUS-DEMO-8A9F-2026-HQ01"
                cursor.execute("""
                    SELECT lr.*, e.name as emp_name, e.surname as emp_surname, 
                           e.department as emp_dept, e.avatar_url as emp_avatar
                    FROM leave_requests lr
                    JOIN employees e ON lr.employee_id = e.id
                    WHERE lr.company_key = ?
                    ORDER BY lr.id DESC
                """, (ck,))
                rows = [dict(row) for row in cursor.fetchall()]
                self._send_json(rows)

            # 4. Payrolls API (Company Scoped)
            elif path == "/api/payrolls":
                ck = company_key or "KODUS-DEMO-8A9F-2026-HQ01"
                cursor.execute("""
                    SELECT p.*, e.name as emp_name, e.surname as emp_surname, 
                           e.department as emp_dept, e.title as emp_title, e.avatar_url as emp_avatar
                    FROM payrolls p
                    JOIN employees e ON p.employee_id = e.id
                    WHERE p.company_key = ?
                    ORDER BY p.id DESC
                """, (ck,))
                rows = [dict(row) for row in cursor.fetchall()]
                self._send_json(rows)

            # 5. Plugins API (Company Scoped)
            elif path == "/api/plugins":
                ck = company_key or "KODUS-DEMO-8A9F-2026-HQ01"
                cursor.execute("SELECT * FROM plugins WHERE company_key = ? OR company_key IS NULL ORDER BY created_at DESC", (ck,))
                rows = [dict(row) for row in cursor.fetchall()]
                self._send_json(rows)

            # 6. Community Inspiration Ideas API (Global)
            elif path == "/api/community-ideas":
                cursor.execute("SELECT * FROM community_ideas ORDER BY upvotes DESC, id DESC")
                rows = [dict(row) for row in cursor.fetchall()]
                self._send_json(rows)

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        conn = get_connection()
        cursor = conn.cursor()

        try:
            # 1. Auth: Login
            if path == "/api/auth/login":
                email = body.get("email", "").strip().lower()
                password = body.get("password", "")

                cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
                user = cursor.fetchone()

                if not user or user["password_hash"] != hash_password(password):
                    self._send_json({"error": "E-posta veya şifre hatalı"}, 401)
                    return

                u_dict = dict(user)
                del u_dict["password_hash"]

                company = None
                if u_dict.get("company_key"):
                    cursor.execute("SELECT * FROM companies WHERE company_key = ?", (u_dict["company_key"],))
                    c_row = cursor.fetchone()
                    if c_row:
                        company = dict(c_row)

                self._send_json({
                    "success": True,
                    "user": u_dict,
                    "company": company
                })

            # 2. Auth: Register
            elif path == "/api/auth/register":
                email = body.get("email", "").strip().lower()
                password = body.get("password", "")
                name = body.get("name", "").strip()
                surname = body.get("surname", "").strip()
                is_admin = body.get("isAdmin", False)
                role = body.get("role", "employee")
                company_key = body.get("companyKey", "").strip().upper()
                department = body.get("department", "Genel")
                title = body.get("title", "Uzman")

                if not email or not password or not name:
                    self._send_json({"error": "Lütfen gerekli alanları doldurun"}, 400)
                    return

                cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
                if cursor.fetchone():
                    self._send_json({"error": "Bu e-posta adresi zaten kayıtlı"}, 400)
                    return

                company = None
                if not is_admin:
                    # Employee registration requires valid company key
                    if not company_key:
                        self._send_json({"error": "Çalışan kaydı için şirket katılım anahtarı zorunludur"}, 400)
                        return

                    cursor.execute("SELECT * FROM companies WHERE company_key = ?", (company_key,))
                    comp_row = cursor.fetchone()
                    if not comp_row:
                        self._send_json({"error": "Geçersiz şirket anahtarı. Lütfen yöneticinizden aldığınız kodu kontrol edin."}, 400)
                        return
                    company = dict(comp_row)
                else:
                    # Admin registers without company key; they will create the company network in dashboard!
                    company_key = None

                avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}{surname}"
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                    INSERT INTO users (email, password_hash, name, surname, role, company_key, department, title, avatar_url, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (email, hash_password(password), name, surname, role, company_key, department, title, avatar, created_at))
                user_id = cursor.lastrowid

                # If employee, also add to employees table so they appear immediately in admin's dashboard!
                if not is_admin and company_key:
                    cursor.execute("""
                        INSERT INTO employees (company_key, user_id, name, surname, email, department, title, role, salary, start_date, annual_leave_days, used_leave_days, avatar_url, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 65000, ?, 14, 0, ?, 'active')
                    """, (company_key, user_id, name, surname, email, department, title, role, datetime.now().strftime("%Y-%m-%d"), avatar))

                conn.commit()

                self._send_json({
                    "success": True,
                    "user": {
                        "id": user_id,
                        "email": email,
                        "name": name,
                        "surname": surname,
                        "role": role,
                        "company_key": company_key,
                        "department": department,
                        "title": title,
                        "avatar_url": avatar
                    },
                    "company": company
                })

            # 3. Company Network Creation (by Admin)
            elif path == "/api/company/create":
                user_id = body.get("userId")
                company_name = body.get("name", "").strip()
                sector = body.get("sector", "Teknoloji")
                admin_email = body.get("adminEmail", "")

                if not company_name:
                    self._send_json({"error": "Şirket adı zorunludur"}, 400)
                    return

                new_key = generate_company_key()
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                    INSERT INTO companies (name, company_key, sector, owner_email, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (company_name, new_key, sector, admin_email, created_at))
                company_id = cursor.lastrowid

                # Update admin user's company_key
                cursor.execute("UPDATE users SET company_key = ? WHERE id = ?", (new_key, user_id))

                # Add admin as first employee in the directory
                cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                u = cursor.fetchone()
                cursor.execute("""
                    INSERT INTO employees (company_key, user_id, name, surname, email, department, title, role, salary, start_date, annual_leave_days, used_leave_days, avatar_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 120000, ?, 20, 0, ?, 'active')
                """, (new_key, user_id, u["name"], u["surname"], u["email"], u["department"], u["title"], u["role"], datetime.now().strftime("%Y-%m-%d"), u["avatar_url"]))

                conn.commit()

                self._send_json({
                    "success": True,
                    "company": {
                        "id": company_id,
                        "name": company_name,
                        "company_key": new_key,
                        "sector": sector,
                        "owner_email": admin_email
                    }
                })

            # 4. AI Plugin Generation Engine
            elif path == "/api/ai/generate":
                prompt = body.get("prompt", "").strip()
                api_key = body.get("apiKey", "").strip() or os.environ.get("GEMINI_API_KEY", "")
                share_anonymously = body.get("shareAnonymously", False)
                dept_origin = body.get("departmentOrigin", "Genel")

                if not prompt:
                    self._send_json({"error": "Prompt gereklidir"}, 400)
                    return

                generated = generate_plugin_with_gemini(prompt, api_key)

                if share_anonymously:
                    cursor.execute("""
                        INSERT INTO community_ideas (title, description, category, department_origin, plugin_payload, upvotes, is_anonymized, created_at)
                        VALUES (?, ?, ?, ?, ?, 1, 1, ?)
                    """, (
                        generated.get("name", prompt),
                        generated.get("description", prompt),
                        generated.get("category", "Yapay Zeka"),
                        dept_origin,
                        json.dumps(generated),
                        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    ))
                    conn.commit()

                self._send_json({
                    "success": True,
                    "plugin": generated,
                    "shared_anonymously": share_anonymously
                })

            # 5. Install Plugin
            elif path == "/api/plugins":
                p = body
                ck = p.get("company_key") or self.headers.get("X-Company-Key")
                cursor.execute("""
                    INSERT OR REPLACE INTO plugins 
                    (id, company_key, name, description, category, icon, author, code_html, code_js, code_css, is_active, created_at, config_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """, (
                    p.get("id"),
                    ck,
                    p.get("name"),
                    p.get("description"),
                    p.get("category", "Genel"),
                    p.get("icon", "box"),
                    p.get("author", "Kullanıcı"),
                    p.get("code_html", ""),
                    p.get("code_js", ""),
                    p.get("code_css", ""),
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    json.dumps(p.get("config", {}))
                ))
                conn.commit()
                self._send_json({"success": True, "id": p.get("id")})

            # 6. Create Leave Request
            elif path == "/api/leaves":
                ck = body.get("company_key") or self.headers.get("X-Company-Key")
                emp_id = body.get("employee_id")
                leave_type = body.get("leave_type", "Yıllık İzin")
                start_date = body.get("start_date")
                end_date = body.get("end_date")
                days = body.get("days", 1)
                reason = body.get("reason", "")

                cursor.execute("""
                    INSERT INTO leave_requests (company_key, employee_id, leave_type, start_date, end_date, days, reason, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
                """, (ck, emp_id, leave_type, start_date, end_date, days, reason, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                conn.commit()
                self._send_json({"success": True, "id": cursor.lastrowid})

            # 7. Add Employee Manually
            elif path == "/api/employees":
                ck = body.get("company_key") or self.headers.get("X-Company-Key")
                name = body.get("name")
                surname = body.get("surname")
                email = body.get("email")
                phone = body.get("phone", "")
                dept = body.get("department", "Yazılım")
                title = body.get("title", "Uzman")
                role = body.get("role", "employee")
                salary = float(body.get("salary", 50000))
                avatar = body.get("avatar_url") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}{surname}"

                cursor.execute("""
                    INSERT INTO employees (company_key, name, surname, email, phone, department, title, role, salary, start_date, annual_leave_days, avatar_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 14, ?, 'active')
                """, (ck, name, surname, email, phone, dept, title, role, salary, datetime.now().strftime("%Y-%m-%d"), avatar))
                conn.commit()
                self._send_json({"success": True, "id": cursor.lastrowid})

            # 8. Upvote Community Idea
            elif path.startswith("/api/community-ideas/") and path.endswith("/upvote"):
                idea_id = int(path.split("/")[3])
                cursor.execute("UPDATE community_ideas SET upvotes = upvotes + 1 WHERE id = ?", (idea_id,))
                conn.commit()
                self._send_json({"success": True})

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        conn = get_connection()
        cursor = conn.cursor()

        try:
            if path.startswith("/api/leaves/"):
                leave_id = int(path.split("/")[3])
                status = body.get("status")
                approver = body.get("approved_by", 1)

                cursor.execute("""
                    UPDATE leave_requests 
                    SET status = ?, approved_by = ? 
                    WHERE id = ?
                """, (status, approver, leave_id))

                if status == "approved":
                    cursor.execute("""
                        UPDATE employees 
                        SET used_leave_days = used_leave_days + (SELECT days FROM leave_requests WHERE id = ?)
                        WHERE id = (SELECT employee_id FROM leave_requests WHERE id = ?)
                    """, (leave_id, leave_id))

                conn.commit()
                self._send_json({"success": True})

            elif path.startswith("/api/plugins/") and path.endswith("/toggle"):
                plugin_id = path.split("/")[3]
                cursor.execute("UPDATE plugins SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", (plugin_id,))
                conn.commit()
                self._send_json({"success": True})

            else:
                self._send_json({"error": "Endpoint not found"}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        conn = get_connection()
        cursor = conn.cursor()

        try:
            if path.startswith("/api/plugins/"):
                plugin_id = path.split("/")[3]
                cursor.execute("DELETE FROM plugins WHERE id = ?", (plugin_id,))
                conn.commit()
                self._send_json({"success": True})
            else:
                self._send_json({"error": "Endpoint not found"}, 404)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

def run_server(port=PORT):
    init_db()
    server_address = ("", port)
    httpd = ThreadedHTTPServer(server_address, KodusHRRequestHandler)
    print(f"🚀 Kodus HR SaaS Web Application running at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
