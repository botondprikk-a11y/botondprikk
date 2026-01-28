(function(){
  // ====== Mini "tests" (dev sanity checks) ======
  function assert(cond, msg){
    if(!cond) console.warn("Test failed: " + msg);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Hide the JS error badge if we got this far.
    const jsStatus = document.getElementById('jsStatus');
    if (jsStatus) jsStatus.style.display = 'none';

    // Basic DOM tests
    assert(!!document.getElementById('year'), '#year element exists');
    assert(!!document.getElementById('leadForm'), '#leadForm exists');
    assert(!!document.getElementById('successBox'), '#successBox exists');
    assert(!!document.getElementById('errorBox'), '#errorBox exists');
    assert(document.querySelectorAll('a[href^="#"]').length >= 3, 'has anchor links');

    // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Anchor scrolling (previewben néha blokkolja a hash-navigációt)
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try { history.pushState(null, '', href); } catch (_) {}
      });
    });

    // Form handling
    // Megjegyzés: Vercel-en a Netlify Forms nem működik. Ha azt szeretnéd, hogy a jelentkezésből
    // automatikusan email érkezzen neked, a legegyszerűbb egy "form backend" szolgáltató (pl. Formspree).

    // Success message from redirect (?success=1)
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const successBox = document.getElementById('successBox');
    const errorBox = document.getElementById('errorBox');
    const form = document.getElementById('leadForm');

    if (success === '1' && successBox) {
      successBox.style.display = 'block';
      successBox.textContent = 'Köszi! Megkaptam a jelentkezésed — hamarosan visszajelzek.';
      // Optional: clear query param so refresh doesn't keep showing it
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.toString());
      } catch (_) {}
    }

    function isValidEmail(v){
      const s = String(v || '').trim();
      const at = s.indexOf('@');
      if (at < 1) return false;
      const dot = s.lastIndexOf('.');
      return dot > at + 1 && dot < s.length - 1;
    }
    function clean(v){ return String(v || '').trim(); }

    // Minimal client-side validation (nice UX). Formspree will still receive POST.
    // NOTE: A ChatGPT preview / sandbox gyakran iframe-ben fut és biztonsági okból blokkolja a form POST-ot.
    // Ilyenkor ne is próbáljunk hálózati kérést indítani — csak mutassunk demo üzenetet.

    const host = (window.location.hostname || '').toLowerCase();
    const proto = (window.location.protocol || '').toLowerCase();
    const isChatGptPreview = host.includes('chat.openai.com') || host.includes('chatgpt.com') || host.includes('openai.com');
    const isLocalOrFile = proto === 'file:' || host === '';
    let isInIframe = false;
    try { isInIframe = window.self !== window.top; } catch (_) { isInIframe = true; }
    const isPreviewSandbox = isChatGptPreview || isLocalOrFile || isInIframe;

    if (form) {
      form.noValidate = true;

      const redirectInput = form.querySelector('input[name="_redirect"]');
      if (redirectInput && !redirectInput.value) {
        if (proto === 'http:' || proto === 'https:') {
          const base = window.location.origin + window.location.pathname;
          redirectInput.value = `${base}?success=1#jelentkezes`;
        }
      }

      const subjectInput = form.querySelector('input[name="_subject"]');
      if (subjectInput && subjectInput.value === 'Új edzés jelentkezés' && host) {
        subjectInput.value = `Új edzés jelentkezés (${host})`;
      }

      // In preview sandbox, prevent any accidental POST attempts that can "freeze" the iframe.
      if (isPreviewSandbox) {
        form.setAttribute('action', '#');
      }

      form.addEventListener('submit', (e) => {
        if (!errorBox) return;
        errorBox.style.display = 'none';

        const name = clean(form.name.value);
        const email = clean(form.email.value);
        const phone = clean(form.phone.value);

        if (!name || !phone || !isValidEmail(email)) {
          e.preventDefault();
          errorBox.style.display = 'block';
          try { errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
          return;
        }

        // Preview / sandbox: no network. Show demo success instead.
        if (isPreviewSandbox) {
          e.preventDefault();
          if (successBox) {
            successBox.style.display = 'block';
            successBox.textContent = 'Köszi! (Demo) A preview környezetben nem küldünk ténylegesen. Éles oldalon (Vercel) a Formspree fogja elküldeni a jelentkezést, és én megkapom emailben.';
          }
          try { form.reset(); } catch (_) {}
          return;
        }

        // ÉLESBEN: hagyjuk lefutni a natív POST-ot Formspree felé.
        // (A siker üzenetet a redirect paraméter kezeli: ?success=1)
      });
    }

    // Extra test: email validator should accept a valid email
    assert(isValidEmail('test@example.com') === true, 'email validator accepts test@example.com');
    assert(isValidEmail('bad@@example') === false, 'email validator rejects bad@@example');
  });
})();
