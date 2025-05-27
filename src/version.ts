export const VERSION = '0.0.4';

const versionText = document.getElementById('version') as HTMLSpanElement;

versionText.textContent = VERSION;
console.log(`Microflow v${VERSION}`);