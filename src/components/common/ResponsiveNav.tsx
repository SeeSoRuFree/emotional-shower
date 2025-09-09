import BottomNav from './BottomNav';
import DesktopHeader from './DesktopHeader';

export default function ResponsiveNav() {
  return (
    <>
      {/* Desktop Header - shown on md+ screens */}
      <DesktopHeader />
      
      {/* Mobile Bottom Navigation - shown on smaller screens */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </>
  );
}