/**
 * manage.js — Module 4: Management Hub
 * รหัสผ่าน access gate + เมนูจัดการ 4 โมดูล
 */

const ManagePage = {
  _unlockedTrainingId: null,
  _unlockedCode: null,

  render(container, params) {
    // ตรวจสอบว่ามี cached unlock หรือไม่
    const cached = Utils.storage.get('mgmt_unlock');
    if (cached && cached.trainingId && cached.code) {
      this._unlockedTrainingId = cached.trainingId;
      this._unlockedCode = cached.code;
      this._renderManagementHub(container, cached.trainingId);
      return;
    }

    this._renderGate(container);
  },

  _renderGate(container) {
    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="management-gate">
          <div class="management-gate-icon">🔐</div>
          <h2 class="management-gate-title">ระบบบริหารจัดการ</h2>
          <p class="management-gate-desc">กรุณาเลือกหัวข้ออบรมและใส่รหัสผู้ดูแล เพื่อเข้าสู่ระบบ</p>

          <div class="form-group" style="margin-bottom: var(--space-4); text-align:left;">
            <label class="form-label" for="mgmtTrainingSel">เลือกหัวข้ออบรม</label>
            <select id="mgmtTrainingSel" class="form-control">
              <option value="">กำลังโหลด...</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: var(--space-4); text-align:left;">
            <label class="form-label" for="mgmtCodeInput">รหัสผู้ดูแล (Management Code)</label>
            <div class="code-input-wrapper">
              <input type="text" id="mgmtCodeInput" class="code-input form-control"
                placeholder="เช่น A4BC8X" maxlength="12" style="text-transform:uppercase; letter-spacing:0.2em; font-size: var(--text-xl); text-align:center;">
            </div>
          </div>

          <button class="btn btn-primary btn-lg btn-block" id="unlockBtn">
            🔓 เข้าสู่ระบบ
          </button>
          <div id="unlockError" class="alert alert-danger hidden" style="margin-top: var(--space-4);">
            <span class="alert-icon">❌</span>
            <div class="alert-content">รหัสไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง</div>
          </div>
        </div>
      </div>
    `;

    this._loadTrainings();
    document.getElementById('mgmtCodeInput').addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    document.getElementById('unlockBtn').addEventListener('click', () => this._handleUnlock(container));
    document.getElementById('mgmtCodeInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleUnlock(container);
    });
  },

  async _loadTrainings() {
    try {
      const trainings = await API.getTrainings();
      const sel = document.getElementById('mgmtTrainingSel');
      if (!sel) return;
      sel.innerHTML = '<option value="">-- กรุณาเลือกหัวข้ออบรม --</option>';
      trainings.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.trainingId;
        opt.textContent = t.title;
        sel.appendChild(opt);
      });
    } catch (err) {
      UI.error('ไม่สามารถโหลดรายการอบรม');
    }
  },

  async _handleUnlock(container) {
    const trainingId = document.getElementById('mgmtTrainingSel').value;
    const code = document.getElementById('mgmtCodeInput').value.trim();
    const errEl = document.getElementById('unlockError');

    if (!trainingId) { UI.warning('กรุณาเลือกหัวข้ออบรม'); return; }
    if (!code) { UI.warning('กรุณาใส่รหัสผู้ดูแล'); return; }

    const btn = document.getElementById('unlockBtn');
    UI.setButtonLoading(btn, true, 'กำลังตรวจสอบ...');
    errEl.classList.add('hidden');

    try {
      await API.validateCode(trainingId, code);

      // Cache the unlock
      Utils.storage.set('mgmt_unlock', { trainingId, code });
      this._unlockedTrainingId = trainingId;
      this._unlockedCode = code;

      this._renderManagementHub(container, trainingId);
      UI.success('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับ');

    } catch (err) {
      errEl.classList.remove('hidden');
    } finally {
      UI.setButtonLoading(btn, false);
    }
  },

  _renderManagementHub(container, trainingId) {
    const training = Utils.storage.get('mgmt_unlock');
    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap: var(--space-4);">
          <div>
            <h1 class="page-title">ระบบบริหารจัดการ</h1>
            <p class="page-subtitle">รหัสการอบรม: <strong>${trainingId}</strong></p>
          </div>
          <button class="btn btn-ghost btn-sm" id="logoutMgmtBtn">🔒 ออกจากระบบ</button>
        </div>

        <div class="management-nav-grid">
          <a href="#/pretest?id=${trainingId}" class="management-nav-card">
            <div class="nav-card-icon">📋</div>
            <div class="nav-card-title">Pre-test</div>
            <div class="nav-card-desc">สร้างข้อสอบก่อนอบรม พร้อม QR Code</div>
          </a>
          <a href="#/posttest?id=${trainingId}" class="management-nav-card">
            <div class="nav-card-icon">📄</div>
            <div class="nav-card-title">Post-test</div>
            <div class="nav-card-desc">สร้างข้อสอบหลังอบรม หรือใช้ Pre-test เดิม</div>
          </a>
          <a href="#/satisfaction?id=${trainingId}" class="management-nav-card">
            <div class="nav-card-icon">⭐</div>
            <div class="nav-card-title">แบบประเมินความพึงพอใจ</div>
            <div class="nav-card-desc">สร้างและจัดการแบบประเมิน</div>
          </a>
          <a href="#/dashboard?id=${trainingId}" class="management-nav-card">
            <div class="nav-card-icon">📊</div>
            <div class="nav-card-title">อนุมัติ & วิเคราะห์</div>
            <div class="nav-card-desc">อนุมัติผู้เข้าอบรม วิเคราะห์ผลการเรียนรู้</div>
          </a>
        </div>
      </div>
    `;

    document.getElementById('logoutMgmtBtn').addEventListener('click', async () => {
      const ok = await UI.confirm('ต้องการออกจากระบบบริหารจัดการ?', 'ออกจากระบบ', 'danger');
      if (ok) {
        Utils.storage.remove('mgmt_unlock');
        this._unlockedTrainingId = null;
        this._unlockedCode = null;
        this._renderGate(container);
      }
    });
  },

  cleanup() {}
};
