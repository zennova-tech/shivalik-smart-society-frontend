import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { parkingSchema } from '../../utils/validationSchemas/parkingSchema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { IconEdit, IconTrash, IconEye, IconCar, IconUsers, IconSearch } from '@tabler/icons-react';
import {
  getParkingBySocietyApi,
  getParkingByIdApi,
  addParkingApi,
  updateParkingApi,
  deleteParkingApi,
  Parking,
  GetParkingParams,
  AddParkingPayload,
  UpdateParkingPayload,
} from '../../apis/parking';
import { getBuildingApi, normalizeBuildingResponse } from '../../apis/building';
import { getSocietyId } from '../../utils/societyUtils';
import { showMessage } from '../../utils/Constant';

// Bike Icon Component
const BikeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 17.5l2-5M15 17.5l-2-5M12 8V5M9 8h6"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12 8l-3 9.5M12 8l3 9.5"
    />
  </svg>
);

type ParkingFormData = Yup.InferType<typeof parkingSchema>;

interface SlotCard {
  number: number;
  vehicleType: 'Car' | 'Bike';
  userType: 'Member' | 'Visitor';
}

export const ParkingPage = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingParking, setEditingParking] = useState<Parking | null>(null);
  const [viewingParking, setViewingParking] = useState<Parking | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [defaultBuildingId, setDefaultBuildingId] = useState<string | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);

  useEffect(() => {
    document.title = 'Parking - Smart Society';
    fetchDefaultBuilding();
    fetchParkings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      fetchParkings();
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchParkings();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const params: GetParkingParams = {
        q: searchTerm || undefined,
        limit: 500,
      };

      const response = await getParkingBySocietyApi(params);
      setParkings(response.items || []);
    } catch (error: any) {
      console.error('Error fetching parkings:', error);
      showMessage('Failed to fetch parkings', 'error');
      setParkings([]);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ParkingFormData>({
    resolver: yupResolver(parkingSchema),
    defaultValues: {
      parkingName: '',
      bikeSlotMember: 0,
      carSlotMember: 0,
      bikeSlotVisitor: 0,
      carSlotVisitor: 0,
    },
  });

  // Update form default values when building is loaded
  useEffect(() => {
    if (defaultBuildingId) {
      // Building ID is set at API level, not form level for parking
    }
  }, [defaultBuildingId]);

  const onSubmit = async (data: ParkingFormData) => {
    try {
      setSubmitting(true);
      
      if (!defaultBuildingId) {
        showMessage('Building ID not found. Please ensure a building exists for this society.', 'error');
        return;
      }

      if (editingParking) {
        const updatePayload: UpdateParkingPayload = {
          id: editingParking._id,
          name: data.parkingName,
          memberCarSlots: data.carSlotMember,
          memberBikeSlots: data.bikeSlotMember,
          visitorCarSlots: data.carSlotVisitor,
          visitorBikeSlots: data.bikeSlotVisitor,
          building: defaultBuildingId,
        };
        
        await updateParkingApi(updatePayload);
        showMessage('Parking updated successfully!', 'success');
      } else {
        const addPayload: AddParkingPayload = {
          name: data.parkingName,
          memberCarSlots: data.carSlotMember,
          memberBikeSlots: data.bikeSlotMember,
          visitorCarSlots: data.carSlotVisitor,
          visitorBikeSlots: data.bikeSlotVisitor,
          building: defaultBuildingId,
          status: 'active',
        };
        
        await addParkingApi(addPayload);
        showMessage('Parking added successfully!', 'success');
      }
      
      reset({
        parkingName: '',
        bikeSlotMember: 0,
        carSlotMember: 0,
        bikeSlotVisitor: 0,
        carSlotVisitor: 0,
      });
      setShowForm(false);
      setEditingParking(null);
      fetchParkings();
    } catch (error: any) {
      console.error('Error saving parking:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save parking';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (parking: Parking) => {
    try {
      const fullParking = await getParkingByIdApi(parking._id);
      setEditingParking(fullParking);
      reset({
        parkingName: fullParking.name,
        bikeSlotMember: fullParking.memberBikeSlots,
        carSlotMember: fullParking.memberCarSlots,
        bikeSlotVisitor: fullParking.visitorBikeSlots,
        carSlotVisitor: fullParking.visitorCarSlots,
      });
      setShowForm(true);
    } catch (error: any) {
      console.error('Error fetching parking details:', error);
      showMessage('Failed to fetch parking details', 'error');
    }
  };

  const handleDelete = async (parking: Parking) => {
    if (window.confirm(`Are you sure you want to delete ${parking.name}?`)) {
      try {
        await deleteParkingApi({ id: parking._id });
        showMessage('Parking deleted successfully!', 'success');
        fetchParkings();
      } catch (error: any) {
        console.error('Error deleting parking:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete parking';
        showMessage(errorMessage, 'error');
      }
    }
  };

  const handleView = (parking: Parking) => {
    setViewingParking(parking);
  };

  const getSlotsByType = (parking: Parking, vehicleType: 'Car' | 'Bike', userType: 'Member' | 'Visitor'): SlotCard[] => {
    const slots: SlotCard[] = [];
    
    if (userType === 'Member') {
      if (vehicleType === 'Bike') {
        for (let i = 1; i <= parking.memberBikeSlots; i++) {
          slots.push({ number: i, vehicleType: 'Bike', userType: 'Member' });
        }
      } else {
        for (let i = 1; i <= parking.memberCarSlots; i++) {
          slots.push({ number: i, vehicleType: 'Car', userType: 'Member' });
        }
      }
    } else {
      if (vehicleType === 'Bike') {
        for (let i = 1; i <= parking.visitorBikeSlots; i++) {
          slots.push({ number: i, vehicleType: 'Bike', userType: 'Visitor' });
        }
      } else {
        for (let i = 1; i <= parking.visitorCarSlots; i++) {
          slots.push({ number: i, vehicleType: 'Car', userType: 'Visitor' });
        }
      }
    }
    
    return slots;
  };

  // Filtering is done server-side via API, but we can add client-side filtering if needed
  const filteredParkings = parkings;


  const SlotCard = ({ slot }: { slot: SlotCard }) => {
    const isCar = slot.vehicleType === 'Car';
    const isMember = slot.userType === 'Member';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-900">#{slot.number}</span>
          <div className="flex items-center gap-1">
            {isCar ? (
              <IconCar className="w-5 h-5 text-blue-600" />
            ) : (
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 17.5l2-5M15 17.5l-2-5M12 8V5M9 8h6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 8l-3 9.5M12 8l3 9.5"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              isCar ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {slot.vehicleType}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              isMember ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {slot.userType}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const SlotSection = ({ title, slots }: { title: string; slots: SlotCard[] }) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {slots.map((slot, index) => (
            <SlotCard key={index} slot={slot} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-black">Parking</h1>
          {!viewingParking && (
            <button
              onClick={() => {
                reset({
                  parkingName: '',
                  bikeSlotMember: 0,
                  carSlotMember: 0,
                  bikeSlotVisitor: 0,
                  carSlotVisitor: 0,
                });
                setEditingParking(null);
                setShowForm(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Add Parking
            </button>
          )}
        </div>

        {/* View Parking Slots */}
        {viewingParking && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8 mb-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary-black">{viewingParking.name}</h2>
              <button
                onClick={() => setViewingParking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              <SlotSection
                title="Bike Slots for Members"
                slots={getSlotsByType(viewingParking, 'Bike', 'Member')}
              />
              <SlotSection
                title="Car Slots for Members"
                slots={getSlotsByType(viewingParking, 'Car', 'Member')}
              />
              <SlotSection
                title="Bike Slots for Visitors/Guests"
                slots={getSlotsByType(viewingParking, 'Bike', 'Visitor')}
              />
              <SlotSection
                title="Car Slots for Visitors/Guests"
                slots={getSlotsByType(viewingParking, 'Car', 'Visitor')}
              />
            </div>
          </div>
        )}

        {/* Parking Cards */}
        {!showForm && !viewingParking && (
          <div>
            {/* Search Section */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search parking by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-primary-white text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Parking Cards Grid */}
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold text-gray-600 mb-2">Loading parking areas...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredParkings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParkings.map((parking) => {
                  const totalSlots = parking.memberBikeSlots + parking.memberCarSlots + parking.visitorBikeSlots + parking.visitorCarSlots;
                  
                  return (
                    <Card
                      key={parking._id}
                      className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 bg-primary-white"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary-black flex items-center justify-center">
                              <IconCar className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-primary-black">
                                {parking.name}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Total Slots */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Total Slots</span>
                            <span className="text-2xl font-bold text-primary-black">{totalSlots}</span>
                          </div>

                          {/* Slot Details Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Bike Slots Member */}
                            <div className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <BikeIcon className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-gray-600">Bike (Member)</span>
                              </div>
                              <p className="text-xl font-bold text-primary-black">{parking.memberBikeSlots}</p>
                            </div>

                            {/* Car Slots Member */}
                            <div className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <IconCar className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-gray-600">Car (Member)</span>
                              </div>
                              <p className="text-xl font-bold text-primary-black">{parking.memberCarSlots}</p>
                            </div>

                            {/* Bike Slots Visitor */}
                            <div className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <BikeIcon className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-gray-600">Bike (Visitor)</span>
                              </div>
                              <p className="text-xl font-bold text-primary-black">{parking.visitorBikeSlots}</p>
                            </div>

                            {/* Car Slots Visitor */}
                            <div className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <IconCar className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-gray-600">Car (Visitor)</span>
                              </div>
                              <p className="text-xl font-bold text-primary-black">{parking.visitorCarSlots}</p>
                            </div>
                          </div>

                          {/* Member vs Visitor Summary */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <IconUsers className="w-4 h-4 text-purple-600" />
                              <span className="text-xs text-gray-600">Members:</span>
                              <span className="text-sm font-semibold text-primary-black">
                                {parking.memberBikeSlots + parking.memberCarSlots}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconUsers className="w-4 h-4 text-orange-600" />
                              <span className="text-xs text-gray-600">Visitors:</span>
                              <span className="text-sm font-semibold text-primary-black">
                                {parking.visitorBikeSlots + parking.visitorCarSlots}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleView(parking)}
                        >
                          <IconEye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(parking)}
                        >
                          <IconEdit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDelete(parking)}
                        >
                          <IconTrash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <IconCar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600 mb-2">No parking found</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'No parking areas available at the moment'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary-black">
                {editingParking ? 'Edit Parking' : 'Add New Parking'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingParking(null);
                  reset({
                    parkingName: '',
                    bikeSlotMember: 0,
                    carSlotMember: 0,
                    bikeSlotVisitor: 0,
                    carSlotVisitor: 0,
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
              <h3 className="text-lg font-semibold text-primary-black mb-6">Parking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="parkingName" className="block text-sm font-medium text-gray-700 mb-1">
                    Parking Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parkingName"
                    {...register('parkingName')}
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter parking name"
                  />
                  {errors.parkingName && (
                    <p className="mt-1 text-sm text-red-500">{errors.parkingName.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="bikeSlotMember" className="block text-sm font-medium text-gray-700 mb-1">
                    Bike Slots for Member <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="bikeSlotMember"
                    {...register('bikeSlotMember', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter number of bike slots for members"
                  />
                  {errors.bikeSlotMember && (
                    <p className="mt-1 text-sm text-red-500">{errors.bikeSlotMember.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="carSlotMember" className="block text-sm font-medium text-gray-700 mb-1">
                    Car Slots for Member <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="carSlotMember"
                    {...register('carSlotMember', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter number of car slots for members"
                  />
                  {errors.carSlotMember && (
                    <p className="mt-1 text-sm text-red-500">{errors.carSlotMember.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="bikeSlotVisitor" className="block text-sm font-medium text-gray-700 mb-1">
                    Bike Slots for Visitor/Guest <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="bikeSlotVisitor"
                    {...register('bikeSlotVisitor', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter number of bike slots for visitors"
                  />
                  {errors.bikeSlotVisitor && (
                    <p className="mt-1 text-sm text-red-500">{errors.bikeSlotVisitor.message as string}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="carSlotVisitor" className="block text-sm font-medium text-gray-700 mb-1">
                    Car Slots for Visitor/Guest <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="carSlotVisitor"
                    {...register('carSlotVisitor', { valueAsNumber: true })}
                    min="0"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                    placeholder="Enter number of car slots for visitors"
                  />
                  {errors.carSlotVisitor && (
                    <p className="mt-1 text-sm text-red-500">{errors.carSlotVisitor.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset({
                    parkingName: '',
                    bikeSlotMember: 0,
                    carSlotMember: 0,
                    bikeSlotVisitor: 0,
                    carSlotVisitor: 0,
                  });
                  setShowForm(false);
                  setEditingParking(null);
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
                {submitting ? 'Saving...' : editingParking ? 'Update Parking' : 'Save Parking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

