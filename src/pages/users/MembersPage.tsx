import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  IconUser,
  IconUsers,
  IconCar,
  IconPlus,
  IconX,
  IconCheck,
  IconSearch,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { memberSchema } from '@/utils/validationSchemas/memberSchema';
import { AddMemberPayload, Member, FamilyMember, VehicleDetails } from '@/types/MemberTypes';
import { showMessage } from '@/utils/Constant';
import { AppDispatch, RootState } from '@/store/store';
import { addMember, resetAddMember } from '@/store/slices/memberSlice';

type MemberFormData = Yup.InferType<typeof memberSchema>;

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'other', label: 'Other' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const vehicleTypeOptions = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'cycle', label: 'Cycle' },
  { value: 'other', label: 'Other' },
];

export const MembersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('owner');

  // Get Redux state
  const { status: addMemberStatus, error: addMemberError } = useSelector(
    (state: RootState) => state.member || { status: 'idle', error: null }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<MemberFormData>({
    resolver: yupResolver(memberSchema),
    defaultValues: {
      owner: {
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        mobileNumber: '',
        dateOfBirth: '',
        gender: '',
        occupation: '',
        address: '',
        aadharNumber: '',
        panNumber: '',
        unitId: '',
        blockId: '',
        buildingId: '',
      },
      familyMembers: [],
      vehicles: [],
    },
  });

  const {
    fields: familyFields,
    append: appendFamily,
    remove: removeFamily,
  } = useFieldArray({
    control,
    name: 'familyMembers',
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control,
    name: 'vehicles',
  });

  useEffect(() => {
    document.title = 'Members - Smart Society';
  }, []);

  // Handle add member success/error
  useEffect(() => {
    if (addMemberStatus === 'complete') {
      showMessage('Member created successfully!', 'success');
      setIsAddDialogOpen(false);
      reset();
      setActiveTab('owner');
      dispatch(resetAddMember());
      // Optionally refresh members list
      // dispatch(getMembers());
    } else if (addMemberStatus === 'failed') {
      showMessage(addMemberError || 'Failed to create member', 'error');
      dispatch(resetAddMember());
    }
  }, [addMemberStatus, addMemberError, dispatch, reset]);

  const handleAddNewMember = () => {
    setIsAddDialogOpen(true);
    reset();
    setActiveTab('owner');
  };

  const onSubmit = (data: MemberFormData) => {
    // Prepare payload according to backend API structure
    const payload: AddMemberPayload = {
      owner: {
        firstName: data.owner.firstName.trim(),
        lastName: data.owner.lastName?.trim() || '',
        email: data.owner.email.trim().toLowerCase(),
        countryCode: data.owner.countryCode.trim(),
        mobileNumber: data.owner.mobileNumber.trim(),
        dateOfBirth: data.owner.dateOfBirth?.trim() || '',
        gender: data.owner.gender || '',
        occupation: data.owner.occupation?.trim() || '',
        address: data.owner.address?.trim() || '',
        aadharNumber: data.owner.aadharNumber?.trim() || '',
        panNumber: data.owner.panNumber?.trim() || '',
        unitId: data.owner.unitId?.trim() || '',
        blockId: data.owner.blockId?.trim() || '',
        buildingId: data.owner.buildingId?.trim() || '',
      },
      familyMembers: data.familyMembers?.map((member) => ({
        firstName: member.firstName.trim(),
        lastName: member.lastName?.trim() || '',
        relationship: member.relationship.trim(),
        age: member.age,
        gender: member.gender || '',
        email: member.email?.trim().toLowerCase() || '',
        mobileNumber: member.mobileNumber?.trim() || '',
        countryCode: member.countryCode?.trim() || '+91',
      })) || [],
      vehicles: data.vehicles?.map((vehicle) => ({
        vehicleNumber: vehicle.vehicleNumber.trim(),
        vehicleType: vehicle.vehicleType.trim(),
        manufacturer: vehicle.manufacturer?.trim() || '',
        model: vehicle.model?.trim() || '',
        color: vehicle.color?.trim() || '',
        registrationDate: vehicle.registrationDate?.trim() || '',
        insuranceExpiryDate: vehicle.insuranceExpiryDate?.trim() || '',
        parkingSlotNumber: vehicle.parkingSlotNumber?.trim() || '',
      })) || [],
    };

    // Dispatch Redux action to create member
    dispatch(addMember(payload));
  };

  const filteredMembers = members.filter((member) =>
    member.owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.owner.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-black mb-2">Members</h1>
          <p className="text-base text-primary-black/50">
            Manage society members, their family details, and vehicle information
          </p>
        </div>

        {/* Search Bar and Add Button */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between sm:items-center">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
              />
            </div>
            <Button
              onClick={handleAddNewMember}
              className="bg-primary-black text-white hover:bg-gray-800 whitespace-nowrap"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add New Member
            </Button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-black">
                        {member.owner.firstName} {member.owner.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{member.owner.email}</p>
                      <p className="text-sm text-gray-600">
                        {member.owner.countryCode} {member.owner.mobileNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <IconEdit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <IconTrash className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">No members found</p>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No members available. Add a new member to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Add New Member Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary-black flex items-center justify-center">
                  <IconUser className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">Add New Member</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new member. Complete all sections as needed.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="owner">
                    <IconUser className="w-4 h-4 mr-2" />
                    Owner Details
                  </TabsTrigger>
                  <TabsTrigger value="family">
                    <IconUsers className="w-4 h-4 mr-2" />
                    Family Details
                  </TabsTrigger>
                  <TabsTrigger value="vehicle">
                    <IconCar className="w-4 h-4 mr-2" />
                    Vehicle Details
                  </TabsTrigger>
                </TabsList>

                {/* Owner Details Tab */}
                <TabsContent value="owner" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-black mb-4">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label htmlFor="owner.firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="owner.firstName"
                          {...register('owner.firstName')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter first name"
                        />
                        {errors.owner?.firstName && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.firstName.message}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="owner.lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="owner.lastName"
                          {...register('owner.lastName')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter last name"
                        />
                        {errors.owner?.lastName && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.lastName.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="owner.email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="owner.email"
                          {...register('owner.email')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="owner@example.com"
                        />
                        {errors.owner?.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.email.message}</p>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country Code + Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="w-24">
                            <input
                              type="text"
                              id="owner.countryCode"
                              {...register('owner.countryCode')}
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                              placeholder="+91"
                            />
                            {errors.owner?.countryCode && (
                              <p className="mt-1 text-sm text-red-500">{errors.owner.countryCode.message}</p>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              id="owner.mobileNumber"
                              {...register('owner.mobileNumber')}
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                              placeholder="9876543210"
                            />
                            {errors.owner?.mobileNumber && (
                              <p className="mt-1 text-sm text-red-500">{errors.owner.mobileNumber.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label htmlFor="owner.dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="owner.dateOfBirth"
                          {...register('owner.dateOfBirth')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                        />
                        {errors.owner?.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.dateOfBirth.message}</p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label htmlFor="owner.gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          id="owner.gender"
                          {...register('owner.gender')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.owner?.gender && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.gender.message}</p>
                        )}
                      </div>

                      {/* Occupation */}
                      <div>
                        <label htmlFor="owner.occupation" className="block text-sm font-medium text-gray-700 mb-1">
                          Occupation
                        </label>
                        <input
                          type="text"
                          id="owner.occupation"
                          {...register('owner.occupation')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter occupation"
                        />
                        {errors.owner?.occupation && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.occupation.message}</p>
                        )}
                      </div>

                      {/* Aadhar Number */}
                      <div>
                        <label htmlFor="owner.aadharNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhar Number
                        </label>
                        <input
                          type="text"
                          id="owner.aadharNumber"
                          {...register('owner.aadharNumber')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="1234 5678 9012"
                          maxLength={12}
                        />
                        {errors.owner?.aadharNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.aadharNumber.message}</p>
                        )}
                      </div>

                      {/* PAN Number */}
                      <div>
                        <label htmlFor="owner.panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          id="owner.panNumber"
                          {...register('owner.panNumber')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                        {errors.owner?.panNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.panNumber.message}</p>
                        )}
                      </div>

                      {/* Address - Full Width */}
                      <div className="md:col-span-2">
                        <label htmlFor="owner.address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          id="owner.address"
                          {...register('owner.address')}
                          rows={3}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent resize-y"
                          placeholder="Enter complete address"
                        />
                        {errors.owner?.address && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.address.message}</p>
                        )}
                      </div>

                      {/* Unit ID, Block ID, Building ID */}
                      <div>
                        <label htmlFor="owner.unitId" className="block text-sm font-medium text-gray-700 mb-1">
                          Unit ID
                        </label>
                        <input
                          type="text"
                          id="owner.unitId"
                          {...register('owner.unitId')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter unit ID"
                        />
                        {errors.owner?.unitId && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.unitId.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="owner.blockId" className="block text-sm font-medium text-gray-700 mb-1">
                          Block ID
                        </label>
                        <input
                          type="text"
                          id="owner.blockId"
                          {...register('owner.blockId')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter block ID"
                        />
                        {errors.owner?.blockId && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.blockId.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="owner.buildingId" className="block text-sm font-medium text-gray-700 mb-1">
                          Building ID
                        </label>
                        <input
                          type="text"
                          id="owner.buildingId"
                          {...register('owner.buildingId')}
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                          placeholder="Enter building ID"
                        />
                        {errors.owner?.buildingId && (
                          <p className="mt-1 text-sm text-red-500">{errors.owner.buildingId.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Family Details Tab */}
                <TabsContent value="family" className="space-y-6 mt-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary-black">Family Members</h3>
                      <Button
                        type="button"
                        onClick={() =>
                          appendFamily({
                            firstName: '',
                            lastName: '',
                            relationship: '',
                            age: undefined,
                            gender: '',
                            email: '',
                            mobileNumber: '',
                            countryCode: '+91',
                          })
                        }
                        variant="outline"
                        size="sm"
                      >
                        <IconPlus className="w-4 h-4 mr-2" />
                        Add Family Member
                      </Button>
                    </div>

                    {familyFields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <IconUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No family members added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Family Member" to add one</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {familyFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-semibold text-primary-black">
                                Family Member {index + 1}
                              </h4>
                              <Button
                                type="button"
                                onClick={() => removeFamily(index)}
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <IconX className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  {...register(`familyMembers.${index}.firstName`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter first name"
                                />
                                {errors.familyMembers?.[index]?.firstName && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.familyMembers[index]?.firstName?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  {...register(`familyMembers.${index}.lastName`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter last name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Relationship <span className="text-red-500">*</span>
                                </label>
                                <select
                                  {...register(`familyMembers.${index}.relationship`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                >
                                  <option value="">Select relationship</option>
                                  {relationshipOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                {errors.familyMembers?.[index]?.relationship && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.familyMembers[index]?.relationship?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                  type="number"
                                  {...register(`familyMembers.${index}.age`, { valueAsNumber: true })}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter age"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                  {...register(`familyMembers.${index}.gender`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                >
                                  <option value="">Select gender</option>
                                  {genderOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                  type="email"
                                  {...register(`familyMembers.${index}.email`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="email@example.com"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Country Code
                                </label>
                                <input
                                  type="text"
                                  {...register(`familyMembers.${index}.countryCode`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="+91"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Mobile Number
                                </label>
                                <input
                                  type="text"
                                  {...register(`familyMembers.${index}.mobileNumber`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="9876543210"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Vehicle Details Tab */}
                <TabsContent value="vehicle" className="space-y-6 mt-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-primary-black">Vehicles</h3>
                      <Button
                        type="button"
                        onClick={() =>
                          appendVehicle({
                            vehicleNumber: '',
                            vehicleType: '',
                            manufacturer: '',
                            model: '',
                            color: '',
                            registrationDate: '',
                            insuranceExpiryDate: '',
                            parkingSlotNumber: '',
                          })
                        }
                        variant="outline"
                        size="sm"
                      >
                        <IconPlus className="w-4 h-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </div>

                    {vehicleFields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <IconCar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No vehicles added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Vehicle" to add one</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {vehicleFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-md font-semibold text-primary-black">
                                Vehicle {index + 1}
                              </h4>
                              <Button
                                type="button"
                                onClick={() => removeVehicle(index)}
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <IconX className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Vehicle Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  {...register(`vehicles.${index}.vehicleNumber`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter vehicle number"
                                />
                                {errors.vehicles?.[index]?.vehicleNumber && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.vehicles[index]?.vehicleNumber?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Vehicle Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                  {...register(`vehicles.${index}.vehicleType`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                >
                                  <option value="">Select vehicle type</option>
                                  {vehicleTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                {errors.vehicles?.[index]?.vehicleType && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.vehicles[index]?.vehicleType?.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Manufacturer
                                </label>
                                <input
                                  type="text"
                                  {...register(`vehicles.${index}.manufacturer`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter manufacturer"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                <input
                                  type="text"
                                  {...register(`vehicles.${index}.model`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter model"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <input
                                  type="text"
                                  {...register(`vehicles.${index}.color`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter color"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Registration Date
                                </label>
                                <input
                                  type="date"
                                  {...register(`vehicles.${index}.registrationDate`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Insurance Expiry Date
                                </label>
                                <input
                                  type="date"
                                  {...register(`vehicles.${index}.insuranceExpiryDate`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Parking Slot Number
                                </label>
                                <input
                                  type="text"
                                  {...register(`vehicles.${index}.parkingSlotNumber`)}
                                  className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-0 bg-transparent"
                                  placeholder="Enter parking slot number"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  className="flex-[2] bg-primary-black text-white hover:bg-gray-800"
                  disabled={addMemberStatus === 'loading'}
                >
                  {addMemberStatus === 'loading' ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <IconCheck className="w-4 h-4 mr-2" />
                      Create Member
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    reset();
                    setActiveTab('owner');
                  }}
                  disabled={addMemberStatus === 'loading'}
                >
                  <IconX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

