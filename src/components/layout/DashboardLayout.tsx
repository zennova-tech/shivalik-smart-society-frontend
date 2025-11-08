import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  IconUsers,
  IconMapPin,
  IconChartBar,
  IconBook,
  IconLogout,
  IconCaretDown,
  IconDeviceDesktop,
  IconSpeakerphone,
  IconCalendar,
  IconMessageCircle2,
  IconTrendingUp,
  IconHome,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconX
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { Users2 } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';

// Navigation array
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: IconHome },
  { name: 'People', href: '/users', icon: IconUsers },
  {
    name: 'Territory',
    href: '/territory',
    icon: IconMapPin,
    subItems: [
      { name: 'Dashboard', href: '/territory/dashboard' },
      { name: 'Projects', href: '/territory/project' },
      { name: 'Land', href: '/territory/land/dashboard' },
      { name: 'Vendors', href: '/territory/vendor/dashboard' },
      { name: 'Store', href: '/territory/store/dashboard' },
      { name: 'Institute', href: '/territory/institute/dashboard' },
    ],
  },
  { name: 'Desk', href: '/follow-up', icon: IconDeviceDesktop },
  { name: 'Event', href: '/event', icon: IconCalendar },
  { name: 'Knowledge', href: '/article-listing', icon: IconBook },
  { name: 'Channel Sales', href: '/channel-sales', icon: IconChartBar },
  {
    name: 'Campaign',
    href: '/campaign-list',
    icon: IconSpeakerphone,
    subItems: [
      { name: 'Campaign', href: '/campaign-list' },
      { name: 'Add Campaign', href: '/campaign-add' },
    ],
  },
  {
    name: 'Employee',
    href: '/employee/dashboard',
    icon: Users2,
    subItems: [
      { name: 'Dashboard', href: '/employee/dashboard' },
      { name: 'Employee List', href: '/employee/employee-list' },
      // { name: 'Attendance', href: '/employee/attendance' },
      { name: 'Designation', href: '/employee/designation' },
      { name: 'Department', href: '/employee/department' },
      { name: 'Branch', href: '/employee/branch' },
      { name: 'Seating Office', href: '/employee/seating-office' },
      { name: 'Shift Management', href: '/employee/shift-management' },
      { name: 'Jobs', href: '/employee/jobs' },
      { name: 'Report', href: '/employee/report' },
    ],
  },
  {
    name: 'Feedback',
    href: '/feedback-list',
    icon: IconMessageCircle2,
    subItems: [
      { name: 'Feedback Modules', href: '/feedback-modules-list' },
      { name: 'Feedback List', href: '/feedback-list' },
    ],
  },
  {
    name: 'Growth Partner',
    href: '/growth-partner-list',
    icon: IconTrendingUp,
  },
];

// Mapping of roles allowed tabs
const roleToTabs: Record<string, string[]> = {
  SuperAdmin: navigation.map((item) => item.name), 
  Manager: ['Dashboard'],
  LandManager: ['Dashboard', 'Desk', 'Territory'],
  LandExecutive: ['Dashboard', 'Desk', 'Territory'],
  FundManager: ['Dashboard', 'Desk'],
  FundExecutive: ['Dashboard', 'Desk'],
  ProjectSalesManager: ['Dashboard', 'Desk'],
  ProjectPreSales: ['Dashboard', 'Desk'],
  ProjectSiteSales: ['Dashboard', 'Desk'],
  EventAdmin: ['Dashboard', 'Event'],
  KnowledgeAdmin: ['Dashboard', 'Knowledge'],
  CPManager: ['Dashboard', 'Desk', 'Channel Sales'],
  CPExecutive: ['Dashboard', 'Desk', 'Channel Sales'],
  CampaignAdmin: ['Dashboard', 'Campaign'],
  VendorAdmin: ['Dashboard', 'Territory'],
  HRManager: ['Dashboard', 'Employee'],
  HRExecutive: ['Dashboard', 'Employee'],
  CSWebsiteAdmin: ['Dashboard', 'Desk'],
  FurnitureManager: ['Dashboard', 'Desk', 'Territory'],
  FurnitureSalesExecutive: ['Dashboard', 'Desk', 'Territory'],
  FurnitureB2BAdmin: ['Dashboard', 'Desk', 'Territory'],
  FurnitureDealerAdmin: ['Dashboard', 'Desk', 'Territory'],
  GrowthPartnerAdmin: ['Dashboard', 'Growth Partner'],
  InstituteManager: ['Dashboard', 'Desk'],
  InstituteExecutive: ['Dashboard', 'Desk']
};

// Filter navigation based on user roles
const getFilteredNavigation = (roles: string[] = []) => {
  if (roles.includes('SuperAdmin')) {
    return navigation; // full access
  }

  const allowed = new Set<string>();
  const landRestricted = roles?.some((r) =>
    ['LandManager', 'LandExecutive']?.includes(r)
  );

  const furnitureRestricted = roles?.some((role) =>
    ['FurnitureManager', 'FurnitureSalesExecutive', 'FurnitureB2BAdmin', 'FurnitureDealerAdmin']?.includes(role)
  );

  const vendorRestricted = roles.includes('VendorAdmin');

  roles?.forEach((role) => {
    const tabs = roleToTabs[role];
    if (tabs) {
      tabs?.forEach((tab) => allowed.add(tab));
    }
  });

  return navigation
    ?.filter((item) => {
      // Allow Dashboard and Feedback sections for all roles
      if (item.name === 'Dashboard' || item.name === 'Feedback') return true;
      return allowed?.has(item.name);
    })
    ?.map((item) => {
      if (item?.name === 'Territory') {
        const subItems: { name: string; href: string }[] = [];

        // Add Land tab if land-related role
        if (landRestricted) {
          subItems?.push({ name: 'Land', href: '/territory/land/dashboard' });
        }

        // Add Store tab if furniture-related role
        if (furnitureRestricted) {
          subItems?.push({ name: 'Store', href: '/territory/store/dashboard' });
        }

        // Add Vendor tabs if vendor role
        if (vendorRestricted) {
          subItems?.push(
            { name: 'Dashboard', href: '/territory/dashboard' },
            { name: 'Vendors', href: '/territory/vendor/dashboard' }
          );
        }

        // Only return if we actually have subItems
        if (subItems?.length > 0) {
          return { ...item, subItems };
        }
      }

      // Alllow Feedback Modules section only for SuperAdmin role
      if (item?.name === 'Feedback') {
        return {
          ...item,
          subItems: item?.subItems?.filter(
            (sub) => sub?.name !== 'Feedback Modules'
          ),
        };
      }

      return item;
    });
};

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout }: any = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(() => {
    const storedPath = localStorage.getItem('lastActivePath');
    return storedPath || '/dashboard'; // Default to '/dashboard' if no stored path
  });
  const [tabOpenStates, setTabOpenStates] = useState<{ [key: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem('tabOpenStates') || '{}');
    } catch {
      return navigation.reduce((acc, item) => (item.subItems ? { ...acc, [item.href]: false } : acc), {});
    }
  });
  const [logoutModal, setLogoutModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
    } catch {
      return false;
    }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isInitialMount = useRef(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Retrieve user roles from localStorage, fallback to user?.role
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
      return {};
    }
  }, []);

  const userRoles = useMemo(() => {
    return Array.isArray(userInfo.userRoles) ? userInfo.userRoles : [];
  }, [userInfo.userRoles]);

  const effectiveRoles = useMemo(() => {
    return userRoles.length > 0 ? userRoles : (user?.role ? [user?.role] : []);
  }, [userRoles, user?.role]);

  // Apply filtered navigation based on roles
  const filteredNavigation = useMemo(() => {
    return getFilteredNavigation(effectiveRoles);
  }, [effectiveRoles]);

  // Handle initial navigation - only run once on mount
  useEffect(() => {
    if (!isInitialMount.current) return;
    
    // Defer navigation to next tick to avoid updating router during render
    const timeoutId = setTimeout(() => {
      if (!isInitialMount.current) return;
      
      isInitialMount.current = false;
      const storedPath = localStorage.getItem('lastActivePath');
      const currentPath = location.pathname;
      
      // Only redirect if we're on root path
      if (currentPath === '/' || currentPath === '') {
        // If we have a stored path, use it; otherwise go to dashboard
        if (storedPath && storedPath !== '/') {
          navigate(storedPath, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
      // For all other paths, let them render (dashboard, placeholder, etc.)
    }, 0);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (activePath !== location.pathname) {
      setActivePath(location.pathname);
      localStorage.setItem('lastActivePath', location.pathname);
    }

    const updatedTabOpenStates = { ...tabOpenStates };
    let hasChanges = false;

    filteredNavigation.forEach((item) => {
      if (item.subItems) {
        const isSubActive = item.subItems.some((sub) => location.pathname === sub.href);
        const isParentActive = location.pathname === item.href;
        const shouldBeOpen = isSubActive || isParentActive;
        if (updatedTabOpenStates[item.href] !== shouldBeOpen) {
          updatedTabOpenStates[item.href] = shouldBeOpen;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTabOpenStates(updatedTabOpenStates);
      localStorage.setItem('tabOpenStates', JSON.stringify(updatedTabOpenStates));
    }
  }, [location.pathname, activePath, filteredNavigation]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('lastActivePath');
    localStorage.removeItem('tabOpenStates');
    navigate('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Reset hover state when window is resized to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarHovered(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = (item: typeof navigation[0]) => {
    // If sidebar is collapsed and user clicks, expand it permanently
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      localStorage.setItem('sidebarCollapsed', 'false');
      setSidebarHovered(false);
    }

    if (item.subItems) {
      // Normal behavior when sidebar is expanded
      setTabOpenStates((prev) => {
        const isCurrentlyOpen = !!prev[item.href];
        const newState = { ...prev, [item.href]: !isCurrentlyOpen };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        // When opening a menu with sub-items, navigate to its first sub-item
        if (!isCurrentlyOpen && item.subItems) {
          const targetPath = item.subItems[0].href;
          if (location.pathname !== targetPath) {
            navigate(targetPath);
            setActivePath(targetPath);
            localStorage.setItem('lastActivePath', targetPath);
          }
        }
        // When closing, do not navigate away; simply collapse the menu
        return newState;
      });
    } else {
      navigate(item.href);
      setActivePath(item.href);
      localStorage.setItem('lastActivePath', item.href);
      setMobileMenuOpen(false);
    }
  };

  const handleSubItemClick = (href: string) => {
    // If sidebar is collapsed and user clicks, expand it permanently
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      localStorage.setItem('sidebarCollapsed', 'false');
      setSidebarHovered(false);
    }

    navigate(href);
    setActivePath(href);
    localStorage.setItem('lastActivePath', href);
    // Ensure parent menu stays open
    const parentItem = filteredNavigation.find((item) =>
      item.subItems?.some((sub) => sub.href === href)
    );
    if (parentItem) {
      setTabOpenStates((prev) => {
        const newState = { ...prev, [parentItem.href]: true };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        return newState;
      });
    }
    setMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    // Close all submenus when collapsing
    if (newState) {
      const closedStates = Object.keys(tabOpenStates).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as { [key: string]: boolean });
      setTabOpenStates(closedStates);
      localStorage.setItem('tabOpenStates', JSON.stringify(closedStates));
    }
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const hasSubItems = !!item.subItems;
    const isActive =
      activePath === item.href ||
      (hasSubItems && (item.subItems?.some((sub) => activePath === sub.href) || tabOpenStates[item.href]));
    
    // Show expanded content when sidebar is not collapsed OR when hovered
    const shouldShowText = !sidebarCollapsed || sidebarHovered;

    return (
      <li
        className={`
          block w-full p-3 rounded-xl
          mb-1
          text-primary-black
          ${isActive ? 'bg-primary-gray/80 font-semibold' : 'bg-transparent font-medium hover:bg-primary-gray/30'}
          text-sm transition-all duration-300 ease-in-out
          list-none relative
          ${hasSubItems ? 'mb-1 min-h-[48px]' : 'mb-0'}
          cursor-pointer
        `}
        onClick={() => handleTabClick(item)}
        title={!shouldShowText ? item.name : undefined}
      >
        <div className={`flex items-center gap-3 relative z-10 ${shouldShowText ? 'justify-start' : 'justify-center'}`}>
          <item.icon size={20} />
          {shouldShowText && (
            <>
              <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>{item.name}</span>
              {hasSubItems && (
                <div
                  className={`ml-auto transition-transform duration-300 ${
                    tabOpenStates[item.href] ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <IconCaretDown size={16} />
                </div>
              )}
            </>
          )}
        </div>
        {hasSubItems && tabOpenStates[item.href] && shouldShowText && (
          <ul className="mt-2 pt-3 pl-7 list-none animate-slideDown">
            {item.subItems.map((subItem) => (
              <li
                key={subItem.name}
                className={`
                  p-2.5 text-[var(--primary-black)]
                  text-xs
                  ${activePath === subItem.href ? 'font-medium' : 'font-normal'}
                  cursor-pointer transition-all duration-300 rounded
                  mb-2 flex items-center
                  `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubItemClick(subItem.href);
                }}
              >
                <div
                  className={`
                    w-1 h-1 rounded-full mr-2.5
                    ${activePath === subItem.href ? 'bg-[var(--primary-black)]' : 'bg-transparent'}
                  `}
                />
                {subItem.name}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      {/* Logout Modal */}
      {logoutModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setLogoutModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-700 text-sm mb-6">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
          </div>
        </>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed lg:static
          inset-y-0 left-0 z-40
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed && !sidebarHovered ? 'w-20' : 'w-[280px] lg:w-[300px]'}
          flex flex-col
          border-r border-gray-200
          bg-primary-white
        `}
        onMouseEnter={() => {
          // Only enable hover expand on desktop (lg breakpoint and above)
          if (window.innerWidth >= 1024 && sidebarCollapsed) {
            setSidebarHovered(true);
          }
        }}
        onMouseLeave={() => {
          // Only reset hover state on desktop
          if (window.innerWidth >= 1024) {
            setSidebarHovered(false);
          }
        }}
      >
        {/* Logo Section */}
        <div className="p-4">
          <div className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : 'justify-start'} gap-3 mb-8 px-1`}>
            <div className="w-10 h-10 bg-[var(--primary-background-color)] rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--primary-black)]">R</span>
            </div>
            {(!sidebarCollapsed || sidebarHovered) && (
              <span className="text-lg font-bold text-[var(--primary-black)]">R-OS</span>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
          <ul className="p-0 m-0">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>

        {/* Version Section */}
        <div className="p-4 border-t border-gray-200/10">
          {(!sidebarCollapsed || sidebarHovered) && (
            <div className="px-1">
              <p className="text-xs text-[var(--primary-black)] mb-1">Version</p>
              <p className="text-sm font-medium text-[var(--primary-black)]">v1.0.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[60px] sm:h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <IconX size={20} className="text-gray-600" /> : <IconMenu2 size={20} className="text-gray-600" />}
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <IconChevronRight size={20} className="text-gray-600" />
              ) : (
                <IconChevronLeft size={20} className="text-gray-600" />
              )}
            </button>

            {/* Welcome Text */}
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Welcome back, {userInfo.firstName || 'User'} {userInfo.lastName || ''}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {(userInfo.firstName?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {userInfo.firstName || 'User'} {userInfo.lastName || ''}
                </p>
                <p className="text-xs text-gray-500">
                  {effectiveRoles.join(', ') || 'No Role'}
                </p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setLogoutModal(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <IconLogout size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f9fafb] min-h-0">
        <Outlet />
        </main>
      </div>
    </div>
  );
};