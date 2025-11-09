import * as Yup from 'yup';

export const amenitiesSchema = Yup.object().shape({
  amenityName: Yup.string()
    .required('Amenity Name is required')
    .trim()
    .min(2, 'Amenity Name must be at least 2 characters')
    .max(200, 'Amenity Name must be at most 200 characters')
    .test('no-whitespace', 'Amenity Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  description: Yup.string()
    .optional()
    .trim(),
  capacity: Yup.number()
    .required('Capacity is required')
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .typeError('Capacity must be a number'),
  amenityType: Yup.string()
    .required('Amenity Type is required')
    .oneOf(['free', 'paid'], 'Amenity type must be either free or paid'),
  bookingType: Yup.string()
    .required('Booking Type is required')
    .oneOf(['one_time', 'slot_based', 'recurring'], 'Booking type must be one_time, slot_based, or recurring'),
  bookingSlots: Yup.array()
    .of(
      Yup.object().shape({
        startTime: Yup.string().required('Start time is required'),
        endTime: Yup.string().required('End time is required'),
        capacity: Yup.number().optional().min(1, 'Slot capacity must be at least 1'),
      })
    )
    .when('bookingType', {
      is: 'slot_based',
      then: (schema) => schema.min(1, 'At least one booking slot is required for slot-based bookings'),
      otherwise: (schema) => schema.optional(),
    }),
  advanceBookingDays: Yup.number()
    .when(['amenityType', 'bookingType'], {
      is: (amenityType: string, bookingType: string) => 
        amenityType === 'paid' || bookingType === 'slot_based' || bookingType === 'recurring',
      then: (schema) => 
        schema
          .required('Advance Booking Days is required')
          .integer('Advance Booking Days must be a whole number')
          .min(0, 'Advance Booking Days cannot be negative')
          .typeError('Advance Booking Days must be a number'),
      otherwise: (schema) => 
        schema
          .optional()
          .integer('Advance Booking Days must be a whole number')
          .min(0, 'Advance Booking Days cannot be negative')
          .default(0),
    }),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['available', 'unavailable', 'archived'], 'Status must be available, unavailable, or archived'),
});
