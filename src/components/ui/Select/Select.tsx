import { type ChangeEvent, type SelectHTMLAttributes } from 'react';

import catalogFilterChevron from '../../../assets/vinyl-vault/catalog-filter-chevron.svg';
import './Select.scss';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}

export function Select({
  id,
  label,
  onChange,
  options,
  value,
  ...selectProps
}: SelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <label className="ui-select" htmlFor={id}>
      <span className="visually-hidden">{label}</span>
      <select
        id={id}
        className="ui-select__control"
        value={value}
        onChange={handleChange}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <img
        className="ui-select__icon"
        src={catalogFilterChevron}
        width="18"
        height="9"
        alt=""
        aria-hidden="true"
      />
    </label>
  );
}
