// Zyrln Setup Page — Main JavaScript

// ⚙️ تنظیمات
const CONFIG = {
  // اندپوینت API روی VPS ما
  BRIDGE_URL: "https://mhrv-kian.chickenkiller.com/api/zyrln/build",
};

// ─── State ──────────────────────────────────────
const state = {
  workerUrl: null,
  authKey: null,
  workerName: null,
};

// ─── Helpers ────────────────────────────────────

function $(sel) {
  return document.querySelector(sel);
}

function showElement(sel) {
  $(sel).classList.remove("hidden");
}

function hideElement(sel) {
  $(sel).classList.add("hidden");
}

function openStep(id) {
  const step = $(`#${id}`);
  if (step) {
    step.open = true;
    step.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ─── Copy buttons ───────────────────────────────

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("copy-btn")) return;
  
  const targetId = e.target.dataset.target;
  const target = document.getElementById(targetId);
  if (!target) return;
  
  const text = target.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    const original = e.target.textContent;
    e.target.textContent = "✅ کپی شد!";
    e.target.classList.add("copied");
    
    setTimeout(() => {
      e.target.textContent = original;
      e.target.classList.remove("copied");
    }, 2000);
  }).catch(() => {
    alert("کپی نشد. خودت دستی copy کن.");
  });
});

// ─── Build Form Submission ──────────────────────

$("#build-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const token = $("#cf-token").value.trim();
  const accountId = $("#cf-account-id").value.trim().toLowerCase();
  
  // Validation
  if (!token || token.length < 30) {
    showResult("error", "❌ Token معتبر بفرست", "حداقل ۳۰ کاراکتر باید باشه");
    return;
  }
  
  if (!/^[0-9a-f]{32}$/.test(accountId)) {
    showResult("error", "❌ Account ID نامعتبر", "باید ۳۲ کاراکتر hex باشه (فقط a-f و اعداد)");
    return;
  }
  
  // Loading
  const btn = $("#build-btn");
  btn.disabled = true;
  btn.textContent = "⏳ در حال ساخت...";
  showResult("loading", "در حال ساخت Worker شما...", "این کار ۲۰-۳۰ ثانیه طول می‌کشه");
  
  try {
    const resp = await fetch(CONFIG.BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, account_id: accountId }),
    });
    
    const data = await resp.json();
    
    if (!data.success) {
      const errMsg = data.message || "خطای ناشناخته";
      let details = "";
      if (data.details && Array.isArray(data.details)) {
        details = data.details.map(d => d.message || JSON.stringify(d)).join(", ");
      }
      showResult("error", `❌ ${errMsg}`, details);
      btn.disabled = false;
      btn.textContent = "🚀 ساخت Worker";
      return;
    }
    
    // ✅ موفقیت
    state.workerUrl = data.worker_url;
    state.authKey = data.auth_key;
    state.workerName = data.worker_name;
    
    showResult("success", "✅ Worker شما ساخته شد!", `
      <p><strong>Worker URL:</strong></p>
      <div class="result-data">${data.worker_url}</div>
      <p style="margin-top:12px"><strong>AUTH_KEY:</strong></p>
      <div class="result-data">${data.auth_key}</div>
      <p style="margin-top:12px">حالا مرحله بعد (Apps Script) رو شروع کن.</p>
    `);
    
    btn.textContent = "✅ ساخته شد";
    
    // باز کن مرحله بعد
    prepareGasStep();
    setTimeout(() => openStep("gas-step"), 800);
    
  } catch (err) {
    console.error(err);
    showResult("error", "❌ خطا در ارتباط با سرور",
      "ممکنه VPN/Cloudflare بسته باشه یا سرور در دسترس نباشه. کمی بعد دوباره امتحان کن."
    );
    btn.disabled = false;
    btn.textContent = "🚀 ساخت Worker";
  }
});


function showResult(type, title, details) {
  const resultDiv = $("#build-result");
  resultDiv.className = `result-${type}`;
  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `<strong>${title}</strong>${details ? `<div style="margin-top:8px">${details}</div>` : ""}`;
}


// ─── Apps Script step ───────────────────────────

function prepareGasStep() {
  // نشون دادن دستورالعمل‌ها
  showElement("#gas-instructions");
  
  // تولید کد Apps Script
  const code = generateAppsScriptCode(state.authKey, state.workerUrl);
  $("#gas-code").textContent = code;
}


function generateAppsScriptCode(authKey, workerUrl) {
  return `const AUTH_KEY = "${authKey}";
const EXIT_RELAY_URL = "${workerUrl}";
const EXIT_RELAY_KEY = "";

const SKIP_HEADERS = {
  host: true, connection: true, "content-length": true,
  "transfer-encoding": true, "proxy-connection": true, "proxy-authorization": true,
};

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (req.k !== AUTH_KEY) return json_({e: "unauthorized"});
    const compress = !!req.gz;
    if (Array.isArray(req.q)) return doBatch_(req.q, compress);
    return doSingle_(req, compress);
  } catch (err) {
    return json_({e: String(err)});
  }
}

function doSingle_(req, compress) {
  if (!isValidRelayRequest_(req)) return json_({e: "bad url"}, compress);
  const resp = UrlFetchApp.fetch(EXIT_RELAY_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(buildWorkerPayload_(req)),
    muteHttpExceptions: true,
    followRedirects: true,
    headers: exitRelayHeaders_(),
  });
  try {
    return json_(JSON.parse(resp.getContentText()), compress);
  } catch (err) {
    return json_({e: "invalid worker response"}, compress);
  }
}

function doBatch_(items, compress) {
  const fetches = [];
  const errors = {};
  for (let i = 0; i < items.length; i++) {
    if (!isValidRelayRequest_(items[i])) { errors[i] = "bad url"; continue; }
    fetches.push({
      index: i,
      request: {
        url: EXIT_RELAY_URL, method: "post",
        contentType: "application/json",
        payload: JSON.stringify(buildWorkerPayload_(items[i])),
        muteHttpExceptions: true, followRedirects: true,
        headers: exitRelayHeaders_(),
      },
    });
  }
  const responses = fetches.length ? UrlFetchApp.fetchAll(fetches.map(x => x.request)) : [];
  const results = [];
  let ri = 0;
  for (let i = 0; i < items.length; i++) {
    if (errors.hasOwnProperty(i)) { results.push({e: errors[i]}); continue; }
    try {
      results.push(JSON.parse(responses[ri++].getContentText()));
    } catch (err) {
      results.push({e: "invalid worker response"});
    }
  }
  return json_({q: results}, compress);
}

function exitRelayHeaders_() { return EXIT_RELAY_KEY ? {"X-Relay-Key": EXIT_RELAY_KEY} : {}; }

function isValidRelayRequest_(req) {
  return !!req.u && typeof req.u === "string" && !!req.u.match(/^https?:\\/\\//i);
}

function buildWorkerPayload_(req) {
  const headers = {};
  if (req.h && typeof req.h === "object") {
    for (const key in req.h) {
      if (req.h.hasOwnProperty(key) && !SKIP_HEADERS[key.toLowerCase()]) {
        headers[key] = req.h[key];
      }
    }
  }
  return {
    u: req.u, m: (req.m || "GET").toUpperCase(),
    h: headers, b: req.b || null, ct: req.ct || null,
    r: req.r !== false,
  };
}

function doGet() { return HtmlService.createHtmlOutput("Relay Active"); }

function json_(obj, compress) {
  const text = JSON.stringify(obj);
  if (compress) {
    try {
      const gz = Utilities.gzip(Utilities.newBlob(text, 'application/json'));
      return ContentService.createTextOutput(
        JSON.stringify({z: Utilities.base64Encode(gz.getBytes())})
      ).setMimeType(ContentService.MimeType.JSON);
    } catch (_) {}
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}`;
}


// ─── Final config generation ────────────────────

$("#finish-btn").addEventListener("click", () => {
  const input = $("#deployment-id").value.trim();
  
  // استخراج deployment ID
  let deploymentId = null;
  const urlMatch = input.match(/\/macros\/s\/([A-Za-z0-9_-]+)\//);
  if (urlMatch) {
    deploymentId = urlMatch[1];
  } else if (input.startsWith("AKfycb") && input.length >= 50) {
    deploymentId = input;
  }
  
  if (!deploymentId) {
    alert("❌ Deployment ID نامعتبر\n\nباید با AKfycb شروع بشه. می‌تونی کل URL رو هم پیست کنی.");
    return;
  }
  
  // ساخت کانفیگ JSON
  const scriptUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;
  const configJson = JSON.stringify({
    url: scriptUrl,
    key: state.authKey
  }, null, 2);
  
  // نمایش
  showElement("#final-content");
  $("#config-json").textContent = configJson;
  
  // باز کن مرحله نهایی
  openStep("final-step");
});


// ─── Auto-fill from URL (اگه کسی از روی لینک اومد) ──

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has("token")) {
    $("#cf-token").value = params.get("token");
  }
  if (params.has("account")) {
    $("#cf-account-id").value = params.get("account");
  }
  
  // اگه فقط #setup در URL ـه، فرم رو focus کن
  if (window.location.hash === "#setup") {
    setTimeout(() => $("#cf-token").focus(), 300);
  }
});


// ─── Console banner ─────────────────────────────

console.log("%c🌐 Zyrln Setup", "font-size:24px;font-weight:bold;color:#10b981");
console.log("ساخته شده توسط KIAN-IRANI | منبع‌باز در GitHub");
console.log("https://github.com/KIAN-IRANI/zyrln-setup");
