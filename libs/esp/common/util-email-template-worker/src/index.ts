import { finalize, take } from 'rxjs';

import { unpatchedFromEvent } from '@cosmos/zone-less';

import {
  EmailTemplateFromWorkerMessage,
  EmailTemplateToWorkerMessage,
} from './lib/types';

export const NOT_SET = 'NOT SET';

export function compileEmailTemplatesOnWorker(
  message: EmailTemplateToWorkerMessage
) {
  const worker = new Worker(new URL('./lib/worker.ts', import.meta.url));
  worker.postMessage(message);
  return unpatchedFromEvent<MessageEvent<EmailTemplateFromWorkerMessage>>(
    worker,
    'message'
  ).pipe(
    // We only need response once from the worker thread.
    take(1),
    // Terminate the worker once the `message` event has been dispatched since we don't
    // need it anymore.
    finalize(() => worker.terminate())
  );
}

export * from './lib/types';
