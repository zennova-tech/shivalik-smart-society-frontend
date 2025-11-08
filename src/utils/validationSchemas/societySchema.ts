import * as Yup from 'yup';

export const societySchema = Yup.object().shape({
  name: Yup.string()
    .required('Society Name is required')
    .trim()
    .min(2, 'Society Name must be at least 2 characters')
    .test('no-whitespace', 'Society Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  address: Yup.string()
    .trim()
    .optional(),
  city: Yup.string()
    .trim()
    .optional(),
  state: Yup.string()
    .trim()
    .optional(),
  pincode: Yup.string()
    .trim()
    .matches(/^\d{6}$/, 'Pincode must be 6 digits')
    .optional(),
  country: Yup.string()
    .trim()
    .optional(),
  contactNumber: Yup.string()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid contact number')
    .optional(),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .optional(),
});

