import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { committeeMemberSchema, CommitteeMemberFormData } from '@/utils/validationSchemas/committeeMemberSchema';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '@/components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconUserPlus } from '@tabler/icons-react';
import {
  CommitteeMember,
  GetCommitteeMembersParams,
  AddCommitteeMemberPayload,
  UpdateCommitteeMemberPayload,
} from '@/types/CommitteeMemberTypes';
import {
  getCommitteeMembersApi,
  addCommitteeMemberApi,
  updateCommitteeMemberApi,
  deleteCommitteeMemberApi,
  getCommitteeMemberByIdApi,
} from '@/apis/committeeMember';
import { getBlocksBySocietyApi, Block } from '@/apis/block';
import { getBuildingApi, normalizeBuildingResponse } from '@/apis/building';
import { getSocietyId } from '@/utils/societyUtils';
import { showMessage } from '@/utils/Constant';

const memberTypeOptions = [
  { value: 'chairman', label: 'Chairman' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'member', label: 'Member' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'archived', label: 'Archived' },
];

export const CommitteeMembersPage = () => {
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [defaultBuildingId, setDefaultBuildingId] = useState<string | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  useEffect(() => {
    document.title = 'Committee Members - Smart Society';
    fetchDefaultBuilding();
    fetchBlocks();
    fetchCommitteeMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCommitteeMembers();
    }, searchTerm ? 500 : 0); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchCommitteeMembers();
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
      setBlocks(response.items || []);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchCommitteeMembers = async () => {
    try {
      setLoading(true);
      const params: GetCommitteeMembersParams = {
        page,
        limit,
        q: searchTerm || undefined,
        status: selectedFilters.status || undefined,
        memberType: selectedFilters.memberType || undefined,
      };

      const response = await getCommitteeMembersApi(params);
      setCommitteeMembers(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching committee members:', error);
      showMessage('Failed to fetch committee members', 'error');
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
  } = useForm<CommitteeMemberFormData>({
    resolver: yupResolver(committeeMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      countryCode: '+91',
      mobileNumber: '',
      email: '',
      memberType: 'member',
      block: '',
      society: '',
      status: 'active',
    },
  });

  const onSubmit = async (data: CommitteeMemberFormData) => {
    try {
      if (!defaultBuildingId) {
        showMessage('Building ID not found. Please ensure a building exists for this society.', 'error');
        return;
      }

      // Clean up empty strings for optional fields
      const cleanData = {
        ...data,
        lastName: data.lastName || undefined,
        block: data.block || undefined,
        building: defaultBuildingId, // Always use default building ID
        society: data.society || undefined,
      };

      if (editingMember) {
        const updatePayload: UpdateCommitteeMemberPayload = {
          id: editingMember._id,
          ...cleanData,
          building: defaultBuildingId, // Ensure building ID is included
        };
        await updateCommitteeMemberApi(updatePayload);
        showMessage('Committee member updated successfully!', 'success');
      } else {
        const addPayload: AddCommitteeMemberPayload = {
          firstName: data.firstName,
          lastName: data.lastName || '',
          block: data.block || undefined,
          building: defaultBuildingId, // Always include building ID
          society: data.society || undefined,
          countryCode: data.countryCode,
          mobileNumber: data.mobileNumber,
          email: data.email || '',
          memberType: data.memberType,
          status: data.status,
        };
        await addCommitteeMemberApi(addPayload);
        showMessage('Committee member added successfully!', 'success');
      }
      reset();
      setShowForm(false);
      setEditingMember(null);
      fetchCommitteeMembers();
    } catch (error: any) {
      console.error('Error saving committee member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save committee member';
      showMessage(errorMessage, 'error');
    }
  };

  const handleEdit = async (member: CommitteeMember) => {
    try {
      const fullMember = await getCommitteeMemberByIdApi(member._id);
      setEditingMember(fullMember);
      setValue('firstName', fullMember.firstName);
      setValue('lastName', fullMember.lastName || '');
      setValue('countryCode', fullMember.countryCode || '+91');
      setValue('mobileNumber', fullMember.mobileNumber);
      setValue('email', fullMember.email);
      setValue('memberType', fullMember.memberType);
      setValue('status', fullMember.status);
      setValue('block', typeof fullMember.block === 'string' ? fullMember.block : fullMember.block?._id || '');
      setValue('society', fullMember.society || '');
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching member details:', error);
      showMessage('Failed to fetch member details', 'error');
    }
  };

  const handleDelete = async (member: CommitteeMember) => {
    if (window.confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName || ''}?`)) {
      try {
        await deleteCommitteeMemberApi({ id: member._id });
        showMessage('Committee member deleted successfully!', 'success');
        fetchCommitteeMembers();
      } catch (error: any) {
        console.error('Error deleting committee member:', error);
        showMessage(error.message || 'Failed to delete committee member', 'error');
      }
    }
  };

  const handleView = (member: CommitteeMember) => {
    alert(
      `Committee Member Details:\n\nName: ${member.firstName} ${member.lastName || ''}\nEmail: ${member.email}\nMobile: ${member.countryCode} ${member.mobileNumber}\nType: ${member.memberType}\nStatus: ${member.status}`
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      resigned: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMemberTypeBadge = (type: string) => {
    const typeClasses: Record<string, string> = {
      chairman: 'bg-purple-100 text-purple-800',
      secretary: 'bg-blue-100 text-blue-800',
      treasurer: 'bg-green-100 text-green-800',
      member: 'bg-gray-100 text-gray-800',
      other: 'bg-orange-100 text-orange-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          typeClasses[type] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const columns: Column<CommitteeMember>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (member) => (
        <div>
          <div className="font-medium text-primary-black">
            {member.firstName} {member.lastName || ''}
          </div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      ),
    },
    {
      key: 'mobileNumber',
      header: 'Contact',
      sortable: true,
      render: (member) => (
        <div className="text-sm text-primary-black">
          {member.countryCode} {member.mobileNumber}
        </div>
      ),
    },
    {
      key: 'memberType',
      header: 'Member Type',
      sortable: true,
      render: (member) => getMemberTypeBadge(member.memberType),
    },
    {
      key: 'block',
      header: 'Block',
      sortable: false,
      render: (member) => (
        <div className="text-sm text-primary-black">
          {typeof member.block === 'object' && member.block?.name
            ? member.block.name
            : typeof member.block === 'string'
            ? member.block
            : '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (member) => getStatusBadge(member.status),
    },
  ];

  const actions: ActionButton<CommitteeMember>[] = [
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

  const blockOptions = blocks.map((block) => ({
    value: block._id,
    label: block.name,
  }));

  // No client-side filtering needed as API handles it
  const filteredMembers = committeeMembers;

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

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-black">Committee Members</h1>
            <p className="text-base text-primary-black/50 mt-1">
              Manage committee members and their details
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              setEditingMember(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center gap-2"
          >
            <IconUserPlus className="w-4 h-4" />
            Add Committee Member
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
                      placeholder="Search by name, email, mobile, or type..."
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
                  <div className="sm:w-48">
                    <CustomSelect
                      id="filter-memberType"
                      name="filter-memberType"
                      value={selectedFilters.memberType || ''}
                      onChange={(value) => handleFilterChange('memberType', value)}
                      options={[
                        { value: '', label: 'All Types' },
                        ...memberTypeOptions,
                      ]}
                      placeholder="All Types"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredMembers}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No committee members found"
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingMember ? 'Edit Committee Member' : 'Add New Committee Member'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMember(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register('firstName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message as string}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register('lastName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message as string}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message as string}</p>
                  )}
                </div>

                {/* Country Code and Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="countryCode"
                      {...register('countryCode')}
                      className="w-24 px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                      placeholder="+91"
                    />
                    <input
                      type="text"
                      id="mobileNumber"
                      {...register('mobileNumber')}
                      className="flex-1 px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobileNumber.message as string}</p>
                  )}
                  {errors.countryCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.countryCode.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Committee Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Committee Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Member Type */}
                <div>
                  <label htmlFor="memberType" className="block text-sm font-medium text-gray-700 mb-1">
                    Member Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="memberType"
                    name="memberType"
                    value={watch('memberType') || 'member'}
                    onChange={(value) => setValue('memberType', value as any, { shouldValidate: true })}
                    options={memberTypeOptions}
                    placeholder="Select member type"
                    error={errors.memberType?.message as string}
                    disabled={false}
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
                    onChange={(value) => setValue('status', value as any, { shouldValidate: true })}
                    options={statusOptions}
                    placeholder="Select status"
                    error={errors.status?.message as string}
                    disabled={false}
                    required
                  />
                </div>

                {/* Block */}
                <div>
                  <label htmlFor="block" className="block text-sm font-medium text-gray-700 mb-1">
                    Block
                  </label>
                  <CustomSelect
                    id="block"
                    name="block"
                    value={watch('block') || ''}
                    onChange={(value) => setValue('block', value, { shouldValidate: true })}
                    options={[{ value: '', label: 'Select Block' }, ...blockOptions]}
                    placeholder="Select block"
                    error={errors.block?.message as string}
                    disabled={loadingBlocks}
                  />
                </div>


                {/* Society */}
                <div>
                  <label htmlFor="society" className="block text-sm font-medium text-gray-700 mb-1">
                    Society
                  </label>
                  <input
                    type="text"
                    id="society"
                    {...register('society')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter society ID (optional)"
                  />
                  {errors.society && (
                    <p className="mt-1 text-sm text-red-500">{errors.society.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowForm(false);
                  setEditingMember(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingMember ? 'Update Member' : 'Save Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommitteeMembersPage;

