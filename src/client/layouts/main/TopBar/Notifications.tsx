import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import type { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon,
  makeStyles,
  TextField,
  Paper,
} from '@material-ui/core';
import {
  Bell as BellIcon,
  Package as PackageIcon,
  MessageCircle as MessageIcon,
  Truck as TruckIcon,
} from 'react-feather';
import { theme } from 'theme';
import { useDispatch, useSelector } from '../../../store';
import { getNotifications } from '../../../slices/notification';

const iconsMap = {
  order_placed: PackageIcon,
  new_message: MessageIcon,
  item_shipped: TruckIcon,
};

const useStyles = makeStyles((theme) => ({
  popover: {
    width: 320,
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export interface INotification {
  id: string
  createdAt: number
  description: string
  title: string
  type: string
}

export interface NotificationProps {
  notifications: INotification[]
}

const Notifications: FC = () => {
  const classes = useStyles();
  const { notifications } = useSelector((state) => state.notifications);
  const ref = useRef<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  return (
    <Box p={1}>
      <List disablePadding>
        {notifications.map((notification) => {
          const Icon = iconsMap[notification.type];

          return (
            <ListItem
              component={RouterLink}
              divider
              key={notification.id}
              to="#"
            >
              <ListItemAvatar>
                <Avatar
                  className={classes.icon}
                >
                  <SvgIcon fontSize="small">
                    <Icon />
                  </SvgIcon>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                primaryTypographyProps={{ variant: 'subtitle2', color: 'textPrimary' }}
                secondary={notification.description}
              />
            </ListItem>
          );
        })}
      </List>
      <Paper>
        <TextField label="Say Something" />
      </Paper>
      <Box
        p={1}
        display="flex"
        justifyContent="center"
      >
        <Button
          component={RouterLink}
          size="small"
          to="#"
        >
          Mark all as read
        </Button>
      </Box>
    </Box>
  );
};

export default Notifications;
