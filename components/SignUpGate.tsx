'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { C, SG } from '@/lib/ui-tokens';

interface SignUpGateProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  // Override where the user lands after auth. Defaults to current pathname.
  next?: string;
  // Label on the primary CTA. Defaults to "Create free account".
  primaryLabel?: string;
}

export default function SignUpGate({
  open,
  onClose,
  title,
  description,
  next,
  primaryLabel,
}: SignUpGateProps) {
  const pathname = usePathname();
  const finalNext = next ?? pathname ?? '/dashboard';
  const nextEnc = encodeURIComponent(finalNext);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-xl border p-6 text-center"
            style={{ background: C.cardBg, borderColor: C.borderMid }}
          >
            <Lock size={28} className="mx-auto text-blue-500 mb-3" />
            <h3
              className="text-[16px] font-semibold mb-1.5"
              style={{ ...SG, color: C.text }}
            >
              {title ?? 'Sign up to continue'}
            </h3>
            <p
              className="text-[13px] mb-5"
              style={{ ...SG, color: C.textSub }}
            >
              {description ?? 'Create a free account to save your progress and unlock the full experience.'}
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/sign-in?mode=signup&next=${nextEnc}`}
                className="inline-flex items-center justify-center h-10 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-500 transition-colors"
                style={SG}
              >
                {primaryLabel ?? 'Create free account'}
              </Link>
              <Link
                href={`/sign-in?next=${nextEnc}`}
                className="text-[12.5px] hover:underline transition-colors"
                style={{ ...SG, color: C.textSub }}
              >
                Already have an account? Sign in
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] hover:underline transition-colors mt-1"
                style={{ ...SG, color: C.textMuted }}
              >
                Keep browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
