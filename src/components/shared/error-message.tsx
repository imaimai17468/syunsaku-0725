import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
	title?: string;
	message: string;
	type?: "error" | "warning" | "info";
	className?: string;
	onRetry?: () => void;
}

export function ErrorMessage({
	title,
	message,
	type = "error",
	className,
	onRetry,
}: ErrorMessageProps) {
	const icons = {
		error: <XCircle className="h-4 w-4" />,
		warning: <AlertTriangle className="h-4 w-4" />,
		info: <Info className="h-4 w-4" />,
	};

	const variants = {
		error: "border-red-500/50 bg-red-950/50 text-red-200",
		warning: "border-amber-500/50 bg-amber-950/50 text-amber-200",
		info: "border-blue-500/50 bg-blue-950/50 text-blue-200",
	};

	return (
		<Alert className={cn(variants[type], className)}>
			{icons[type]}
			{title && <AlertTitle>{title}</AlertTitle>}
			<AlertDescription className="flex items-center justify-between">
				<span>{message}</span>
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="ml-4 rounded-md bg-white/10 px-3 py-1 font-medium text-sm transition-colors hover:bg-white/20"
					>
						再試行
					</button>
				)}
			</AlertDescription>
		</Alert>
	);
}
