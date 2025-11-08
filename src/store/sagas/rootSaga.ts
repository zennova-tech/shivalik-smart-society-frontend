import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import otpSaga from './otpSaga';
import societySaga from './societySaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    otpSaga(),
    societySaga(),
  ]);
}
