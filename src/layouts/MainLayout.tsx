import React from 'react';
import CurriculumSidebar from '../components/CurriculumSidebar';
import { THEME } from '../design-system/tokens';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topBar?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MainLayout({ children, sidebar, topBar, footer }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0a0f] text-white font-sans">
      {/* Top Navigation Bar */}
      {topBar && (
        <header style={{ zIndex: THEME.zIndex.topBar }} className="h-14 border-b border-white/10 shrink-0">
          {topBar}
        </header>
      )}

      {/* Main Interaction Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Aspect: Navigation/Curriculum */}
        <aside style={{ zIndex: THEME.zIndex.sidebar }} className="w-80 border-r border-white/5 shrink-0 overflow-y-auto">
          {sidebar || <CurriculumSidebar />}
        </aside>

        {/* Central Core: 3D City + Main Viewport */}
        <main className="flex-1 relative bg-black shrink-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: THEME.zIndex.threeCanvas }}>
             {/* SceneCanvas is usually absolute fixed, but can be here */}
          </div>
          <div className="relative h-full w-full overflow-hidden" style={{ zIndex: THEME.zIndex.overlays }}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Footer / Timeline */}
      {footer && (
        <footer style={{ zIndex: THEME.zIndex.topBar }} className="h-16 border-t border-white/10 shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
}
