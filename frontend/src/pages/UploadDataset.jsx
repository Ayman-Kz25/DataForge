import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { ProgressBar } from '@/components/ui/progress'
import { datasetService } from '@/services/api'
import { useDatasetStore } from '@/store/datasetStore'
import { formatFileSize } from '@/utils/formatters'
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from '@/constants'

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

  const validateAndSetFile = (file) => {
    setError(null)
    setUploadedDataset(null)

    if (!file) return

    const name = file.name.toLowerCase()
    const isCsv = name.endsWith('.csv')
    const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls')

    if (!isCsv && !isXlsx) {
      setError('Invalid file format. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.')
      setSelectedFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large (${formatFileSize(file.size)}). Maximum supported file size is ${MAX_FILE_SIZE_MB}MB.`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    validateAndSetFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    validateAndSetFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await datasetService.upload(formData, (progress) => {
        setUploadProgress(progress)
      })

      const dataset = res.data.data
      addDataset(dataset)
      setUploadedDataset(dataset)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload dataset. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Dataset</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload your tabular data in CSV or Excel format. Maximum file size is {MAX_FILE_SIZE_MB}MB.
        </p>
      </div>

      {error && (
        <Alert variant="danger" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploadedDataset ? (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardContent className="py-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dataset Uploaded Successfully!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{uploadedDataset.originalName}</span> ({formatFileSize(uploadedDataset.fileSize)})
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setUploadedDataset(null)
                  setSelectedFile(null)
                  setUploadProgress(0)
                }}
              >
                Upload Another
              </Button>
              <Button
                onClick={() => navigate(`/datasets/${uploadedDataset._id}/profile`)}
                className="gap-2"
              >
                Profile & Validate <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                Drag and drop your dataset here, or <span className="text-indigo-600 hover:underline font-semibold">browse</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: .CSV, .XLSX, .XLS (Up to {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                {!isUploading && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    Remove
                  </Button>
                )}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Uploading securely to cloud storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar value={uploadProgress} />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                disabled={isUploading}
                onClick={() => navigate('/datasets')}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload & Proceed'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
