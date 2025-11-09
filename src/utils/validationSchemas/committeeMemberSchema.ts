import * as Yup from 'yup';

export const committeeMemberSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .trim()
    .max(150, 'First Name must be at most 150 characters')
    .min(2, 'First Name must be at least 2 characters'),
  
  lastName: Yup.string()
    .trim()
    .max(150, 'Last Name must be at most 150 characters')
    .optional(),
  
  countryCode: Yup.string()
    .trim()
    .matches(/^\+?[1-9]\d{0,3}$/, 'Please enter a valid country code (e.g., +91, +1, 91)')
    .optional()
    .default('+91'),
  
  mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .trim()
    .matches(/^[0-9]{10,15}$/, 'Please enter a valid mobile number (10-15 digits)'),
  
  email: Yup.string()
    .required('Email Address is required')
    .trim()
    .email('Please enter a valid email address')
    .lowercase(),
  
  memberType: Yup.string()
    .oneOf(['chairman', 'secretary', 'treasurer', 'member', 'other'], 'Invalid member type')
    .optional()
    .default('member'),
  
  society: Yup.string()
    .trim()
    .optional(),
  
  building: Yup.string()
    .trim()
    .optional(),
  
  block: Yup.string()
    .trim()
    .optional(),
  
  status: Yup.string()
    .oneOf(['active', 'inactive', 'resigned', 'archived'], 'Invalid status')
    .optional()
    .default('active'),
});

export type CommitteeMemberFormData = Yup.InferType<typeof committeeMemberSchema>;

