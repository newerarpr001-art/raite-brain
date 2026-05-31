import { useState, useEffect } from "react";

// ── Deep Merge ──────────────────────────────────────────
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ── Constants ───────────────────────────────────────────
const STORAGE_KEY = "raite_brain_v31";
const PHASES = ["探索", "整理", "実装", "発信"];
const MEM_TYPES = ["観察", "メモ"];
const MEM_SOURCES = ["自分", "Claude", "チャッピー", "Gemini", "複数"];
const MEM_STATES = ["観察", "仮説", "採用", "保留"];
const MEM_TAGS = ["観察", "状態", "AI", "プロダクト", "キャラクター", "ブランド", "その他"];

const ARC_TYPES = ["発信済み", "アーカイブ"];
const STATE_COLORS = { 観察: "#6B8CAE", 仮説: "#A89B6E", 採用: "#5A8A6A", 保留: "#666" };
const SOURCE_COLORS = { 自分: "#AAA", Claude: "#C8A96E", チャッピー: "#7EB8A8", Gemini: "#9B8EC4", 複数: "#A88A7E" };

const defaultData = {
  dashboard: {
    theme: "", phase: "探索", weekFocus: "",
    inProgress: [""], worries: [""], nextActions: [""],
  },
  brand: {
    mission: "", vision: "", tone: "", forbidden: "",
    glossary: [{ term: "", definition: "" }],
    aiRoles: {
      claude: "アプリ開発責任者。実装・設計・世界観構築を担う。",
      chappy: "相談役。構造整理・壁打ち・アイデア検証を担う。",
      gemini: "参謀。市場視点・外部観点・戦略立案を担う。",
    },
  },
  memories: [],
  archives: [],
};

// ── Storage ─────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return deepMerge(defaultData, JSON.parse(raw));
  } catch { return defaultData; }
}
function persist(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// ── Styles ───────────────────────────────────────────────
const C = {
  bg: "#0D0D0D", surface: "#161616", border: "#222",
  text: "#E2DAD0", muted: "#666", accent: "#C8A96E",
  green: "#5A8A6A", red: "#8A5A5A",
};

const S = {
  app: { minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "'Noto Serif JP','Georgia',serif", maxWidth: 480, margin: "0 auto", paddingBottom: 90 },
  header: { padding: "18px 18px 14px", borderBottom: `1px solid ${C.border}` },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: "0.18em", margin: 0, color: C.text },
  logoSub: { fontSize: 9, color: C.muted, letterSpacing: "0.25em", marginTop: 3 },
  tabBar: { display: "flex", borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg, position: "sticky", top: 0, zIndex: 10 },
  tab: (a) => ({ flex: 1, padding: "11px 2px", fontSize: 11, border: "none", background: "none", color: a ? C.text : C.muted, borderBottom: a ? `2px solid ${C.accent}` : "2px solid transparent", cursor: "pointer", letterSpacing: "0.05em", fontFamily: "'Noto Serif JP',serif" }),
  page: { padding: "18px 18px 0" },
  sectionLabel: { fontSize: 9, color: C.accent, letterSpacing: "0.22em", marginBottom: 12, marginTop: 22, borderLeft: `2px solid ${C.accent}`, paddingLeft: 7, display: "block" },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 9, color: C.muted, letterSpacing: "0.15em", marginBottom: 5, display: "block" },
  input: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "9px 11px", fontSize: 13, fontFamily: "'Noto Serif JP',serif", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "9px 11px", fontSize: 13, fontFamily: "'Noto Serif JP',serif", boxSizing: "border-box", outline: "none", resize: "vertical", minHeight: 72 },
  select: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "8px 10px", fontSize: 12, fontFamily: "'Noto Serif JP',serif", boxSizing: "border-box", outline: "none" },
  row: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  pill: (active, color) => ({ padding: "4px 12px", borderRadius: 20, border: active ? `1px solid ${color || C.accent}` : `1px solid ${C.border}`, background: active ? `${(color || C.accent)}18` : "none", color: active ? (color || C.accent) : C.muted, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Noto Serif JP',serif", whiteSpace: "nowrap" }),
  addBtn: { background: "none", border: `1px solid ${C.border}`, color: C.muted, fontSize: 11, padding: "5px 11px", borderRadius: 4, cursor: "pointer", letterSpacing: "0.08em", fontFamily: "'Noto Serif JP',serif" },
  removeBtn: { background: "none", border: "none", color: C.muted, fontSize: 17, cursor: "pointer", padding: "0 3px", lineHeight: 1, flexShrink: 0 },
  primaryBtn: { background: C.accent, border: "none", color: C.bg, fontSize: 13, padding: "10px 18px", borderRadius: 4, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Noto Serif JP',serif", width: "100%" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 13, marginBottom: 9 },
  badge: (color) => ({ display: "inline-block", padding: "2px 7px", borderRadius: 10, fontSize: 9, color, border: `1px solid ${color}`, marginRight: 5, letterSpacing: "0.08em" }),
  copyBtn: (ok) => ({ background: ok ? C.green : C.accent, border: "none", color: C.bg, fontSize: 12, padding: "9px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Noto Serif JP',serif", marginTop: 8, width: "100%" }),
  promptBox: { background: "#111", border: `1px solid ${C.border}`, borderRadius: 5, padding: 12, fontSize: 11, color: "#999", whiteSpace: "pre-wrap", lineHeight: 1.8, marginTop: 8, maxHeight: 260, overflowY: "auto" },
  disclosure: { background: "none", border: "none", color: C.muted, fontSize: 11, cursor: "pointer", padding: 0, letterSpacing: "0.1em", fontFamily: "'Noto Serif JP',serif", display: "flex", alignItems: "center", gap: 6 },
  divider: { borderColor: C.border, margin: "18px 0 0" },
  searchBar: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "9px 11px", fontSize: 13, fontFamily: "'Noto Serif JP',serif", boxSizing: "border-box", outline: "none", marginBottom: 10 },
  filterRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 },
};

// ── Stars ────────────────────────────────────────────────
function Stars({ value, onChange }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange(i)} style={{ cursor: "pointer", fontSize: 15, color: i <= value ? C.accent : C.border, marginRight: 1 }}>★</span>
      ))}
    </span>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function RAIteBrain() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState("now");
  const [copied, setCopied] = useState("");

  const [newMem, setNewMem] = useState({ type: "観察", source: "自分", content: "", tag: "観察", state: "観察", importance: 3 });
  const [editingMem, setEditingMem] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStar, setFilterStar] = useState(0);

  const [newArc, setNewArc] = useState({ type: "発信済み", content: "", tag: "その他", memo: "" });
  const [arcSearch, setArcSearch] = useState("");
  const [arcFilterType, setArcFilterType] = useState("");

  const [showMission, setShowMission] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => { persist(data); }, [data]);

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const dashList = (field, idx, val) => {
    const l = [...data.dashboard[field]]; l[idx] = val; set(`dashboard.${field}`, l);
  };
  const dashAdd = (field) => set(`dashboard.${field}`, [...data.dashboard[field], ""]);
  const dashRemove = (field, idx) => {
    const l = data.dashboard[field].filter((_, i) => i !== idx);
    set(`dashboard.${field}`, l.length ? l : [""]);
  };

  const glossaryUpdate = (idx, key, val) => {
    const g = [...data.brand.glossary]; g[idx] = { ...g[idx], [key]: val }; set("brand.glossary", g);
  };
  const glossaryAdd = () => set("brand.glossary", [...data.brand.glossary, { term: "", definition: "" }]);
  const glossaryRemove = (idx) => {
    const g = data.brand.glossary.filter((_, i) => i !== idx);
    set("brand.glossary", g.length ? g : [{ term: "", definition: "" }]);
  };

  const addMemory = () => {
    if (!newMem.content.trim()) return;
    const m = { id: Date.now(), date: new Date().toLocaleDateString("ja-JP"), ...newMem };
    set("memories", [m, ...data.memories]);
    setNewMem({ type: "観察", source: "自分", content: "", tag: "観察", state: "観察", importance: 3 });
  };

  const updateMem = (id, key, val) => set("memories", data.memories.map(m => m.id === id ? { ...m, [key]: val } : m));
  const deleteMem = (id) => set("memories", data.memories.filter(m => m.id !== id));

  const addArchive = () => {
    if (!newArc.content.trim()) return;
    const a = { id: Date.now(), date: new Date().toLocaleDateString("ja-JP"), ...newArc };
    set("archives", [a, ...data.archives]);
    setNewArc({ type: "発信済み", content: "", tag: "その他", memo: "" });
  };
  const deleteArchive = (id) => set("archives", data.archives.filter(a => a.id !== id));

  const filtered = data.memories.filter(m => {
    if (filterType && m.type !== filterType) return false;
    if (filterState && m.state !== filterState) return false;
    if (filterSource && m.source !== filterSource) return false;
    if (filterStar && m.importance < filterStar) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.content.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q) || m.state.toLowerCase().includes(q) || m.source.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredArc = data.archives.filter(a => {
    if (arcFilterType && a.type !== arcFilterType) return false;
    if (arcSearch) {
      const q = arcSearch.toLowerCase();
      return a.content.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || (a.memo || "").toLowerCase().includes(q);
    }
    return true;
  });

  const generatePrompt = (ai) => {
    const d = data.dashboard;
    const b = data.brand;
    const roles = { claude: b.aiRoles.claude, chappy: b.aiRoles.chappy, gemini: b.aiRoles.gemini };
    const names = { claude: "Claude", chappy: "ChatGPT（チャッピー）", gemini: "Gemini" };

    const topMems = [...data.memories]
      .sort((a, b) => {
        const stateScore = { 採用: 3, 仮説: 2, 観察: 1, 保留: 0 };
        if (stateScore[b.state] !== stateScore[a.state]) return stateScore[b.state] - stateScore[a.state];
        return b.importance - a.importance;
      })
      .slice(0, 5);

    return `【共通文脈 / RAIteとは】
ミッション：${b.mission || "（未設定）"}
ビジョン：${b.vision || "（未設定）"}
トーン：${b.tone || "（未設定）"}

【絶対にやらないこと】
${b.forbidden || "（未設定）"}

【用語定義】
${b.glossary.filter(g => g.term).map(g => `・${g.term}：${g.definition}`).join("\n") || "（未設定）"}

【現在状況】
テーマ：${d.theme || "（未設定）"}　フェーズ：${d.phase}
今週の重点：${d.weekFocus || "（未設定）"}
制作中：${d.inProgress.filter(Boolean).join(" / ") || "なし"}
悩み：${d.worries.filter(Boolean).join(" / ") || "なし"}
次にやること：${d.nextActions.filter(Boolean).join(" / ") || "なし"}

【重要な記憶（上位5件）】
${topMems.length ? topMems.map(m => `・[${m.state}|${m.source}] ${m.content}`).join("\n") : "（なし）"}

【あなたへの依頼】
あなたは${names[ai]}です。
役割：${roles[ai]}`;
  };

  const copyPrompt = (ai) => {
    navigator.clipboard.writeText(generatePrompt(ai)).then(() => {
      setCopied(ai); setTimeout(() => setCopied(""), 2000);
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raite_brain_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    try {
      const parsed = JSON.parse(importText);
      setData(deepMerge(defaultData, parsed));
      setImportText(""); setShowImport(false);
    } catch { alert("JSONの形式が正しくありません"); }
  };

  const importFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setData(deepMerge(defaultData, parsed));
        setShowImport(false);
      } catch { alert("JSONの形式が正しくありません"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const TABS = [
    { id: "now", label: "今" },
    { id: "memory", label: "記憶" },
    { id: "sync", label: "同期" },
    { id: "archive", label: "庫" },
    { id: "settings", label: "設定" },
  ];

  return (
    <div style={S.app}>
      <div style={S.header}>
        <p style={S.logo}>RAIte Brain</p>
        <p style={S.logoSub}>MEMORY · CONTEXT · SYNC</p>
      </div>

      <div style={S.tabBar}>
        {TABS.map(t => <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {/* ── NOW ── */}
      {tab === "now" && (
        <div style={S.page}>
          <span style={S.sectionLabel}>CURRENT POSITION</span>

          <div style={S.fieldGroup}>
            <span style={S.label}>現在のテーマ</span>
            <input style={S.input} value={data.dashboard.theme} onChange={e => set("dashboard.theme", e.target.value)} placeholder="例：観察" />
          </div>

          <div style={S.fieldGroup}>
            <span style={S.label}>現在フェーズ</span>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PHASES.map(p => <button key={p} style={S.pill(data.dashboard.phase === p)} onClick={() => set("dashboard.phase", p)}>{p}</button>)}
            </div>
          </div>

          <div style={S.fieldGroup}>
            <span style={S.label}>今週の重点</span>
            <input style={S.input} value={data.dashboard.weekFocus} onChange={e => set("dashboard.weekFocus", e.target.value)} placeholder="例：RAIte Brainを動く状態にする" />
          </div>

          {[
            { key: "inProgress", label: "制作中", ph: "例：note #8" },
            { key: "worries", label: "悩み", ph: "例：観察という言葉が固い" },
            { key: "nextActions", label: "次にやること", ph: "例：note執筆" },
          ].map(f => (
            <div key={f.key} style={S.fieldGroup}>
              <span style={S.label}>{f.label}</span>
              {data.dashboard[f.key].map((v, i) => (
                <div key={i} style={S.row}>
                  <input style={{ ...S.input, flex: 1 }} value={v} onChange={e => dashList(f.key, i, e.target.value)} placeholder={f.ph} />
                  <button style={S.removeBtn} onClick={() => dashRemove(f.key, i)}>×</button>
                </div>
              ))}
              <button style={S.addBtn} onClick={() => dashAdd(f.key)}>＋ 追加</button>
            </div>
          ))}
        </div>
      )}

      {/* ── MEMORY ── */}
      {tab === "memory" && (
        <div style={S.page}>
          <span style={S.sectionLabel}>NEW</span>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={S.label}>種別</span>
              <div style={{ display: "flex", gap: 6 }}>
                {MEM_TYPES.map(t => <button key={t} style={S.pill(newMem.type === t)} onClick={() => setNewMem({ ...newMem, type: t })}>{t}</button>)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <span style={S.label}>ソース</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MEM_SOURCES.map(s => <button key={s} style={S.pill(newMem.source === s, SOURCE_COLORS[s])} onClick={() => setNewMem({ ...newMem, source: s })}>{s}</button>)}
            </div>
          </div>

          <textarea style={{ ...S.textarea, marginBottom: 10 }} value={newMem.content} onChange={e => setNewMem({ ...newMem, content: e.target.value })} placeholder="観察・気づき・メモを記録する" rows={3} />

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={S.label}>タグ</span>
              <select style={S.select} value={newMem.tag} onChange={e => setNewMem({ ...newMem, tag: e.target.value })}>
                {MEM_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <span style={S.label}>状態</span>
              <select style={S.select} value={newMem.state} onChange={e => setNewMem({ ...newMem, state: e.target.value })}>
                {MEM_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span style={S.label}>重要度</span>
            <Stars value={newMem.importance} onChange={v => setNewMem({ ...newMem, importance: v })} />
          </div>

          <button style={S.primaryBtn} onClick={addMemory}>記録する</button>

          <span style={{ ...S.sectionLabel, marginTop: 26 }}>LOG</span>

          <input style={S.searchBar} value={search} onChange={e => setSearch(e.target.value)} placeholder="検索（内容・タグ・状態・ソース）" />

          <div style={S.filterRow}>
            {MEM_TYPES.map(t => (
              <button key={t} style={S.pill(filterType === t)} onClick={() => setFilterType(filterType === t ? "" : t)}>{t}</button>
            ))}
            {MEM_STATES.map(s => (
              <button key={s} style={S.pill(filterState === s, STATE_COLORS[s])} onClick={() => setFilterState(filterState === s ? "" : s)}>{s}</button>
            ))}
          </div>

          <div style={{ ...S.filterRow, marginBottom: 10 }}>
            {MEM_SOURCES.map(s => (
              <button key={s} style={S.pill(filterSource === s, SOURCE_COLORS[s])} onClick={() => setFilterSource(filterSource === s ? "" : s)}>{s}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 10, color: C.muted }}>★以上</span>
            {[1,2,3,4,5].map(n => (
              <button key={n} style={{ ...S.pill(filterStar === n), padding: "3px 9px" }} onClick={() => setFilterStar(filterStar === n ? 0 : n)}>{n}</button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{filtered.length}件</p>

          {filtered.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>記憶はまだありません。</p>}

          {filtered.map(mem => (
            <div key={mem.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span style={S.badge(STATE_COLORS[mem.state] || C.muted)}>{mem.state}</span>
                  <span style={S.badge(SOURCE_COLORS[mem.source] || C.muted)}>{mem.source}</span>
                  <span style={{ fontSize: 9, color: C.muted, padding: "2px 0" }}>{mem.type} · {mem.tag}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: C.muted }}>{mem.date}</span>
                  <button style={S.removeBtn} onClick={() => deleteMem(mem.id)}>×</button>
                </div>
              </div>

              {editingMem === mem.id ? (
                <>
                  <textarea style={{ ...S.textarea, marginBottom: 8 }} value={mem.content} onChange={e => updateMem(mem.id, "content", e.target.value)} rows={2} />
                  <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                    {MEM_STATES.map(s => <button key={s} style={S.pill(mem.state === s, STATE_COLORS[s])} onClick={() => updateMem(mem.id, "state", s)}>{s}</button>)}
                  </div>
                  <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                    {MEM_SOURCES.map(s => <button key={s} style={S.pill(mem.source === s, SOURCE_COLORS[s])} onClick={() => updateMem(mem.id, "source", s)}>{s}</button>)}
                  </div>
                  <Stars value={mem.importance} onChange={v => updateMem(mem.id, "importance", v)} />
                  <div style={{ marginTop: 8 }}>
                    <button style={{ ...S.addBtn }} onClick={() => setEditingMem(null)}>完了</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, margin: "0 0 8px", lineHeight: 1.65 }}>{mem.content}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.accent }}>{"★".repeat(mem.importance)}{"☆".repeat(5 - mem.importance)}</span>
                    <button style={{ ...S.addBtn, fontSize: 10, padding: "3px 9px" }} onClick={() => setEditingMem(mem.id)}>編集</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── SYNC ── */}
      {tab === "sync" && (
        <div style={S.page}>
          <span style={S.sectionLabel}>AI CONTEXT SYNC</span>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 18, lineHeight: 1.7 }}>
            Dashboardとブランド仕様・重要な記憶（採用→仮説→重要度順、上位5件）から自動生成。<br />コピーして各AIに貼り付ける。
          </p>

          {[
            { key: "claude", name: "Claude", desc: "アプリ開発責任者" },
            { key: "chappy", name: "チャッピー", desc: "相談役" },
            { key: "gemini", name: "Gemini", desc: "参謀" },
          ].map(ai => (
            <div key={ai.key} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{ai.name}</span>
                  <span style={{ fontSize: 10, color: C.muted, marginLeft: 8 }}>{ai.desc}</span>
                </div>
              </div>
              <div style={S.promptBox}>{generatePrompt(ai.key)}</div>
              <button style={S.copyBtn(copied === ai.key)} onClick={() => copyPrompt(ai.key)}>
                {copied === ai.key ? "✓ コピーしました" : `${ai.name}用をコピー`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── ARCHIVE ── */}
      {tab === "archive" && (
        <div style={S.page}>
          <span style={S.sectionLabel}>NEW</span>

          <div style={{ marginBottom: 10 }}>
            <span style={S.label}>種別</span>
            <div style={{ display: "flex", gap: 7 }}>
              {ARC_TYPES.map(t => (
                <button key={t} style={S.pill(newArc.type === t)} onClick={() => setNewArc({ ...newArc, type: t })}>{t}</button>
              ))}
            </div>
          </div>

          <textarea style={{ ...S.textarea, marginBottom: 10 }} value={newArc.content} onChange={e => setNewArc({ ...newArc, content: e.target.value })} placeholder="内容（発信テキスト・メモなど）" rows={4} />

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={S.label}>タグ</span>
              <select style={S.select} value={newArc.tag} onChange={e => setNewArc({ ...newArc, tag: e.target.value })}>
                {MEM_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span style={S.label}>メモ（任意）</span>
            <input style={S.input} value={newArc.memo} onChange={e => setNewArc({ ...newArc, memo: e.target.value })} placeholder="補足・経緯など" />
          </div>

          <button style={S.primaryBtn} onClick={addArchive}>保存する</button>

          <span style={{ ...S.sectionLabel, marginTop: 26 }}>STOCK</span>
          <p style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>同期プロンプトには反映されません</p>

          <input style={S.searchBar} value={arcSearch} onChange={e => setArcSearch(e.target.value)} placeholder="検索（内容・タグ・メモ）" />

          <div style={{ ...S.filterRow, marginBottom: 14 }}>
            {ARC_TYPES.map(t => (
              <button key={t} style={S.pill(arcFilterType === t)} onClick={() => setArcFilterType(arcFilterType === t ? "" : t)}>{t}</button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{filteredArc.length}件</p>

          {filteredArc.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>ストックはまだありません。</p>}

          {filteredArc.map(arc => (
            <div key={arc.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={S.badge(arc.type === "発信済み" ? C.green : C.muted)}>{arc.type}</span>
                  <span style={{ fontSize: 9, color: C.muted }}>{arc.tag}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, color: C.muted }}>{arc.date}</span>
                  <button style={S.removeBtn} onClick={() => deleteArchive(arc.id)}>×</button>
                </div>
              </div>
              <p style={{ fontSize: 13, margin: "0 0 6px", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{arc.content}</p>
              {arc.memo && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{arc.memo}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "settings" && (
        <div style={S.page}>
          <span style={S.sectionLabel}>BRAND SPEC</span>
          <div style={{ marginBottom: 14 }}>
            <button style={S.disclosure} onClick={() => setShowMission(!showMission)}>
              <span style={{ fontSize: 12 }}>{showMission ? "▾" : "▸"}</span>
              ミッション・ビジョン（折りたたみ）
            </button>
            {showMission && (
              <div style={{ marginTop: 12 }}>
                {[
                  { key: "mission", label: "ミッション", ph: "RAIteが存在する理由" },
                  { key: "vision", label: "ビジョン", ph: "RAIteが目指す世界" },
                ].map(f => (
                  <div key={f.key} style={S.fieldGroup}>
                    <span style={S.label}>{f.label}</span>
                    <textarea style={S.textarea} value={data.brand[f.key]} onChange={e => set(`brand.${f.key}`, e.target.value)} placeholder={f.ph} rows={2} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {[
            { key: "tone", label: "トーン", ph: "乾いたトーン、実務ベース・観察型..." },
            { key: "forbidden", label: "禁止事項", ph: "AIで人生変わりました、DX成功法則..." },
          ].map(f => (
            <div key={f.key} style={S.fieldGroup}>
              <span style={S.label}>{f.label}</span>
              <textarea style={S.textarea} value={data.brand[f.key]} onChange={e => set(`brand.${f.key}`, e.target.value)} placeholder={f.ph} rows={2} />
            </div>
          ))}

          <span style={S.sectionLabel}>用語辞典</span>
          {data.brand.glossary.map((g, i) => (
            <div key={i} style={{ ...S.row, marginBottom: 8 }}>
              <input style={{ ...S.input, flex: "0 0 90px" }} value={g.term} onChange={e => glossaryUpdate(i, "term", e.target.value)} placeholder="用語" />
              <input style={{ ...S.input, flex: 1 }} value={g.definition} onChange={e => glossaryUpdate(i, "definition", e.target.value)} placeholder="定義" />
              <button style={S.removeBtn} onClick={() => glossaryRemove(i)}>×</button>
            </div>
          ))}
          <button style={S.addBtn} onClick={glossaryAdd}>＋ 用語追加</button>

          <span style={S.sectionLabel}>AI役割定義</span>
          {[{ key: "claude", name: "Claude" }, { key: "chappy", name: "チャッピー" }, { key: "gemini", name: "Gemini" }].map(ai => (
            <div key={ai.key} style={S.fieldGroup}>
              <span style={S.label}>{ai.name}</span>
              <textarea style={S.textarea} value={data.brand.aiRoles[ai.key]} onChange={e => set(`brand.aiRoles.${ai.key}`, e.target.value)} rows={2} />
            </div>
          ))}

          <hr style={S.divider} />

          <span style={{ ...S.sectionLabel, marginTop: 20 }}>BACKUP</span>

          <div style={S.fieldGroup}>
            <span style={S.label}>エクスポート</span>
            <button style={S.primaryBtn} onClick={exportData}>JSONをダウンロード</button>
          </div>

          <div style={S.fieldGroup}>
            <span style={S.label}>インポート</span>
            <p style={{ fontSize: 11, color: C.red, marginBottom: 8 }}>※現在のデータは上書きされます</p>
            <label style={{ ...S.primaryBtn, display: "block", textAlign: "center", cursor: "pointer", background: C.green, boxSizing: "border-box" }}>
              JSONファイルを選択
              <input type="file" accept=".json" onChange={importFromFile} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
