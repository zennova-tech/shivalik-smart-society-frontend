import * as Yup from 'yup';

// Floors validation schema
export const floorsSchema = Yup.object().shape({
  floorNumber: Yup.number()
    .required('Floor Number is required')
    .integer('Floor Number must be a whole number')
    .min(0, 'Floor Number cannot be negative')
    .typeError('Floor Number must be a number'),
  floorName: Yup.string()
    .required('Floor Name is required')
    .trim()
    .max(200, 'Floor Name must be less than 200 characters')
    .test('no-whitespace', 'Floor Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  blockId: Yup.string()
    .required('Block is required')
    .trim(),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive'),
});

