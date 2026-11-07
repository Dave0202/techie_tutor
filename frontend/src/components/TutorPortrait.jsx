import { getPublicFileUrl } from '../services/api';

const portraitCount = 8;
const portraitSprite = '/brand/tutor-portraits.svg';

function getPortraitNumber(id, name) {
  const numericId = Number(id);
  if (Number.isFinite(numericId) && numericId > 0) {
    return ((numericId - 1) % portraitCount) + 1;
  }

  const hash = [...(name || 'Tutor')].reduce((total, character) => total + character.charCodeAt(0), 0);
  return (hash % portraitCount) + 1;
}

export default function TutorPortrait({ id, name = 'Tutor', profilePictureUrl, className = '' }) {
  const portraitNumber = getPortraitNumber(id, name);

  if (profilePictureUrl) {
    return <img className={`tutor-portrait ${className}`.trim()} src={getPublicFileUrl(profilePictureUrl)} alt={`${name} profile`} />;
  }

  return (
    <svg
      className={`tutor-portrait ${className}`.trim()}
      viewBox="0 0 180 180"
      role="img"
      aria-label={`${name} portrait illustration`}
      focusable="false"
    >
      <use href={`${portraitSprite}#portrait-${portraitNumber}`} />
    </svg>
  );
}
