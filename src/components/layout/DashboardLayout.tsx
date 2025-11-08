import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  IconLogout,
  IconCaretDown,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconX,
  IconSearch,
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect, useRef, useMemo } from 'react';
import { getMenuItemsForRole, MenuItem } from '../../routing/route.config';

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
      return {};
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
  const [searchQuery, setSearchQuery] = useState('');
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
    if (Array.isArray(userInfo.userRoles) && userInfo.userRoles.length > 0) {
      return userInfo.userRoles;
    }
    if (userInfo.role) {
      if (typeof userInfo.role === 'string') {
        return userInfo.role.split(',').map(r => r.trim()).filter(r => r.length > 0);
      }
      return [userInfo.role];
    }
    if (user?.role) {
      if (typeof user.role === 'string') {
        return user.role.split(',').map(r => r.trim()).filter(r => r.length > 0);
      }
      return [user.role];
    }
    return [];
  }, [userInfo.userRoles, userInfo.role, user?.role]);

  const effectiveRoles = useMemo(() => {
    const roles = userRoles.length > 0 ? userRoles : [];
    console.log('Effective roles:', roles);
    return roles;
  }, [userRoles]);

  const [hasSelectedSociety, setHasSelectedSociety] = useState(() => {
    try {
      const selectedSociety = localStorage.getItem('selectedSociety');
      return !!selectedSociety;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkSocietySelection = () => {
      try {
        const selectedSociety = localStorage.getItem('selectedSociety');
        setHasSelectedSociety(!!selectedSociety);
      } catch {
        setHasSelectedSociety(false);
      }
    };

    checkSocietySelection();

    // Listen for storage changes (when society is selected from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedSociety') {
        checkSocietySelection();
      }
    };

    // Listen for custom event (when society is selected in current tab)
    const handleSocietySelected = () => {
      checkSocietySelection();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('societySelected', handleSocietySelected);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('societySelected', handleSocietySelected);
    };
  }, [location.pathname]);

  // Get filtered navigation based on roles and society selection
  const filteredNavigation = useMemo(() => {
    return getMenuItemsForRole(effectiveRoles, hasSelectedSociety, location.pathname);
  }, [effectiveRoles, hasSelectedSociety, location.pathname]);

  // Sync active path and tab states with current location
  useEffect(() => {
    // Update active path when location changes
    setActivePath((prevActivePath) => {
      if (prevActivePath !== location.pathname) {
        localStorage.setItem('lastActivePath', location.pathname);
        return location.pathname;
      }
      return prevActivePath;
    });

    // Update tab open states based on current path
    setTabOpenStates((prevTabOpenStates) => {
      const updatedTabOpenStates = { ...prevTabOpenStates };
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
      localStorage.setItem('tabOpenStates', JSON.stringify(updatedTabOpenStates));
        return updatedTabOpenStates;
    }
      return prevTabOpenStates;
    });
  }, [location.pathname, filteredNavigation]);

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

  const handleTabClick = (item: MenuItem) => {
    // If sidebar is collapsed and user clicks, expand it permanently
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      localStorage.setItem('sidebarCollapsed', 'false');
      setSidebarHovered(false);
    }

    if (item.subItems) {
      // For items with subItems, only expand the menu if it's closed
      // Don't toggle - just ensure it's open
      setTabOpenStates((prev) => {
        const isCurrentlyOpen = !!prev[item.href];
        // Only open if currently closed, don't close if already open
        if (!isCurrentlyOpen) {
          const newState = { ...prev, [item.href]: true };
          localStorage.setItem('tabOpenStates', JSON.stringify(newState));
          // Navigate to first sub-item only if no sub-item is currently active
          const isSubItemActive = item.subItems?.some((sub) => location.pathname === sub.href);
          if (!isSubItemActive && item.subItems && item.subItems.length > 0) {
            const targetPath = item.subItems[0].href;
            navigate(targetPath);
            setActivePath(targetPath);
            localStorage.setItem('lastActivePath', targetPath);
          }
          return newState;
        }
        // If already open, do nothing - don't toggle
        return prev;
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

  const NavItem = ({ item }: { item: MenuItem }) => {
    const hasSubItems = !!item.subItems;
    const isActive =
      activePath === item.href ||
      activePath.startsWith(item.href + '/') ||
      (hasSubItems && (item.subItems?.some((sub) => activePath === sub.href || activePath.startsWith(sub.href + '/')) || tabOpenStates[item.href]));
    
    // Show expanded content when sidebar is not collapsed OR when hovered
    const shouldShowText = !sidebarCollapsed || sidebarHovered;

    return (
      <li
        className={`
          block w-full p-3 rounded-xl
          mb-1
          text-primary-black
          ${isActive ? 'bg-primary-gray/80 font-semibold' : 'bg-transparent font-medium hover:bg-primary-gray/30'}
          text-sm
          list-none relative
          ${hasSubItems ? 'mb-1 min-h-[48px]' : 'mb-0'}
          ${hasSubItems ? 'cursor-default' : 'cursor-pointer'}
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
                  className={`ml-auto ${
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
          <ul className="mt-2 pt-3 pl-7 list-none">
            {item.subItems.map((subItem) => (
              <li
                key={subItem.name}
                className={`
                  p-2.5 text-[var(--primary-black)]
                  text-xs
                  ${activePath === subItem.href || activePath.startsWith(subItem.href + '/') ? 'font-medium' : 'font-normal'}
                  cursor-pointer rounded
                  mb-2 flex items-center
                  hover:bg-primary-gray/20
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubItemClick(subItem.href);
                }}
              >
                <div
                  className={`
                    w-1 h-1 rounded-full mr-2.5
                    ${activePath === subItem.href || activePath.startsWith(subItem.href + '/') ? 'bg-[var(--primary-black)]' : 'bg-transparent'}
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
          {filteredNavigation.length > 0 ? (
            <ul className="p-0 m-0">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              <p>No menu items available</p>
              <p className="text-xs mt-2">Roles: {effectiveRoles.join(', ') || 'None'}</p>
              <p className="text-xs">Path: {location.pathname}</p>
              <p className="text-xs">Society Selected: {hasSelectedSociety ? 'Yes' : 'No'}</p>
            </div>
          )}
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
      <div className="flex-1 flex flex-col  overflow-hidden">
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

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative ml-4">
              <div className="relative">
                <IconSearch 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search by Lead, Inquiry, Follow-Up, etc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
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