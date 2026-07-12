"use client";

import { useCallback, useState } from "react";

interface Layer<T> {
  past: T[];
  present: T;
  future: T[];
}

const LIMIT = 100;

/**
 * Per-layer undo/redo history over an arbitrary snapshot type `T`.
 *
 * The PDF editor keys each page by its id and stores `{ annotations, rotation }`
 * so a single undo reverts both the drawings and the page orientation. The
 * image editor stores the same shape under one fixed key. Undo/redo always
 * target the active key.
 */
export function useLayeredHistory<T>() {
  const [layers, setLayers] = useState<Record<string, Layer<T>>>({});

  const get = useCallback(
    (key: string): T | undefined => layers[key]?.present,
    [layers]
  );

  /** Live update WITHOUT touching history (used during a drag preview). */
  const setLive = useCallback((key: string, next: T) => {
    setLayers((prev) => {
      const cur = prev[key];
      if (!cur) return prev;
      return { ...prev, [key]: { ...cur, present: next } };
    });
  }, []);

  /** Commit a change and push the previous state onto the undo stack. */
  const commit = useCallback((key: string, next: T) => {
    setLayers((prev) => {
      const cur = prev[key];
      if (!cur) {
        return { ...prev, [key]: { past: [], present: next, future: [] } };
      }
      const past = [...cur.past, cur.present].slice(-LIMIT);
      return { ...prev, [key]: { past, present: next, future: [] } };
    });
  }, []);

  const undo = useCallback((key: string) => {
    setLayers((prev) => {
      const cur = prev[key];
      if (!cur || cur.past.length === 0) return prev;
      const previous = cur.past[cur.past.length - 1];
      return {
        ...prev,
        [key]: {
          past: cur.past.slice(0, -1),
          present: previous,
          future: [cur.present, ...cur.future].slice(0, LIMIT),
        },
      };
    });
  }, []);

  const redo = useCallback((key: string) => {
    setLayers((prev) => {
      const cur = prev[key];
      if (!cur || cur.future.length === 0) return prev;
      const nextState = cur.future[0];
      return {
        ...prev,
        [key]: {
          past: [...cur.past, cur.present].slice(-LIMIT),
          present: nextState,
          future: cur.future.slice(1),
        },
      };
    });
  }, []);

  const canUndo = useCallback((key: string) => (layers[key]?.past.length ?? 0) > 0, [layers]);
  const canRedo = useCallback((key: string) => (layers[key]?.future.length ?? 0) > 0, [layers]);

  /** Resets all layers (e.g. a new document is loaded). */
  const reset = useCallback((initial?: Record<string, T>) => {
    if (!initial) return setLayers({});
    const next: Record<string, Layer<T>> = {};
    for (const [k, v] of Object.entries(initial)) {
      next[k] = { past: [], present: v, future: [] };
    }
    setLayers(next);
  }, []);

  return { get, setLive, commit, undo, redo, canUndo, canRedo, reset };
}
