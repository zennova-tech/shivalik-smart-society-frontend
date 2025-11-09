import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { buildingDetailsSchema } from '../utils/validationSchemas/buildingDetailsSchema';
import { CustomSelect } from '../components/ui/CustomSelect';
import { getBuilding, updateBuilding, resetUpdateBuilding, resetGetBuilding } from '../store/slices/buildingSlice';
import { showMessage } from '../utils/Constant';
import { UpdateBuildingPayload } from '../apis/building';
import { getFromLocalStorage } from '../utils/localstorage';

type BuildingDetailsFormData = Yup.InferType<typeof buildingDetailsSchema>;

// Building API Response Interface
interface BuildingApiResponse {
  _id: string;
  society: {
    name: string;
    ref: string;
    logo?: string;
  };
  buildingName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  totalBlocks: number;
  totalUnits: number;
  buildingType: string; // API returns lowercase: "residential", "commercial", etc.
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Redux State Interface
interface BuildingState {
  building: {
    item?: BuildingApiResponse;
  } | BuildingApiResponse | null;
  error: string | null;
  status: 'idle' | 'loading' | 'complete' | 'failed';
  fetchStatus: 'idle' | 'loading' | 'complete' | 'failed';
  fetchError: string | null;
}

const buildingTypeOptions = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Industrial', label: 'Industrial' },
];

/**
 * Normalizes building type from API format (lowercase) to form format (capitalized)
 * @param buildingType - Building type from API (e.g., "residential")
 * @returns Capitalized building type (e.g., "Residential") or empty string
 */
const normalizeBuildingType = (buildingType: string | undefined): string => {
  if (!buildingType) return '';
  
  const normalized = buildingType.toLowerCase();
  const validTypes = ['residential', 'commercial', 'mixed', 'industrial'];
  
  if (!validTypes.includes(normalized)) {
    return '';
  }
  
  // Capitalize first letter
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const BuildingDetailsPage = () => {
  const dispatch = useDispatch();
  const {
    building,
    error,
    status,
    fetchStatus,
    fetchError,
  } = useSelector((state: { building: BuildingState }) => state.building);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [societyId, setSocietyId] = useState<string | null>(null);

  useEffect(() => {
    console.log("building", building);
    
  }, [building])

  /**
   * Helper function to get society ID from localStorage
   * @returns Society ID string or null if not found
   */
  const getSocietyId = useCallback((): string | null => {
    try {
      const userInfo = getFromLocalStorage<{ societyId?: string; society?: { id?: string } }>('userInfo');
      const selectedSociety = getFromLocalStorage<{ id?: string; _id?: string }>('selectedSociety');
      
      return (
        userInfo?.societyId || 
        userInfo?.society?.id || 
        selectedSociety?.id || 
        selectedSociety?._id || 
        null
      );
    } catch (error) {
      console.error('Error getting society ID from localStorage:', error);
      return null;
    }
  }, []);

  // Fetch building data on component mount
  useEffect(() => {
    document.title = 'Building Details - Smart Society';
    
    // Get society ID from userInfo or selectedSociety
    const id = getSocietyId();
    setSocietyId(id);
    
    if (id) {
      dispatch(getBuilding(id));
    } else {
      showMessage('Society ID not found. Please select a society first.', 'error');
    }
  }, [dispatch, getSocietyId]);

  // Handle fetch success and error messages
  useEffect(() => {
    if (fetchStatus === 'failed' && fetchError) {
      // Only show error if it's not a 404 (building might not exist yet)
      if (!fetchError.includes('404') && !fetchError.includes('not found')) {
        showMessage(fetchError || 'Failed to fetch building details', 'error');
      }
      dispatch(resetGetBuilding());
    }
  }, [fetchStatus, fetchError, dispatch]);

  // Handle update success and error messages
  useEffect(() => {
    if (status === 'complete' && building) {
      showMessage('Building details updated successfully!', 'success');
      dispatch(resetUpdateBuilding());
    } else if (status === 'failed' && error) {
      showMessage(error || 'Failed to update building details', 'error');
      dispatch(resetUpdateBuilding());
    }
  }, [status, building, error, dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BuildingDetailsFormData>({
    resolver: yupResolver(buildingDetailsSchema),
    defaultValues: {
      buildingName: '',
      societyName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      totalBlocks: 0,
      totalUnits: 0,
      buildingType: '',
      logo: null,
    },
  });

  /**
   * Maps fetched building data from API response to form fields
   * Handles data transformation and normalization
   * Note: Building data is nested in building.item
   */
  useEffect(() => {
    if (fetchStatus === 'complete' && building) {
      try {
        // Extract building data from building.item or use building directly if it's already the response
        const buildingData = (building as { item?: BuildingApiResponse })?.item || (building as BuildingApiResponse);
        
        // Validate that we have valid building data
        if (!buildingData || typeof buildingData !== 'object') {
          console.warn('Invalid building data structure:', building);
          dispatch(resetGetBuilding());
          return;
        }

        console.log("buildingData", buildingData);
        
        // Map all fields from API response to form
        setValue('buildingName', buildingData.buildingName?.trim() || '', { shouldValidate: false });
        setValue('societyName', buildingData.society?.name?.trim() || '', { shouldValidate: false });
        setValue('address', buildingData.address?.trim() || '', { shouldValidate: false });
        setValue('city', buildingData.city?.trim() || '', { shouldValidate: false });
        setValue('state', buildingData.state?.trim() || '', { shouldValidate: false });
        
        // Handle pinCode (API uses camelCase: pinCode)
        const pinCode = buildingData.pinCode || (buildingData as any).pincode || '';
        setValue('pincode', pinCode.toString().trim(), { shouldValidate: false });
        
        // Handle numeric fields with proper defaults
        setValue('totalBlocks', Number(buildingData.totalBlocks) || 0, { shouldValidate: false });
        setValue('totalUnits', Number(buildingData.totalUnits) || 0, { shouldValidate: false });
        
        // Normalize building type from API format (lowercase) to form format (capitalized)
        const normalizedBuildingType = normalizeBuildingType(buildingData.buildingType);
        setValue('buildingType', normalizedBuildingType, { shouldValidate: false });
        
        // Set logo preview if logo exists (can be URL or base64 string)
        if (buildingData.society?.logo) {
          setLogoPreview(buildingData.society.logo);
        } else {
          setLogoPreview(null);
        }
        
        dispatch(resetGetBuilding());
      } catch (error) {
        console.error('Error mapping building data to form:', error);
        showMessage('Error loading building details. Please refresh the page.', 'error');
        dispatch(resetGetBuilding());
      }
    }
  }, [building, fetchStatus, setValue, dispatch]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showMessage('Please upload a valid image file (JPEG, PNG, or GIF)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Logo size must be less than 5MB', 'error');
        return;
      }
      setValue('logo', file, { shouldValidate: true });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: BuildingDetailsFormData, e?: React.BaseSyntheticEvent) => {
    // Prevent default form submission behavior
    e?.preventDefault();
    
    // Get society ID (refresh in case it changed)
    const currentSocietyId = getSocietyId();
    
    if (!currentSocietyId) {
      showMessage('Society ID not found. Please select a society first.', 'error');
      return;
    }

    let logoBase64: string | undefined;
    if (data.logo && data.logo instanceof File) {
      try {
        logoBase64 = await fileToBase64(data.logo);
      } catch (error) {
        showMessage('Failed to process logo file', 'error');
        return;
      }
    }

    // Map form data to API payload structure
    // Convert buildingType from form format (capitalized) to API format (lowercase)
    const buildingTypeForApi = data.buildingType?.toLowerCase() || '';
    
    const payload: UpdateBuildingPayload = {
      societyId: currentSocietyId,
      society: {
        name: data.societyName.trim(),
        logo: logoBase64 || undefined, // Send base64 string or undefined
        // Do not send ref - let backend handle it from societyId
      },
      buildingName: data.buildingName.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pinCode: data.pincode.trim(),
      totalBlocks: data.totalBlocks,
      totalUnits: data.totalUnits,
      buildingType: buildingTypeForApi,
      // territory and createdBy can be added if needed
    };
    
    // Ensure we don't accidentally send invalid ref
    if (payload.society) {
      delete (payload.society as any).ref;
    }

    // Dispatch the update building action
    dispatch(updateBuilding(payload));
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-black mb-2">Building Details</h1>
        </div>

        {/* Loading State */}
        {fetchStatus === 'loading' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Loading building details...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {fetchStatus !== 'loading' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }} 
            className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8"
          >
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary-black mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Building Name */}
              <div>
                <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700 mb-1">
                  Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="buildingName"
                  {...register('buildingName')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter building name"
                />
                {errors.buildingName && (
                  <p className="mt-1 text-sm text-red-500">{errors.buildingName.message as string}</p>
                )}
              </div>

              {/* Society Name */}
              <div>
                <label htmlFor="societyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Society Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="societyName"
                  {...register('societyName')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter society name"
                />
                {errors.societyName && (
                  <p className="mt-1 text-sm text-red-500">{errors.societyName.message as string}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Society Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo"
                      ref={logoInputRef}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                  </div>
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setValue('logo', null);
                          if (logoInputRef.current) {
                            logoInputRef.current.value = '';
                          }
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove logo"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {errors.logo && (
                  <p className="mt-1 text-sm text-red-500">{errors.logo.message as string}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Accepted formats: JPEG, PNG, GIF (Max 5MB)</p>
              </div>

              {/* Address - Full width */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  {...register('address')}
                  rows={3}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent resize-y"
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address.message as string}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  {...register('city')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message as string}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  {...register('state')}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state.message as string}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  {...register('pincode')}
                  maxLength={6}
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="Enter pincode"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setValue('pincode', value, { shouldValidate: true });
                  }}
                />
                {errors.pincode && (
                  <p className="mt-1 text-sm text-red-500">{errors.pincode.message as string}</p>
                )}
              </div>

              {/* Building Type */}
              <div>
                <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Building Type <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  id="buildingType"
                  name="buildingType"
                  value={watch('buildingType') || ''}
                  onChange={(value) => setValue('buildingType', value, { shouldValidate: true })}
                  options={[
                    { value: 'Residential', label: 'Residential' },
                    { value: 'Commercial', label: 'Commercial' },
                    { value: 'Mixed', label: 'Mixed' },
                    { value: 'Industrial', label: 'Industrial' },
                  ]}
                  placeholder="Select building type"
                  error={errors.buildingType?.message as string}
                  disabled={false}
                  required
                />
              </div>

              {/* Total Blocks */}
              <div>
                <label htmlFor="totalBlocks" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Blocks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalBlocks"
                  {...register('totalBlocks', { valueAsNumber: true })}
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="0"
                />
                {errors.totalBlocks && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalBlocks.message as string}</p>
                )}
              </div>

              {/* Total Units */}
              <div>
                <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalUnits"
                  {...register('totalUnits', { valueAsNumber: true })}
                  min="0"
                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                  placeholder="0"
                />
                {errors.totalUnits && (
                  <p className="mt-1 text-sm text-red-500">{errors.totalUnits.message as string}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset({
                  buildingName: '',
                  societyName: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  totalBlocks: 0,
                  totalUnits: 0,
                  buildingType: '',
                  logo: null,
                });
                setLogoPreview(null);
                if (logoInputRef.current) {
                  logoInputRef.current.value = '';
                }
              }}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default BuildingDetailsPage;

