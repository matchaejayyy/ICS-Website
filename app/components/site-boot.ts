// first visit in this tab
let booted = false;

export const hasBooted = () => booted;

export function markBooted() {
  booted = true;
}
