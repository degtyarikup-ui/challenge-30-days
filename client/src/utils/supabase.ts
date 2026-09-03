import { SyncDoc, LogEntry, HabitEntry, ViolationEntry, ProfileEntry } from './sync';
import { Habit, UserId, Violation } from '../types';

/**
 * Transport for the shared challenge state.
 *
 * Everything goes through one `sync_state` RPC: it applies this device's
 * records last-write-wins *inside the database* and returns the full current
 * state in the same round trip. The tables themselves are not reachable with
 * this key (RLS on, no policies, no grants), so the key in this bundle can
 * only exchange challenge state.
 *
 * The previous backend was a public demo API holding one JSON blob, where the
 * last device to save overwrote the other's day.
 */

// The anon key is designed to ship in client bundles; it is not a secret.
// Both are overridable at build time for a different environment.
// `import.meta.env` is absent outside the Vite bundle (e.g. a plain Node test
// run), so read it defensively rather than throwing at module load.
const env: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://pszeugqdnudbherkpjwx.supabase.co';
export const SUPABASE_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8P6qk9OJJ6AiKc8QK44-gA_aWqBSyUq';

const RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/sync_state`;

interface RemoteHabit {
  id: number; title: string; category: string; target_type: string;
  target_sereja: string; target_lera: string; unit: string; icon: string | null;
  assigned_to: string; is_active: number; order_index: number;
  deleted: boolean; created_at: string; updated_at: string;
}
interface RemoteLog {
  habit_id: number; user_id: UserId; date: string;
  completed: boolean; value: string | null; updated_at: string;
}
interface RemoteViolation {
  id: number; user_id: UserId; date: string; rule_title: string;
  note: string | null; deleted: boolean; created_at: string; updated_at: string;
}
interface RemoteSetting { key: string; value: string; updated_at: string }
interface RemoteProfile { user_id: UserId; name: string | null; avatar_url: string | null; updated_at: string }

interface RemoteState {
  habits: RemoteHabit[];
  habit_logs: RemoteLog[];
  violations: RemoteViolation[];
  settings: RemoteSetting[];
  profiles: RemoteProfile[];
  server_time: string;
}

const toMs = (iso: string): number => {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 1 : ms;
};
const toIso = (ms: number): string => new Date(ms).toISOString();

/** Postgres `date` comes back as YYYY-MM-DD already; guard against a timestamp. */
const toDateStr = (d: string): string => (d.length > 10 ? d.slice(0, 10) : d);

export function remoteToDoc(remote: RemoteState): SyncDoc {
  const logs: Record<string, LogEntry> = {};
  for (const l of remote.habit_logs || []) {
    logs[`${l.habit_id}_${l.user_id}_${toDateStr(l.date)}`] = {
      c: !!l.completed,
      val: l.value,
      t: toMs(l.updated_at),
    };
  }

  const habits: Record<string, HabitEntry> = {};
  for (const h of remote.habits || []) {
    const habit: Habit = {
      id: h.id,
      title: h.title,
      category: h.category as Habit['category'],
      target_type: h.target_type as Habit['target_type'],
      target_sereja: h.target_sereja,
      target_lera: h.target_lera,
      unit: h.unit,
      icon: h.icon || undefined,
      assigned_to: (h.assigned_to || 'both') as Habit['assigned_to'],
      is_active: h.deleted ? 0 : h.is_active,
      order_index: h.order_index,
      created_at: h.created_at,
    };
    habits[String(h.id)] = { h: habit, t: toMs(h.updated_at), del: h.deleted || undefined };
  }

  const violations: Record<string, ViolationEntry> = {};
  for (const v of remote.violations || []) {
    const violation: Violation = {
      id: v.id,
      user_id: v.user_id,
      date: toDateStr(v.date),
      rule_title: v.rule_title,
      note: v.note,
      created_at: v.created_at,
    };
    violations[String(v.id)] = { v: violation, t: toMs(v.updated_at), del: v.deleted || undefined };
  }

  const settings: Record<string, { val: string; t: number }> = {};
  for (const s of remote.settings || []) {
    // The DB names it start_date; the client document uses startDate.
    const key = s.key === 'start_date' ? 'startDate' : s.key;
    settings[key] = { val: s.value, t: toMs(s.updated_at) };
  }

  const profiles: Record<string, ProfileEntry> = {};
  for (const p of remote.profiles || []) {
    profiles[p.user_id] = {
      name: p.name || undefined,
      avatar_url: p.avatar_url,
      t: toMs(p.updated_at),
    };
  }

  const stamps = [
    ...Object.values(logs).map((e) => e.t),
    ...Object.values(habits).map((e) => e.t),
    ...Object.values(violations).map((e) => e.t),
  ];

  return {
    v: 2,
    logs,
    habits,
    violations,
    settings,
    profiles,
    lastUpdated: stamps.length ? Math.max(...stamps) : 0,
  };
}

/**
 * The whole local document is sent. It is a few hundred rows at most, the
 * database ignores anything older than what it already holds, and sending
 * everything makes the sync self-healing after a device has been offline.
 */
export function docToPayload(doc: SyncDoc) {
  const habit_logs = Object.entries(doc.logs).map(([key, e]) => {
    const idx = key.indexOf('_');
    const idx2 = key.indexOf('_', idx + 1);
    return {
      habit_id: Number(key.slice(0, idx)),
      user_id: key.slice(idx + 1, idx2),
      date: key.slice(idx2 + 1),
      completed: e.c,
      value: e.val,
      updated_at: toIso(e.t),
    };
  });

  const habits = Object.values(doc.habits).map((e) => ({
    id: e.h.id,
    title: e.h.title,
    category: e.h.category,
    target_type: e.h.target_type,
    target_sereja: e.h.target_sereja,
    target_lera: e.h.target_lera,
    unit: e.h.unit,
    icon: e.h.icon ?? null,
    assigned_to: e.h.assigned_to || 'both',
    is_active: e.h.is_active,
    order_index: e.h.order_index,
    deleted: !!e.del,
    created_at: e.h.created_at || undefined,
    updated_at: toIso(e.t),
  }));

  const violations = Object.values(doc.violations).map((e) => ({
    id: e.v.id,
    user_id: e.v.user_id,
    date: e.v.date,
    rule_title: e.v.rule_title,
    note: e.v.note,
    deleted: !!e.del,
    created_at: e.v.created_at || undefined,
    updated_at: toIso(e.t),
  }));

  const settings = Object.entries(doc.settings).map(([key, e]) => ({
    key: key === 'startDate' ? 'start_date' : key,
    value: e.val,
    updated_at: toIso(e.t),
  }));

  const profiles = Object.entries(doc.profiles).map(([user_id, e]) => ({
    user_id,
    name: e.name ?? null,
    avatar_url: e.avatar_url ?? null,
    updated_at: toIso(e.t),
  }));

  return { habits, habit_logs, violations, settings, profiles };
}

/** One round trip: apply `payload` (may be empty for a pure read), get full state. */
export async function callSyncState(
  payload: ReturnType<typeof docToPayload> | Record<string, never>,
  signal?: AbortSignal
): Promise<SyncDoc> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`sync_state failed: ${res.status} ${await res.text().catch(() => '')}`);
  }
  return remoteToDoc((await res.json()) as RemoteState);
}
