/**
 * create-training.js — Module 1: Training Course Creation
 * สร้างหัวข้ออบรม กำหนดวัน/เวลา หลายรอบ พร้อม QR Code
 */

const CreateTrainingPage = {
  _sessionCount: 1,
  _locationOptions: [
    'ห้องประชุมพุทธชาด อาคารผู้ป่วยนอกชั้น 4 โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน',
    'ห้องประชุมอินทนิล อาคารผู้ป่วยนอกชั้น 3 โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน',
    'ห้องประชุมวิโรจนวัธน์ อาคารแพทย์แผนไทยและการแพทย์ทางเลือกชั้น 4 โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน'
  ],

  render(container, params) {
    this._sessionCount = 1;
    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">สร้างหัวข้ออบรม</h1>
          <p class="page-subtitle">กรอกข้อมูลหัวข้อการอบรมและกำหนดรอบวันเวลา</p>
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
                    <select id="trainingLocation" class="form-control" required>
                      <option value="">-- กรุณาเลือกห้องประชุม --</option>
                      ${this._locationOptions.map((loc, idx) => 
                        `<option value="${loc}">${loc}</option>`
                      ).join('')}
                    </select>
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

              <!-- ตั้งค่าจำนวนคนลงทะเบียน -->
              <div class="form-section">
                <div class="form-section-title">👥 ตั้งค่าจำนวนคนลงทะเบียน</div>
                <div class="form-group">
                  <label class="form-label">
                    <div style="display: flex; align-items: center; gap: var(--space-2);\">\n                      <input type="radio" name="registrationLimit" value="unlimited" checked>\n                      <span>ไม่จำกัด</span>\n                    </div>\n                  </label>\n                  <label class="form-label">\n                    <div style="display: flex; align-items: center; gap: var(--space-2);\">\n                      <input type="radio" name="registrationLimit" value="limited">\n                      <span>จำกัดจำนวนคน</span>\n                    </div>\n                  </label>\n                </div>\n                <div id="capacityInputGroup" class="form-group hidden\" style="margin-top: var(--space-4);\">\n                  <label class="form-label" for="maxCapacity">\n                    จำนวนคนสูงสุด <span class="required">*</span>\n                  </label>\n                  <input type="number" id="maxCapacity" class="form-control\"\n                    placeholder="เช่น 50" min="1" max="1000\">\n                </div>\n              </div>\n\n              <div class="form-group\" style="margin-top: var(--space-6);\">\n                <button type="submit" class="btn btn-primary btn-lg btn-block" id="createBtn\">\n                  🚀 สร้างหัวข้ออบรม\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n\n        <!-- Result Panel (hidden initially) -->\n        <div id="resultPanel" class="result-panel hidden animate-fade-in\">\n          <div class="result-panel-title\">🎉 สร้างหัวข้ออบรมสำเร็จ!</div>\n          <div class="result-grid\">\n            <div>\n              <div style="margin-bottom: var(--space-4);\">\n                <div class="code-display\">\n                  <div>\n                    <div class="code-label\">🆔 รหัสการอบรม</div>\n                    <div class="code-value" id="resultTrainingId\">—</div>\n                  </div>\n                  <button class="btn btn-ghost btn-sm" onclick=\"Utils.copyToClipboard(document.getElementById('resultTrainingId').textContent)\">📋 คัดลอก</button>\n                </div>\n              </div>\n              <div>\n                <div class="code-display\">\n                  <div>\n                    <div class="code-label\">🔑 รหัสผู้ดูแล (Management Code)</div>\n                    <div class="code-value" id="resultMgmtCode\">—</div>\n                  </div>\n                  <button class="btn btn-ghost btn-sm" onclick=\"Utils.copyToClipboard(document.getElementById('resultMgmtCode').textContent)\">📋 คัดลอก</button>\n                </div>\n                <div class="alert alert-warning" style="margin-top: var(--space-3);\">\n                  <span class="alert-icon\">⚠️</span>\n                  <div class="alert-content\">\n                    <div class="alert-title\">โปรดเก็บรหัสนี้ไว้</div>\n                    ใช้สำหรับเข้าสู่ระบบบริหารจัดการ ไม่สามารถกู้คืนได้หากสูญหาย\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div>\n              <div class="qr-panel has-qr\">\n                <div class="qr-label\">📱 QR Code สำหรับลงทะเบียน</div>\n                <div class="qr-canvas-wrapper\">\n                  <canvas id="resultQR\"></canvas>\n                </div>\n                <div class="qr-url" id="resultUrl\">—</div>\n                <div style="display:flex; gap: var(--space-2); justify-content:center; margin-top: var(--space-3);\">\n                  <button class="btn btn-outline-navy btn-sm" onclick="CreateTrainingPage._copyUrl()\">📋 คัดลอก URL</button>\n                  <button class="btn btn-outline-teal btn-sm" onclick="CreateTrainingPage._downloadQR()\">⬇️ บันทึก QR</button>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div style="margin-top: var(--space-5); text-align:center;\">\n            <button class="btn btn-ghost" onclick="CreateTrainingPage._resetForm()\">➕ สร้างหัวข้ออบรมใหม่</button>\n            <a href="#/verify" class="btn btn-teal" style="margin-left: var(--space-3);\">✅ ตรวจสอบรายชื่อ</a>\n          </div>\n        </div>\n      </div>\n    `;\n\n    // Handle registration limit toggle\n    const limitRadios = document.querySelectorAll('input[name=\"registrationLimit\"]');\n    limitRadios.forEach(radio => {\n      radio.addEventListener('change', () => {\n        const capacityGroup = document.getElementById('capacityInputGroup');\n        if (radio.value === 'limited') {\n          capacityGroup.classList.remove('hidden');\n          document.getElementById('maxCapacity').required = true;\n        } else {\n          capacityGroup.classList.add('hidden');\n          document.getElementById('maxCapacity').required = false;\n        }\n      });\n    });\n\n    // Add first session row\n    this._addSessionRow();\n\n    // Bind events\n    document.getElementById('addSessionBtn').addEventListener('click', () => this._addSessionRow());\n    document.getElementById('createTrainingForm').addEventListener('submit', (e) => this._handleSubmit(e));\n  },\n\n  _addSessionRow() {\n    const list = document.getElementById('sessionList');\n    const idx  = this._sessionCount++;\n    const row  = document.createElement('div');\n    row.className = 'session-row animate-fade-in';\n    row.id = `session-${idx}`;\n    row.innerHTML = `\n      <div class=\"form-group\">\n        <label class=\"form-label\">วันที่อบรม <span class=\"required\">*</span></label>\n        <input type=\"date\" class=\"form-control session-date\" required>\n      </div>\n      <div class=\"form-group\">\n        <label class=\"form-label\">เวลาเริ่ม <span class=\"required\">*</span></label>\n        <input type=\"time\" class=\"form-control session-start\" value=\"08:00\" required>\n      </div>\n      <div class=\"form-group\">\n        <label class=\"form-label\">เวลาสิ้นสุด <span class=\"required\">*</span></label>\n        <input type=\"time\" class=\"form-control session-end\" value=\"16:00\" required>\n      </div>\n      <button type=\"button\" class=\"session-remove-btn\" title=\"ลบรอบนี้\" ${idx === 1 ? 'disabled style=\"opacity:0.3\"' : ''}>\n        🗑\n      </button>\n    `;\n\n    row.querySelector('.session-remove-btn').addEventListener('click', () => {\n      if (document.querySelectorAll('.session-row').length > 1) {\n        row.remove();\n        this._sessionCount--;\n      } else {\n        UI.warning('ต้องมีอย่างน้อย 1 รอบการอบรม');\n      }\n    });\n\n    list.appendChild(row);\n  },\n\n  _collectSessions() {\n    const rows = document.querySelectorAll('.session-row');\n    const sessions = [];\n    let valid = true;\n\n    rows.forEach((row, i) => {\n      const date  = row.querySelector('.session-date').value;\n      const start = row.querySelector('.session-start').value;\n      const end   = row.querySelector('.session-end').value;\n\n      if (!date || !start || !end) { valid = false; return; }\n      if (start >= end) {\n        UI.error(`รอบที่ ${i + 1}: เวลาสิ้นสุดต้องหลังเวลาเริ่ม`);\n        valid = false; return;\n      }\n\n      sessions.push({\n        sessionDate: date,\n        sessionDateThai: Utils.dateInputToThai(date, 'long'),\n        startTime: start,\n        endTime: end\n      });\n    });\n\n    return valid ? sessions : null;\n  },\n\n  async _handleSubmit(e) {\n    e.preventDefault();\n\n    const title     = document.getElementById('trainingTitle').value.trim();\n    const organizer = document.getElementById('trainingOrganizer').value.trim();\n    const location  = document.getElementById('trainingLocation').value.trim();\n    const sessions  = this._collectSessions();\n    \n    // Get registration limit settings\n    const limitType = document.querySelector('input[name=\"registrationLimit\"]:checked')?.value || 'unlimited';\n    let maxCapacity = null;\n    if (limitType === 'limited') {\n      maxCapacity = parseInt(document.getElementById('maxCapacity').value) || null;\n      if (!maxCapacity || maxCapacity < 1) {\n        UI.error('กรุณาระบุจำนวนคนสูงสุดที่ถูกต้อง');\n        return;\n      }\n    }\n\n    if (!title || !organizer || !location) {\n      UI.error('กรุณากรอกข้อมูลให้ครบถ้วน');\n      return;\n    }\n    if (!sessions || sessions.length === 0) {\n      UI.error('กรุณาเพิ่มอย่างน้อย 1 รอบการอบรม และตรวจสอบข้อมูลให้ถูกต้อง');\n      return;\n    }\n\n    const btn = document.getElementById('createBtn');\n    UI.setButtonLoading(btn, true, 'กำลังสร้าง...');\n\n    try {\n      const result = await API.createTraining({ \n        title, \n        organizer, \n        location, \n        sessions,\n        registrationLimit: limitType,\n        maxCapacity: maxCapacity\n      });\n\n      // Show result panel\n      document.getElementById('resultTrainingId').textContent = result.trainingId;\n      document.getElementById('resultMgmtCode').textContent   = result.managementCode;\n\n      const url = Utils.buildRegisterUrl(result.trainingId);\n      document.getElementById('resultUrl').textContent = url;\n\n      // Generate QR\n      const canvas = document.getElementById('resultQR');\n      Utils.generateQR(canvas, url, 200);\n\n      document.getElementById('resultPanel').classList.remove('hidden');\n      document.getElementById('resultPanel').scrollIntoView({ behavior: 'smooth' });\n\n      UI.success('สร้างหัวข้ออบรมสำเร็จ!', 'สำเร็จ');\n\n    } catch (err) {\n      UI.error('ไม่สามารถสร้างหัวข้ออบรมได้: ' + err.message);\n    } finally {\n      UI.setButtonLoading(btn, false);\n    }\n  },\n\n  _copyUrl() {\n    const url = document.getElementById('resultUrl').textContent;\n    Utils.copyToClipboard(url);\n  },\n\n  _downloadQR() {\n    const canvas = document.getElementById('resultQR');\n    if (!canvas) return;\n    const link = document.createElement('a');\n    link.download = `QR_Register_${document.getElementById('resultTrainingId').textContent}.png`;\n    link.href = canvas.toDataURL('image/png');\n    link.click();\n  },\n\n  _resetForm() {\n    document.getElementById('createTrainingForm').reset();\n    document.getElementById('resultPanel').classList.add('hidden');\n    document.getElementById('sessionList').innerHTML = '';\n    document.getElementById('capacityInputGroup').classList.add('hidden');\n    this._sessionCount = 1;\n    this._addSessionRow();\n    window.scrollTo(0, 0);\n  },\n\n  cleanup() {\n    this._sessionCount = 1;\n  }\n};\n