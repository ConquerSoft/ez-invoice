import { ReactNode } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: ReactNode
  fullWidth?: boolean
}

export function Input({
  label,
  error,
  helpText,
  icon,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          className={`
            w-full px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg
            text-base md:text-sm
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-colors duration-200 min-h-12 md:min-h-auto
            placeholder:text-gray-400
            ${icon ? 'pl-10 md:pl-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs md:text-sm text-gray-500">{helpText}</p>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  fullWidth?: boolean
}

export function TextArea({
  label,
  error,
  helpText,
  fullWidth = true,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg
          text-base md:text-sm
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          transition-colors duration-200
          placeholder:text-gray-400
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs md:text-sm text-gray-500">{helpText}</p>}
    </div>
  )
}
