interface QuestionOptionProps {
  value: string;
  label: string;
  selected: boolean;
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

export default function QuestionOption({
  value,
  label,
  selected,
  onSelect,
  multiSelect = false,
}: QuestionOptionProps) {
  const handleClick = () => {
    onSelect(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full px-6 py-4 rounded-lg border-2 transition-all duration-200
        min-h-tap text-left font-medium
        ${
          selected
            ? 'bg-primary text-white border-primary shadow-md'
            : 'bg-white text-foreground border-gray-300 hover:border-primary hover:bg-gray-50'
        }
      `}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        {/* チェックボックス・ラジオボタン風のアイコン */}
        <div
          className={`
            flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center
            ${
              selected
                ? 'bg-white border-white'
                : 'bg-white border-gray-400'
            }
            ${multiSelect ? '' : 'rounded-full'}
          `}
        >
          {selected && (
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="text-lg">{label}</span>
      </div>
    </button>
  );
}
