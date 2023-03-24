import { SpectatorPipe } from '@ngneat/spectator';
import { createPipeFactory } from '@ngneat/spectator/jest';

import { ProjectProof, ProjectProofStatus } from '@cosmos/types-common';
import { CosDatePipe } from '@cosmos/util-i18n-dates';
import {
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import { ProofCardHeaderTextPipe } from '@esp/proofs/util-proofs-card-header';

describe('ProofCardHeaderTextPipe', () => {
  let spectator: SpectatorPipe<ProofCardHeaderTextPipe>;
  let cosDatePipe: CosDatePipe;
  let proof: Partial<ProjectProof> = {};

  const createPipe = createPipeFactory({
    pipe: ProofCardHeaderTextPipe,
    imports: [CosUtilTranslationsTestingModule.forRoot()],
    providers: [
      ProofCardHeaderTextPipe,
      CosDatePipe,
      provideLanguageScopes(LanguageScope.EspProofs),
    ],
  });

  beforeEach(() => {
    proof = {};
  });

  it('should create', () => {
    // Arrange
    const { hostComponent, fixture } = createPipe();

    // Assert
    expect(hostComponent).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  describe('ReadyForReview status', () => {
    // Arrange
    const status = ProjectProofStatus.ReadyForReview;

    test('should return string Approved by in longDate format', () => {
      // Arrange
      proof.ApproveByDate = new Date().toString();

      // Act
      spectator = createPipe(
        `{{ proof | proofCardHeaderText: status | async }}`,
        {
          hostProps: {
            proof,
            status,
          },
        }
      );

      // Arrange
      cosDatePipe = spectator.inject(CosDatePipe);
      const date = cosDatePipe.transform(proof.ApproveByDate, 'longDate');

      // Assert
      expect(spectator.element).toHaveExactTrimmedText(
        `Approve by ${date} to remain on schedule`
      );
    });

    test('should return string Proof Sent on in longDate format', () => {
      // Arrange
      proof.SharedDate = new Date().toString();
      proof.SenderName = 'Test';

      // Act
      spectator = createPipe(
        `{{ proof | proofCardHeaderText: status | async }}`,
        {
          hostProps: {
            proof,
            status,
          },
        }
      );

      // Arrange
      cosDatePipe = spectator.inject(CosDatePipe);
      const date = cosDatePipe.transform(proof.SharedDate, 'longDate');

      // Assert
      expect(spectator.element).toHaveExactTrimmedText(
        `Proof Sent on ${date} by ${proof.SenderName}`
      );
    });
  });

  describe('Approved status', () => {
    test('should return string Proof Approved: Approved on, in longDate format', () => {
      // Arrange
      const status = ProjectProofStatus.Approved;
      proof.ApprovedDate = new Date().toString();
      proof.ApprovedBy = 'Test User';

      // Act
      spectator = createPipe(
        `{{ proof | proofCardHeaderText: status | async }}`,
        {
          hostProps: {
            proof,
            status,
          },
        }
      );

      // Arrange
      cosDatePipe = spectator.inject(CosDatePipe);
      const date = cosDatePipe.transform(proof.ApprovedDate, 'longDate');

      // Assert
      expect(spectator.element).toHaveExactTrimmedText(
        `Proof Approved: Approved on ${date} by ${proof.ApprovedBy}`
      );
    });
  });

  describe('ChangesRequested status', () => {
    test('should return string Changes Requested:, in longDate format', () => {
      // Arrange
      const status = ProjectProofStatus.ChangesRequested;
      proof.ChangeRequestedDate = new Date().toString();
      proof.CustomerName = 'Test User';

      // Act
      spectator = createPipe(
        `{{ proof | proofCardHeaderText: status | async }}`,
        {
          hostProps: {
            proof,
            status,
          },
        }
      );

      // Arrange
      cosDatePipe = spectator.inject(CosDatePipe);
      const date = cosDatePipe.transform(proof.ChangeRequestedDate, 'longDate');

      // Assert
      expect(spectator.element).toHaveExactTrimmedText(
        `Changes Requested: ${date} by ${proof.CustomerName}`
      );
    });
  });

  test('should return empty string', () => {
    // Act
    spectator = createPipe(`{{ proof | proofCardHeaderText: status | async}}`, {
      hostProps: {
        proof,
        status: '',
      },
    });

    expect(spectator.element).toHaveExactTrimmedText('');
  });
});
