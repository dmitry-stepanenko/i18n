import {
  AdTrackEvent,
  SourceTrackEvent,
  TrackEventData,
} from '@cosmos/analytics/common';
import { Product } from '@esp/products/types';

export interface PresentationTrack extends TrackEventData {
  id: number;
  index?: string;
  pageNumber?: number;
  marketSegmentCode?: 'ALL';
  ad?: AdTrackEvent;
  productId?: number;
  queryID?: string;
  objectID?: string;
  referrer?: SourceTrackEvent;
  products?: Product[];
  productsDuplicated?: number[];
  productsTruncated?: number[];
}
