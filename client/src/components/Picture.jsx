import { useState } from 'react';
import { emojiToOpenMojiUrl } from '../lib/openmoji.js';

// Renders a real OpenMoji illustration for a word/answer, falling back to the
// raw emoji glyph if the image can't be loaded (offline, blocked, or missing).
export default function Picture({ emoji, imageUrl, alt = '', size = 96, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl || emojiToOpenMojiUrl(emoji);

  if (failed || !src) {
    return (
      <span role="img" aria-label={alt} style={{ fontSize: size * 0.7 }} className={className}>
        {emoji || '🖼️'}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`inline-block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
