
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authSlice from './slices/authSlice';
import otpSlice from './slices/otpSlice';
import societySlice from './slices/societySlice';
import buildingSlice from './slices/buildingSlice';
import memberSlice from './slices/memberSlice';
import registrationSlice from './slices/registrationSlice';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authSlice,
    otp: otpSlice,
    society: societySlice,
    building: buildingSlice,
    member: memberSlice,
    registration: registrationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
