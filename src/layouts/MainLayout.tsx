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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-surface-primary text-white font-sans selection:bg-brand-primary/30">
      {/* Top Navigation Bar - High Density */}
      {topBar && (
        <header style={{ zIndex: THEME.zIndex.topBar }} className="h-12 border-b border-white/5 bg-surface-secondary/50 backdrop-blur-md shrink-0">
          {topBar}
        </header>
      )}

      {/* Main Interaction Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Aspect: Navigation/Curriculum */}
        <aside style={{ zIndex: THEME.zIndex.sidebar }} className="w-72 border-r border-white/5 bg-surface-secondary shrink-0 overflow-y-auto custom-scrollbar">
          {sidebar || <CurriculumSidebar />}
        </aside>

        {/* Central Core: 3D City + Main Viewport */}
        <main className="flex-1 relative bg-black shrink-0 overflow-hidden">
          <div className="relative h-full w-full overflow-hidden" style={{ zIndex: THEME.zIndex.overlays }}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Footer / Timeline */}
      {footer && (
        <footer style={{ zIndex: THEME.zIndex.topBar }} className="h-14 border-t border-white/5 bg-surface-secondary/50 backdrop-blur-md shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
}
