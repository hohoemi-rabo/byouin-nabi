interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}: ButtonProps) {
  const baseClass = "px-6 py-3 rounded-lg min-h-tap min-w-tap font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass = variant === 'primary'
    ? 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : 'bg-gray-100 text-foreground hover:bg-gray-200 active:bg-gray-300 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
