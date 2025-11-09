import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  IconBuilding, 
  IconMapPin, 
  IconPhone, 
  IconMail, 
  IconUsers,
  IconSearch,
  IconArrowRight,
  IconEye,
  IconEdit,
  IconHome,
  IconCalendar,
  IconCheck,
  IconPlus,
  IconX,
  IconUser,
  IconTrash
} from '@tabler/icons-react';
import { Society, AddSocietyPayload } from '@/types/SocietyTypes';
import { setToLocalStorage, getFromLocalStorage } from '@/utils/localstorage';
import { showMessage } from '@/utils/Constant';
import { societySchema } from '@/utils/validationSchemas/societySchema';
import { addSociety, resetAddSociety, getSocieties, resetGetSocieties, deleteSociety, resetDeleteSociety } from '@/store/slices/societySlice';
import { AppDispatch, RootState } from '@/store/store';

// Extended interface for additional details
interface SocietyDetails extends Society {
  totalUnits?: number;
  totalResidents?: number;
  totalBlocks?: number;
  establishedYear?: string;
  parkingSpaces?: number;
  amenities?: string[];
}

type SocietyFormData = Yup.InferType<typeof societySchema>;

const SocietyManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSociety, setSelectedSociety] = useState<SocietyDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentSelectedSociety, setCurrentSelectedSociety] = useState<Society | null>(null);
  const [projectOption, setProjectOption] = useState<'select' | 'create'>('select');
  const [projectId, setProjectId] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<Society | null>(null);

  // Get Redux state
  const { 
    societies, 
    status, 
    error 
  } = useSelector((state: RootState) => state.society);
  
  // Track if we're currently adding a society (to differentiate status)
  const [isAddingSociety, setIsAddingSociety] = useState(false);
  // Track if we're currently deleting a society (to differentiate status)
  const [isDeletingSociety, setIsDeletingSociety] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
      } = useForm<SocietyFormData>({
    resolver: yupResolver(societySchema),
    defaultValues: {
      projectId: '',
      name: '',
      territory: '',
      address: '',
      manager: {
        firstName: '',
        lastName: '',
        countryCode: '+91',
        mobileNumber: '',
        email: '',
      },
    },
  });

  useEffect(() => {
    document.title = 'Society Management - Smart Society';
    
    // Check if a society is already selected
    const storedSociety = getFromLocalStorage<Society>('selectedSociety');
    if (storedSociety) {
      setCurrentSelectedSociety(storedSociety);
    }

    // Fetch societies from API
    dispatch(getSocieties());
    
    // Cleanup on unmount
    return () => {
      dispatch(resetGetSocieties());
    };
  }, [dispatch]);

  // Handle add society success/error
  useEffect(() => {
    if (isAddingSociety) {
      if (status === 'complete') {
        showMessage('Society created successfully! Manager invitation sent.', 'success');
        setIsAddDialogOpen(false);
        reset();
        setProjectId('');
        setProjectOption('select');
        setIsAddingSociety(false);
        dispatch(resetAddSociety());
        // Refresh societies list after adding new society
        dispatch(getSocieties());
      } else if (status === 'failed') {
        showMessage(error || 'Failed to create society', 'error');
        setIsAddingSociety(false);
        dispatch(resetAddSociety());
      }
    }
  }, [status, error, isAddingSociety, dispatch, reset]);

  // Handle get societies error (only when not adding society)
  useEffect(() => {
    if (!isAddingSociety && status === 'failed' && societies.length === 0) {
      // Only show error if we're not in the middle of adding and have no societies
      // This avoids showing error messages during add society operations
    }
  }, [status, error, isAddingSociety, societies.length]);

  // Handle delete society success/error
  useEffect(() => {
    if (isDeletingSociety) {
      if (status === 'complete') {
        showMessage('Society deleted successfully', 'success');
        setIsDeleteDialogOpen(false);
        setSocietyToDelete(null);
        setIsDeletingSociety(false);
        dispatch(resetDeleteSociety());
        
        // Refresh societies list after deleting
        dispatch(getSocieties());
      } else if (status === 'failed') {
        showMessage(error || 'Failed to delete society', 'error');
        setIsDeletingSociety(false);
        dispatch(resetDeleteSociety());
      }
    }
  }, [status, error, isDeletingSociety, dispatch]);

  const handleSocietyClick = (society: Society) => {
    // Use data from API response
    const details: SocietyDetails = {
      ...society,
      totalUnits: society.unitsCount || 0,
      totalResidents: society.residentsCount || 0,
      totalBlocks: society.blocksCount || 0,
      establishedYear: society.estbYear ? String(society.estbYear) : undefined,
      parkingSpaces: society.parkingSpaces || 0,
      amenities: [], // Can be populated if backend provides amenities list
    };
    setSelectedSociety(details);
    setIsDetailDialogOpen(true);
  };

  const handleSelectSociety = (society: Society) => {
    // Save selected society to localStorage
    setToLocalStorage('selectedSociety', society);
    setCurrentSelectedSociety(society);
    
    // Dispatch custom event to notify other components (like sidebar)
    window.dispatchEvent(new Event('societySelected'));
    
    showMessage(`Selected society: ${society.name}`, 'success');
    setIsDetailDialogOpen(false);
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const handleAddNewSociety = () => {
    setIsAddDialogOpen(true);
    reset();
    setProjectId('');
    setProjectOption('select');
  };

  const onSubmitSociety = (data: SocietyFormData) => {
    // Prepare payload according to backend API structure
    // mobileNumber and countryCode are required to avoid MongoDB duplicate key error on null
    const payload: AddSocietyPayload = {
      name: data.name.trim(),
      territory: data.territory?.trim() || '',
      address: data.address?.trim() || '',
      manager: {
        firstName: data.manager.firstName.trim(),
        lastName: data.manager.lastName?.trim() || '',
        countryCode: data.manager.countryCode?.trim() || '+91',
        mobileNumber: data.manager.mobileNumber.trim(),
        email: data.manager.email.trim().toLowerCase(),
      },
    };

    // Add projectId if provided (and not creating new)
    if (projectOption === 'select' && projectId) {
      payload.projectId = projectId;
    }

    // Dispatch Redux action to create society
    setIsAddingSociety(true);
    dispatch(addSociety(payload));
  };

  const handleDeleteClick = (society: Society, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setSocietyToDelete(society);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (societyToDelete && societyToDelete.id) {
      const deletedSocietyId = societyToDelete.id;
      setIsDeletingSociety(true);
      dispatch(deleteSociety({ id: deletedSocietyId }));
      
      // If the deleted society was the currently selected one, clear it from localStorage
      if (currentSelectedSociety?.id === deletedSocietyId) {
        localStorage.removeItem('selectedSociety');
        setCurrentSelectedSociety(null);
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('societySelected'));
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSocietyToDelete(null);
  };

  const filteredSocieties = (societies || []).filter((society) =>
    society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.territory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    society.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-primary-background-color min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-black mb-2">Select a Society</h1>
        <p className="text-base text-primary-black/50">
          Choose a society to manage. You can switch societies at any time.
        </p>
      </div>

      {/* Search Bar and Add Button */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-between sm:items-center">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search societies by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleAddNewSociety}
            className="bg-primary-black text-white hover:bg-gray-800 whitespace-nowrap"
          >
            <IconPlus className="w-4 h-4 mr-2" />
            Add New Society
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Societies</p>
                <p className="text-2xl font-bold">{societies?.length || 0}</p>
              </div>
              <IconBuilding className="w-8 h-8 text-primary-black" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Displayed</p>
                <p className="text-2xl font-bold">{filteredSocieties.length}</p>
              </div>
              <IconEye className="w-8 h-8 text-primary-black" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cities</p>
                <p className="text-2xl font-bold">
                  {new Set((societies || []).map(s => s.city || s.territory).filter(Boolean)).size}
                </p>
              </div>
              <IconMapPin className="w-8 h-8 text-primary-black" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {status === 'loading' && !isAddingSociety && !isDeletingSociety && societies.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-gray-600 mb-2">Loading societies...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch the data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {status === 'failed' && !isAddingSociety && !isDeletingSociety && filteredSocieties.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <IconBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">Failed to load societies</p>
              <p className="text-sm text-gray-500 mb-4">{error || 'An error occurred while fetching societies'}</p>
              <Button
                onClick={() => dispatch(getSocieties())}
                className="bg-primary-black text-white hover:bg-gray-800"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Societies Grid */}
      {status !== 'loading' && !isAddingSociety && !isDeletingSociety && filteredSocieties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSocieties.map((society) => (
            <Card
              key={society.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border flex flex-col justify-between ${
                currentSelectedSociety?.id === society.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleSocietyClick(society)}
            >
              <div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-black flex items-center justify-center">
                        <IconBuilding className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-primary-black">
                          {society.name}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {society.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <IconMapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 line-clamp-2">
                          {society.address}
                        </span>
                      </div>
                    )}
                    {(society.city || society.state || society.pincode || society.territory) && (
                      <div className="flex items-center gap-2 text-sm">
                        <IconMapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600">
                          {society.city && society.state && society.pincode
                            ? `${society.city}, ${society.state} ${society.pincode}`
                            : society.territory || society.city || society.state || society.pincode || ''}
                        </span>
                      </div>
                    )}
                    {society.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <IconPhone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600">{society.contactNumber}</span>
                      </div>
                    )}
                    {society.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <IconMail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{society.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
              <CardFooter className="pt-0 mt-auto">
                {currentSelectedSociety && currentSelectedSociety.id && String(currentSelectedSociety.id) === String(society.id) ? (
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full bg-green-50 text-green-700 border-green-300 hover:bg-green-100 cursor-not-allowed"
                      disabled
                    >
                      <IconCheck className="w-4 h-4 mr-2" />
                      Currently Selected
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={(e) => handleDeleteClick(society, e)}
                      disabled={isDeletingSociety}
                    >
                      <IconTrash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      className="col-span-2 bg-primary-black text-white hover:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSociety(society);
                      }}
                    >
                      <IconCheck className="w-4 h-4 mr-2" />
                      Select Society
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSocietyClick(society);
                      }}
                    >
                      <IconEye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={(e) => handleDeleteClick(society, e)}
                      disabled={isDeletingSociety}
                    >
                      <IconTrash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : status !== 'loading' && status !== 'failed' && !isAddingSociety && !isDeletingSociety ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <IconBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">No societies found</p>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No societies available at the moment'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Society Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-primary-white">
          {selectedSociety && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2 ">
                  <div className="w-12 h-12 rounded-lg bg-primary-black flex items-center justify-center">
                    <IconBuilding className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedSociety.name}</DialogTitle>
                    <DialogDescription>
                      Complete details and information about the society
                    </DialogDescription>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <IconHome className="w-6 h-6 text-primary-black mx-auto mb-2" />
                        <p className="text-2xl font-bold">{selectedSociety.totalUnits || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Units</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <IconUsers className="w-6 h-6 text-primary-black mx-auto mb-2" />
                        <p className="text-2xl font-bold">{selectedSociety.totalResidents || 0}</p>
                        <p className="text-xs text-muted-foreground">Residents</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <IconBuilding className="w-6 h-6 text-primary-black mx-auto mb-2" />
                        <p className="text-2xl font-bold">{selectedSociety.totalBlocks || 0}</p>
                        <p className="text-xs text-muted-foreground">Blocks</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <IconBuilding className="w-6 h-6 text-primary-black mx-auto mb-2" />
                        <p className="text-2xl font-bold">{selectedSociety.parkingSpaces || 0}</p>
                        <p className="text-xs text-muted-foreground">Parking</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedSociety.address && (
                        <div className="flex items-start gap-3">
                          <IconMapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-base text-gray-900">{selectedSociety.address}</p>
                            {(selectedSociety.city || selectedSociety.state || selectedSociety.pincode || selectedSociety.territory) && (
                              <p className="text-base text-gray-900">
                                {selectedSociety.city && selectedSociety.state && selectedSociety.pincode
                                  ? `${selectedSociety.city}, ${selectedSociety.state} ${selectedSociety.pincode}`
                                  : selectedSociety.territory || selectedSociety.city || selectedSociety.state || selectedSociety.pincode || ''}
                              </p>
                            )}
                            {selectedSociety.country && (
                              <p className="text-base text-gray-900">{selectedSociety.country}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedSociety.contactNumber && (
                        <div className="flex items-start gap-3">
                          <IconPhone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-base text-gray-900">{selectedSociety.contactNumber}</p>
                          </div>
                        </div>
                      )}
                      {selectedSociety.email && (
                        <div className="flex items-start gap-3">
                          <IconMail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base text-gray-900">{selectedSociety.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Society Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Society Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedSociety.establishedYear && (
                          <div className="flex items-start gap-3">
                            <IconCalendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Established Year</p>
                              <p className="text-base text-gray-900">{selectedSociety.establishedYear}</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Units</p>
                            <p className="text-base text-gray-900">
                              {selectedSociety.totalUnits === 0 || !selectedSociety.totalUnits
                                ? '0 units'
                                : `${selectedSociety.totalUnits} ${selectedSociety.totalUnits === 1 ? 'unit' : 'units'}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Blocks</p>
                            <p className="text-base text-gray-900">
                              {selectedSociety.totalBlocks === 0 || !selectedSociety.totalBlocks
                                ? '0 blocks'
                                : `${selectedSociety.totalBlocks} ${selectedSociety.totalBlocks === 1 ? 'block' : 'blocks'}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Parking Spaces</p>
                            <p className="text-base text-gray-900">
                              {selectedSociety.parkingSpaces === 0 || !selectedSociety.parkingSpaces
                                ? '0 spaces'
                                : `${selectedSociety.parkingSpaces} ${selectedSociety.parkingSpaces === 1 ? 'space' : 'spaces'}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Residents</p>
                            <p className="text-base text-gray-900">
                              {selectedSociety.totalResidents === 0 || !selectedSociety.totalResidents
                                ? '0 residents'
                                : `${selectedSociety.totalResidents} ${selectedSociety.totalResidents === 1 ? 'resident' : 'residents'}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Amenities */}
                  {selectedSociety.amenities && selectedSociety.amenities.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedSociety.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    className="flex-[2] bg-primary-black text-white hover:bg-gray-800"
                    onClick={() => {
                      if (selectedSociety) {
                        handleSelectSociety(selectedSociety);
                      }
                    }}
                  >
                    <IconCheck className="w-4 h-4 mr-2" />
                    Select This Society
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    <IconX className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Society Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-primary-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary-black flex items-center justify-center">
                <IconBuilding className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl">Add New Society</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new society
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitSociety)} className="space-y-6 mt-4">
            {/* Project Selection */}
            <div>
              <h3 className="text-lg font-semibold text-primary-black mb-4">Project Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Option
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="projectOption"
                        value="select"
                        checked={projectOption === 'select'}
                        onChange={(e) => setProjectOption(e.target.value as 'select' | 'create')}
                        className="mr-2"
                      />
                      <span>Select Existing Project</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="projectOption"
                        value="create"
                        checked={projectOption === 'create'}
                        onChange={(e) => setProjectOption(e.target.value as 'select' | 'create')}
                        className="mr-2"
                      />
                      <span>Create New Project</span>
                    </label>
                  </div>
                </div>
                {projectOption === 'select' && (
                  <div className="md:col-span-2">
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      id="projectId"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                      placeholder="Enter project ID (optional)"
                    />
                  </div>
                )}
                {projectOption === 'create' && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Society will be created without a project association.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-primary-black mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Society Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Society Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                    placeholder="Enter society name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Territory */}
                <div>
                  <label htmlFor="territory" className="block text-sm font-medium text-gray-700 mb-1">
                    Territory
                  </label>
                  <input
                    type="text"
                    id="territory"
                    {...register('territory')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                    placeholder="Enter territory"
                  />
                  {errors.territory && (
                    <p className="mt-1 text-sm text-red-500">{errors.territory.message}</p>
                  )}
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    {...register('address')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent resize-y"
                    placeholder="Enter complete address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Society Admin Manager Information */}
            <div>
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <IconUser className="w-5 h-5" />
                Society Admin Manager
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="manager.firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="manager.firstName"
                    {...register('manager.firstName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                    placeholder="Enter first name"
                  />
                  {errors.manager?.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.manager.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="manager.lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="manager.lastName"
                    {...register('manager.lastName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                    placeholder="Enter last name"
                  />
                  {errors.manager?.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.manager.lastName.message}</p>
                  )}
                </div>

                {/* Country Code + Mobile Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Code + Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-32">
                      <input
                        type="text"
                        id="manager.countryCode"
                        {...register('manager.countryCode')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                        placeholder="+91"
                        required
                      />
                      {errors.manager?.countryCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.manager.countryCode.message}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="manager.mobileNumber"
                        {...register('manager.mobileNumber')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                        placeholder="9876543210"
                        required
                      />
                      {errors.manager?.mobileNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.manager.mobileNumber.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Required to avoid duplicate key errors in database</p>
                </div>

                {/* Email Address */}
                <div className="md:col-span-2">
                  <label htmlFor="manager.email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="manager.email"
                    {...register('manager.email')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent"
                    placeholder="manager@example.com"
                  />
                  {errors.manager?.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.manager.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                type="submit"
                className="flex-[2] bg-primary-black text-white hover:bg-gray-800"
                disabled={status === 'loading' && isAddingSociety}
              >
                {status === 'loading' && isAddingSociety ? (
                  <>Loading...</>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4 mr-2" />
                    Create Society & Manage Society
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
                  setProjectId('');
                  setProjectOption('select');
                  setIsAddingSociety(false);
                }}
                disabled={status === 'loading' && isAddingSociety}
              >
                <IconX className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open && !isDeletingSociety) {
          setSocietyToDelete(null);
        }
      }}>
        <DialogContent className="max-w-md bg-primary-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Delete Society</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this society? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {societyToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Society Name:</p>
                <p className="text-base font-semibold text-gray-900">{societyToDelete.name}</p>
                {societyToDelete.address && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Address:</p>
                    <p className="text-sm text-gray-600">{societyToDelete.address}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline"
              className="flex-1 bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
              onClick={handleConfirmDelete}
              disabled={status === 'loading' && isDeletingSociety}
            >
              {status === 'loading' && isDeletingSociety ? (
                <>Deleting...</>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleCancelDelete}
              disabled={status === 'loading' && isDeletingSociety}
            >
              <IconX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocietyManagement;
