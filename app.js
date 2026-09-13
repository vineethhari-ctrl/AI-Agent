/* My Agents — your own AI roles, stored on this phone. */

var state = {
  settings: { key: "", model: "gemini-2.0-flash" },
  agents: null,
  chats: {},
  view: "home",
  current: null,
  busy: false,
  draft: null
};

var app = document.getElementById("app");
var appbar = document.getElementById("appbar");
var composer = document.getElementById("composer");
var fab = document.getElementById("fab");

var API = "https://generativelanguage.googleapis.com/v1beta/models/";

/* ------------------------- icons ------------------------- */

var ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
};

/* ------------------------- default agents ------------------------- */

function defaults() {
  return [
    {
      id: "a-health", emoji: "\uD83E\uDE7A", name: "Health Advisor", builtin: true,
      instructions:
        "You explain health and medical topics clearly to an intelligent adult who is not a doctor. " +
        "Cover how things work in the body, what the evidence says, what is well established versus " +
        "still debated, and what questions are worth asking a doctor.\n\n" +
        "Be genuinely useful and specific. Do not hedge every sentence into uselessness.\n\n" +
        "But hold these lines:\n" +
        "- You do not diagnose. If symptoms are described, explain the possibilities and say plainly " +
        "what warrants seeing a doctor and how urgently.\n" +
        "- You do not prescribe medicines or give specific doses to take.\n" +
        "- For anything involving chest pain, breathing difficulty, sudden weakness, severe bleeding " +
        "or similar, say clearly that this needs immediate medical attention and do not continue " +
        "into explanation first.\n" +
        "- Be honest when evidence is weak, especially for supplements.",
      starters: [
        "What does Vitamin D actually do, and how do I know if I'm low?",
        "Explain what the numbers in a lipid profile mean",
        "What are the early warning signs of heart trouble?"
      ]
    },
    {
      id: "a-pm", emoji: "\uD83D\uDCCB", name: "Project Manager", builtin: true,
      instructions:
        "You are an experienced IT project manager working with me on my projects. You are practical, " +
        "direct, and you write things I can actually use rather than generic advice.\n\n" +
        "You help with: breaking work into tasks and estimates, planning my day and week, drafting " +
        "status updates and client emails, preparing for meetings, writing user stories and acceptance " +
        "criteria, spotting risks and dependencies, and thinking through stakeholder situations.\n\n" +
        "How you work:\n" +
        "- Produce the actual artifact, not a description of it. If I ask for a status update, write it.\n" +
        "- Ask at most one clarifying question, and only when you genuinely cannot proceed without it.\n" +
        "- Keep it tight. Bullet points over paragraphs for plans and lists.\n" +
        "- When a plan has a weak point, say so rather than presenting it as solid.\n" +
        "- If I give you a deadline that is not realistic, tell me.",
      starters: [
        "Plan my day — here's what's on my plate:",
        "Draft a status update for my client on a delayed module",
        "Break this feature into tasks with estimates:"
      ]
    },
    {
      id: "a-mf", emoji: "\uD83D\uDCC8", name: "Mutual Fund Advisor", builtin: true,
      instructions:
        "You explain mutual funds and investing to an Indian retail investor. You are informative and " +
        "concrete about how things work, not vague.\n\n" +
        "You cover: how different fund categories behave, what expense ratio and exit load and NAV " +
        "actually mean, how SIPs work, the difference between direct and regular plans, how debt and " +
        "equity funds are taxed in India, how to read a fund factsheet, and why chasing last year's " +
        "top performer usually goes badly.\n\n" +
        "Hold these lines:\n" +
        "- You are not a SEBI-registered investment adviser and you say so when it matters.\n" +
        "- You do not tell me which specific fund to buy or sell. You explain how to evaluate one and " +
        "what I would be taking on.\n" +
        "- You never predict returns or say something will go up.\n" +
        "- You are honest that past performance says little about the future, and that most active " +
        "funds do not beat their index over long periods.\n" +
        "- If I sound like I am about to do something risky with money I cannot afford to lose, say so " +
        "plainly.",
      starters: [
        "Explain the difference between direct and regular plans",
        "How are equity and debt funds taxed in India?",
        "What should I look at in a fund factsheet?"
      ]
    },
    {
      id: "a-crypto", emoji: "\u20BF", name: "Crypto Advisor", builtin: true,
      instructions:
        "You explain cryptocurrency and blockchain to an Indian user. You are technically accurate and " +
        "you do not hype.\n\n" +
        "You cover: how blockchains actually work, what different tokens do, wallets and custody and " +
        "self-custody, exchanges, DeFi mechanics, and the Indian tax position (30% on gains, 1% TDS, " +
        "losses not offsettable) and current regulatory uncertainty.\n\n" +
        "Hold these lines:\n" +
        "- You never tell me to buy or sell anything, and you never predict a price.\n" +
        "- You are straightforward that most tokens go to zero, that the space is full of scams, and " +
        "that 'utility token' is frequently a cover for a speculative instrument.\n" +
        "- You explain how a given scheme could lose me money, including the ways that are not obvious.\n" +
        "- If something I describe has the shape of a scam — guaranteed returns, referral structures, " +
        "urgency, a token I must buy to join — say so directly.\n" +
        "- You are not a financial or legal adviser and you say so when it matters.",
      starters: [
        "How does a blockchain actually work, in plain terms?",
        "Explain how crypto is taxed in India",
        "What are the real risks of keeping coins on an exchange?"
      ]
    }
  ];
}

/* ------------------------- utilities ------------------------- */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Light markdown: bold, bullets, numbered lists. Escaped first. */
function fmtText(s) {
  var out = esc(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/^\s*[-*]\s+/gm, "\u2022 ");
  return out;
}

function uid(p) { return p + Date.now() + Math.random().toString(36).slice(2, 6); }

function toast(msg) {
  var el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { el.classList.add("hidden"); }, 3000);
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/* ------------------------- persistence ------------------------- */

function save() {
  return DB.set("data", {
    settings: state.settings, agents: state.agents, chats: state.chats
  }).catch(function () { toast("Could not save to this phone"); });
}

function load() {
  return DB.get("data").then(function (d) {
    if (d) {
      state.settings = d.settings || state.settings;
      if (!state.settings.model) state.settings.model = "gemini-2.0-flash";
      state.agents = d.agents || defaults();
      state.chats = d.chats || {};
    } else {
      state.agents = defaults();
    }
  }).catch(function () { state.agents = defaults(); });
}

/* ------------------------- chrome ------------------------- */

function setChrome(o) {
  if (o.title === null) {
    appbar.classList.add("hidden"); appbar.innerHTML = "";
  } else {
    appbar.classList.remove("hidden");
    appbar.innerHTML =
      (o.back ? '<button class="iconbtn" id="bar-back" aria-label="Back">' + ICON.back + '</button>'
              : '<div style="width:8px"></div>') +
      '<div class="title">' + esc(o.title) +
        (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</div>' +
      (o.right ? '<button class="iconbtn" id="bar-right" aria-label="' + esc(o.right.label) + '">' +
        o.right.icon + '</button>' : '');
    var b = document.getElementById("bar-back");
    if (b) b.onclick = o.back;
    var r = document.getElementById("bar-right");
    if (r) r.onclick = o.right.action;
  }

  if (o.fab) {
    fab.classList.remove("hidden");
    fab.innerHTML = ICON.plus + '<span>' + esc(o.fab.label) + '</span>';
    fab.onclick = o.fab.action;
  } else { fab.classList.add("hidden"); }

  if (!o.composer) { composer.classList.add("hidden"); composer.innerHTML = ""; }
  app.className = o.composer ? "chat" : "";
}

function go(view, arg) {
  state.view = view;
  state.current = arg || null;
  state.draft = null;
  window.scrollTo(0, 0);
  render();
}

function render() {
  if (state.view === "chat") { renderChat(); return; }
  if (state.view === "editAgent") { renderEditAgent(); return; }
  if (state.view === "settings") { renderSettings(); return; }
  renderHome();
}

/* ------------------------- home ------------------------- */

function renderHome() {
  setChrome({
    title: "My Agents",
    right: { label: "Settings", icon: ICON.gear, action: function () { go("settings"); } },
    fab: { label: "New agent", action: function () { go("editAgent", null); } }
  });

  var keyMissing = !state.settings.key;

  var notice = keyMissing
    ? '<div class="notice"><strong>One setup step left.</strong><br>' +
      'These agents need a free Google Gemini API key to think. It is stored only on this phone. ' +
      '<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Get a key</a>, ' +
      'then paste it in settings.<div style="height:10px"></div>' +
      '<button class="btn primary wide" id="n-setup">Add my key</button></div>'
    : '';

  var list = state.agents.map(function (a) {
    var chat = state.chats[a.id] || [];
    var sub = chat.length
      ? chat.length + (chat.length === 1 ? " message" : " messages")
      : firstLine(a.instructions);
    return '<button class="agent" data-open="' + esc(a.id) + '">' +
      '<div class="avatar">' + esc(a.emoji) + '</div>' +
      '<div class="a-main"><div class="a-name">' + esc(a.name) + '</div>' +
      '<div class="a-sub">' + esc(sub) + '</div></div>' +
      '<div class="a-chev">' + ICON.chev + '</div></button>';
  }).join("");

  var body = state.agents.length
    ? '<div class="group-label">' + state.agents.length + ' AGENTS</div>' + list
    : '<div class="empty"><div class="lead">No agents yet</div>' +
      'Tap New agent to write your first one.</div>';

  app.innerHTML = notice + body +
    '<p class="footnote">Every agent, every conversation and your API key stay on this phone. ' +
    'Nothing is uploaded to any server of ours \u2014 there is no server. Your messages go directly ' +
    'from this phone to Google, which is what makes the agents work.</p>';

  var setup = document.getElementById("n-setup");
  if (setup) setup.onclick = function () { go("settings"); };

  var btns = app.querySelectorAll("[data-open]");
  for (var i = 0; i < btns.length; i++) {
    (function (b) {
      b.onclick = function () { go("chat", b.getAttribute("data-open")); };
    })(btns[i]);
  }
}

function firstLine(s) {
  var t = String(s || "").split("\n")[0];
  return t.length > 72 ? t.slice(0, 72) + "\u2026" : t;
}

function agentById(id) {
  for (var i = 0; i < state.agents.length; i++) {
    if (state.agents[i].id === id) return state.agents[i];
  }
  return null;
}

/* ------------------------- chat ------------------------- */

function renderChat() {
  var a = agentById(state.current);
  if (!a) { go("home"); return; }

  setChrome({
    title: a.name,
    sub: state.busy ? "thinking\u2026" : "tap pencil to edit this agent",
    back: function () { go("home"); },
    right: { label: "Edit agent", icon: ICON.edit, action: function () { go("editAgent", a.id); } },
    composer: true
  });

  var chat = state.chats[a.id] || [];

  var body;
  if (!chat.length) {
    body = '<div class="chatintro"><div class="big">' + esc(a.emoji) + '</div>' +
      '<div class="nm">' + esc(a.name) + '</div>' + esc(firstLine(a.instructions)) +
      (a.starters && a.starters.length
        ? '<div class="starters">' + a.starters.map(function (s) {
            return '<button class="starter" data-starter="' + esc(s) + '">' + esc(s) + '</button>';
          }).join("") + '</div>'
        : '') + '</div>';
  } else {
    body = chat.map(function (m) {
      var cls = m.role === "user" ? "me" : (m.error ? "bot err" : "bot");
      var inner = m.role === "user" ? esc(m.text) : fmtText(m.text);
      return '<div class="msg ' + cls + '"><div class="bubble">' + inner + '</div></div>';
    }).join("");
  }

  if (state.busy) {
    body += '<div class="msg bot"><div class="bubble"><div class="typing"><i></i><i></i><i></i></div></div></div>';
  }

  app.innerHTML = body;

  composer.classList.remove("hidden");
  composer.innerHTML =
    '<textarea id="c-input" rows="1" placeholder="Message ' + esc(a.name) + '\u2026"></textarea>' +
    '<button class="sendbtn" id="c-send" aria-label="Send">' + ICON.send + '</button>';

  var input = document.getElementById("c-input");
  var sendBtn = document.getElementById("c-send");

  input.oninput = function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  };
  sendBtn.disabled = state.busy;
  sendBtn.onclick = function () {
    var text = input.value.trim();
    if (!text || state.busy) return;
    input.value = "";
    input.style.height = "auto";
    send(a, text);
  };

  var starters = app.querySelectorAll("[data-starter]");
  for (var i = 0; i < starters.length; i++) {
    (function (b) {
      b.onclick = function () {
        var t = b.getAttribute("data-starter");
        if (t.slice(-1) === ":") { input.value = t + " "; input.focus(); }
        else { send(a, t); }
      };
    })(starters[i]);
  }

  scrollDown();
}

function scrollDown() {
  window.requestAnimationFrame(function () {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

function send(agent, text) {
  if (!state.settings.key) {
    toast("Add your Gemini API key in settings first");
    go("settings");
    return;
  }

  var chat = state.chats[agent.id] || (state.chats[agent.id] = []);
  chat.push({ role: "user", text: text });
  state.busy = true;
  renderChat();
  save();

  var history = chat
    .filter(function (m) { return !m.error; })
    .slice(-24)
    .map(function (m) {
      return { role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] };
    });

  var url = API + encodeURIComponent(state.settings.model) +
            ":generateContent?key=" + encodeURIComponent(state.settings.key);

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: agent.instructions }] },
      contents: history,
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
    })
  })
  .then(function (res) {
    return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
  })
  .then(function (r) {
    state.busy = false;

    if (!r.ok) {
      var msg = (r.data && r.data.error && r.data.error.message) || ("HTTP " + r.status);
      var friendly;
      if (r.status === 400 && /API key not valid/i.test(msg)) {
        friendly = "That API key was rejected. Check it in settings.";
      } else if (r.status === 404) {
        friendly = "Google could not use \"" + state.settings.model + "\" with this key.\n\n" +
                   "Google said: " + msg + "\n\n" +
                   "Open settings and tap \u201CCheck my key\u201D to see which models this key can " +
                   "actually use.";
      } else if (r.status === 403) {
        friendly = "This key was refused (403).\n\nGoogle said: " + msg + "\n\n" +
                   "Usually this means the Generative Language API is not enabled on the key\u2019s " +
                   "project, or the key has restrictions on it.";
      } else if (r.status === 429) {
        friendly = "Google's free tier rate limit was hit. Wait a minute and try again.";
      } else {
        friendly = "Google returned an error: " + msg;
      }
      chat.push({ role: "model", text: friendly, error: true });
      renderChat(); save(); return;
    }

    var out = "";
    var cand = r.data && r.data.candidates && r.data.candidates[0];
    if (cand && cand.content && cand.content.parts) {
      out = cand.content.parts.map(function (p) { return p.text || ""; }).join("");
    }
    if (!out) {
      var reason = cand && cand.finishReason;
      out = reason === "SAFETY"
        ? "That response was blocked by Google's safety filter. Try rephrasing."
        : "No reply came back. Try again.";
      chat.push({ role: "model", text: out, error: true });
    } else {
      chat.push({ role: "model", text: out });
    }
    renderChat(); save();
  })
  .catch(function () {
    state.busy = false;
    chat.push({
      role: "model", error: true,
      text: "Could not reach Google. Check your internet connection and try again."
    });
    renderChat(); save();
  });
}

/* ------------------------- edit agent ------------------------- */

var EMOJIS = ["\uD83E\uDD16","\uD83E\uDE7A","\uD83D\uDCCB","\uD83D\uDCC8","\u20BF","\uD83D\uDCDA",
              "\u2696\uFE0F","\uD83C\uDF73","\uD83C\uDFCB\uFE0F","\uD83C\uDFB8","\u2708\uFE0F",
              "\uD83D\uDCBC","\uD83C\uDFA8","\uD83C\uDF31","\uD83D\uDD27","\uD83E\uDDE0"];

function renderEditAgent() {
  var existing = state.current ? agentById(state.current) : null;
  if (!state.draft) {
    state.draft = existing
      ? { emoji: existing.emoji }
      : { emoji: "\uD83E\uDD16" };
  }

  setChrome({
    title: existing ? "Edit agent" : "New agent",
    back: function () { go(existing ? "chat" : "home", existing ? existing.id : null); }
  });

  app.innerHTML =
    '<p class="screen-note">The instructions are the whole agent. Write them the way you would ' +
    'brief a person on their first day \u2014 what they do, how they should answer you, and what ' +
    'they should not do.</p>' +

    '<div class="field"><label>Icon</label><div class="emojirow" id="e-emoji">' +
      EMOJIS.map(function (e) {
        return '<button data-e="' + e + '" class="' + (e === state.draft.emoji ? "on" : "") + '">' + e + '</button>';
      }).join("") + '</div></div>' +

    '<div class="field"><label for="e-name">Name</label>' +
    '<input id="e-name" value="' + esc(existing ? existing.name : "") + '" placeholder="Travel Planner" /></div>' +

    '<div class="field"><label for="e-inst">Instructions</label>' +
    '<textarea id="e-inst" class="tall" placeholder="You are\u2026">' +
    esc(existing ? existing.instructions : "") + '</textarea>' +
    '<div class="hint">Be specific about tone and format. Saying what it should <em>not</em> do ' +
    'matters as much as what it should.</div></div>' +

    '<div class="field"><label for="e-start">Suggested openers, one per line</label>' +
    '<textarea id="e-start" placeholder="Optional">' +
    esc(existing && existing.starters ? existing.starters.join("\n") : "") + '</textarea>' +
    '<div class="hint">Shown as tappable buttons on an empty chat. End a line with a colon to have ' +
    'it fill the box instead of sending.</div></div>' +

    '<div class="actions"><button class="btn primary grow" id="e-save">' +
      (existing ? "Save changes" : "Create agent") + '</button></div>' +

    (existing
      ? '<div style="height:14px"></div>' +
        '<button class="btn wide" id="e-clear">Clear this conversation</button>' +
        '<div style="height:10px"></div>' +
        '<button class="btn wide danger" id="e-del">Delete this agent</button>'
      : '');

  var picks = document.getElementById("e-emoji").querySelectorAll("button");
  for (var i = 0; i < picks.length; i++) {
    (function (b) {
      b.onclick = function () {
        state.draft.emoji = b.getAttribute("data-e");
        for (var j = 0; j < picks.length; j++) picks[j].className = "";
        b.className = "on";
      };
    })(picks[i]);
  }

  document.getElementById("e-save").onclick = function () {
    var name = val("e-name");
    var inst = val("e-inst");
    if (!name) { toast("Give the agent a name"); return; }
    if (!inst) { toast("Instructions are what make the agent"); return; }
    var starters = val("e-start").split("\n").map(function (s) { return s.trim(); })
                    .filter(function (s) { return s; });

    if (existing) {
      existing.name = name; existing.instructions = inst;
      existing.emoji = state.draft.emoji; existing.starters = starters;
      save().then(function () { toast("Saved"); go("chat", existing.id); });
    } else {
      var a = { id: uid("a-"), name: name, instructions: inst,
                emoji: state.draft.emoji, starters: starters };
      state.agents.push(a);
      save().then(function () { toast("Agent created"); go("chat", a.id); });
    }
  };

  if (existing) {
    document.getElementById("e-clear").onclick = function () {
      if (!confirm("Clear the whole conversation with " + existing.name + "?")) return;
      state.chats[existing.id] = [];
      save().then(function () { toast("Conversation cleared"); go("chat", existing.id); });
    };
    document.getElementById("e-del").onclick = function () {
      if (!confirm("Delete " + existing.name + " and its conversation? This cannot be undone.")) return;
      state.agents = state.agents.filter(function (x) { return x.id !== existing.id; });
      delete state.chats[existing.id];
      save().then(function () { toast("Deleted"); go("home"); });
    };
  }
}

/* ------------------------- settings ------------------------- */

function renderSettings() {
  setChrome({ title: "Settings", back: function () { go("home"); } });

  app.innerHTML =
    '<div class="group-label">GEMINI API KEY</div>' +
    '<p class="screen-note">Get a free key at ' +
    '<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. ' +
    'It is stored on this phone only and sent directly to Google when an agent replies. ' +
    'Google\u2019s free tier has daily limits; heavy use may need a paid key.</p>' +

    '<div class="field"><label for="s-key">API key</label>' +
    '<input id="s-key" type="password" value="' + esc(state.settings.key) + '" placeholder="AIza\u2026" /></div>' +

    '<div class="field"><label for="s-model">Model</label>' +
    '<input id="s-model" value="' + esc(state.settings.model) + '" /></div>' +
    '<div class="hint" style="margin-top:-8px">If replies fail with a \u201Cmodel not found\u201D error, ' +
    'Google has renamed it. Check the model list in AI Studio and paste the new name here.</div>' +

    '<div style="height:18px"></div>' +
    '<button class="btn primary wide" id="s-save">Save</button>' +
    '<div style="height:10px"></div>' +
    '<button class="btn wide" id="s-check">Check my key</button>' +
    '<div id="s-result"></div>' +

    '<div class="group-label" style="margin-top:28px">BACKUP</div>' +
    '<div class="stack">' +
      '<button class="btn wide" id="s-export">Save a backup file</button>' +
      '<input type="file" id="s-file" accept=".json,application/json" hidden />' +
      '<button class="btn wide" id="s-import">Restore from a backup file</button>' +
    '</div>' +
    '<div class="hint">The backup holds your agents and conversations. Your API key is not included.</div>' +

    '<div class="group-label" style="margin-top:28px">RESET</div>' +
    '<div class="stack">' +
      '<button class="btn wide" id="s-restore">Restore the four starter agents</button>' +
      '<button class="btn wide danger" id="s-erase">Erase everything</button>' +
    '</div>';

  document.getElementById("s-save").onclick = function () {
    state.settings.key = val("s-key");
    state.settings.model = val("s-model") || "gemini-2.0-flash";
    save().then(function () { toast("Saved"); go("home"); });
  };

  document.getElementById("s-check").onclick = function () {
    var key = val("s-key");
    var box = document.getElementById("s-result");
    if (!key) { toast("Paste your API key first"); return; }
    box.innerHTML = '<div class="notice">Asking Google\u2026</div>';

    fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(key))
      .then(function (res) {
        return res.json().then(function (d) { return { ok: res.ok, status: res.status, d: d }; });
      })
      .then(function (r) {
        if (!r.ok) {
          var m = (r.d && r.d.error && r.d.error.message) || ("HTTP " + r.status);
          box.innerHTML = '<div class="notice" style="background:#FBECE9">' +
            '<strong>The key did not work.</strong><br><br>Google said:<br>' + esc(m) +
            '<br><br>Most often this means the Generative Language API is not enabled for this ' +
            'key\u2019s project, or the key is restricted to certain apps or IP addresses. ' +
            'Making a fresh key in AI Studio usually fixes it.</div>';
          return;
        }

        var models = (r.d.models || []).filter(function (m) {
          return (m.supportedGenerationMethods || []).indexOf("generateContent") !== -1;
        }).map(function (m) {
          return String(m.name).replace(/^models\//, "");
        }).filter(function (n) {
          return n.indexOf("embedding") === -1 && n.indexOf("aqa") === -1;
        });

        if (!models.length) {
          box.innerHTML = '<div class="notice">The key works, but no chat models came back. ' +
            'That is unusual \u2014 check the project in AI Studio.</div>';
          return;
        }

        box.innerHTML = '<div class="notice"><strong>The key works.</strong> ' +
          models.length + ' models available. Tap one to use it:</div>' +
          '<div class="stack">' + models.slice(0, 25).map(function (n) {
            return '<button class="btn wide" data-model="' + esc(n) + '" ' +
              'style="text-align:left;font-weight:500;font-size:14px">' + esc(n) + '</button>';
          }).join("") + '</div>';

        var picks = box.querySelectorAll("[data-model]");
        for (var i = 0; i < picks.length; i++) {
          (function (b) {
            b.onclick = function () {
              document.getElementById("s-model").value = b.getAttribute("data-model");
              state.settings.key = val("s-key");
              state.settings.model = b.getAttribute("data-model");
              save().then(function () { toast("Using " + state.settings.model); go("home"); });
            };
          })(picks[i]);
        }
      })
      .catch(function () {
        box.innerHTML = '<div class="notice" style="background:#FBECE9">Could not reach Google. ' +
          'Check your internet connection.</div>';
      });
  };

  document.getElementById("s-export").onclick = function () {
    var payload = {
      format: "myagents-backup", version: 1, savedOn: new Date().toISOString(),
      agents: state.agents, chats: state.chats
    };
    var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "my-agents-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast("Backup saved to your downloads");
  };

  var f = document.getElementById("s-file");
  document.getElementById("s-import").onclick = function () { f.click(); };
  f.onchange = function () {
    var file = f.files && f.files[0];
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (d.format !== "myagents-backup") throw new Error("wrong file");
        if (!confirm("Replace your agents and conversations with this backup?")) return;
        state.agents = d.agents || state.agents;
        state.chats = d.chats || {};
        save().then(function () { toast("Backup restored"); go("home"); });
      } catch (e) { toast("That is not a My Agents backup"); }
    };
    r.readAsText(file);
    f.value = "";
  };

  document.getElementById("s-restore").onclick = function () {
    var have = {};
    state.agents.forEach(function (a) { have[a.id] = true; });
    var added = 0;
    defaults().forEach(function (d) { if (!have[d.id]) { state.agents.push(d); added++; } });
    save().then(function () {
      toast(added ? added + " restored" : "All four are already here");
      go("home");
    });
  };

  document.getElementById("s-erase").onclick = function () {
    if (!confirm("Erase every agent, conversation and your API key?")) return;
    if (!confirm("Last check \u2014 erase everything?")) return;
    DB.clear().then(function () {
      state.settings = { key: "", model: "gemini-2.0-flash" };
      state.agents = defaults();
      state.chats = {};
      save().then(function () { go("home"); });
    });
  };
}

/* ------------------------- start ------------------------- */

window.addEventListener("popstate", function () {
  if (state.view !== "home") { go("home"); }
  history.pushState(null, "", location.href);
});
history.pushState(null, "", location.href);

load().then(function () { render(); DB.persist(); });
