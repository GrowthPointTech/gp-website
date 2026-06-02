(function () {
  var areas = [
    { name: 'Governance & Policies',   desc: 'Establish security policies, standards, and executive oversight across the organization.' },
    { name: 'Risk Management',         desc: 'Identify, assess, and treat information security risks to acceptable levels.' },
    { name: 'Asset Management',        desc: 'Inventory and classify information assets to ensure they receive appropriate protection.' },
    { name: 'Access Control',          desc: 'Limit access to information and systems to authorized users and processes only.' },
    { name: 'Incident Response',       desc: 'Detect, contain, and recover from security incidents quickly and effectively.' },
    { name: 'Business Continuity',     desc: 'Maintain operations and recover critical systems during and after disruptions.' },
    { name: 'Compliance & Audit',      desc: 'Meet legal, regulatory, and contractual obligations through ongoing audit and review.' },
    { name: 'Vendor Management',       desc: 'Assess and manage the security risks introduced by third-party suppliers and partners.' },
    { name: 'Security Awareness',      desc: 'Build a security-conscious culture through training, communication, and accountability.' }
  ];

  var colors = [
    '#0C50D5', '#1758DD', '#2261E5', '#2D6AED', '#3F8CFF',
    '#A4E322', '#93CC1B', '#82B615', '#71A00E'
  ];

  var cx = 200, cy = 200, outerR = 160, innerR = 70;
  var count = areas.length;
  var gapDeg = 2;

  function toRad(deg) { return deg * Math.PI / 180; }

  function segmentPath(i) {
    var slice = 360 / count;
    var startDeg = -90 + i * slice + gapDeg / 2;
    var endDeg   = -90 + (i + 1) * slice - gapDeg / 2;
    var s = toRad(startDeg);
    var e = toRad(endDeg);
    var large = (endDeg - startDeg) > 180 ? 1 : 0;
    var x1 = cx + innerR * Math.cos(s), y1 = cy + innerR * Math.sin(s);
    var x2 = cx + outerR * Math.cos(s), y2 = cy + outerR * Math.sin(s);
    var x3 = cx + outerR * Math.cos(e), y3 = cy + outerR * Math.sin(e);
    var x4 = cx + innerR * Math.cos(e), y4 = cy + innerR * Math.sin(e);
    return [
      'M', x1, y1,
      'L', x2, y2,
      'A', outerR, outerR, 0, large, 1, x3, y3,
      'L', x4, y4,
      'A', innerR, innerR, 0, large, 0, x1, y1,
      'Z'
    ].join(' ');
  }

  function labelPos(i) {
    var midDeg = -90 + (i + 0.5) * (360 / count);
    var r = (outerR + innerR) / 2;
    return {
      x: cx + r * Math.cos(toRad(midDeg)),
      y: cy + r * Math.sin(toRad(midDeg))
    };
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
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('aria-label', 'Interactive ISMS management wheel');
    svg.setAttribute('role', 'img');

    var segments = [];

    function activate(i) {
      segments.forEach(function (p, j) {
        p.style.opacity   = j === i ? '1'    : '0.45';
        p.style.transform = j === i ? 'scale(1.04)' : 'scale(1)';
      });
      if (legendEl) {
        Array.prototype.forEach.call(legendEl.children, function (li, j) {
          li.classList.toggle('isms-legend__item--active', j === i);
        });
      }
      nameEl.textContent = areas[i].name;
      descEl.textContent = areas[i].desc;
    }

    areas.forEach(function (area, i) {
      var path = ns('path');
      path.setAttribute('d', segmentPath(i));
      path.setAttribute('fill', colors[i]);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', area.name);
      path.style.cursor = 'pointer';
      path.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      path.style.transformOrigin = '200px 200px';

      path.addEventListener('click',   function () { activate(i); });
      path.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
      });

      svg.appendChild(path);
      segments.push(path);

      var pos  = labelPos(i);
      var text = ns('text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '13');
      text.setAttribute('font-weight', '700');
      text.setAttribute('pointer-events', 'none');
      text.textContent = i + 1;
      svg.appendChild(text);
    });

    // Centre label
    var centre = ns('text');
    centre.setAttribute('x', cx);
    centre.setAttribute('y', cy);
    centre.setAttribute('text-anchor', 'middle');
    centre.setAttribute('dominant-baseline', 'middle');
    centre.setAttribute('fill', '#080F1F');
    centre.setAttribute('font-size', '13');
    centre.setAttribute('font-weight', '700');
    centre.setAttribute('letter-spacing', '1');
    centre.setAttribute('pointer-events', 'none');
    centre.textContent = 'ISMS';
    svg.appendChild(centre);

    wheelEl.appendChild(svg);

    // Build legend
    if (legendEl) {
      areas.forEach(function (area, i) {
        var li = document.createElement('li');
        li.className = 'isms-legend__item';
        li.setAttribute('tabindex', '0');
        li.innerHTML =
          '<span class="isms-legend__num" style="background:' + colors[i] + '">' + (i + 1) + '</span>' +
          '<span class="isms-legend__name">' + area.name + '</span>';
        li.addEventListener('click',   function () { activate(i); });
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        });
        legendEl.appendChild(li);
      });
    }

    activate(0);
  });
})();
