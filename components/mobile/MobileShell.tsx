import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#070c17] text-white">
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
