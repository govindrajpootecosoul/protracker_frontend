import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmailsChipsInputProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string[];
  onChange: (emails: string[]) => void;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  dark?: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailsChipsInput({
  label,
  required,
  placeholder = 'email@example.com',
  value,
  onChange,
  helperText,
  error,
  disabled,
  dark,
}: EmailsChipsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmails = (raw: string) => {
    const candidates = raw
      .split(/[;,\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (candidates.length === 0) return;

    const invalid = candidates.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      setLocalError(`Invalid email(s): ${invalid.join(', ')}`);
      return;
    }

    const deduped = Array.from(new Set([...(value || []), ...candidates]));
    onChange(deduped);
    setInputValue('');
    setLocalError(undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      addEmails(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      e.preventDefault();
      const next = value.slice(0, -1);
      onChange(next);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const text = e.clipboardData.getData('text');
    if (text && /[,;\n]/.test(text)) {
      e.preventDefault();
      addEmails(text);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim().length > 0) {
      addEmails(inputValue);
    }
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const isDark = !!dark;

  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <span className="text-gray-900 dark:text-gray-100">{label}</span>
          {required ? (
            <span className="text-red-600 dark:text-red-400 font-bold">*</span>
          ) : (
            <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
          )}
        </label>
      )}

      <div
        className={cn(
          'w-full min-h-[44px] px-3 py-2 rounded-xl border transition-all duration-200 flex flex-wrap items-center gap-2',
          isDark ? 'bg-slate-700/90 border-slate-600' : 'bg-slate-50/90 border-slate-300 backdrop-blur-sm',
          'focus-within:ring-2 focus-within:ring-ncsBlue-500/50 focus-within:border-ncsBlue-500',
          'hover:border-ncsBlue-400/50',
          (error || localError) ? 'border-red-500 dark:border-red-400' : '',
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((email, idx) => (
          <span
            key={`${email}-${idx}`}
            className={cn(
              'inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full text-sm',
              'bg-gradient-to-r from-ncsBlue-500/10 to-ncsBlue-600/10 border border-ncsBlue-400/30',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {email}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(idx);
              }}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              disabled={disabled}
              aria-label={`Remove ${email}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (localError) setLocalError(undefined);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-[180px] bg-transparent outline-none text-sm py-1',
            isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
          )}
        />
      </div>

      {(error || localError || helperText) && (
        <div className="mt-2 min-h-[20px]">
          {error || localError ? (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
              <span>⚠️</span>
              {error || localError}
            </p>
          ) : (
            helperText && (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {helperText}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default EmailsChipsInput;


