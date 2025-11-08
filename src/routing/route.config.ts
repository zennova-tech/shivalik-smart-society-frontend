import {
  IconHome,
  IconBuilding,
  IconUser,
  IconTool,
  IconMessageCircle2,
  IconCar,
  IconCalendar,
  IconPhoto,
  IconCalendarEvent,
  IconAlertCircle,
} from '@tabler/icons-react';

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>; // Icon component from @tabler/icons-react
  subItems?: Array<{ name: string; href: string }>;
  roles?: string[]; // If undefined, available to all roles
}

export const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/society-management',
  Manager: '/society-management'
};

export const ROLE_ROUTES: Record<string, string[]> = {
  SuperAdmin: [
    '/dashboard',
    '/society-management',
    '/building-settings/building-details',
    '/building-settings/floors',
    '/building-settings/blocks',
    '/building-settings/units',
    '/building-settings/notice-board',
    '/building-settings/parking',
    '/building-settings/amenities',
    // Legacy routes for backward compatibility
    '/building-details',
    '/floors',
    '/blocks',
    '/units',
    '/notice-board',
    '/parking',
    '/amenities',
  ],
  Manager: [
    '/dashboard',
    '/society-management',
    '/building-settings/building-details',
    '/building-settings/floors',
    '/building-settings/blocks',
    '/building-settings/units',
    '/building-settings/notice-board',
    '/building-settings/parking',
    '/building-settings/amenities',
    // Legacy routes for backward compatibility
    '/building-details',
    '/floors',
    '/blocks',
    '/units',
    '/notice-board',
    '/parking',
    '/amenities',
  ],
};

// Base navigation menu items
const BASE_MENU_ITEMS: MenuItem[] = [
  {
    name: 'Society Management',
    href: '/society-management',
    icon: IconBuilding,
    roles: ['SuperAdmin', 'Manager'], // Available to all roles
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: IconHome,
    roles: ['SuperAdmin', 'Manager'],
  },
  {
    name: 'Building Settings',
    href: '/building-settings',
    icon: IconBuilding,
    roles: ['SuperAdmin', 'Manager'],
    subItems: [
      { name: 'Building Details', href: '/building-settings/building-details' },
      { name: 'Floors', href: '/building-settings/floors' },
      { name: 'Blocks', href: '/building-settings/blocks' },
      { name: 'Units', href: '/building-settings/units' },
      { name: 'Parking', href: '/building-settings/parking' },
      { name: 'Notice Board', href: '/building-settings/notice-board' },
      { name: 'Amenities', href: '/building-settings/amenities' },
    ],
  },
  {
    name: 'Users',
    href: '/users',
    icon: IconUser,
    roles: ['SuperAdmin', 'Manager'],
    subItems: [
      { name: 'Members', href: '/users/members' },
      { name: 'Society Employee', href: '/users/society-employee' },
      { name: 'Committee Member', href: '/users/committee-member' },
    ],
  },
  {
    name: 'Maintenance & Bill',
    href: '/maintenance-bill',
    icon: IconTool,
    roles: ['SuperAdmin', 'Manager'],
    subItems: [
      { name: 'Add Bill', href: '/maintenance-bill/add-bill' },
      { name: 'Add Maintenance', href: '/maintenance-bill/add-maintenance' },
      { name: 'View Maintenance & Bill', href: '/maintenance-bill/view' },
    ],
  },
  {
    name: 'Complaints',
    href: '/complaints',
    icon: IconMessageCircle2,
    roles: ['SuperAdmin', 'Manager'],
  },
  {
    name: 'Parking',
    href: '/parking',
    icon: IconCar,
    roles: ['SuperAdmin', 'Manager'],
    subItems: [
      { name: 'Members Vehicles', href: '/parking/members-vehicles' },
      { name: 'Vehicle In/Out', href: '/parking/vehicle-in-out' },
      { name: 'Parking Settings', href: '/parking/settings' },
      { name: 'Tag Reader Report', href: '/parking/tag-reader-report' },
      { name: 'RFID Report', href: '/parking/rfid-report' },
    ],
  },
  {
    name: 'Events',
    href: '/events',
    icon: IconCalendar,
    roles: ['SuperAdmin', 'Manager'],
    subItems: [
      { name: 'Add Event', href: '/events/add' },
      { name: 'View Events', href: '/events/view' },
    ],
  },
  {
    name: 'Building Gallery',
    href: '/building-gallery',
    icon: IconPhoto,
    roles: ['SuperAdmin', 'Manager'],
  },
  {
    name: 'Book Amenity',
    href: '/book-amenity',
    icon: IconCalendarEvent,
    roles: ['SuperAdmin', 'Manager'],
  },
  {
    name: 'Penalty',
    href: '/penalty',
    icon: IconAlertCircle,
    roles: ['SuperAdmin', 'Manager'],
  },
];

/**
 * Normalize role name for comparison (case-insensitive)
 */
const normalizeRole = (role: string): string => {
  return role.toLowerCase().trim();
};

/**
 * Check if user roles match required roles (case-insensitive)
 */
const hasMatchingRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  const normalizedUserRoles = userRoles.map(normalizeRole);
  return requiredRoles.some((requiredRole) =>
    normalizedUserRoles.includes(normalizeRole(requiredRole))
  );
};

/**
 * Get menu items for a specific role
 * @param roles - Array of user roles
 * @param hasSelectedSociety - Whether a society is selected
 * @param currentPath - Current route path
 * @returns Filtered menu items based on role and society selection
 */
export const getMenuItemsForRole = (
  roles: string[] = [],
  hasSelectedSociety: boolean,
  currentPath: string
): MenuItem[] => {
  // Normalize roles for comparison
  const normalizedRoles = roles.length > 0 
    ? roles 
    : []; // Keep empty if no roles

  // Debug logging
  console.log('getMenuItemsForRole called with:', {
    roles,
    normalizedRoles,
    hasSelectedSociety,
    currentPath
  });

  // If on society-management page or no society is selected, only show Society Management
  if (currentPath === '/society-management' || !hasSelectedSociety) {
    // Always show Society Management when on that page or no society selected
    // (regardless of roles, as user needs to be able to select a society)
    const societyManagementItem = BASE_MENU_ITEMS.find(
      (item) => item.href === '/society-management'
    );
    const result = societyManagementItem ? [societyManagementItem] : [];
    console.log('Society Management items (always shown):', result);
    return result;
  }

  // If society is selected, filter menu items based on roles
  const filteredItems = BASE_MENU_ITEMS.filter((item) => {
    // If item has no roles specified, show it to everyone
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // If no user roles provided, show all items (to avoid empty sidebar)
    // This allows users to access the app even if roles aren't properly set
    if (normalizedRoles.length === 0) {
      console.warn('No user roles found, showing all menu items as fallback');
      return true;
    }
    // Check if user has at least one of the required roles
    return hasMatchingRole(normalizedRoles, item.roles);
  });
  
  console.log('Filtered menu items:', filteredItems.length, 'items');
  return filteredItems;
};