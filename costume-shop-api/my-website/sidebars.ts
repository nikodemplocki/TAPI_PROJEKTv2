import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 * - create an ordered group of docs
 * - render a sidebar for each doc of that group
 * - provide next/previous navigation
 * 
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 * 
 * Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro', // Twoja strona główna dokumentacji
    {
      type: 'category',
      label: 'API Documentation',
      items: [
        'technology', // Strona o użytych technologiach
        'endpoints',  // Strona o endpointach API
        'swagger',    // Strona o dokumentacji Swagger (jeśli masz)
      ],
    },
  ],
};

export default sidebars;
