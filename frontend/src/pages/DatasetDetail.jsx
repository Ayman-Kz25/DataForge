import { useParams } from 'react-router-dom'

export default function DatasetDetail() {
  const { id } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">
        Dataset Detail
      </h1>

      <p className="mt-2 text-muted-foreground">
        Dataset overview hub
      </p>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Dataset ID: {id}
      </p>
    </div>
  )
}