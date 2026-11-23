"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/spinner";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/types";

import {
  hasActiveFilters,
  parseServiceQuery,
  SERVICE_SORTS,
  servicesHref,
  type ServiceQuery,
} from "./service-query";
import { useResultsPending } from "./results-pending";

/**
 * The Explore Services filter bar. The URL is the single source of truth: this
 * component never filters a local array, it only rewrites `?search=…&category=…`
 * and lets the server re-render the results grid.
 *
 * Text fields keep local state so typing stays instant and commit on a short
 * debounce; selects navigate immediately.
 */
const DEBOUNCE_MS = 350;

export function ServiceFilters({ total }: { total: number | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = parseServiceQuery(Object.fromEntries(searchParams.entries()));
  // Keeps the results swap a transition: the inputs below never unmount, so
  // typing keeps focus, while the grid below swaps to skeletons meanwhile.
  const [isPending, startTransition] = useTransition();
  // Mirror the router transition into the shared flag the results grid reads,
  // so a filter change swaps the grid for skeletons while this card keeps its
  // inputs mounted (typing is never interrupted).
  const { setPending } = useResultsPending();

  useEffect(() => {
    setPending(isPending);
  }, [isPending, setPending]);

  const [search, setSearch] = useState(query.search);
  const [area, setArea] = useState(query.area);
  const [minPrice, setMinPrice] = useState(query.minPrice);
  const [maxPrice, setMaxPrice] = useState(query.maxPrice);
  // Snapshot of the URL-backed text values last accepted into the fields above.
  const [syncedQuery, setSyncedQuery] = useState(query);

  // Re-sync the text fields when the URL changes from elsewhere — the back
  // button, a hero category card, the pagination links or "Clear all". This is
  // the documented "storing information from previous renders" adjustment:
  // compare the snapshot against the live URL and reset only when it drifted,
  // so typing (where the URL lags the field) never trips it.
  if (
    syncedQuery.search !== query.search ||
    syncedQuery.area !== query.area ||
    syncedQuery.minPrice !== query.minPrice ||
    syncedQuery.maxPrice !== query.maxPrice
  ) {
    setSyncedQuery(query);
    setSearch(query.search);
    setArea(query.area);
    setMinPrice(query.minPrice);
    setMaxPrice(query.maxPrice);
  }

  useEffect(() => {
    if (
      search === query.search &&
      area === query.area &&
      minPrice === query.minPrice &&
      maxPrice === query.maxPrice
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      const current = parseServiceQuery(Object.fromEntries(searchParams.entries()));
      startTransition(() => {
        router.replace(
          servicesHref({ ...current, search, area, minPrice, maxPrice, page: 1 }, 1),
          { scroll: false }
        );
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [
    search,
    area,
    minPrice,
    maxPrice,
    query.search,
    query.area,
    query.minPrice,
    query.maxPrice,
    router,
    searchParams,
    startTransition,
  ]);

  /** Apply one filter immediately, keeping every other filter (and live text). */
  function navigate(patch: Partial<ServiceQuery>) {
    const current = parseServiceQuery(Object.fromEntries(searchParams.entries()));
    const next: ServiceQuery = {
      ...current,
      search,
      area,
      minPrice,
      maxPrice,
      ...patch,
      page: 1,
    };
    startTransition(() => {
      router.replace(servicesHref(next, 1), { scroll: false });
    });
  }

  function clearAll() {
    setSearch("");
    setArea("");
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => {
      router.replace("/services", { scroll: false });
    });
  }

  return (
    <section
      aria-label="Filter services"
      className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem] lg:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="filter-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="filter-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search repairs, devices or technicians"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-sort" className="text-xs text-muted-foreground">
            Sort by
          </Label>
          <Select
            value={query.sort}
            onValueChange={(value) => navigate({ sort: value ?? "newest" })}
          >
            <SelectTrigger id="filter-sort" className="w-full">
              <SelectValue>
                {(value) =>
                  SERVICE_SORTS.find((sort) => sort.value === value)?.label ?? "Newest first"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SERVICE_SORTS.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
            Category
          </Label>
          <Select
            value={query.category}
            onValueChange={(value) => navigate({ category: value ?? "" })}
          >
            <SelectTrigger id="filter-category" className="w-full">
              <SelectValue>
                {(value) => (value ? String(value) : "All categories")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {SERVICE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-mode" className="text-xs text-muted-foreground">
            Service mode
          </Label>
          <Select
            value={query.mode}
            onValueChange={(value) => navigate({ mode: value ?? "" })}
          >
            <SelectTrigger id="filter-mode" className="w-full">
              <SelectValue>{(value) => (value ? String(value) : "Any mode")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any mode</SelectItem>
              {SERVICE_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-area" className="text-xs text-muted-foreground">
            Service area
          </Label>
          <Input
            id="filter-area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="e.g. Downtown"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-min" className="text-xs text-muted-foreground">
            Min price
          </Label>
          <Input
            id="filter-min"
            type="number"
            inputMode="numeric"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="$0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-max" className="text-xs text-muted-foreground">
            Max price
          </Label>
          <Input
            id="filter-max"
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {isPending ? (
            <>
              <Spinner className="size-3.5" /> Updating results…
            </>
          ) : total === null ? (
            "Loading results…"
          ) : (
            `${total} service${total === 1 ? "" : "s"} found`
          )}
        </p>
        {hasActiveFilters(query) ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            <X /> Clear all
          </Button>
        ) : null}
      </div>
    </section>
  );
}
