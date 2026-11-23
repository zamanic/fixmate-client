"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ResultsPendingValue {
  pending: boolean;
  setPending: (pending: boolean) => void;
}

const IDLE: ResultsPendingValue = { pending: false, setPending: () => {} };

const ResultsPendingContext = createContext<ResultsPendingValue>(IDLE);

/**
 * Shares "the results are being re-fetched" between the Explore filter bar and
 * the grid beneath it. The filter bar owns the router transition; the grid
 * reads this so a filter change swaps in card skeletons instead of leaving dead
 * space under the filter card — and because the inputs stay mounted, the search
 * field never loses focus mid-typing.
 */
export function ResultsPendingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(false);
  const value = useMemo(() => ({ pending, setPending }), [pending]);

  return <ResultsPendingContext.Provider value={value}>{children}</ResultsPendingContext.Provider>;
}

/** Reads the shared pending flag; safe to call outside the provider. */
export function useResultsPending() {
  return useContext(ResultsPendingContext);
}
