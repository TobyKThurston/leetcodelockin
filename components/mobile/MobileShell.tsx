import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="theme-light min-h-[100dvh] flex flex-col"
      style={{
        color: 'var(--ll-ink)',
        backgroundColor: 'var(--ll-bg)',
        backgroundImage: [
          'radial-gradient(ellipse 55% 45% at 78% 8%, rgba(59,130,246,0.12), transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(56,189,248,0.10), transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(59,130,246,0.06), transparent 72%)',
        ].join(', '),
        backgroundAttachment: 'fixed, fixed, fixed',
      }}
    >
      <MobileHeader />
      <main
        className="flex-1 px-4 pt-5 overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
