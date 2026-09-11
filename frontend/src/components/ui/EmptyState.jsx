import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Layers,
  title = 'No Items Found',
  description = 'There are no active records in this view right now.',
  actionLabel = null,
  actionLink = null,
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#0B0B0B] border border-[#1C1C1F] rounded-xl my-4">
      <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#27272A] flex items-center justify-center mb-3.5 text-[#A1A1AA]">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold text-white mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-[#71717A] max-w-sm mb-5 leading-relaxed">{description}</p>

      {actionLabel && (
        actionLink ? (
          <Link to={actionLink}>
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="sm" onClick={onAction} icon={ArrowRight} iconPosition="right">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}

