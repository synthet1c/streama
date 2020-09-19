import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../types/message';
import { AppThunk } from '../store';

export interface ChatState {
  allMessages: Message[]
  messages: Message[]
}

const initialState: ChatState = {
  allMessages: [],
  messages: [],
}

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateChatLog(state: ChatState, action: any) {
      const { message } = action.payload
      state.allMessages.push(message)
      state.messages = [...state.allMessages].slice(-20)
    },
    resetChat(state: ChatState, action: PayloadAction<null>) {
      state.messages = []
    },
  }
})

export const reducer = slice.reducer

export const updateChatLog = (message: Message): AppThunk => async (dispatch) => {
  dispatch(slice.actions.updateChatLog({ message }))
}

export const resetChat = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.resetChat())
}

export default slice
