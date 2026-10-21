import type {ReactNode} from 'react';
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';

/**
 * Cards for every page in the current section. Used in each section's index.mdx.
 * Renders nothing while the section has no pages.
 */
export default function SectionPages(): ReactNode {
  let items;
  try {
    items = useCurrentSidebarCategory().items;
  } catch {
    // A section with only index.mdx is not a sidebar category, so there is nothing to list.
    return null;
  }
  return <DocCardList items={items} />;
}
