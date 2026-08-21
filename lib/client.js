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
			".dsh-ms-chevronOpen{transform:rotate(180deg);}",

			/* Menu card — same surface tokens as the Menu primitive so every",
			 * dropdown in the harness reads as one material. */
			".dsh-ms-menu{position:absolute;right:0;bottom:calc(100% + 8px);z-index:20;",
				"display:flex;flex-direction:column;width:max-content;",
				"min-width:min(240px,calc(100vw - 32px));max-width:min(420px,calc(100vw - 32px));",
				"max-height:min(360px,calc(100vh - 96px));overflow:hidden;padding:4px;",
				"border:1px solid var(--dsw-alias-border-inverted);border-radius:12px;",
				"background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);",
				"color:var(--dsw-alias-label-primary);",
				"--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);",
				"--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);}",

			/* Search field — native input skinned with the harness tokens. */
			".dsh-ms-search{padding:6px;}",
			".dsh-ms-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;",
				"border:1px solid var(--dsw-alias-border-inverted);border-radius:8px;",
				"background:transparent;color:var(--dsw-alias-label-primary);",
				"font-size:13px;line-height:20px;font-family:inherit;outline:none;}",
			".dsh-ms-input::placeholder{color:var(--dsw-alias-label-tertiary);}",
			".dsh-ms-input:focus-visible{border-color:transparent;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}",

			".dsh-ms-status,.dsh-ms-empty{padding:10px;color:var(--dsw-alias-label-tertiary);",
				"font-size:13px;line-height:20px;}",
			".dsh-ms-error{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;",
				"margin-bottom:4px;padding:7px 8px;border-radius:8px;",
				"background:var(--dsw-alias-interactive-bg-hover-danger);",
				"color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;}",
			".dsh-ms-retry{flex:0 0 auto;padding:0;border:none;background:transparent;color:inherit;",
				"font:inherit;font-weight:600;cursor:pointer;}",

			".dsh-ms-groups{min-height:0;overflow-y:auto;}",
			".dsh-ms-group+.dsh-ms-group{margin-top:4px;}",
			".dsh-ms-groupTitle{position:sticky;top:0;z-index:1;padding:5px 8px 3px;",
				"background:var(--dsw-specific-menu);color:var(--dsw-alias-label-tertiary);",
				"font-size:12px;line-height:18px;font-weight:500;}",
			".dsh-ms-groupTitle:first-child{margin-top:-4px;}",

			/* Option row — 38px, 10px radius, hover/focus surface, trailing check. */
			".dsh-ms-option{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:auto;",
				"min-width:100%;min-height:38px;padding:6px 8px;border:none;border-radius:10px;",
				"outline:none;background:transparent;color:inherit;text-align:left;cursor:pointer;",
				"font-size:14px;line-height:20px;font-weight:500;font-family:inherit;}",
			".dsh-ms-option:hover:not(:disabled),.dsh-ms-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover);}",
			".dsh-ms-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default;}",
			".dsh-ms-optionCopy{display:flex;flex:1;flex-direction:column;min-width:0;}",
			".dsh-ms-modelName{overflow:hidden;color:inherit;font-size:14px;line-height:20px;",
				"font-weight:500;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-modelId{overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:12px;",
				"line-height:18px;text-overflow:ellipsis;white-space:nowrap;}",
			".dsh-ms-check{display:grid;place-items:center;flex:0 0 18px;color:var(--dsw-alias-label-primary);}",
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
			var inputRef = react.useRef(null);
			var rootRef = react.useRef(null);
			var triggerRef = react.useRef(null);
			var itemRefs = react.useRef([]);
			var menuId = react.useId ? react.useId() + "-menu" : "dsh-ms-menu";

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

			// Flatten for count
			var allModels = react.useMemo(function() {
				if (!state.groups) return [];
				var flat = [];
				state.groups.forEach(function(g) {
					(g.models || []).forEach(function(m) { flat.push(m); });
				});
				return flat;
			}, [state.groups]);

			// Select model
			var selectModel = react.useCallback(function(provider, modelId) {
				if (!select || busy) return;
				setBusy(true);
				select({ provider: provider, model: modelId }).then(function(accepted) {
					setBusy(false);
					if (accepted) {
						setOpen(false);
						setQuery("");
						if (triggerRef.current) triggerRef.current.focus();
					}
				}, function() { setBusy(false); });
			}, [select, busy]);

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
				// input owns ArrowDown to dive into the list).
				if ((e.key === "ArrowDown" || e.key === "ArrowUp") && e.target !== inputRef.current) {
					e.preventDefault();
					moveFocus(e.key === "ArrowDown" ? 1 : -1);
				}
			}

			// Build elements
			var children = [];

			// Trigger button (ToggleButton)
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
			},
				react.createElement("span", { key: "label", className: "dsh-ms-triggerLabel" }, currentName),
				iconChevron(open)
			));

			// Dropdown
			if (open) {
				var dropdownChildren = [];

				// Search input
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
					})
				));

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
					listChildren.push(react.createElement("div", { key: "loading", className: "dsh-ms-status" }, "Loading models..."));
				} else if (filtered.length === 0) {
					listChildren.push(react.createElement("div", { key: "empty", className: "dsh-ms-empty" },
						query ? 'No models matching "' + query + '"' : "No models available"
					));
				} else {
					filtered.forEach(function(group) {
						var groupChildren = [
							react.createElement("div", { key: "title", className: "dsh-ms-groupTitle" }, group.name),
						];
						group.models.forEach(function(m) {
							var isActive = state.current && state.current.provider === group.id && state.current.model === m.id;
							groupChildren.push(react.createElement("button", {
								key: m.id,
								ref: makeItemRef(),
								type: "button",
								role: "menuitemradio",
								"aria-checked": isActive,
								className: "dsh-ms-option",
								title: m.name,
								disabled: busy,
								onClick: function() { selectModel(group.id, m.id); },
								onKeyDown: function(e) {
									if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
									else if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
									else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectModel(group.id, m.id); }
								},
							},
								react.createElement("span", { className: "dsh-ms-optionCopy" },
									react.createElement("span", { className: "dsh-ms-modelName" }, m.name),
									m.id ? react.createElement("span", { className: "dsh-ms-modelId" }, m.id) : null
								),
								react.createElement("span", { className: "dsh-ms-check" }, isActive ? iconCheck() : null)
							));
						});
						listChildren.push(react.createElement("section", { key: group.id, role: "group", "aria-label": group.name }, groupChildren));
					});
				}

				dropdownChildren.push(react.createElement("div", { key: "list", id: menuId, className: "dsh-ms-groups", role: "menu" }, listChildren));

				children.push(react.createElement("div", { key: "dropdown", className: "dsh-ms-menu" }, dropdownChildren));
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
								store.current = (result.result.value && result.result.value.selected) || selection;
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
