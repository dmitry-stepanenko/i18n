import { OperatorFunction, map } from 'rxjs';

export function toNumberOrNull(
  factory: (value: string) => number
): OperatorFunction<string, number | null> {
  return map((value: string) => {
    if (typeof value === 'string' && value.match(/\d/) !== null) {
      const maybeNumber = factory(value);
      return Number.isNaN(maybeNumber) ? null : maybeNumber;
    } else {
      return null;
    }
  });
}
