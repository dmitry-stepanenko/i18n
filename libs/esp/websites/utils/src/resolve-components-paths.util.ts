import { kebabCase } from 'lodash-es';

import {
  NavigationTreeItem,
  WebsitePageType,
} from '@website-modules/types-common';

export function resolveComponentsPaths(
  header: NavigationTreeItem,
  path: string = ''
): Record<string, string> {
  let paths: Record<string, string> = {};

  for (const child of header?.Children || []) {
    if (child?.ElementType === WebsitePageType.CustomPage) {
      paths = {
        ...paths,
        ...resolveComponentsPaths(child, `${path}/${kebabCase(child.Title)}`),
        [child.Title]: `${path}/${kebabCase(child.Title)}`,
      };
    } else if (child?.ElementType === WebsitePageType.ProductCollectionPage) {
      paths = {
        ...paths,
        [child.Title]: `/${kebabCase(child.Title)}`,
      };
    } else if (child?.ElementType === WebsitePageType.ProductPage) {
      paths = {
        ...paths,
        [child.Title]: `/products`,
      };
    }
  }

  return paths;
}
