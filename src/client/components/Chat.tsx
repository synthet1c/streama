import { Drawer, makeStyles } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import Notifications from '../layouts/main/TopBar/Chat';

const drawerWidth = 350;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      overflow: 'hidden'
    },
    drawerPaper: {
      width: drawerWidth,
      left: 'auto',
      right: 0
    },
    toolbar: theme.mixins.toolbar,
  }),
);

export const Chat: React.FunctionComponent = () => {
  const classes = useStyles({});
  return (
    <Drawer
      className={classes.drawer}
      anchor="right"
      variant='permanent'
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      {/*<div className={classes.toolbar} />*/}
      <Notifications/>
    </Drawer>
  );
};
