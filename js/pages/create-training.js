/**
 * create-training.js — Module 1: Training Course Creation
 * สร้างหัวข้ออบรม กำหนดวัน/เวลา หลายรอบ พร้อม QR Code
 */

const CreateTrainingPage = {
  _sessionCount: 1,

  render(container, params) {
    this._sessionCount = 1;
    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">สร้างหัวข้ออบรม</h1>
          <p class="page-subtitle">กรอกข้อมูลหัวข้อการอบรมและกำหนดรอบวันเวลาได้หลายรอบ</p>
        </div>

        <div class="card training-form-card">
          <div class="card-body">
            <form id="createTrainingForm" novalidate>

              <!-- ข้อมูลพื้นฐาน -->
              <div class="form-section">
                <div class="form-section-title">📋 ข้อมูลการอบรม</div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label class="form-label" for="trainingTitle">
                      ชื่อหัวข้อการอบรม <span class="required">*</span>
                    </label>
                    <input type="text" id="trainingTitle" class="form-control"
                      placeholder="เช่น การพยาบาลผู้ป่วยวิกฤต" required maxlength="200">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="trainingOrganizer">
                      หน่วยงานที่จัด <span class="required">*</span>
                    </label>
                    <input type="text" id="trainingOrganizer" class="form-control"
                      placeholder="เช่น งานการพยาบาลผู้ป่วยอายุรกรรม" required maxlength="200">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="trainingLocation">
                      สถานที่จัด <span class="required">*</span>
                    </label>
                    <input type="text" id="trainingLocation" class="form-control"
                      placeholder="เช่น ห้องประชุมอาคาร 1 ชั้น 2" required maxlength="200">
                  </div>
                </div>
              </div>

              <!-- รอบวันเวลา -->
              <div class="form-section">
                <div class="form-section-title">📅 รอบวันและเวลาอบรม</div>
                <div id="sessionList" class="session-list"></div>
                <button type="button" class="add-session-btn" id="addSessionBtn">
                  ➕ เพิ่มรอบการอบรม
                </button>
              </div>

              <div class="form-group" style="margin-top: var(--space-6);">
                <button type="submit" class="btn btn-primary btn-lg btn-block" id="createBtn">
                  🚀 สร้างหัวข้ออบรม
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Result Panel (hidden initially) -->
        <div id="resultPanel" class="result-panel hidden animate-fade-in">
          <div class="result-panel-title">🎉 สร้างหัวข้ออบรมสำเร็จ!</div>
          <div class="result-grid">
            <div>
              <div style="margin-bottom: var(--space-4);">
                <div class="code-display">
                  <div>
                    <div class="code-label">🆔 รหัสการอบรม</div>
                    <div class="code-value" id="resultTrainingId">—</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="Utils.copyToClipboard(document.getElementById('resultTrainingId').textContent)">📋 คัดลอก</button>
                </div>
              </div>
              <div>
                <div class="code-display">
                  <div>
                    <div class="code-label">🔑 รหัสผู้ดูแล (Management Code)</div>
                    <div class="code-value" id="resultMgmtCode">—</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="Utils.copyToClipboard(document.getElementById('resultMgmtCode').textContent)">📋 คัดลอก</button>
                </div>
                <div class="alert alert-warning" style="margin-top: var(--space-3);">
                  <span class="alert-icon">⚠️</span>
                  <div class="alert-content">
                    <div class="alert-title">โปรดเก็บรหัสนี้ไว้</div>
                    ใช้สำหรับเข้าสู่ระบบบริหารจัดการ ไม่สามารถกู้คืนได้หากสูญหาย
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="qr-panel has-qr">
                <div class="qr-label">📱 QR Code สำหรับลงทะเบียน</div>
                <div class="qr-canvas-wrapper">
                  <canvas id="resultQR"></canvas>
                </div>
                <div class="qr-url" id="resultUrl">—</div>
                <div style="display:flex; gap: var(--space-2); justify-content:center; margin-top: var(--space-3);">
                  <button class="btn btn-outline-navy btn-sm" onclick="CreateTrainingPage._copyUrl()">📋 คัดลอก URL</button>
                  <button class="btn btn-outline-teal btn-sm" onclick="CreateTrainingPage._downloadQR()">⬇️ บันทึก QR</button>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: var(--space-5); text-align:center;">
            <button class="btn btn-ghost" onclick="CreateTrainingPage._resetForm()">➕ สร้างหัวข้ออบรมใหม่</button>
            <a href="#/verify" class="btn btn-teal" style="margin-left: var(--space-3);">✅ ตรวจสอบรายชื่อ</a>
          </div>
        </div>
      </div>
    `;

    // Add first session row
    this._addSessionRow();

    // Bind events
    document.getElementById('addSessionBtn').addEventListener('click', () => this._addSessionRow());
    document.getElementById('createTrainingForm').addEventListener('submit', (e) => this._handleSubmit(e));
  },

  _addSessionRow() {
    const list = document.getElementById('sessionList');
    const idx  = this._sessionCount++;
    const row  = document.createElement('div');
    row.className = 'session-row animate-fade-in';
    row.id = `session-${idx}`;
    row.innerHTML = `
      <div class="form-group">
        <label class="form-label">วันที่อบรม <span class="required">*</span></label>
        <input type="date" class="form-control session-date" required>
      </div>
      <div class="form-group">
        <label class="form-label">เวลาเริ่ม <span class="required">*</span></label>
        <input type="time" class="form-control session-start" value="08:00" required>
      </div>
      <div class="form-group">
        <label class="form-label">เวลาสิ้นสุด <span class="required">*</span></label>
        <input type="time" class="form-control session-end" value="16:00" required>
      </div>
      <button type="button" class="session-remove-btn" title="ลบรอบนี้" ${idx === 1 ? 'disabled style="opacity:0.3"' : ''}>
        🗑
      </button>
    `;

    row.querySelector('.session-remove-btn').addEventListener('click', () => {
      if (document.querySelectorAll('.session-row').length > 1) {
        row.remove();
      } else {
        UI.warning('ต้องมีอย่างน้อย 1 รอบการอบรม');
      }
    });

    list.appendChild(row);
  },

  _collectSessions() {
    const rows = document.querySelectorAll('.session-row');
    const sessions = [];
    let valid = true;

    rows.forEach((row, i) => {
      const date  = row.querySelector('.session-date').value;
      const start = row.querySelector('.session-start').value;
      const end   = row.querySelector('.session-end').value;

      if (!date || !start || !end) { valid = false; return; }
      if (start >= end) {
        UI.error(`รอบที่ ${i + 1}: เวลาสิ้นสุดต้องหลังเวลาเริ่ม`);
        valid = false; return;
      }

      sessions.push({
        sessionDate: date,
        sessionDateThai: Utils.dateInputToThai(date, 'long'),
        startTime: start,
        endTime: end
      });
    });

    return valid ? sessions : null;
  },

  async _handleSubmit(e) {
    e.preventDefault();

    const title     = document.getElementById('trainingTitle').value.trim();
    const organizer = document.getElementById('trainingOrganizer').value.trim();
    const location  = document.getElementById('trainingLocation').value.trim();
    const sessions  = this._collectSessions();

    if (!title || !organizer || !location) {
      UI.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!sessions || sessions.length === 0) {
      UI.error('กรุณาเพิ่มอย่างน้อย 1 รอบการอบรม และตรวจสอบข้อมูลให้ถูกต้อง');
      return;
    }

    const btn = document.getElementById('createBtn');
    UI.setButtonLoading(btn, true, 'กำลังสร้าง...');

    try {
      const result = await API.createTraining({ title, organizer, location, sessions });

      // Show result panel
      document.getElementById('resultTrainingId').textContent = result.trainingId;
      document.getElementById('resultMgmtCode').textContent   = result.managementCode;

      const url = Utils.buildRegisterUrl(result.trainingId);
      document.getElementById('resultUrl').textContent = url;

      // Generate QR
      const canvas = document.getElementById('resultQR');
      Utils.generateQR(canvas, url, 200);

      document.getElementById('resultPanel').classList.remove('hidden');
      document.getElementById('resultPanel').scrollIntoView({ behavior: 'smooth' });

      UI.success('สร้างหัวข้ออบรมสำเร็จ!', 'สำเร็จ');

    } catch (err) {
      UI.error('ไม่สามารถสร้างหัวข้ออบรมได้: ' + err.message);
    } finally {
      UI.setButtonLoading(btn, false);
    }
  },

  _copyUrl() {
    const url = document.getElementById('resultUrl').textContent;
    Utils.copyToClipboard(url);
  },

  _downloadQR() {
    const canvas = document.getElementById('resultQR');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QR_Register_${document.getElementById('resultTrainingId').textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  _resetForm() {
    document.getElementById('createTrainingForm').reset();
    document.getElementById('resultPanel').classList.add('hidden');
    document.getElementById('sessionList').innerHTML = '';
    this._sessionCount = 1;
    this._addSessionRow();
    window.scrollTo(0, 0);
  },

  cleanup() {
    this._sessionCount = 1;
  }
};
