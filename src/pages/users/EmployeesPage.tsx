import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { employeeSchema, EmployeeFormData } from '@/utils/validationSchemas/employeeSchema';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '@/components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconUserPlus } from '@tabler/icons-react';
import {
  Employee,
  GetEmployeesParams,
  AddEmployeePayload,
  UpdateEmployeePayload,
} from '@/types/EmployeeTypes';
import {
  getEmployeesApi,
  addEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  getEmployeeByIdApi,
} from '@/apis/employee';
import { getBlocksApi, Block } from '@/apis/block';
import { showMessage } from '@/utils/Constant';

const employeeTypeOptions = [
  { value: 'security', label: 'Security' },
  { value: 'gardener', label: 'Gardener' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
];

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Employees - Smart Society';
    fetchBlocks();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm === '') {
        fetchEmployees();
        return;
      }
      fetchEmployees();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedFilters]);

  const fetchBlocks = async () => {
    try {
      setLoadingBlocks(true);
      const response = await getBlocksApi({ limit: 1000, status: 'active' });
      setBlocks(response.items || []);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params: GetEmployeesParams = {
        page,
        limit,
        q: searchTerm || undefined,
        status: selectedFilters.status || undefined,
        employeeType: selectedFilters.employeeType || undefined,
      };

      const response = await getEmployeesApi(params);
      setEmployees(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      showMessage('Failed to fetch employees', 'error');
      setEmployees([]);
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
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      countryCode: '+91',
      mobileNumber: '',
      email: '',
      employeeType: 'other',
      block: '',
      building: '',
      society: '',
      status: 'active',
      idProofUrl: '',
      policeVerificationUrl: '',
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setSubmitting(true);
      // Clean up empty strings for optional fields
      const cleanData = {
        ...data,
        lastName: data.lastName || undefined,
        block: data.block || undefined,
        building: data.building || undefined,
        society: data.society || undefined,
        idProofUrl: data.idProofUrl || undefined,
        policeVerificationUrl: data.policeVerificationUrl || undefined,
      };

      if (editingEmployee) {
        const updatePayload: UpdateEmployeePayload = {
          id: editingEmployee._id,
          ...cleanData,
        };
        await updateEmployeeApi(updatePayload);
        showMessage('Employee updated successfully!', 'success');
      } else {
        const addPayload: AddEmployeePayload = {
          ...cleanData,
        };
        await addEmployeeApi(addPayload);
        showMessage('Employee added successfully!', 'success');
      }
      reset();
      setShowForm(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save employee';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (employee: Employee) => {
    try {
      const fullEmployee = await getEmployeeByIdApi(employee._id);
      setEditingEmployee(fullEmployee);
      setValue('firstName', fullEmployee.firstName);
      setValue('lastName', fullEmployee.lastName || '');
      setValue('countryCode', fullEmployee.countryCode || '+91');
      setValue('mobileNumber', fullEmployee.mobileNumber);
      setValue('email', fullEmployee.email);
      setValue('employeeType', fullEmployee.employeeType);
      setValue('status', fullEmployee.status);
      setValue('block', typeof fullEmployee.block === 'string' ? fullEmployee.block : fullEmployee.block?._id || '');
      setValue('building', typeof fullEmployee.building === 'string' ? fullEmployee.building : fullEmployee.building?._id || '');
      setValue('society', fullEmployee.society || '');
      setValue('idProofUrl', fullEmployee.idProofUrl || '');
      setValue('policeVerificationUrl', fullEmployee.policeVerificationUrl || '');
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching employee details:', error);
      showMessage('Failed to fetch employee details', 'error');
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName || ''}?`)) {
      try {
        await deleteEmployeeApi({ id: employee._id });
        showMessage('Employee deleted successfully!', 'success');
        fetchEmployees();
      } catch (error: any) {
        console.error('Error deleting employee:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (employee: Employee) => {
    const employeeTypeDisplay = employee.employeeType.charAt(0).toUpperCase() + employee.employeeType.slice(1);
    const statusDisplay = employee.status.charAt(0).toUpperCase() + employee.status.slice(1);
    alert(
      `Employee Details:\n\nName: ${employee.firstName} ${employee.lastName || ''}\nEmail: ${employee.email}\nMobile: ${employee.countryCode} ${employee.mobileNumber}\nType: ${employeeTypeDisplay}\nStatus: ${statusDisplay}`
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
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

  const getEmployeeTypeBadge = (type: string) => {
    const typeClasses: Record<string, string> = {
      security: 'bg-blue-100 text-blue-800',
      gardener: 'bg-green-100 text-green-800',
      electrician: 'bg-yellow-100 text-yellow-800',
      cleaning: 'bg-purple-100 text-purple-800',
      admin: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
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

  const columns: Column<Employee>[] = [
    {
      key: 'number',
      header: '#',
      sortable: false,
      render: (employee: Employee, index?: number) => (
        <div className="text-sm text-gray-600 font-medium">
          {index !== undefined ? (page - 1) * limit + index + 1 : '-'}
        </div>
      ),
    },
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (employee) => (
        <div>
          <div className="font-medium text-primary-black">
            {employee.firstName} {employee.lastName || ''}
          </div>
          <div className="text-sm text-gray-500">{employee.email}</div>
        </div>
      ),
    },
    {
      key: 'mobileNumber',
      header: 'Contact',
      sortable: true,
      render: (employee) => (
        <div className="text-sm text-primary-black">
          {employee.countryCode} {employee.mobileNumber}
        </div>
      ),
    },
    {
      key: 'employeeType',
      header: 'Employee Type',
      sortable: true,
      render: (employee) => getEmployeeTypeBadge(employee.employeeType),
    },
    {
      key: 'block',
      header: 'Block',
      sortable: false,
      render: (employee) => (
        <div className="text-sm text-primary-black">
          {typeof employee.block === 'object' && employee.block?.name
            ? employee.block.name
            : typeof employee.block === 'string'
            ? employee.block
            : '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (employee) => getStatusBadge(employee.status),
    },
  ];

  const actions: ActionButton<Employee>[] = [
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

  // Filter employees by search term and filters
  const filteredEmployees = employees;

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
            <h1 className="text-3xl font-bold text-primary-black">Employees</h1>
            <p className="text-base text-primary-black/50 mt-1">
              Manage employees and their details
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              setEditingEmployee(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center gap-2"
          >
            <IconUserPlus className="w-4 h-4" />
            Add Employee
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
                      id="filter-employeeType"
                      name="filter-employeeType"
                      value={selectedFilters.employeeType || ''}
                      onChange={(value) => handleFilterChange('employeeType', value)}
                      options={[
                        { value: '', label: 'All Types' },
                        ...employeeTypeOptions,
                      ]}
                      placeholder="All Types"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredEmployees}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No employees found"
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
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEmployee(null);
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

            {/* Employee Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Employee Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Type */}
                <div>
                  <label htmlFor="employeeType" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="employeeType"
                    name="employeeType"
                    value={watch('employeeType') || 'other'}
                    onChange={(value) => setValue('employeeType', value as any, { shouldValidate: true })}
                    options={employeeTypeOptions}
                    placeholder="Select employee type"
                    error={errors.employeeType?.message as string}
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

                {/* Building */}
                <div>
                  <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    id="building"
                    {...register('building')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter building ID (optional)"
                  />
                  {errors.building && (
                    <p className="mt-1 text-sm text-red-500">{errors.building.message as string}</p>
                  )}
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

                {/* ID Proof URL */}
                <div>
                  <label htmlFor="idProofUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Proof URL
                  </label>
                  <input
                    type="url"
                    id="idProofUrl"
                    {...register('idProofUrl')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter ID proof URL (optional)"
                  />
                  {errors.idProofUrl && (
                    <p className="mt-1 text-sm text-red-500">{errors.idProofUrl.message as string}</p>
                  )}
                </div>

                {/* Police Verification URL */}
                <div>
                  <label htmlFor="policeVerificationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Police Verification URL
                  </label>
                  <input
                    type="url"
                    id="policeVerificationUrl"
                    {...register('policeVerificationUrl')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter police verification URL (optional)"
                  />
                  {errors.policeVerificationUrl && (
                    <p className="mt-1 text-sm text-red-500">{errors.policeVerificationUrl.message as string}</p>
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
                  setEditingEmployee(null);
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
                {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;

