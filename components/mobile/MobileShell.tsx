import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-slate-900">
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
