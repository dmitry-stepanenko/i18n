import { CosCardPromptType, ProjectProofStatus } from '@cosmos/types-common';

export const ProofStatusToPromptType: {
  [status in ProjectProofStatus]: CosCardPromptType;
} = {
  [ProjectProofStatus.ReadyForReview]: 'info',
  [ProjectProofStatus.Approved]: 'success',
  [ProjectProofStatus.ChangesRequested]: 'error',
  [ProjectProofStatus.InProgress]: 'hidden',
} as const;
