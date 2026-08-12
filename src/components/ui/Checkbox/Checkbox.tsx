import { type ChangeEvent } from 'react';

import './Checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  count?: number;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  count,
  id,
  label,
  onChange,
}: CheckboxProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.checked);
  }

  return (
    <label className="ui-checkbox" htmlFor={id}>
      <input
        id={id}
        className="ui-checkbox__input"
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <span className="ui-checkbox__box" aria-hidden="true" />
      <span className="ui-checkbox__label">{label}</span>
      {count === undefined ? null : (
        <span className="ui-checkbox__count" aria-hidden="true">
          {String(count).padStart(2, '0')}
        </span>
      )}
    </label>
  );
}
