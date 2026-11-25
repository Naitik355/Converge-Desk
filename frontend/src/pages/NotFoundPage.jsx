import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--accent)]">
        <Compass className="h-5 w-5" />
      </span>
      <p className="sx-eyebrow">Error 404</p>
      <h1 className="mt-2 sx-display-m">This page doesn't exist.</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
        The route may have moved, or the workspace it pointed to is no longer available.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={() => navigate('/')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          Browse projects
        </Button>
      </div>
    </div>
  );
};
