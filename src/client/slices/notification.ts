import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from 'store';
import axios from 'axios';
import type { Notification } from '../types/notification';
import { Message } from '../types/message';
import { ChatState } from './chat';

export interface NotificationsState {
  notifications: Notification[];
  messages: Message[]
};

const initialState: NotificationsState = {
  notifications: [],
  messages: [],
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    getNotifications(state: NotificationsState, action: PayloadAction<{ data: Notification[]; }>) {
      const { data: notifications } = action.payload;

      state.notifications = notifications;
    },
  }
});

export const { reducer } = slice;

export const getNotifications = (): AppThunk => async (dispatch) => {
  const response = await axios.get<{ data: Notification[] }>('/api/notifications');

  dispatch(slice.actions.getNotifications(response.data));
};

export default slice;
