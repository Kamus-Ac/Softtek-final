export const builderCanvasStyles = `
  .builder-section, .builder-cover, .builder-menu { padding: 1.5rem; }
  .builder-container, .builder-column { min-width: 0; min-height: 5rem; padding: 0.75rem; }
  .builder-spacer { height: 2rem; }
  .builder-divider { height: 4px; border: 0; background-color: #d6d3d1; }
  .builder-columns, .builder-gallery { display: grid; gap: 1rem; padding: 0.75rem; }
  .builder-columns--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .builder-columns--3, .builder-gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .builder-gallery img, .builder-cover img { display: block; width: 100%; height: auto; }
  .builder-cover { background-color: #fafaf9; }
  .builder-menu { overflow-wrap: anywhere; background-color: #fafaf9; }
  .builder-menu-preview { pointer-events: none; user-select: none; }
  .builder-menu-preview h2 { margin: 0 0 1rem; font-size: 1.5em; }
  .builder-menu-preview h3 { margin: 1rem 0 0.5rem; font-size: 1.15em; }
  .builder-menu-preview ul { display: grid; gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
  .builder-menu-preview[data-layout="grid"] ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .builder-menu-preview li { min-width: 0; padding: 0.75rem; border: 1px solid #d6d3d1; }
  .builder-menu-preview h4 { margin: 0; font-size: 1em; }
  .builder-menu-preview p { margin: 0.375rem 0; }
  .builder-menu-preview span, .builder-menu-preview small { display: block; }
  @media (width > 480px) and (max-width: 768px) {
    .builder-columns--3, .builder-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 480px) {
    .builder-columns--2, .builder-columns--3, .builder-gallery,
    .builder-menu-preview[data-layout="grid"] ul { grid-template-columns: minmax(0, 1fr); }
  }
`;
