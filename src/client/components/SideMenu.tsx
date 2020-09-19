import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import UsageIcon from '@material-ui/icons/Code';
import HomeIcon from '@material-ui/icons/Home';
import RouterIcon from '@material-ui/icons/Storage';
import FetchIcon from '@material-ui/icons/CloudDownload';
import StyledIcon from '@material-ui/icons/Style';
import LazyIcon from '@material-ui/icons/SystemUpdateAlt';
import React from 'react';
import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolbar: theme.mixins.toolbar,
  }),
);

export const SideMenu: React.FunctionComponent = () => {
  const classes = useStyles({});
  return (
    <Drawer
      className={classes.drawer}
      variant='permanent'
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.toolbar} />
      <List dense={true}>
        <ListItem button component={NavLink} to='/'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
        <ListItem button component={NavLink} to='/account'>
          <ListItemIcon>
            <UsageIcon />
          </ListItemIcon>
          <ListItemText primary='Account' />
        </ListItem>
        <ListItem button component={NavLink} to='/account/users'>
          <ListItemIcon>
            <FetchIcon />
          </ListItemIcon>
          <ListItemText primary='Users' />
        </ListItem>
        <ListItem button component={NavLink} to='/account/create-user'>
          <ListItemIcon>
            <RouterIcon />
          </ListItemIcon>
          <ListItemText primary='Create User' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={NavLink} to='/lazy-example'>
          <ListItemIcon>
            <LazyIcon />
          </ListItemIcon>
          <ListItemText primary='Lazy Loading' />
        </ListItem>
        <ListItem button component={NavLink} to='/styled-example'>
          <ListItemIcon>
            <StyledIcon />
          </ListItemIcon>
          <ListItemText primary='Styled Components' />
        </ListItem>
        <ListItem button component={NavLink} to='/router-example/1234'>
          <ListItemIcon>
            <RouterIcon />
          </ListItemIcon>
          <ListItemText primary='React-Router' />
        </ListItem>
        <ListItem button component={NavLink} to='/webtorrent'>
          <ListItemIcon>
            <RouterIcon />
          </ListItemIcon>
          <ListItemText primary='Web Torrent' />
        </ListItem>
      </List>
    </Drawer>
  );
};
