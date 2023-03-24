import { SearchCriteria } from '@esp/common/types';

const ACTION_SCOPE = '[Presentation Products]';

export namespace PresentationProductsActions {
  export class Search {
    static readonly type = `${ACTION_SCOPE} Search products`;

    constructor(public id: number, public criteria?: SearchCriteria) {}
  }

  export class Clear {
    static readonly type = `${ACTION_SCOPE} Clear products`;
  }
}
