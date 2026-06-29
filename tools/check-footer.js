const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');

function walk(dir) {
  return fs.readdirSync(dir).flatMap(function (f) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      return (f === 'reference' || f === 'node_modules' || f === 'tools') ? [] : walk(full);
    }
    return full.endsWith('.html') ? [full] : [];
  });
}

const files = walk(root);
let allPass = true;

files.forEach(function (fp) {
  const rel = fp.replace(root, '').split(path.sep).join('/').replace(/^\//, '');
  const src = fs.readFileSync(fp, 'utf8');

  if (!src.includes('class="footer"')) return;

  // Extract only the footer block to avoid false positives from page content
  const footerStart = src.indexOf('<footer class="footer"');
  const footerBlock = footerStart !== -1 ? src.slice(footerStart) : '';

  const hasLinkedIn  = footerBlock.includes('footer__social-icon') && footerBlock.includes('linkedin.com');
  const hasXInFooter = footerBlock.includes('footer__social-icon') && footerBlock.includes('x.com');
  const hasDropdown  = footerBlock.includes('footer__dropdown');
  const hasSublinks  = footerBlock.includes('footer__sublinks');

  const issues = [];
  if (!hasLinkedIn)  issues.push('missing LinkedIn icon in footer');
  if (hasXInFooter)  issues.push('X/Twitter icon still in footer');
  if (!hasDropdown)  issues.push('missing footer__dropdown class on Services li');
  if (!hasSublinks)  issues.push('missing footer__sublinks');

  if (issues.length) {
    console.log('FAIL  ' + rel);
    issues.forEach(function (i) { console.log('       - ' + i); });
    allPass = false;
  } else {
    console.log('PASS  ' + rel);
  }
});

console.log(allPass ? '\nAll HTML files pass.' : '\nIssues found — see above.');
