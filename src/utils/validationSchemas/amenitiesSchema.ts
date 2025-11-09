import * as Yup from 'yup';

export const amenitiesSchema = Yup.object().shape({
  amenityName: Yup.string()
    .required('Amenity Name is required')
    .trim()
    .test('no-whitespace', 'Amenity Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  description: Yup.string()
    .required('Description is required')
    .trim()
    .test('no-whitespace', 'Description cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  capacity: Yup.number()
    .required('Capacity is required')
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .typeError('Capacity must be a number'),
  amenityType: Yup.string()
    .required('Amenity Type is required')
    .oneOf(['Free', 'Paid'], 'Please select a valid amenity type'),
  bookingType: Yup.string()
    .required('Booking Type is required')
    .oneOf(['One Time Booking', 'Recurring Booking'], 'Please select a valid booking type'),
  bookingSlots: Yup.array()
    .of(
      Yup.object().shape({
        startTime: Yup.string().required('Start time is required'),
        endTime: Yup.string().required('End time is required'),
      })
    )
    .min(1, 'At least one booking slot is required'),
  advanceBookingDays: Yup.number()
    .required('Advance Booking Days is required')
    .integer('Advance Booking Days must be a whole number')
    .min(0, 'Advance Booking Days cannot be negative')
    .typeError('Advance Booking Days must be a number'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Maintenance', 'Available', 'Unavailable'], 'Please select a valid status'),
  photo: Yup.mixed().optional(),
});

