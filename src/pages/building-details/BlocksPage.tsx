import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { blocksSchema } from '../../utils/validationSchemas/blocksSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX } from '@tabler/icons-react';
import {
  getBlocksApi,
  getBlockByIdApi,
  addBlockApi,
  updateBlockApi,
  deleteBlockApi,
  Block,
  GetBlocksParams,
  AddBlockPayload,
  UpdateBlockPayload,
} from '../../apis/block';
import { showMessage } from '../../utils/Constant';

type BlocksFormData = Yup.InferType<typeof blocksSchema>;

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const BlocksPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Blocks - Smart Society';
    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      fetchBlocks();
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchBlocks();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedFilters]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const params: GetBlocksParams = {
        page,
        limit,
        q: searchTerm || undefined,
        status: selectedFilters.status || undefined,
      };

      const response = await getBlocksApi(params);
      setBlocks(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
      setBlocks([]);
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
  } = useForm<BlocksFormData>({
    resolver: yupResolver(blocksSchema),
    defaultValues: {
      blockName: '',
      status: 'active',
      building: '',
      description: '',
    },
  });

  const onSubmit = async (data: BlocksFormData) => {
    try {
      setSubmitting(true);
      
      if (editingBlock) {
        // Update existing block
        const updatePayload: UpdateBlockPayload = {
          id: editingBlock._id,
          name: data.blockName,
          status: data.status,
          building: data.building || undefined,
        };
        await updateBlockApi(updatePayload);
        showMessage('Block updated successfully!', 'success');
      } else {
        // Add new block
        const addPayload: AddBlockPayload = {
          name: data.blockName,
          status: data.status,
          building: data.building || undefined,
        };
        await addBlockApi(addPayload);
        showMessage('Block added successfully!', 'success');
      }
      
      reset();
      setShowForm(false);
      setEditingBlock(null);
      fetchBlocks();
    } catch (error: any) {
      console.error('Error saving block:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save block';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (block: Block) => {
    try {
      const fullBlock = await getBlockByIdApi(block._id);
      setEditingBlock(fullBlock);
      setValue('blockName', fullBlock.name);
      setValue('status', fullBlock.status || 'active');
      setValue('building', typeof fullBlock.building === 'string' ? fullBlock.building : '');
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching block details:', error);
      showMessage('Failed to fetch block details', 'error');
    }
  };

  const handleDelete = async (block: Block) => {
    if (window.confirm(`Are you sure you want to delete ${block.name}?`)) {
      try {
        await deleteBlockApi({ id: block._id });
        showMessage('Block deleted successfully!', 'success');
        fetchBlocks();
      } catch (error: any) {
        console.error('Error deleting block:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete block';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (block: Block) => {
    const statusDisplay = block.status === 'active' ? 'Active' : 'Inactive';
    alert(
      `Block Details:\n\nName: ${block.name}\nStatus: ${statusDisplay}`
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

  const getStatusBadge = (status: string) => {
    const statusDisplay = status === 'active' ? 'Active' : 'Inactive';
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(status)}
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusDisplay}
        </span>
      </div>
    );
  };

  const columns: Column<Block>[] = [
    {
      key: 'number',
      header: '#',
      sortable: false,
      render: (block: Block, index?: number) => (
        <div className="text-sm text-gray-600 font-medium">
          {index !== undefined ? (page - 1) * limit + index + 1 : '-'}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Block Name',
      sortable: true,
      render: (block: Block) => <div className="font-medium text-primary-black">{block.name}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (block: Block) => getStatusBadge(block.status || 'active'),
    },
  ];

  const actions: ActionButton<Block>[] = [
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
  const filteredBlocks = blocks;

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

  // Debounce search - handled in main useEffect

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Blocks</h1>
          <button
            onClick={() => {
              reset();
              setEditingBlock(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Block
          </button>
        </div>

        {/* Data Table */}
        {!showForm && (
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
                      placeholder="Search blocks by name..."
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
              data={filteredBlocks}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No blocks found"
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
                {editingBlock ? 'Edit Block' : 'Add New Block'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBlock(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Block Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Block Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block Name */}
                <div>
                  <label htmlFor="blockName" className="block text-sm font-medium text-gray-700 mb-1">
                    Block Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="blockName"
                    {...register('blockName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter block name (e.g., Block A, Block B)"
                  />
                  {errors.blockName && (
                    <p className="mt-1 text-sm text-red-500">{errors.blockName.message as string}</p>
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
                    value={watch('status') || ''}
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
                    blockName: '',
                    status: 'active',
                    building: '',
                    description: '',
                  });
                  setShowForm(false);
                  setEditingBlock(null);
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
                {submitting ? 'Saving...' : editingBlock ? 'Update Block' : 'Save Block'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlocksPage;

