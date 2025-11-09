import * as Yup from 'yup';

// Family Member Schema
export const familyMemberSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .trim()
    .min(2, 'First Name must be at least 2 characters'),
  lastName: Yup.string()
    .trim()
    .optional(),
  relationship: Yup.string()
    .required('Relationship is required')
    .trim(),
  age: Yup.number()
    .positive('Age must be positive')
    .integer('Age must be an integer')
    .optional(),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .optional(),
  email: Yup.string()
    .email('Please enter a valid email address')
    .optional(),
  mobileNumber: Yup.string()
    .trim()
    .matches(/^[0-9]{10,15}$/, 'Please enter a valid mobile number (10-15 digits)')
    .optional(),
  countryCode: Yup.string()
    .trim()
    .matches(/^\+?[1-9]\d{0,3}$/, 'Please enter a valid country code')
    .optional(),
});

// Owner Details Schema
export const ownerDetailsSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .trim()
    .min(2, 'First Name must be at least 2 characters'),
  lastName: Yup.string()
    .trim()
    .optional(),
  email: Yup.string()
    .required('Email Address is required')
    .trim()
    .email('Please enter a valid email address'),
  countryCode: Yup.string()
    .required('Country Code is required')
    .trim()
    .matches(/^\+?[1-9]\d{0,3}$/, 'Please enter a valid country code (e.g., +91, +1, 91)'),
  mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .trim()
    .matches(/^[0-9]{10,15}$/, 'Please enter a valid mobile number (10-15 digits)'),
  dateOfBirth: Yup.string()
    .optional(),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .optional(),
  occupation: Yup.string()
    .trim()
    .optional(),
  address: Yup.string()
    .trim()
    .optional(),
  aadharNumber: Yup.string()
    .trim()
    .matches(/^\d{12}$/, 'Aadhar number must be 12 digits')
    .optional(),
  panNumber: Yup.string()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN number must be in format: ABCDE1234F')
    .optional(),
  unitId: Yup.string()
    .trim()
    .optional(),
  blockId: Yup.string()
    .trim()
    .optional(),
  buildingId: Yup.string()
    .trim()
    .optional(),
});

// Vehicle Details Schema
export const vehicleDetailsSchema = Yup.object().shape({
  vehicleNumber: Yup.string()
    .required('Vehicle Number is required')
    .trim()
    .min(2, 'Vehicle Number must be at least 2 characters'),
  vehicleType: Yup.string()
    .required('Vehicle Type is required')
    .trim()
    .oneOf(['car', 'bike', 'scooter', 'cycle', 'other'], 'Invalid vehicle type'),
  manufacturer: Yup.string()
    .trim()
    .optional(),
  model: Yup.string()
    .trim()
    .optional(),
  color: Yup.string()
    .trim()
    .optional(),
  registrationDate: Yup.string()
    .optional(),
  insuranceExpiryDate: Yup.string()
    .optional(),
  parkingSlotNumber: Yup.string()
    .trim()
    .optional(),
});

// Main Member Schema
export const memberSchema = Yup.object().shape({
  owner: ownerDetailsSchema,
  familyMembers: Yup.array()
    .of(familyMemberSchema)
    .optional(),
  vehicles: Yup.array()
    .of(vehicleDetailsSchema)
    .optional(),
});

