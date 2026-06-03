(function () {
  // Areas matching live site — names, abbreviations, and descriptions
  var areas = [
    {
      name: 'Leadership, Scope, & Governance (LSG)',
      lines: ['Leadership, Scope,', '& Governance', '(LSG)'],
      desc: 'Establish security culture and direction, align security objectives with strategic goals, define the scope of the program, ensure competent resource allocation, assign relevant roles, and conduct executive reporting and management reviews.'
    },
    {
      name: 'Policy & Documentation Governance (PDG)',
      lines: ['Policy &', 'Documentation', 'Governance', '(PDG)'],
      desc: 'Develop and govern the cybersecurity program documentation including policy governance frameworks, documentation standards, and the full suite of policies, standards, procedures, and frameworks.'
    },
    {
      name: 'Risk & Compliance Framework (RCF)',
      lines: ['Risk & Compliance', 'Framework', '(RCF)'],
      desc: 'Conduct risk assessments and business impact analyses, manage legal and regulatory compliance, address client contractual requirements, data privacy obligations, and maintain a risk register with treatment and mitigation controls.'
    },
    {
      name: 'Internal Security Controls (ISC)',
      lines: ['Internal Security', 'Controls', '(ISC)'],
      desc: 'Manage asset lifecycle, identity account management and JML processes, data protection and access control, secure configuration, malware protection, audit log management, physical security, email and web security, encryption, backup and recovery, network security, vulnerability management, and application security.'
    },
    {
      name: 'Incident Management & Response (IMR)',
      lines: ['Incident', 'Management &', 'Response', '(IMR)'],
      desc: 'Establish and maintain incident response plans, detection capabilities, containment procedures, recovery processes, and post-incident review to minimize the impact of security incidents.'
    },
    {
      name: 'Communication, Training, & Awareness (CTA)',
      lines: ['Communication,', 'Training, &', 'Awareness', '(CTA)'],
      desc: 'Build a security-conscious culture through structured training programs, security awareness campaigns, and clear communication of security policies and expectations across the organization.'
    },
    {
      name: 'Availability & Continuity (AVC)',
      lines: ['Availability &', 'Continuity', '(AVC)'],
      desc: 'Ensure business continuity through planning, disaster recovery capabilities, and system availability measures to maintain critical operations during and after disruptions.'
    },
    {
      name: 'Audit & Certifications (AUD)',
      lines: ['Audit &', 'Certifications', '(AUD)'],
      desc: 'Conduct internal audits, prepare for external certifications such as SOC 2 and ISO 27001, and manage ongoing compliance validation to demonstrate the effectiveness of the security program.'
    },
    {
      name: 'Monitoring, Measuring, & Continual Improvement (MMC)',
      lines: ['Monitoring, Measuring,', 'and Continual', 'Improvement', '(MMC)'],
      desc: 'Track security metrics, monitor control effectiveness, conduct management reviews, and drive continuous improvement of the overall information security management system.'
    }
  ];

  // Colors matching live site Image #11
  var colors = [
    '#8D99AE',  // LSG  — medium gray
    '#9DBFDA',  // PDG  — steel blue
    '#D6A3A8',  // RCF  — light rose
    '#C96035',  // ISC  — orange-red
    '#3B82F6',  // IMR  — blue
    '#2356C8',  // CTA  — darker bright blue
    '#1A2744',  // AVC  — dark navy
    '#C4E83A',  // AUD  — lime yellow-green
    '#96C83B',  // MMC  — spring green
  ];

  var cx = 350, cy = 350;
  var outerR = 320, innerR = 138;
  var count = areas.length;
  var gapDeg = 1.5;

  function toRad(deg) { return deg * Math.PI / 180; }

  function segmentPath(i) {
    var slice = 360 / count;
    var startDeg = -90 + i * slice + gapDeg / 2;
    var endDeg   = -90 + (i + 1) * slice - gapDeg / 2;
    var s = toRad(startDeg), e = toRad(endDeg);
    var large = (endDeg - startDeg) > 180 ? 1 : 0;
    var x1 = cx + innerR * Math.cos(s), y1 = cy + innerR * Math.sin(s);
    var x2 = cx + outerR * Math.cos(s), y2 = cy + outerR * Math.sin(s);
    var x3 = cx + outerR * Math.cos(e), y3 = cy + outerR * Math.sin(e);
    var x4 = cx + innerR * Math.cos(e), y4 = cy + innerR * Math.sin(e);
    return ['M',x1,y1,'L',x2,y2,'A',outerR,outerR,0,large,1,x3,y3,'L',x4,y4,'A',innerR,innerR,0,large,0,x1,y1,'Z'].join(' ');
  }

  function ns(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var wheelEl = document.getElementById('isms-wheel');
    var nameEl  = document.getElementById('isms-area-name');
    var descEl  = document.getElementById('isms-area-desc');
    var legendEl = document.getElementById('isms-legend');
    if (!wheelEl) return;

    var svg = ns('svg');
    svg.setAttribute('viewBox', '0 0 700 700');
    svg.setAttribute('aria-label', 'Interactive ISMS management wheel');
    svg.setAttribute('role', 'img');
    var segments = [];

    function activate(i) {
      segments.forEach(function (p, j) {
        p.style.opacity = j === i ? '1' : '0.55';
      });
      // update legend if present
      if (legendEl) {
        Array.prototype.forEach.call(legendEl.children, function (li, j) {
          li.classList.toggle('isms-legend__item--active', j === i);
        });
      }
      if (nameEl) nameEl.textContent = areas[i].name;
      if (descEl) descEl.textContent = areas[i].desc;
    }

    // Draw segments + labels
    areas.forEach(function (area, i) {
      var path = ns('path');
      path.setAttribute('d', segmentPath(i));
      path.setAttribute('fill', colors[i]);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', area.name);
      path.style.cursor = 'pointer';
      path.style.transition = 'opacity 0.2s ease';
      path.addEventListener('click', function () { activate(i); });
      path.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
      });
      svg.appendChild(path);
      segments.push(path);

      // Text label positioned at segment midpoint, rotated tangentially
      var midDeg = -90 + (i + 0.5) * (360 / count);
      var textR = (outerR + innerR) / 2;
      var tx = cx + textR * Math.cos(toRad(midDeg));
      var ty = cy + textR * Math.sin(toRad(midDeg));

      // Rotate so text reads outward; flip lower-half segments to stay readable
      var rot = midDeg + 90;
      if (rot > 90 && rot <= 270) rot -= 180;

      var g = ns('g');
      g.setAttribute('transform', 'translate(' + tx + ',' + ty + ') rotate(' + rot + ')');
      g.style.pointerEvents = 'none';

      var lines = area.lines;
      var fontSize = 11.5;
      var lineH = 15;
      var totalH = lines.length * lineH;

      lines.forEach(function (line, li) {
        var t = ns('text');
        t.setAttribute('x', 0);
        t.setAttribute('y', li * lineH - totalH / 2 + lineH * 0.5);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'middle');
        t.setAttribute('fill', '#ffffff');
        t.setAttribute('font-size', fontSize);
        t.setAttribute('font-family', 'Onest, system-ui, sans-serif');
        t.setAttribute('font-weight', '600');
        t.textContent = line;
        g.appendChild(t);
      });

      svg.appendChild(g);
    });

    // Center white circle
    var circ = ns('circle');
    circ.setAttribute('cx', cx);
    circ.setAttribute('cy', cy);
    circ.setAttribute('r', innerR - 6);
    circ.setAttribute('fill', '#ffffff');
    svg.appendChild(circ);

    // Center label: "ISMS Program Framework"
    var centerLines = ['ISMS Program', 'Framework'];
    var cfs = 20, clh = 28;
    centerLines.forEach(function (line, li) {
      var t = ns('text');
      t.setAttribute('x', cx);
      t.setAttribute('y', cy + (li - (centerLines.length - 1) / 2) * clh);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('fill', '#080F1F');
      t.setAttribute('font-size', cfs);
      t.setAttribute('font-family', 'Rethink Sans, system-ui, sans-serif');
      t.setAttribute('font-weight', '700');
      t.setAttribute('pointer-events', 'none');
      t.textContent = line;
      svg.appendChild(t);
    });

    wheelEl.appendChild(svg);

    // Build legend if element exists
    if (legendEl) {
      areas.forEach(function (area, i) {
        var li = document.createElement('li');
        li.className = 'isms-legend__item';
        li.setAttribute('tabindex', '0');
        li.innerHTML =
          '<span class="isms-legend__num" style="background:' + colors[i] + '">' + (i + 1) + '</span>' +
          '<span class="isms-legend__name">' + area.name + '</span>';
        li.addEventListener('click', function () { activate(i); });
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        });
        legendEl.appendChild(li);
      });
    }

    activate(0);
  });
})();
