import { useState } from 'react';
import { getPublicFileUrl } from '../services/api';

const portraitCount = 6;
const portraitPhotos = [
  'https://images.pexels.com/photos/8423069/pexels-photo-8423069.jpeg',
  'https://images.pexels.com/photos/8617627/pexels-photo-8617627.jpeg',
  'https://images.pexels.com/photos/5212340/pexels-photo-5212340.jpeg',
  'https://images.pexels.com/photos/34526414/pexels-photo-34526414.jpeg',
  'https://images.pexels.com/photos/8617962/pexels-photo-8617962.jpeg',
  'https://images.pexels.com/photos/5427870/pexels-photo-5427870.jpeg',
];

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
  const [imageFailed, setImageFailed] = useState(false);
  const safeClassName = `tutor-portrait ${className}`.trim();

  if (profilePictureUrl) {
    if (imageFailed) {
      const initials = (name || 'T')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'T';

      return (
        <div
          className={`${safeClassName} tutor-portrait-initials`}
          role="img"
          aria-label={`${name} portrait`}
        >
          {initials}
        </div>
      );
    }

    return (
      <img
        className={safeClassName}
        src={getPublicFileUrl(profilePictureUrl)}
        alt={`${name} profile`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (imageFailed) {
    const initials = (name || 'T')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'T';

    return (
      <div
        className={`${safeClassName} tutor-portrait-initials`}
        role="img"
        aria-label={`${name} portrait`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      className={safeClassName}
      src={portraitPhotos[portraitNumber - 1]}
      alt={`${name} profile`}
      onError={() => setImageFailed(true)}
    />
  );
}
