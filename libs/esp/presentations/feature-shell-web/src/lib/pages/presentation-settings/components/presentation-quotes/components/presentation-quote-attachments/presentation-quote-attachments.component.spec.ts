import { HttpClientModule } from '@angular/common/http';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';

import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { MediaLink } from '@cosmos/types-party';
import { BytesPipe } from '@cosmos/util-number-pipes';

import { PresentationQuoteLocalState } from '../../../../../../local-states';

import { PresentationQuoteAttachmentsComponent } from './presentation-quote-attachments.component';

const selectors = {
  presentationQuoteAttachmentsTitle: dataCySelector(
    'presentation-quote-attachments__title'
  ),
};

const mediaLinkMock: MediaLink = {
  Id: 501823015,
  MediaId: 5715767,
  FileType: 'Artwork',
  FileUrl:
    'https://commonmedia.uat-asicentral.com/orders/Artwork/8345d53a36794b9691fe965095c47f4c.png',
  OriginalFileName: 'asi-logo-small.png',
  OnDiskFileName: '8345d53a36794b9691fe965095c47f4c.png',
  DownloadFileName: '8345d53a36794b9691fe965095c47f4c.png',
  DownloadFileUrl:
    'https://commonmedia.uat-asicentral.com/orders/Artwork/8345d53a36794b9691fe965095c47f4c.png',
  IsVisible: true,
  FileSize: 5120,
};

describe('PresentationQuoteAttachmentsComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationQuoteAttachmentsComponent,
    providers: [mockProvider(BytesPipe)],
    imports: [
      HttpClientModule,
      ConfigModule.forRoot({ espServiceApiUrl: 'espServiceApiUrl' }),
    ],
  });

  const testSetup = (mediaLinks: MediaLink[] = [mediaLinkMock]) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationQuoteLocalState, {
          connect: () => EMPTY,
          quote: {
            MediaLinks: mediaLinks,
          },
        }),
      ],
    });
    return {
      spectator,
      component: spectator.component,
      state: spectator.inject(PresentationQuoteLocalState),
    };
  };

  it('should render different titles considering the number of media links', () => {
    // Arrange
    const { spectator, state } = testSetup();
    // Assert
    expect(
      spectator.query(selectors.presentationQuoteAttachmentsTitle)
    ).toHaveText('Attachment (1)');
    // Act
    state.quote.MediaLinks = [mediaLinkMock, mediaLinkMock];
    spectator.detectComponentChanges();
    // Assert
    expect(
      spectator.query(selectors.presentationQuoteAttachmentsTitle)
    ).toHaveText('Attachments (2)');
  });
});
