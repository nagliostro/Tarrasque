import type { IconName } from '../sections';

export function Icon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${name}`} />
    </svg>
  );
}
