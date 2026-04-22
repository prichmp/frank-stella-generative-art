import { useId } from 'react';
import type { Field, ParamSchema } from '../types';

interface Props<P> {
  schema: ParamSchema<P>;
  values: P;
  onChange: (next: P) => void;
  onReset: () => void;
}

export function Controls<P>({ schema, values, onChange, onReset }: Props<P>) {
  const setValue = <K extends keyof P>(key: K, value: P[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="controls">
      {schema
        .filter((field) => !field.visible || field.visible(values))
        .map((field) => (
          <FieldRow
            key={String(field.key)}
            field={field}
            value={values[field.key]}
            onChange={(v) => setValue(field.key, v as P[typeof field.key])}
          />
        ))}
      <button type="button" className="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

interface FieldRowProps<P> {
  field: Field<P>;
  value: P[keyof P];
  onChange: (next: unknown) => void;
}

function FieldRow<P>({ field, value, onChange }: FieldRowProps<P>) {
  const id = useId();
  const labelId = `${id}-label`;

  switch (field.kind) {
    case 'color':
      return (
        <div className="field">
          <label htmlFor={id} id={labelId}>
            {field.label}
          </label>
          <input
            id={id}
            type="color"
            value={value as unknown as string}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'range':
    case 'int': {
      const numeric = value as unknown as number;
      const step = field.step ?? (field.kind === 'int' ? 1 : 0.01);
      return (
        <div className="field">
          <label htmlFor={id} id={labelId}>
            {field.label}
            <span className="field-value" aria-hidden="true">
              {field.kind === 'int' ? Math.round(numeric) : numeric.toFixed(2)}
            </span>
          </label>
          <input
            id={id}
            type="range"
            min={field.min}
            max={field.max}
            step={step}
            value={numeric}
            aria-valuetext={String(numeric)}
            onChange={(e) =>
              onChange(field.kind === 'int' ? Math.round(Number(e.target.value)) : Number(e.target.value))
            }
          />
        </div>
      );
    }

    case 'toggle':
      return (
        <div className="field field-toggle">
          <label htmlFor={id} id={labelId}>
            <input
              id={id}
              type="checkbox"
              checked={value as unknown as boolean}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        </div>
      );

    case 'select':
      return (
        <div className="field">
          <label htmlFor={id} id={labelId}>
            {field.label}
          </label>
          <select
            id={id}
            value={value as unknown as string}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options.map((opt) => (
              <option key={String(opt)} value={String(opt)}>
                {String(opt)}
              </option>
            ))}
          </select>
        </div>
      );

    case 'colorList': {
      const list = value as unknown as string[];
      const setAt = (i: number, v: string) => {
        const next = list.slice();
        next[i] = v;
        onChange(next);
      };
      const minLen = field.minLength ?? 1;
      const maxLen = field.maxLength ?? 16;
      return (
        <div className="field field-colorlist">
          <span className="field-label">{field.label}</span>
          <div className="color-swatches">
            {list.map((c, i) => (
              <input
                key={i}
                type="color"
                aria-label={`${field.label} color ${i + 1}`}
                value={c}
                onChange={(e) => setAt(i, e.target.value)}
              />
            ))}
            <button
              type="button"
              className="swatch-button"
              disabled={list.length <= minLen}
              onClick={() => onChange(list.slice(0, -1))}
              aria-label={`Remove last ${field.label} color`}
            >
              −
            </button>
            <button
              type="button"
              className="swatch-button"
              disabled={list.length >= maxLen}
              onClick={() => onChange([...list, list[list.length - 1] ?? '#888888'])}
              aria-label={`Add ${field.label} color`}
            >
              +
            </button>
          </div>
        </div>
      );
    }
  }
}
