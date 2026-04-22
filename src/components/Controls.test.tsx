import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ParamSchema } from '../types';
import { Controls } from './Controls';

interface SampleParams {
  count: number;
  background: string;
  symmetry: 'a' | 'b';
  palette: string[];
}

const schema: ParamSchema<SampleParams> = [
  { key: 'count', label: 'Count', kind: 'int', min: 1, max: 10 },
  { key: 'background', label: 'Background', kind: 'color' },
  { key: 'symmetry', label: 'Symmetry', kind: 'select', options: ['a', 'b'] },
  { key: 'palette', label: 'Palette', kind: 'colorList' },
];

const values: SampleParams = {
  count: 5,
  background: '#ff00ff',
  symmetry: 'a',
  palette: ['#111111', '#222222'],
};

describe('Controls', () => {
  it('renders one input per schema field plus a reset button', () => {
    render(<Controls schema={schema} values={values} onChange={() => {}} onReset={() => {}} />);
    expect(screen.getByLabelText(/count/i)).toBeDefined();
    expect(screen.getByLabelText(/background/i)).toBeDefined();
    expect(screen.getByLabelText(/symmetry/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDefined();
  });

  it('calls onReset when the reset button is clicked', () => {
    const onReset = vi.fn();
    render(<Controls schema={schema} values={values} onChange={() => {}} onReset={onReset} />);
    screen.getByRole('button', { name: /reset/i }).click();
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
