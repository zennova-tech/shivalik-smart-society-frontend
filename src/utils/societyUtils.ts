import { getFromLocalStorage } from './localStorage';

/**
 * Get society ID from localStorage
 * Checks userInfo.societyId, userInfo.society.id, selectedSociety.id, and selectedSociety._id
 * @returns Society ID string or null if not found
 */
export const getSocietyId = (): string | null => {
  const userInfo = getFromLocalStorage<any>('userInfo');
  const selectedSociety = getFromLocalStorage<any>('selectedSociety');
  return userInfo?.societyId || userInfo?.society?.id || selectedSociety?.id || selectedSociety?._id || null;
};

