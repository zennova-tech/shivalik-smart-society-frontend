import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { noticeBoardSchema } from '../../utils/validationSchemas/noticeBoardSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconClock, IconArchive } from '@tabler/icons-react';
import {
  getNoticesBySocietyApi,
  getNoticeByIdApi,
  addNoticeApi,
  updateNoticeApi,
  deleteNoticeApi,
  Notice,
  GetNoticeParams,
  AddNoticePayload,
  UpdateNoticePayload,
} from '../../apis/notice';
import { getBlocksBySocietyApi } from '../../apis/block';
import { getUnitsApi } from '../../apis/unit';
import { getBuildingApi } from '../../apis/building';
import { getSocietyId } from '../../utils/societyUtils';
import { showMessage } from '../../utils/Constant';

type NoticeBoardFormData = Yup.InferType<typeof noticeBoardSchema>;

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'expired', label: 'Expired' },
  { value: 'archived', label: 'Archived' },
];

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Block and Unit options will be fetched from API

export const NoticeBoardPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('');
  const [dateFilterTo, setDateFilterTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [blockOptions, setBlockOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [unitOptions, setUnitOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    document.title = 'Notice Board - Smart Society';
    fetchBlocks();
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      fetchNotices();
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchNotices();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, dateFilterFrom, dateFilterTo]);

  const fetchBlocks = async () => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksBySocietyApi({ limit: 500 });
      const blocks = response.items || [];
      setBlockOptions(
        blocks.map((block) => ({
          value: block._id,
          label: block.name,
        }))
      );
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchUnits = async (blockId?: string) => {
    try {
      setLoadingUnits(true);
      const params: any = { limit: 500 };
      if (blockId) {
        params.block = blockId;
      }
      const response = await getUnitsApi(params);
      const units = response.items || [];
      setUnitOptions(
        units.map((unit) => ({
          value: unit._id,
          label: unit.unitNumber,
        }))
      );
    } catch (error: any) {
      console.error('Error fetching units:', error);
      showMessage('Failed to fetch units', 'error');
    } finally {
      setLoadingUnits(false);
    }
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params: GetNoticeParams = {
        q: searchTerm || undefined,
        status: selectedFilters.status || undefined,
        block: selectedFilters.blockName || undefined,
        priority: selectedFilters.priority || undefined,
        limit: 500,
      };

      const response = await getNoticesBySocietyApi(params);
      let filteredNotices = response.items || [];

      // Apply date filters client-side
      if (dateFilterFrom || dateFilterTo) {
        filteredNotices = filteredNotices.filter((notice) => {
          const noticeDate = new Date(notice.publishDate);
          if (dateFilterFrom && dateFilterTo) {
            const fromDate = new Date(dateFilterFrom);
            const toDate = new Date(dateFilterTo);
            return noticeDate >= fromDate && noticeDate <= toDate;
          } else if (dateFilterFrom) {
            const fromDate = new Date(dateFilterFrom);
            return noticeDate >= fromDate;
          } else if (dateFilterTo) {
            const toDate = new Date(dateFilterTo);
            return noticeDate <= toDate;
          }
          return true;
        });
      }

      // Apply category filter client-side
      if (selectedFilters.category) {
        filteredNotices = filteredNotices.filter((notice) => notice.category === selectedFilters.category);
      }

      setNotices(filteredNotices);
    } catch (error: any) {
      console.error('Error fetching notices:', error);
      showMessage('Failed to fetch notices', 'error');
      setNotices([]);
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
  } = useForm<NoticeBoardFormData>({
    resolver: yupResolver(noticeBoardSchema),
    defaultValues: {
      noticeNumber: '',
      title: '',
      category: '',
      blockId: '',
      unitId: '',
      priority: '',
      publishDate: '',
      expiryDate: '',
      status: '',
    },
  });

  // Watch blockId to fetch units when block changes
  const watchedBlockId = watch('blockId');
  useEffect(() => {
    if (watchedBlockId) {
      // Reset unit selection when block changes
      setValue('unitId', '', { shouldValidate: false });
      // Fetch units for the selected block
      fetchUnits(watchedBlockId);
    } else {
      // Reset unit selection and fetch all units if no block selected
      setValue('unitId', '', { shouldValidate: false });
      setUnitOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedBlockId, setValue]);

  const onSubmit = async (data: NoticeBoardFormData) => {
    try {
      setSubmitting(true);

      // Convert dates to ISO format or timestamps
      const publishDate = data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString();
      const expiryDate = data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined;

      if (editingNotice) {
        const updatePayload: UpdateNoticePayload = {
          id: editingNotice._id,
          title: data.title,
          description: data.title, // Using title as description if description field doesn't exist in form
          category: data.category.toLowerCase(),
          priority: data.priority.toLowerCase(),
          block: data.blockId || undefined,
          unit: data.unitId || undefined,
          publishDate: publishDate,
          expiryDate: expiryDate,
          status: data.status.toLowerCase(),
        };
        
        await updateNoticeApi(updatePayload);
        showMessage('Notice updated successfully!', 'success');
      } else {
        const addPayload: AddNoticePayload = {
          title: data.title,
          description: data.title, // Using title as description if description field doesn't exist in form
          category: data.category.toLowerCase(),
          priority: data.priority.toLowerCase(),
          block: data.blockId || undefined,
          unit: data.unitId || undefined,
          publishDate: publishDate,
          expiryDate: expiryDate,
          status: data.status.toLowerCase(),
        };
        
        await addNoticeApi(addPayload);
        showMessage('Notice added successfully!', 'success');
      }
      
      reset({
        noticeNumber: '',
        title: '',
        category: '',
        blockId: '',
        unitId: '',
        priority: '',
        publishDate: '',
        expiryDate: '',
        status: '',
      });
      setShowForm(false);
      setEditingNotice(null);
      fetchNotices();
    } catch (error: any) {
      console.error('Error saving notice:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save notice';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (notice: Notice) => {
    try {
      const fullNotice = await getNoticeByIdApi(notice._id);
      setEditingNotice(fullNotice);
      
      // Extract block ID
      let blockId = '';
      if (typeof fullNotice.block === 'string') {
        blockId = fullNotice.block;
      } else if (fullNotice.block && typeof fullNotice.block === 'object') {
        blockId = (fullNotice.block as any)?._id || '';
      }

      // Extract unit ID
      let unitId = '';
      if (typeof fullNotice.unit === 'string') {
        unitId = fullNotice.unit;
      } else if (fullNotice.unit && typeof fullNotice.unit === 'object') {
        unitId = (fullNotice.unit as any)?._id || '';
      }

      // Format dates for input fields
      const publishDate = fullNotice.publishDate ? new Date(fullNotice.publishDate).toISOString().split('T')[0] : '';
      const expiryDate = fullNotice.expiryDate ? new Date(fullNotice.expiryDate).toISOString().split('T')[0] : '';

      setValue('noticeNumber', ''); // Notice number is not in backend
      setValue('title', fullNotice.title);
      setValue('category', fullNotice.category || '');
      setValue('priority', fullNotice.priority || '');
      setValue('publishDate', publishDate);
      setValue('expiryDate', expiryDate);
      setValue('status', fullNotice.status || '');
      
      // Set block ID first, then fetch units, then set unit ID
      if (blockId) {
        setValue('blockId', blockId);
        // Fetch units for the selected block
        try {
          await fetchUnits(blockId);
          // Wait a bit for state to update, then set unit ID
          setTimeout(() => {
            if (unitId) {
              setValue('unitId', unitId, { shouldValidate: true });
            }
          }, 300);
        } catch (err) {
          console.error('Error fetching units:', err);
          // Still set unit ID even if fetch fails (might be a display issue)
          if (unitId) {
            setValue('unitId', unitId);
          }
        }
      } else {
        setValue('blockId', '');
        setValue('unitId', unitId || '');
      }
      
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching notice details:', error);
      showMessage('Failed to fetch notice details', 'error');
    }
  };

  const handleDelete = async (notice: Notice) => {
    if (window.confirm(`Are you sure you want to delete notice "${notice.title}"?`)) {
      try {
        await deleteNoticeApi({ id: notice._id });
        showMessage('Notice deleted successfully!', 'success');
        fetchNotices();
      } catch (error: any) {
        console.error('Error deleting notice:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notice';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (notice: Notice) => {
    const blockName = typeof notice.block === 'object' && notice.block ? (notice.block as any).name : 'N/A';
    const unitNumber = typeof notice.unit === 'object' && notice.unit ? (notice.unit as any).unitNumber : 'N/A';
    const publishDate = notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : 'N/A';
    const expiryDate = notice.expiryDate ? new Date(notice.expiryDate).toLocaleDateString() : 'N/A';
    
    alert(
      `Notice Details:\nTitle: ${notice.title}\nDescription: ${notice.description || 'N/A'}\nCategory: ${notice.category}\nBlock: ${blockName}\nUnit: ${unitNumber}\nPriority: ${notice.priority}\nPublish Date: ${publishDate}\nExpiry Date: ${expiryDate}\nStatus: ${notice.status}`
    );
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'published':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <IconClock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <IconX className="w-4 h-4 text-red-600" />;
      case 'archived':
        return <IconArchive className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'published':
        return 'Published';
      case 'draft':
        return 'Draft';
      case 'expired':
        return 'Expired';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityDisplay = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return priority;
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
      case 'general':
        return 'General';
      case 'maintenance':
        return 'Maintenance';
      case 'security':
        return 'Security';
      case 'event':
        return 'Event';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  const columns: Column<Notice>[] = [
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (notice) => getCategoryDisplay(notice.category),
    },
    {
      key: 'block',
      header: 'Block',
      sortable: false,
      render: (notice) => {
        if (typeof notice.block === 'object' && notice.block) {
          return (notice.block as any).name || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      key: 'unit',
      header: 'Unit',
      sortable: false,
      render: (notice) => {
        if (typeof notice.unit === 'object' && notice.unit) {
          return (notice.unit as any).unitNumber || 'N/A';
        }
        return 'N/A';
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (notice) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(notice.priority)}`}>
          {getPriorityDisplay(notice.priority)}
        </span>
      ),
    },
    {
      key: 'publishDate',
      header: 'Publish Date',
      sortable: true,
      render: (notice) => notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : 'N/A',
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      sortable: true,
      render: (notice) => notice.expiryDate ? new Date(notice.expiryDate).toLocaleDateString() : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (notice) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(notice.status)}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(notice.status)}`}>
            {getStatusDisplay(notice.status)}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<Notice>[] = [
    { label: 'View', icon: <IconEye className="w-4 h-4" />, onClick: handleView, variant: 'primary' },
    { label: 'Edit', icon: <IconEdit className="w-4 h-4" />, onClick: handleEdit, variant: 'primary' },
    { label: 'Delete', icon: <IconTrash className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' },
  ];

  // Filtering is mostly done server-side, but we apply additional filters client-side
  const filteredNotices = notices;

  const handleClearDateFilter = () => {
    setDateFilterFrom('');
    setDateFilterTo('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Notice Board</h1>
          <button
            onClick={() => {
              reset();
              setEditingNotice(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Notice
          </button>
        </div>

        {/* Data Table */}
        {!showForm && (
          <div>
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* Search bar and Date filters row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search notices by number, title, category, or status..."
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

                {/* Date Filters */}
                <div className="flex gap-4">
                  <div className="sm:w-40">
                    <input
                      type="date"
                      id="dateFilterFrom"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      placeholder="From Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                    />
                  </div>
                  <div className="sm:w-40">
                    <input
                      type="date"
                      id="dateFilterTo"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      placeholder="To Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                      min={dateFilterFrom || undefined}
                    />
                  </div>
                  {(dateFilterFrom || dateFilterTo) && (
                    <button
                      type="button"
                      onClick={handleClearDateFilter}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 whitespace-nowrap"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <CustomSelect
                    id="filter-category"
                    name="filter-category"
                    value={selectedFilters.category || ''}
                    onChange={(value) => handleFilterChange('category', value)}
                    options={[
                      { value: '', label: 'All Category' },
                      ...categoryOptions,
                    ]}
                    placeholder="All Category"
                    disabled={false}
                  />
                </div>
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
                    disabled={false}
                  />
                </div>
                <div className="flex-1">
                  <CustomSelect
                    id="filter-priority"
                    name="filter-priority"
                    value={selectedFilters.priority || ''}
                    onChange={(value) => handleFilterChange('priority', value)}
                    options={[
                      { value: '', label: 'All Priority' },
                      ...priorityOptions,
                    ]}
                    placeholder="All Priority"
                    disabled={false}
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

            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Loading notices...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={filteredNotices}
                columns={columns}
                actions={actions}
                searchable={false}
                filterable={false}
                emptyMessage="No notices found"
              />
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingNotice ? 'Edit Notice' : 'Add New Notice'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNotice(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Notice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter notice title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="category"
                    name="category"
                    value={watch('category') || ''}
                    onChange={(value) => setValue('category', value, { shouldValidate: true })}
                    options={categoryOptions}
                    placeholder="Select category"
                    error={errors.category?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="blockId" className="block text-sm font-medium text-gray-700 mb-1">
                    Block <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="blockId"
                    name="blockId"
                    value={watch('blockId') || ''}
                    onChange={(value) => {
                      setValue('blockId', value, { shouldValidate: true });
                      // Unit will be reset automatically by the useEffect watching blockId
                    }}
                    options={blockOptions}
                    placeholder={loadingBlocks ? 'Loading blocks...' : 'Select block'}
                    error={errors.blockId?.message as string}
                    disabled={loadingBlocks}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="unitId"
                    name="unitId"
                    value={watch('unitId') || ''}
                    onChange={(value) => setValue('unitId', value, { shouldValidate: true })}
                    options={unitOptions}
                    placeholder={
                      !watch('blockId') 
                        ? 'Select block first' 
                        : loadingUnits 
                          ? 'Loading units...' 
                          : unitOptions.length === 0 
                            ? 'No units available' 
                            : 'Select unit'
                    }
                    error={errors.unitId?.message as string}
                    disabled={loadingUnits || !watch('blockId')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="priority"
                    name="priority"
                    value={watch('priority') || ''}
                    onChange={(value) => setValue('priority', value, { shouldValidate: true })}
                    options={priorityOptions}
                    placeholder="Select priority"
                    error={errors.priority?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="publishDate"
                    {...register('publishDate')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent text-sm text-primary-black [color-scheme:light]"
                  />
                  {errors.publishDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.publishDate.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    {...register('expiryDate')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent text-sm text-primary-black [color-scheme:light]"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiryDate.message as string}</p>
                  )}
                </div>
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

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    noticeNumber: '',
                    title: '',
                    category: '',
                    blockId: '',
                    unitId: '',
                    priority: '',
                    publishDate: '',
                    expiryDate: '',
                    status: '',
                  });
                  setShowForm(false);
                  setEditingNotice(null);
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
                {submitting ? 'Saving...' : editingNotice ? 'Update Notice' : 'Save Notice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

