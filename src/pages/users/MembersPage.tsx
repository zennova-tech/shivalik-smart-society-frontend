import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconUser,
  IconUsers,
  IconCar,
  IconBuilding,
  IconHome,
} from '@tabler/icons-react';
import { Member, FamilyMember, VehicleDetails } from '@/types/MemberTypes';
import { getBlocksBySocietyApi, Block } from '@/apis/block';
import { getUnitsApi, getUnitByIdApi, Unit } from '@/apis/unit';
import { getMembersApi } from '@/apis/member';
import { showMessage } from '@/utils/Constant';

export const MembersPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [member, setMember] = useState<Member | null>(null);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [activeTab, setActiveTab] = useState('owner');

  useEffect(() => {
    document.title = 'Members - Smart Society';
    fetchBlocks();
  }, []);

  // Fetch blocks on mount
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

  // Fetch units when block is selected
  useEffect(() => {
    if (selectedBlock) {
      fetchUnits(selectedBlock);
      setSelectedUnit(''); // Reset unit selection
      setMember(null); // Clear member data
    } else {
      setUnits([]);
      setSelectedUnit('');
      setMember(null);
    }
  }, [selectedBlock]);

  const fetchUnits = async (blockId: string) => {
    try {
      setLoadingUnits(true);
      const response = await getUnitsApi({ 
        block: blockId, 
        status: 'active',
        limit: 500 
      });
      setUnits(response.items || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      showMessage('Failed to fetch units', 'error');
    } finally {
      setLoadingUnits(false);
    }
  };

  // Fetch member when unit is selected
  useEffect(() => {
    if (selectedUnit) {
      fetchMemberByUnit(selectedUnit);
    } else {
      setMember(null);
    }
  }, [selectedUnit]);

  const fetchMemberByUnit = async (unitId: string) => {
    try {
      setLoadingMember(true);
      
      // First, fetch the unit with populated owner
      const unit = await getUnitByIdApi(unitId);
      
      if (!unit) {
        setMember(null);
        showMessage('Unit not found', 'error');
        setLoadingMember(false);
        return;
      }

      if (!unit.owner) {
        setMember(null);
        showMessage('No owner assigned to this unit', 'info');
        setLoadingMember(false);
        return;
      }

      // Extract owner data (could be string ID or populated object)
      const owner = typeof unit.owner === 'object' ? unit.owner : null;
      
      if (!owner || !owner.firstName) {
        // Owner is just an ID, try to fetch member data by unitId
        try {
          const memberResponse = await getMembersApi({ 
            unitId, 
            limit: 1 
          });
          
          if (memberResponse.data && memberResponse.data.length > 0) {
            setMember(memberResponse.data[0]);
            setActiveTab('owner');
            return;
          }
        } catch (memberError: any) {
          console.warn('Member API error:', memberError);
        }
        
        setMember(null);
        showMessage('Owner information not available', 'info');
        return;
      }

      // We have populated owner data, create member object from it
      const memberData: Member = {
        id: owner._id,
        owner: {
          firstName: owner.firstName || '',
          lastName: owner.lastName || '',
          email: owner.email || '',
          countryCode: owner.countryCode || '+91',
          mobileNumber: owner.mobileNumber || '',
          dateOfBirth: owner.dateOfBirth || undefined,
          gender: owner.gender || undefined,
          occupation: owner.occupation || undefined,
          address: owner.address || undefined,
          aadharNumber: owner.aadharNumber || undefined,
          panNumber: owner.panNumber || undefined,
          unitId: unit._id,
          blockId: typeof unit.block === 'object' ? unit.block?._id : unit.block || undefined,
          buildingId: undefined, // Can be added if needed
        },
        familyMembers: owner.familyMembers || [],
        vehicles: owner.vehicles || [],
        status: owner.status,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      };

      // Try to fetch additional member data (family, vehicles) if member API exists
      try {
        const memberResponse = await getMembersApi({ 
          unitId, 
          limit: 1 
        });
        
        if (memberResponse.data && memberResponse.data.length > 0) {
          // Merge member API data with unit owner data
          const apiMember = memberResponse.data[0];
          memberData.familyMembers = apiMember.familyMembers || memberData.familyMembers;
          memberData.vehicles = apiMember.vehicles || memberData.vehicles;
          // Use API member data if it has more complete owner info
          if (apiMember.owner) {
            memberData.owner = { ...memberData.owner, ...apiMember.owner };
          }
        }
      } catch (memberError: any) {
        // It's okay if member API doesn't exist or fails
        // We'll use the unit owner data we already have
        console.warn('Member API not available, using unit owner data:', memberError);
      }

      setMember(memberData);
      setActiveTab('owner');
      
    } catch (error: any) {
      console.error('Error fetching member:', error);
      showMessage('Failed to fetch member details', 'error');
      setMember(null);
    } finally {
      setLoadingMember(false);
    }
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlock(e.target.value);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-black mb-2">Members</h1>
          <p className="text-base text-primary-black/50">
            View member details by selecting a block and unit
          </p>
        </div>

        {/* Block and Unit Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Block Dropdown */}
            <div>
              <label htmlFor="block-select" className="block text-sm font-medium text-gray-700 mb-2">
                <IconBuilding className="w-4 h-4 inline mr-2" />
                Select Block
              </label>
              <select
                id="block-select"
                value={selectedBlock}
                onChange={handleBlockChange}
                disabled={loadingBlocks}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent bg-white"
              >
                <option value="">-- Select Block --</option>
                {blocks.map((block) => (
                  <option key={block._id} value={block._id}>
                    {block.name}
                  </option>
                ))}
              </select>
              {loadingBlocks && (
                <p className="mt-1 text-sm text-gray-500">Loading blocks...</p>
              )}
            </div>

            {/* Unit Dropdown */}
            <div>
              <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-2">
                <IconHome className="w-4 h-4 inline mr-2" />
                Select Unit
              </label>
              <select
                id="unit-select"
                value={selectedUnit}
                onChange={handleUnitChange}
                disabled={!selectedBlock || loadingUnits}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Unit --</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitNumber} {unit.unitType ? `(${unit.unitType})` : ''}
                  </option>
                ))}
              </select>
              {loadingUnits && (
                <p className="mt-1 text-sm text-gray-500">Loading units...</p>
              )}
              {!selectedBlock && (
                <p className="mt-1 text-sm text-gray-500">Please select a block first</p>
              )}
              {selectedBlock && units.length === 0 && !loadingUnits && (
                <p className="mt-1 text-sm text-gray-500">No active units found in this block</p>
              )}
            </div>
          </div>
        </div>

        {/* Member Details */}
        {loadingMember && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading member details...</p>
          </div>
        )}

        {!loadingMember && !member && selectedUnit && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <IconUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">No member found</p>
            <p className="text-sm text-gray-500">
              This unit does not have any member assigned yet.
            </p>
          </div>
        )}

        {!loadingMember && member && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                      </label>
                      <p className="text-base text-primary-black font-medium">
                        {member.owner.firstName}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                      </label>
                      <p className="text-base text-primary-black font-medium">
                        {member.owner.lastName || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email Address
                      </label>
                      <p className="text-base text-primary-black font-medium">
                        {member.owner.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Mobile Number
                      </label>
                      <p className="text-base text-primary-black font-medium">
                        {member.owner.countryCode} {member.owner.mobileNumber}
                      </p>
                    </div>

                    {member.owner.dateOfBirth && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Date of Birth
                        </label>
                        <p className="text-base text-primary-black font-medium">
                          {new Date(member.owner.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {member.owner.gender && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Gender
                        </label>
                        <p className="text-base text-primary-black font-medium capitalize">
                          {member.owner.gender}
                        </p>
                      </div>
                    )}

                    {member.owner.occupation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Occupation
                        </label>
                        <p className="text-base text-primary-black font-medium">
                          {member.owner.occupation}
                        </p>
                      </div>
                    )}

                    {member.owner.aadharNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Aadhar Number
                        </label>
                        <p className="text-base text-primary-black font-medium">
                          {member.owner.aadharNumber}
                        </p>
                      </div>
                    )}

                    {member.owner.panNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          PAN Number
                        </label>
                        <p className="text-base text-primary-black font-medium">
                          {member.owner.panNumber}
                        </p>
                      </div>
                    )}

                    {member.owner.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Address
                        </label>
                        <p className="text-base text-primary-black font-medium">
                          {member.owner.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Family Details Tab */}
              <TabsContent value="family" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-black mb-4">Family Members</h3>
                  {!member.familyMembers || member.familyMembers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <IconUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No family members added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {member.familyMembers.map((familyMember: FamilyMember, index: number) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <h4 className="text-md font-semibold text-primary-black mb-4">
                            Family Member {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                First Name
                              </label>
                              <p className="text-base text-primary-black font-medium">
                                {familyMember.firstName}
                              </p>
                            </div>

                            {familyMember.lastName && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Last Name
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {familyMember.lastName}
                                </p>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Relationship
                              </label>
                              <p className="text-base text-primary-black font-medium capitalize">
                                {familyMember.relationship}
                              </p>
                            </div>

                            {familyMember.age && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Age
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {familyMember.age}
                                </p>
                              </div>
                            )}

                            {familyMember.gender && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Gender
                                </label>
                                <p className="text-base text-primary-black font-medium capitalize">
                                  {familyMember.gender}
                                </p>
                              </div>
                            )}

                            {familyMember.email && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Email
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {familyMember.email}
                                </p>
                              </div>
                            )}

                            {(familyMember.mobileNumber || familyMember.countryCode) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Mobile Number
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {familyMember.countryCode || ''} {familyMember.mobileNumber || '-'}
                                </p>
                              </div>
                            )}
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
                  <h3 className="text-lg font-semibold text-primary-black mb-4">Vehicles</h3>
                  {!member.vehicles || member.vehicles.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <IconCar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No vehicles added</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {member.vehicles.map((vehicle: VehicleDetails, index: number) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <h4 className="text-md font-semibold text-primary-black mb-4">
                            Vehicle {index + 1}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Vehicle Number
                              </label>
                              <p className="text-base text-primary-black font-medium">
                                {vehicle.vehicleNumber}
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Vehicle Type
                              </label>
                              <p className="text-base text-primary-black font-medium capitalize">
                                {vehicle.vehicleType}
                              </p>
                            </div>

                            {vehicle.manufacturer && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Manufacturer
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {vehicle.manufacturer}
                                </p>
                              </div>
                            )}

                            {vehicle.model && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Model
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {vehicle.model}
                                </p>
                              </div>
                            )}

                            {vehicle.color && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Color
                                </label>
                                <p className="text-base text-primary-black font-medium capitalize">
                                  {vehicle.color}
                                </p>
                              </div>
                            )}

                            {vehicle.registrationDate && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Registration Date
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {new Date(vehicle.registrationDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}

                            {vehicle.insuranceExpiryDate && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Insurance Expiry Date
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}

                            {vehicle.parkingSlotNumber && (
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                  Parking Slot Number
                                </label>
                                <p className="text-base text-primary-black font-medium">
                                  {vehicle.parkingSlotNumber}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!selectedUnit && !loadingMember && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <IconUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">Select a Unit</p>
            <p className="text-sm text-gray-500">
              Please select a block and unit to view member details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
