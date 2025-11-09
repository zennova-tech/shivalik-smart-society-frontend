import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { unitsSchema } from '../../utils/validationSchemas/unitsSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { getBlocksBySocietyApi, Block } from '../../apis/block';
import { getFloorsApi, Floor } from '../../apis/floor';
import {
  getUnitsApi,
  getUnitByIdApi,
  addUnitApi,
  updateUnitApi,
  deleteUnitApi,
  Unit,
  GetUnitsParams,
  AddUnitPayload,
  UpdateUnitPayload,
} from '../../apis/unit';
import { getBuildingApi, normalizeBuildingResponse } from '../../apis/building';
import { getSocietyId } from '../../utils/societyUtils';
import { showMessage } from '../../utils/Constant';

type UnitsFormData = Yup.InferType<typeof unitsSchema>;

const statusOptions = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'maintenance', label: 'Maintenance' },
];

const unitTypeOptions = [
  { value: '1BHK', label: '1 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '4BHK', label: '4 BHK' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Shop', label: 'Shop' },
  { value: 'Office', label: 'Office' },
];

export const UnitsPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [blockOptions, setBlockOptions] = useState<Array<{ value: string; label: string; buildingId?: string }>>([]);
  const [floorOptions, setFloorOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [allFloors, setAllFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [defaultBuildingId, setDefaultBuildingId] = useState<string | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);

  useEffect(() => {
    document.title = 'Units - Smart Society';
    // Fetch building first, then blocks and floors (so blocks can use building ID)
    const initializeData = async () => {
      await fetchDefaultBuilding();
      await fetchAllFloors();
      // Blocks will be fetched after building ID is set via the useEffect below
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch blocks when building ID is available to include building ID in block options
  useEffect(() => {
    if (defaultBuildingId) {
      fetchBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultBuildingId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm === '') {
        fetchUnits();
        return;
      }
      fetchUnits();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedFilters]);

  const fetchDefaultBuilding = async () => {
    try {
      setLoadingBuilding(true);
      const societyId = getSocietyId();
      if (!societyId) {
        showMessage('Society ID not found. Please select a society first.', 'error');
        return;
      }

      const buildingResponse = await getBuildingApi(societyId);
      
      // Normalize building response to handle both 'item' (singular) and 'items' (plural) formats
      const buildings = normalizeBuildingResponse(buildingResponse);

      // Get the first active building (or first building if no status filter)
      const activeBuilding = buildings.find((b: any) => b.status === 'active') || buildings[0];
      
      if (activeBuilding) {
        const buildingId = activeBuilding._id || activeBuilding.id;
        setDefaultBuildingId(buildingId);
      } else {
        showMessage('No building found for this society. Please create a building first.', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching building:', error);
      showMessage('Failed to fetch building. Please ensure a building exists for this society.', 'error');
    } finally {
      setLoadingBuilding(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksBySocietyApi({ limit: 500, status: 'active' });
      const blocks = (response.items || []).map((block: Block) => {
        // Extract building ID from block
        let buildingId: string | undefined;
        if (block.building) {
          if (typeof block.building === 'string') {
            buildingId = block.building;
          } else if (typeof block.building === 'object' && block.building !== null) {
            buildingId = (block.building as any)?._id || (block.building as any)?.id;
          }
        }
        return {
          value: block._id,
          label: block.name || 'Unnamed Block',
          buildingId: buildingId || defaultBuildingId || undefined,
        };
      });
      setBlockOptions(blocks);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
      setBlockOptions([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchAllFloors = async () => {
    try {
      setLoadingFloors(true);
      // Fetch all floors using main listing API
      const response = await getFloorsApi({ 
        page: 1,
        limit: 500,
        status: 'active' 
      });
      
      setAllFloors(response?.items || []);
    } catch (error: any) {
      console.error('Error fetching all floors:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch floors';
      showMessage(errorMessage, 'error');
      setAllFloors([]);
    } finally {
      setLoadingFloors(false);
    }
  };

  const filterFloorsByBlock = (blockId: string) => {
    if (!blockId) {
      setFloorOptions([]);
      return;
    }
    
    // Filter floors by selected block ID
    const filteredFloors = allFloors.filter((floor: Floor) => {
      if (floor.block) {
        if (typeof floor.block === 'string') {
          return floor.block === blockId;
        } else if (typeof floor.block === 'object' && floor.block !== null) {
          return (floor.block as any)?._id === blockId;
        }
      }
      return false;
    });
    
    // Map filtered floors to dropdown options
    const floors = filteredFloors.map((floor: Floor) => ({
      value: floor._id,
      label: floor.name || `Floor ${floor.number || ''}`,
    }));
    
    setFloorOptions(floors);
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const params: GetUnitsParams = {
        page,
        limit,
        q: searchTerm || undefined,
        block: selectedFilters.block || undefined,
        floor: selectedFilters.floor || undefined,
        status: selectedFilters.status || undefined,
      };

      const response = await getUnitsApi(params);
      setUnits(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      showMessage('Failed to fetch units', 'error');
      setUnits([]);
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
  } = useForm<UnitsFormData>({
    resolver: yupResolver(unitsSchema),
    defaultValues: {
      unitNumber: '',
      blockId: '',
      floorId: '',
      unitType: '',
      areaSqFt: undefined,
      status: 'vacant',
    },
  });

  const watchedBlockId = watch('blockId');

  useEffect(() => {
    if (watchedBlockId && watchedBlockId.trim() !== '') {
      setSelectedBlockId(watchedBlockId);
      setValue('floorId', '');
      filterFloorsByBlock(watchedBlockId);
    } else {
      setSelectedBlockId('');
      setFloorOptions([]);
      setValue('floorId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedBlockId, allFloors, setValue]);

  const onSubmit = async (data: UnitsFormData) => {
    try {
      setSubmitting(true);

      if (editingUnit) {
        // Update existing unit
        const updatePayload: UpdateUnitPayload = {
          id: editingUnit._id,
          block: data.blockId,
          floor: data.floorId,
          unitNumber: data.unitNumber,
          unitType: data.unitType || undefined,
          areaSqFt: data.areaSqFt || undefined,
          status: data.status,
        };
        await updateUnitApi(updatePayload);
        showMessage('Unit updated successfully!', 'success');
      } else {
        // Add new unit
        const addPayload: AddUnitPayload = {
          block: data.blockId,
          floor: data.floorId,
          unitNumber: data.unitNumber,
          unitType: data.unitType || undefined,
          areaSqFt: data.areaSqFt || undefined,
          status: data.status,
        };
        await addUnitApi(addPayload);
        showMessage('Unit added successfully!', 'success');
      }

      reset();
      setShowForm(false);
      setEditingUnit(null);
      setSelectedBlockId('');
      fetchUnits();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save unit';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (unit: Unit) => {
    try {
      const fullUnit = await getUnitByIdApi(unit._id);
      setEditingUnit(fullUnit);
      
      // Extract block ID
      const blockId = typeof fullUnit.block === 'string' 
        ? fullUnit.block 
        : (fullUnit.block as any)?._id || '';
      
      // Extract floor ID
      const floorId = typeof fullUnit.floor === 'string' 
        ? fullUnit.floor 
        : (fullUnit.floor as any)?._id || '';
      
      // Set other fields first (don't depend on block/floor)
      setValue('unitNumber', fullUnit.unitNumber);
      setValue('unitType', fullUnit.unitType || '');
      setValue('areaSqFt', fullUnit.areaSqFt || undefined);
      setValue('status', fullUnit.status || 'vacant');
      
      // Set block ID - this will trigger the useEffect to filter floors
      if (blockId) {
        setValue('blockId', blockId);
        // Filter floors for this block
        filterFloorsByBlock(blockId);
        // Set floor ID after floors are filtered
        setTimeout(() => {
          if (floorId) {
            setValue('floorId', floorId, { shouldValidate: true });
          }
        }, 100);
      } else {
        setValue('blockId', '');
        setValue('floorId', floorId || '');
      }
      
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching unit details:', error);
      showMessage('Failed to fetch unit details', 'error');
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (window.confirm(`Are you sure you want to delete Unit ${unit.unitNumber}?`)) {
      try {
        await deleteUnitApi({ id: unit._id });
        showMessage('Unit deleted successfully!', 'success');
        fetchUnits();
      } catch (error: any) {
        console.error('Error deleting unit:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete unit';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (unit: Unit) => {
    const blockName = typeof unit.block === 'object' && unit.block?.name ? unit.block.name : 'N/A';
    const floorName = typeof unit.floor === 'object' && unit.floor?.name ? unit.floor.name : 'N/A';
    const statusDisplay = unit.status?.charAt(0).toUpperCase() + unit.status?.slice(1) || 'N/A';
    
    alert(
      `Unit Details:\n\nUnit Number: ${unit.unitNumber}\nBlock: ${blockName}\nFloor: ${floorName}\nType: ${unit.unitType || 'N/A'}\nArea: ${unit.areaSqFt || 'N/A'} sq. ft.\nStatus: ${statusDisplay}`
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vacant':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'occupied':
        return <IconX className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <IconX className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <IconAlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusDisplay = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Vacant';
    const statusClasses: Record<string, string> = {
      vacant: 'bg-green-100 text-green-800',
      occupied: 'bg-blue-100 text-blue-800',
      blocked: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(status || 'vacant')}
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            statusClasses[status || 'vacant'] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusDisplay}
        </span>
      </div>
    );
  };

  const columns: Column<Unit>[] = [
    {
      key: 'number',
      header: '#',
      sortable: false,
      render: (unit: Unit, index?: number) => (
        <div className="text-sm text-gray-600 font-medium">
          {index !== undefined ? (page - 1) * limit + index + 1 : '-'}
        </div>
      ),
    },
    {
      key: 'unitNumber',
      header: 'Unit No.',
      sortable: true,
      render: (unit: Unit) => <div className="font-medium text-primary-black">{unit.unitNumber}</div>,
    },
    {
      key: 'block',
      header: 'Block',
      sortable: false,
      render: (unit: Unit) => (
        <div className="text-sm text-primary-black">
          {typeof unit.block === 'object' && unit.block?.name ? unit.block.name : '-'}
        </div>
      ),
    },
    {
      key: 'floor',
      header: 'Floor',
      sortable: false,
      render: (unit: Unit) => (
        <div className="text-sm text-primary-black">
          {typeof unit.floor === 'object' && unit.floor?.name ? unit.floor.name : '-'}
        </div>
      ),
    },
    {
      key: 'unitType',
      header: 'Type',
      sortable: true,
      render: (unit: Unit) => (
        <div className="text-sm text-primary-black">{unit.unitType || '-'}</div>
      ),
    },
    {
      key: 'areaSqFt',
      header: 'Area',
      sortable: true,
      render: (unit: Unit) => (
        <div className="text-sm text-primary-black">{unit.areaSqFt ? `${unit.areaSqFt} sq. ft.` : '-'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (unit: Unit) => getStatusBadge(unit.status || 'vacant'),
    },
  ];

  const actions: ActionButton<Unit>[] = [
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

  // No client-side filtering needed as API handles it
  const filteredUnits = units;

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Get unique blocks and statuses for filters
  const uniqueBlocks = Array.from(
    new Set(
      units
        .map((u) => (typeof u.block === 'object' && u.block?.name ? u.block.name : null))
        .filter((b): b is string => b !== null)
    )
  ).sort();

  const uniqueStatuses = Array.from(new Set(units.map((u) => u.status).filter((s): s is string => !!s))).sort();

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Units</h1>
          <button
            onClick={() => {
              reset();
              setEditingUnit(null);
              setSelectedBlockId('');
              setFloorOptions([]);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Unit
          </button>
        </div>

        {/* Data Table */}
        {!showForm && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search units by number..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
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
                <div className="flex gap-4">
                  <div className="sm:w-48">
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
              data={filteredUnits}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No units found"
              cellPadding="large"
              loading={loading}
            />

            {/* Pagination */}
            {total > limit && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
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

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUnit(null);
                  setSelectedBlockId('');
                  setFloorOptions([]);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Unit Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Unit Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit Number */}
                <div>
                  <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unitNumber"
                    {...register('unitNumber')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter unit number (e.g., 101, 202)"
                  />
                  {errors.unitNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.unitNumber.message as string}</p>
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

                {/* Floor */}
                <div>
                  <label htmlFor="floorId" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="floorId"
                    name="floorId"
                    value={watch('floorId') || ''}
                    onChange={(value) => setValue('floorId', value, { shouldValidate: true })}
                    options={[
                      { value: '', label: selectedBlockId ? (loadingFloors ? 'Loading floors...' : floorOptions.length === 0 ? 'No floors available' : 'Select Floor') : 'Select Block First' },
                      ...floorOptions,
                    ]}
                    placeholder={
                      !selectedBlockId 
                        ? 'Select Block First' 
                        : loadingFloors 
                          ? 'Loading floors...' 
                          : floorOptions.length === 0 
                            ? 'No floors available' 
                            : 'Select floor'
                    }
                    error={errors.floorId?.message as string}
                    disabled={!selectedBlockId || loadingFloors}
                    required
                  />
                  {selectedBlockId && !loadingFloors && floorOptions.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No floors found for this block. Please create floors first.
                    </p>
                  )}
                </div>

                {/* Unit Type */}
                <div>
                  <label htmlFor="unitType" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Type
                  </label>
                  <CustomSelect
                    id="unitType"
                    name="unitType"
                    value={watch('unitType') || ''}
                    onChange={(value) => setValue('unitType', value, { shouldValidate: true })}
                    options={[{ value: '', label: 'Select Unit Type' }, ...unitTypeOptions]}
                    placeholder="Select unit type"
                    error={errors.unitType?.message as string}
                    disabled={false}
                  />
                </div>

                {/* Area */}
                <div>
                  <label htmlFor="areaSqFt" className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq. ft.)
                  </label>
                  <input
                    type="number"
                    id="areaSqFt"
                    {...register('areaSqFt', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter area in square feet"
                  />
                  {errors.areaSqFt && (
                    <p className="mt-1 text-sm text-red-500">{errors.areaSqFt.message as string}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="status"
                    name="status"
                    value={watch('status') || 'vacant'}
                    onChange={(value) => setValue('status', value as any, { shouldValidate: true })}
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
                    unitNumber: '',
                    blockId: '',
                    floorId: '',
                    unitType: '',
                    areaSqFt: undefined,
                    status: 'vacant',
                  });
                  setShowForm(false);
                  setEditingUnit(null);
                  setSelectedBlockId('');
                  setFloorOptions([]);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingUnit ? 'Update Unit' : 'Save Unit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UnitsPage;
