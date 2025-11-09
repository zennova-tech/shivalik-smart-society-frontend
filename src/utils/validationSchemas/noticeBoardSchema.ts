import * as Yup from 'yup';

export const noticeBoardSchema = Yup.object().shape({
  noticeNumber: Yup.string()
    .optional()
    .trim(),
  title: Yup.string()
    .required('Title is required')
    .trim()
    .test('no-whitespace', 'Title cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  category: Yup.string()
    .required('Category is required')
    .oneOf(['general', 'maintenance', 'security', 'event', 'other'], 'Please select a valid category'),
  blockId: Yup.string()
    .required('Block is required'),
  unitId: Yup.string()
    .required('Unit is required'),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Please select a valid priority'),
  publishDate: Yup.string()
    .required('Publish Date is required'),
  expiryDate: Yup.string()
    .required('Expiry Date is required')
    .test('is-after-publish', 'Expiry Date must be after Publish Date', function (value) {
      const { publishDate } = this.parent;
      if (!publishDate || !value) return true;
      return new Date(value) >= new Date(publishDate);
    }),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['draft', 'published', 'expired', 'archived'], 'Please select a valid status'),
});

