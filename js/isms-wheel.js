(function () {
  // Areas matching live site with display lines pre-wrapped
  var areas = [
    {
      name: 'Leadership, Scope, & Governance (LSG)',
      lines: ['Leadership, Scope,', '& Governance', '(LSG)'],
      textDark: true,
      desc: 'Establish security culture and direction, align security objectives with strategic goals, define the scope of the program, ensure competent resource allocation, assign relevant roles, and conduct executive reporting and management reviews.'
    },
    {
      name: 'Policy & Documentation Governance (PDG)',
      lines: ['Policy &', 'Documentation', 'Governance', '(PDG)'],
      textDark: true,
      desc: 'Develop and govern the cybersecurity program documentation including policy governance frameworks, documentation standards, and the full suite of policies, standards, procedures, and frameworks.'
    },
    {
      name: 'Risk & Compliance Framework (RCF)',
      lines: ['Risk & Compliance', 'Framework', '(RCF)'],
      textDark: true,
      desc: 'Conduct risk assessments and business impact analyses, manage legal and regulatory compliance, address client contractual requirements, data privacy obligations, and maintain a risk register with treatment and mitigation controls.'
    },
    {
      name: 'Internal Security Controls (ISC)',
      lines: ['Internal Security', 'Controls', '(ISC)'],
      textDark: false,
      desc: 'Manage asset lifecycle, identity and access, data protection, secure configuration, malware protection, audit logs, network security, vulnerability management, and application security.'
    },
    {
      name: 'Incident Management & Response (IMR)',
      lines: ['Incident', 'Management &', 'Response', '(IMR)'],
      textDark: false,
      desc: 'Establish incident response plans, detection capabilities, containment procedures, and post-incident review processes to minimize the impact of security incidents.'
    },
    {
      name: 'Communication, Training, & Awareness (CTA)',
      lines: ['Communication,', 'Training, &', 'Awareness', '(CTA)'],
      textDark: false,
      desc: 'Build a security-conscious culture through structured training programs, security awareness campaigns, and clear communication of security policies across the organization.'
    },
    {
      name: 'Availability & Continuity (AVC)',
      lines: ['Availability &', 'Continuity', '(AVC)'],
      textDark: false,
      desc: 'Ensure business continuity through planning, disaster recovery capabilities, and system availability measures to maintain critical operations during and after disruptions.'
    },
    {
      name: 'Audit & Certifications (AUD)',
      lines: ['Audit &', 'Certifications', '(AUD)'],
      textDark: true,
      desc: 'Conduct internal audits, prepare for external certifications such as SOC 2 and ISO 27001, and manage ongoing compliance validation to demonstrate the effectiveness of the security program.'
    },
    {
      name: 'Monitoring, Measuring, & Continual Improvement (MMC)',
      lines: ['Monitoring, Measuring,', 'and Continual', 'Improvement', '(MMC)'],
      textDark: true,
      desc: 'Track security metrics, monitor control effectiveness, conduct management reviews, and drive continuous improvement of the overall information security management system.'
    }
  ];

  // Colors extracted from live site Image #13
  var colors = [
    '#8D9BAE',  // LSG  — medium gray
    '#7AADD4',  // PDG  — steel blue
    '#D4A8B0',  // RCF  — muted rose/pink
    '#D45A20',  // ISC  — orange-red
    '#2A70C8',  // IMR  — medium blue
    '#2858C8',  // CTA  — darker bright blue
    '#0D1A28',  // AVC  — very dark navy
    '#BCCC2E',  // AUD  — yellow-green/lime
    '#88BC38',  // MMC  — bright spring green
  ];

  // Variable outer radii to create the staggered petal effect (Image #13)
  var outerRadii = [
    258,  // LSG  — smaller
    308,  // PDG  — medium-large
    296,  // RCF  — medium
    336,  // ISC  — large
    330,  // IMR  — large
    268,  // CTA  — medium-small
    256,  // AVC  — smaller
    312,  // AUD  — medium-large
    348,  // MMC  — largest
  ];

  var cx = 350, cy = 350;
  var innerR = 132;
  var count = areas.length;
  var gapDeg = 1.5;

  function toRad(deg) { return deg * Math.PI / 180; }

  function segmentPath(i) {
    var oR = outerRadii[i];
    var slice = 360 / count;
    var startDeg = -90 + i * slice + gapDeg / 2;
    var endDeg   = -90 + (i + 1) * slice - gapDeg / 2;
    var s = toRad(startDeg), e = toRad(endDeg);
    var large = (endDeg - startDeg) > 180 ? 1 : 0;
    var x1 = cx + innerR * Math.cos(s), y1 = cy + innerR * Math.sin(s);
    var x2 = cx + oR    * Math.cos(s), y2 = cy + oR    * Math.sin(s);
    var x3 = cx + oR    * Math.cos(e), y3 = cy + oR    * Math.sin(e);
    var x4 = cx + innerR * Math.cos(e), y4 = cy + innerR * Math.sin(e);
    return ['M',x1,y1,'L',x2,y2,'A',oR,oR,0,large,1,x3,y3,'L',x4,y4,'A',innerR,innerR,0,large,0,x1,y1,'Z'].join(' ');
  }

  function ns(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var wheelEl  = document.getElementById('isms-wheel');
    var nameEl   = document.getElementById('isms-area-name');
    var descEl   = document.getElementById('isms-area-desc');
    var legendEl = document.getElementById('isms-legend');
    if (!wheelEl) return;

    var svg = ns('svg');
    svg.setAttribute('viewBox', '0 0 700 700');
    svg.setAttribute('aria-label', 'Interactive ISMS management wheel');
    svg.setAttribute('role', 'img');
    var segments = [];

    function activate(i) {
      segments.forEach(function (p, j) {
        p.style.opacity = j === i ? '1' : '0.62';
      });
      if (legendEl) {
        Array.prototype.forEach.call(legendEl.children, function (li, j) {
          li.classList.toggle('isms-legend__item--active', j === i);
        });
      }
      if (nameEl) nameEl.textContent = areas[i].name;
      if (descEl) descEl.textContent = areas[i].desc;
    }

    areas.forEach(function (area, i) {
      // Segment path
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

      // Text label — positioned at segment radial midpoint, rotated tangentially
      var midDeg = -90 + (i + 0.5) * (360 / count);
      var oR = outerRadii[i];
      var textR = innerR + (oR - innerR) * 0.52;
      var tx = cx + textR * Math.cos(toRad(midDeg));
      var ty = cy + textR * Math.sin(toRad(midDeg));

      // Rotation: perpendicular to radius, flipped if in lower half to stay readable
      var rot = midDeg + 90;
      if (rot > 90 && rot <= 270) rot -= 180;

      var g = ns('g');
      g.setAttribute('transform', 'translate(' + tx + ',' + ty + ') rotate(' + rot + ')');
      g.style.pointerEvents = 'none';

      var fill = area.textDark ? '#1A1A2E' : '#ffffff';
      var lines = area.lines;
      var fontSize = 11;
      var lineH = 14.5;
      var totalH = lines.length * lineH;

      lines.forEach(function (line, li) {
        var t = ns('text');
        t.setAttribute('x', 0);
        t.setAttribute('y', li * lineH - totalH / 2 + lineH * 0.5);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'middle');
        t.setAttribute('fill', fill);
        t.setAttribute('font-size', fontSize);
        t.setAttribute('font-family', 'Onest, system-ui, sans-serif');
        t.setAttribute('font-weight', '700');
        t.textContent = line;
        g.appendChild(t);
      });

      svg.appendChild(g);
    });

    // Center white circle
    var circ = ns('circle');
    circ.setAttribute('cx', cx);
    circ.setAttribute('cy', cy);
    circ.setAttribute('r', innerR - 5);
    circ.setAttribute('fill', '#ffffff');
    svg.appendChild(circ);

    // Center label: "ISMS Program Framework"
    var centerLines = ['ISMS Program', 'Framework'];
    var cfs = 22, clh = 30;
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

    // Build legend if present
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
