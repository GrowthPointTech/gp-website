(function () {
  var areas = [
    {
      name: 'Leadership, Scope, & Governance (LSG)',
      items: [
        'Establish Security Culture & Direction',
        'Align Security Objectives with Strategic Goals',
        'Establish the Scope of the Program',
        'Ensure Competent Resource Allocation',
        'Assign Relevant Roles',
        'Executive Reporting on Program Effectiveness',
        'Management Reviews'
      ]
    },
    {
      name: 'Policy & Documentation Governance (PDG)',
      items: [
        'Cyber Program Documented',
        'Policy Governance Framework',
        'Documentation Governance',
        'Policies, Standards, Procedures, Frameworks'
      ]
    },
    {
      name: 'Risk & Compliance Framework (RCF)',
      items: [
        'Risk Assessment/Business Impact Analysis',
        'Legal & Regulatory Compliance',
        'Client Contractual Requirements',
        'Data Privacy',
        'Risk Register Tracking',
        'Risk Treatment & Mitigation Controls',
        'Third Party Vendor Management'
      ]
    },
    {
      name: 'Internal Security Controls (ISC)',
      items: [
        'Asset Lifecycle Management (Software & Hardware)',
        'Identity Account Management & JML Processes',
        'Data Protection & Access Control',
        'Secure Configuration & Hardening',
        'Malware Protection',
        'Audit Log Management & SIEM',
        'Physical Security',
        'Email & Web Security Protections',
        'Data Protection & Encryption',
        'Backup & Data Recovery',
        'Network Security, Monitoring & Defense',
        'Continuous Vulnerability Management',
        'Automated Penetration Testing',
        'Application Software Security'
      ]
    },
    {
      name: 'Incident Management & Response (IMR)',
      items: [
        'Incident Response Plan Development',
        'Detection & Alert Procedures',
        'Containment & Eradication Procedures',
        'Recovery Procedures',
        'Post-Incident Analysis & Lessons Learned',
        'Forensic Investigation Capabilities',
        'Crisis Communication Plan'
      ]
    },
    {
      name: 'Communication, Training, & Awareness (CTA)',
      items: [
        'Security Awareness Training Program',
        'Role-Based Security Training',
        'Phishing Simulation Exercises',
        'Security Policy Communication',
        'Compliance Training Requirements',
        'New Employee Security Onboarding',
        'Executive Security Briefings'
      ]
    },
    {
      name: 'Availability & Continuity (AVC)',
      items: [
        'Business Continuity Planning',
        'Disaster Recovery Planning',
        'Recovery Time Objective (RTO) Definition',
        'Recovery Point Objective (RPO) Definition',
        'DR Testing & Exercises',
        'Redundancy & Failover Architecture',
        'Backup Verification Procedures'
      ]
    },
    {
      name: 'Audit & Certifications (AUD)',
      items: [
        'Gap Assessments (SOC 2, ISO 27001, HIPAA, CMMC)',
        'Audit Readiness Reviews',
        'Pre-Audit Walkthroughs',
        'Evidence Collection & Control Documentation',
        'Remediation Planning & Milestone Tracking',
        'Internal Audit Program Development',
        'Certification Maintenance'
      ]
    },
    {
      name: 'Monitoring, Measuring, & Continual Improvement (MMC)',
      items: [
        'Security Metrics & KPI Tracking',
        'Continuous Monitoring Program',
        'Management Reviews',
        'Program Maturity Assessment',
        'Improvement Planning & Roadmaps',
        'Vendor/Third-Party Performance Monitoring',
        'Regulatory Change Monitoring'
      ]
    }
  ];

  var colors = [
    '#8D9BAE',  // LSG
    '#9DBFDA',  // PDG
    '#D6A3A8',  // RCF
    '#C96035',  // ISC
    '#3B82F6',  // IMR
    '#2356C8',  // CTA
    '#1A2744',  // AVC
    '#C4E83A',  // AUD
    '#96C83B',  // MMC
  ];

  // Wheel geometry — measured from production PNG (1329×1080) via pixel scan + Puppeteer
  var PNG_W = 1329, PNG_H = 1080;
  var cx = 694, cy = 565;   // center of white inner circle
  var innerR = 182;          // inner radius of colored ring

  // Segment start angles (degrees, 0=right/3-o'clock, clockwise positive)
  // Boundaries computed as midpoints between adjacent production hotspot angles
  var segStartAngles = [-109.5, -58, -21, 10, 41.5, 75, 110.5, 151, 195.5];

  // Outer radii measured via pixel scan at each segment's midpoint angle
  // Slight overreach (+15) ensures no gaps at segment edges
  var segOuterRadii = [423, 465, 459, 580, 491, 459, 538, 582, 492];

  function toRad(deg) { return deg * Math.PI / 180; }

  function segmentPath(i) {
    var startDeg = segStartAngles[i];
    var endDeg   = (i < segStartAngles.length - 1)
      ? segStartAngles[i + 1]
      : segStartAngles[0] + 360;
    var oR   = segOuterRadii[i];
    var s    = toRad(startDeg);
    var e    = toRad(endDeg);
    var large = (endDeg - startDeg) > 180 ? 1 : 0;

    var x1 = cx + innerR * Math.cos(s), y1 = cy + innerR * Math.sin(s);
    var x2 = cx + oR     * Math.cos(s), y2 = cy + oR     * Math.sin(s);
    var x3 = cx + oR     * Math.cos(e), y3 = cy + oR     * Math.sin(e);
    var x4 = cx + innerR * Math.cos(e), y4 = cy + innerR * Math.sin(e);

    return ['M',x1,y1,'L',x2,y2,'A',oR,oR,0,large,1,x3,y3,'L',x4,y4,'A',innerR,innerR,0,large,0,x1,y1,'Z'].join(' ');
  }

  function ns(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  // ── Modal ──────────────────────────────────────────────────────────────────

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'isms-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var panel = document.createElement('div');
    panel.className = 'isms-modal-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    var header = document.createElement('div');
    header.className = 'isms-modal-header';

    var title = document.createElement('h3');
    title.className = 'isms-modal-title';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'isms-modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L15 15M15 1L1 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    var list = document.createElement('ul');
    list.className = 'isms-modal-list';

    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    panel.appendChild(list);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    return { overlay: overlay, title: title, list: list };
  }

  var modal = null;

  function openModal(area) {
    if (!modal) modal = buildModal();

    modal.title.textContent = area.name;
    modal.list.innerHTML = '';
    area.items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'isms-modal-item';
      li.innerHTML =
        '<svg class="isms-modal-check" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="11" cy="11" r="11" fill="#0C50D5"/>' +
          '<path d="M6 11.5L9.5 15L16 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span>' + item + '</span>';
      modal.list.appendChild(li);
    });

    modal.overlay.setAttribute('aria-hidden', 'false');
    modal.overlay.classList.add('isms-modal-overlay--open');
    document.body.classList.add('isms-modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.overlay.setAttribute('aria-hidden', 'true');
    modal.overlay.classList.remove('isms-modal-overlay--open');
    document.body.classList.remove('isms-modal-open');
    segments.forEach(function (p) { p.style.fillOpacity = '0'; });
  }

  // ── Wheel ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    var wheelEl = document.getElementById('isms-wheel');
    if (!wheelEl) return;

    var svg = ns('svg');
    svg.setAttribute('viewBox', '0 0 ' + PNG_W + ' ' + PNG_H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-label', 'Interactive ISMS management wheel');
    svg.setAttribute('role', 'img');
    svg.style.cursor = 'default';

    var segments = [];

    function activate(i) {
      segments.forEach(function (p, j) {
        p.style.fillOpacity = j === i ? '0.25' : '0';
      });
      openModal(areas[i]);
    }

    areas.forEach(function (area, i) {
      var path = ns('path');
      path.setAttribute('d', segmentPath(i));
      path.setAttribute('fill', colors[i]);
      path.style.fillOpacity = '0';
      path.style.transition = 'fill-opacity 0.2s ease';
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', area.name);
      path.style.cursor = 'pointer';
      path.addEventListener('click', function () { activate(i); });
      path.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
      });
      svg.appendChild(path);
      segments.push(path);
    });

    // Block clicks on the white center circle
    var circ = ns('circle');
    circ.setAttribute('cx', cx);
    circ.setAttribute('cy', cy);
    circ.setAttribute('r', innerR);
    circ.setAttribute('fill', 'transparent');
    circ.style.cursor = 'default';
    svg.appendChild(circ);

    wheelEl.appendChild(svg);
  });
})();
