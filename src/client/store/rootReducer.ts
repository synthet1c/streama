import { combineReducers } from '@reduxjs/toolkit';
import { reducer as notificationReducer } from '../slices/notification';
import { reducer as chatReducer } from '../slices/chat';

const rootReducer = combineReducers({
  notifications: notificationReducer,
  chat: chatReducer,
});

export default rootReducer;
