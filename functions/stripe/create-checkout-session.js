// Cloudflare Pages Function — POST /stripe/create-checkout-session
//
// Creates a Stripe Embedded Checkout Session and returns its client_secret
// to the browser, which mounts the iframe via stripe.initEmbeddedCheckout.
//
// custom_fields schema MUST stay 1:1 with the legacy Payment Links so that
// the existing Flask webhook (/stripe/webhook -> handle_checkout_completed)
// parses sessions identically. Field key MUST be "testtypeandlocation".
//
// Required environment variables (Cloudflare Pages -> Settings -> Env vars):
//   STRIPE_API_KEY        sk_live_...
//   STRIPE_PRICE_10DAY    price_...   (10-Day Plan one-time price)
//   STRIPE_PRICE_MONTHLY  price_...   (Monthly subscription recurring price)
//   FRONTEND_ORIGIN       https://www.roadtestnotify.ca   (optional; default below)

const PLAN_CONFIG = {
    '10day': {
        priceEnv: 'STRIPE_PRICE_10DAY',
        mode: 'payment',
        returnPath: '/success/10day/',
    },
    'monthly': {
        priceEnv: 'STRIPE_PRICE_MONTHLY',
        mode: 'subscription',
        returnPath: '/success/monthly/',
    },
};

const CUSTOM_FIELDS = [
    {
        key: 'testtypeandlocation',
        label: { type: 'custom', custom: 'Road Test type' },
        type: 'dropdown',
        dropdown: {
            default_value: 'G2',
            options: [
                { label: 'G',  value: 'G' },
                { label: 'G2', value: 'G2' },
            ],
        },
    },
    {
        key: 'location',
        label: { type: 'custom', custom: 'Location' },
        type: 'text',
        text: { default_value: 'Toronto Port Union', maximum_length: 25 },
    },
];

// Recursively flatten a JS object into Stripe's URL-encoded form notation,
// e.g. { line_items: [{ price: 'p', quantity: 1 }] } becomes
// "line_items[0][price]=p&line_items[0][quantity]=1".
function toStripeForm(obj) {
    const params = new URLSearchParams();
    function add(key, value) {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((v, i) => add(`${key}[${i}]`, v));
        } else if (typeof value === 'object') {
            for (const k of Object.keys(value)) add(`${key}[${k}]`, value[k]);
        } else {
            params.append(key, String(value));
        }
    }
    for (const k of Object.keys(obj)) add(k, obj[k]);
    return params;
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost({ request, env }) {
    if (!env.STRIPE_API_KEY) {
        return jsonResponse({ error: 'Server is missing STRIPE_API_KEY' }, 500);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const plan = String(body.plan || '').trim();
    const cfg = PLAN_CONFIG[plan];
    if (!cfg) return jsonResponse({ error: 'Unknown plan' }, 400);

    const priceId = env[cfg.priceEnv];
    if (!priceId) return jsonResponse({ error: `Server is missing ${cfg.priceEnv}` }, 500);

    const frontendOrigin = env.FRONTEND_ORIGIN || 'https://www.roadtestnotify.ca';
    const returnUrl = `${frontendOrigin}${cfg.returnPath}?session_id={CHECKOUT_SESSION_ID}`;

    const payload = {
        ui_mode: 'embedded',
        mode: cfg.mode,
        line_items: [{ price: priceId, quantity: 1 }],
        phone_number_collection: { enabled: true },
        custom_fields: CUSTOM_FIELDS,
        consent_collection: { terms_of_service: 'required' },
        metadata: { plan },
        return_url: returnUrl,
    };

    const formBody = toStripeForm(payload).toString();

    let stripeResp;
    try {
        stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.STRIPE_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody,
        });
    } catch (err) {
        return jsonResponse({ error: `Network error reaching Stripe: ${err.message || err}` }, 502);
    }

    const session = await stripeResp.json().catch(() => null);

    if (!stripeResp.ok || !session) {
        const stripeErr = session && session.error ? session.error.message || JSON.stringify(session.error) : `HTTP ${stripeResp.status}`;
        return jsonResponse({ error: `Stripe API error: ${stripeErr}` }, 502);
    }

    return jsonResponse({ client_secret: session.client_secret });
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            Allow: 'POST, OPTIONS',
        },
    });
}
