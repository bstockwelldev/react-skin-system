'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { prefersReducedMotion } from './reduced-motion.js';

export interface SkinBootOverlayClassNames {
  /** Root fullscreen backdrop (presentation layer). */
  backdrop?: string;
  /** Modal dialog panel. */
  panel?: string;
  /** Accessible title element. */
  title?: string;
  /** monospace / log body */
  body?: string;
  /** Footer row container */
  footer?: string;
  /** Primary Skip control */
  skipButton?: string;
  /** Companion hint text */
  hint?: string;
}

export interface SkinBootOverlayTexts {
  title?: string;
  skip?: string;
  hint?: string;
}

export interface SkinBootOverlayProps {
  open: boolean;
  lines: readonly string[];
  /** Number of lines to show from the start (1-based count). */
  visibleCount: number;
  onSkip: () => void;
  classNames?: SkinBootOverlayClassNames;
  texts?: SkinBootOverlayTexts;
}

function defaultBackdropStyle(reducedMotion: boolean): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 2147483646,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    background: '#0c0f14',
    color: '#e9eefc',
    transition: reducedMotion ? undefined : 'opacity 120ms ease-out',
    opacity: 1,
    boxSizing: 'border-box',
  };
}

function defaultPanelStyle(): CSSProperties {
  return {
    pointerEvents: 'auto',
    maxHeight: 'min(88vh, 720px)',
    width: '100%',
    maxWidth: 512,
    overflowY: 'auto',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    padding: 24,
    boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
    background: '#111520',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 14,
    lineHeight: 1.5,
  };
}

/**
 * Full-screen boot ledger before applying a skin that defines intro lines.
 * Headless-friendly: no Tailwind/shadcn; override `classNames` for host branding.
 */
export function SkinBootOverlay({
  open,
  lines,
  visibleCount,
  onSkip,
  classNames,
  texts,
}: SkinBootOverlayProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    skipRef.current?.focus();
    return () => {
      lastActiveElementRef.current?.focus?.();
      lastActiveElementRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onSkip]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onBackdropPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onSkip();
      }
    },
    [onSkip],
  );

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const shown = lines.slice(
    0,
    Math.max(0, Math.min(visibleCount, lines.length)),
  );

  const title = texts?.title ?? 'System boot';
  const skipLabel = texts?.skip ?? 'Skip (Esc)';
  const hint =
    texts?.hint ?? 'Theme will apply when boot finishes.';

  return createPortal(
    <div
      role="presentation"
      className={classNames?.backdrop}
      style={classNames?.backdrop ? undefined : defaultBackdropStyle(reducedMotion)}
      onPointerDown={onBackdropPointerDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={classNames?.panel}
        style={classNames?.panel ? undefined : defaultPanelStyle()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2
          id={titleId}
          className={classNames?.title}
          style={
            classNames?.title
              ? undefined
              : { margin: '0 0 16px', fontSize: 18, fontWeight: 600 }
          }
        >
          {title}
        </h2>
        <pre
          className={classNames?.body}
          style={
            classNames?.body
              ? undefined
              : {
                  margin: '0 0 16px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 13,
                }
          }
          aria-live="polite"
          aria-atomic="false"
        >
          {shown.join('\n')}
        </pre>
        <div
          className={classNames?.footer}
          style={
            classNames?.footer
              ? undefined
              : { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }
          }
        >
          <button
            ref={skipRef}
            type="button"
            className={classNames?.skipButton}
            style={
              classNames?.skipButton
                ? undefined
                : {
                    minHeight: 44,
                    minWidth: 44,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'inherit',
                    cursor: 'pointer',
                  }
            }
            onClick={onSkip}
          >
            {skipLabel}
          </button>
          <span
            className={classNames?.hint}
            style={
              classNames?.hint
                ? undefined
                : { fontSize: 12, opacity: 0.75 }
            }
          >
            {hint}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
