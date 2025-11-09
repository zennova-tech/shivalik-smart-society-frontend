import * as Yup from 'yup';

// Units validation schema
export const unitsSchema = Yup.object().shape({
  unitNumber: Yup.string()
    .required('Unit Number is required')
    .trim()
    .max(100, 'Unit Number must be at most 100 characters')
    .test('no-whitespace', 'Unit Number cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  blockId: Yup.string()
    .required('Block is required')
    .trim(),
  floorId: Yup.string()
    .required('Floor is required')
    .trim(),
  unitType: Yup.string()
    .trim()
    .max(100, 'Unit Type must be at most 100 characters')
    .oneOf(['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Villa', 'Shop', 'Office'], 'Please select a valid unit type')
    .optional(),
  areaSqFt: Yup.number()
    .min(0, 'Area cannot be negative')
    .typeError('Area must be a number')
    .optional(),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['vacant', 'occupied', 'blocked', 'maintenance'], 'Please select a valid status'),
});

