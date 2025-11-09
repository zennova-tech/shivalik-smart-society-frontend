import { useState } from 'react';
import { IconUser, IconMail, IconPhone, IconCalendar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FamilyMember } from '@/types/MemberTypes';

interface FamilyMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  member?: FamilyMember;
  memberIndex?: number;
}

const relationshipOptions = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Other', label: 'Other' },
];

export const FamilyMemberModal = ({
  open,
  onClose,
  onSave,
  member,
  memberIndex,
}: FamilyMemberModalProps) => {
  const [formData, setFormData] = useState<FamilyMember>({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    relationship: member?.relationship || '',
    age: member?.age || undefined,
    gender: member?.gender || '',
    email: member?.email || '',
    mobileNumber: member?.mobileNumber || '',
    countryCode: member?.countryCode || '+91',
  });

  const handleChange = (field: keyof FamilyMember, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    handleChange('gender', gender);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.relationship) {
      return;
    }
    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      relationship: '',
      age: undefined,
      gender: '',
      email: '',
      mobileNumber: '',
      countryCode: '+91',
    });
    onClose();
  };

  const isFormValid = formData.firstName.trim() !== '' && formData.relationship !== '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-primary-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {member ? 'Edit Family Member' : 'Add Family Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter First Name"
                className="pl-10"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter Last Name"
                className="pl-10"
              />
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Select Relationship</option>
              {relationshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <div className="relative">
              <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="number"
                min="0"
                max="120"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter Age"
                className="pl-10"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleGenderSelect('Male')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  formData.gender === 'Male'
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
                  formData.gender === 'Female'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="mr-2">♀</span> Female
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter Email ID"
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No.</label>
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
                <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="tel"
                  value={formData.mobileNumber || ''}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid} className="bg-black text-white hover:bg-gray-800">
              {member ? 'Update Member' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

