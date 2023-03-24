/// <reference lib="webworker" />
import {
  assertAllRequiredFieldsAreProvided,
  compileEmailTemplates,
} from './compile-email-templates';
import { EmailTemplateToWorkerMessage } from './types';

addEventListener(
  'message',
  (message: MessageEvent<EmailTemplateToWorkerMessage>) => {
    const { id, inputs, fields, context } = message.data;
    assertAllRequiredFieldsAreProvided(fields, context);
    const outputs = compileEmailTemplates(inputs, context);
    postMessage({ outputs, id });
  }
);
