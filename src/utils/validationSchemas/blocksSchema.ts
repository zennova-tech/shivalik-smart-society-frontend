import * as Yup from 'yup';

// Blocks validation schema
export const blocksSchema = Yup.object().shape({
  blockName: Yup.string()
    .required('Block Name is required')
    .trim()
    .max(200, 'Block Name must be at most 200 characters')
    .test('no-whitespace', 'Block Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive'], 'Please select a valid status'),
  building: Yup.string()
    .trim()
    .optional(),
  // Description is kept for UI purposes but won't be sent to backend
  description: Yup.string()
    .trim()
    .notRequired(),
});

