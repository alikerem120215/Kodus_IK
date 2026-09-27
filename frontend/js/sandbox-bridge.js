/**
 * Kodus HR - Secure Sandboxed Plugin Runtime & KodusSDK Bridge
 * Executes dynamic, AI-generated code securely inside an isolated <iframe>.
 * The plugin has NO direct access to cookies, parent DOM, or sensitive credentials.
 * Interacts solely via postMessage through the controlled KodusSDK.
 */

window.SandboxBridge = {
  activeFrames: new Map(),

  init() {
    window.addEventListener("message", this.handleMessage.bind(this));
  },

  /**
   * Generates the sandboxed iframe HTML document including the isolated KodusSDK
   */
  buildSandboxDoc(plugin) {
    const sdkScript = `
      (function() {
        const _pendingRequests = new Map();
        let _reqId = 0;

        window.addEventListener('message', function(event) {
          const { type, reqId, data, error } = event.data || {};
          if (type === 'KODUS_SDK_RESPONSE' && _pendingRequests.has(reqId)) {
            const { resolve, reject } = _pendingRequests.get(reqId);
            _pendingRequests.delete(reqId);
            if (error) reject(new Error(error));
            else resolve(data);
          }
        });

        function _callParent(action, payload = {}) {
          return new Promise((resolve, reject) => {
            const reqId = ++_reqId;
            _pendingRequests.set(reqId, { resolve, reject });
            window.parent.postMessage({
              type: 'KODUS_SDK_REQUEST',
              pluginId: '${plugin.id}',
              action,
              reqId,
              payload
            }, '*');
          });
        }

        window.KodusSDK = {
          getEmployees() {
            return _callParent('GET_EMPLOYEES');
          },
          getCurrentUser() {
            return _callParent('GET_CURRENT_USER');
          },
          requestLeave(leaveType, days, reason) {
            return _callParent('REQUEST_LEAVE', { leaveType, days, reason });
          },
          notify(title, message, type = 'info') {
            _callParent('SHOW_NOTIFICATION', { title, message, type });
          },
          storage: {
            get(key) {
              const item = localStorage.getItem('kodus_plugin_${plugin.id}_' + key);
              try { return JSON.parse(item); } catch(e) { return item; }
            },
            set(key, value) {
              localStorage.setItem('kodus_plugin_${plugin.id}_' + key, JSON.stringify(value));
            }
          }
        };

        // Notify parent of content height for responsive sizing
        window.addEventListener('load', function() {
          const height = document.documentElement.scrollHeight || document.body.scrollHeight;
          window.parent.postMessage({
            type: 'KODUS_WIDGET_RESIZE',
            pluginId: '${plugin.id}',
            height: height + 20
          }, '*');
        });
      })();
    `;

    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: transparent;
            color: #f1f5f9;
            padding: 14px;
            font-size: 13px;
            overflow-x: hidden;
          }
          button { font-family: inherit; }
          ${plugin.code_css || ""}
        </style>
      </head>
      <body>
        ${plugin.code_html || ""}
        <script>${sdkScript}<\/script>
        <script>
          try {
            ${plugin.code_js || ""}
          } catch(err) {
            console.error("Plugin runtime error:", err);
            document.body.innerHTML += '<div style="color:#ef4444;font-size:11px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px;margin-top:6px;">⚠️ Eklenti Hatası: ' + err.message + '</div>';
          }
        <\/script>
      </body>
      </html>
    `;
  },

  /**
   * Mounts a plugin into a container using an isolated iframe
   */
  mount(containerEl, plugin) {
    const iframe = document.createElement("iframe");
    iframe.className = "widget-iframe-frame";
    // Sandboxed with allow-scripts: No allow-same-origin, completely isolated from parent cookies and localStorage
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("title", plugin.name || "Kodus Plugin");

    const htmlDoc = this.buildSandboxDoc(plugin);
    iframe.srcdoc = htmlDoc;

    containerEl.innerHTML = "";
    containerEl.appendChild(iframe);
    this.activeFrames.set(plugin.id, iframe);
  },

  /**
   * Secure message router between Sandboxed Iframes and Parent App
   */
  async handleMessage(event) {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    // Handle auto-resizing
    if (data.type === "KODUS_WIDGET_RESIZE") {
      const frame = this.activeFrames.get(data.pluginId);
      if (frame && data.height > 80) {
        frame.style.height = `${Math.min(data.height, 420)}px`;
      }
      return;
    }

    // Handle KodusSDK API Requests
    if (data.type === "KODUS_SDK_REQUEST") {
      const { action, reqId, payload, pluginId } = data;
      const sourceWindow = event.source;

      const sendResponse = (respData, error = null) => {
        if (sourceWindow) {
          sourceWindow.postMessage({
            type: "KODUS_SDK_RESPONSE",
            reqId,
            data: respData,
            error
          }, "*");
        }
      };

      try {
        switch (action) {
          case "GET_EMPLOYEES": {
            // KVKK Compliant: Sanitize and return ONLY safe fields (no salary, no national ID)
            const employees = window.AppState.employees.map(e => ({
              id: e.id,
              name: e.name,
              surname: e.surname,
              department: e.department,
              title: e.title,
              avatar_url: e.avatar_url,
              status: e.status
            }));
            sendResponse(employees);
            break;
          }

          case "GET_CURRENT_USER": {
            const user = window.AppState.currentUser;
            sendResponse({
              id: user.id,
              name: user.name,
              surname: user.surname,
              role: user.role,
              department: user.department
            });
            break;
          }

          case "REQUEST_LEAVE": {
            const res = await window.KodusAPI.createLeaveRequest({
              employee_id: window.AppState.currentUser.id,
              leave_type: payload.leaveType || "Yıllık İzin",
              start_date: new Date().toISOString().split("T")[0],
              end_date: new Date(Date.now() + 86400000 * (payload.days || 1)).toISOString().split("T")[0],
              days: payload.days || 1,
              reason: `[AI Eklentisi: ${pluginId}] ${payload.reason || "Otomatik Talep"}`
            });
            window.App.showToast("İzin Talebi Alındı", "Eklenti üzerinden oluşturulan talebiniz onaya gönderildi.", "success");
            sendResponse({ success: true, leaveId: res.id });
            break;
          }

          case "SHOW_NOTIFICATION": {
            window.App.showToast(payload.title, payload.message, payload.type);
            sendResponse({ success: true });
            break;
          }

          default:
            sendResponse(null, `Bilinmeyen SDK komutu: ${action}`);
        }
      } catch (err) {
        sendResponse(null, err.message);
      }
    }
  }
};

// Initialize sandbox bridge listener
window.SandboxBridge.init();
