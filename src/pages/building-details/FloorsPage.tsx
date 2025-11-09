import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { floorsSchema } from '../../utils/validationSchemas/floorsSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX } from '@tabler/icons-react';
import {
  getFloorsApi,
  getFloorByIdApi,
  addFloorApi,
  updateFloorApi,
  deleteFloorApi,
  Floor,
  FloorResponse,
  GetFloorsParams,
  AddFloorPayload,
  UpdateFloorPayload,
} from '../../apis/floor';
import { getBlocksBySocietyApi, Block } from '../../apis/block';
import { getUnitsApi } from '../../apis/unit';
import { getSocietyId } from '../../utils/societyUtils';
import { showMessage } from '../../utils/Constant';

type FloorsFormData = Yup.InferType<typeof floorsSchema>;

interface FloorWithUnits extends Floor {
  blockName: string;
  totalUnits: number;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const FloorsPage = () => {
  const [floors, setFloors] = useState<FloorWithUnits[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [blockOptions, setBlockOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [unitsCountMap, setUnitsCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = 'Floors - Smart Society';
    // Fetch blocks first to ensure they're available for the form
    fetchBlocks().then(() => {
      fetchFloors();
    });
    // Fetch units count in background (don't block UI)
    fetchUnitsCount().catch(err => {
      console.error('Error fetching units count:', err);
      // Silently fail - not critical for UI
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      fetchFloors();
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchFloors();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchFloors();
  }, [page, selectedFilters]);

  const fetchBlocks = async (): Promise<void> => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksBySocietyApi({ limit: 500, status: 'active' });
      const blocks = (response.items || []).map((block: Block) => ({
        value: String(block._id).trim(), // Normalize to string and trim
        label: block.name || 'Unnamed Block',
      }));
      setBlockOptions(blocks);
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
      setBlockOptions([]);
      return Promise.reject(error);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchUnitsCount = async () => {
    try {
      const response = await getUnitsApi({ limit: 500, page: 1 });
      const units = response.items || [];
      const countMap: Record<string, number> = {};
      
      units.forEach((unit) => {
        const floorId = typeof unit.floor === 'string' ? unit.floor : unit.floor?._id;
        if (floorId) {
          countMap[floorId] = (countMap[floorId] || 0) + 1;
        }
      });
      
      setUnitsCountMap(countMap);
    } catch (error: any) {
      setUnitsCountMap({});
    }
  };

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const params: GetFloorsParams = {
        page,
        limit,
        q: searchTerm || undefined,
        block: selectedFilters.blockName || undefined,
        status: selectedFilters.status || undefined,
      };

      // Add timeout to prevent hanging
      const response = await Promise.race([
        getFloorsApi(params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]) as FloorResponse;
      
      const floorsWithUnits: FloorWithUnits[] = (response.items || []).map((floor: Floor) => {
        // Extract block name and ensure block ID is preserved as normalized string
        let blockName = '';
        let blockId: string = '';
        if (floor.block) {
          if (typeof floor.block === 'string') {
            blockId = String(floor.block).trim();
            // Try to find block name from blockOptions first, then from populated block
            const blockOption = blockOptions.find(b => String(b.value).trim() === blockId);
            blockName = blockOption?.label || '';
          } else if (typeof floor.block === 'object' && floor.block !== null) {
            blockId = String((floor.block as any)?._id || (floor.block as any)?.id || '').trim();
            blockName = (floor.block as any)?.name || '';
            // If blockName is empty, try to find it from blockOptions
            if (!blockName && blockId) {
              const blockOption = blockOptions.find(b => String(b.value).trim() === blockId);
              blockName = blockOption?.label || '';
            }
          }
        }
        const totalUnits = unitsCountMap[floor._id] || 0;
        return {
          ...floor,
          block: blockId, // Always store block as normalized string ID for consistency
          blockName,
          totalUnits,
        };
      });
      
      setFloors(floorsWithUnits);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching floors:', error);
      if (error.message !== 'Request timeout') {
        showMessage('Failed to fetch floors', 'error');
      } else {
        showMessage('Request timed out. Please try again.', 'error');
      }
      setFloors([]);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FloorsFormData>({
    resolver: yupResolver(floorsSchema),
    defaultValues: {
      floorNumber: 0,
      floorName: '',
      blockId: '',
      status: 'active',
    },
  });

  // Effect to update blockId in form when editingFloor changes and blockOptions are available
  useEffect(() => {
    if (editingFloor && showForm && blockOptions.length > 0) {
      // Extract block ID from editing floor and normalize to string
      let blockId = '';
      if (editingFloor.block) {
        if (typeof editingFloor.block === 'string') {
          blockId = String(editingFloor.block).trim();
        } else if (typeof editingFloor.block === 'object' && editingFloor.block !== null) {
          blockId = String((editingFloor.block as any)?._id || (editingFloor.block as any)?.id || '').trim();
        }
      }
      
      // Only set if we have a valid blockId and it exists in blockOptions
      // Compare as strings to handle ObjectId vs string mismatches
      if (blockId) {
        const blockExists = blockOptions.some(opt => String(opt.value).trim() === blockId);
        if (blockExists) {
          console.log('Setting blockId via useEffect:', blockId, 'matching option:', blockOptions.find(opt => String(opt.value).trim() === blockId));
          setValue('blockId', blockId, { shouldValidate: true });
        } else {
          console.warn('Block ID not found in blockOptions:', blockId, 'Available options:', blockOptions.map(b => b.value));
          // Try to find by converting both to strings for comparison
          const matchingOption = blockOptions.find(opt => {
            const optValue = String(opt.value).trim();
            const floorBlockId = blockId.trim();
            return optValue === floorBlockId || optValue.includes(floorBlockId) || floorBlockId.includes(optValue);
          });
          if (matchingOption) {
            console.log('Found matching block by fuzzy match:', matchingOption.value);
            setValue('blockId', matchingOption.value, { shouldValidate: true });
          }
        }
      }
    }
  }, [editingFloor, showForm, blockOptions, setValue]);

  const onSubmit = async (data: FloorsFormData) => {
    try {
      setSubmitting(true);
      
      // Get society ID to send to backend
      const societyId = getSocietyId();
      
      if (editingFloor) {
        // Extract building ID from editing floor (most reliable source)
        let buildingIdFromFloor = '';
        if (editingFloor.building) {
          if (typeof editingFloor.building === 'string') {
            buildingIdFromFloor = editingFloor.building;
          } else if (typeof editingFloor.building === 'object' && editingFloor.building !== null) {
            buildingIdFromFloor = (editingFloor.building as any)?._id || (editingFloor.building as any)?.id || '';
          }
        }
        
        const updatePayload: UpdateFloorPayload = {
          id: editingFloor._id,
          name: data.floorName,
          number: data.floorNumber,
          block: data.blockId,
          status: data.status,
          building: buildingIdFromFloor || undefined, // Include if available
          societyId: societyId || undefined, // Always send society ID so backend can get building if needed
        } as any;
        
        await updateFloorApi(updatePayload);
        showMessage('Floor updated successfully!', 'success');
      } else {
        const addPayload: AddFloorPayload = {
          name: data.floorName,
          number: data.floorNumber,
          block: data.blockId,
          status: data.status || 'active',
          societyId: societyId || undefined, // Send society ID so backend can get building
        } as any;
        await addFloorApi(addPayload);
        showMessage('Floor added successfully!', 'success');
      }
      
      reset();
      setShowForm(false);
      setEditingFloor(null);
      fetchFloors();
      fetchUnitsCount();
    } catch (error: any) {
      console.error('Error saving floor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save floor';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (floor: FloorWithUnits) => {
    try {
      // Ensure blocks are loaded first (critical for block dropdown to work)
      if (blockOptions.length === 0) {
        await fetchBlocks();
      }
      
      // Extract block ID from floor - FloorWithUnits should have block as string ID
      // But handle both cases for safety, and normalize to string
      let blockId = '';
      if (floor.block) {
        if (typeof floor.block === 'string') {
          blockId = String(floor.block).trim();
        } else if (typeof floor.block === 'object' && floor.block !== null) {
          blockId = String((floor.block as any)?._id || (floor.block as any)?.id || '').trim();
        }
      }
      
      console.log('Editing floor - blockId:', blockId, 'blockOptions:', blockOptions.length, 'blockOptions values:', blockOptions.map(b => b.value));
      
      // Show form immediately with existing data
      setEditingFloor(floor);
      setValue('floorNumber', floor.number, { shouldValidate: false });
      setValue('floorName', floor.name, { shouldValidate: false });
      setValue('status', floor.status || 'active', { shouldValidate: false });
      
      // Set blockId immediately if we have it and blockOptions are loaded
      // Compare as strings to handle ObjectId vs string mismatches
      if (blockId && blockOptions.length > 0) {
        const blockExists = blockOptions.some(opt => String(opt.value).trim() === blockId);
        if (blockExists) {
          console.log('Setting blockId immediately:', blockId);
          setValue('blockId', blockId, { shouldValidate: true });
        } else {
          console.warn('Block ID not found in options:', blockId, 'Available:', blockOptions.map(b => b.value));
          // Try fuzzy match
          const matchingOption = blockOptions.find(opt => {
            const optValue = String(opt.value).trim();
            return optValue === blockId || optValue.includes(blockId) || blockId.includes(optValue);
          });
          if (matchingOption) {
            console.log('Found matching block by fuzzy match:', matchingOption.value);
            setValue('blockId', matchingOption.value, { shouldValidate: true });
          }
        }
      }
      
      setShowForm(true);
      
      // Fetch full details in background (with timeout)
      try {
        const fullFloor = await Promise.race([
          getFloorByIdApi(floor._id),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]) as Floor;
        
        // Extract block ID from full floor details and normalize to string
        let fullBlockId = '';
        if (fullFloor.block) {
          if (typeof fullFloor.block === 'string') {
            fullBlockId = String(fullFloor.block).trim();
          } else if (typeof fullFloor.block === 'object' && fullFloor.block !== null) {
            fullBlockId = String((fullFloor.block as any)?._id || (fullFloor.block as any)?.id || '').trim();
          }
        }
        
        // Update with full details if fetch succeeds
        setEditingFloor(fullFloor);
        setValue('floorNumber', fullFloor.number);
        setValue('floorName', fullFloor.name);
        setValue('status', fullFloor.status || 'active');
        
        // Update blockId if we got a valid one from the API
        // Compare as strings to handle ObjectId vs string mismatches
        if (fullBlockId) {
          console.log('Updating blockId from API:', fullBlockId);
          const blockExists = blockOptions.some(opt => String(opt.value).trim() === fullBlockId);
          if (blockExists) {
            setValue('blockId', fullBlockId, { shouldValidate: true });
          } else {
            console.warn('Block from API not found in options:', fullBlockId);
            // Try fuzzy match
            const matchingOption = blockOptions.find(opt => {
              const optValue = String(opt.value).trim();
              return optValue === fullBlockId || optValue.includes(fullBlockId) || fullBlockId.includes(optValue);
            });
            if (matchingOption) {
              console.log('Found matching block by fuzzy match:', matchingOption.value);
              setValue('blockId', matchingOption.value, { shouldValidate: true });
            } else if (blockId) {
              // Fallback to the original blockId
              const originalExists = blockOptions.some(opt => String(opt.value).trim() === blockId);
              if (originalExists) {
                setValue('blockId', blockId, { shouldValidate: true });
              }
            }
          }
        } else if (blockId) {
          // Fallback to the original blockId
          const blockExists = blockOptions.some(opt => String(opt.value).trim() === blockId);
          if (blockExists) {
            setValue('blockId', blockId, { shouldValidate: true });
          }
        }
      } catch (fetchError: any) {
        console.warn('Could not fetch full floor details, using existing data:', fetchError);
        // Continue with existing floor data - don't block the form
        // The useEffect will handle setting blockId when blockOptions are ready
      }
    } catch (error: any) {
      console.error('Error opening floor for edit:', error);
      showMessage('Failed to open floor for editing', 'error');
    }
  };

  const handleDelete = async (floor: FloorWithUnits) => {
    if (window.confirm(`Are you sure you want to delete ${floor.name}?`)) {
      try {
        await deleteFloorApi({ id: floor._id });
        showMessage('Floor deleted successfully!', 'success');
        fetchFloors();
        fetchUnitsCount();
      } catch (error: any) {
        console.error('Error deleting floor:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete floor';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (floor: FloorWithUnits) => {
    const statusDisplay = floor.status === 'active' ? 'Active' : 'Inactive';
    const unitsDisplay = floor.totalUnits === 0 
      ? '0 units' 
      : `${floor.totalUnits} ${floor.totalUnits === 1 ? 'unit' : 'units'}`;
    alert(
      `Floor Details:\n\nName: ${floor.name}\nFloor Number: ${floor.number}\nBlock: ${floor.blockName}\nStatus: ${statusDisplay}\nTotal Units: ${unitsDisplay}`
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <IconX className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const columns: Column<FloorWithUnits>[] = [
    { key: 'number', header: 'Floor No.', sortable: true },
    { key: 'blockName', header: 'Block', sortable: true },
    { key: 'name', header: 'Floor Name', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (floor) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(floor.status || 'active')}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              floor.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {floor.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'totalUnits',
      header: 'Total Units',
      sortable: true,
      render: (floor) => (
        <div className="text-sm text-primary-black">
          {floor.totalUnits === 0 ? (
            <span className="text-gray-500">0 units</span>
          ) : (
            `${floor.totalUnits} ${floor.totalUnits === 1 ? 'unit' : 'units'}`
          )}
        </div>
      ),
    },
  ];

  const actions: ActionButton<FloorWithUnits>[] = [
    {
      label: 'View',
      icon: <IconEye className="w-4 h-4" />,
      onClick: handleView,
      variant: 'primary',
    },
    {
      label: 'Edit',
      icon: <IconEdit className="w-4 h-4" />,
      onClick: handleEdit,
      variant: 'primary',
    },
    {
      label: 'Delete',
      icon: <IconTrash className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  const filteredFloors = floors;

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value || undefined,
      };
      Object.keys(newFilters).forEach((k) => {
        if (newFilters[k] === undefined || newFilters[k] === '') {
          delete newFilters[k];
        }
      });
      return newFilters;
    });
    setPage(1);
  };

  // Only show loading screen on initial load, allow form to show even if loading
  if (loading && floors.length === 0 && !showForm) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading floors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto ">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Floors</h1>
          {/* Only show Add Floor button when not in edit mode */}
          {!showForm && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingFloor(null);
                  reset({
                    floorNumber: 0,
                    floorName: '',
                    blockId: '',
                    status: 'active',
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                Add Floor
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Form - Show first if form is open */}
        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingFloor ? 'Edit Floor' : 'Add New Floor'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingFloor(null);
                  reset({
                    floorNumber: 0,
                    floorName: '',
                    blockId: '',
                    status: 'active',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Floor Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Floor Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Floor Number */}
                <div>
                  <label htmlFor="floorNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="floorNumber"
                    {...register('floorNumber', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter floor number"
                  />
                  {errors.floorNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.floorNumber.message as string}</p>
                  )}
                </div>

                {/* Floor Name */}
                <div>
                  <label htmlFor="floorName" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="floorName"
                    {...register('floorName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter floor name (e.g., Ground Floor, First Floor)"
                  />
                  {errors.floorName && (
                    <p className="mt-1 text-sm text-red-500">{errors.floorName.message as string}</p>
                  )}
                </div>

                {/* Block */}
                <div>
                  <label htmlFor="blockId" className="block text-sm font-medium text-gray-700 mb-1">
                    Block <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="blockId"
                    name="blockId"
                    value={watch('blockId') || ''}
                    onChange={(value) => setValue('blockId', value, { shouldValidate: true })}
                    options={[{ value: '', label: 'Select Block' }, ...blockOptions]}
                    placeholder={loadingBlocks ? 'Loading blocks...' : 'Select block'}
                    error={errors.blockId?.message as string}
                    disabled={loadingBlocks}
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="status"
                    name="status"
                    value={watch('status') || 'active'}
                    onChange={(value) => setValue('status', value, { shouldValidate: true })}
                    options={statusOptions}
                    placeholder="Select status"
                    error={errors.status?.message as string}
                    disabled={false}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    floorNumber: 0,
                    floorName: '',
                    blockId: '',
                    status: 'active',
                  });
                  setShowForm(false);
                  setEditingFloor(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingFloor ? 'Update Floor' : 'Save Floor'}
              </button>
            </div>
          </form>
        )}

        {/* Data Table */}
        {!showForm && (
          <div>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search floors by name, block, or status..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    />
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex gap-4 flex-1">
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-block"
                      name="filter-block"
                      value={selectedFilters.blockName || ''}
                      onChange={(value) => handleFilterChange('blockName', value)}
                      options={[
                        { value: '', label: 'All Blocks' },
                        ...blockOptions,
                      ]}
                      placeholder="All Blocks"
                      disabled={loadingBlocks}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-status"
                      name="filter-status"
                      value={selectedFilters.status || ''}
                      onChange={(value) => handleFilterChange('status', value)}
                      options={[
                        { value: '', label: 'All Status' },
                        ...statusOptions,
                      ]}
                      placeholder="All Status"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredFloors}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No floors found"
              loading={loading}
            />

            {total > limit && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} floors
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * limit >= total}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorsPage;
