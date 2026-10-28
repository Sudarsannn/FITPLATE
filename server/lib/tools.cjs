// Helpers for the local FitPlate server (server/fitplate-server.mjs).
// CommonJS so Jest can test them.

/** Tools FitPlate may call, per Swiggy MCP server (priority plan section 9). Anything else is refused. */
const ALLOWED = {
  im: [
    'search_products', 'your_go_to_items', 'update_cart', 'get_cart', 'clear_cart', 'list_coupons', 'apply_coupon',
    'get_payment_options', 'checkout', 'check_payment_status', 'confirm_order', 'track_order', 'get_delivery_status',
    'get_orders', 'get_order_details', 'get_addresses', 'create_address', 'delete_address', 'recommend_address', 'report_error',
  ],
  food: [
    'search_menu', 'search_restaurants', 'get_restaurant_menu', 'update_food_cart', 'get_food_cart', 'flush_food_cart',
    'fetch_food_coupons', 'apply_food_coupon', 'get_payment_options', 'place_food_order', 'check_payment_status', 'confirm_order',
    'track_food_order', 'get_food_delivery_status', 'get_food_orders', 'get_food_order_details', 'get_addresses', 'create_address',
    'delete_address', 'recommend_address', 'report_error',
  ],
};

/** Tools that place or complete a REAL order: refused unless the server runs with CHECKOUT_LIVE=true. */
const ORDER_TOOLS = new Set(['checkout', 'place_food_order', 'confirm_order']);

// FitPlate's argument names → other spellings a tool's input schema may use.
const SYNONYMS = {
  query: ['query', 'q', 'searchquery', 'search', 'searchterm', 'keyword', 'text', 'dishname', 'productname'],
  addressId: ['addressid', 'address', 'deliveryaddressid', 'addrid', 'locationid'],
  items: ['items', 'cartitems', 'products', 'lines', 'skus'],
  couponCode: ['couponcode', 'coupon', 'code', 'promocode'],
  paymentMethod: ['paymentmethod', 'paymentmode', 'method', 'paymenttype', 'paymentoption', 'paymentmethodid'],
  orderId: ['orderid', 'id', 'order'],
  restaurantId: ['restaurantid', 'restaurant', 'resid', 'storeid'],
  vegFilter: ['vegfilter', 'veg', 'vegonly', 'isveg', 'veg_only'],
  address: ['address', 'addresstext', 'text', 'query', 'fulladdress'],
};

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Rename FitPlate's canonical arguments to the names this tool's input schema
 * uses (read from tools/list), and drop arguments it doesn't take. Without a
 * schema the arguments pass through unchanged. Returns the arguments and the
 * required properties still missing.
 */
function adaptArgs(args, schema) {
  const props = schema && schema.properties ? Object.keys(schema.properties) : null;
  if (!props) return { args: { ...args }, missing: [] };
  const byNorm = new Map(props.map((p) => [norm(p), p]));
  const out = {};
  for (const [key, value] of Object.entries(args || {})) {
    if (value === undefined) continue;
    if (props.includes(key)) {
      out[key] = value;
      continue;
    }
    const options = SYNONYMS[key] || [norm(key)];
    const hit = options.map((o) => byNorm.get(norm(o))).find((p) => p && !(p in out));
    if (hit) out[hit] = value;
  }
  const required = Array.isArray(schema.required) ? schema.required : [];
  return { args: out, missing: required.filter((r) => !(r in out)) };
}

/** A tool result (MCP CallToolResult) as plain data: structured content, else JSON text, else the text. */
function parseToolResult(result) {
  if (!result) return null;
  if (result.structuredContent !== undefined) return result.structuredContent;
  const texts = (result.content || []).filter((c) => c && c.type === 'text').map((c) => c.text);
  if (texts.length === 0) return null;
  const joined = texts.join('\n');
  try {
    return JSON.parse(joined);
  } catch {
    if (texts.length > 1) {
      try {
        return texts.map((t) => JSON.parse(t));
      } catch {
        // not JSON
      }
    }
    return { text: joined };
  }
}

/** Map an error from the MCP client to the app's codes, without echoing bodies. */
function errorCode(err) {
  const msg = String((err && err.message) || err || '');
  const status = err && (err.code || err.status);
  if (status === 401 || /401|unauthori[sz]ed|invalid[_ ]token/i.test(msg)) return 'AUTH';
  if (status === 429 || /429|rate.?limit|too many/i.test(msg)) return 'RATE_LIMIT';
  if ((typeof status === 'number' && status >= 500) || /\b5\d\d\b/.test(msg)) return 'SERVER';
  return 'OTHER';
}

/** Only send the browser back to FitPlate itself (localhost, 127.0.0.1 or the app's own scheme). */
function safeReturnUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'fitplate:' || u.protocol === 'exp+fitplate:') return u.toString();
    if ((u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return u.toString();
  } catch {
    // invalid
  }
  return null;
}

/**
 * Hosted login: Swiggy sends the browser to http://localhost/callback?code=..., which cannot load
 * on another device, so the person pastes the address bar text (or just the code) back instead.
 */
function parsePastedLogin(input) {
  const text = String(input ?? '').trim();
  if (!text) return null;
  try {
    const u = new URL(text);
    const code = u.searchParams.get('code');
    return code ? { code, state: u.searchParams.get('state') ?? '' } : null;
  } catch {
    // not a URL: fall through to a bare code
  }
  const m = text.match(/[?&]code=([^&\s]+)/);
  if (m) return { code: decodeURIComponent(m[1]), state: (text.match(/[?&]state=([^&\s]+)/) || [])[1] ?? '' };
  return /^[\w.~-]{8,}$/.test(text) ? { code: text, state: '' } : null;
}

/** Constant-time check of the shared access key a hosted server requires. */
function keyMatches(provided, expected) {
  const a = Buffer.from(String(provided ?? ''));
  const b = Buffer.from(String(expected ?? ''));
  return b.length > 0 && a.length === b.length && require('node:crypto').timingSafeEqual(a, b);
}

/** Browser origins allowed to call a hosted server: localhost always, plus the comma-separated list given. */
function originAllowed(origin, list) {
  if (safeReturnUrl(origin)) return true;
  return String(list ?? '').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean).includes(String(origin).replace(/\/$/, ''));
}

module.exports = { ALLOWED, ORDER_TOOLS, adaptArgs, parseToolResult, errorCode, safeReturnUrl, parsePastedLogin, keyMatches, originAllowed };
