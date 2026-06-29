const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');

function walk(dir) {
  return fs.readdirSync(dir).flatMap(function (f) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      return (f === 'reference' || f === 'node_modules' || f === 'tools' || f === 'docs') ? [] : walk(full);
    }
    return full.endsWith('.html') ? [full] : [];
  });
}

// Extract all href values from an HTML file
function extractHrefs(src) {
  const re = /href="([^"]+)"/g;
  const hrefs = [];
  let m;
  while ((m = re.exec(src)) !== null) hrefs.push(m[1]);
  return hrefs;
}

// Resolve a link relative to the source file, return null if external/anchor/mailto
function resolveLink(href, srcFile) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('//')) return null;
  // Strip query/hash
  const clean = href.split('?')[0].split('#')[0];
  if (!clean) return null;
  let target;
  if (clean.startsWith('/')) {
    // Root-relative: resolve from site root
    target = path.join(root, clean);
  } else {
    target = path.resolve(path.dirname(srcFile), clean);
  }
  // If it ends in / or has no extension, look for index.html
  if (target.endsWith(path.sep) || !path.extname(target)) {
    target = path.join(target.replace(/[/\\]$/, ''), 'index.html');
  }
  return target;
}

const files = walk(root);
let broken = 0;
const seen = new Set();

files.forEach(function (srcFile) {
  const rel = srcFile.replace(root, '').split(path.sep).join('/').replace(/^\//, '');
  const src = fs.readFileSync(srcFile, 'utf8');
  const hrefs = extractHrefs(src);

  hrefs.forEach(function (href) {
    const target = resolveLink(href, srcFile);
    if (!target) return;
    const key = rel + ' -> ' + href;
    if (seen.has(key)) return;
    seen.add(key);

    if (!fs.existsSync(target)) {
      console.log('404  ' + rel);
      console.log('     href: ' + href);
      console.log('     resolves to: ' + target.replace(root, '').split(path.sep).join('/'));
      broken++;
    }
  });
});

console.log('\n' + (broken === 0 ? 'No broken links found.' : broken + ' broken link(s) found.'));
