import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Camera, Paperclip, UserPlus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  updateRegistrationFormData,
  registerUser,
  resetRegistrationStatus,
  addFamilyMember,
  removeFamilyMember,
  updateFamilyMember,
} from '@/store/slices/registrationSlice';
import { showMessage } from '@/utils/Constant';
import { FamilyMemberModal } from './FamilyMemberModal';
import { FamilyMember } from '@/types/MemberTypes';

export const RegistrationFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const { registrationData, status, error } = useSelector((state: any) => state.registration);
  
  const familyMembers = registrationData.familyMembers || [];

  useEffect(() => {
    // Redirect if required fields are missing
    if (!registrationData.type || !registrationData.societyId || !registrationData.blockId || !registrationData.unitId) {
      navigate('/user/register/type');
    }
  }, [registrationData, navigate]);

  useEffect(() => {
    if (status === 'success') {
      showMessage('Registration successful!', 'success');
      navigate('/login');
      dispatch(resetRegistrationStatus());
    } else if (status === 'failed' && error) {
      showMessage(error, 'error');
    }
  }, [status, error, navigate, dispatch]);

  const handleInputChange = (field: string, value: any) => {
    dispatch(
      updateRegistrationFormData({
        [field]: value,
      })
    );
  };

  const handleFileChange = (field: 'profilePicture' | 'ownershipProof', file: File | null) => {
    if (file) {
      handleInputChange(field, file);
      if (field === 'profilePicture') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleGenderSelect = (gender: string) => {
    handleInputChange('gender', gender);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log registration data for debugging (can be removed in production)
    console.log('Submitting registration with data:', {
      ...registrationData,
      familyMembersCount: familyMembers.length,
      familyMembers: familyMembers,
    });
    
    // Dispatch registration - all data including family members will be sent in single API call
    dispatch(registerUser());
  };

  const handleOpenFamilyModal = () => {
    setEditingMemberIndex(null);
    setEditingMember(undefined);
    setIsFamilyModalOpen(true);
    // Scroll to top to ensure modal is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseFamilyModal = () => {
    setIsFamilyModalOpen(false);
    setEditingMemberIndex(null);
    setEditingMember(undefined);
  };

  const handleSaveFamilyMember = (member: FamilyMember) => {
    if (editingMemberIndex !== null) {
      dispatch(updateFamilyMember({ index: editingMemberIndex, member }));
    } else {
      dispatch(addFamilyMember(member));
    }
    handleCloseFamilyModal();
  };

  const handleEditFamilyMember = (index: number) => {
    setEditingMemberIndex(index);
    setEditingMember(familyMembers[index]);
    setIsFamilyModalOpen(true);
  };

  const handleRemoveFamilyMember = (index: number) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      dispatch(removeFamilyMember(index));
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 pb-6 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/user/register/unit')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800"
              >
                <Camera className="h-4 w-4 text-white" />
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange('profilePicture', e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-full"
              disabled
            >
              {registrationData.type}
            </Button>
          </div>

          {/* Flat/Apartment Number (Read-only, from selection) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flat/Apartment Number
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                value={`${registrationData.blockName}-${registrationData.unitNumber}` || ''}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
          </div>

          {/* Fill Up Your Details */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fill Up Your Details</h2>
            
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    required
                    value={registrationData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter First Name"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    required
                    value={registrationData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter Last Name"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter Email ID"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile No. *
                </label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <Input
                      type="text"
                      value="(IN) +91"
                      disabled
                      className="bg-gray-50 text-center text-sm"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="tel"
                      required
                      value={registrationData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      placeholder="Enter Mobile Number"
                      className="pl-10"
                    />
                  </div>
                  <Button type="button" variant="outline" size="icon" disabled>
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleGenderSelect('Male')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      registrationData.gender === 'Male'
                        ? 'border-black bg-gray-100'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="mr-2">♂</span> Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderSelect('Female')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      registrationData.gender === 'Female'
                        ? 'border-black bg-gray-100'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="mr-2">♀</span> Female
                  </button>
                </div>
              </div>

              {/* Attach Ownership Proof */}
              {registrationData.type === 'Owner' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Paperclip className="inline h-4 w-4 mr-2" />
                    Attach Ownership Proof
                  </label>
                  <label className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange('ownershipProof', e.target.files?.[0] || null)}
                    />
                    <Paperclip className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {registrationData.ownershipProof ? 'File selected' : 'Choose file'}
                    </span>
                  </label>
                </div>
              )}

              {/* Add Family Member */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserPlus className="inline h-4 w-4 mr-2" />
                  Family Members
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleOpenFamilyModal}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>

                {/* Display Added Family Members */}
                {familyMembers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {familyMembers.map((member: FamilyMember, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {member.firstName} {member.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.relationship}
                            {member.age && ` • Age: ${member.age}`}
                            {member.gender && ` • ${member.gender}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFamilyMember(index)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFamilyMember(index)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Register Button - Prominent and always visible */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={status === 'loading' || !registrationData.firstName || !registrationData.mobileNumber}
              className="w-full h-14 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                'REGISTER'
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              {familyMembers.length > 0 
                ? `You have ${familyMembers.length} family member${familyMembers.length > 1 ? 's' : ''} added. All data will be saved together.`
                : 'You can add family members before registering.'}
            </p>
          </div>
        </form>

        {/* Family Member Modal */}
        <FamilyMemberModal
          open={isFamilyModalOpen}
          onClose={handleCloseFamilyModal}
          onSave={handleSaveFamilyMember}
          member={editingMember}
          memberIndex={editingMemberIndex || undefined}
        />
      </div>
    </div>
  );
};

