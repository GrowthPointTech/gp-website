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

  // Hotspot positions copied from production site (gptechadvisors.com/services/)
  // Measured via Puppeteer: computed top/left as % of the image container
  // The container and PNG share the same 1329:1080 aspect ratio, so % values apply directly.
  var hotspots = [
    { top: '21%', left: '51%' }, // LSG
    { top: '27%', left: '68%' }, // PDG
    { top: '45%', left: '77%' }, // RCF
    { top: '65%', left: '78%' }, // ISC
    { top: '83%', left: '64%' }, // IMR
    { top: '87%', left: '46%' }, // CTA
    { top: '72%', left: '30%' }, // AVC
    { top: '52%', left: '21%' }, // AUD
    { top: '31%', left: '30%' }, // MMC
  ];

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
  }

  // ── Wheel ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    var wheelEl = document.getElementById('isms-wheel');
    if (!wheelEl) return;

    areas.forEach(function (area, i) {
      var btn = document.createElement('button');
      btn.className = 'isms-hotspot';
      btn.setAttribute('aria-label', area.name);
      btn.style.top = hotspots[i].top;
      btn.style.left = hotspots[i].left;
      btn.addEventListener('click', function () { openModal(area); });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(area); }
      });
      wheelEl.appendChild(btn);
    });
  });
})();
