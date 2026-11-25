// True once the site has mounted in this tab. The preloader only plays on a fresh
// visit, never on client-side navigation back to the home page.
let booted = false;

export const hasBooted = () => booted;

export function markBooted() {
  booted = true;
}
