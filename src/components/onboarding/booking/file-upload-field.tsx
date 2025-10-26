import { Upload, X, FileText } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";

interface FileUploadFieldProps {
	fileName?: string;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
	error?: string;
}

export function FileUploadField({
	fileName,
	onFileChange,
	onRemove,
	error,
}: FileUploadFieldProps) {
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) return;

		// Validate file type
		if (file.type !== "application/pdf") {
			e.target.value = "";
			return;
		}

		// Validate file size (max 2MB)
		const maxSize = 2 * 1024 * 1024; // 2MB
		if (file.size > maxSize) {
			e.target.value = "";
			return;
		}

		// Call parent callback with event
		onFileChange(e);
	};

	return (
		<Field>
			<FieldLabel>
				Surat Peminjaman (PDF) <span className="text-red-500">*</span>
			</FieldLabel>
			<div className="space-y-2">
				{!fileName ? (
					<label className="flex flex-col items-center justify-center w-full h-20 px-4 transition bg-muted border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary focus:outline-none">
						<div className="flex flex-col items-center space-y-1">
							<Upload className="w-5 h-5 text-muted-foreground" />
							<span className="text-xs text-center text-muted-foreground">
								Klik untuk pilih surat (PDF, max 2MB)
							</span>
						</div>
						<input
							type="file"
							accept=".pdf,application/pdf"
							onChange={handleFileSelect}
							className="hidden"
						/>
					</label>
				) : (
					<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
							<div className="flex-1 min-w-0">
								<span className="text-sm text-green-700 dark:text-green-400 truncate block">
									{fileName}
								</span>
							</div>
						</div>
						<button
							type="button"
							onClick={onRemove}
							className="ml-2 p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition-colors flex-shrink-0"
						>
							<X className="w-4 h-4 text-green-600" />
						</button>
					</div>
				)}

				{error && <p className="text-sm text-red-600">{error}</p>}

				<p className="text-xs text-muted-foreground">
					* File akan diupload saat Anda mengirim peminjaman
				</p>
			</div>
		</Field>
	);
}
