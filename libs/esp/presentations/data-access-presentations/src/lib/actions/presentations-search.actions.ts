import { SearchCriteria as EspSearchCriteria } from '@esp/common/types';

const ACTION_SCOPE = '[Search Presentations]';

export namespace PresentationsSearchActions {
  export class Search {
    static readonly type = `${ACTION_SCOPE} Search Presentations`;

    constructor(readonly criteria: EspSearchCriteria) {}
  }

  export class SearchLegacyEspWeb {
    static readonly type = `${ACTION_SCOPE} Search Legacy Esp Web Presentations`;

    constructor(readonly criteria: EspSearchCriteria) {}
  }

  export class Reset {
    static readonly type = `${ACTION_SCOPE} Reset`;
  }
}
