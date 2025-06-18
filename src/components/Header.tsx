
import HeaderLogo from '@/components/header/HeaderLogo';
import NavigationMenu from '@/components/header/NavigationMenu';
import UserSection from '@/components/header/UserSection';

const Header = () => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 color-transition">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <HeaderLogo />

        {/* Navigation Menu */}
        <NavigationMenu />

        {/* User Area and Organization */}
        <UserSection />
      </div>
    </header>
  );
};

export default Header;
