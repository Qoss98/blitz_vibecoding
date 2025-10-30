import React from 'react';

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
};

export const Modal: React.FC<Props> = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-xl">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <h3 className="heading-lg">{title}</h3>
            <button className="btn btn-ghost" onClick={onClose}>Sluiten</button>
          </div>
          <div className="mb-6">{children}</div>
          <div className="flex gap-3 justify-end">{actions}</div>
        </div>
      </div>
    </div>
  );
};


