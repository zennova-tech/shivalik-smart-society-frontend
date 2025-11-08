import * as Yup from 'yup';

export const parkingSchema = Yup.object().shape({
  parkingName: Yup.string()
    .required('Parking Name is required')
    .trim()
    .test('no-whitespace', 'Parking Name cannot be only whitespace', (value) =>
      value ? value.trim() !== '' : false
    ),
  bikeSlotMember: Yup.number()
    .required('Bike Slot for Member is required')
    .integer('Bike Slot for Member must be a whole number')
    .min(0, 'Bike Slot for Member cannot be negative')
    .typeError('Bike Slot for Member must be a number'),
  carSlotMember: Yup.number()
    .required('Car Slot for Member is required')
    .integer('Car Slot for Member must be a whole number')
    .min(0, 'Car Slot for Member cannot be negative')
    .typeError('Car Slot for Member must be a number'),
  bikeSlotVisitor: Yup.number()
    .required('Bike Slot for Visitor/Guest is required')
    .integer('Bike Slot for Visitor/Guest must be a whole number')
    .min(0, 'Bike Slot for Visitor/Guest cannot be negative')
    .typeError('Bike Slot for Visitor/Guest must be a number'),
  carSlotVisitor: Yup.number()
    .required('Car Slot for Visitor/Guest is required')
    .integer('Car Slot for Visitor/Guest must be a whole number')
    .min(0, 'Car Slot for Visitor/Guest cannot be negative')
    .typeError('Car Slot for Visitor/Guest must be a number'),
});

