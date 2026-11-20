import { RefreshCw, SearchX, UserPlus, Users } from 'lucide-react';

export function LoadingState() {
  return <div className="skeleton-list" aria-label="Loading employees">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-row" key={index}><i /><span /><span /><span /></div>)}</div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="state"><span className="state-icon state-icon--error"><RefreshCw size={23} /></span><h3>We couldn’t load the directory</h3><p>Check your connection and try again.</p><button className="button button--secondary" onClick={onRetry}><RefreshCw size={16} />Try again</button></div>;
}

export function EmptyState({ searching, onAdd }: { searching: boolean; onAdd: () => void }) {
  if (searching) return <div className="state"><span className="state-icon"><SearchX size={24} /></span><h3>No people found</h3><p>Try a different name or clear your search.</p></div>;
  return <div className="state"><span className="state-icon"><Users size={24} /></span><h3>Build your directory</h3><p>Add your first employee to get started.</p><button className="button button--primary" onClick={onAdd}><UserPlus size={17} />Add employee</button></div>;
}
