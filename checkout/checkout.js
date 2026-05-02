// ============================================================
// CONFIGURE BEFORE DEPLOY
// ------------------------------------------------------------
// STRIPE_PUBLISHABLE_KEY: Stripe Dashboard -> Developers -> API keys
//   -> Publishable key (pk_live_...). Safe to expose in frontend.
// API_BASE: leave as '' for same-origin Cloudflare Pages Functions.
//   Set to a full URL only if the create-checkout-session endpoint
//   lives on a different host.
// ============================================================
var STRIPE_PUBLISHABLE_KEY = 'pk_live_51SOOsvQJYxTJbi8R3x8OzXg5pc81WgWBqzbxFMzD12r0AuacuA8ORUJgdMwifHw1mHySgXeGAznkh2KvAwPx29xF00OL6GDYX2';
var API_BASE = '';

(function () {
    var plan = document.body.getAttribute('data-plan');
    var checkbox = document.getElementById('smsConsent');
    var consentBlock = document.getElementById('sms-consent');
    var checkoutWrap = document.getElementById('checkoutWrap');
    var loadingState = document.getElementById('checkoutLoading');
    var errorBox = document.getElementById('checkoutError');
    var errorText = document.getElementById('checkoutErrorText');
    var retryBtn = document.getElementById('errorRetry');
    var emailEl = document.getElementById('errorEmail');

    if (!plan || !checkbox || !checkoutWrap) return;

    // TCR requires opt-in checkbox unchecked by default; override
    // any browser auto-restore on back/refresh navigation.
    checkbox.checked = false;

    var stripe = (typeof Stripe === 'function' && STRIPE_PUBLISHABLE_KEY.indexOf('REPLACE') === -1)
        ? Stripe(STRIPE_PUBLISHABLE_KEY)
        : null;
    var checkout = null;
    var loaded = false;

    function syncLock() {
        if (checkbox.checked) {
            checkoutWrap.classList.add('is-unlocked');
            consentBlock.classList.remove('nudge');
        } else {
            checkoutWrap.classList.remove('is-unlocked');
        }
    }

    function showError(msg) {
        if (errorText) {
            errorText.textContent = msg;
        } else {
            errorBox.textContent = msg;
        }
        errorBox.classList.add('is-visible');
        if (loadingState) loadingState.style.display = 'none';
    }

    function clearError() {
        errorBox.classList.remove('is-visible');
    }

    function retryLoad() {
        loaded = false;
        clearError();
        if (loadingState) loadingState.style.display = '';
        loadCheckout();
    }

    function copyEmail() {
        if (!emailEl) return;
        var original = emailEl.dataset.original || emailEl.textContent;
        emailEl.dataset.original = original;
        var addr = 'roadtestnotifications@gmail.com';
        function done(text) {
            emailEl.textContent = text;
            setTimeout(function () { emailEl.textContent = original; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(addr).then(function () { done('Copied!'); })
                .catch(function () { done('Copy failed'); });
        } else {
            done('Copy unavailable');
        }
    }

    async function loadCheckout() {
        if (loaded) return;
        loaded = true;

        if (!stripe) {
            showError('Payment is not configured yet.');
            return;
        }

        try {
            var resp = await fetch(API_BASE + '/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: plan })
            });

            if (!resp.ok) {
                var text = await resp.text();
                throw new Error('Server returned ' + resp.status + (text ? ': ' + text.slice(0, 200) : ''));
            }

            var data = await resp.json();
            if (!data.client_secret) throw new Error('Missing client_secret in response');

            checkout = await stripe.initEmbeddedCheckout({ clientSecret: data.client_secret });
            if (loadingState) loadingState.style.display = 'none';
            checkout.mount('#checkout');
        } catch (err) {
            showError('Could not load the payment form. ' + (err && err.message ? err.message : err));
        }
    }

    syncLock();
    checkbox.addEventListener('change', syncLock);

    if (retryBtn) retryBtn.addEventListener('click', retryLoad);
    if (emailEl) {
        emailEl.addEventListener('click', copyEmail);
        emailEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyEmail();
            }
        });
    }

    // If the user clicks anywhere over the locked iframe area, nudge the
    // consent block so they understand why the form is greyed out.
    checkoutWrap.addEventListener('click', function () {
        if (!checkbox.checked) {
            consentBlock.classList.remove('nudge');
            void consentBlock.offsetWidth;
            consentBlock.classList.add('nudge');
            consentBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () { checkbox.focus(); }, 350);
        }
    }, true);

    // Auto-load on page load so the user immediately sees the payment
    // form (greyed out behind the overlay until they consent).
    loadCheckout();
})();
