/// <reference lib="webworker" />
import { has } from 'lodash-es';
import _Mustache from 'mustache';

// This is done for unit tests, because CommonJS module defaults to `undefined` in Jest
// (when using default import).
// Don't use `esModuleInterop` since it breaks `moment` import.
// This is the trade-off we should deal with.
const Mustache = _Mustache || require('mustache');

// Disable text escape so this `7/30/2022` doesn't become this `7&#x2F;30&#x2F;2022`.
Mustache.escape = (text: string) => text;

/**
 * @whatItDoes This is used to go through all the fields and check if the provided
 * rendering context also contains all the fields we need. This throws an error
 * if there's some field missing.
 */
export function assertAllRequiredFieldsAreProvided(
  fields: string[],
  context: Record<string, unknown>
): void | never {
  for (const field of fields) {
    if (has(context, field)) {
      continue;
    }

    throw new Error(
      `compileEmailTemplate: not all fields are provided on the context that should be passed into Mustache.render function. Missing field: ${field}`
    );
  }
}

/**
 * @whatItDoes It expects `inputs` to be provided as an object. `inputs` is a
 * primary object where keys are strings and values are strings too (which are email
 * template fields, e.g., subject or header). It returns the object with the same
 * signature (as `inputs`) but with compiled email templates.
 * ```ts
 * compileEmailTemplates({
 *   header: 'Hey {{ Name }}',
 *   subject: 'This is subject for {{ My.User }}'
 * }, {
 *   Name: 'Andy',
 *   My: {
 *     User: 'Mustache'
 *   }
 * })
 * ```
 */
export function compileEmailTemplates(
  input: Record<string, string>,
  context: Record<string, unknown>
): Record<string, string> {
  return Object.entries(input).reduce((accumulator, [key, text]) => {
    accumulator[key] = Mustache.render(text, context);
    return accumulator;
  }, <Record<string, string>>{});
}
