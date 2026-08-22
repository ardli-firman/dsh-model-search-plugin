// Build docs/demo.html: renders ModelSearch with real harness design tokens,
// laid out like the real composer (model seat on the trailing/right side).
import fs from "node:fs";
import path from "node:path";

const root = "/home/almaver/Projects/model-search-plugin";
const harness = "/home/almaver/deepseek-harness";

const read = p => fs.readFileSync(p, "utf8");

const reactUmd = read(path.join(harness, "node_modules/.pnpm/react@18.3.1/node_modules/react/umd/react.development.js"));
const domUmd = read(path.join(harness, "node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/umd/react-dom.development.js"));
const tokensCss = read(path.join(harness, "packages/client/ui-theme/src/styles/design-platform.css"));

// Plugin client.js — kept verbatim; the ModuleLoader stub below captures it.
const clientJs = read(path.join(root, "lib/client.js"));

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${tokensCss}</style>
<style>
  html,body{margin:0;height:100%;}
  body{
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
    background:var(--dsw-alias-bg-layer-1);
    display:flex;flex-direction:column;
  }
  /* Fake transcript area filling space above the composer */
  .transcript{flex:1;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}
  .bubble{
    max-width:600px;margin-bottom:28px;padding:12px 16px;border-radius:14px;
    background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);
    font-size:14px;line-height:22px;
  }
  /* Composer bar mirroring InputBar: input area + tool row */
  .composer{
    width:720px;margin:0 auto 44px;flex:0 0 auto;
    border:1px solid var(--dsw-alias-border-inverted);
    border-radius:16px;background:var(--dsw-specific-menu);
    box-shadow:var(--dsh-ms-shadow, var(--dsw-shadow-lv3));padding:12px 14px 10px;
    box-sizing:border-box;
  }
  .inputarea{
    min-height:24px;padding:2px 2px 10px;color:var(--dsw-alias-label-tertiary);
    font-size:14px;line-height:22px;
  }
  .row{display:flex;justify-content:space-between;align-items:center;gap:8px;}
  .tools{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);}
  .iconbtn{
    display:grid;place-items:center;width:28px;height:28px;border:none;border-radius:8px;
    background:transparent;color:var(--dsw-alias-label-secondary);
    font-size:16px;cursor:pointer;
  }
  .iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);}
  .chip{
    display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:13px;
    border:1px solid var(--dsw-alias-border-inverted);
    color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;
  }
  .trailing{display:flex;align-items:center;gap:6px;}
  .meter{
    color:var(--dsw-alias-label-caption);font-size:11px;font-weight:500;
    padding:0 4px;
  }
  .send{
    display:grid;place-items:center;width:30px;height:30px;border:none;border-radius:9px;
    background:var(--dsw-alias-label-primary);color:var(--dsw-specific-menu);
    font-size:15px;cursor:pointer;
  }
</style>
</head>
<body data-ds-dark-theme="true">
<div class="transcript">
  <div class="bubble">Could you compare the reasoning models available here?</div>
</div>
<div class="composer">
  <div class="inputarea">Ask anything…</div>
  <div class="row">
    <div class="tools">
      <button class="iconbtn" aria-label="Add">+</button>
      <span class="chip">Agent</span>
    </div>
    <div class="trailing">
      <div id="model-seat" style="display:inline-block;"></div>
      <span class="meter">200K</span>
      <button class="send" aria-label="Send">↑</button>
    </div>
  </div>
</div>
<script>${reactUmd}</script>
<script>${domUmd}</script>
<script>
  // require() shim: only "react" is requested by the plugin.
  window.__DSH_REQUIRE_MAP__ = { "react": window.React };
  window.__ModuleLoader__ = {
    load: function(def) {
      window.__PLUGIN_FACTORY__ = def.factory;
      window.__PLUGIN_ID__ = def.id;
    }
  };
</script>
<script>
${clientJs}
</script>
<script>
  (function() {
    var plugin = window.__PLUGIN_FACTORY__(function(name) {
      var mod = window.__DSH_REQUIRE_MAP__[name];
      if (!mod) throw new Error("no shim for " + name);
      return mod;
    });
    var react = window.React;

    // ---- Sample model directory (mirrors tests/helpers.js) ----
    function makeStore(initial) {
      var snapshot = initial;
      var subs = new Set();
      return {
        subscribe: function(fn){ subs.add(fn); return function(){ subs.delete(fn); }; },
        getSnapshot: function(){ return snapshot; },
        notify: function(){ snapshot = Object.assign({}, snapshot); subs.forEach(function(f){ f(); }); },
        load: function(){},
        select: function(sel){
          snapshot = Object.assign({}, snapshot, { current: { provider: sel.provider, model: sel.model, effort: sel.effort } });
          this.notify();
          return Promise.resolve(true);
        }
      };
    }

    var SAMPLE_GROUPS = [
      { id: "openai", name: "OpenAI", models: [
        { id: "gpt-4o", name: "GPT-4o" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini" }
      ]},
      { id: "anthropic", name: "Anthropic", models: [
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" }
      ]},
      { id: "deepseek", name: "DeepSeek", models: [
        { id: "deepseek-chat", name: "DeepSeek-V3" },
        { id: "deepseek-reasoner", name: "DeepSeek-R1" }
      ]}
    ];

    var store = makeStore({
      current: { provider: "deepseek", model: "deepseek-chat", effort: "medium" },
      groups: SAMPLE_GROUPS,
      status: "ready",
      error: null
    });

    try {
      localStorage.setItem("dsh-ms-recent", JSON.stringify([
        { provider: "anthropic", model: "claude-sonnet-4-20250514" },
        { provider: "openai", model: "gpt-4o" }
      ]));
    } catch (e) {}

    var el = plugin.ModelSearch || (plugin.default && plugin.default.ModelSearch);
    var props = {
      locked: false,
      available: true,
      directory: store,
      load: function(){},
      select: function(sel){ return store.select(sel); }
    };
    ReactDOM.createRoot(document.getElementById("model-seat")).render(
      react.createElement(el, props)
    );
  })();
</script>
</body>
</html>`;

fs.mkdirSync(path.join(root, "docs/screenshots"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/demo.html"), html);
console.log("wrote docs/demo.html:", html.length, "bytes");
