import PublishForm from '@/components/PublishForm';

export default function Page() {
  return (
    <div className="card">
      <h1>Instagram Auto Poster</h1>
      <p className="help">Provide a public image URL and optional caption to publish immediately to your connected Instagram Business account using the Graph API.</p>
      <PublishForm />
    </div>
  );
}
