// Contact page interactions

(function () {
  // Smooth scroll from hero CTA to the Calendly section
  var scrollBtn = document.getElementById('scroll-to-calendar');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('schedule');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Pre-fill mailto subject with referral source if available
  var mailtoBtn = document.getElementById('mailto-btn');
  if (mailtoBtn) {
    var ref = document.referrer ? encodeURIComponent(document.referrer) : '';
    if (ref) {
      mailtoBtn.href = 'mailto:stacey@gptechadvisors.com?subject=Inquiry%20from%20gptechadvisors.com&body=Hi%20Stacey%2C%0A%0AI%20found%20you%20via%20' + ref + '%20and%20would%20love%20to%20connect.%0A%0A';
    }
  }
})();
