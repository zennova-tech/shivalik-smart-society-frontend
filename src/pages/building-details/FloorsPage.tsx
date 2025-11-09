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
  batchCreateFloorsApi,
  Floor,
  GetFloorsParams,
  AddFloorPayload,
  UpdateFloorPayload,
} from '../../apis/floor';
import { getBlocksApi, Block } from '../../apis/block';
import { getUnitsApi } from '../../apis/unit';
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
  const [showAddMultipleForm, setShowAddMultipleForm] = useState(false);
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
    fetchBlocks();
    fetchFloors();
    fetchUnitsCount();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchFloors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedFilters]);

  const fetchBlocks = async () => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksApi({ limit: 100, status: 'active' });
      const blocks = (response.items || []).map((block: Block) => ({
        value: block._id,
        label: block.name || 'Unnamed Block',
      }));
      setBlockOptions(blocks);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
      setBlockOptions([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchUnitsCount = async () => {
    try {
      // Fetch all units to count them per floor
      const response = await getUnitsApi({ limit: 10000 });
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
      console.error('Error fetching units count:', error);
      // Don't show error to user, just continue without unit counts
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

      const response = await getFloorsApi(params);
      const floorsWithUnits: FloorWithUnits[] = (response.items || []).map((floor: Floor) => {
        const blockName = typeof floor.block === 'object' && floor.block ? floor.block.name : '';
        const totalUnits = unitsCountMap[floor._id] || 0;
        return {
          ...floor,
          blockName,
          totalUnits,
        };
      });
      
      setFloors(floorsWithUnits);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching floors:', error);
      showMessage('Failed to fetch floors', 'error');
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

  const onSubmit = async (data: FloorsFormData) => {
    try {
      setSubmitting(true);
      
      if (editingFloor) {
        // Update existing floor
        const updatePayload: UpdateFloorPayload = {
          id: editingFloor._id,
          name: data.floorName,
          number: data.floorNumber,
          block: data.blockId,
          status: data.status,
        };
        await updateFloorApi(updatePayload);
        showMessage('Floor updated successfully!', 'success');
      } else {
        // Add new floor
        const addPayload: AddFloorPayload = {
          name: data.floorName,
          number: data.floorNumber,
          block: data.blockId,
          status: data.status || 'active',
        };
        await addFloorApi(addPayload);
        showMessage('Floor added successfully!', 'success');
      }
      
      reset();
      setShowForm(false);
      setShowAddMultipleForm(false);
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

  const onSubmitBatch = async (data: FloorsFormData) => {
    try {
      setSubmitting(true);
      
      // For batch create, we need additional fields: prefix, startNumber, endNumber
      // This is a simplified version - you might want to add a separate form for batch create
      const prefix = data.floorName || 'Floor';
      const startNumber = data.floorNumber;
      const endNumber = data.floorNumber; // For single floor, start and end are the same
      
      // For now, we'll create a single floor even in batch mode
      // You can enhance this later with a proper batch form
      const addPayload: AddFloorPayload = {
        name: data.floorName,
        number: data.floorNumber,
        block: data.blockId,
        status: data.status || 'active',
      };
      await addFloorApi(addPayload);
      showMessage('Floor added successfully!', 'success');
      
      reset();
      setShowForm(false);
      setShowAddMultipleForm(false);
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
      const fullFloor = await getFloorByIdApi(floor._id);
      setEditingFloor(fullFloor);
      setValue('floorNumber', fullFloor.number);
      setValue('floorName', fullFloor.name);
      setValue('blockId', typeof fullFloor.block === 'string' ? fullFloor.block : fullFloor.block?._id || '');
      setValue('status', fullFloor.status || 'active');
      setShowForm(true);
      setShowAddMultipleForm(false);
    } catch (error: any) {
      console.error('Error fetching floor details:', error);
      showMessage('Failed to fetch floor details', 'error');
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
    alert(
      `Floor Details:\n\nName: ${floor.name}\nFloor Number: ${floor.number}\nBlock: ${floor.blockName}\nStatus: ${statusDisplay}\nTotal Units: ${floor.totalUnits}`
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
    { key: 'totalUnits', header: 'Total Units', sortable: true },
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

  // Filter floors by search term and filters (client-side filtering is already handled by API)
  const filteredFloors = floors;

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value || undefined,
      };
      // Remove undefined values
      Object.keys(newFilters).forEach((k) => {
        if (newFilters[k] === undefined || newFilters[k] === '') {
          delete newFilters[k];
        }
      });
      return newFilters;
    });
    setPage(1); // Reset to first page when filter changes
  };

  if (loading && floors.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading floors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto ">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Floors</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(true);
                setShowAddMultipleForm(false);
                setEditingFloor(null);
                reset({
                  floorNumber: 0,
                  floorName: '',
                  blockId: '',
                  status: 'active',
                });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Add Floor
            </button>
            <button
              onClick={() => {
                setShowAddMultipleForm(true);
                setShowForm(false);
                setEditingFloor(null);
                reset({
                  floorNumber: 0,
                  floorName: '',
                  blockId: '',
                  status: 'active',
                });
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Add Multiple Floors
            </button>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && !showAddMultipleForm && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search bar and Filters row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
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

            {/* Pagination */}
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

        {/* Add/Edit Form */}
        {(showForm || showAddMultipleForm) && (
          <form
            onSubmit={handleSubmit(showAddMultipleForm ? onSubmitBatch : onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingFloor ? 'Edit Floor' : showAddMultipleForm ? 'Add Multiple Floors' : 'Add New Floor'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setShowAddMultipleForm(false);
                  setEditingFloor(null);
                  reset();
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
                    options={blockOptions}
                    placeholder="Select block"
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
                  setShowAddMultipleForm(false);
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
      </div>
    </div>
  );
};

export default FloorsPage;
