type ToastProps = {
  message: string;
  className: string;
};

export default function Toast({ message, className }: ToastProps) {
  return (
    <div className={`app-toast ${className}`} role="status" aria-live="polite">
      ✓　{message}
    </div>
  );
}
