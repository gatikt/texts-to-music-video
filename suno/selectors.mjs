// Every Suno URL, UI locator and response pattern the CLI relies on lives here.
// Suno changes its web UI often. When a step breaks, run with --headed --verbose,
// look at the element in Chrome DevTools (Accessibility pane shows the
// accessible name), and update the matching entry below. Nothing else in
// suno.mjs should hard-code a selector.
//
// Locators prefer accessible roles and names (what a screen reader announces)
// over CSS classes, because Suno's class names are generated and change on
// every deploy.

export const URLS = {
  home: 'https://suno.com',
  // T2MV_SUNO_CREATE_URL exists only for the offline test (suno/test/run-tests.mjs),
  // which points it at a local mock page. Leave it unset for real use.
  create: process.env.T2MV_SUNO_CREATE_URL || 'https://suno.com/create',
  // Song page for a clip id. Share links look like https://suno.com/s/<code>
  // and answer with a 307 whose Location is /song/<uuid>?sh=<code>.
  song: (id) => `https://suno.com/song/${id}`,
  // Public CDN files. The mp3 shows up when a clip is finished (it can stay
  // 403 for clips whose owner disabled downloads). The mp4 "share video"
  // appears a few minutes after a song is shared and returns 403 until then.
  cdnMp3: (id) => `https://cdn1.suno.ai/${id}.mp3`,
  cdnMp4: (id) => `https://cdn1.suno.ai/${id}.mp4`,
};

// Logged-out visits to /create redirect here (e.g. /sign-in?redirect_url=%2Fcreate).
export const SIGN_IN_PATH = /^\/(sign-in|sign-up|login)\b/;

// Network responses. Clicking "Create song" POSTs to a URL containing
// "/generate" (studio-api.prod.suno.com/api/generate/v2...). The JSON body has
// { clips: [{ id, title, status, audio_url, ... }] }. The page then polls a
// feed endpoint (URL contains "/feed" or "/clips") whose JSON also carries
// clips with status "submitted" | "queued" | "streaming" | "complete" | "error".
export const NET = {
  generate: /\/generate/i,
  clipFeed: /\/(feed|clips?|clip)\b/i,
  doneStatus: new Set(['complete']),
  errorStatus: new Set(['error', 'failed']),
};

// Hard limits checked before touching the browser. Suno's custom-mode lyrics
// box holds 5000 characters. The style box limit depends on the model
// (1000 on the v4.5+ models, 200 on older ones); override with --style-max.
export const LIMITS = { lyrics: 5000, style: 1000, title: 100 };

// UUID used for clip / song ids.
export const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// ---- page locators (each takes a Playwright Page) -------------------------

export const ui = {
  // Top-level mode switch on /create: "Songs" (vs. Sounds / other modes).
  songsTab: (page) =>
    page.getByRole('tab', { name: 'Songs', exact: true })
      .or(page.getByRole('button', { name: 'Songs', exact: true })),

  // Custom-mode switch: "Advanced" (vs. "Simple"). Older UIs called it "Custom".
  advancedTab: (page) =>
    page.getByRole('tab', { name: /^(Advanced|Custom)$/ })
      .or(page.getByRole('button', { name: /^(Advanced|Custom)$/ })),

  // Lyrics box. Accessible name "Lyrics editor"; may be a <textarea> or a
  // contenteditable rich-text editor, so we only rely on role + name.
  lyrics: (page) =>
    page.getByRole('textbox', { name: 'Lyrics editor' }),

  // Buttons that sit right next to the style prompt box. Used as anchors to
  // find the style box, because its placeholder is a RANDOM list of example
  // styles ("drum solo, dark j-pop, happycore, ...") and changes every load.
  styleAnchors: (page) =>
    page.getByRole('button', { name: /View saved style prompts|Personalize style prompt/i }),

  // First choice for the style box: a textbox whose accessible name mentions
  // "style" (e.g. "Style of Music", "Styles").
  styleByName: (page) =>
    page.getByRole('textbox', { name: /style/i }),

  // Any editable text field (used inside the anchor container and as a last
  // resort with the comma-separated-placeholder heuristic in suno.mjs).
  editable: 'textarea, input[type="text"], input:not([type]), [contenteditable="true"], [role="textbox"]',

  // Title field (placeholder / name "Song Title (Optional)").
  title: (page) =>
    page.getByRole('textbox', { name: /Song Title/i })
      .or(page.getByPlaceholder(/Song Title/i)),

  // The button that spends credits. Never clicked in --dry-run.
  createButton: (page) =>
    page.getByRole('button', { name: 'Create song', exact: true }),

  // Signs that we are on the sign-in screen rather than the create page.
  signedOut: (page) =>
    page.getByRole('heading', { name: /Welcome to Suno|Sign in/i })
      .or(page.getByRole('button', { name: /^Continue with (Google|Apple|Discord|Microsoft)$/ })),

  // Song links in the workspace clip list (fallback way to find new clip ids).
  songLinks: 'a[href^="/song/"]',

  // Visible human-verification challenges. hCaptcha keeps an invisible iframe
  // on the page at all times, so suno.mjs only treats these as a challenge
  // when the frame is actually visible and reasonably large.
  captchaFrames: 'iframe[src*="hcaptcha.com"], iframe[src*="challenges.cloudflare.com"], iframe[src*="recaptcha"], iframe[title*="captcha" i], iframe[title*="challenge" i]',
  captchaText: /verify (that )?you are (a )?human|complete the (security )?check|are you a robot/i,
};
