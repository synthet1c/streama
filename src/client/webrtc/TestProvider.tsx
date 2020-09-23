import React, { createContext } from 'react';

export const TestContext = createContext<any>(null)

const TestProvider = ({ children }) => {

  const subscribers = []

  const accessors = {
    subscribe: (fn) => {
      subscribers.push(fn)
    },
    trigger: (value: any) => {
      subscribers.forEach(fn => fn(value))
    }
  }

  return (
    <TestContext.Provider value={accessors}>
      {children}
    </TestContext.Provider>
  )

}

export default TestProvider
