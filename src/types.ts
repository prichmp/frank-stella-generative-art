export type Renderer<P> = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: P,
) => void;

type Visibility<P> = { visible?: (params: P) => boolean };
type ColorField<P, K extends keyof P> = Visibility<P> & { key: K; label: string; kind: 'color' };
type RangeField<P, K extends keyof P> = Visibility<P> & {
  key: K;
  label: string;
  kind: 'range' | 'int';
  min: number;
  max: number;
  step?: number;
};
type SelectField<P, K extends keyof P, V extends string> = Visibility<P> & {
  key: K;
  label: string;
  kind: 'select';
  options: ReadonlyArray<V>;
};
type ColorListField<P, K extends keyof P> = Visibility<P> & {
  key: K;
  label: string;
  kind: 'colorList';
  minLength?: number;
  maxLength?: number;
};
type ToggleField<P, K extends keyof P> = Visibility<P> & {
  key: K;
  label: string;
  kind: 'toggle';
};

type FieldFor<P, K extends keyof P> = P[K] extends string
  ? ColorField<P, K> | SelectField<P, K, P[K] & string>
  : P[K] extends number
    ? RangeField<P, K>
    : P[K] extends boolean
      ? ToggleField<P, K>
      : P[K] extends string[]
        ? ColorListField<P, K>
        : never;

export type Field<P> = { [K in keyof P]-?: FieldFor<P, K> }[keyof P];
export type ParamSchema<P> = ReadonlyArray<Field<P>>;

export interface Work<P> {
  id: string;
  title: string;
  year: string;
  series: string;
  aspectRatio: number;
  defaultParams: P;
  schema: ParamSchema<P>;
  render: Renderer<P>;
  caption?: string;
}

export function defineWork<P>(work: Work<P>): Work<P> {
  return work;
}
