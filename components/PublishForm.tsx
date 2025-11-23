"use client";

import { useState } from 'react';

export default function PublishForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; message: string; permalink?: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, caption }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: 'Published successfully', permalink: data.permalink });
      } else {
        setResult({ success: false, message: data.error || 'Failed to publish' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err?.message || 'Unexpected error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
      <label htmlFor="imageUrl">Public Image URL</label>
      <input
        id="imageUrl"
        type="text"
        placeholder="https://example.com/image.jpg"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        required
      />

      <label htmlFor="caption">Caption (optional)</label>
      <textarea
        id="caption"
        placeholder="Write your caption..."
        rows={4}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Publishing?' : 'Publish to Instagram'}
        </button>
        {imageUrl ? <img src={imageUrl} alt="preview" className="preview" style={{ maxWidth: 180 }} /> : null}
      </div>

      {result ? (
        <div style={{ marginTop: 12 }} className={result.success ? 'success' : 'error'}>
          {result.message}
          {result.permalink ? (
            <span>
              {' '}
              ? <a href={result.permalink} target="_blank" rel="noreferrer">View post</a>
            </span>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
