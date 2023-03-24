import { NavigationTreeItem } from '@website-modules/types-common';

import { resolveComponentsPaths } from './resolve-components-paths.util';

const Header = {
  Id: 0,
  Visible: false,
  IsProduct: false,
  Children: [
    {
      Title: 'Mugs',
      ElementType: 'CustomPage',
      Children: [
        {
          Title: 'New Collection',
          ElementType: 'CollectionPage',
          Children: [
            {
              Title: 'New Collection1',
              ElementType: 'CollectionPage',
              Children: [],
            },
          ],
        },
        {
          Title: 'Testing page',
          ElementType: 'CustomPage',
          Children: [
            {
              Title: 'test',
              ElementType: 'CollectionPage',
              Children: [],
            },
          ],
        },
      ],
    },
    {
      Title: 'Test 1',
      ElementType: 'CustomPage',
      Children: [
        {
          Title: 'Test 1 - 1',
          ElementType: 'CustomPage',
          Children: [
            {
              Title: 'Test 1 - 1 - 1',
              ElementType: 'CustomPage',
              Children: [],
            },
          ],
        },
        {
          Title: 'Test 1-2',
          ElementType: 'CustomPage',
          Children: [],
        },
      ],
    },
  ],
} as unknown as NavigationTreeItem;

describe('resolveComponentsPaths', () => {
  it('should create a map of links associated with proper page title', () => {
    expect(resolveComponentsPaths(Header)).toMatchObject({
      'New Collection': '/new-collection',
      test: '/test',
      'Testing page': '/mugs/testing-page',
      Mugs: '/mugs',
      'Test 1 - 1': '/test-1/test-1-1',
      'Test 1 - 1 - 1': '/test-1/test-1-1/test-1-1-1',
      'Test 1-2': '/test-1/test-1-2',
      'Test 1': '/test-1',
    });
  });
});
