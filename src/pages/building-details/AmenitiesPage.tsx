import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { amenitiesSchema } from '../../utils/validationSchemas/amenitiesSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconTool, IconPlus } from '@tabler/icons-react';
import {
  getAmenitiesBySocietyApi,
  getAmenityByIdApi,
  addAmenityApi,
  updateAmenityApi,
  deleteAmenityApi,
  Amenity,
  GetAmenityParams,
  AddAmenityPayload,
  UpdateAmenityPayload,
  BookingSlot,
} from '../../apis/amenity';
import { getBlocksBySocietyApi } from '../../apis/block';
import { getBuildingApi, normalizeBuildingResponse } from '../../apis/building';
import { getSocietyId } from '../../utils/societyUtils';
import { showMessage } from '../../utils/Constant';

type AmenitiesFormData = Yup.InferType<typeof amenitiesSchema>;

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'archived', label: 'Archived' },
];

const amenityTypeOptions = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const bookingTypeOptions = [
  { value: 'one_time', label: 'One Time Booking' },
  { value: 'slot_based', label: 'Slot Based Booking' },
  { value: 'recurring', label: 'Recurring Booking' },
];

export const AmenitiesPage = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [defaultBuildingId, setDefaultBuildingId] = useState<string | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [blockOptions, setBlockOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  useEffect(() => {
    document.title = 'Amenities - Smart Society';
    fetchDefaultBuilding();
    fetchBlocks();
    fetchAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      fetchAmenities();
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchAmenities();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters]);

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

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const params: GetAmenityParams = {
        q: searchTerm || undefined,
        status: selectedFilters.status || undefined,
        limit: 500,
      };

      const response = await getAmenitiesBySocietyApi(params);
      let filteredAmenities = response.items || [];

      // Apply additional filters client-side
      if (selectedFilters.amenityType) {
        filteredAmenities = filteredAmenities.filter((amenity) => amenity.amenityType === selectedFilters.amenityType);
      }
      if (selectedFilters.bookingType) {
        filteredAmenities = filteredAmenities.filter((amenity) => amenity.bookingType === selectedFilters.bookingType);
      }

      setAmenities(filteredAmenities);
    } catch (error: any) {
      console.error('Error fetching amenities:', error);
      showMessage('Failed to fetch amenities', 'error');
      setAmenities([]);
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
    control,
    trigger,
  } = useForm<AmenitiesFormData>({
    resolver: yupResolver(amenitiesSchema),
    defaultValues: {
      amenityName: '',
      description: '',
      capacity: 1,
      amenityType: '',
      bookingType: '',
      bookingSlots: [],
      advanceBookingDays: 0,
      status: 'available',
      photo: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bookingSlots',
  });

  const watchedAmenityType = watch('amenityType');
  const watchedBookingType = watch('bookingType');

  // Show booking slots only for slot_based booking type
  const showBookingSlots = watchedBookingType === 'slot_based';
  
  // Show advance booking days for paid amenities or slot_based/recurring booking types
  const showAdvanceBookingDays = watchedAmenityType === 'paid' || 
                                  watchedBookingType === 'slot_based' || 
                                  watchedBookingType === 'recurring';

  const onSubmit = async (data: AmenitiesFormData) => {
    try {
      setSubmitting(true);

      if (!defaultBuildingId) {
        showMessage('Building ID not found. Please ensure a building exists for this society.', 'error');
        return;
      }

      // Process booking slots - only include if bookingType is slot_based
      const processedSlots: BookingSlot[] = 
        data.bookingType === 'slot_based' && data.bookingSlots
          ? data.bookingSlots
              .filter(slot => slot.startTime && slot.endTime)
              .map(slot => ({
                startTime: slot.startTime || '',
                endTime: slot.endTime || '',
                capacity: slot.capacity,
              }))
          : [];

      // Set advanceBookingDays - only if required (paid or slot_based/recurring)
      const advanceBookingDaysValue = 
        data.amenityType === 'paid' || 
        data.bookingType === 'slot_based' || 
        data.bookingType === 'recurring'
          ? (data.advanceBookingDays || 0)
          : 0;

      if (editingAmenity) {
        const updatePayload: UpdateAmenityPayload = {
          id: editingAmenity._id,
          name: data.amenityName,
          description: data.description || undefined,
          capacity: data.capacity,
          amenityType: data.amenityType,
          bookingType: data.bookingType,
          slots: processedSlots,
          advanceBookingDays: advanceBookingDaysValue,
          building: defaultBuildingId,
          status: data.status,
        };
        
        await updateAmenityApi(updatePayload);
        showMessage('Amenity updated successfully!', 'success');
      } else {
        const addPayload: AddAmenityPayload = {
          name: data.amenityName,
          description: data.description || undefined,
          capacity: data.capacity,
          amenityType: data.amenityType,
          bookingType: data.bookingType,
          slots: processedSlots,
          advanceBookingDays: advanceBookingDaysValue,
          building: defaultBuildingId,
          status: data.status || 'available',
        };
        
        await addAmenityApi(addPayload);
        showMessage('Amenity added successfully!', 'success');
      }
      
      reset({
        amenityName: '',
        description: '',
        capacity: 1,
        amenityType: '',
        bookingType: '',
        bookingSlots: [],
        advanceBookingDays: 0,
        status: 'available',
        photo: undefined,
      });
      setShowForm(false);
      setEditingAmenity(null);
      fetchAmenities();
    } catch (error: any) {
      console.error('Error saving amenity:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save amenity';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (amenity: Amenity) => {
    try {
      const fullAmenity = await getAmenityByIdApi(amenity._id);
      setEditingAmenity(fullAmenity);
      setValue('amenityName', fullAmenity.name);
      setValue('description', fullAmenity.description || '');
      setValue('capacity', fullAmenity.capacity);
      setValue('amenityType', fullAmenity.amenityType || '');
      setValue('bookingType', fullAmenity.bookingType || '');
      setValue('bookingSlots', fullAmenity.slots && fullAmenity.slots.length > 0 ? fullAmenity.slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })) : [{ startTime: '', endTime: '' }]);
      setValue('advanceBookingDays', fullAmenity.advanceBookingDays || 0);
      setValue('status', fullAmenity.status || '');
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching amenity details:', error);
      showMessage('Failed to fetch amenity details', 'error');
    }
  };

  const handleDelete = async (amenity: Amenity) => {
    if (window.confirm(`Are you sure you want to delete ${amenity.name}?`)) {
      try {
        await deleteAmenityApi({ id: amenity._id });
        showMessage('Amenity deleted successfully!', 'success');
        fetchAmenities();
      } catch (error: any) {
        console.error('Error deleting amenity:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete amenity';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (amenity: Amenity) => {
    const slotsText = amenity.slots && amenity.slots.length > 0
      ? amenity.slots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join('\n')
      : 'No slots defined';
    alert(
      `Amenity Details:\nName: ${amenity.name}\nDescription: ${amenity.description || 'N/A'}\nCapacity: ${amenity.capacity}\nType: ${amenity.amenityType}\nBooking Type: ${amenity.bookingType}\nSlots:\n${slotsText}\nAdvance Booking: ${amenity.advanceBookingDays} days\nStatus: ${amenity.status}`
    );
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'available':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'unavailable':
        return <IconX className="w-4 h-4 text-red-600" />;
      case 'archived':
        return <IconTool className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'unavailable':
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
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Unavailable';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const getAmenityTypeDisplay = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'free':
        return 'Free';
      case 'paid':
        return 'Paid';
      default:
        return type;
    }
  };

  const getBookingTypeDisplay = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'one_time':
        return 'One Time Booking';
      case 'recurring':
        return 'Recurring Booking';
      case 'slot_based':
        return 'Slot Based';
      default:
        return type;
    }
  };

  // Filtering is mostly done server-side
  const filteredAmenities = amenities;

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const columns: Column<Amenity>[] = [
    { key: 'name', header: 'Amenity Name', sortable: true },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (amenity) => (
        <div className="max-w-xs truncate" title={amenity.description}>
          {amenity.description || 'N/A'}
        </div>
      ),
    },
    { key: 'capacity', header: 'Capacity', sortable: true },
    {
      key: 'amenityType',
      header: 'Type',
      sortable: true,
      render: (amenity) => getAmenityTypeDisplay(amenity.amenityType),
    },
    {
      key: 'bookingType',
      header: 'Booking Type',
      sortable: true,
      render: (amenity) => getBookingTypeDisplay(amenity.bookingType),
    },
    {
      key: 'slots',
      header: 'Booking Slots',
      sortable: false,
      render: (amenity) => (
        <div className="text-sm">
          {amenity.slots && amenity.slots.length > 0 ? (
            amenity.slots.map((slot, idx) => (
              <div key={idx} className="text-xs">
                {slot.startTime} - {slot.endTime}
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400">No slots</span>
          )}
        </div>
      ),
    },
    { key: 'advanceBookingDays', header: 'Advance Booking (days)', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (amenity) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(amenity.status)}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(amenity.status)}`}>
            {getStatusDisplay(amenity.status)}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<Amenity>[] = [
    { label: 'View', icon: <IconEye className="w-4 h-4" />, onClick: handleView, variant: 'primary' },
    { label: 'Edit', icon: <IconEdit className="w-4 h-4" />, onClick: handleEdit, variant: 'primary' },
    { label: 'Delete', icon: <IconTrash className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Amenities</h1>
          <button
            onClick={() => {
              reset({
                amenityName: '',
                description: '',
                capacity: 1,
                amenityType: '',
                bookingType: '',
                bookingSlots: [],
                advanceBookingDays: 0,
                status: 'available',
                photo: undefined,
              });
              setEditingAmenity(null);
              setShowForm(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Add Amenity
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
                      placeholder="Search amenities by name, description, type, or status..."
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
                      id="filter-amenityType"
                      name="filter-amenityType"
                      value={selectedFilters.amenityType || ''}
                      onChange={(value) => handleFilterChange('amenityType', value)}
                      options={[
                        { value: '', label: 'All Types' },
                        ...amenityTypeOptions,
                      ]}
                      placeholder="All Types"
                      disabled={false}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomSelect
                      id="filter-bookingType"
                      name="filter-bookingType"
                      value={selectedFilters.bookingType || ''}
                      onChange={(value) => handleFilterChange('bookingType', value)}
                      options={[
                        { value: '', label: 'All Booking Types' },
                        ...bookingTypeOptions,
                      ]}
                      placeholder="All Booking Types"
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
            </div>

            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-gray-600 mb-2">Loading amenities...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={filteredAmenities}
                columns={columns}
                actions={actions}
                searchable={false}
                filterable={false}
                emptyMessage="No amenities found"
              />
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAmenity(null);
                  reset({
                    amenityName: '',
                    description: '',
                    capacity: 1,
                    amenityType: '',
                    bookingType: '',
                    bookingSlots: [],
                    advanceBookingDays: 0,
                    status: 'available',
                    photo: undefined,
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6">Amenity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amenityName" className="block text-sm font-medium text-gray-700 mb-1">
                    Amenity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="amenityName"
                    {...register('amenityName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter amenity name"
                  />
                  {errors.amenityName && (
                    <p className="mt-1 text-sm text-red-500">{errors.amenityName.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    {...register('capacity', { valueAsNumber: true })}
                    min="1"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter capacity"
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-sm text-red-500">{errors.capacity.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="amenityType" className="block text-sm font-medium text-gray-700 mb-1">
                    Amenity Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="amenityType"
                    name="amenityType"
                    value={watch('amenityType') || ''}
                    onChange={(value) => setValue('amenityType', value, { shouldValidate: true })}
                    options={amenityTypeOptions}
                    placeholder="Select amenity type"
                    error={errors.amenityType?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bookingType" className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="bookingType"
                    name="bookingType"
                    value={watch('bookingType') || ''}
                    onChange={(value) => setValue('bookingType', value, { shouldValidate: true })}
                    options={bookingTypeOptions}
                    placeholder="Select booking type"
                    error={errors.bookingType?.message as string}
                    disabled={false}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="advanceBookingDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Booking Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="advanceBookingDays"
                    {...register('advanceBookingDays', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter days"
                  />
                  {errors.advanceBookingDays && (
                    <p className="mt-1 text-sm text-red-500">{errors.advanceBookingDays.message as string}</p>
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
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent resize-y"
                    placeholder="Enter amenity description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message as string}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
                    Amenity Photo
                  </label>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    {...register('photo')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent text-sm"
                  />
                  {errors.photo && (
                    <p className="mt-1 text-sm text-red-500">{errors.photo.message as string}</p>
                  )}
                </div>

                {/* Booking Slots Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Booking Slots <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ startTime: '', endTime: '' })}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      <IconPlus className="w-4 h-4" />
                      Add Slot
                    </button>
                  </div>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            {...register(`bookingSlots.${index}.startTime` as const)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                          />
                          {errors.bookingSlots?.[index]?.startTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.bookingSlots[index]?.startTime?.message}
                            </p>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            {...register(`bookingSlots.${index}.endTime` as const)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-white text-primary-black focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm [color-scheme:light]"
                          />
                          {errors.bookingSlots?.[index]?.endTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.bookingSlots[index]?.endTime?.message}
                            </p>
                          )}
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.bookingSlots && typeof errors.bookingSlots.message === 'string' && (
                    <p className="mt-2 text-sm text-red-500">{errors.bookingSlots.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    amenityName: '',
                    description: '',
                    capacity: 0,
                    amenityType: '',
                    bookingType: '',
                    bookingSlots: [{ startTime: '', endTime: '' }],
                    advanceBookingDays: 0,
                    status: '',
                    photo: undefined,
                  });
                  setShowForm(false);
                  setEditingAmenity(null);
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
                {submitting ? 'Saving...' : editingAmenity ? 'Update Amenity' : 'Save Amenity'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

