import * as Yup from 'yup';

export const societySchema = Yup.object().shape({
  projectId: Yup.string()
    .trim()
    .optional(),
  name: Yup.string()
    .required('Society Name is required')
    .trim()
    .min(2, 'Society Name must be at least 2 characters')
    .test('no-whitespace', 'Society Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  territory: Yup.string()
    .trim()
    .optional(),
  address: Yup.string()
    .trim()
    .optional(),
  manager: Yup.object().shape({
    firstName: Yup.string()
      .required('First Name is required')
      .trim()
      .min(2, 'First Name must be at least 2 characters'),
    lastName: Yup.string()
      .trim()
      .optional(),
    countryCode: Yup.string()
      .required('Country Code is required')
      .trim()
      .matches(/^\+?[1-9]\d{0,3}$/, 'Please enter a valid country code (e.g., +91, +1, 91)'),
    mobileNumber: Yup.string()
      .required('Mobile Number is required')
      .trim()
      .matches(/^[0-9]{10,15}$/, 'Please enter a valid mobile number (10-15 digits)'),
    email: Yup.string()
      .required('Email Address is required')
      .trim()
      .email('Please enter a valid email address'),
  }),
});

