/**
 * home.js — Home Dashboard Page (Module: หน้าหลัก)
 */

const HomePage = {
  _statsCache: null,

  async render(container, params) {
    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Welcome Banner -->
        <div class="dashboard-welcome">
          <div class="welcome-content">
            <div class="welcome-badge">🏥 โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</div>
            <h1 class="welcome-title">ระบบลงทะเบียนอบรมออนไลน์</h1>
            <p class="welcome-subtitle">ภารกิจด้านการพยาบาล — จัดการการอบรม ลงทะเบียน และประเมินผลได้ทุกที่ ทุกเวลา</p>
            <div class="welcome-stats" id="welcomeStats">
              <div class="welcome-stat-item">
                <div class="welcome-stat-value" id="statTotal">—</div>
                <div class="welcome-stat-label">หัวข้ออบรมทั้งหมด</div>
              </div>
              <div class="welcome-stat-item">
                <div class="welcome-stat-value" id="statActive">—</div>
                <div class="welcome-stat-label">กำลังเปิดรับสมัคร</div>
              </div>
              <div class="welcome-stat-item">
                <div class="welcome-stat-value" id="statToday">—</div>
                <div class="welcome-stat-label">วันนี้ ${Utils.today('short')}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid" id="statsGrid">
          ${this._skeletonStats()}
        </div>

        <!-- Module Navigation Cards -->
        <div class="page-header">
          <h2 class="page-title" style="font-size: var(--text-xl);">เมนูหลัก</h2>
        </div>
        <div class="features-grid">
          ${this._renderFeatureCards()}
        </div>

        <!-- Recent Trainings -->
        <div class="recent-section">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">📋 หัวข้ออบรมล่าสุด</div>
                <div class="card-subtitle">รายการการอบรมที่สร้างล่าสุด</div>
              </div>
              <a href="#/create" class="btn btn-teal btn-sm">+ สร้างใหม่</a>
            </div>
            <div id="recentTrainings" class="card-body" style="padding: 0;">
              ${UI.showSkeleton ? '' : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Show skeleton first
    const recentEl = container.querySelector('#recentTrainings');
    UI.showSkeleton(recentEl, 'list', 4);

    // Load data
    await this._loadData(container);
  },

  _skeletonStats() {
    return Array(4).fill(0).map(() => `
      <div class="stat-card">
        <div class="skeleton skeleton-circle" style="width:52px;height:52px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton skeleton-text short" style="height:32px;margin-bottom:8px;"></div>
          <div class="skeleton skeleton-text medium"></div>
        </div>
      </div>
    `).join('');
  },

  _renderFeatureCards() {
    const cards = [
      { href: '#/create',       icon: '➕', title: 'สร้างหัวข้ออบรม',      desc: 'สร้างหัวข้อการอบรมใหม่ กำหนดวันและเวลาหลายรอบได้' },
      { href: '#/register',     icon: '📝', title: 'ลงทะเบียนอบรม',        desc: 'ลงทะเบียนเข้าร่วมการอบรม ค้นหาชื่อพนักงานจากฐานข้อมูล' },
      { href: '#/verify',       icon: '✅', title: 'ตรวจสอบรายชื่อ',       desc: 'ดูรายชื่อผู้เข้าอบรม พิมพ์ใบเซ็นชื่อและ Export Excel' },
      { href: '#/manage',       icon: '⚙️', title: 'ระบบบริหารจัดการ',    desc: 'จัดการ Pre/Post-test, แบบประเมิน และอนุมัติผู้เข้าอบรม' },
      { href: '#/pretest',      icon: '📋', title: 'Pre-test',              desc: 'สร้างข้อสอบก่อนอบรม พร้อม QR Code สำหรับผู้เรียน' },
      { href: '#/satisfaction', icon: '⭐', title: 'แบบประเมินความพึงพอใจ', desc: 'สร้างแบบประเมินและวิเคราะห์ผลความพึงพอใจ' },
    ];
    return cards.map(c => `
      <a href="${c.href}" class="feature-card" data-route="${c.href.slice(1)}">
        <div class="feature-card-icon">${c.icon}</div>
        <div class="feature-card-title">${c.title}</div>
        <div class="feature-card-desc">${c.desc}</div>
      </a>
    `).join('');
  },

  async _loadData(container) {
    try {
      const trainings = await API.getTrainings();
      this._statsCache = trainings;

      // Update welcome stats
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const active = trainings.filter(t => t.status === 'ACTIVE');
      const today  = trainings.filter(t => (t.sessions || []).some(s => (s.sessionDate || '').slice(0, 10) === todayStr));

      container.querySelector('#statTotal').textContent  = trainings.length;
      container.querySelector('#statActive').textContent = active.length;
      container.querySelector('#statToday').textContent  = today.length;

      // Update stat cards
      const statsGrid = container.querySelector('#statsGrid');
      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon navy">🗂️</div>
          <div class="stat-info">
            <div class="stat-value">${trainings.length}</div>
            <div class="stat-label">หัวข้ออบรมทั้งหมด</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teal">🟢</div>
          <div class="stat-info">
            <div class="stat-value">${active.length}</div>
            <div class="stat-label">กำลังเปิดรับสมัคร</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">📅</div>
          <div class="stat-info">
            <div class="stat-value">${today.length}</div>
            <div class="stat-label">อบรมวันนี้</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">📊</div>
          <div class="stat-info">
            <div class="stat-value">${trainings.reduce((s, t) => s + (t.sessionCount || 0), 0)}</div>
            <div class="stat-label">รอบการอบรมทั้งหมด</div>
          </div>
        </div>
      `;

      // Recent trainings list
      const recentEl = container.querySelector('#recentTrainings');
      if (!trainings.length) {
        UI.showEmpty(recentEl, {
          icon: '📋',
          title: 'ยังไม่มีหัวข้ออบรม',
          desc: 'เริ่มต้นสร้างหัวข้ออบรมใหม่ได้เลย',
          action: '<a href="#/create" class="btn btn-teal">+ สร้างหัวข้ออบรม</a>'
        });
        return;
      }

      const recent = trainings.slice(0, 5);
      recentEl.innerHTML = `
        <div>
          ${recent.map(t => `
            <div style="display:flex; align-items:center; gap: var(--space-4); padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--gray-100); transition: background var(--transition-fast);"
                 onmouseenter="this.style.background='var(--gray-50)'"
                 onmouseleave="this.style.background=''">
              <div style="width:44px; height:44px; border-radius:var(--radius-lg); background: linear-gradient(135deg, var(--navy-100), var(--teal-50)); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">📋</div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight: var(--fw-semi); color: var(--gray-800); font-size: var(--text-sm); margin-bottom: 2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.title}</div>
                <div style="font-size: var(--text-xs); color: var(--gray-500);">${t.organizer || ''} · ${t.sessionCount || 0} รอบ</div>
              </div>
              <span class="badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-gray'}">${t.status === 'ACTIVE' ? '🟢 เปิด' : '🔒 ปิด'}</span>
              <a href="#/register?id=${t.trainingId}" class="btn btn-outline-teal btn-sm">ลงทะเบียน</a>
            </div>
          `).join('')}
        </div>
      `;

    } catch (err) {
      const statsGrid = container.querySelector('#statsGrid');
      const recentEl  = container.querySelector('#recentTrainings');
      statsGrid.innerHTML = '';
      UI.showError(recentEl, 'ไม่สามารถโหลดข้อมูลได้: ' + err.message, () => this._loadData(container));
    }
  },

  cleanup() {
    this._statsCache = null;
  }
};
