/**
 * utils.js — Utility Functions
 * Thai date, ID generation, QR code, Excel/PDF export, debounce
 */

const Utils = {
  // ── Thai Buddhist Era Date ───────────────────────────────────
  THAI_MONTHS: [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
  ],
  THAI_MONTHS_SHORT: [
    'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
    'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'
  ],
  THAI_DAYS: ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],

  /**
   * แปลงวันที่เป็นรูปแบบไทย พ.ศ.
   * @param {Date|string} date
   * @param {'long'|'short'|'datetime'|'time'} format
   */
  thaiDate(date, format = 'long') {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const day   = d.getDate();
    const month = d.getMonth();
    const year  = d.getFullYear() + 543; // แปลง ค.ศ. → พ.ศ.
    const hours = String(d.getHours()).padStart(2, '0');
    const mins  = String(d.getMinutes()).padStart(2, '0');

    if (format === 'long')     return `${day} ${this.THAI_MONTHS[month]} ${year}`;
    if (format === 'short')    return `${day} ${this.THAI_MONTHS_SHORT[month]} ${year}`;
    if (format === 'datetime') return `${day} ${this.THAI_MONTHS[month]} ${year} เวลา ${hours}:${mins} น.`;
    if (format === 'time')     return `${hours}:${mins} น.`;
    if (format === 'numeric')  return `${String(day).padStart(2,'0')}/${String(month+1).padStart(2,'0')}/${year}`;

    return `${day} ${this.THAI_MONTHS[month]} ${year}`;
  },

  /** วันนี้ในรูปแบบไทย */
  today(format = 'long') { return this.thaiDate(new Date(), format); },

  /** แปลงค่า input[type=date] (YYYY-MM-DD) เป็น Thai date */
  dateInputToThai(dateStr, format = 'long') {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-').map(Number);
    const thaiYear = y + 543;
    if (format === 'short')   return `${d} ${this.THAI_MONTHS_SHORT[m-1]} ${thaiYear}`;
    if (format === 'numeric') return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${thaiYear}`;
    return `${d} ${this.THAI_MONTHS[m-1]} ${thaiYear}`;
  },

  /** แปลง Thai date string เป็น ISO date string สำหรับ input[type=date] */
  thaiYearToInput(thaiYear) {
    return String(Number(thaiYear) - 543);
  },

  // ── ID Generators ────────────────────────────────────────────
  /**
   * สร้าง unique ID
   * @param {string} prefix - เช่น 'TRN', 'SES', 'REG'
   */
  generateId(prefix = 'ID') {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
  },

  /** สร้าง management code 6 ตัวอักษรตัวเลข */
  generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัดตัวอักษรที่สับสน
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  },

  // ── QR Code Generation ───────────────────────────────────────
  /**
   * สร้าง QR Code ใส่ใน canvas element
   * @param {HTMLCanvasElement} canvas
   * @param {string} text - ข้อความ/URL
   * @param {number} [size=220]
   */
  generateQR(canvas, text, size = 220) {
    if (typeof QRious === 'undefined') {
      console.warn('[Utils] QRious library not loaded');
      return;
    }
    new QRious({
      element: canvas,
      value: text,
      size,
      foreground: '#0D2B5E',
      background: '#FFFFFF',
      level: 'H' // High error correction
    });
  },

  /** สร้าง Registration URL */
  buildRegisterUrl(trainingId) {
    const base = window.location.href.split('#')[0];
    return `${base}#/register?id=${trainingId}`;
  },

  /** สร้าง Pre-test URL */
  buildPretestUrl(trainingId) {
    const base = window.location.href.split('#')[0];
    return `${base}#/take-test?id=${trainingId}&type=PRE`;
  },

  /** สร้าง Post-test URL */
  buildPosttestUrl(trainingId) {
    const base = window.location.href.split('#')[0];
    return `${base}#/take-test?id=${trainingId}&type=POST`;
  },

  // ── Excel Export (SheetJS) ───────────────────────────────────
  /**
   * Export ข้อมูลเป็นไฟล์ Excel
   * @param {Array<object>} data - array of objects
   * @param {string} filename - ชื่อไฟล์ (ไม่ต้องใส่ .xlsx)
   * @param {object} [options] - { sheetName, headers }
   */
  exportExcel(data, filename, options = {}) {
    if (typeof XLSX === 'undefined') {
      UI.error('ไม่สามารถโหลด SheetJS library ได้');
      return;
    }

    const sheetName = options.sheetName || 'ข้อมูล';
    const wb = XLSX.utils.book_new();

    // ถ้ามี custom headers ให้ใช้
    let wsData = data;
    if (options.headers) {
      const rows = data.map(row => options.headers.map(h => row[h.key] ?? ''));
      wsData = [options.headers.map(h => h.label), ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    } else {
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
  },

  // ── PDF via Print ─────────────────────────────────────────────
  /**
   * Print to PDF: inject HTML into print area and trigger print
   * ใช้ @media print CSS — รองรับภาษาไทยโดยอัตโนมัติ
   * @param {string} html - HTML content
   * @param {string} [title] - document title
   */
  printPDF(html, title = 'เอกสาร') {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const prevTitle = document.title;
    document.title = title;
    printArea.innerHTML = html;
    printArea.classList.remove('hidden');

    window.print();

    // Restore after print
    setTimeout(() => {
      document.title = prevTitle;
      printArea.innerHTML = '';
      printArea.classList.add('hidden');
    }, 1000);
  },

  /**
   * สร้าง HTML สำหรับใบเซ็นชื่อ (เอกสารราชการสไตล์ไทย)
   */
  buildAttendanceHTML(training, session, registrations) {
    const sessionDateStr = session.sessionDate
      ? Utils.thaiDate(new Date(session.sessionDate), 'long')
      : Utils.dateInputToThai(session.sessionDateRaw, 'long');

    // จัดเรียงตามหน่วยงาน
    const sorted = [...registrations].sort((a, b) =>
      (a.department || '').localeCompare(b.department || '', 'th')
    );

    let rows = '';
    let no = 1;
    let lastDept = null;
    sorted.forEach(reg => {
      if (reg.department !== lastDept) {
        rows += `
          <tr>
            <td colspan="5" style="background:#e8e8e8; font-weight:700; font-size:11pt; padding:6pt 8pt;">
              หน่วยงาน: ${reg.department || '-'}
            </td>
          </tr>`;
        lastDept = reg.department;
      }
      rows += `
        <tr>
          <td style="text-align:center;">${no++}</td>
          <td>${reg.fullName || '-'}</td>
          <td>${reg.position || '-'}</td>
          <td>${reg.department || '-'}</td>
          <td style="text-align:center;">&nbsp;</td>
        </tr>`;
    });

    return `
      <div class="print-doc">
        <div class="print-doc-header">
          <div class="print-doc-title">${training.title || 'หัวข้อการอบรม'}</div>
          <div class="print-doc-subtitle">
            วันที่ ${sessionDateStr} &nbsp;|&nbsp;
            เวลา ${session.startTime || '-'} – ${session.endTime || '-'} น. &nbsp;|&nbsp;
            สถานที่ ${training.location || '-'}
          </div>
        </div>
        <table class="print-table" width="100%">
          <thead>
            <tr>
              <th style="width:40pt; text-align:center;">ที่</th>
              <th>ชื่อ-นามสกุล</th>
              <th style="width:120pt;">ตำแหน่ง</th>
              <th style="width:130pt;">หน่วยงาน</th>
              <th class="signature-col" style="text-align:center;">ลายมือชื่อ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:20pt; font-size:11pt; color:#666;">
          จำนวนผู้เข้าอบรมทั้งหมด: ${registrations.length} ท่าน
        </div>
      </div>
    `;
  },

  // ── Debounce ─────────────────────────────────────────────────
  /**
   * Debounce function — ป้องกันการเรียกฟังก์ชันบ่อยเกินไป
   * @param {Function} fn
   * @param {number} ms - delay in milliseconds
   */
  debounce(fn, ms = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  },

  // ── String Helpers ───────────────────────────────────────────
  /** ค้นหาข้อความแบบ fuzzy (กรณีไม่ตรงตามตัวพิมพ์) */
  matchesSearch(text, query) {
    if (!query) return true;
    return String(text).toLowerCase().includes(String(query).toLowerCase());
  },

  /** ตัดข้อความยาว */
  truncate(text, maxLength = 50) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  },

  // ── Clipboard ─────────────────────────────────────────────────
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      UI.success('คัดลอกแล้ว!', 'คัดลอกสำเร็จ');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      UI.success('คัดลอกแล้ว!', 'คัดลอกสำเร็จ');
    }
  },

  // ── Score Color ───────────────────────────────────────────────
  scorePillClass(score, max = 100) {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 70) return 'high';
    if (pct >= 50) return 'mid';
    return 'low';
  },

  // ── Local Storage Helpers ─────────────────────────────────────
  storage: {
    get(key, fallback = null) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); }
      catch (e) { console.warn('[Storage] Failed to write:', e); }
    },
    remove(key) { localStorage.removeItem(key); }
  }
};
