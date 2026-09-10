import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { LoadingScreen } from "@/components/ui/spinner";

import { processingService, datasetService } from "@/services/api";

import { formatNumber, formatPercent } from "@/utils/formatters";

export default function DataProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfiling, setIsProfiling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const datasetRes = await datasetService.getById(id);
      setDataset(datasetRes.data?.data || null);

      try {
        const resultsRes = await processingService.getResults(id);
        const profilingResult = resultsRes.data?.data?.profilingResult ?? null;

        if (import.meta.env.DEV) {
          console.debug(
            "[DataProfile] loaded profilingResult:",
            profilingResult,
          );
        }

        setProfile(profilingResult);
      } catch (err) {
        // 404 = no results yet — expected, stay silent
        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.message || "Failed to load profiling results.",
          );
        }
        setProfile(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dataset details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const runProfiling = async () => {
    try {
      setIsProfiling(true);
      setError(null);

      const res = await processingService.profile(id);
      const profileData = res.data?.data ?? null;

      if (import.meta.env.DEV) {
        console.debug("[DataProfile] runProfiling result:", profileData);
        console.debug("[DataProfile] columns:", profileData?.columns);
      }

      setProfile(profileData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Profiling failed. Please try again.",
      );
    } finally {
      setIsProfiling(false);
    }
  };

  const columns = profile?.columns || [];

  const profileSummary = useMemo(() => {
    if (!profile) return null;

    const missingColumns = columns.filter(
      (column) => Number(column.missingPercentage || 0) > 0,
    ).length;

    const numericColumns = columns.filter(
      (column) => column.semanticType === "numeric",
    ).length;

    const idColumns = columns.filter(
      (column) => column.semanticType === "id",
    ).length;

    return {
      missingColumns,
      numericColumns,
      idColumns,
    };
  }, [profile, columns]);

  if (isLoading) {
    return (
      <div className="h-full min-h-0">
        <LoadingScreen message="Loading data profile..." />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-10" />

        <div
          className="
            absolute
            -right-48
            -top-48
            h-[520px]
            w-[520px]
            rounded-full
            bg-primary/5
            blur-[140px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          min-h-0
          max-w-[1600px]
          flex-col
          overflow-hidden
          px-5
          py-5
          sm:px-6
          sm:py-6
          lg:px-8
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="shrink-0">
          <div
            className="
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary-soft
                    text-primary
                  "
                >
                  <Layers3 className="h-3.5 w-3.5" />
                </div>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-muted
                  "
                >
                  Data profile
                </span>

                {profile && (
                  <span
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-success/10
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      text-success
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Profiled
                  </span>
                )}
              </div>

              <div className="mt-3 flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />

                <h1
                  className="
                    min-w-0
                    truncate
                    text-xl
                    font-black
                    tracking-[-0.035em]
                    sm:text-2xl
                  "
                  title={dataset?.originalName}
                >
                  {dataset?.originalName || "Dataset Profile"}
                </h1>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {formatNumber(profile?.rowCount || dataset?.rowCount || 0)}{" "}
                  rows
                </span>

                <span className="h-1 w-1 rounded-full bg-border-strong" />

                <span>
                  {formatNumber(
                    profile?.columnCount ||
                      dataset?.columnCount ||
                      columns.length ||
                      0,
                  )}{" "}
                  columns
                </span>

                <span className="h-1 w-1 rounded-full bg-border-strong" />

                <span className="font-mono text-[10px]">{id}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={runProfiling}
                disabled={isProfiling}
                className="h-9 gap-2 rounded-lg"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isProfiling ? "animate-spin" : ""}`}
                />

                {isProfiling
                  ? "Profiling..."
                  : profile
                    ? "Re-profile"
                    : "Run profile"}
              </Button>

              <Button
                onClick={() => navigate(`/datasets/${id}/validation`)}
                className="h-9 gap-2 rounded-lg"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Validation
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-4 shrink-0">
            <Alert variant="danger" onDismiss={() => setError(null)}>
              <div className="flex items-start gap-2.5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        {/* =====================================================
            PROFILE CONTENT
        ====================================================== */}

        {!profile ? (
          <ProfileEmptyState
            isProfiling={isProfiling}
            onRunProfile={runProfiling}
          />
        ) : (
          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {/* =================================================
                SUMMARY STRIP
            ================================================== */}

            <section
              className="
                grid
                shrink-0
                grid-cols-2
                overflow-hidden
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
                sm:grid-cols-4
              "
            >
              <Metric
                icon={Layers3}
                label="Rows"
                value={formatNumber(profile.rowCount)}
              />

              <Metric
                icon={Database}
                label="Columns"
                value={formatNumber(profile.columnCount)}
                bordered
              />

              <Metric
                icon={FileSpreadsheet}
                label="Missing data"
                value={formatPercent(profile.missingPercentage)}
                tone={
                  Number(profile.missingPercentage || 0) > 0
                    ? "warning"
                    : "success"
                }
                bordered
              />

              <Metric
                icon={CheckCircle2}
                label="Duplicate rows"
                value={formatNumber(profile.duplicateRows || 0)}
                tone={
                  Number(profile.duplicateRows || 0) > 0 ? "warning" : "success"
                }
                bordered
              />
            </section>

            {/* =================================================
                SECONDARY PROFILE SUMMARY
            ================================================== */}

            <section
              className="
                grid
                shrink-0
                grid-cols-1
                border
                border-border
                bg-surface/60
                sm:grid-cols-3
              "
            >
              <SummaryItem
                label="Columns with missing values"
                value={profileSummary.missingColumns}
                description={
                  profileSummary.missingColumns === 0
                    ? "No missing-value columns detected"
                    : "Review these columns before validation"
                }
                tone={profileSummary.missingColumns > 0 ? "warning" : "success"}
              />

              <SummaryItem
                label="Numeric columns"
                value={profileSummary.numericColumns}
                description="Columns available for statistical analysis"
              />

              <SummaryItem
                label="Identifier columns"
                value={profileSummary.idColumns}
                description="Columns detected as identifiers"
              />
            </section>

            {/* =================================================
                COLUMN DIAGNOSTICS
            ================================================== */}

            <section
              className="
                relative
                flex
                min-h-0
                flex-1
                flex-col
                overflow-hidden
                border
                border-border
                bg-surface/80
                backdrop-blur-sm
              "
            >
              <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />

              <div
                className="
                  flex
                  shrink-0
                  flex-col
                  gap-2
                  border-b
                  border-border
                  px-4
                  py-3.5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-5
                "
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />

                    <h2 className="text-sm font-bold">Column diagnostics</h2>

                    <span
                      className="
                        rounded-full
                        bg-surface-secondary
                        px-2
                        py-0.5
                        font-mono
                        text-[10px]
                        font-medium
                        text-muted-foreground
                      "
                    >
                      {columns.length}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Structure, completeness, uniqueness, and statistical
                    characteristics for each column.
                  </p>
                </div>

                <span className="shrink-0 font-mono text-[10px] text-muted">
                  {formatNumber(profile.rowCount)} records
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                <ColumnTable columns={columns} />
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-border
                  bg-surface
                  px-4
                  py-2.5
                  sm:px-5
                "
              >
                <span className="text-[10px] text-muted-foreground">
                  {columns.length} {columns.length === 1 ? "column" : "columns"}{" "}
                  analyzed
                </span>

                <span className="hidden text-[10px] text-muted-foreground sm:inline">
                  Scroll horizontally for additional metrics
                </span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   METRIC
============================================================ */

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default",
  bordered = false,
}) {
  const toneClass = {
    default: "text-primary bg-primary-soft",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
  };

  return (
    <div
      className={`
        flex
        items-center
        gap-3
        px-4
        py-3.5
        sm:px-5
        ${bordered ? "border-l border-border" : ""}
      `}
    >
      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${toneClass[tone]}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          {label}
        </p>

        <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({ label, value, description, tone = "default" }) {
  const valueClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-foreground";

  return (
    <div
      className="
        border-b
        border-border
        px-4
        py-3
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:px-5
        sm:last:border-r-0
      "
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          {label}
        </span>

        <span
          className={`
            font-mono
            text-sm
            font-bold
            tabular-nums
            ${valueClass}
          `}
        >
          {value}
        </span>
      </div>

      <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}

/* ============================================================
   COLUMN TABLE
============================================================ */

function ColumnTable({ columns }) {
  if (!columns.length) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center px-6">
        <div className="text-center">
          <Layers3 className="mx-auto h-8 w-8 text-muted" />

          <p className="mt-3 text-sm font-semibold">
            No column diagnostics available
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            The profile did not return column-level results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[1080px] border-collapse text-left">
      <thead className="sticky top-0 z-10 border-b border-border bg-surface-secondary">
        <tr>
          <TableHeading>Column</TableHeading>
          <TableHeading>Type</TableHeading>
          <TableHeading>Semantic</TableHeading>
          <TableHeading>Missing</TableHeading>
          <TableHeading>Unique</TableHeading>
          <TableHeading>Min / Max</TableHeading>
          <TableHeading>Mean / Median</TableHeading>
          <TableHeading>Std dev</TableHeading>
        </tr>
      </thead>

      <tbody>
        {columns.map((column) => (
          <ColumnRow key={column.name} column={column} />
        ))}
      </tbody>
    </table>
  );
}

/* ============================================================
   COLUMN ROW
============================================================ */

function ColumnRow({ column }) {
  const missingPercentage = Number(column.missingPercentage || 0);

  const semanticTone =
    column.semanticType === "numeric"
      ? "info"
      : column.semanticType === "id"
        ? "default"
        : "primary";

  return (
    <tr
      className="
        border-b
        border-border
        transition-colors
        last:border-b-0
        hover:bg-surface-secondary/40
      "
    >
      {/* Column */}

      <td className="px-4 py-3.5 sm:px-5">
        <div className="min-w-[180px]">
          <p
            className="
              truncate
              font-mono
              text-xs
              font-semibold
              text-foreground
            "
            title={column.name}
          >
            {column.name}
          </p>

          <p className="mt-0.5 text-[10px] text-muted">Column</p>
        </div>
      </td>

      {/* Type */}

      <td className="px-4 py-3.5 sm:px-5">
        <span
          className="
            inline-flex
            rounded-md
            border
            border-border
            bg-surface-secondary
            px-2
            py-1
            font-mono
            text-[10px]
            font-medium
            text-muted-foreground
          "
        >
          {column.dtype || "unknown"}
        </span>
      </td>

      {/* Semantic */}

      <td className="px-4 py-3.5 sm:px-5">
        <Badge variant={semanticTone}>{column.semanticType || "unknown"}</Badge>
      </td>

      {/* Missing */}

      <td className="px-4 py-3.5 sm:px-5">
        <div className="min-w-[120px]">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`
                font-mono
                text-xs
                font-medium
                tabular-nums
                ${missingPercentage > 0 ? "text-warning" : "text-success"}
              `}
            >
              {formatPercent(missingPercentage)}
            </span>

            <span className="text-[10px] text-muted">
              {formatNumber(column.missingCount || 0)}
            </span>
          </div>

          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="
                h-full
                rounded-full
                bg-warning
                transition-all
              "
              style={{
                width: `${Math.min(missingPercentage, 100)}%`,
              }}
            />
          </div>
        </div>
      </td>

      {/* Unique */}

      <td className="px-4 py-3.5 sm:px-5">
        <div>
          <p className="font-mono text-xs tabular-nums">
            {formatNumber(column.uniqueCount || 0)}
          </p>

          <p className="mt-0.5 text-[10px] text-muted">
            {formatPercent(column.uniquePercentage)}
          </p>
        </div>
      </td>

      {/* Min / Max */}

      <td className="px-4 py-3.5 sm:px-5">
        <StatPair first={column.min} second={column.max} />
      </td>

      {/* Mean / Median */}

      <td className="px-4 py-3.5 sm:px-5">
        {column.mean !== undefined && column.mean !== null ? (
          <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>{Number(column.mean).toFixed(2)}</span>

            <span className="mx-1 text-muted">/</span>

            <span>{column.median ?? "N/A"}</span>
          </div>
        ) : (
          <span className="text-xs text-muted">N/A</span>
        )}
      </td>

      {/* Std dev */}

      <td className="px-4 py-3.5 sm:px-5">
        {column.std !== undefined && column.std !== null ? (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {Number(column.std).toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted">N/A</span>
        )}
      </td>
    </tr>
  );
}

/* ============================================================
   STAT PAIR
============================================================ */

function StatPair({ first, second }) {
  if (
    first === undefined ||
    first === null ||
    second === undefined ||
    second === null
  ) {
    return <span className="text-xs text-muted">N/A</span>;
  }

  return (
    <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
      <span>{formatStatValue(first)}</span>

      <span className="mx-1 text-muted">/</span>

      <span>{formatStatValue(second)}</span>
    </div>
  );
}

/* ============================================================
   TABLE HEADING
============================================================ */

function TableHeading({ children }) {
  return (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3
        text-[9px]
        font-bold
        uppercase
        tracking-[0.12em]
        text-muted
        sm:px-5
      "
    >
      {children}
    </th>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function ProfileEmptyState({ isProfiling, onRunProfile }) {
  return (
    <section
      className="
        mt-5
        flex
        min-h-0
        flex-1
        items-center
        justify-center
        overflow-hidden
        border
        border-border
        bg-surface/80
        backdrop-blur-sm
      "
    >
      <div className="max-w-md px-6 py-12 text-center">
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-border
            bg-primary-soft
            text-primary
          "
        >
          <Layers3 className="h-7 w-7" />
        </div>

        <div className="mt-5">
          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-muted
            "
          >
            Profiling required
          </span>

          <h2
            className="
              mt-2
              text-lg
              font-black
              tracking-[-0.025em]
            "
          >
            No profile generated yet
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Run the profiler to inspect column types, missing values,
            uniqueness, and statistical properties before validation.
          </p>
        </div>

        <Button
          onClick={onRunProfile}
          disabled={isProfiling}
          className="mt-6 gap-2 rounded-xl"
        >
          <RefreshCw
            className={`h-4 w-4 ${isProfiling ? "animate-spin" : ""}`}
          />

          {isProfiling ? "Profiling dataset..." : "Run profile"}
        </Button>
      </div>
    </section>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatStatValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? formatNumber(value) : value.toFixed(2);
  }

  return String(value);
}
