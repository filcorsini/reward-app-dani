import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [balanceCents, setBalanceCents] = useState(0);
  const [history, setHistory] = useState([]);
  const [milestones, setMilestones] = useState([200, 500, 1000]);
  const [achieved, setAchieved] = useState([]);
  const [theme, setTheme] = useState("light");
  const [weeklyGoalCents, setWeeklyGoalCents] = useState(500);
  const [customNote, setCustomNote] = useState("");

  const STORAGE_KEY = "reward-app-eur-v5";
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (typeof data.balanceCents === "number") setBalanceCents(data.balanceCents);
        if (Array.isArray(data.history)) setHistory(data.history);
        if (Array.isArray(data.milestones)) setMilestones(data.milestones);
        if (Array.isArray(data.achieved)) setAchieved(data.achieved);
        if (data.theme) setTheme(data.theme);
        if (typeof data.weeklyGoalCents === "number") setWeeklyGoalCents(data.weeklyGoalCents);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const data = { balanceCents, history, milestones, achieved, theme, weeklyGoalCents };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [balanceCents, history, milestones, achieved, theme, weeklyGoalCents]);

  const fmtEUR = (cents) => (cents/100).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
  const prettyDate = (ts) => {
    const d = new Date(ts);
    const giorno = d.toLocaleDateString("it-IT", { weekday: "long" });
    return `${giorno} ${d.toLocaleString()}`;
  };

  function startOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - day);
    return d;
  }

  const weekStart = useMemo(() => startOfWeek(), []);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const earnedThisWeekCents = useMemo(() => {
    return history
      .filter(h => h.ts >= weekStart.getTime() && h.ts < weekEnd.getTime())
      .reduce((s, h) => s + h.deltaCents, 0);
  }, [history, weekStart, weekEnd]);

  const weekProgress = Math.max(0, Math.min(1, weeklyGoalCents ? earnedThisWeekCents / weeklyGoalCents : 0));

  const standardReasons = [
    { label: "Messo a posto i giochi", delta: 30 },
    { label: "Gentile", delta: 30 },
    { label: "Finito pranzo/cena", delta: 30 },
    { label: "Non ho ubbidito", delta: -30 },
    { label: "Parolaccia", delta: -20 },
    { label: "Bugia", delta: -30 },
  ];

  function add(deltaCents, reason) {
    const newBal = Math.max(0, balanceCents + deltaCents);
    setBalanceCents(newBal);
    const entry = { id: crypto.randomUUID(), deltaCents, note: reason, ts: Date.now() };
    setHistory((h) => [entry, ...h].slice(0, 500));
  }

  function resetAll() {
    setBalanceCents(0);
    setHistory([]);
    setAchieved([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function clearHistory() {
    setHistory([]);
    const data = { balanceCents, history: [], milestones, achieved, theme, weeklyGoalCents };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  useEffect(() => {
    const reached = milestones.filter((m) => balanceCents >= m);
    setAchieved(reached);
  }, [balanceCents, milestones]);

  const emoji = useMemo(() => (balanceCents >= 1000 ? "🌟" : balanceCents >= 500 ? "🙂" : "🐣"), [balanceCents]);

  return (
    <div className={theme==="dark" ? "dark" : ""}>
      <div className={"min-h-screen "+(theme==="dark"?"bg-slate-900 text-slate-100":"bg-amber-50 text-slate-800")}> 
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <header className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{emoji}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Ricompense di DANI</h1>
                <p className="text-lg font-bold mt-1">Totale: {fmtEUR(balanceCents)}</p>
                <p className="text-sm opacity-80">Sistema di ricompense in euro – semplice e visivo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl border border-black/10 shadow bg-white/60 text-sm hover:scale-[1.02] active:scale-95 transition"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title="Cambia tema"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-white/70 dark:bg-white/10 border border-black/10 rounded-2xl p-5 shadow">
              <div className="flex flex-col gap-2">
                {standardReasons.map((r) => (
                  <button
                    key={r.label}
                    className={"w-full px-3 py-2 rounded-xl shadow border text-left "+(r.delta>0?"bg-emerald-200/80 border-emerald-400 hover:bg-emerald-300/80":"bg-rose-200/80 border-rose-400 hover:bg-rose-300/80")}
                    onClick={() => add(r.delta, r.label)}
                  >
                    <span className="font-semibold">{r.label}</span>
                    <span className="float-right font-bold">{r.delta>0?`+ ${fmtEUR(r.delta)}`:`− ${fmtEUR(-r.delta)}`}</span>
                  </button>
                ))}

                <div className="mt-4 p-3 border rounded-xl bg-white/60">
                  <label className="text-sm opacity-70">Ricompensa/Penalità personalizzata</label>
                  <input
                    className="mt-1 w-full px-2 py-1 rounded-lg border border-black/20"
                    placeholder="Motivo..."
                    value={customNote}
                    onChange={(e)=>setCustomNote(e.target.value)}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {[20,30,-20,-30].map(v => (
                      <button key={v} className="px-2 py-1 rounded-lg border bg-white/70 hover:bg-white" onClick={()=>{ add(v, customNote||"Personalizzato"); setCustomNote("");}}>
                        {v>0?`+ ${fmtEUR(v)}`:`− ${fmtEUR(-v)}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button type="button" className="px-3 py-2 rounded-xl bg-white/70 border border-black/10 shadow hover:scale-[1.01] active:scale-95" onClick={resetAll}>Reset totale</button>
                <button type="button" className="px-3 py-2 rounded-xl bg-white/70 border border-black/10 shadow hover:scale-[1.01] active:scale-95" onClick={clearHistory}>Svuota storico</button>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-white/10 border border-black/10 rounded-2xl p-5 shadow">
              <h2 className="text-xl font-bold mb-3">Obiettivi e premi</h2>
              <p className="text-sm opacity-75 mb-3">Quando il bilancio supera un obiettivo, si guadagna una ⭐.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {milestones.filter(m => m <= 1000).map((m, i) => (
                  <span
                    key={i}
                    className={"px-3 py-1.5 rounded-full border text-sm "+(balanceCents>=m?"bg-yellow-300/80 border-yellow-400 font-semibold":"bg-white/70 border-black/10")}
                  >{fmtEUR(m)} {balanceCents>=m?"⭐":""}</span>
                ))}
              </div>
              <EditableMilestonesEUR milestones={milestones.filter(m => m <= 1000)} setMilestones={setMilestones} />

              <div className="mt-6">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Target settimanale</h3>
                    <div className="text-sm opacity-70">Da lunedì a domenica</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Guadagnati: <strong>{fmtEUR(earnedThisWeekCents)}</strong></div>
                    <div>Obiettivo: <strong>{fmtEUR(weeklyGoalCents)}</strong></div>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
                  <div className="h-3 bg-amber-400" style={{ width: `${weekProgress*100}%` }} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                  <span>Imposta obiettivo:</span>
                  {[300, 500, 700, 1000].map(v => (
                    <button key={v} className={"px-2 py-1 rounded-lg border "+(weeklyGoalCents===v?"bg-amber-300/80 border-amber-400":"bg-white/70 border-black/10")} onClick={()=>setWeeklyGoalCents(v)}>{fmtEUR(v)}</button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Badge title="Stelle" value={achieved.length} sub="raggiunte" emoji="⭐" />
                <Badge title="Transazioni" value={history.length} sub="in totale" emoji="📝" />
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-xl font-bold mb-3">Storico</h3>
            {history.length === 0 ? (
              <div className="text-sm opacity-70">Nessuna operazione ancora. Usa i pulsanti per iniziare!</div>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="bg-white/70 dark:bg-white/10 border border-black/10 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={"text-lg font-bold "+(h.deltaCents>0?"text-emerald-700":"text-rose-700")}>{h.deltaCents>0?`+ ${fmtEUR(h.deltaCents)}`:`− ${fmtEUR(-h.deltaCents)}`}</span>
                      {h.note && <span className="text-sm">{h.note}</span>}
                    </div>
                    <span className="text-xs opacity-60">{prettyDate(h.ts)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8 opacity-80 text-sm">
            <h4 className="font-semibold mb-2">Suggerimenti rapidi per l'uso</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </section>

          <footer className="mt-10 text-center text-xs opacity-60">© 2025 – Sistema Ricompense familiare</footer>
        </div>
      </div>
    </div>
  );
}

function EditableMilestonesEUR({ milestones, setMilestones }) {
  const [text, setText] = useState(milestones.map(m => (m/100).toString().replace('.', ',')).join(", "));
  return (
    <div>
      <label className="text-sm opacity-70">Soglie in € (separate da virgola, massimo 10€)</label>
      <input
        className="mt-1 w-full px-3 py-2 rounded-xl bg-white/80 border border-black/10 shadow-sm focus:outline-none"
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onBlur={()=>{
          const parsed = text
            .split(",")
            .map(s=>s.trim().replace("€",""))
            .map(s=> s.replace('.', '').replace(',', '.'))
            .map(s=> Math.round(parseFloat(s)*100))
            .filter(n=> Number.isFinite(n) && n>0 && n<=1000)
            .sort((a,b)=>a-b);
          if (parsed.length) setMilestones(parsed);
        }}
        placeholder="Esempio: 2, 5, 10"
      />
    </div>
  );
}

function Badge({ title, value, sub, emoji }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 dark:bg-white/10 p-4 shadow text-center">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-xs opacity-70">{title} · {sub}</div>
    </div>
  );
}
