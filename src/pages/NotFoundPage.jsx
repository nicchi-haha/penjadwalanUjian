import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center mb-4">
        <FileQuestion size={24} className="text-text-muted" strokeWidth={1.6} />
      </div>
      <h1 className="text-lg font-semibold tracking-tight mb-1">Page not found</h1>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/data"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-primary text-text-inverse text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Data
      </Link>
    </div>
  )
}
