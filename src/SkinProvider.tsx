'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SkinBootOverlay } from './SkinBootOverlay.js';
import {
  skinNeedsBootIntro,
  parseStoredSkin,
  nextSkinInCycle,
} from './registry.js';
import type { PaletteFlavor, SkinRegistry } from './types.js';
import {
  applySkinDom,
  readStoredSkinRaw,
  type SkinStorageBackend,
  type SkinDomTarget,
} from './storage.js';
import { prefersReducedMotion } from './reduced-motion.js';

export interface SetSkinOptions {
  /** When false, skip boot ledger (e.g. hydration). Default: true when target defines boot lines. */
  withBoot?: boolean;
}

export interface SkinContextValue<Id extends string = string> {
  skin: Id;
  /** Single write path for DOM + persistence. */
  setSkin: (id: Id, options?: SetSkinOptions) => void;
  cycleSkin: () => void;
  isBooting: boolean;
  /** True after client has read storage / synced DOM. */
  ready: boolean;
  /** Screen reader announcement for non-visual transition status. */
  liveMessage: string | null;
  paletteFlavor: PaletteFlavor | undefined;
  /** Whether the given skin (default: current) would show a boot intro. */
  needsBootIntro: (id?: Id) => boolean;
}

const SkinContext = createContext<SkinContextValue<string> | undefined>(
  undefined,
);

export interface SkinProviderProps<Id extends string = string> {
  registry: SkinRegistry<Id>;
  children: ReactNode;
  /** Override storage (tests/SSR harness). Defaults to `localStorage` in the browser. */
  storage?: SkinStorageBackend | null;
  /** DOM node receiving `data-skin`. Defaults to `document.documentElement`. */
  domTarget?: SkinDomTarget | null;
}

export function SkinProvider<Id extends string>({
  registry,
  children,
  storage = null,
  domTarget = null,
}: SkinProviderProps<Id>) {
  const [skin, setSkinState] = useState<Id>(() => {
    if (typeof window === 'undefined') {
      return registry.defaultSkin;
    }
    const raw = readStoredSkinRaw(registry, storage);
    return parseStoredSkin(raw, registry);
  });
  const [ready, setReady] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootLines, setBootLines] = useState<readonly string[]>([]);
  const [bootLineIndex, setBootLineIndex] = useState(0);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);
  const bootTargetRef = useRef<Id | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearBootTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const finishBoot = useCallback(
    (id: Id) => {
      clearBootTimers();
      bootTargetRef.current = null;
      setBooting(false);
      setBootLines([]);
      setBootLineIndex(0);
      setSkinState(id);
      applySkinDom(id, registry, { target: domTarget, storage });
      setLiveMessage(`Applied ${String(id)} skin.`);
    },
    [clearBootTimers, domTarget, registry, storage],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const stored = parseStoredSkin(
      readStoredSkinRaw(registry, storage),
      registry,
    );
    setSkinState(stored);
    const target = domTarget ?? document.documentElement;
    target.setAttribute('data-skin', String(stored));
    setReady(true);
    return () => clearBootTimers();
  }, [clearBootTimers, domTarget, registry, storage]);

  const setSkin = useCallback(
    (id: Id, options?: SetSkinOptions) => {
      if (!registry.valid.has(String(id))) return;
      if (booting) return;
      if (id === skin) return;

      const needIntro = skinNeedsBootIntro(id, registry);
      const withBoot = options?.withBoot !== false && needIntro;

      if (withBoot && prefersReducedMotion()) {
        setSkinState(id);
        applySkinDom(id, registry, { target: domTarget, storage });
        setLiveMessage(`Applied ${String(id)} skin.`);
        return;
      }

      const lines = registry.byId[id]?.bootIntroLines;
      if (withBoot && lines?.length) {
        bootTargetRef.current = id;
        setBootLines(lines);
        setBootLineIndex(0);
        setBooting(true);
        return;
      }

      setSkinState(id);
      applySkinDom(id, registry, { target: domTarget, storage });
    },
    [booting, domTarget, registry, skin, storage],
  );

  useEffect(() => {
    if (!booting || bootLines.length === 0) return;
    if (!bootTargetRef.current) return;

    clearBootTimers();

    if (bootLineIndex < bootLines.length - 1) {
      const t = window.setTimeout(() => {
        setBootLineIndex((i) => i + 1);
      }, 220);
      timersRef.current.push(t);
    } else {
      const t = window.setTimeout(() => {
        const pending = bootTargetRef.current;
        if (pending) {
          finishBoot(pending);
        }
      }, 450);
      timersRef.current.push(t);
    }

    return () => clearBootTimers();
  }, [booting, bootLines, bootLineIndex, clearBootTimers, finishBoot]);

  const skipBoot = useCallback(() => {
    const t = bootTargetRef.current;
    if (t) finishBoot(t);
  }, [finishBoot]);

  const cycleSkin = useCallback(() => {
    const next = nextSkinInCycle(skin, registry);
    const withBootIntro = skinNeedsBootIntro(next, registry);
    setSkin(next, { withBoot: withBootIntro });
  }, [registry, skin, setSkin]);

  const needsBootIntro = useCallback(
    (id?: Id) => skinNeedsBootIntro(id ?? skin, registry),
    [registry, skin],
  );

  const paletteFlavor = registry.byId[skin]?.paletteFlavor;

  const value = useMemo<SkinContextValue<Id>>(
    () => ({
      skin,
      setSkin,
      cycleSkin,
      isBooting: booting,
      ready,
      liveMessage,
      paletteFlavor,
      needsBootIntro,
    }),
    [
      skin,
      setSkin,
      cycleSkin,
      booting,
      ready,
      liveMessage,
      paletteFlavor,
      needsBootIntro,
    ],
  );

  const visibleBootLines = bootLines.length
    ? Math.min(bootLineIndex + 1, bootLines.length)
    : 0;

  return (
    <SkinContext.Provider value={value as unknown as SkinContextValue<string>}>
      {children}
      <span
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liveMessage}
      </span>
      <SkinBootOverlay
        open={booting}
        lines={bootLines}
        visibleCount={visibleBootLines}
        onSkip={skipBoot}
      />
    </SkinContext.Provider>
  );
}

export function useSkin<Id extends string = string>(): SkinContextValue<Id> {
  const ctx = useContext(SkinContext);
  if (!ctx) {
    throw new Error('useSkin must be used within SkinProvider');
  }
  return ctx as unknown as SkinContextValue<Id>;
}
