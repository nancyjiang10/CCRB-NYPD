import permits from '$lib/data/permits.json';

// Page settings
// These values are passed to the layout to control what appears on the page.
export function load() {
  return {
    showHeader: true,
    showFooter: true,
    permits,
  };
}

