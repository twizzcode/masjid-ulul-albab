import { Upload, X, FileText } from "lucide-react";
import { BookingData } from "./types";

interface FileUploadFieldProps {
  formData: Partial<BookingData>;
  fileError: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function FileUploadField({
  formData,
  fileError,
  onFileChange,
  onRemoveFile,
}: FileUploadFieldProps) {
  return (
    <div className="space-y-2">
      {!formData.letterFileName ? (
        <label className="flex flex-col items-center justify-center w-full h-20 px-4 transition bg-muted border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none">
          <div className="flex flex-col items-center space-y-1">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-center text-muted-foreground">
              Klik untuk upload surat (PDF, max 1MB)
            </span>
          </div>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 dark:text-green-400 truncate">
              {formData.letterFileName}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="ml-2 p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {fileError && <p className="text-sm text-red-600">{fileError}</p>}

      <p className="text-xs text-muted-foreground">
        * Surat peminjaman diperlukan untuk proses persetujuan
      </p>
    </div>
  );
}
