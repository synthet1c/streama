import React, { FC, ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types'

interface IMainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: IMainLayoutProps): JSX.Element => {
  return (
    <main>
      {children}
    </main>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
}

export default MainLayout
