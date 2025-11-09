import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { amenitiesSchema } from '../../utils/validationSchemas/amenitiesSchema';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { DataTable, Column, ActionButton } from '../../components/ui/DataTable';
import { IconEdit, IconTrash, IconEye, IconCheck, IconX, IconTool, IconPlus } from '@tabler/icons-react';

type AmenitiesFormData = Yup.InferType<typeof amenitiesSchema>;

interface BookingSlot {
  startTime: string;
  endTime: string;
}

interface Amenity {
  id: string;
  amenityName: string;
  description: string;
  capacity: number;
  amenityType: string;
  bookingType: string;
  bookingSlots: BookingSlot[];
  advanceBookingDays: number;
  status: string;
  photo?: string;
}

const statusOptions = [
  { value: 'Available', label: 'Available' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Unavailable', label: 'Unavailable' },
];

const amenityTypeOptions = [
  { value: 'Free', label: 'Free' },
  { value: 'Paid', label: 'Paid' },
];

const bookingTypeOptions = [
  { value: 'One Time Booking', label: 'One Time Booking' },
  { value: 'Recurring Booking', label: 'Recurring Booking' },
];

const mockAmenities: Amenity[] = [
  {
    id: '1',
    amenityName: 'Swimming Pool',
    description: 'Olympic size swimming pool with lifeguard',
    capacity: 50,
    amenityType: 'Free',
    bookingType: 'One Time Booking',
    bookingSlots: [
      { startTime: '06:00', endTime: '08:00' },
      { startTime: '18:00', endTime: '20:00' },
    ],
    advanceBookingDays: 7,
    status: 'Available',
  },
  {
    id: '2',
    amenityName: 'Gym',
    description: 'Fully equipped gym with modern equipment',
    capacity: 30,
    amenityType: 'Free',
    bookingType: 'Recurring Booking',
    bookingSlots: [
      { startTime: '05:00', endTime: '23:00' },
    ],
    advanceBookingDays: 3,
    status: 'Available',
  },
  {
    id: '3',
    amenityName: 'Party Hall',
    description: 'Large party hall for events and celebrations',
    capacity: 100,
    amenityType: 'Paid',
    bookingType: 'One Time Booking',
    bookingSlots: [
      { startTime: '10:00', endTime: '14:00' },
      { startTime: '15:00', endTime: '19:00' },
      { startTime: '19:00', endTime: '23:00' },
    ],
    advanceBookingDays: 30,
    status: 'Maintenance',
  },
];

export const AmenitiesPage = () => {
  const [amenities, setAmenities] = useState<Amenity[]>(mockAmenities);
  const [showForm, setShowForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Amenities - Smart Society';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<AmenitiesFormData>({
    resolver: yupResolver(amenitiesSchema),
    defaultValues: {
      amenityName: '',
      description: '',
      capacity: 0,
      amenityType: '',
      bookingType: '',
      bookingSlots: [{ startTime: '', endTime: '' }],
      advanceBookingDays: 0,
      status: '',
      photo: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bookingSlots',
  });

  const onSubmit = (data: AmenitiesFormData) => {
    console.log('Form submitted:', data);
    // Ensure booking slots have required fields
    const processedSlots: BookingSlot[] = data.bookingSlots.map(slot => ({
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
    }));

    if (editingAmenity) {
      setAmenities(
        amenities.map((amenity) =>
          amenity.id === editingAmenity.id
            ? {
                ...amenity,
                amenityName: data.amenityName,
                description: data.description,
                capacity: data.capacity,
                amenityType: data.amenityType,
                bookingType: data.bookingType,
                bookingSlots: processedSlots,
                advanceBookingDays: data.advanceBookingDays,
                status: data.status,
              }
            : amenity
        )
      );
      setEditingAmenity(null);
    } else {
      const newAmenity: Amenity = {
        id: Date.now().toString(),
        amenityName: data.amenityName,
        description: data.description,
        capacity: data.capacity,
        amenityType: data.amenityType,
        bookingType: data.bookingType,
        bookingSlots: processedSlots,
        advanceBookingDays: data.advanceBookingDays,
        status: data.status,
      };
      setAmenities([...amenities, newAmenity]);
    }
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
    alert(editingAmenity ? 'Amenity updated successfully!' : 'Amenity added successfully!');
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setValue('amenityName', amenity.amenityName);
    setValue('description', amenity.description);
    setValue('capacity', amenity.capacity);
    setValue('amenityType', amenity.amenityType);
    setValue('bookingType', amenity.bookingType);
    setValue('bookingSlots', amenity.bookingSlots.length > 0 ? amenity.bookingSlots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    })) : [{ startTime: '', endTime: '' }]);
    setValue('advanceBookingDays', amenity.advanceBookingDays);
    setValue('status', amenity.status);
    setShowForm(true);
  };

  const handleDelete = (amenity: Amenity) => {
    if (window.confirm(`Are you sure you want to delete ${amenity.amenityName}?`)) {
      setAmenities(amenities.filter((a) => a.id !== amenity.id));
      alert('Amenity deleted successfully!');
    }
  };

  const handleView = (amenity: Amenity) => {
    const slotsText = amenity.bookingSlots
      .map((slot) => `${slot.startTime} - ${slot.endTime}`)
      .join('\n');
    alert(
      `Amenity Details:\nName: ${amenity.amenityName}\nDescription: ${amenity.description}\nCapacity: ${amenity.capacity}\nType: ${amenity.amenityType}\nBooking Type: ${amenity.bookingType}\nSlots:\n${slotsText}\nAdvance Booking: ${amenity.advanceBookingDays} days\nStatus: ${amenity.status}`
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <IconCheck className="w-4 h-4 text-green-600" />;
      case 'Maintenance':
        return <IconTool className="w-4 h-4 text-yellow-600" />;
      case 'Unavailable':
        return <IconX className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter amenities by search term and filters
  const filteredAmenities = amenities.filter((amenity) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        amenity.amenityName.toLowerCase().includes(searchLower) ||
        amenity.description.toLowerCase().includes(searchLower) ||
        amenity.amenityType.toLowerCase().includes(searchLower) ||
        amenity.bookingType.toLowerCase().includes(searchLower) ||
        amenity.status.toLowerCase().includes(searchLower) ||
        amenity.capacity.toString().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Other filters
    if (selectedFilters.amenityType && amenity.amenityType !== selectedFilters.amenityType) {
      return false;
    }
    if (selectedFilters.bookingType && amenity.bookingType !== selectedFilters.bookingType) {
      return false;
    }
    if (selectedFilters.status && amenity.status !== selectedFilters.status) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const columns: Column<Amenity>[] = [
    { key: 'amenityName', header: 'Amenity Name', sortable: true },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (amenity) => (
        <div className="max-w-xs truncate" title={amenity.description}>
          {amenity.description}
        </div>
      ),
    },
    { key: 'capacity', header: 'Capacity', sortable: true },
    { key: 'amenityType', header: 'Type', sortable: true },
    { key: 'bookingType', header: 'Booking Type', sortable: true },
    {
      key: 'bookingSlots',
      header: 'Booking Slots',
      sortable: false,
      render: (amenity) => (
        <div className="text-sm">
          {amenity.bookingSlots.map((slot, idx) => (
            <div key={idx} className="text-xs">
              {slot.startTime} - {slot.endTime}
            </div>
          ))}
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
            {amenity.status}
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
                capacity: 0,
                amenityType: '',
                bookingType: '',
                bookingSlots: [{ startTime: '', endTime: '' }],
                advanceBookingDays: 0,
                status: '',
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
                        ...Array.from(new Set(amenities.map((a) => a.amenityType)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
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
                        ...Array.from(new Set(amenities.map((a) => a.bookingType)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
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
                        ...Array.from(new Set(amenities.map((a) => a.status)))
                          .sort()
                          .map((option) => ({ value: option, label: option })),
                      ]}
                      placeholder="All Status"
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredAmenities}
              columns={columns}
              actions={actions}
              searchable={false}
              filterable={false}
              emptyMessage="No amenities found"
            />
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
                    capacity: 0,
                    amenityType: '',
                    bookingType: '',
                    bookingSlots: [{ startTime: '', endTime: '' }],
                    advanceBookingDays: 0,
                    status: '',
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
                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {editingAmenity ? 'Update Amenity' : 'Save Amenity'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

