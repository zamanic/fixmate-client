import type { Service } from "@/lib/types";

/**
 * Explore Services query vocabulary — the single place where the URL params,
 * the API query string and the pagination links are derived from. The URL is
 * the source of truth: every filter and page lives here so server and client
 * always mean the same thing.
 */

/** Grid page size (3 columns × 3 rows). */
export const SERVICE_PAGE_SIZE = 9;

/** Sort vocabulary — mirrors the API's `sort` values exactly. */
export const SERVICE_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Top rated" },
] as const;

export type ServiceSort = (typeof SERVICE_SORTS)[number]["value"];

/** Everything the Explore page understands. Empty string = filter not set. */
export interface ServiceQuery {
  search: string;
  category: string;
  mode: string;
  area: string;
  minPrice: string;
  maxPrice: string;
  sort: ServiceSort;
  page: number;
  limit: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Read a raw URL query into a typed, validated filter set. */
export function parseServiceQuery(sp: RawSearchParams): ServiceQuery {
  const sortRaw = first(sp.sort);
  const sort: ServiceSort = SERVICE_SORTS.some((s) => s.value === sortRaw)
    ? (sortRaw as ServiceSort)
    : "newest";

  const pageNum = Number.parseInt(first(sp.page), 10);
  const limitNum = Number.parseInt(first(sp.limit), 10);

  return {
    search: first(sp.search).trim(),
    category: first(sp.category),
    mode: first(sp.mode),
    area: first(sp.area).trim(),
    minPrice: first(sp.minPrice).trim(),
    maxPrice: first(sp.maxPrice).trim(),
    sort,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 24) : SERVICE_PAGE_SIZE,
  };
}

/** The filter set (no paging) as query params — shared by links and API calls. */
function filterParams(query: ServiceQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.mode) params.set("mode", query.mode);
  if (query.area) params.set("area", query.area);
  if (query.minPrice) params.set("minPrice", query.minPrice);
  if (query.maxPrice) params.set("maxPrice", query.maxPrice);
  if (query.sort !== "newest") params.set("sort", query.sort);
  return params;
}

/** A `/services?...` href for a given page, preserving every filter. */
export function servicesHref(query: ServiceQuery, page: number): string {
  const params = filterParams(query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/services?${qs}` : "/services";
}

/** The public API path for the current filter set. */
export function serviceApiPath(query: ServiceQuery): string {
  const params = filterParams(query);
  params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  return `/api/services?${params.toString()}`;
}

/** True when any filter (not just paging/sort) narrows the results. */
export function hasActiveFilters(query: ServiceQuery): boolean {
  return Boolean(
    query.search ||
      query.category ||
      query.mode ||
      query.area ||
      query.minPrice ||
      query.maxPrice ||
      query.sort !== "newest"
  );
}

/**
 * The API may or may not include aggregate rating fields yet — read them
 * defensively so an unrated listing reads as "New" instead of NaN.
 */
export function readRating(service: Service): { average: number; count: number } {
  const record = service as Service & { rating?: number | null; ratingCount?: number | null };
  const count =
    typeof record.ratingCount === "number" && record.ratingCount > 0 ? record.ratingCount : 0;
  const average =
    typeof record.rating === "number" && Number.isFinite(record.rating) ? record.rating : 0;
  return { average, count };
}
