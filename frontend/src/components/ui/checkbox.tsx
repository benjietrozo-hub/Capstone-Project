import * as React from "react"
import { Check, Square } from "lucide-react"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
      setIsChecked(checked || false)
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600 
            focus:ring-2 focus:ring-blue-500 
            focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className || ''}
          `.trim()}
          {...props}
        />
        {isChecked && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
        {!isChecked && (
          <Square className="h-4 w-4 text-gray-400" />
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
