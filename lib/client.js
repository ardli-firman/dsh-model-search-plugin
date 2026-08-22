window.__ModuleLoader__.load({
	id: "dsh-model-search",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		var react = require("react");

		/**
		 * Namespaced stylesheet for the searchable model selector.
		 *
		 * The component deliberately renders through CSS classes (not inline
		 * styles) so the real `:hover` / `:focus-visible` / `:disabled` pseudo
		 * states work, and so every colour resolves from the harness design
		 * tokens (`--dsw-*`). Those tokens are declared on `body` by
		 * ui-theme and rebind automatically for the light and dark palettes,
		 * so the selector now adapts to the active DeepSeek Harness theme
		 * instead of hardcoding a dark fallback the way the old inline styles did.
		 *
		 * Token choices mirror packages/client/ui-model-selection's
		 * ModelSelect.module.css so the seat reads as the same material as the
		 * upstream /model menu.
		 */
		var STYLE_ID = "dsh-model-search-style";
		var STYLE_TEXT = [
			".dsh-ms-root{position:relative;display:inline-block;min-width:0;vertical-align:middle;}",

			/* Trigger — figma 313:14108 ToggleButton: 13/20 medium secondary label,",
			 * 28px chip, rounded 24px, transparent chrome matching sibling seats. */
			".dsh-ms-trigger{display:flex;align-items:center;gap:4px;min-width:0;",
				"max-width:min(360px,45vw);height:28px;padding:0 4px 0 8px;border:none;",
				"border-radius:24px;outline:none;background:transparent;",
				"color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;",
				"font-weight:500;font-family:inherit;cursor:pointer;}",
			".dsh-ms-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}",
			".dsh-ms-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".dsh-ms-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default;}",
			".dsh-ms-triggerLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-chevron{flex:0 0 auto;color:var(--dsw-alias-label-caption);transition:transform 120ms ease;}",
			".dsh-ms-triggerIcon{display:flex;align-items:center;flex:0 0 auto;}",
			".dsh-ms-chevronOpen{transform:rotate(180deg);}",

			/* Menu card — same surface tokens as the Menu primitive so every",
			 * dropdown in the harness reads as one material. Position/flip is
			 * driven by JS (menuPos state) so the card never overflows the
			 * viewport; width is fixed 320px for stable reading columns. */
			".dsh-ms-menu{position:absolute;right:0;bottom:calc(100% + 8px);z-index:20;",
			"display:flex;flex-direction:column;width:320px;",
			"min-width:min(240px,calc(100vw - 32px));max-width:min(420px,calc(100vw - 32px));",
			"overflow:hidden;padding:8px;",
			"border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;",
			"background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);",
			"color:var(--dsw-alias-label-primary);",
			"--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);",
			"--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);transition:opacity 120ms ease;}",
			".dsh-ms-menuDown{bottom:auto;top:calc(100% + 8px);}",
			/* Max-height is set inline by JS to exactly fit the viewport. */
			".dsh-ms-menu[data-maxh]{max-height:var(--dsh-ms-maxh,360px);}",

			/* Search field — native input skinned with the harness tokens. */
			".dsh-ms-search{flex:0 0 auto;padding:2px 8px 8px;display:flex;align-items:center;gap:6px;position:relative;}",
			".dsh-ms-input{box-sizing:border-box;flex:1;min-width:0;width:100%;max-width:100%;height:30px;padding:0 10px;",
			"border:1px solid var(--dsw-alias-border-inverted);border-radius:8px;",
			"background:var(--dsw-alias-interactive-bg-hover);transition:box-shadow 150ms ease;",
			"font-size:13px;line-height:20px;font-family:inherit;outline:none;}",
			".dsh-ms-input::placeholder{color:var(--dsw-alias-label-tertiary);}",
			".dsh-ms-input:focus-visible{border-color:transparent;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",
			".dsh-ms-clear{flex:0 0 auto;display:grid;place-items:center;width:20px;height:20px;margin-right:2px;",
			"padding:0;border:none;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary);",
			"cursor:pointer;transition:background 100ms,color 100ms;}",
			".dsh-ms-clear:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}",
			".dsh-ms-clear:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none;}",

			".dsh-ms-status,.dsh-ms-empty{padding:10px;color:var(--dsw-alias-label-tertiary);",
				"font-size:13px;line-height:20px;}",
			".dsh-ms-error{flex:0 0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;",
				"margin-bottom:4px;padding:7px 8px;border-radius:8px;",
				"background:var(--dsw-alias-interactive-bg-hover-danger);",
				"color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;}",
			".dsh-ms-retry{flex:0 0 auto;padding:0;border:none;background:transparent;color:inherit;",
				"font:inherit;font-weight:600;cursor:pointer;}",

			".dsh-ms-groups{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 2px;",
			/* Skinned scrollbar: thin, token-colored, invisible until hover. */
			"scrollbar-width:thin;scrollbar-color:var(--dsh-scrollbar-thumb) transparent;",
			"overscroll-behavior:contain;}",
			".dsh-ms-groups::-webkit-scrollbar{width:8px;}",
			".dsh-ms-groups::-webkit-scrollbar-track{background:transparent;}",
			".dsh-ms-groups::-webkit-scrollbar-thumb{background:var(--dsh-scrollbar-thumb);border-radius:4px;border:2px solid transparent;background-clip:padding-box;}",
			".dsh-ms-groups::-webkit-scrollbar-thumb:hover{background:var(--dsh-scrollbar-thumb-hover);border:2px solid transparent;background-clip:padding-box;}",
			".dsh-ms-group+.dsh-ms-group{margin-top:6px;}",
			".dsh-ms-groupTitle{display:flex;align-items:center;gap:4px;position:sticky;top:0;z-index:1;width:100%;",
			"padding:8px 8px 4px;border:none;border-bottom:1px solid var(--dsw-alias-border-inverted);",
			"background:var(--dsw-specific-menu);color:var(--dsw-alias-label-tertiary);",
			"font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.3px;text-align:left;cursor:pointer;font-family:inherit;}",
			".dsh-ms-groupTitle:hover{color:var(--dsw-alias-label-secondary);}",
			".dsh-ms-groupTitle:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--dsw-alias-border-l3);border-radius:4px;}",
			".dsh-ms-groupTitle:first-child{margin-top:-4px;}",
			".dsh-ms-groupChevron{flex:0 0 auto;display:grid;place-items:center;color:inherit;transition:transform 120ms ease;}",
			".dsh-ms-groupChevronOpen{transform:rotate(90deg);}",
			".dsh-ms-groupTitleText{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-groupCount{flex:0 0 auto;color:var(--dsw-alias-label-tertiary);font-weight:500;}",

			/* Option row — 38px, 10px radius, hover/focus surface, trailing check. */
			".dsh-ms-option{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:auto;",
			"min-width:100%;min-height:38px;padding:8px 10px;border:none;border-radius:8px;",
			"outline:none;background:transparent;color:inherit;text-align:left;cursor:pointer;transition:background 100ms ease;",
			"font-size:14px;line-height:20px;font-weight:500;font-family:inherit;}",
			".dsh-ms-option:hover:not(:disabled),.dsh-ms-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover);}",
			".dsh-ms-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default;}",
			".dsh-ms-optionCopy{display:flex;flex:1;flex-direction:column;min-width:0;}",
			".dsh-ms-modelName{overflow:hidden;color:inherit;font-size:14px;line-height:20px;",
			"font-weight:500;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-modelId{overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:12px;",
			"line-height:18px;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-check{display:grid;place-items:center;flex:0 0 18px;color:var(--dsw-alias-label-primary);}",

			/* Result count footer — sits below the scrollable list. */
			".dsh-ms-count{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;",
			"padding:8px 8px 0;border-top:1px solid var(--dsw-alias-border-inverted);margin-top:6px;",
			"color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-weight:500;}",
			".dsh-ms-countClear{flex:0 0 auto;padding:0;border:none;background:transparent;color:inherit;",
			"font:inherit;font-weight:600;cursor:pointer;}",
			".dsh-ms-countClear:hover{color:var(--dsw-alias-label-primary);}",
			".dsh-ms-countClear:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);border-radius:4px;}",

			/* Loading skeleton — shimmering placeholder rows. */
			".dsh-ms-skeleton{display:flex;flex-direction:column;gap:6px;padding:4px 2px;}",
			".dsh-ms-skelRow{height:38px;border-radius:8px;",
			"background:linear-gradient(90deg,var(--dsw-alias-interactive-bg-hover) 25%,var(--dsw-alias-interactive-bg-selected) 50%,var(--dsw-alias-interactive-bg-hover) 75%);",
			"background-size:200% 100%;animation:dshMsShimmer 1.2s ease-in-out infinite;}",
			"@keyframes dshMsShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}",
			".dsh-ms-skelRow:nth-child(2){width:92%;}",
			".dsh-ms-skelRow:nth-child(3){width:84%;}",

			/* Effort selector — horizontal radio group below the search field. */
			".dsh-ms-effort{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;padding:8px 8px;border-bottom:1px solid var(--dsw-alias-border-inverted);}",
			".dsh-ms-effortLabel{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;}",
			".dsh-ms-effortGroup{display:flex;gap:2px;}",
			".dsh-ms-effortBtn{flex:1;height:26px;border:1px solid var(--dsw-alias-border-inverted);border-radius:6px;",
				"background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:500;",
				"font-family:inherit;cursor:pointer;transition:background 100ms,border-color 100ms;}",
			".dsh-ms-effortBtn:hover{background:var(--dsw-alias-interactive-bg-hover);}",
			".dsh-ms-effortBtn:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none;}",
			".dsh-ms-effortBtn[aria-checked='true']{",
				"background:var(--dsw-alias-interactive-bg-selected);",
				"border-color:var(--dsw-alias-border-l3);",
				"color:var(--dsw-alias-label-primary);}",
			".dsh-ms-effortSep{width:1px;height:16px;align-self:center;background:var(--dsw-alias-border-inverted);}",

			/* Effort badge — inline in the trigger after model name. */
			".dsh-ms-effortBadge{display:inline-flex;align-items:center;height:20px;padding:0 6px;gap:3px;",
				"border-radius:10px;font-size:10px;font-weight:600;line-height:14px;letter-spacing:0.3px;",
				"background:var(--dsw-alias-interactive-bg-selected);",
				"color:var(--dsw-alias-label-primary);white-space:nowrap;user-select:none;flex:0 0 auto;",
				"border:1px solid var(--dsw-alias-border-inverted);}",
			".dsh-ms-effortDot{width:5px;height:5px;border-radius:50%;",
				"background:var(--dsw-alias-state-success-primary);flex:0 0 auto;}",
		].join("");

		function ensureStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById(STYLE_ID)) return;
			var el = document.createElement("style");
			el.id = STYLE_ID;
			el.textContent = STYLE_TEXT;
			document.head.appendChild(el);
		}

		/* Inline icon helpers — match the upstream primitive glyphs (chevron-down 14, check 16). */
		function iconChevron(open) {
			return react.createElement("svg", {
				className: open ? "dsh-ms-chevron dsh-ms-chevronOpen" : "dsh-ms-chevron",
				width: 14, height: 14, viewBox: "0 0 24 24",
				fill: "none", stroke: "currentColor", strokeWidth: 2,
				strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
			}, react.createElement("path", { d: "M6 9l6 6 6-6" }));
		}

		function iconCheck() {
			return react.createElement("svg", {
				width: 16, height: 16, viewBox: "0 0 24 24",
				fill: "none", stroke: "currentColor", strokeWidth: 2,
				strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
			}, react.createElement("polyline", { points: "20 6 9 17 4 12" }));
		}

		function iconX() {
			return react.createElement("svg", {
				width: 12, height: 12, viewBox: "0 0 24 24",
				fill: "none", stroke: "currentColor", strokeWidth: 2.5,
				strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
			}, react.createElement("path", { d: "M18 6L6 18M6 6l12 12" }));
		}

		function iconChevronRight() {
			return react.createElement("svg", {
				width: 12, height: 12, viewBox: "0 0 24 24",
				fill: "none", stroke: "currentColor", strokeWidth: 2,
				strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
			}, react.createElement("polyline", { points: "9 18 15 12 9 6" }));
		}

		/**
		 * ModelSearch: searchable model selector for the composer seat.
		 * Uses connection.api.sessions for RPC calls, exactly like the
		 * shipped @deepseek-ai/dsh-client-ui-model-selection plugin, and now
		 * renders through the harness design tokens so it adapts to the
		 * active theme.
		 */
		function ModelSearch(props) {
			var locked = props.locked || false;
			var available = props.available !== false;
			var directory = props.directory;
			var load = props.load;
			var select = props.select;

			var state = react.useSyncExternalStore(
				function(fn) { return directory ? directory.subscribe(fn) : function() {}; },
				function() { return directory ? directory.getSnapshot() : { current: null, groups: [], status: "idle", error: null }; }
			);

			var _a = react.useState(false), open = _a[0], setOpen = _a[1];
			var _b = react.useState(""), query = _b[0], setQuery = _b[1];
			var _c = react.useState(false), busy = _c[0], setBusy = _c[1];
			var _d = react.useState("medium"), effort = _d[0], setEffort = _d[1];
			var _e = react.useState("up"), menuPos = _e[0], setMenuPos = _e[1];
			var _f = react.useState({}), collapsed = _f[0], setCollapsed = _f[1];
			var _g = react.useState(null), menuMaxH = _g[0], setMenuMaxH = _g[1];
			var _h = react.useState([]), recent = _h[0], setRecent = _h[1];
			var inputRef = react.useRef(null);
			var rootRef = react.useRef(null);
			var triggerRef = react.useRef(null);
			var itemRefs = react.useRef([]);
			var groupsRef = react.useRef(null);
			var menuId = react.useId ? react.useId() + "-menu" : "dsh-ms-menu";
			var RECENT_KEY = "dsh-ms-recent";

			// Load recent selections from localStorage (guarded for non-DOM envs).
			react.useEffect(function() {
				try {
					var raw = window.localStorage && window.localStorage.getItem(RECENT_KEY);
					if (raw) {
						var parsed = JSON.parse(raw);
						if (Array.isArray(parsed)) setRecent(parsed.slice(0, 6));
					}
				} catch (e) { /* ignore storage errors */ }
			}, []);

			function pushRecent(provider, modelId) {
				setRecent(function(prev) {
					var next = [{ provider: provider, model: modelId }].concat(
						prev.filter(function(r) { return !(r.provider === provider && r.model === modelId); })
					).slice(0, 6);
					try {
						if (window.localStorage) window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
					} catch (e) { /* ignore storage errors */ }
					return next;
				});
			}

			// Reset and rebuild the option ref list on every render so keyboard
			// navigation always walks the currently visible rows.
			itemRefs.current = [];
			var itemIndex = 0;
			function makeItemRef() {
				var at = itemIndex++;
				return function(node) { itemRefs.current[at] = node; };
			}

			react.useEffect(function() { ensureStyles(); }, []);

			// Load on mount
			react.useEffect(function() {
				if (available && load) load();
			}, [available, load]);

			// Auto-focus search input when the menu opens
			react.useEffect(function() {
				if (open && inputRef.current) inputRef.current.focus();
			}, [open]);

			// Detect menu position — measure real space above/below the trigger
			// and clamp max-height so the card always fits the viewport.
			react.useEffect(function() {
				if (!open || !triggerRef.current) return;
				var rect = triggerRef.current.getBoundingClientRect();
				var spaceAbove = rect.top;
				var spaceBelow = window.innerHeight - rect.bottom;
				var GAP = 8;
				// Pick the side with more room, but if neither fits a minimum
				// card, stay above (composer is at the bottom edge).
				var best = "up";
				if (spaceBelow >= 240 && spaceBelow >= spaceAbove) best = "down";
				setMenuPos(best);
				var avail = best === "down" ? spaceBelow : spaceAbove;
				// Never force a height larger than the space that actually
				// exists: Math.max(200, ...) could exceed the viewport and push
				// the card off-screen, clipping the search input. Clamp to what
				// is really available (with a small floor so a cramped viewport
				// still gets a usable strip).
				var maxH = Math.max(120, Math.min(360, avail - GAP));
				setMenuMaxH(maxH + "px");
			}, [open, state.groups, query]);

			// Scroll the active model into view when the menu opens.
			react.useEffect(function() {
				if (!open || !groupsRef.current) return;
				var groupsEl = groupsRef.current;
				var active = groupsEl.querySelector('.dsh-ms-option[aria-checked="true"]');
				if (active) {
					// Let layout settle before scrolling (sticky headers etc.)
					requestAnimationFrame(function() {
						if (typeof active.scrollIntoView === "function") {
							active.scrollIntoView({ block: "nearest" });
						}
					});
				}
			}, [open, state.groups, query, collapsed]);

			// Close on outside click
			react.useEffect(function() {
				if (!open) return;
				function handleMouseDown(e) {
					if (rootRef.current && !rootRef.current.contains(e.target)) {
						setOpen(false);
						setQuery("");
					}
				}
				document.addEventListener("mousedown", handleMouseDown);
				return function() { document.removeEventListener("mousedown", handleMouseDown); };
			}, [open]);

			if (!available) return null;

			// Filter models
			var filtered = react.useMemo(function() {
				if (!state.groups) return [];
				if (!query.trim()) return state.groups;
				var q = query.toLowerCase();
				return state.groups.map(function(group) {
					var matchedModels = (group.models || []).filter(function(m) {
						return (m.name && m.name.toLowerCase().includes(q)) ||
							(m.id && m.id.toLowerCase().includes(q)) ||
							(group.name && group.name.toLowerCase().includes(q));
					});
					if (matchedModels.length === 0) return null;
					return { id: group.id, name: group.name, models: matchedModels };
				}).filter(Boolean);
			}, [state.groups, query]);

			// Build the display list: "Recent" section first (when not
			// searching), then provider groups, honoring collapsed state.
			var displayGroups = react.useMemo(function() {
				if (!state.groups) return [];
				var base = query.trim() ? filtered : state.groups;
				var out = [];
				// Recent section only when idle (no query) and we have recents.
				if (!query.trim() && recent.length > 0) {
					var recentModels = [];
					recent.forEach(function(r) {
						var g = (state.groups || []).find(function(x) { return x.id === r.provider; });
						if (!g) return;
						var m = (g.models || []).find(function(x) { return x.id === r.model; });
						if (m) recentModels.push({ provider: r.provider, model: m });
					});
					if (recentModels.length > 0) {
						out.push({ id: "__recent__", name: "Recent", models: recentModels, isRecent: true });
					}
				}
				(base || []).forEach(function(group) {
					out.push(group);
				});
				return out;
			}, [filtered, state.groups, query, recent, collapsed]);

			// Flatten for count
			var allModels = react.useMemo(function() {
				if (!state.groups) return [];
				var flat = [];
				state.groups.forEach(function(g) {
					(g.models || []).forEach(function(m) { flat.push(m); });
				});
				return flat;
			}, [state.groups]);

			// Count of currently visible (non-collapsed) model rows.
			var visibleCount = react.useMemo(function() {
				return displayGroups.reduce(function(acc, g) {
					if (collapsed[g.id]) return acc;
					return acc + (g.models ? g.models.length : 0);
				}, 0);
			}, [displayGroups, collapsed]);

			// Select model
			var selectModel = react.useCallback(function(provider, modelId) {
				if (!select || busy) return;
				setBusy(true);
				select({ provider: provider, model: modelId, effort: effort }).then(function(accepted) {
					setBusy(false);
					if (accepted) {
						pushRecent(provider, modelId);
						setOpen(false);
						setQuery("");
						if (triggerRef.current) triggerRef.current.focus();
					}
				}, function() { setBusy(false); });
			}, [select, busy, effort, recent, pushRecent]);

			// Get current model name
			var currentName = react.useMemo(function() {
				if (!state.current) return "Select model";
				var currentModel = state.current.model;
				if (!state.groups) return currentModel || "Select model";
				for (var i = 0; i < state.groups.length; i++) {
					for (var j = 0; j < (state.groups[i].models || []).length; j++) {
						if (state.groups[i].id === state.current.provider && state.groups[i].models[j].id === currentModel) {
							return state.groups[i].models[j].name;
						}
					}
				}
				return currentModel || "Select model";
			}, [state.current, state.groups]);

			function moveFocus(offset) {
				var items = itemRefs.current.filter(Boolean);
				if (items.length === 0) return;
				var active = items.findIndex(function(n) { return n === document.activeElement; });
				var start = active < 0 ? 0 : active;
				var next = (start + offset + items.length) % items.length;
				if (items[next]) items[next].focus();
			}

			// Jump focus: Home/End to first/last, PageUp/PageDown by a page
			// (approximated as 6 rows, like a menu).
			function jumpFocus(target) {
				var items = itemRefs.current.filter(Boolean);
				if (items.length === 0) return;
				var at = items.findIndex(function(n) { return n === document.activeElement; });
				if (at < 0) at = 0;
				var next;
				if (target === "home") next = 0;
				else if (target === "end") next = items.length - 1;
				else if (target === "pageup") next = Math.max(0, at - 6);
				else next = Math.min(items.length - 1, at + 6);
				if (items[next]) items[next].focus();
			}

			function show() {
				setOpen(true);
				if (load) load();
			}

			function closeMenu(restoreFocus) {
				setOpen(false);
				setQuery("");
				if (restoreFocus && triggerRef.current) triggerRef.current.focus();
			}

			function onRootKeyDown(e) {
				if (e.key === "Escape" && open) {
					e.preventDefault();
					closeMenu(true);
					return;
				}
				// Arrow navigation only when focus is on an option (the search
				// input owns ArrowDown to dive into the list). Home/End/Page
				// work from anywhere inside the menu.
				if (open) {
					if (e.key === "Home") { e.preventDefault(); jumpFocus("home"); return; }
					if (e.key === "End") { e.preventDefault(); jumpFocus("end"); return; }
					if (e.key === "PageUp") { e.preventDefault(); jumpFocus("pageup"); return; }
					if (e.key === "PageDown") { e.preventDefault(); jumpFocus("pagedown"); return; }
				}
				if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target !== inputRef.current) {
					e.preventDefault();
					moveFocus(e.key === "ArrowDown" ? 1 : -1);
				}
			}

			// Build elements
			var children = [];

			// Trigger button (ToggleButton) — shows model name + effort badge
			var triggerChildren = [
				react.createElement("span", { key: "label", className: "dsh-ms-triggerLabel" }, currentName),
			];
			// Inline effort badge when a model is selected
			if (state.current) {
				var effortLabels2 = { low: "Low", medium: "Med", high: "High", max: "Max" };
				var chipEffort = state.current.effort || effort;
				triggerChildren.push(react.createElement("span", {
					key: "effort",
					className: "dsh-ms-effortBadge",
					"aria-label": "Effort: " + effortLabels2[chipEffort],
				},
					react.createElement("span", { className: "dsh-ms-effortDot" }),
					effortLabels2[chipEffort]
				));
			}
			triggerChildren.push(react.createElement("span", { key: "chevron", className: "dsh-ms-triggerIcon" }, iconChevron(open)));

			children.push(react.createElement("button", {
				key: "trigger",
				ref: triggerRef,
				type: "button",
				className: "dsh-ms-trigger",
				disabled: locked,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				"aria-controls": open ? menuId : undefined,
				"aria-label": currentName === "Select model" ? "Select model" : currentName,
				title: currentName,
				onClick: function() {
					if (open) closeMenu(false);
					else show();
				},
			}, triggerChildren));

			// Dropdown
			if (open) {
				var dropdownChildren = [];

				// Search input
				var hasQuery = query.length > 0;
				dropdownChildren.push(react.createElement("div", { key: "search", className: "dsh-ms-search" },
					react.createElement("input", {
						ref: inputRef,
						type: "text",
						className: "dsh-ms-input",
						role: "combobox",
						"aria-expanded": true,
						"aria-controls": menuId,
						"aria-autocomplete": "list",
						"aria-label": "Search models",
						placeholder: "Search " + allModels.length + " models...",
						value: query,
						onChange: function(e) { setQuery(e.target.value); },
						onKeyDown: function(e) {
							if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
						},
						style: { boxSizing: "border-box" },
					}),
					hasQuery ? react.createElement("button", {
						key: "clear",
						type: "button",
						className: "dsh-ms-clear",
						"aria-label": "Clear search",
						onClick: function() { setQuery(""); if (inputRef.current) inputRef.current.focus(); },
					}, iconX()) : null
				));

				// Effort selector
				var effortLevels = ["low", "medium", "high", "max"];
				var effortLabels = { low: "Low", medium: "Medium", high: "High", max: "Max" };
				var effortChildren = [
					react.createElement("div", { key: "label", className: "dsh-ms-effortLabel" }, "Reasoning effort"),
					react.createElement("div", { key: "group", className: "dsh-ms-effortGroup", role: "radiogroup", "aria-label": "Reasoning effort" },
						effortLevels.map(function(level) {
							return react.createElement("button", {
								key: level,
								type: "button",
								role: "radio",
								"aria-checked": effort === level,
								className: "dsh-ms-effortBtn",
								onClick: function() { setEffort(level); },
							}, effortLabels[level]);
						})
					),
				];
				dropdownChildren.push(react.createElement("div", { key: "effort", className: "dsh-ms-effort" }, effortChildren));

				// Error
				if (state.error) {
					dropdownChildren.push(react.createElement("div", { key: "error", className: "dsh-ms-error" },
						react.createElement("span", null, state.error),
						react.createElement("button", {
							type: "button",
							className: "dsh-ms-retry",
							onClick: function() { if (load) load(); },
						}, "Retry")
					));
				}

				// Model list
				var listChildren = [];

				if (state.status === "loading" && allModels.length === 0) {
					// Shimmer skeleton when no data yet.
					listChildren.push(react.createElement("div", { key: "skeleton", className: "dsh-ms-skeleton" },
						react.createElement("div", { className: "dsh-ms-skelRow" }),
						react.createElement("div", { className: "dsh-ms-skelRow" }),
						react.createElement("div", { className: "dsh-ms-skelRow" }),
						react.createElement("div", { className: "dsh-ms-skelRow" })
					));
				} else if (displayGroups.length === 0) {
					listChildren.push(react.createElement("div", { key: "empty", className: "dsh-ms-empty" },
						query ? 'No models matching "' + query + '"' : "No models available"
					));
				} else {
					displayGroups.forEach(function(group) {
						var isCollapsed = !!collapsed[group.id];
						var groupChildren = [
							react.createElement("button", {
								key: "title",
								type: "button",
								className: "dsh-ms-groupTitle",
								"aria-expanded": !isCollapsed,
								onClick: function() {
									setCollapsed(function(prev) {
										var next = Object.assign({}, prev);
										if (next[group.id]) delete next[group.id];
										else next[group.id] = true;
										return next;
									});
								},
							},
								react.createElement("span", {
									className: "dsh-ms-groupChevron" + (isCollapsed ? "" : " dsh-ms-groupChevronOpen"),
								}, iconChevronRight()),
								react.createElement("span", { className: "dsh-ms-groupTitleText" }, group.name),
								react.createElement("span", { className: "dsh-ms-groupCount" }, String(group.models.length))
							),
						];
						if (!isCollapsed) {
							group.models.forEach(function(m) {
								var modelObj = group.isRecent ? m.model : m;
								var providerId = group.isRecent ? m.provider : group.id;
								var isActive = state.current && state.current.provider === providerId && state.current.model === modelObj.id;
								groupChildren.push(react.createElement("button", {
									key: (group.id || "") + ":" + modelObj.id,
									ref: makeItemRef(),
									type: "button",
									role: "menuitemradio",
									"aria-checked": isActive,
									className: "dsh-ms-option",
									title: modelObj.name,
									disabled: busy,
									onClick: function() { selectModel(providerId, modelObj.id); },
									onKeyDown: function(e) {
										if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
										else if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
										else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectModel(providerId, modelObj.id); }
									},
								},
									react.createElement("span", { className: "dsh-ms-optionCopy" },
										react.createElement("span", { className: "dsh-ms-modelName" }, modelObj.name),
										modelObj.id ? react.createElement("span", { className: "dsh-ms-modelId" }, modelObj.id) : null
									),
									react.createElement("span", { className: "dsh-ms-check" }, isActive ? iconCheck() : null)
								));
							});
						}
						listChildren.push(react.createElement("section", { key: group.id, role: "group", "aria-label": group.name }, groupChildren));
					});
				}

				dropdownChildren.push(react.createElement("div", { key: "list", id: menuId, className: "dsh-ms-groups", role: "menu", ref: groupsRef }, listChildren));

				// Result count footer — live filtered total + clear-search action.
				if (state.status === "ready" && allModels.length > 0) {
					dropdownChildren.push(react.createElement("div", { key: "count", className: "dsh-ms-count" },
						react.createElement("span", null,
							query.trim() ? (visibleCount + " of " + allModels.length + " models") : (allModels.length + " models")
						),
						query.trim() ? react.createElement("button", {
							type: "button",
							className: "dsh-ms-countClear",
							onClick: function() { setQuery(""); if (inputRef.current) inputRef.current.focus(); },
						}, "Clear") : null
					));
				}

				var menuClass = "dsh-ms-menu" + (menuPos === "down" ? " dsh-ms-menuDown" : "");
				var menuStyle = menuMaxH ? { "--dsh-ms-maxh": menuMaxH } : undefined;
			children.push(react.createElement("div", { key: "dropdown", className: menuClass, style: menuStyle, "data-maxh": menuMaxH ? "" : undefined }, dropdownChildren));
			}

			return react.createElement("div", { ref: rootRef, className: "dsh-ms-root", onKeyDown: onRootKeyDown }, children);
		}

		/**
		 * Plugin apply: register in the model slot.
		 * Uses connection.api.sessions for RPC, with the correct session.models
		 * and session.selectModel signatures (matching @deepseek-ai/dsh-client-ui-model-selection).
		 */
		function apply(ctx) {
			var slots = ctx.slots;
			if (!slots) return;

			var connection = ctx.connection;
			if (!connection || !connection.api || !connection.api.sessions) return;

			var sessions = ctx.sessions;
			var sessionsApi = connection.api.sessions;

			// Create a simple directory store per session
			var directories = {};

			function getDirectory(sessionId) {
				if (directories[sessionId]) return directories[sessionId];

				// Stable snapshot cache: React useSyncExternalStore compares
				// getSnapshot results with Object.is; a fresh object per call
				// would re-render forever (React #185).
				var snapshot = { current: null, groups: [], status: "idle", error: null };

				var store = {
					current: null,
					groups: [],
					status: "idle",
					error: null,
					subscribers: new Set(),
					subscribe: function(fn) {
						store.subscribers.add(fn);
						return function() { store.subscribers.delete(fn); };
					},
					// Stable snapshot: return the SAME object reference until state
					// changes. React useSyncExternalStore compares with Object.is;
					// a fresh object per call would loop forever (React #185).
					getSnapshot: function() {
						if (
							snapshot.current !== store.current ||
							snapshot.groups !== store.groups ||
							snapshot.status !== store.status ||
							snapshot.error !== store.error
						) {
							snapshot = { current: store.current, groups: store.groups, status: store.status, error: store.error };
						}
						return snapshot;
					},
					notify: function() {
						store.subscribers.forEach(function(fn) { fn(); });
					},
					load: async function() {
						store.status = "loading";
						store.error = null;
						store.notify();
						try {
							var result = await sessionsApi.models({ sessionId: sessionId });
							if (result && result.result && result.result.ok) {
								var data = result.result.value;
								store.current = data.current || null;
								store.groups = data.groups || [];
								store.status = "ready";
							} else if (result && result.result && !result.result.ok) {
								store.status = "error";
								store.error = (result.result.error && result.result.error.message) || "Failed to load models";
							} else {
								store.status = "error";
								store.error = "Failed to load models";
							}
						} catch (e) {
							store.status = "error";
							store.error = (e && e.message) || "Failed to load models";
						}
						store.notify();
					},
					select: async function(selection) {
						try {
							var result = await sessionsApi.selectModel({
								sessionId: sessionId,
								provider: selection.provider,
								model: selection.model,
							});
							if (result && result.result && result.result.ok) {
								// The host returns the accepted selection under .selected;
								// fall back to the requested selection when absent.
								var selected = (result.result.value && result.result.value.selected) || selection;
								// Attach effort level to current selection
								if (selection.effort) selected = Object.assign({}, selected, { effort: selection.effort });
								store.current = selected;
								store.notify();
								return true;
							}
							if (result && result.result && !result.result.ok) {
								store.error = (result.result.error && result.result.error.message) || "Failed to select model";
							}
							store.notify();
							return false;
						} catch (e) {
							store.error = (e && e.message) || "Failed to select model";
							store.notify();
							return false;
						}
					}
				};

				directories[sessionId] = store;
				return store;
			}

			slots.inject("conversation.input.model", function() {
				return slots.register({
					name: "conversation.input.model",
					inject: function(sessionId) {
						var directory = getDirectory(sessionId);
						var available = sessions ? sessions.subagentAddress(sessionId) === undefined : true;
						return {
							available: available,
							directory: directory,
							load: function() {
								if (available) directory.load().catch(function() {});
							},
							select: function(selection) {
								return available ? directory.select(selection) : Promise.resolve(false);
							}
						};
					}
				}, ModelSearch);
			});
		}

		exports.apply = apply;
		exports.inject = ["commandUi", "connection", "locale", "sessions", "slots", "remote"];
		exports.ModelSearch = ModelSearch;
		return module.exports;
	}
});
