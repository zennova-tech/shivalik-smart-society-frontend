import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import otpSaga from './otpSaga';
import societySaga from './societySaga';
import buildingSaga from './buildingSaga';
import memberSaga from './memberSaga';
import registrationSaga from './registrationSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    otpSaga(),
    societySaga(),
    buildingSaga(),
    memberSaga(),
    registrationSaga(),
  ]);
}
