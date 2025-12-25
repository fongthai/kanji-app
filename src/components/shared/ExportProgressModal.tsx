import type { ExportProgress } from '../../utils/exportUtils';

interface ExportProgressModalProps {
  progress: ExportProgress | null;
  onCancel: () => void;
}

export function ExportProgressModal({ progress, onCancel }: ExportProgressModalProps) {
  if (!progress) return null;

  const isActive = progress.status === 'preparing' || progress.status === 'exporting';
  const progressPercent = progress.totalPages > 0 
    ? (progress.currentPage / progress.totalPages) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            {progress.status === 'preparing' && '⏳ Preparing Export...'}
            {progress.status === 'exporting' && '📤 Exporting...'}
            {progress.status === 'completed' && '✅ Export Complete!'}
            {progress.status === 'error' && '❌ Export Failed'}
            {progress.status === 'cancelled' && '🚫 Export Cancelled'}
          </h3>
        </div>

        {/* Progress Bar */}
        {isActive && progress.totalPages > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Page {progress.currentPage} of {progress.totalPages}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        <p className="text-sm text-gray-300 mb-6">{progress.message}</p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isActive && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm"
            >
              Cancel Export
            </button>
          )}
          {(progress.status === 'completed' || progress.status === 'error' || progress.status === 'cancelled') && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 rounded bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors text-sm"
            >
              Close
            </button>
          )}
        </div>

        {/* Additional Info for Errors */}
        {progress.status === 'error' && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded text-xs text-gray-300">
            <p className="font-semibold text-red-400 mb-1">Error Details:</p>
            <p>{progress.message}</p>
            <p className="mt-2 text-gray-400">
              If fonts failed to load, you can try exporting anyway. The output may use fallback system fonts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
