import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  X,
  FileText,
  ShieldCheck,
  Database,
  AlertCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { ProgressBar } from '@/components/ui/progress'

import { datasetService } from '@/services/api'
import { useDatasetStore } from '@/store/datasetStore'
import { formatFileSize } from '@/utils/formatters'
import {
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from '@/constants'

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export default function UploadDataset() {
  const navigate = useNavigate()
  const { addDataset } = useDatasetStore()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uploadedDataset, setUploadedDataset] = useState(null)

  const resetSelection = () => {
    setSelectedFile(null)
    setError(null)
    setUploadProgress(0)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateAndSetFile = (file) => {
    setError(null)
    setUploadedDataset(null)

    if (!file) return

    const name = file.name.toLowerCase()

    const isCsv = name.endsWith('.csv')
    const isExcel =
      name.endsWith('.xlsx') || name.endsWith('.xls')

    if (!isCsv && !isExcel) {
      setSelectedFile(null)

      setError(
        'Unsupported file format. Please select a CSV, XLSX, or XLS file.'
      )

      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null)

      setError(
        `This file is ${formatFileSize(
          file.size
        )}. The maximum supported size is ${MAX_FILE_SIZE_MB}MB.`
      )

      return
    }

    setSelectedFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()

    if (!isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event) => {
    event.preventDefault()

    if (
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    if (isUploading) return

    const file = event.dataTransfer.files?.[0]

    validateAndSetFile(file)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    validateAndSetFile(file)
  }

  const handleBrowse = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleDropZoneKeyDown = (event) => {
    if (isUploading) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBrowse()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return

    try {
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await datasetService.upload(
        formData,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      const dataset = res.data?.data

      if (!dataset) {
        throw new Error('Upload completed but no dataset was returned.')
      }

      addDataset(dataset)
      setUploadedDataset(dataset)
      setUploadProgress(100)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload dataset. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadAnother = () => {
    setUploadedDataset(null)
    setSelectedFile(null)
    setUploadProgress(0)
    setError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="dataforge-grid absolute inset-0 opacity-20" />

        <div
          className="
            absolute
            -right-40
            -top-40
            h-[480px]
            w-[480px]
            rounded-full
            bg-primary/7
            blur-[130px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-5xl
          px-5
          py-8
          sm:px-8
          sm:py-10
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-10">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-primary-soft
                text-primary
              "
            >
              <Upload className="h-3.5 w-3.5" />
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
              Dataset ingestion
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  sm:text-4xl
                "
              >
                Upload dataset
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Add a CSV or Excel file to your workspace.
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/datasets')}
              className="w-fit gap-2 text-muted-foreground"
            >
              Dataset library
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6">
            <Alert
              variant="danger"
              onDismiss={() => setError(null)}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{error}</span>
              </div>
            </Alert>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {uploadedDataset ? (
          <UploadSuccess
            dataset={uploadedDataset}
            onUploadAnother={handleUploadAnother}
            onContinue={() =>
              navigate(
                `/datasets/${uploadedDataset._id}/profile`
              )
            }
          />
        ) : (
          <div>
            {/* =================================================
                UPLOAD WORKSPACE
            ================================================== */}

            <section
              className="
                relative
                overflow-hidden
                border
                border-border
                bg-surface/70
                backdrop-blur-sm
              "
            >
              {/* Accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-primary/50" />

              <div className="p-5 sm:p-8 lg:p-10">
                {/* Drop zone */}
                <div
                  role="button"
                  tabIndex={isUploading ? -1 : 0}
                  aria-label="Upload dataset file"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowse}
                  onKeyDown={handleDropZoneKeyDown}
                  className={`
                    group
                    relative
                    flex
                    min-h-[360px]
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    overflow-hidden
                    border
                    border-dashed
                    px-6
                    text-center
                    outline-none
                    transition-all
                    duration-200
                    ${
                      isDragging
                        ? 'border-primary bg-primary-soft/60'
                        : 'border-border-strong bg-surface-secondary/30 hover:border-primary/60 hover:bg-primary-soft/20'
                    }
                    ${
                      isUploading
                        ? 'cursor-default opacity-90'
                        : ''
                    }
                    focus-visible:border-primary
                    focus-visible:ring-2
                    focus-visible:ring-primary/20
                  `}
                >
                  {/* Inner grid */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      dataforge-grid
                      opacity-30
                    "
                  />

                  {/* Glow */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-1/2
                      h-64
                      w-64
                      -translate-x-1/2
                      -translate-y-1/2
                      rounded-full
                      bg-primary/5
                      blur-3xl
                    "
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  {/* Icon */}
                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-border
                      bg-surface
                      text-primary
                      shadow-sm
                      transition-all
                      duration-200
                      ${
                        isDragging
                          ? 'scale-105 border-primary shadow-lg shadow-primary/10'
                          : 'group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10'
                      }
                    `}
                  >
                    <Upload className="h-7 w-7" />
                  </div>

                  <div className="relative z-10 mt-6">
                    <h2 className="text-lg font-bold tracking-tight">
                      {isDragging
                        ? 'Drop your dataset here'
                        : 'Drop your dataset here'}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      or{' '}
                      <span className="font-semibold text-primary">
                        browse files
                      </span>{' '}
                      from your computer
                    </p>
                  </div>

                  {/* Supported formats */}
                  <div
                    className="
                      relative
                      z-10
                      mt-7
                      flex
                      flex-wrap
                      justify-center
                      gap-2
                    "
                  >
                    <FormatPill label="CSV" />
                    <FormatPill label="XLSX" />
                    <FormatPill label="XLS" />

                    <span className="mx-1 h-4 w-px bg-border" />

                    <span
                      className="
                        inline-flex
                        items-center
                        text-[11px]
                        font-medium
                        text-muted-foreground
                      "
                    >
                      Up to {MAX_FILE_SIZE_MB}MB
                    </span>
                  </div>
                </div>

                {/* =================================================
                    FILE PREVIEW
                ================================================== */}

                {selectedFile && (
                  <SelectedFile
                    file={selectedFile}
                    isUploading={isUploading}
                    progress={uploadProgress}
                    onRemove={resetSelection}
                  />
                )}

                {/* =================================================
                    UPLOAD PROGRESS
                ================================================== */}

                {isUploading && (
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-primary-soft
                            text-primary
                          "
                        >
                          <Upload className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold">
                            Uploading dataset
                          </p>

                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Securely transferring your file
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-primary">
                        {uploadProgress}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={uploadProgress} />
                    </div>
                  </div>
                )}

                {/* =================================================
                    ACTIONS
                ================================================== */}

                {!isUploading && (
                  <div
                    className="
                      mt-6
                      flex
                      flex-col-reverse
                      gap-3
                      border-t
                      border-border
                      pt-6
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />

                      <span>
                        Files are validated before upload
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/datasets')}
                      >
                        Cancel
                      </Button>

                      <Button
                        disabled={!selectedFile}
                        onClick={handleUpload}
                        className="gap-2 rounded-xl px-5"
                      >
                        Upload dataset
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                FILE REQUIREMENTS
            ================================================== */}

            <section
              className="
                mt-8
                grid
                gap-6
                border-y
                border-border
                py-6
                sm:grid-cols-3
              "
            >
              <Requirement
                icon={FileSpreadsheet}
                title="Supported formats"
                description="CSV, XLSX and XLS files"
              />

              <Requirement
                icon={Database}
                title="File size"
                description={`Maximum ${MAX_FILE_SIZE_MB}MB per file`}
              />

              <Requirement
                icon={ShieldCheck}
                title="Validation"
                description="Format and size checked automatically"
              />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

/* ============================================================
   SELECTED FILE
============================================================ */

function SelectedFile({
  file,
  isUploading,
  progress,
  onRemove,
}) {
  return (
    <div
      className="
        mt-6
        border
        border-border
        bg-surface
      "
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-success/10
            text-success
          "
        >
          <FileSpreadsheet className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold">
              {file.name}
            </p>

            {!isUploading && (
              <span
                className="
                  hidden
                  shrink-0
                  rounded-full
                  bg-success/10
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-success
                  sm:inline-flex
                "
              >
                Ready
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>

            <span className="h-1 w-1 rounded-full bg-border-strong" />

            <span>
              {getFileExtension(file.name).toUpperCase()}
            </span>
          </div>
        </div>

        {!isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="
              h-8
              w-8
              shrink-0
              rounded-lg
              text-muted
              hover:text-danger
            "
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5">
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-2">
            <ProgressBar value={progress} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   SUCCESS STATE
============================================================ */

function UploadSuccess({
  dataset,
  onUploadAnother,
  onContinue,
}) {
  return (
    <section
      className="
        relative
        overflow-hidden
        border
        border-success/30
        bg-surface
      "
    >
      <div className="absolute inset-x-0 top-0 h-px bg-success" />

      <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-72
            w-72
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-success/5
            blur-[90px]
          "
        />

        <div
          className="
            relative
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-success/10
            text-success
          "
        >
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <p
          className="
            relative
            mt-6
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-success
          "
        >
          Upload complete
        </p>

        <h2
          className="
            relative
            mt-2
            text-2xl
            font-black
            tracking-[-0.03em]
            sm:text-3xl
          "
        >
          Dataset is ready
        </h2>

        <p className="relative mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Your file has been added to the workspace and is ready
          for profiling and validation.
        </p>

        {/* Dataset summary */}
        <div
          className="
            relative
            mx-auto
            mt-8
            flex
            max-w-xl
            items-center
            gap-4
            border
            border-border
            bg-surface-secondary/40
            px-4
            py-4
            text-left
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-success/10
              text-success
            "
          >
            <FileSpreadsheet className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {dataset.originalName}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(dataset.fileSize)}
            </p>
          </div>

          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        </div>

        {/* Actions */}
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={onUploadAnother}
            className="gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Upload another
          </Button>

          <Button
            onClick={onContinue}
            className="gap-2 rounded-xl px-5 shadow-lg shadow-primary/15"
          >
            Profile & validate
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FORMAT PILL
============================================================ */

function FormatPill({ label }) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-md
        border
        border-border
        bg-surface
        px-2.5
        py-1
        font-mono
        text-[10px]
        font-medium
        text-muted-foreground
      "
    >
      {label}
    </span>
  )
}

/* ============================================================
   REQUIREMENT
============================================================ */

function Requirement({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-surface-secondary
          text-muted-foreground
        "
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ============================================================
   HELPERS
============================================================ */

function getFileExtension(filename) {
  return filename.includes('.')
    ? filename.split('.').pop()
    : ''
}