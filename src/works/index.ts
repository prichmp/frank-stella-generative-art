import type { Work } from '../types';
import { blackPainting } from './blackPainting';
import { concentricSquares } from './concentricSquares';

// The registry holds heterogeneous Work<P> instances. Each Work is internally
// well-typed; we erase P at the boundary so the gallery can iterate uniformly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyWork = Work<any>;

export const works: ReadonlyArray<AnyWork> = [
  blackPainting,
  concentricSquares,
];
