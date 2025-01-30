export function createBackgroundSvg(svgIndex) {
  const randomSeed = Math.floor(Math.random() * 100) + 1
  const colorActive = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-active",
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <defs>
    <filter id="displacement-${svgIndex}" height="200%" width="200%" x="-50%" y="-50%">
      <feTurbulence baseFrequency="0.033" numOctaves="5" result="NOISE" seed="${randomSeed}"/>
      <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="70" />
    </filter>
  </defs>
   
  <g filter="url(#displacement-${svgIndex})">
    <rect border="2px solid white" width="50%" height="15%" stroke="#000" stroke-width="3" fill="${colorActive}" />
  </g>
</svg>`;
  const encodedSvg = encodeURIComponent(svg)
  const svgDataURI = `data:image/svg+xml,${encodedSvg}`
  return svgDataURI
}

export function getItemInfo({ items, element }) {
  const currentItemIndex = items.findIndex((item) => item.isEqualNode(element));
  const hasItemBeenFound = currentItemIndex > -1;

  return { currentItemIndex, hasItemBeenFound }
}
