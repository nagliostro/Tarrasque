/** Sprite SVG de ícones, idêntico ao do legado. Usado com <Icon name="..." />. */
export function Sprite() {
  return (
    <svg className="symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <symbol id="swords" viewBox="0 0 24 24">
          <path d="m4 3 4 1 12 14-2 2L4 7Zm16 0-4 1-5 6m-3 4-4 4 2 2 4-4M3 16l5 5m8-1 5-5" />
        </symbol>
        <symbol id="spark" viewBox="0 0 24 24">
          <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM20 2v4m-2-2h4" />
        </symbol>
        <symbol id="beast" viewBox="0 0 24 24">
          <path d="m5 10-2-7 6 4h6l6-4-2 7v7l-7 5-7-5Zm3 3h1m6 0h1m-7 4 3 2 3-2" />
        </symbol>
        <symbol id="bag" viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="14" rx="2" />
          <path d="M9 7V3h6v4M4 12h16m-10 0v3h4v-3" />
        </symbol>
        <symbol id="book" viewBox="0 0 24 24">
          <path d="M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16" />
        </symbol>
        <symbol id="tarrasque" viewBox="0 0 24 24">
          <path d="M8.500 9C4 9 2.500 6 3.500 2c.5 3 2.500 4.500 5.500 5M15.500 9c4.500 0 6-3 5-7-.5 3-2.500 4.500-5.500 5M8.500 9l1.700-3L12 8.200 13.800 6l1.700 3 2.500 5-3 7H9l-3-7ZM8.800 12.800l2 .8m4.400-.8-2 .8M9.500 17.500l1.250 1.500L12 17.500l1.250 1.500 1.250-1.500" />
        </symbol>
        <symbol id="dice" viewBox="0 0 24 24">
          <path d="m12 2 10 6v9l-10 5L2 17V8Z M2 8l10 3 10-3M12 2v9m0 0v11M2 17l10-6 10 6" />
        </symbol>
        <symbol id="person" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-3a7 7 0 0 1 14 0v3M8 2h8" />
        </symbol>
        <symbol id="map" viewBox="0 0 24 24">
          <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16" />
        </symbol>
        <symbol id="panel" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16m7-12-3 4 3 4" />
        </symbol>
        <symbol id="gear" viewBox="0 0 24 24">
          <path d="m10 3-.7 2.4-2 .9L5 5.7 2.8 9.5l1.7 1.8v2l-1.7 1.8L5 19l2.3-.6 2 .9L10 22h4l.7-2.7 2-.9 2.3.6 2.2-3.9-1.7-1.8v-2l1.7-1.8L19 5.7l-2.3.6-2-.9L14 3Z" />
          <circle cx="12" cy="12.5" r="3" />
        </symbol>
        <symbol id="plus" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </symbol>
        <symbol id="close-icon" viewBox="0 0 24 24">
          <path d="m6 6 12 12M6 18 18 6" />
        </symbol>
        <symbol id="wand" viewBox="0 0 24 24">
          <path d="M3 19 15 7l2 2L5 21Zm9-9 2 2M19.500 2l.9 2.100 2.100.9-2.100.9-.9 2.100-.9-2.100-2.100-.9 2.100-.9ZM20 15v4m-2-2h4M7 3v3m-1.500-1.500h3" />
        </symbol>
        <symbol id="arrow" viewBox="0 0 24 24">
          <path d="M5 12h14m-5-5 5 5-5 5" />
        </symbol>
      </defs>
    </svg>
  );
}
