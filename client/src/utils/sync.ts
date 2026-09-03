import { Habit, Violation } from '../types';
import { callSyncState, docToPayload } from './supabase';

/**
 * Cloud sync layer.
 *
 * The app is deployed as a static site (GitHub Pages), so there is no server to
 * arbitrate between the two devices. Both phones read and write one shared JSON
 * document. That means the merge rules live here, and they have to be:
 *
 *  - per-record, not per-document. The previous implementation PUT the whole
 *    local blob, so whoever saved last erased the partner's day entirely.
 *  - last-write-wins by timestamp, so a stale device coming back online cannot
 *    resurrect values the partner has since changed.
 *  - tombstoned for deletes, otherwise a deleted habit reappears on next pull.
 */

const STORAGE_KEY = 'challenge_state_v2';

export const DEFAULT_START_DATE = '2026-08-31';

export interface LogEntry {
  c: boolean;
  val: string | null;
  t: number;
}

export interface HabitEntry {
  h: Habit;
  t: number;
  del?: boolean;
}

export interface ViolationEntry {
  v: Violation;
  t: number;
  del?: boolean;
}

export interface ProfileEntry {
  name?: string;
  avatar_url?: string | null;
  t: number;
}

export interface SyncDoc {
  v: 2;
  logs: Record<string, LogEntry>;
  habits: Record<string, HabitEntry>;
  violations: Record<string, ViolationEntry>;
  settings: Record<string, { val: string; t: number }>;
  profiles: Record<string, ProfileEntry>;
  lastUpdated: number;
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 1, title: 'Минимальное количество шагов', category: 'active', target_type: 'number', target_sereja: '6000', target_lera: '6000', unit: 'шагов', assigned_to: 'both', is_active: 1, order_index: 1, created_at: '' },
  { id: 2, title: 'Время ко сну', category: 'active', target_type: 'time', target_sereja: '00:00', target_lera: '23:30', unit: '', assigned_to: 'both', is_active: 1, order_index: 2, created_at: '' },
  { id: 3, title: 'Занятие спортом', category: 'active', target_type: 'number', target_sereja: '40', target_lera: '40', unit: 'мин', assigned_to: 'both', is_active: 1, order_index: 3, created_at: '' },
  { id: 4, title: 'Изучение английского', category: 'active', target_type: 'number', target_sereja: '15', target_lera: '15', unit: 'мин', assigned_to: 'both', is_active: 1, order_index: 4, created_at: '' },
  { id: 10, title: 'Без газировок', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 10, created_at: '' },
  { id: 11, title: 'Без сладкого', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 11, created_at: '' },
  { id: 12, title: 'Без снеков', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 12, created_at: '' },
  { id: 13, title: 'Без Сока', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 13, created_at: '' },
  { id: 14, title: 'Без мазика и кетчупа', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 14, created_at: '' },
  { id: 15, title: 'Фастфуд (запрещено)', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 15, created_at: '' },
  { id: 16, title: 'Без жарки в масле', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 16, created_at: '' },
  { id: 17, title: 'Без алкоголя', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 17, created_at: '' },
  { id: 18, title: 'Без сигарет', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', assigned_to: 'both', is_active: 1, order_index: 18, created_at: '' },
];

/**
 * Wall clock only moves forward from this process's point of view. Two devices
 * with skewed clocks still converge, but a single device cannot regress and
 * lose its own writes.
 */
let lastStamp = 0;
export function stamp(): number {
  const now = Date.now();
  lastStamp = now > lastStamp ? now : lastStamp + 1;
  return lastStamp;
}

function emptyDoc(): SyncDoc {
  return { v: 2, logs: {}, habits: {}, violations: {}, settings: {}, profiles: {}, lastUpdated: 0 };
}

function seedHabits(doc: SyncDoc) {
  if (Object.keys(doc.habits).length > 0) return;
  for (const h of DEFAULT_HABITS) {
    // Seeded at t=1 so any real edit on either device always wins over the seed.
    doc.habits[String(h.id)] = { h: { ...h }, t: 1 };
  }
}

/** Migrates the pre-v2 flat localStorage keys (and the old cloud shape) into a SyncDoc. */
export function migrateLegacy(raw: {
  logs?: Record<string, boolean>;
  habits?: Habit[];
  violations?: Violation[];
  startDate?: string;
  avatars?: Record<string, string>;
  users?: Record<string, { name?: string; avatar_url?: string | null }>;
  lastUpdated?: number;
}): SyncDoc {
  const doc = emptyDoc();
  // Legacy records carry no per-record time, so date them at the document's own
  // lastUpdated (or 1). Any later edit therefore supersedes them.
  const t = raw.lastUpdated && raw.lastUpdated > 0 ? raw.lastUpdated : 1;

  for (const [key, val] of Object.entries(raw.logs || {})) {
    doc.logs[key] = { c: !!val, val: null, t };
  }
  for (const h of raw.habits || []) {
    doc.habits[String(h.id)] = { h, t, del: h.is_active === 0 ? true : undefined };
  }
  for (const v of raw.violations || []) {
    doc.violations[String(v.id)] = { v, t };
  }
  if (raw.startDate) doc.settings.startDate = { val: raw.startDate, t };
  for (const [uid, url] of Object.entries(raw.avatars || {})) {
    if (url) doc.profiles[uid] = { avatar_url: url, t };
  }
  for (const [uid, u] of Object.entries(raw.users || {})) {
    doc.profiles[uid] = { ...(doc.profiles[uid] || { t }), name: u.name, t };
  }
  doc.lastUpdated = t;
  return doc;
}

function isSyncDoc(x: any): x is SyncDoc {
  return !!x && x.v === 2 && typeof x.logs === 'object' && typeof x.habits === 'object';
}

/** Normalizes anything we might read (v2 doc, legacy blob, junk) into a SyncDoc. */
export function coerceDoc(raw: any): SyncDoc {
  // The payload carries the v2 document under `doc` plus a flat legacy mirror,
  // so a phone still running the previous bundle keeps working. Prefer `doc`.
  if (raw && typeof raw === 'object' && isSyncDoc(raw.doc)) return coerceDoc(raw.doc);
  if (isSyncDoc(raw)) {
    return {
      v: 2,
      logs: raw.logs || {},
      habits: raw.habits || {},
      violations: raw.violations || {},
      settings: raw.settings || {},
      profiles: raw.profiles || {},
      lastUpdated: raw.lastUpdated || 0,
    };
  }
  if (raw && typeof raw === 'object') return migrateLegacy(raw);
  return emptyDoc();
}

function mergeMap<T extends { t: number }>(a: Record<string, T>, b: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [key, entry] of Object.entries(b)) {
    const mine = out[key];
    // Strictly-greater keeps ties stable: a tie means nobody demonstrably
    // changed anything later, so we don't flip-flop between devices.
    if (!mine || entry.t > mine.t) out[key] = entry;
  }
  return out;
}

/** Per-record last-write-wins union of two documents. Commutative and idempotent. */
export function mergeDocs(a: SyncDoc, b: SyncDoc): SyncDoc {
  return {
    v: 2,
    logs: mergeMap(a.logs, b.logs),
    habits: mergeMap(a.habits, b.habits),
    violations: mergeMap(a.violations, b.violations),
    settings: mergeMap(a.settings, b.settings),
    profiles: mergeMap(a.profiles, b.profiles),
    lastUpdated: Math.max(a.lastUpdated, b.lastUpdated),
  };
}

// ---------------------------------------------------------------- local store

let cache: SyncDoc | null = null;

export function readLocal(): SyncDoc {
  if (cache) return cache;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      cache = coerceDoc(JSON.parse(stored));
      seedHabits(cache);
      return cache;
    } catch {
      // fall through to a legacy rebuild
    }
  }

  // First run on this device after the upgrade: fold the old keys in.
  const doc = migrateLegacy({
    logs: safeParse(localStorage.getItem('challenge_logs'), {}),
    habits: safeParse(localStorage.getItem('challenge_habits'), undefined),
    violations: safeParse(localStorage.getItem('challenge_violations'), undefined),
    startDate: localStorage.getItem('challenge_start_date') || undefined,
    avatars: safeParse(localStorage.getItem('challenge_avatars'), {}),
    users: safeParse(localStorage.getItem('challenge_users'), undefined),
  });
  seedHabits(doc);
  cache = doc;
  writeLocal(doc);
  return doc;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal(doc: SyncDoc) {
  cache = doc;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Storage full or blocked (private mode) — the in-memory cache still serves
    // this session, and the cloud copy is the durable one.
  }
}

/** Applies a mutation locally and schedules a push. Returns the new document. */
export function mutate(fn: (doc: SyncDoc) => void): SyncDoc {
  const doc = { ...readLocal() };
  fn(doc);
  doc.lastUpdated = stamp();
  writeLocal(doc);
  schedulePush();
  return doc;
}

// ---------------------------------------------------------------- cloud store

export type SyncStatus = 'idle' | 'syncing' | 'error';

const listeners = new Set<() => void>();
const statusListeners = new Set<(s: SyncStatus, at: number | null) => void>();

let status: SyncStatus = 'idle';
let lastSyncedAt: number | null = null;

export function onRemoteChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function onStatusChange(fn: (s: SyncStatus, at: number | null) => void): () => void {
  statusListeners.add(fn);
  fn(status, lastSyncedAt);
  return () => statusListeners.delete(fn);
}

function setStatus(s: SyncStatus) {
  status = s;
  if (s === 'idle') lastSyncedAt = Date.now();
  for (const fn of statusListeners) fn(status, lastSyncedAt);
}

function notifyChanged() {
  for (const fn of listeners) fn();
}

async function fetchRemote(signal?: AbortSignal): Promise<SyncDoc | null> {
  return callSyncState({}, signal);
}

/**
 * Fingerprint used to tell whether a pull actually changed anything on screen.
 * Folds in each record's own timestamp: counting keys alone missed a partner
 * *un*checking a habit we already had, and `lastUpdated` alone missed it too
 * whenever this device had written more recently than the partner.
 */
function fingerprint(doc: SyncDoc): string {
  let acc = 0;
  let count = 0;
  const fold = (map: Record<string, { t: number }>) => {
    for (const key of Object.keys(map)) {
      count++;
      // Order-independent so it does not depend on key insertion order.
      acc = (acc + map[key].t) % Number.MAX_SAFE_INTEGER;
    }
  };
  fold(doc.logs);
  fold(doc.habits);
  fold(doc.violations);
  fold(doc.settings);
  fold(doc.profiles);
  return `${count}:${acc}`;
}

/** Pulls the shared document and merges it into local state. */
export async function pullFromCloud(): Promise<boolean> {
  try {
    const remote = await fetchRemote();
    if (!remote) return false;

    const before = readLocal();
    const merged = mergeDocs(before, remote);
    seedHabits(merged);

    const changed = fingerprint(before) !== fingerprint(merged);
    writeLocal(merged);
    lastSyncedAt = Date.now();
    if (changed) notifyChanged();
    return changed;
  } catch {
    return false;
  }
}

/**
 * Send local records and take back the authoritative state. The database
 * resolves conflicts per record, so this cannot erase the partner's data even
 * if both phones push at the same moment.
 */
async function pushOnce(): Promise<boolean> {
  const local = readLocal();
  const remote = await callSyncState(docToPayload(local));

  const merged = mergeDocs(local, remote);
  seedHabits(merged);
  writeLocal(merged);
  return true;
}


let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight = false;
let pushQueued = false;
let pendingPush = false;

export function hasPendingChanges(): boolean {
  return pendingPush;
}

/** Debounces bursts of toggles into a single round trip. */
export function schedulePush(delay = 600) {
  pendingPush = true;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void flushPush();
  }, delay);
}

export async function flushPush(): Promise<void> {
  if (pushInFlight) {
    pushQueued = true;
    return;
  }
  pushInFlight = true;
  setStatus('syncing');

  try {
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      if (attempt > 0) await sleep(400 * attempt);
      ok = await pushOnce().catch(() => false);
    }
    if (ok) pendingPush = false;
    setStatus(ok ? 'idle' : 'error');
  } finally {
    pushInFlight = false;
    if (pushQueued) {
      pushQueued = false;
      schedulePush(200);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let pollTimer: ReturnType<typeof setInterval> | null = null;
let started = false;

/**
 * Starts background sync: periodic pull, plus an immediate pull whenever the
 * app is brought back to the foreground (phones suspend timers when hidden).
 */
export function startCloudSync(intervalMs = 4000): () => void {
  if (started) return () => undefined;
  started = true;

  void pullFromCloud();
  pollTimer = setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    void pullFromCloud();
    // Drain anything a previous failed push left behind.
    if (pendingPush && !pushInFlight) void flushPush();
  }, intervalMs);

  const onVisible = () => {
    if (!document.hidden) void pullFromCloud();
  };
  const onOnline = () => {
    void pullFromCloud();
    void flushPush();
  };

  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  window.addEventListener('online', onOnline);
  // Best-effort final flush so a toggle made right before closing is not lost.
  window.addEventListener('pagehide', () => void flushPush());

  return () => {
    started = false;
    if (pollTimer) clearInterval(pollTimer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
    window.removeEventListener('online', onOnline);
  };
}
