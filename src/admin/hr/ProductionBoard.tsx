import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage, http } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { shortDay, type PaceStatus, type ProductionBoardData } from './productionTypes';

/**
 * Full-screen factory TV board: today's target, pieces finished, pace, hour-by-hour output, the week
 * and the team's streak. Refreshes itself every 30 seconds and keeps the screen awake.
 * Open /factory-board on the TV (log in once with the "Production Board (TV)" account).
 */
const REFRESH_MS = 30_000;

const CHEERS = [
    'Every piece counts. Together we hit the target!',
    'Quality first, speed follows.',
    'One team, one goal.',
    'Small steps every hour make a big day.',
    'Proud work, perfect finish.',
    'Strong start, strong finish!',
];

const STATUS: Record<PaceStatus, { title: string; tone: string; ring: [string, string]; glow: string }> = {
    done: { title: 'Target achieved!', tone: 'text-emerald-300', ring: ['#34d399', '#a7f3d0'], glow: 'shadow-[0_0_120px_-20px_rgba(52,211,153,0.6)]' },
    ahead: { title: 'Ahead of plan', tone: 'text-emerald-300', ring: ['#D4AF37', '#34d399'], glow: 'shadow-[0_0_120px_-30px_rgba(52,211,153,0.5)]' },
    on_track: { title: 'On track', tone: 'text-amber-300', ring: ['#B8941F', '#E8C35A'], glow: 'shadow-[0_0_120px_-30px_rgba(212,175,55,0.5)]' },
    behind: { title: "Let's push!", tone: 'text-orange-300', ring: ['#f97316', '#E8C35A'], glow: 'shadow-[0_0_120px_-30px_rgba(249,115,22,0.5)]' },
    not_started: { title: 'Good morning, team!', tone: 'text-amber-200', ring: ['#B8941F', '#E8C35A'], glow: '' },
    no_target: { title: 'No target set', tone: 'text-white/70', ring: ['#525252', '#737373'], glow: '' },
};
const ICON: Record<PaceStatus, string> = { done: '🎉', ahead: '🚀', on_track: '💪', behind: '🔥', not_started: '☀️', no_target: '📋' };

const statusLine = (b: ProductionBoardData) => {
    const { pace, item, target, achieved, remaining } = b;
    switch (pace.status) {
        case 'done': return achieved > target ? `${achieved - target} extra ${item} — outstanding work!` : `All ${target} ${item} finished. Amazing work, team!`;
        case 'ahead': return `${achieved - pace.expected} pieces ahead of plan. Keep this rhythm!`;
        case 'on_track': return pace.neededPerHour ? `${pace.neededPerHour} an hour finishes the day. Stay steady!` : 'Right on plan. Keep going!';
        case 'behind': return b.isToday && pace.neededPerHour ? `${remaining} to go — ${pace.neededPerHour} an hour gets us there!` : `${remaining} short of the target.`;
        case 'not_started': return `Today's goal is ${target} ${item}. Let's start strong!`;
        default: return 'Set a target on the Daily Target page.';
    }
};

const Ring = ({ percent, colors, children }: { percent: number; colors: [string, string]; children: React.ReactNode }) => {
    const r = 44;
    const c = 2 * Math.PI * r;
    const shown = Math.min(100, Math.max(0, percent));
    return (
        <div className="relative aspect-square w-full max-w-[44vh] mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="url(#ring)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
        </div>
    );
};

/** Falling gold and green pieces when the target is reached. */
const Confetti = () => {
    const bits = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100, delay: Math.random() * 4, dur: 4 + Math.random() * 4, size: 6 + Math.random() * 8,
        color: ['#D4AF37', '#E8C35A', '#34d399', '#F5E6CC', '#ffffff'][i % 5],
    })), []);
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
            {bits.map((b, i) => (
                <span key={i} className="absolute top-[-5%] rounded-sm opacity-80"
                    style={{ left: `${b.left}%`, width: b.size, height: b.size * 0.5, background: b.color, animation: `board-fall ${b.dur}s linear ${b.delay}s infinite` }} />
            ))}
        </div>
    );
};

const useClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
    return now;
};

/** Keeps the TV from going to sleep while the board is open (where the browser supports it). */
const useWakeLock = () => {
    useEffect(() => {
        let lock: { release: () => Promise<void> } | null = null;
        const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
        const get = async () => { try { lock = await nav.wakeLock?.request('screen') || null; } catch { /* not allowed */ } };
        get();
        const onVis = () => { if (document.visibilityState === 'visible') get(); };
        document.addEventListener('visibilitychange', onVis);
        return () => { document.removeEventListener('visibilitychange', onVis); lock?.release().catch(() => undefined); };
    }, []);
};

export default function ProductionBoard() {
    const { can } = useAuth();
    const [params] = useSearchParams();
    const date = params.get('date') || undefined;
    const [data, setData] = useState<ProductionBoardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cheer, setCheer] = useState(0);
    const [bump, setBump] = useState(false);
    const last = useRef<number | null>(null);
    const now = useClock();
    useWakeLock();

    const load = useCallback(async () => {
        try {
            const res = await http.get<ProductionBoardData>('/production/board', date ? { date } : undefined);
            setData(res.data);
            setError(null);
            if (last.current != null && res.data.achieved > last.current) { setBump(true); setTimeout(() => setBump(false), 1500); }
            last.current = res.data.achieved;
        } catch (err) {
            setError(errorMessage(err));
        }
    }, [date]);

    useEffect(() => {
        load();
        const t = setInterval(load, REFRESH_MS);
        return () => clearInterval(t);
    }, [load]);
    useEffect(() => { const t = setInterval(() => setCheer(c => c + 1), 12_000); return () => clearInterval(t); }, []);

    const cheers = useMemo(() => [data?.message, ...CHEERS].filter((m, i, a): m is string => Boolean(m) && a.indexOf(m) === i), [data?.message]);
    const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => undefined); };

    if (!can('production.view', 'production.edit', 'production.manage')) {
        return <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-8 text-center"><p>This account cannot open the production board.</p></div>;
    }
    if (!data) {
        return (
            <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center gap-4">
                <div className="h-14 w-14 rounded-full border-4 border-brand-gold/30 border-t-brand-gold animate-spin" />
                <p className="text-white/70">{error || 'Loading today\'s target…'}</p>
            </div>
        );
    }

    const s = STATUS[data.pace.status];
    const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    const perHour = data.target ? data.target / Math.max(1, (toMin(data.shift.end) - toMin(data.shift.start)) / 60) : 0;
    const maxBar = Math.max(perHour * 1.25, ...data.hourly.map(h => h.quantity), 1);
    const nowHour = `${String(now.getHours()).padStart(2, '0')}:00`;
    const monthPct = data.month.target ? Math.min(100, Math.round((data.month.achieved / data.month.target) * 100)) : 0;

    return (
        <div className="min-h-screen lg:h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1f1a0e_0%,_#121212_45%,_#0a0a0a_100%)] text-white font-poppins select-none">
            <style>{`
                @keyframes board-fall { 0% { transform: translateY(0) rotate(0); } 100% { transform: translateY(110vh) rotate(720deg); } }
                @keyframes board-pop { 0% { transform: scale(1); } 30% { transform: scale(1.12); } 100% { transform: scale(1); } }
                @keyframes board-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: none; } }
            `}</style>
            {data.pace.status === 'done' && <Confetti />}

            <div className="relative z-10 flex min-h-screen lg:h-screen flex-col gap-[1.8vh] p-[2.2vh_3vw]">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-[6vh] w-[6vh] min-h-10 min-w-10 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-dark flex items-center justify-center text-brand-black font-bold text-[2.6vh]">C</div>
                        <div>
                            <p className="text-[1.6vh] uppercase tracking-[0.35em] text-brand-champagne">Cstyle Factory</p>
                            <h1 className="m-0 text-[3.2vh] font-semibold leading-tight">Daily Production Target</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-[2vw]">
                        {data.peopleAtWork > 0 && <Chip label="Team at work" value={`${data.peopleAtWork} 👥`} />}
                        {data.nextHoliday && <Chip label="Next holiday" value={`${data.nextHoliday.poya ? '🌕 ' : ''}${data.nextHoliday.name.replace(/ Full Moon Poya Day/, ' Poya')} · ${shortDay(data.nextHoliday.date)}`} />}
                        <div className="text-right">
                            <p className="m-0 text-[4.4vh] font-semibold tabular-nums leading-none">{data.isToday ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Day report'}</p>
                            <p className="m-0 text-[1.7vh] text-white/60">{shortDay(data.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </header>

                {data.holiday && (
                    <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 px-6 py-3 text-center text-[2vh] text-brand-beige">
                        {data.holiday.poya ? '🌕 ' : '🎊 '}Today is {data.holiday.name}{data.holiday.observed ? ' — a holiday.' : '.'}
                    </div>
                )}

                {/* Main */}
                <main className="grid min-h-0 flex-1 grid-cols-1 gap-[1.8vh] lg:grid-cols-[1.05fr_1fr]">
                    <section className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-[3vh] flex flex-col items-center justify-center ${s.glow}`}>
                        <Ring percent={data.percent} colors={s.ring}>
                            <span className="text-[1.8vh] uppercase tracking-[0.3em] text-white/60">Finished</span>
                            <span className="text-[10vh] font-bold leading-none tabular-nums" style={bump ? { animation: 'board-pop 0.8s ease' } : undefined}>{data.achieved}</span>
                            <span className="text-[2.4vh] text-white/70 tabular-nums">of {data.target} {data.item}</span>
                            <span className={`mt-2 text-[3.4vh] font-semibold tabular-nums ${s.tone}`}>{data.percent}%</span>
                        </Ring>
                        {data.targetNote && <p className="mt-3 text-[1.8vh] text-brand-champagne">🎯 {data.targetNote}</p>}
                        {data.lastEntry && (
                            <p className="m-0 mt-[1.5vh] text-[2vh] text-white/70">
                                Latest: <b className="text-white">+{data.lastEntry.quantity}</b> {data.lastEntry.item || data.item}{data.lastEntry.time ? ` at ${data.lastEntry.time}` : ''}
                            </p>
                        )}
                    </section>

                    <section className="flex min-h-0 flex-col gap-[1.8vh]">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-[2.6vh_3vh]" key={data.pace.status} style={{ animation: 'board-fade 0.6s ease' }}>
                            <p className={`m-0 text-[5.6vh] font-bold leading-tight ${s.tone}`}>{ICON[data.pace.status]} {s.title}</p>
                            <p className="m-0 mt-2 text-[2.8vh] text-white/85">{statusLine(data)}</p>
                            <div className="mt-[2.5vh] grid grid-cols-3 gap-[1.5vw]">
                                <Stat label="Still to go" value={data.remaining} accent="text-brand-gold-light" />
                                <Stat label="Plan by now" value={data.isToday ? data.pace.expected : data.target} />
                                <Stat label={data.isToday ? 'Time left' : 'Last entry'} value={data.isToday ? `${Math.floor(data.pace.minutesLeft / 60)}h ${data.pace.minutesLeft % 60}m` : (data.lastEntry?.time || '—')} />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 rounded-[2rem] border border-white/10 bg-white/[0.04] p-[2.4vh_3vh] flex flex-col">
                            <div className="flex items-baseline justify-between">
                                <h2 className="m-0 text-[2.2vh] font-semibold">Hour by hour</h2>
                                {perHour > 0 && <span className="text-[1.6vh] text-white/50">Goal ≈ {Math.ceil(perHour)} an hour</span>}
                            </div>
                            {/* Bars only in this box, so the dashed goal line lines up with bar heights. */}
                            <div className="relative mt-[3.5vh] flex min-h-[10vh] flex-1 items-end gap-[0.8vw]">
                                {perHour > 0 && <div className="absolute inset-x-0 z-10 border-t-2 border-dashed border-white/40" style={{ bottom: `${(perHour / maxBar) * 100}%` }} />}
                                {data.hourly.map(h => {
                                    const isNow = data.isToday && h.hour === nowHour;
                                    const met = perHour > 0 && h.quantity >= perHour;
                                    return (
                                        <div key={h.hour} className={`relative flex-1 rounded-t-xl transition-all duration-700 ${met ? 'bg-gradient-to-t from-emerald-600 to-emerald-300' : 'bg-gradient-to-t from-brand-gold-dark to-brand-gold-light'} ${isNow ? 'ring-2 ring-white/80' : ''}`}
                                            style={{ height: `${(h.quantity / maxBar) * 100}%`, minHeight: h.quantity ? 6 : 2, opacity: h.quantity ? 1 : 0.25 }}>
                                            {h.quantity > 0 && <span className="absolute inset-x-0 -top-[2.8vh] text-center text-[1.8vh] font-semibold tabular-nums text-white/85">{h.quantity}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-1 flex gap-[0.8vw]">
                                {data.hourly.map(h => (
                                    <span key={h.hour} className={`flex-1 text-center text-[1.5vh] tabular-nums ${data.isToday && h.hour === nowHour ? 'text-white font-semibold' : 'text-white/50'}`}>{h.hour.slice(0, 2)}</span>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer: week, streak, month */}
                <footer className="grid grid-cols-1 gap-[1.8vh] lg:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-[2vh_2.4vh]">
                        <div className="flex items-baseline justify-between">
                            <h2 className="m-0 text-[2vh] font-semibold">This week</h2>
                            {data.streak > 1 && <span className="text-[2vh] font-semibold text-orange-300">🔥 {data.streak} days in a row on target</span>}
                        </div>
                        <div className="mt-[1.5vh] grid grid-cols-7 gap-[0.8vw]">
                            {data.week.map(d => (
                                <div key={d.date} className={`rounded-2xl px-2 py-[0.9vh] text-center border ${d.date === data.date ? 'border-brand-gold/70 bg-brand-gold/10' : 'border-white/10'} ${d.met ? 'bg-emerald-500/10' : ''}`}>
                                    <p className="m-0 text-[1.5vh] text-white/60">{shortDay(d.date, { weekday: 'short' })}</p>
                                    <p className="m-0 text-[2.6vh] font-bold tabular-nums">{d.achieved}</p>
                                    <p className="m-0 text-[1.4vh] text-white/50">{d.met ? '✅ target' : d.target ? `/ ${d.target}` : 'off'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-[2vh_2.4vh] flex flex-col justify-between gap-[1vh]">
                        <div className="flex items-baseline justify-between">
                            <h2 className="m-0 text-[2vh] font-semibold">This month</h2>
                            <span className="text-[1.7vh] text-white/60">{data.month.daysMet} of {data.month.workingDays} days on target</span>
                        </div>
                        <div>
                            <div className="h-[2.2vh] w-full overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-emerald-400 transition-all duration-1000" style={{ width: `${monthPct}%` }} />
                            </div>
                            <p className="m-0 mt-1 text-[1.8vh] tabular-nums text-white/80">{data.month.achieved.toLocaleString()} of {data.month.target.toLocaleString()} {data.item} · {monthPct}%</p>
                        </div>
                        {data.best && <p className="m-0 text-[1.7vh] text-brand-champagne">🏆 Best day this month: {data.best.achieved} on {shortDay(data.best.date)}</p>}
                    </div>
                </footer>

                <div className="flex items-center justify-between gap-4">
                    <p key={cheer} className="m-0 text-[2.6vh] font-medium text-brand-beige" style={{ animation: 'board-fade 0.8s ease' }}>✨ {cheers[cheer % cheers.length]}</p>
                    <div className="flex items-center gap-3 text-[1.4vh] text-white/40">
                        {error ? <span className="text-orange-300">Offline, retrying… ({error})</span>
                            : <span>Updated {new Date(data.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                        <button type="button" onClick={fullscreen} className="rounded-lg border border-white/20 px-3 py-1 text-white/70 hover:bg-white/10">Full screen</button>
                        <Link to="/admin/hr/production" className="rounded-lg border border-white/20 px-3 py-1 text-white/70 hover:bg-white/10">Back</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Chip = ({ label, value }: { label: string; value: string }) => (
    <div className="hidden md:block rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2">
        <p className="m-0 text-[1.3vh] uppercase tracking-[0.2em] text-white/50">{label}</p>
        <p className="m-0 text-[1.9vh] font-medium">{value}</p>
    </div>
);

const Stat = ({ label, value, accent = 'text-white' }: { label: string; value: string | number; accent?: string }) => (
    <div className="rounded-2xl bg-black/30 px-4 py-[1.6vh]">
        <p className="m-0 text-[1.5vh] uppercase tracking-[0.2em] text-white/50">{label}</p>
        <p className={`m-0 text-[4.2vh] font-bold tabular-nums leading-tight ${accent}`}>{value}</p>
    </div>
);
