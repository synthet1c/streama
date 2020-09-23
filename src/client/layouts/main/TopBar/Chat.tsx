import React, {
  useRef,
  useState,
  useEffect, useLayoutEffect,
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
  Paper, RootRef,
} from '@material-ui/core';
import {
  Bell as BellIcon,
  Package as PackageIcon,
  MessageCircle as MessageIcon,
  Truck as TruckIcon,
} from 'react-feather';
import { theme } from 'theme';
import { useDispatch, useSelector } from '../../../store';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';

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
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  top: {
    flex: '1 1 auto',
    height: 10,
    overflowY: 'scroll',
    overflowX: 'hidden',
    paddingRight: 17,
    boxSizing: 'content-box',


  },
  list: {},
  input: {},
}));

export interface IMessage {
  id: string
  createdAt: number
  content: string
  user: string
}

export interface MessagesProps {
  messages: IMessage[]
}

const Messages: FC = () => {
  const classes = useStyles();
  const { messages } = useSelector((state) => state.chat);
  const ref = useRef<any>(null);
  let scrollRef = useRef<any>(null)
  const dispatch = useDispatch();

  // useLayoutEffect(() => {
  //   scrollBar.current.updateScroll()
  // })

  // useEffect(() => {
  //   const scrollMessagesToBottom = () => {
  //     if (scrollRef.current) {
  //       scrollRef.current.updateScroll()
  //       scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight;
  //     }
  //   };

  //   scrollMessagesToBottom();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [messages]);

  useEffect(() => {
    scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])


  return (
    <Box p={1} className={classes.container}>
      <section ref={scrollRef}>
        <Box className={classes.top}>
          <List dense={false}>
            {messages.map((message) => {
              return (
                <ListItem
                  component={RouterLink}
                  divider
                  key={message.id}
                  to="#"
                >
                  <ListItemAvatar>
                    <Avatar
                      className={classes.icon}
                    >
                      <SvgIcon fontSize="small">
                        <MessageIcon />
                      </SvgIcon>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={message.user}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'textPrimary' }}
                    secondary={message.content}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </section>
      <Box className={classes.input}>
        <Paper>
          <TextField fullWidth label="Say Something" />
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
    </Box>
  );
};

export default Messages;
