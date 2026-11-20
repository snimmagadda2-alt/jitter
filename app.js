/* ==========================================================================
   JitterDev — workbench logic
   Part 1: language catalog, snippet tables, file model, tabs, explorer
   ========================================================================== */

"use strict";

const CDN = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/";
CodeMirror.modeURL = CDN + "mode/%N/%N.min.js";

/* ---------------------------------- data --------------------------------- */

const PLAIN = { name: "Plain Text", mime: "text/plain", mode: "null", ext: ["txt", "log"] };

const HTML_TAGS = (
  "html head title base meta link style script body header nav main section article aside footer " +
  "h1 h2 h3 h4 h5 h6 hgroup address p hr pre blockquote ol ul menu li dl dt dd figure figcaption " +
  "div a em strong small s cite q dfn abbr ruby rt rp data time code var samp kbd sub sup i b u mark " +
  "bdi bdo span br wbr ins del picture source img iframe embed object param video audio track map area " +
  "table caption colgroup col tbody thead tfoot tr td th form label input button select datalist " +
  "optgroup option textarea output progress meter fieldset legend details summary dialog slot template " +
  "canvas svg path circle ellipse rect line polyline polygon g defs symbol use text tspan marker " +
  "linearGradient radialGradient stop filter feGaussianBlur clipPath mask pattern foreignObject"
).split(" ");

const HTML_ATTRS = (
  "class id style title role hidden tabindex lang dir accesskey contenteditable draggable spellcheck " +
  "href src srcset alt target rel download type name value placeholder disabled readonly required " +
  "checked selected multiple min max step pattern autocomplete autofocus form action method enctype " +
  "for accept accept-charset charset http-equiv content width height loading decoding crossorigin " +
  "referrerpolicy integrity sandbox allow seamless srcdoc poster preload autoplay loop muted controls " +
  "playsinline defer async nomodule nonce media sizes open start reversed scope colspan rowspan headers " +
  "datetime cite span slot part is aria-label aria-hidden aria-live aria-expanded aria-controls " +
  "onclick onchange oninput onsubmit onkeydown onkeyup onfocus onblur onmouseover"
).split(" ");

const CSS_PROPS = (
  "display position top right bottom left inset float clear z-index overflow overflow-x overflow-y " +
  "width min-width max-width height min-height max-height margin margin-top margin-right margin-bottom " +
  "margin-left padding padding-top padding-right padding-bottom padding-left gap row-gap column-gap " +
  "flex flex-direction flex-wrap flex-flow flex-grow flex-shrink flex-basis justify-content align-items " +
  "align-content align-self order grid grid-template-columns grid-template-rows grid-template-areas " +
  "grid-column grid-row grid-area place-items place-content column-count columns font font-family " +
  "font-size font-weight font-style font-variant line-height letter-spacing word-spacing text-align " +
  "text-decoration text-transform text-shadow text-overflow text-indent white-space word-break " +
  "word-wrap overflow-wrap vertical-align color background background-color background-image " +
  "background-position background-size background-repeat background-clip background-origin border " +
  "border-width border-style border-color border-radius border-top border-right border-bottom " +
  "border-left box-shadow box-sizing outline outline-offset cursor opacity filter transform " +
  "transform-origin transition transition-property transition-duration transition-timing-function " +
  "animation animation-name animation-duration animation-delay animation-iteration-count " +
  "animation-timing-function animation-fill-mode content quotes list-style list-style-type " +
  "object-fit object-position aspect-ratio resize user-select pointer-events visibility scroll-behavior " +
  "mix-blend-mode backdrop-filter will-change grid-auto-flow isolation accent-color caret-color"
).split(" ");

const SNIPPETS = {
  htmlmixed: [
    { label: "!", insert: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>$0</title>\n</head>\n<body>\n  \n</body>\n</html>', detail: "HTML boilerplate" },
    { label: "script", insert: '<script src="$0"><\/script>', detail: "script tag" },
    { label: "link", insert: '<link rel="stylesheet" href="$0" />', detail: "stylesheet link" },
    { label: "img", insert: '<img src="$0" alt="" />', detail: "image" },
    { label: "ul>li", insert: "<ul>\n  <li>$0</li>\n</ul>", detail: "list" }
  ],
  javascript: [
    { label: "clg", insert: "console.log($0)", detail: "log to console" },
    { label: "fn", insert: "function name($1) {\n  $0\n}", detail: "function declaration" },
    { label: "afn", insert: "const name = ($1) => {\n  $0\n};", detail: "arrow function" },
    { label: "fori", insert: "for (let i = 0; i < $1.length; i++) {\n  $0\n}", detail: "indexed for loop" },
    { label: "foreach", insert: "for (const item of items) {\n  $0\n}", detail: "for…of loop" },
    { label: "try", insert: "try {\n  $1\n} catch (error) {\n  console.error(error);\n}", detail: "try / catch" },
    { label: "imp", insert: "import $1 from \"$0\";", detail: "ES import" },
    { label: "promise", insert: "await $0;", detail: "await" },
    { label: "cls", insert: "class Name {\n  constructor() {\n    $0\n  }\n}", detail: "class" }
  ],
  python: [
    { label: "main", insert: 'def main():\n    $0\n\n\nif __name__ == "__main__":\n    main()', detail: "entry point" },
    { label: "def", insert: "def name(args):\n    $0", detail: "function" },
    { label: "cls", insert: "class Name:\n    def __init__(self):\n        $0", detail: "class" },
    { label: "forin", insert: "for item in items:\n    $0", detail: "for loop" },
    { label: "try", insert: "try:\n    $1\nexcept Exception as error:\n    print(error)", detail: "try / except" }
  ],
  clike: [
    { label: "main", insert: "int main() {\n  $0\n  return 0;\n}", detail: "main function" },
    { label: "for", insert: "for (int i = 0; i < n; i++) {\n  $0\n}", detail: "for loop" },
    { label: "if", insert: "if (condition) {\n  $0\n}", detail: "if block" }
  ],
  "c++": [
    { label: "main", insert: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello World!" << endl;\n  return 0;\n}', detail: "C++ program" },
    { label: "cout", insert: "std::cout << $0 << std::endl;", detail: "print to stdout" }
  ],
  "c#": [
    { label: "cw", insert: "Console.WriteLine($0);", detail: "write line" },
    { label: "main", insert: 'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello World!");\n  }\n}', detail: "C# program" },
    { label: "prop", insert: "public string Name { get; set; }", detail: "auto property" }
  ],
  java: [
    { label: "main", insert: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}', detail: "Java program" },
    { label: "sout", insert: "System.out.println($0);", detail: "print line" }
  ],
  rust: [
    { label: "main", insert: 'fn main() {\n    println!("Hello World!");\n}', detail: "Rust program" },
    { label: "fn", insert: "fn name(args) -> Type {\n    $0\n}", detail: "function" },
    { label: "struct", insert: "#[derive(Debug)]\nstruct Name {\n    field: Type,\n}", detail: "struct" },
    { label: "impl", insert: "impl Name {\n    fn new() -> Self {\n        $0\n    }\n}", detail: "impl block" }
  ],
  go: [
    { label: "main", insert: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello World!")\n}', detail: "Go program" },
    { label: "iferr", insert: "if err != nil {\n\treturn $0\n}", detail: "error guard" },
    { label: "func", insert: "func name(args) {\n\t$0\n}", detail: "function" }
  ],
  php: [
    { label: "php", insert: "<?php\n\n$0", detail: "PHP block" },
    { label: "foreach", insert: "foreach ($items as $item) {\n    $0\n}", detail: "foreach" }
  ],
  ruby: [
    { label: "def", insert: "def name(args)\n  $0\nend", detail: "method" },
    { label: "cls", insert: "class Name\n  def initialize\n    $0\n  end\nend", detail: "class" },
    { label: "each", insert: "items.each do |item|\n  $0\nend", detail: "each block" }
  ],
  css: [
    { label: "flex", insert: "display: flex;\njustify-content: center;\nalign-items: center;", detail: "centered flex" },
    { label: "grid", insert: "display: grid;\ngrid-template-columns: repeat(2, 1fr);\ngap: 16px;", detail: "two column grid" },
    { label: "center", insert: "position: absolute;\ninset: 0;\nmargin: auto;", detail: "absolute centering" },
    { label: "media", insert: "@media (max-width: 768px) {\n  $0\n}", detail: "media query" }
  ],
  sass: [
    { label: "mixin", insert: "@mixin name($args) {\n  $0\n}", detail: "mixin" },
    { label: "flex", insert: "display: flex;\njustify-content: center;\nalign-items: center;", detail: "centered flex" }
  ],
  sql: [
    { label: "select", insert: "SELECT $1\nFROM $0\nWHERE condition;", detail: "select query" },
    { label: "insert", insert: "INSERT INTO table (columns)\nVALUES (values);", detail: "insert" },
    { label: "join", insert: "SELECT *\nFROM a\nJOIN b ON a.id = b.a_id;", detail: "join" }
  ],
  shell: [
    { label: "shebang", insert: "#!/usr/bin/env bash\nset -euo pipefail\n\n$0", detail: "script header" },
    { label: "for", insert: "for item in \"${items[@]}\"; do\n  $0\ndone", detail: "for loop" },
    { label: "if", insert: "if [[ -f \"$1\" ]]; then\n  $0\nfi", detail: "file check" }
  ],
  swift: [
    { label: "func", insert: "func name(args) -> Type {\n    $0\n}", detail: "function" },
    { label: "struct", insert: "struct Name {\n    var value: Type\n}", detail: "struct" }
  ],
  markdown: [
    { label: "h1", insert: "# $0", detail: "heading" },
    { label: "link", insert: "[text](url)", detail: "link" },
    { label: "code", insert: "```js\n$0\n```", detail: "code fence" },
    { label: "todo", insert: "- [ ] $0", detail: "task item" }
  ],
  yaml: [
    { label: "doc", insert: "---\nkey: $0", detail: "document" },
    { label: "list", insert: "items:\n  - $0", detail: "list" }
  ]
};

const KEYWORDS = {
  javascript: "const let var function return if else for while do switch case break continue class extends new this super import export from default async await try catch finally throw typeof instanceof delete void yield of in null undefined true false static get set".split(" "),
  python: "def class return if elif else for while break continue import from as try except finally with lambda yield global nonlocal pass raise assert del in is not and or None True False async await print self".split(" "),
  clike: "int long short char float double void unsigned signed const static struct union enum typedef sizeof return if else for while do switch case break continue goto extern volatile inline class public private protected new delete this namespace using template virtual override".split(" "),
  rust: "fn let mut const static struct enum impl trait use mod pub crate self super return if else match for while loop break continue as in where dyn ref move async await unsafe".split(" "),
  go: "package import func var const type struct interface map chan go defer return if else for range switch case break continue select nil true false".split(" "),
  php: "function class public private protected static return if else elseif foreach for while switch new echo print require include namespace use try catch finally null true false".split(" "),
  ruby: "def class module end if elsif else unless while until for do return yield begin rescue ensure nil true false self attr_accessor".split(" "),
  sql: "SELECT FROM WHERE JOIN INNER LEFT RIGHT OUTER ON GROUP BY ORDER HAVING LIMIT OFFSET INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX AS AND OR NOT NULL DISTINCT COUNT SUM AVG".split(" "),
  shell: "if then else elif fi for while do done case esac function return export local echo cd exit set unset".split(" "),
  swift: "func let var struct class enum protocol extension import return if else guard for while switch case default nil true false self init".split(" "),
  css: "important inherit initial unset auto none flex grid absolute relative fixed sticky".split(" "),
  yaml: "true false null".split(" ")
};

const FILE_ICONS = {
  html: ["<>", "#e06c75"], htm: ["<>", "#e06c75"], vue: ["V", "#42b883"],
  css: ["#", "#61afef"], scss: ["#", "#c678dd"], sass: ["#", "#c678dd"], less: ["#", "#61afef"],
  js: ["JS", "#e5c07b"], mjs: ["JS", "#e5c07b"], cjs: ["JS", "#e5c07b"], jsx: ["JS", "#61dafb"],
  ts: ["TS", "#4aa5f0"], tsx: ["TS", "#4aa5f0"], json: ["{}", "#e5c07b"],
  py: ["Py", "#61afef"], rb: ["Rb", "#e06c75"], php: ["P", "#c678dd"],
  c: ["C", "#61afef"], h: ["H", "#61afef"], cpp: ["C+", "#4aa5f0"], cc: ["C+", "#4aa5f0"], hpp: ["H+", "#4aa5f0"],
  cs: ["C#", "#56b6c2"], java: ["J", "#e06c75"], go: ["Go", "#56b6c2"], rs: ["Rs", "#e5c07b"],
  swift: ["Sw", "#e06c75"], kt: ["Kt", "#c678dd"], sh: ["$", "#98c379"], bash: ["$", "#98c379"],
  sql: ["DB", "#56b6c2"], md: ["M", "#98c379"], txt: ["T", "#abb2bf"], yml: ["Y", "#e06c75"],
  yaml: ["Y", "#e06c75"], toml: ["T", "#e06c75"], xml: ["<>", "#e06c75"], svg: ["<>", "#e06c75"]
};

const LANGUAGES = (function buildLanguages() {
  const list = [];
  const names = new Set();
  (CodeMirror.modeInfo || []).forEach(function (info) {
    const mime = info.mime || (info.mimes && info.mimes[0]);
    if (!info.mode || info.mode === "null" || !mime || names.has(info.name)) return;
    names.add(info.name);
    list.push({ name: info.name, mime: mime, mode: info.mode, ext: (info.ext || []).slice() });
  });
  [
    { name: "JavaScript React", mime: "text/jsx", mode: "jsx", ext: ["jsx"] },
    { name: "TypeScript React", mime: "text/typescript-jsx", mode: "javascript", ext: ["tsx"] },
    { name: "JSON with Comments", mime: "application/ld+json", mode: "javascript", ext: ["jsonc", "jsonl"] },
    { name: "Swift", mime: "text/x-swift", mode: "swift", ext: ["swift"] },
    { name: "SCSS", mime: "text/x-scss", mode: "sass", ext: ["scss"] },
    { name: "Dockerfile", mime: "text/x-dockerfile", mode: "dockerfile", ext: ["dockerfile"] },
    { name: "Plain Text", mime: "text/plain", mode: "null", ext: ["txt", "log"] }
  ].forEach(function (extra) {
    if (names.has(extra.name)) return;
    names.add(extra.name);
    list.push(extra);
  });
  list.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return list;
})();

const EXT_TO_LANG = {};
LANGUAGES.forEach(function (lang) {
  lang.ext.forEach(function (ext) {
    const key = String(ext).toLowerCase();
    if (!EXT_TO_LANG[key]) EXT_TO_LANG[key] = lang;
  });
});

/* --------------------------------- state --------------------------------- */

const settings = { fontSize: 14, wordWrap: false, minimap: true, sidebar: true, panel: true };
const state = { files: {}, tabs: [], active: null };
let editor = null;
let hintTimer = 0;
let minimapFrame = 0;

const $ = function (id) { return document.getElementById(id); };
const esc = function (value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

function iconFor(path) {
  const ext = path.split(".").pop().toLowerCase();
  const icon = FILE_ICONS[ext];
  if (!icon) return '<span class="ficon" style="color:#8f8fa6">•</span>';
  return '<span class="ficon" style="color:' + icon[1] + '">' + esc(icon[0]) + "</span>";
}

function langForPath(path) {
  const name = path.split("/").pop();
  const ext = name.indexOf(".") === -1 ? name.toLowerCase() : name.split(".").pop().toLowerCase();
  return EXT_TO_LANG[ext] || PLAIN;
}

function activeFile() {
  return state.active ? state.files[state.active] : null;
}

function modeSpec(lang) {
  if (!lang || lang.mode === "null") return "text/plain";
  if (CodeMirror.findModeByMIME(lang.mime)) return lang.mime;
  return CodeMirror.modes[lang.mode] ? lang.mode : "text/plain";
}

/* ------------------------------- seed files ------------------------------- */

const SEEDS = [
  {
    path: "tutorial.txt",
    content: [
      "JitterDev — editor tutorial",
      "===========================",
      "",
      "Welcome to JitterDev. The workspace starts with this one text file so you",
      "can learn the editor before you write anything. You can delete it whenever",
      "you like: right-click it in the Explorer and choose Delete File, or use",
      "File > Delete File. File > Restore Deleted Files brings it back later.",
      "",
      "1. The workbench",
      "----------------",
      "Title bar     Menus, the command box and the link to the home page.",
      "Activity bar  Explorer, Search, Source Control, Run and Language packs.",
      "Side bar      The tree for the active view. Drag its edge to resize it.",
      "Editor        Tabs, breadcrumbs, line numbers, fold arrows and a minimap.",
      "Panel         Problems, Output and Terminal. Ctrl+J shows or hides it.",
      "Status bar    Branch, problems, cursor position, indentation and language.",
      "",
      "2. Files",
      "--------",
      "Ctrl+N            New file. Folders work too, for example src/app.ts.",
      "Ctrl+O            Open a file from disk.",
      "Ctrl+S            Save. The first save asks where to put the file.",
      "Ctrl+Shift+S      Save a copy.",
      "Ctrl+W            Close the current tab.",
      "Right-click file  Open or delete it from the Explorer.",
      "",
      "3. Language modes",
      "-----------------",
      "JitterDev ships with 160 language modes: HTML, CSS, JavaScript,",
      "TypeScript, C, C++, C#, Java, Python, Rust, Go, Swift, PHP, Ruby, SQL,",
      "shell, YAML and many more. The mode follows the file extension.",
      "To switch it, click the language name in the status bar, press Ctrl+K, or",
      "pick one in the Language packs view.",
      "",
      "4. Suggestions",
      "--------------",
      "Ctrl+Space   Ask for suggestions at the cursor.",
      "Type <       Every HTML tag is suggested. Keep typing to narrow the list.",
      "Tab          Accept the highlighted suggestion.",
      "Shift+Up     Open the suggestion list, then scroll it with Up and Down.",
      "Shift+Down   Open the list as well, or move down when it is already open.",
      "Enter        Accept the suggestion too.",
      "Esc          Close the list.",
      "",
      "Inside an opening tag you also get attribute suggestions. Snippet labels",
      "such as clg and fori expand when you accept them.",
      "",
      "5. Finding things",
      "-----------------",
      "Ctrl+F        Find in the current file, with case, word and regex toggles.",
      "Ctrl+H        Find and replace.",
      "Ctrl+P        Jump to a file by name.",
      "Ctrl+G        Jump to a line.",
      "Ctrl+Shift+P  Command palette: every command in one searchable list.",
      "",
      "6. Editing",
      "----------",
      "Ctrl+/     Comment or uncomment the selection.",
      "Ctrl+D     Add the next match as another cursor.",
      "Alt+Up     Move the current line up.",
      "Alt+Down   Move the current line down.",
      "Tab        Indent, or accept a suggestion.",
      "Shift+Tab  Outdent.",
      "Ctrl+=     Zoom in.   Ctrl+-  Zoom out.   Ctrl+0  Reset zoom.",
      "",
      "7. Panels and running files",
      "---------------------------",
      "Problems  Lists marker notes in your code and jumps to them.",
      "Output    Shows the result of running a JavaScript file.",
      "Terminal  Try: help, ls, cat <file>, open <file>, run, clear, version.",
      "Ctrl+`      Focus the terminal.",
      "Ctrl+Alt+R  Run the active file.",
      "Ctrl+Alt+V  Live preview of HTML, CSS or JavaScript.",
      "",
      "8. Layout",
      "---------",
      "Ctrl+B  Show or hide the side bar.",
      "Ctrl+J  Show or hide the panel.",
      "The panel button in the tab bar toggles the minimap, and dragging the",
      "minimap scrolls the file.",
      "",
      "That is the whole tour. Delete this file when you no longer need it, and",
      "use File > Restore Deleted Files if you ever want it back."
    ].join("\n")
  }
];

/* ------------------------------- file model ------------------------------- */

function registerFile(path, content, lang) {
  const file = {
    path: path,
    lang: lang || langForPath(path),
    saved: content,
    dirty: false,
    doc: CodeMirror.Doc(content, "text/plain")
  };
  file.doc.on("change", function () {
    const dirty = file.doc.getValue() !== file.saved;
    if (dirty !== file.dirty) {
      file.dirty = dirty;
      renderTabs();
      renderExplorer();
      refreshScm();
    }
    scheduleProblems();
    scheduleMinimap();
  });
  state.files[path] = file;
  return file;
}

const DELETED_KEY = "jitterDeletedFiles";

function deletedSeeds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"));
  } catch (error) {
    return new Set();
  }
}

function rememberDeleted(path, deleted) {
  const set = deletedSeeds();
  if (deleted) set.add(path);
  else set.delete(path);
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch (error) { /* storage blocked */ }
}

function isSeed(path) {
  return SEEDS.some(function (seed) { return seed.path === path; });
}

function showEmpty() {
  state.active = null;
  editor.swapDoc(CodeMirror.Doc("", "text/plain"));
  editor.setOption("mode", "text/plain");
  editor.setOption("placeholder", "No file open. Press Ctrl+N to create a file, or Ctrl+O to open one.");
  renderTabs();
  renderExplorer();
  refreshScm();
  updateBreadcrumbs();
  updateCommandCenter();
  updateStatus();
  scanProblems();
  scheduleMinimap();
}

function deleteFile(path, confirm) {
  const file = state.files[path];
  if (!file) return;
  if (confirm) {
    openDialog("Delete file",
      "<p>Delete <code>" + esc(path) + "</code> from this workspace? This cannot be undone.</p>" +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">' +
      '<button class="btn" id="delete-cancel">Cancel</button>' +
      '<button class="btn primary" id="delete-ok">Delete</button></div>');
    $("delete-cancel").addEventListener("click", closeDialog);
    $("delete-ok").addEventListener("click", function () {
      closeDialog();
      deleteFile(path, false);
    });
    return;
  }
  closePath(path);
  delete state.files[path];
  if (isSeed(path)) rememberDeleted(path, true);
  if (!state.tabs.length) showEmpty();
  renderExplorer();
  refreshScm();
  updateBreadcrumbs();
  toast("Deleted " + path);
}

function restoreDeletedFiles() {
  const removed = deletedSeeds();
  const restored = SEEDS.filter(function (seed) { return removed.has(seed.path) && !state.files[seed.path]; });
  restored.forEach(function (seed) {
    registerFile(seed.path, seed.content, langForPath(seed.path));
    rememberDeleted(seed.path, false);
  });
  renderExplorer();
  refreshScm();
  if (!state.tabs.length) {
    if (state.files["tutorial.txt"]) openPath("tutorial.txt");
    else if (!Object.keys(state.files).length) showEmpty();
  }
  toast(restored.length ? "Restored " + restored.length + " file" + (restored.length === 1 ? "" : "s") : "Nothing to restore");
}

function openContextMenu(x, y, path) {
  const menu = $("context-menu");
  menu.innerHTML = '<button data-action="open">Open</button><button data-action="delete">Delete File</button>';
  menu.hidden = false;
  menu.style.left = Math.min(x, window.innerWidth - 190) + "px";
  menu.style.top = Math.min(y, window.innerHeight - 84) + "px";
  menu.onclick = function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    menu.hidden = true;
    if (button.dataset.action === "open") openPath(path);
    if (button.dataset.action === "delete") deleteFile(path, true);
  };
}

function openPath(path) {
  const file = state.files[path];
  if (!file) return;
  if (state.tabs.indexOf(path) === -1) state.tabs.push(path);
  state.active = path;
  editor.swapDoc(file.doc);
  editor.setOption("placeholder", "Start typing. Press Ctrl+Space for suggestions.");
  applyLanguage(file);
  renderTabs();
  renderExplorer();
  updateBreadcrumbs();
  updateStatus();
  updateCommandCenter();
  scanProblems();
  scheduleMinimap();
  editor.focus();
  window.setTimeout(function () { editor.refresh(); }, 0);
}

function closePath(path) {
  const index = state.tabs.indexOf(path);
  if (index === -1) return;
  state.tabs.splice(index, 1);
  if (state.active === path) {
    const next = state.tabs[index] || state.tabs[index - 1];
    state.active = null;
    if (next) {
      openPath(next);
    } else {
      showEmpty();
    }
  } else {
    renderTabs();
  }
}

function applyLanguage(file) {
  const lang = file.lang || PLAIN;
  if (lang.mode === "null") {
    editor.setOption("mode", "text/plain");
    return;
  }
  if (CodeMirror.modes[lang.mode]) {
    editor.setOption("mode", modeSpec(lang));
    return;
  }
  editor.setOption("mode", "text/plain");
  CodeMirror.requireMode(lang.mode, function () {
    if (state.active === file.path) {
      editor.setOption("mode", modeSpec(lang));
      editor.refresh();
    }
  });
}

function setActiveLanguage(lang) {
  const file = activeFile();
  if (!file) {
    toast("Open a file first");
    return;
  }
  file.lang = lang;
  applyLanguage(file);
  renderTabs();
  renderExplorer();
  updateBreadcrumbs();
  updateStatus();
  toast("Language mode: " + lang.name);
}

function newFile(name) {
  const clean = String(name || "").trim().replace(/^\/+/, "");
  const path = clean || "untitled-" + (Object.keys(state.files).length + 1) + ".txt";
  if (state.files[path]) {
    openPath(path);
    return;
  }
  registerFile(path, "");
  openPath(path);
}

/* ------------------------------ editor chrome ----------------------------- */

function renderTabs() {
  const wrap = $("tabs");
  if (!state.tabs.length) {
    wrap.innerHTML = "";
    return;
  }
  wrap.innerHTML = state.tabs.map(function (path) {
    const file = state.files[path];
    const name = path.split("/").pop();
    return (
      '<div class="tab' + (path === state.active ? " active" : "") + '" data-path="' + esc(path) + '" title="' + esc(path) + '">' +
        iconFor(path) +
        '<span class="tab-name">' + esc(name) + "</span>" +
        (file.dirty ? '<span class="tab-xs" title="Unsaved changes">●</span>' : "") +
        '<button class="tab-close" data-close="' + esc(path) + '" title="Close (Ctrl+W)">×</button>' +
      "</div>"
    );
  }).join("");
}

function updateBreadcrumbs() {
  const file = activeFile();
  const box = $("breadcrumbs");
  if (!file) {
    box.innerHTML = "";
    return;
  }
  const parts = file.path.split("/");
  let html = '<span class="crumb" data-crumb="JITTER-WORKSPACE">jitter-workspace</span>';
  parts.forEach(function (part, index) {
    html += '<span class="sep">›</span>';
    const path = parts.slice(0, index + 1).join("/");
    html += '<span class="crumb" data-crumb="' + esc(path) + '">' + esc(part) + "</span>";
  });
      html += '<span class="sep">›</span><span class="crumb" data-lang="1">' + esc(file.lang.name) + "</span>";
  box.innerHTML = html;
}

function updateCommandCenter() {
  const file = activeFile();
  $("command-center-text").textContent = file ? file.path : "jitter-workspace";
}

function renderExplorer() {
  const box = $("view-explorer");
  const files = Object.keys(state.files).map(function (path) { return state.files[path]; });
  const groups = new Map();
  files.forEach(function (file) {
    const cut = file.path.lastIndexOf("/");
    const dir = cut === -1 ? "" : file.path.slice(0, cut);
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(file);
  });

  let html = '<div class="side-section"><span class="chev">▾</span>Jitter workspace</div>';
  if (explorerCreating) {
    html += '<input class="tree-input" id="explorer-new" type="text" placeholder="file name, e.g. src/app.ts" spellcheck="false" />';
  }
  html += rowSet(groups.get("") || []);
  Array.from(groups.keys()).filter(Boolean).sort().forEach(function (dir) {
    html += '<div class="side-section"><span class="chev">▾</span>' + esc(dir) + "</div>";
    html += rowSet(groups.get(dir));
  });
  if (!files.length && !explorerCreating) {
    html += '<div class="side-note">No files in this workspace. Use + to create one, or Ctrl+O to open a file.</div>';
  }
  box.innerHTML = html;

  if (explorerCreating) {
    const input = $("explorer-new");
    input.focus();
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const value = input.value;
        explorerCreating = false;
        newFile(value);
      } else if (event.key === "Escape") {
        explorerCreating = false;
        renderExplorer();
      }
    });
    input.addEventListener("blur", function () {
      if (!explorerCreating) return;
      window.setTimeout(function () {
        if (explorerCreating && document.activeElement !== input) {
          explorerCreating = false;
          renderExplorer();
        }
      }, 120);
    });
  }
}

function rowSet(list) {
  return list.map(function (file) {
    const name = file.path.split("/").pop();
    return (
      '<div class="tree-row' + (file.path === state.active ? " active" : "") + '" data-path="' + esc(file.path) + '" title="' + esc(file.path) + '">' +
        iconFor(file.path) +
        '<span class="fname">' + esc(name) + "</span>" +
        (file.dirty ? '<span class="fmark">M</span>' : "") +
      "</div>"
    );
  }).join("");
}

let explorerCreating = false;

/* ==========================================================================
   Part 2: editor instance, suggestions, find, minimap, status, panels
   ========================================================================== */

function initEditor() {
  editor = CodeMirror($("editor-container"), {
    theme: "jitter",
    lineNumbers: true,
    lineWrapping: settings.wordWrap,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: true,
    autoCloseTags: true,
    matchBrackets: true,
    matchTags: { bothTags: true },
    styleActiveLine: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    placeholder: "Start typing. Press Ctrl+Space for suggestions.",
    scrollbarStyle: "native",
    hintOptions: { hint: jitterHint, completeSingle: false, alignWithWord: true },
    extraKeys: {
      "Ctrl-Space": function (cm) { cm.showHint({ hint: jitterHint, completeSingle: false }); },
      Tab: function (cm) { return handleTab(cm); },
      "Shift-Tab": "indentLess",
      Up: function (cm) { return moveSuggestion(cm, -1); },
      Down: function (cm) { return moveSuggestion(cm, 1); },
      "Shift-Up": function (cm) { return scrollSuggest(cm, -1); },
      "Shift-Down": function (cm) { return scrollSuggest(cm, 1); },
      "Ctrl-S": function () { saveFile(); },
      "Cmd-S": function () { saveFile(); },
      "Ctrl-Shift-S": function () { saveFileAs(); },
      "Ctrl-O": function () { openFile(); },
      "Ctrl-F": function () { openFind(false); },
      "Cmd-F": function () { openFind(false); },
      "Ctrl-H": function () { openFind(true); },
      "Ctrl-G": function () { openPalette("line"); },
      "Ctrl-D": function (cm) { addNextOccurrence(cm); },
      "Ctrl-/": function (cm) { cm.execCommand("toggleComment"); },
      "Ctrl-]": "indentMore",
      "Ctrl-[": "indentLess",
      "Alt-Up": function (cm) { cm.moveLine(-1); },
      "Alt-Down": function (cm) { cm.moveLine(1); },
      Esc: function (cm) { if (cm.state.completionActive) cm.state.completionActive.close(); }
    }
  });

  editor.on("inputRead", function (cm, change) {
    if (change.origin !== "+input") return;
    const typed = change.text.join("");
    if (!typed) return;
    const last = typed.slice(-1);
    if (!/[\w$<@.\-:]/.test(last)) return;
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(function () {
      if (cm.state.completionActive) return;
      cm.showHint({ hint: jitterHint, completeSingle: false });
    }, 70);
  });

  editor.on("cursorActivity", updateStatus);
  editor.on("changes", function () { updateStatus(); scheduleMinimap(); });
  editor.on("scroll", updateMinimapSlider);
  editor.on("refresh", scheduleMinimap);
}

/* ------------------------------- suggestions ------------------------------ */

function snippetsFor(lang) {
  const byName = SNIPPETS[lang.name.toLowerCase()];
  if (byName) return byName;
  return SNIPPETS[lang.mode] || [];
}

function keywordsFor(lang) {
  const name = lang.name.toLowerCase();
  if (KEYWORDS[name]) return KEYWORDS[name];
  if (lang.mode === "clike") return KEYWORDS.clike;
  return KEYWORDS[lang.mode] || [];
}

function markupContext(cm) {
  const cursor = cm.getCursor();
  const text = cm.getLine(cursor.line).slice(0, cursor.ch);
  const lt = text.lastIndexOf("<");
  if (lt === -1) return null;
  const after = text.slice(lt + 1);
  if (after.indexOf(">") !== -1) return null;
  const closing = after.charAt(0) === "/";
  const body = closing ? after.slice(1) : after;
  const tagMatch = body.match(/^([\w:-]*)$/);
  if (tagMatch) {
    return {
      kind: "tag",
      prefix: tagMatch[1],
      from: { line: cursor.line, ch: lt + 1 + (closing ? 1 : 0) }
    };
  }
  const attrMatch = body.match(/([\w:@.-]*)$/);
  if (!attrMatch) return null;
  return {
    kind: "attr",
    prefix: attrMatch[1],
    from: { line: cursor.line, ch: cursor.ch - attrMatch[1].length }
  };
}

function isMarkupMode(mode) {
  return mode === "htmlmixed" || mode === "xml" || mode === "vue" || mode === "jsx" || mode === "htmlembedded";
}

function isStyleMode(mode) {
  return mode === "css" || mode === "sass" || mode === "less" || mode === "stylus";
}

function tagDetail(tag) {
  if (["br", "hr", "img", "input", "meta", "link", "source", "area", "base", "col", "embed", "param", "track", "wbr"].indexOf(tag) !== -1) {
    return "void element";
  }
  if (tag === "script" || tag === "style" || tag === "template" || tag === "slot") return "HTML element";
  return "HTML tag";
}

function jitterHint(cm) {
  const file = activeFile();
  const lang = file ? file.lang : PLAIN;
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line);
  const before = line.slice(0, cursor.ch);
  const items = [];
  const seen = {};
  const to = cm.getCursor();
  let from = null;

  function push(item) {
    if (!item || !item.text) return;
    const key = (item.displayText || item.text).toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    if (!item.render) item.render = renderHint;
    items.push(item);
  }

  if (isMarkupMode(lang.mode)) {
    const ctx = markupContext(cm);
    if (ctx && ctx.kind === "tag") {
      const prefix = ctx.prefix.toLowerCase();
      from = ctx.from;
      HTML_TAGS.forEach(function (tag) {
        if (tag.toLowerCase().indexOf(prefix) === 0) push({ text: tag, kind: "tag", detail: tagDetail(tag) });
      });
      return { list: items.slice(0, 90), from: from, to: to };
    }
    if (ctx && ctx.kind === "attr") {
      const prefix = ctx.prefix.toLowerCase();
      from = ctx.from;
      HTML_ATTRS.forEach(function (attr) {
        if (attr.toLowerCase().indexOf(prefix) === 0) push({ text: attr, kind: "attr", detail: "attribute" });
      });
      if (items.length) return { list: items.slice(0, 90), from: from, to: to };
    }
  }

  const wordMatch = before.match(/[\w$]*$/);
  const prefix = (wordMatch ? wordMatch[0] : "").toLowerCase();
  from = { line: cursor.line, ch: cursor.ch - (wordMatch ? wordMatch[0].length : 0) };

  snippetsFor(lang).forEach(function (snip) {
    if (prefix && snip.label.toLowerCase().indexOf(prefix) !== 0) return;
    push({
      text: snip.insert,
      displayText: snip.label,
      kind: "snip",
      detail: snip.detail || "snippet",
      hint: function (cm, data, completion) {
        expandSnippet(cm, completion.text, completion.from || data.from, completion.to || data.to);
      }
    });
  });

  if (!prefix) {
    keywordsFor(lang).slice(0, 40).forEach(function (word) {
      push({ text: word, kind: "kw", detail: lang.name + " keyword" });
    });
  }

  if (isStyleMode(lang.mode)) {
    CSS_PROPS.forEach(function (prop) {
      if (prefix && prop.indexOf(prefix) !== 0) return;
      push({ text: prop + ": ", displayText: prop, kind: "prop", detail: "CSS property" });
    });
  }

  if (prefix) {
    keywordsFor(lang).forEach(function (word) {
      if (word.toLowerCase().indexOf(prefix) === 0) push({ text: word, kind: "kw", detail: lang.name + " keyword" });
    });
    const code = cm.getValue();
    const words = code.match(/[A-Za-z_$][\w$]{2,}/g) || [];
    for (let i = 0; i < words.length && items.length < 220; i++) {
      if (words[i].toLowerCase().indexOf(prefix) === 0) push({ text: words[i], kind: "word", detail: "word in file" });
    }
  }

  return { list: items.slice(0, 160), from: from, to: to };
}

function expandSnippet(cm, text, from, to) {
  let body = "";
  let caret = -1;
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (char === "$" && /\d/.test(text.charAt(i + 1))) {
      if (text.charAt(i + 1) === "0" && caret === -1) caret = body.length;
      i++;
      continue;
    }
    body += char;
  }
  const start = cm.indexFromPos(from);
  cm.replaceRange(body, from, to, "complete");
  if (caret !== -1) cm.setCursor(cm.posFromIndex(start + caret));
}

function renderHint(element, self, data) {
  const glyphs = { tag: "<>", attr: "@", snip: "S", kw: "K", word: "ab", prop: "#" };
  const glyph = glyphs[data.kind] || "•";
  const label = data.displayText || data.text;
  const detail = data.detail ? '<span class="hint-detail">' + esc(data.detail) + "</span>" : "";
  element.innerHTML = '<span class="hint-kind">' + esc(glyph) + '</span><span class="hint-label">' + esc(label).split("\n")[0] + "</span>" + detail;
}

function moveSuggestion(cm, direction) {
  const completion = cm.state.completionActive;
  if (!completion || !completion.widget) return CodeMirror.Pass;
  completion.widget.changeActive(completion.widget.selectedHint + direction, true);
  return;
}

function scrollSuggest(cm, direction) {
  const completion = cm.state.completionActive;
  if (completion && completion.widget) {
    completion.widget.changeActive(completion.widget.selectedHint + direction, true);
    return;
  }
  if (direction > 0) return CodeMirror.Pass;
  const result = jitterHint(cm);
  if (!result.list.length) return CodeMirror.Pass;
  cm.showHint({ hint: function () { return result; }, completeSingle: false });
  return;
}

function handleTab(cm) {
  const completion = cm.state.completionActive;
  if (completion) {
    if (completion.widget) completion.widget.pick();
    else completion.close();
    return;
  }

  const file = activeFile();
  const lang = file ? file.lang : PLAIN;
  const cursor = cm.getCursor();
  const before = cm.getLine(cursor.line).slice(0, cursor.ch);
  const match = before.match(/([a-zA-Z0-9_!]+)$/);

  if (match) {
    const trigger = match[1];
    const snippets = snippetsFor(lang);
    for (let i = 0; i < snippets.length; i++) {
      if (snippets[i].label !== trigger) continue;
      expandSnippet(cm, snippets[i].insert, { line: cursor.line, ch: cursor.ch - trigger.length }, cursor);
      return;
    }
  }

  if ((lang.mode === "htmlmixed" || lang.mode === "css") && typeof emmetCodeMirror !== "undefined") {
    try {
      if (cm.execCommand("emmetExpandAbbreviation") !== false) return;
    } catch (error) { /* emmet is optional */ }
  }

  if (cm.somethingSelected()) {
    cm.indentSelection("add");
  } else {
    cm.replaceSelection("  ", "end");
  }
}

function addNextOccurrence(cm) {
  let word = cm.getSelection();
  if (!word || word.indexOf("\n") !== -1) {
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);
    word = (token.string || "").replace(/[^\w$]+/g, "");
    if (!word) return;
    cm.setSelection({ line: cur.line, ch: cur.ch - word.length }, cur);
  }
  try {
    const cursor = cm.getSearchCursor(word, cm.getCursor("to"));
    if (cursor.findNext()) cm.addSelection(cursor.from(), cursor.to());
  } catch (error) { /* ignore */ }
}

/* ---------------------------------- find --------------------------------- */

const findState = { matches: [], index: -1, marks: [], case: false, word: false, regex: false };

function openFind(withReplace) {
  $("find-widget").classList.add("open");
  $("replace-row").classList.toggle("hidden", !withReplace);
  const selected = editor.getSelection();
  if (selected && selected.indexOf("\n") === -1) $("find-input").value = selected;
  $("find-input").focus();
  $("find-input").select();
  if (withReplace) $("replace-input").focus();
  updateFind(false);
}

function closeFind() {
  $("find-widget").classList.remove("open");
  clearFindMarks();
  editor.focus();
}

function clearFindMarks() {
  findState.marks.forEach(function (mark) { mark.clear(); });
  findState.marks = [];
}

function searchPattern() {
  const raw = $("find-input").value;
  if (!raw) return null;
  let source = findState.regex ? raw : raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (findState.word) source = "\\b" + source + "\\b";
  try {
    return new RegExp(source, findState.case ? "g" : "gi");
  } catch (error) {
    return null;
  }
}

function updateFind(jump) {
  clearFindMarks();
  findState.matches = [];
  findState.index = -1;
  const pattern = searchPattern();
  if (!pattern) {
    $("find-count").textContent = "No results";
    return;
  }
  const cursor = editor.getSearchCursor(pattern, { line: 0, ch: 0 });
  while (cursor.findNext() && findState.matches.length < 500) {
    findState.matches.push({ from: cursor.from(), to: cursor.to() });
  }
  findState.matches.forEach(function (match) {
    findState.marks.push(editor.markText(match.from, match.to, { className: "find-highlight" }));
  });
  if (!findState.matches.length) {
    $("find-count").textContent = "No results";
    return;
  }
  const pos = editor.getCursor();
  let start = 0;
  findState.matches.forEach(function (match, i) {
    if (CodeMirror.cmpPos(match.from, pos) >= 0) start = i;
  });
  findState.index = start;
  $("find-count").textContent = (start + 1) + " of " + findState.matches.length;
  if (jump) selectMatch(start);
}

function selectMatch(index) {
  const match = findState.matches[index];
  if (!match) return;
  findState.index = index;
  editor.setSelection(match.from, match.to);
  editor.scrollIntoView({ from: match.from, to: match.to }, 90);
  $("find-count").textContent = (index + 1) + " of " + findState.matches.length;
}

function stepFind(direction) {
  if (!findState.matches.length) return;
  const next = (findState.index + direction + findState.matches.length) % findState.matches.length;
  selectMatch(next);
}

function replaceCurrent() {
  if (findState.index === -1 || !findState.matches.length) return;
  const match = findState.matches[findState.index];
  const replacement = $("replace-input").value;
  editor.replaceRange(replacement, match.from, match.to);
  updateFind(false);
  stepFind(0);
}

function replaceAll() {
  if (!findState.matches.length) return;
  const replacement = $("replace-input").value;
  const count = findState.matches.length;
  editor.operation(function () {
    for (let i = count - 1; i >= 0; i--) {
      const match = findState.matches[i];
      editor.replaceRange(replacement, match.from, match.to);
    }
  });
  updateFind(false);
  toast("Replaced " + count + " occurrence" + (count === 1 ? "" : "s"));
}

/* -------------------------------- minimap -------------------------------- */

function scheduleMinimap() {
  if (minimapFrame) return;
  minimapFrame = window.requestAnimationFrame(function () {
    minimapFrame = 0;
    renderMinimap();
  });
}

function minimapColor(text) {
  if (/^(\/\/|#|<!--|\*|--)/.test(text)) return "#565669";
  if (/^<\/?[\w-]/.test(text)) return "#8f6dc4";
  if (/^(function|const|let|var|class|def|fn|fun|func|public|private|import|from|using|#include)\b/.test(text)) return "#6f5bc0";
  if (/^[}{\])]/.test(text)) return "#6b6b80";
  return "#7d7d94";
}

function renderMinimap() {
  const box = $("minimap");
  if (!settings.minimap || box.classList.contains("hidden")) return;
  const canvas = $("minimap-canvas");
  const width = box.clientWidth;
  const height = box.clientHeight;
  if (!width || !height) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const lines = [];
  editor.eachLine(function (handle) { lines.push(handle.text); });
  if (!lines.length) return;
  const lineHeight = Math.max(1.4, Math.min(3, (height - 6) / lines.length));
  const barHeight = Math.max(1, lineHeight - 0.9);
  let y = 3;

  for (let i = 0; i < lines.length; i++) {
    if (y > height) break;
    const raw = lines[i];
    if (!raw.trim()) {
      y += lineHeight;
      continue;
    }
    const indent = raw.length - raw.replace(/^\s+/, "").length;
    const trimmed = raw.trim();
    const x = 7 + Math.min(indent, 34) * 1.15;
    const barWidth = Math.min(width - x - 7, Math.max(2, trimmed.length * 1.05));
    ctx.fillStyle = minimapColor(trimmed);
    ctx.fillRect(x, y, barWidth, barHeight);
    y += lineHeight;
  }
  updateMinimapSlider();
}

function updateMinimapSlider() {
  if (!editor || !settings.minimap) return;
  const box = $("minimap");
  if (!box || box.classList.contains("hidden")) return;
  const info = editor.getScrollInfo();
  const slider = $("minimap-slider");
  const height = box.clientHeight;
  if (!info.height) return;
  const top = (info.top / info.height) * height;
  const size = Math.max(24, (info.clientHeight / info.height) * height);
  slider.style.top = Math.max(0, Math.min(height - size, top)) + "px";
  slider.style.height = Math.min(size, height) + "px";
}

function bindMinimap() {
  const box = $("minimap");
  let dragging = false;
  function seek(clientY) {
    const rect = box.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const info = editor.getScrollInfo();
    editor.scrollTo(null, ratio * (info.height - info.clientHeight));
  }
  box.addEventListener("pointerdown", function (event) {
    dragging = true;
    box.setPointerCapture(event.pointerId);
    seek(event.clientY);
  });
  box.addEventListener("pointermove", function (event) {
    if (dragging) seek(event.clientY);
  });
  box.addEventListener("pointerup", function () { dragging = false; });
  box.addEventListener("pointercancel", function () { dragging = false; });
}

/* -------------------------------- status --------------------------------- */

function updateStatus() {
  if (!editor) return;
  const file = activeFile();
  const cursor = editor.getCursor();
  const selection = editor.getSelection();
  $("sb-cursor").textContent = "Ln " + (cursor.line + 1) + ", Col " + (cursor.ch + 1);
  $("sb-cursor").title = selection ? selection.length + " characters selected" : "Go to line (Ctrl+G)";
  $("sb-language").textContent = file ? file.lang.name : "Plain Text";
  $("sb-indent").textContent = "Spaces: " + editor.getOption("indentUnit");
}

/* -------------------------------- problems -------------------------------- */

let problems = [];
let problemsTimer = 0;

function scheduleProblems() {
  window.clearTimeout(problemsTimer);
  problemsTimer = window.setTimeout(scanProblems, 200);
}

function scanProblems() {
  problems = [];
  const file = activeFile();
  if (file) {
    for (let i = 0; i < file.doc.lineCount(); i++) {
      const text = file.doc.getLine(i);
      const match = text.match(/\b(TODO|FIXME|HACK|XXX)\b/);
      if (match) problems.push({ line: i + 1, text: text.trim(), kind: match[1], path: file.path });
    }
  }
  renderProblems();
  $("problems-count").textContent = problems.length ? String(problems.length) : "";
  $("sb-problems-count").textContent = String(problems.length);
}

function renderProblems() {
  const body = $("panel-problems");
  if (!problems.length) {
    body.innerHTML = '<span class="panel-line dim">No problems have been detected in the active file. TODO and FIXME notes are listed here.</span>';
    return;
  }
  body.innerHTML = problems.map(function (item) {
    return '<span class="panel-line"><a class="row-link" data-line="' + item.line + '">' + esc(item.path) + ":" + item.line + "</a>  " +
      '<span style="color:#e2c08d">' + esc(item.kind) + "</span>  " + esc(item.text.replace(/\b(TODO|FIXME|HACK|XXX)\b/, "")) + "</span>";
  }).join("");
}

/* ---------------------------------- scm ---------------------------------- */

function refreshScm() {
  const changed = Object.keys(state.files).map(function (path) { return state.files[path]; }).filter(function (file) { return file.dirty; });
  const badge = $("scm-badge");
  badge.hidden = changed.length === 0;
  badge.textContent = String(changed.length);
  if (!$("view-scm")) return;
  $("view-scm").innerHTML =
    '<div class="side-section"><span class="chev">▾</span>Changes <span style="color:#8f8fa6">' + changed.length + "</span></div>" +
    (changed.length
      ? changed.map(function (file) {
          return '<div class="scm-row" data-path="' + esc(file.path) + '"><span class="badge">M</span><span>' + esc(file.path) + "</span></div>";
        }).join("")
      : '<div class="side-note">No changes yet. Edit a file and it will show up here.</div>') +
    '<div class="side-note">Changes are tracked locally in the workspace. Use Ctrl+S to write a file back to disk.</div>';
}

/* ==========================================================================
   Part 3: commands, menus, palette, file access, workspace views
   ========================================================================== */

function setView(name) {
  document.querySelectorAll(".ab-btn[data-view]").forEach(function (button) {
    button.classList.toggle("active", button.dataset.view === name);
  });
  document.querySelectorAll(".view").forEach(function (view) {
    view.classList.remove("active");
  });
  const view = $("view-" + name);
  if (view) view.classList.add("active");
  const titles = { explorer: "Explorer", search: "Search", scm: "Source Control", run: "Run and Debug", extensions: "Language Packs" };
  $("sidebar-title").textContent = titles[name] || "Explorer";
  settings.sidebar = true;
  $("sidebar").classList.remove("hidden");
  renderSidebarActions(name);
  if (name === "search") window.setTimeout(function () { $("search-input").focus(); }, 0);
  if (name === "extensions") renderExtensions();
  if (name === "scm") refreshScm();
  if (name === "run") renderRunView();
}

function renderSidebarActions(name) {
  const box = $("sidebar-actions");
  if (name === "explorer") {
    box.innerHTML =
      '<button class="icon-btn" id="explorer-new-btn" title="New file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
      '<button class="icon-btn" id="explorer-open-btn" title="Open file from disk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></button>' +
      '<button class="icon-btn" id="explorer-refresh-btn" title="Refresh explorer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>';
    $("explorer-new-btn").addEventListener("click", startNewFile);
    $("explorer-open-btn").addEventListener("click", openFile);
    $("explorer-refresh-btn").addEventListener("click", function () { renderExplorer(); refreshScm(); });
    return;
  }
  if (name === "search") {
    box.innerHTML = '<button class="icon-btn" id="search-refresh" title="Refresh results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>';
    $("search-refresh").addEventListener("click", runWorkspaceSearch);
    return;
  }
  if (name === "extensions") {
    box.innerHTML = '<button class="icon-btn" id="ext-refresh" title="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>';
    $("ext-refresh").addEventListener("click", renderExtensions);
    return;
  }
  box.innerHTML = "";
}

function startNewFile() {
  setView("explorer");
  explorerCreating = true;
  renderExplorer();
}

function toggleSidebar() {
  settings.sidebar = !settings.sidebar;
  $("sidebar").classList.toggle("hidden", !settings.sidebar);
  window.setTimeout(function () { editor.refresh(); renderMinimap(); }, 0);
}

function togglePanel(force) {
  const panel = $("panel");
  settings.panel = typeof force === "boolean" ? force : panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !settings.panel);
  if (settings.panel) { $("panel-resizer").style.display = ""; } else { $("panel-resizer").style.display = "none"; }
  window.setTimeout(function () { editor.refresh(); renderMinimap(); }, 0);
}

function showPanel(name) {
  if (!settings.panel) togglePanel(true);
  document.querySelectorAll(".panel-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.panel === name);
  });
  $("panel-problems").classList.toggle("hidden", name !== "problems");
  $("panel-output").classList.toggle("hidden", name !== "output");
  $("panel-terminal").classList.toggle("hidden", name !== "terminal");
  if (name === "terminal") $("term-input").focus();
}

function toggleWordWrap() {
  settings.wordWrap = !settings.wordWrap;
  editor.setOption("lineWrapping", settings.wordWrap);
  editor.refresh();
  toast("Word wrap " + (settings.wordWrap ? "on" : "off"));
}

function toggleMinimap() {
  settings.minimap = !settings.minimap;
  $("minimap").classList.toggle("hidden", !settings.minimap);
  editor.refresh();
  scheduleMinimap();
  toast("Minimap " + (settings.minimap ? "shown" : "hidden"));
}

function zoom(direction) {
  if (direction === 0) settings.fontSize = 14;
  else settings.fontSize = Math.max(10, Math.min(26, settings.fontSize + direction));
  document.documentElement.style.setProperty("--editor-size", settings.fontSize + "px");
  editor.refresh();
  scheduleMinimap();
}

function cycleIndent() {
  const unit = editor.getOption("indentUnit") === 2 ? 4 : 2;
  editor.setOption("indentUnit", unit);
  editor.setOption("tabSize", unit);
  updateStatus();
  toast("Indentation: " + unit + " spaces");
}

/* --------------------------------- commands ------------------------------- */

const COMMANDS = {
  "file.new": { label: "New File", keys: "Ctrl+Alt+N", run: startNewFile },
  "file.open": { label: "Open File…", keys: "Ctrl+O", run: function () { openFile(); } },
  "file.save": { label: "Save File", keys: "Ctrl+S", run: function () { saveFile(); } },
  "file.saveAs": { label: "Save File As…", keys: "Ctrl+Shift+S", run: function () { saveFileAs(); } },
  "file.close": { label: "Close Editor", keys: "Ctrl+W", run: function () { if (state.active) closePath(state.active); } },
  "file.home": { label: "Open JitterDev Home Page", keys: "", run: function () { window.location.href = "index.html"; } },
  "file.delete": { label: "Delete File…", keys: "", run: function () { const file = activeFile(); if (file) deleteFile(file.path, true); else toast("Open a file first"); } },
  "file.restore": { label: "Restore Deleted Files", keys: "", run: restoreDeletedFiles },
  "edit.undo": { label: "Undo", keys: "Ctrl+Z", run: function () { editor.undo(); } },
  "edit.redo": { label: "Redo", keys: "Ctrl+Y", run: function () { editor.redo(); } },
  "edit.cut": { label: "Cut", keys: "Ctrl+X", run: function () { editor.execCommand("cut"); } },
  "edit.copy": { label: "Copy", keys: "Ctrl+C", run: function () { editor.execCommand("copy"); } },
  "edit.find": { label: "Find", keys: "Ctrl+F", run: function () { openFind(false); } },
  "edit.replace": { label: "Replace", keys: "Ctrl+H", run: function () { openFind(true); } },
  "edit.comment": { label: "Toggle Line Comment", keys: "Ctrl+/", run: function () { editor.execCommand("toggleComment"); } },
  "edit.selectAll": { label: "Select All", keys: "Ctrl+A", run: function () { editor.execCommand("selectAll"); } },
  "edit.addCursor": { label: "Add Selection to Next Find Match", keys: "Ctrl+D", run: function () { addNextOccurrence(editor); } },
  "view.palette": { label: "Command Palette", keys: "Ctrl+Shift+P", run: function () { openPalette("command"); } },
  "view.explorer": { label: "Show Explorer", keys: "Ctrl+Shift+E", run: function () { setView("explorer"); } },
  "view.search": { label: "Show Search", keys: "Ctrl+Shift+F", run: function () { setView("search"); } },
  "view.scm": { label: "Show Source Control", keys: "Ctrl+Shift+G", run: function () { setView("scm"); } },
  "view.run": { label: "Show Run and Debug", keys: "Ctrl+Shift+D", run: function () { setView("run"); } },
  "view.extensions": { label: "Show Language Packs", keys: "Ctrl+Shift+X", run: function () { setView("extensions"); } },
  "view.sidebar": { label: "Toggle Primary Side Bar", keys: "Ctrl+B", run: toggleSidebar },
  "view.panel": { label: "Toggle Panel", keys: "Ctrl+J", run: function () { togglePanel(); } },
  "view.problems": { label: "Toggle Problems Panel", keys: "Ctrl+Shift+M", run: function () { showPanel("problems"); } },
  "view.wrap": { label: "Toggle Word Wrap", keys: "Alt+Z", run: toggleWordWrap },
  "view.minimap": { label: "Toggle Minimap", keys: "", run: toggleMinimap },
  "view.zoomIn": { label: "Zoom In", keys: "Ctrl+=", run: function () { zoom(1); } },
  "view.zoomOut": { label: "Zoom Out", keys: "Ctrl+-", run: function () { zoom(-1); } },
  "view.zoomReset": { label: "Reset Zoom", keys: "Ctrl+0", run: function () { zoom(0); } },
  "view.language": { label: "Change Language Mode", keys: "Ctrl+K", run: function () { openPalette("language"); } },
  "go.file": { label: "Go to File…", keys: "Ctrl+P", run: function () { openPalette("file"); } },
  "go.line": { label: "Go to Line…", keys: "Ctrl+G", run: function () { openPalette("line"); } },
  "run.file": { label: "Run Active File", keys: "Ctrl+Alt+R", run: function () { runActiveFile(); } },
  "run.preview": { label: "Open Live Preview", keys: "Ctrl+Alt+V", run: function () { openPreview(); } },
  "run.terminal": { label: "Focus Terminal", keys: "Ctrl+`", run: function () { showPanel("terminal"); } },
  "help.shortcuts": { label: "Keyboard Shortcuts", keys: "Ctrl+K Ctrl+S", run: showShortcuts },
  "help.about": { label: "About JitterDev", keys: "", run: showAbout }
};

const MENUS = [
  { label: "File", items: ["file.new", "file.open", null, "file.save", "file.saveAs", null, "file.delete", "file.restore", null, "file.close", "file.home"] },
  { label: "Edit", items: ["edit.undo", "edit.redo", null, "edit.cut", "edit.copy", null, "edit.find", "edit.replace", null, "edit.comment", "edit.addCursor"] },
  { label: "Selection", items: ["edit.selectAll", "edit.addCursor"] },
  { label: "View", items: ["view.palette", null, "view.explorer", "view.search", "view.scm", "view.run", "view.extensions", null, "view.sidebar", "view.panel", "view.problems", null, "view.wrap", "view.minimap", null, "view.zoomIn", "view.zoomOut", "view.zoomReset"] },
  { label: "Go", items: ["go.file", "go.line"] },
  { label: "Run", items: ["run.file", "run.preview", "run.terminal"] },
  { label: "Help", items: ["help.shortcuts", "help.about"] }
];

function renderMenus() {
  $("menubar").innerHTML = MENUS.map(function (menu, index) {
    const items = menu.items.map(function (id) {
      if (!id) return '<div class="menu-sep"></div>';
      const command = COMMANDS[id];
      return '<div class="menu-item" data-command="' + id + '"><span>' + esc(command.label) + '</span><span class="keys">' + esc(command.keys || "") + "</span></div>";
    }).join("");
    return '<div class="menu" data-menu="' + index + '"><button class="menu-btn">' + esc(menu.label) + '</button><div class="menu-pop">' + items + "</div></div>";
  }).join("");
}

function closeMenus() {
  document.querySelectorAll(".menu.open").forEach(function (menu) { menu.classList.remove("open"); });
}

function bindMenus() {
  const bar = $("menubar");
  bar.addEventListener("click", function (event) {
    const menu = event.target.closest(".menu");
    if (!menu) return;
    if (event.target.closest(".menu-item")) {
      const id = event.target.closest(".menu-item").dataset.command;
      closeMenus();
      runCommand(id);
      return;
    }
    if (event.target.closest(".menu-btn")) {
      const open = menu.classList.contains("open");
      closeMenus();
      menu.classList.toggle("open", !open);
    }
  });
  bar.addEventListener("mouseover", function (event) {
    const menu = event.target.closest(".menu");
    if (!menu || !document.querySelector(".menu.open")) return;
    if (menu.classList.contains("open")) return;
    closeMenus();
    menu.classList.add("open");
  });
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".menu")) closeMenus();
  });
}

function runCommand(id) {
  const command = COMMANDS[id];
  if (!command) return;
  try {
    command.run();
  } catch (error) {
    console.error(error);
    toast("Command failed: " + command.label);
  }
}

/* ---------------------------------- palette ------------------------------- */

const paletteState = { kind: "command", all: [], filtered: [], index: 0 };

function paletteSource(kind) {
  if (kind === "language") {
    return LANGUAGES.map(function (lang) {
      return {
        label: lang.name,
        detail: (lang.ext || []).slice(0, 3).join(" ") || lang.mime,
        icon: "L",
        run: function () { setActiveLanguage(lang); }
      };
    });
  }
  if (kind === "file") {
    return Object.keys(state.files).map(function (path) {
      return {
        label: path,
        detail: state.files[path].lang.name,
        icon: "F",
        run: function () { openPath(path); }
      };
    });
  }
  if (kind === "line") return [];
  return Object.keys(COMMANDS).map(function (id) {
    const command = COMMANDS[id];
    return { label: command.label, detail: command.keys || "", icon: ">", run: command.run };
  });
}

function openPalette(kind) {
  paletteState.kind = kind;
  paletteState.all = paletteSource(kind);
  paletteState.index = 0;
  const placeholders = {
    command: "Type the name of a command to run",
    language: "Select a language mode",
    file: "Type the name of a file to open",
    line: "Type a line number and press Enter"
  };
  const input = $("palette-input");
  input.value = "";
  input.placeholder = placeholders[kind] || placeholders.command;
  $("palette-overlay").classList.add("open");
  filterPalette("");
  window.setTimeout(function () { input.focus(); }, 0);
}

function closePalette() {
  $("palette-overlay").classList.remove("open");
  if (editor) editor.focus();
}

function fuzzyScore(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return 1000 - direct - t.length * 0.01;
  let cursor = 0;
  let score = 0;
  for (let i = 0; i < q.length; i++) {
    const found = t.indexOf(q.charAt(i), cursor);
    if (found === -1) return -1;
    score += found === cursor ? 3 : 1;
    cursor = found + 1;
  }
  return score;
}

function filterPalette(query) {
  const list = $("palette-list");
  if (paletteState.kind === "line") {
    const line = parseInt(query, 10);
    paletteState.filtered = line > 0
      ? [{ label: "Go to line " + line, detail: "Enter", icon: ":", run: function () {
          const target = Math.max(1, Math.min(editor.lineCount(), line));
          editor.setCursor({ line: target - 1, ch: 0 });
          editor.scrollIntoView({ line: target - 1, ch: 0 }, 120);
          editor.focus();
        } }]
      : [];
  } else {
    paletteState.filtered = paletteState.all
      .map(function (item) { return { item: item, score: fuzzyScore(query, item.label + " " + (item.detail || "")) }; })
      .filter(function (entry) { return entry.score >= 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 200)
      .map(function (entry) { return entry.item; });
  }
  if (paletteState.index >= paletteState.filtered.length) paletteState.index = 0;
  if (!paletteState.filtered.length) {
    list.innerHTML = '<div class="palette-empty">' + (paletteState.kind === "line" ? "Type a line number" : "No matching results") + "</div>";
    return;
  }
  list.innerHTML = paletteState.filtered.map(function (item, index) {
    return '<div class="palette-item' + (index === paletteState.index ? " active" : "") + '" data-index="' + index + '">' +
      '<span class="palette-kind">' + esc(item.icon || ">") + "</span>" +
      '<span class="palette-label">' + esc(item.label) + "</span>" +
      '<span class="palette-detail">' + esc(item.detail || "") + "</span></div>";
  }).join("");
  const active = list.querySelector(".palette-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function runPaletteItem(index) {
  const item = paletteState.filtered[index];
  if (!item) return;
  closePalette();
  try {
    item.run();
  } catch (error) {
    console.error(error);
    toast("That action could not run");
  }
}

/* --------------------------------- file i/o -------------------------------- */

async function openFile() {
  try {
    if (window.showOpenFilePicker) {
      const handles = await window.showOpenFilePicker({ multiple: false });
      const handle = handles[0];
      const file = await handle.getFile();
      const text = await file.text();
      const existing = state.files[file.name];
      if (existing) {
        existing.doc.setValue(text);
        existing.saved = text;
        existing.dirty = false;
        openPath(file.name);
      } else {
        const registered = registerFile(file.name, text, langForPath(file.name));
        registered.handle = handle;
        openPath(file.name);
      }
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const text = await file.text();
      registerFile(file.name, text, langForPath(file.name));
      openPath(file.name);
    };
    input.click();
  } catch (error) {
    if (error && error.name !== "AbortError") {
      console.error(error);
      toast("Could not open that file");
    }
  }
}

async function saveFile() {
  const file = activeFile();
  if (!file) { toast("Nothing to save"); return; }
  const content = file.doc.getValue();
  try {
    if (file.handle) {
      const writable = await file.handle.createWritable();
      await writable.write(content);
      await writable.close();
      file.saved = content;
      file.dirty = false;
      renderTabs();
      renderExplorer();
      refreshScm();
      toast("Saved " + file.path);
      return;
    }
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({ suggestedName: file.path.split("/").pop() });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      file.handle = handle;
      file.saved = content;
      file.dirty = false;
      renderTabs();
      renderExplorer();
      refreshScm();
      toast("Saved " + handle.name);
      return;
    }
    download(file.path.split("/").pop(), content);
  } catch (error) {
    if (error && error.name !== "AbortError") {
      console.error(error);
      toast("Could not save that file");
    }
  }
}

function saveFileAs() {
  const file = activeFile();
  if (!file) { toast("Nothing to save"); return; }
  download(file.path.split("/").pop(), file.doc.getValue());
}

function download(name, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name || "untitled.txt";
  link.click();
  window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  toast("Downloaded " + link.download);
}

/* ==========================================================================
   Part 4: workspace views, output, terminal, preview, bindings, boot
   ========================================================================== */

function runWorkspaceSearch() {
  const query = $("search-input").value.trim();
  const box = $("search-results");
  if (!query) {
    box.innerHTML = '<div class="side-note">Type to search every file in the workspace.</div>';
    return;
  }
  const caseSensitive = $("search-case").classList.contains("on");
  const wholeWord = $("search-word").classList.contains("on");
  const results = [];
  Object.keys(state.files).forEach(function (path) {
    state.files[path].doc.eachLine(function (handle) {
      const text = handle.text;
      const haystack = caseSensitive ? text : text.toLowerCase();
      const needle = caseSensitive ? query : query.toLowerCase();
      let from = 0;
      let index = haystack.indexOf(needle, from);
      while (index !== -1 && results.length < 500) {
        if (!wholeWord || (isBoundary(text.charAt(index - 1)) && isBoundary(text.charAt(index + query.length)))) {
          results.push({ path: path, line: handle.lineNo() + 1, text: text, start: index });
        }
        from = index + Math.max(1, needle.length);
        index = haystack.indexOf(needle, from);
      }
    });
  });
  if (!results.length) {
    box.innerHTML = '<div class="side-note">No results found in the workspace.</div>';
    return;
  }
  const grouped = {};
  results.forEach(function (hit) {
    if (!grouped[hit.path]) grouped[hit.path] = [];
    grouped[hit.path].push(hit);
  });
  box.innerHTML = Object.keys(grouped).map(function (path) {
    const hits = grouped[path];
    return '<div class="side-section"><span class="chev">▾</span>' + esc(path) + ' <span style="color:#8f8fa6">' + hits.length + "</span></div>" +
      hits.slice(0, 40).map(function (hit) {
        const start = Math.max(0, hit.start - 18);
        const snippet = hit.text.slice(start, hit.start + query.length + 34).trim();
        return '<div class="search-result" data-path="' + esc(hit.path) + '" data-line="' + hit.line + '">' +
          '<span class="ln">' + hit.line + "</span><span>" + esc(snippet) + "</span></div>";
      }).join("");
  }).join("");
}

function isBoundary(char) {
  return !char || !/[\w$]/.test(char);
}

function renderRunView() {
  const file = activeFile();
  const name = file ? file.path.split("/").pop() : "your file";
  $("view-run").innerHTML =
    '<div class="run-card"><h4>Run ' + esc(name) + '</h4>' +
    '<p>HTML, CSS and JavaScript files can run right here. Everything executes in a sandboxed frame.</p>' +
    '<button class="btn wide primary" id="run-now">Run active file</button></div>' +
    '<div class="run-card"><h4>Live preview</h4>' +
    '<p>Open the active document in an isolated preview with your workspace styles and scripts inlined.</p>' +
    '<button class="btn wide" id="run-preview">Open preview</button></div>' +
    '<div class="side-note">Shortcuts: Ctrl+Alt+R to run, Ctrl+Alt+V to preview.</div>';
  $("run-now").addEventListener("click", runActiveFile);
  $("run-preview").addEventListener("click", openPreview);
}

function renderExtensions() {
  const query = ($("ext-input") ? $("ext-input").value : "").trim().toLowerCase();
  const list = LANGUAGES.filter(function (lang) {
    if (!query) return true;
    return lang.name.toLowerCase().indexOf(query) !== -1 || (lang.ext || []).join(" ").indexOf(query) !== -1;
  });
  $("ext-note").textContent = LANGUAGES.length + " language modes ship with JitterDev. Showing " + list.length + ". Click one to apply it to the active file.";
  const active = activeFile();
  $("ext-list").innerHTML = list.map(function (lang) {
    const initials = lang.name.split(/[\s+]/).map(function (part) { return part.charAt(0); }).join("").slice(0, 2).toUpperCase();
    return '<div class="ext-row" data-lang="' + esc(lang.name) + '">' +
      '<span class="ext-icon">' + esc(initials) + "</span>" +
      '<div class="ext-meta"><div class="ext-name">' + esc(lang.name) + (active && active.lang.name === lang.name ? ' <span style="color:#89d185">active</span>' : "") + "</div>" +
      '<div class="ext-sub">' + esc((lang.ext || []).slice(0, 4).join(", ") || lang.mime) + "</div></div></div>";
  }).join("");
}

/* --------------------------------- output --------------------------------- */

function writeOutput(lines, kind) {
  const body = $("panel-output");
  const html = lines.map(function (line) {
    return '<span class="panel-line ' + (kind || "") + '">' + esc(line) + "</span>";
  }).join("");
  body.insertAdjacentHTML("beforeend", html);
  body.scrollTop = body.scrollHeight;
}

function clearPanel() {
  const active = document.querySelector(".panel-tab.active");
  const name = active ? active.dataset.panel : "output";
  if (name === "output") $("panel-output").innerHTML = "";
  if (name === "problems") scanProblems();
  if (name === "terminal") $("term-log").innerHTML = "";
}

function runActiveFile() {
  const file = activeFile();
  if (!file) { toast("Open a file first"); return; }
  const name = file.path;
  if (/\.(html?|vue)$/i.test(name) || /\.(css|scss|sass|less)$/i.test(name)) {
    openPreview();
    return;
  }
  if (/\.(js|mjs|cjs)$/i.test(name)) {
    showPanel("output");
    const lines = ["▶ Running " + name];
    const format = function (value) {
      if (typeof value === "string") return value;
      try { return JSON.stringify(value); } catch (error) { return String(value); }
    };
    const fake = {
      log: function () { lines.push("  " + Array.prototype.map.call(arguments, format).join(" ")); },
      info: function () { lines.push("  " + Array.prototype.map.call(arguments, format).join(" ")); },
      warn: function () { lines.push("  " + Array.prototype.map.call(arguments, format).join(" ")); },
      error: function () { lines.push("  " + Array.prototype.map.call(arguments, format).join(" ")); }
    };
    try {
      const runner = new Function("console", file.doc.getValue());
      runner(fake);
    } catch (error) {
      lines.push("  " + error.name + ": " + error.message);
    }
    if (lines.length === 1) lines.push("  The script finished without logging anything.");
    writeOutput(lines);
    return;
  }
  showPanel("output");
  writeOutput(["▶ " + name, "Running " + file.lang.name + " files inside the browser sandbox is not supported. Open an HTML, CSS or JavaScript file to use Run."]);
}

/* -------------------------------- terminal -------------------------------- */

const terminal = { history: [], index: -1 };

function termPrint(text, cls) {
  const log = $("term-log");
  const line = document.createElement("div");
  line.className = "panel-line " + (cls || "");
  line.textContent = text;
  log.appendChild(line);
  $("panel-terminal").scrollTop = $("panel-terminal").scrollHeight;
}

function runTerminal(raw) {
  const command = raw.trim();
  termPrint("jitter@workspace ~ % " + raw);
  if (!command) return;
  terminal.history.push(command);
  terminal.index = terminal.history.length;
  const parts = command.split(/\s+/);
  const name = parts[0];
  const argument = parts.slice(1).join(" ");

  if (name === "help") {
    termPrint("commands: help, ls, cat <file>, open <file>, run, clear, echo <text>, date, pwd, whoami, version");
  } else if (name === "ls") {
    termPrint(Object.keys(state.files).join("  "), "dim");
  } else if (name === "cat") {
    const file = state.files[argument];
    if (file) termPrint(file.doc.getValue());
    else termPrint("cat: " + (argument || "missing operand") + ": No such file", "err");
  } else if (name === "open") {
    const file = state.files[argument];
    if (file) { openPath(argument); termPrint("opened " + argument, "ok"); }
    else termPrint("open: " + (argument || "missing operand") + ": No such file", "err");
  } else if (name === "run") {
    runActiveFile();
    termPrint("running " + (state.active || "nothing"), "ok");
  } else if (name === "clear") {
    $("term-log").innerHTML = "";
  } else if (name === "echo") {
    termPrint(argument);
  } else if (name === "date") {
    termPrint(new Date().toString());
  } else if (name === "pwd") {
    termPrint("/home/jitter/jitter-workspace");
  } else if (name === "whoami") {
    termPrint("jitter");
  } else if (name === "version") {
    termPrint("JitterDev 1.0.2 — CodeMirror " + (CodeMirror.version || "5") + " — " + LANGUAGES.length + " language modes");
  } else {
    termPrint(name + ": command not found. Type help for the list.", "err");
  }
}

/* -------------------------------- preview --------------------------------- */

function inlineWorkspaceAssets(html) {
  let output = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, function (match, href) {
    const file = state.files[href];
    if (!file || !/\.s?css$/i.test(href)) return match;
    return "<style>\n" + file.doc.getValue() + "\n</style>";
  });
  output = output.replace(/<script[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, function (match, src) {
    const file = state.files[src];
    if (!file || !/\.(m?js)$/i.test(src)) return match;
    return "<script>\n" + file.doc.getValue() + "\n<\/script>";
  });
  return output;
}

function previewDocument() {
  const file = activeFile();
  if (!file) return "";
  const value = file.doc.getValue();
  const name = file.path;
  if (/\.(html?|vue)$/i.test(name)) return inlineWorkspaceAssets(value);
  if (/\.(css|scss|sass|less)$/i.test(name)) {
    return '<!DOCTYPE html><html><head><style>' + value + '</style></head><body>' +
      '<main class="card"><h1>Style preview</h1><p>This paragraph, heading and card are styled by ' + esc(name) + '.</p>' +
      '<button class="pill">Button</button></main></body></html>';
  }
  if (/\.(js|mjs|cjs)$/i.test(name)) {
    return '<!DOCTYPE html><html><body style="font-family:monospace;background:#111;color:#eee;padding:16px">' +
      '<pre id="out"></pre><script>const out=document.getElementById("out");const log=(...a)=>{out.textContent+=a.map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" ")+"\\n"};console.log=log;' +
      'try{' + value + '}catch(error){out.textContent+=error.name+": "+error.message}<\/script></body></html>';
  }
  return "<!DOCTYPE html><html><body style='font-family:system-ui;padding:24px'>" + esc(name) + " cannot be previewed in the sandbox.</body></html>";
}

function openPreview() {
  const file = activeFile();
  if (!file) { toast("Open a file first"); return; }
  $("preview-name").textContent = file.path.split("/").pop();
  $("preview-note").textContent = "Live preview";
  $("preview-frame").srcdoc = previewDocument();
  $("preview-overlay").classList.add("open");
}

function closePreview() {
  $("preview-overlay").classList.remove("open");
  $("preview-frame").srcdoc = "";
}

/* --------------------------- dialogs and toasts --------------------------- */

function openDialog(title, html) {
  $("dialog-title").textContent = title;
  $("dialog-body").innerHTML = html;
  $("dialog-overlay").classList.add("open");
}

function closeDialog() {
  $("dialog-overlay").classList.remove("open");
}

function showShortcuts() {
  const rows = [
    ["Command palette", "Ctrl+Shift+P"], ["Go to file", "Ctrl+P"], ["Go to line", "Ctrl+G"],
    ["Find / replace", "Ctrl+F  /  Ctrl+H"], ["Suggestions", "Ctrl+Space"],
    ["Accept suggestion / expand snippet", "Tab"], ["Open suggestions, then scroll", "Shift+Up, then Up / Down"],
    ["Toggle comment", "Ctrl+/"], ["Add next occurrence", "Ctrl+D"], ["Save file", "Ctrl+S"],
    ["Open file", "Ctrl+O"], ["Close editor", "Ctrl+W"], ["Toggle side bar", "Ctrl+B"],
    ["Toggle panel", "Ctrl+J"], ["Change language", "Ctrl+K"], ["Run active file", "Ctrl+Alt+R"],
    ["Word wrap", "Alt+Z"], ["Zoom in / out", "Ctrl+=  /  Ctrl+-"]
  ];
  openDialog("Keyboard shortcuts", '<div class="shortcut-grid">' + rows.map(function (row) {
    return "<span>" + esc(row[0]) + "</span><kbd>" + esc(row[1]) + "</kbd>";
  }).join("") + "</div>");
}

function showAbout() {
  openDialog("About JitterDev",
    "<p><strong>JitterDev 1.0.2</strong> — a fast, distraction-free code editor for PC, Mac and Linux.</p>" +
    "<p>This workbench bundles CodeMirror 5 with <strong>" + LANGUAGES.length + " language modes</strong>, tag and attribute suggestions, tab-accepted completions, a minimap, a command palette and a live preview sandbox.</p>" +
    "<h3>Credits</h3><p>Created by Suryansh Nimmagadda. Syntax engine: CodeMirror (MIT). Inspired by the Visual Studio Code layout.</p>" +
    "<h3>Get the app</h3><p><a href=\"index.html\">Open the download page</a> for the Windows, macOS and Chromebook builds.</p>");
}

function toast(message) {
  const wrap = $("toast-wrap");
  if (!wrap) return;
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  wrap.appendChild(node);
  window.setTimeout(function () { node.remove(); }, 2600);
}

/* -------------------------------- bindings -------------------------------- */

function makeResizer(handle, target, axis, min, max) {
  handle.addEventListener("pointerdown", function (event) {
    event.preventDefault();
    handle.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
    function onMove(moveEvent) {
      if (axis === "x") {
        const left = target.getBoundingClientRect().left;
        target.style.width = Math.max(min, Math.min(max, moveEvent.clientX - left)) + "px";
      } else {
        const bottom = target.getBoundingClientRect().bottom;
        target.style.height = Math.max(min, Math.min(max, bottom - moveEvent.clientY)) + "px";
      }
      editor.refresh();
      scheduleMinimap();
    }
    function onUp() {
      handle.classList.remove("dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      editor.refresh();
      scheduleMinimap();
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });
}

function bindAll() {
  document.querySelectorAll(".ab-btn[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (button.classList.contains("active") && !$("sidebar").classList.contains("hidden")) toggleSidebar();
      else setView(button.dataset.view);
    });
  });
  $("ab-account").addEventListener("click", showAbout);
  $("ab-settings").addEventListener("click", showShortcuts);

  $("tabs").addEventListener("click", function (event) {
    const close = event.target.closest("[data-close]");
    if (close) { closePath(close.dataset.close); return; }
    const tab = event.target.closest(".tab");
    if (tab) openPath(tab.dataset.path);
  });
  $("tabs").addEventListener("auxclick", function (event) {
    if (event.button !== 1) return;
    const tab = event.target.closest(".tab");
    if (tab) { event.preventDefault(); closePath(tab.dataset.path); }
  });

  $("breadcrumbs").addEventListener("click", function (event) {
    const crumb = event.target.closest("[data-crumb], [data-lang]");
    if (!crumb) return;
    if (crumb.dataset.lang) { openPalette("language"); return; }
    const path = crumb.dataset.crumb;
    if (state.files[path]) openPath(path);
  });

  $("view-explorer").addEventListener("click", function (event) {
    const row = event.target.closest(".tree-row[data-path]");
    if (row) openPath(row.dataset.path);
  });
  $("view-explorer").addEventListener("contextmenu", function (event) {
    const row = event.target.closest(".tree-row[data-path]");
    if (!row) return;
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY, row.dataset.path);
  });
  document.addEventListener("click", function () { $("context-menu").hidden = true; });
  $("view-scm").addEventListener("click", function (event) {
    const row = event.target.closest(".scm-row[data-path]");
    if (row) openPath(row.dataset.path);
  });

  $("command-center").addEventListener("click", function () { openPalette("file"); });
  $("btn-new-file").addEventListener("click", startNewFile);
  $("btn-split").addEventListener("click", toggleMinimap);
  $("btn-more").addEventListener("click", function () { openPalette("command"); });

  $("sb-branch").addEventListener("click", function () { toast("Branch: main — workspace changes are tracked locally"); });
  $("sb-problems").addEventListener("click", function () { showPanel("problems"); });
  $("sb-cursor").addEventListener("click", function () { openPalette("line"); });
  $("sb-indent").addEventListener("click", cycleIndent);
  $("sb-encoding").addEventListener("click", function () { toast("Encoding: UTF-8"); });
  $("sb-eol").addEventListener("click", function () { toast("End of line: LF"); });
  $("sb-language").addEventListener("click", function () { openPalette("language"); });
  $("sb-sync").addEventListener("click", function () { toast("All workspace files are saved in this tab"); });

  $("find-input").addEventListener("input", function () { updateFind(true); });
  $("find-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") { event.preventDefault(); stepFind(event.shiftKey ? -1 : 1); }
    if (event.key === "Escape") { event.preventDefault(); closeFind(); }
  });
  $("find-next").addEventListener("click", function () { stepFind(1); });
  $("find-prev").addEventListener("click", function () { stepFind(-1); });
  $("find-close").addEventListener("click", closeFind);
  $("find-case").addEventListener("click", function () {
    findState.case = !findState.case;
    this.classList.toggle("on", findState.case);
    updateFind(true);
  });
  $("find-word").addEventListener("click", function () {
    findState.word = !findState.word;
    this.classList.toggle("on", findState.word);
    updateFind(true);
  });
  $("find-regex").addEventListener("click", function () {
    findState.regex = !findState.regex;
    this.classList.toggle("on", findState.regex);
    updateFind(true);
  });
  $("replace-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") { event.preventDefault(); replaceCurrent(); }
    if (event.key === "Escape") { event.preventDefault(); closeFind(); }
  });
  $("replace-one").addEventListener("click", replaceCurrent);
  $("replace-all").addEventListener("click", replaceAll);

  $("search-input").addEventListener("input", runWorkspaceSearch);
  $("search-case").addEventListener("click", function () {
    this.classList.toggle("on");
    runWorkspaceSearch();
  });
  $("search-word").addEventListener("click", function () {
    this.classList.toggle("on");
    runWorkspaceSearch();
  });
  $("search-results").addEventListener("click", function (event) {
    const row = event.target.closest(".search-result");
    if (!row) return;
    openPath(row.dataset.path);
    const line = Math.max(1, parseInt(row.dataset.line, 10)) - 1;
    editor.setCursor({ line: line, ch: 0 });
    editor.scrollIntoView({ line: line, ch: 0 }, 120);
  });

  $("ext-input").addEventListener("input", renderExtensions);
  $("ext-list").addEventListener("click", function (event) {
    const row = event.target.closest(".ext-row");
    if (!row) return;
    const lang = LANGUAGES.filter(function (item) { return item.name === row.dataset.lang; })[0];
    if (lang) setActiveLanguage(lang);
    renderExtensions();
  });

  document.querySelectorAll(".panel-tab").forEach(function (tab) {
    tab.addEventListener("click", function () { showPanel(tab.dataset.panel); });
  });
  $("panel-close").addEventListener("click", function () { togglePanel(false); });
  $("panel-clear").addEventListener("click", clearPanel);

  $("panel-problems").addEventListener("click", function (event) {
    const link = event.target.closest("[data-line]");
    if (!link) return;
    const line = Math.max(1, parseInt(link.dataset.line, 10)) - 1;
    editor.setCursor({ line: line, ch: 0 });
    editor.scrollIntoView({ line: line, ch: 0 }, 120);
    editor.focus();
  });

  $("term-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const value = this.value;
      this.value = "";
      runTerminal(value);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!terminal.history.length) return;
      terminal.index = Math.max(0, terminal.index - 1);
      this.value = terminal.history[terminal.index] || "";
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      terminal.index = Math.min(terminal.history.length, terminal.index + 1);
      this.value = terminal.history[terminal.index] || "";
    }
  });

  $("palette-input").addEventListener("input", function () { filterPalette(this.value); paletteState.index = 0; });
  $("palette-input").addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      paletteState.index = Math.min(paletteState.filtered.length - 1, paletteState.index + 1);
      filterPalette(this.value);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      paletteState.index = Math.max(0, paletteState.index - 1);
      filterPalette(this.value);
    } else if (event.key === "Enter") {
      event.preventDefault();
      runPaletteItem(paletteState.index);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  });
  $("palette-list").addEventListener("click", function (event) {
    const item = event.target.closest(".palette-item");
    if (item) runPaletteItem(parseInt(item.dataset.index, 10));
  });
  $("palette-overlay").addEventListener("mousedown", function (event) {
    if (event.target === this) closePalette();
  });

  $("dialog-close").addEventListener("click", closeDialog);
  $("dialog-overlay").addEventListener("mousedown", function (event) {
    if (event.target === this) closeDialog();
  });
  $("preview-close").addEventListener("click", closePreview);
  $("preview-reload").addEventListener("click", function () { $("preview-frame").srcdoc = previewDocument(); });
  $("preview-overlay").addEventListener("mousedown", function (event) {
    if (event.target === this) closePreview();
  });

  makeResizer($("sidebar-resizer"), $("sidebar"), "x", 170, 460);
  makeResizer($("panel-resizer"), $("panel"), "y", 90, 520);
  bindMinimap();

  document.addEventListener("keydown", handleGlobalKey);
  window.addEventListener("resize", function () { editor.refresh(); scheduleMinimap(); });
}

function handleGlobalKey(event) {
  if (event.defaultPrevented) return;
  const mod = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  const widget = event.target && event.target.closest ? event.target.closest(".overlay, .find-widget, .search-field, .tree-input, #term-input") : null;

  if (event.key === "Escape") {
    closeMenus();
    if ($("palette-overlay").classList.contains("open")) closePalette();
    if ($("dialog-overlay").classList.contains("open")) closeDialog();
    if ($("preview-overlay").classList.contains("open")) closePreview();
    return;
  }
  if (!mod || widget) return;

  if (event.shiftKey && key === "p") { event.preventDefault(); openPalette("command"); return; }
  if (event.shiftKey && key === "e") { event.preventDefault(); setView("explorer"); return; }
  if (event.shiftKey && key === "f") { event.preventDefault(); setView("search"); return; }
  if (event.shiftKey && key === "g") { event.preventDefault(); setView("scm"); return; }
  if (event.shiftKey && key === "d") { event.preventDefault(); setView("run"); return; }
  if (event.shiftKey && key === "x") { event.preventDefault(); setView("extensions"); return; }
  if (event.shiftKey && key === "m") { event.preventDefault(); showPanel("problems"); return; }
  if (event.shiftKey && key === "s") { event.preventDefault(); saveFileAs(); return; }
  if (event.altKey && key === "r") { event.preventDefault(); runActiveFile(); return; }
  if (event.altKey && key === "v") { event.preventDefault(); openPreview(); return; }
  if (event.altKey && key === "n") { event.preventDefault(); startNewFile(); return; }
  if (event.altKey && key === "z") { event.preventDefault(); toggleWordWrap(); return; }
  if (key === "p") { event.preventDefault(); openPalette("file"); return; }
  if (key === "s") { event.preventDefault(); saveFile(); return; }
  if (key === "o") { event.preventDefault(); openFile(); return; }
  if (key === "b") { event.preventDefault(); toggleSidebar(); return; }
  if (key === "j") { event.preventDefault(); togglePanel(); return; }
  if (key === "`") { event.preventDefault(); showPanel("terminal"); return; }
  if (key === "w") { event.preventDefault(); if (state.active) closePath(state.active); return; }
  if (key === "=" || key === "+") { event.preventDefault(); zoom(1); return; }
  if (key === "-") { event.preventDefault(); zoom(-1); return; }
  if (key === "0") { event.preventDefault(); zoom(0); return; }
  if (key === "k") { event.preventDefault(); openPalette("language"); return; }
}

/* ---------------------------------- boot ---------------------------------- */

function bootScreen() {
  const screen = $("boot-screen");
  if (!screen) return;
  const seenKey = "jitterBootSeen:editor";
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === "1"; } catch (error) { /* storage blocked */ }
  if (seen) { screen.remove(); return; }
  try { sessionStorage.setItem(seenKey, "1"); } catch (error) { /* storage blocked */ }

  const fill = $("boot-fill");
  const percent = $("boot-percent");
  const status = $("boot-status");
  const root = document.documentElement;
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 800 : 2600;
  const steps = [
    [0, "Waking the engine"],
    [12, "Loading syntax engines"],
    [32, "Mounting " + LANGUAGES.length + " language modes"],
    [56, "Wiring the minimap"],
    [78, "Polishing the liquid glass"],
    [92, "Finishing up"]
  ];
  root.classList.add("is-booting");

  const startedAt = performance.now();
  let finished = false;
  let stepIndex = -1;
  let swapTimer;

  function setStatus(text) {
    if (status.textContent === text) return;
    status.classList.add("swap");
    window.clearTimeout(swapTimer);
    swapTimer = window.setTimeout(function () {
      status.textContent = text;
      status.classList.remove("swap");
    }, 200);
  }

  function finish() {
    if (finished) return;
    finished = true;
    fill.style.width = "100%";
    percent.textContent = "100%";
    setStatus("Ready");
    window.setTimeout(function () {
      screen.classList.add("is-done");
      root.classList.remove("is-booting");
      window.setTimeout(function () { screen.remove(); }, 900);
    }, 260);
  }

  function tick(now) {
    if (finished) return;
    const progress = Math.min((now - startedAt) / duration, 1);
    const value = Math.round((1 - Math.pow(1 - progress, 1.6)) * 100);
    fill.style.width = value + "%";
    percent.textContent = value + "%";
    let reached = 0;
    steps.forEach(function (step) { if (value >= step[0]) reached++; });
    if (reached - 1 !== stepIndex) {
      stepIndex = reached - 1;
      setStatus(steps[stepIndex][1]);
    }
    if (progress === 1) finish();
    else window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
  window.setTimeout(finish, duration + 2000);
  screen.addEventListener("click", finish);
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
  });
}

/* ---------------------------------- init ---------------------------------- */

function init() {
  initEditor();
  const removed = deletedSeeds();
  SEEDS.forEach(function (seed) {
    if (!removed.has(seed.path)) registerFile(seed.path, seed.content, langForPath(seed.path));
  });
  renderMenus();
  bindMenus();
  bindAll();
  refreshScm();
  renderRunView();
  renderExtensions();
  if (state.files["tutorial.txt"]) openPath("tutorial.txt");
  else if (Object.keys(state.files).length) openPath(Object.keys(state.files)[0]);
  else showEmpty();
  setView("explorer");
  updateStatus();
  scheduleMinimap();
  bootScreen();
}

init();

