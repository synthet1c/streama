import { CssBaseline, makeStyles } from '@material-ui/core';
import { createStyles, Theme, ThemeProvider } from '@material-ui/core/styles';
import React, { lazy } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
// import { Chat } from './components/Chat';
import { Home } from './components/Home';
import { Usage } from './components/Usage';
import { LazyLoadingExample } from './components/LazyLoadingExample';
import { RouterExample } from './components/RouterExample';
import { StyledComponentsExample } from './components/StyledComponentsExample';
import UsersList from './components/UsersList';
import { UserCreate } from './components/UserCreate';
import { WebTorrentRoute } from './components/WebTorrent';
import { user, UserContext } from './context/User';
import { theme } from './theme';
import { Account } from './views/Account';
import { renderRoutes } from './utils/renderRoutes';
import MainLayout from './layouts/MainLayout';
import store from './store';
import { Provider } from 'react-redux';
import WebSocketProvider from './providers/WebSocket';
import WebRTCProvider from './providers/WebRTC';
// import WebRTCProvider from './providers/WebRTCFC2';
// import WebRTCProvider from './providers/NewWebRTC';

// const WebRTCProvider = React.Fragment

import VideoMessage from './utils/DataMessage'

const message = new VideoMessage({
  type: 'message',
  message: 'hello',
  data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
  created: Date.now(),
  id: 44444444,
})

const buffer = message.getBuffer()
const parsed = VideoMessage.parseBuffer(buffer)

console.log({
  message,
  buffer,
  parsed,
})


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      overflow: 'hidden',
    },
    main: {
      flexGrow: 1,
      padding: theme.spacing(3),
      overflow: 'hidden',
    },
    toolbar: theme.mixins.toolbar,
  }),
);


export const App = () => {
  const classes = useStyles({});

  return (
    <Provider store={store}>
      <WebSocketProvider>
        <WebRTCProvider>
          <UserContext.Provider value={user}>
            <ThemeProvider theme={theme}>
              <BrowserRouter>
                <div className={classes.root}>
                  <CssBaseline />
                  <Header />
                  <SideMenu />
                  <main className={classes.main}>
                    <div className={classes.toolbar} />
                    <Switch>
                      {renderRoutes([
                        {
                          path: '/',
                          component: Home,
                          exact: true,
                        },
                        {
                          path: '/usage',
                          component: Usage,
                          exact: true,
                        },
                        {
                          path: '/account',
                          layout: MainLayout,
                          routes: [
                            {
                              path: '/account',
                              component: Account,
                              exact: true,
                            },
                            {
                              path: '/account/users',
                              component: UsersList,
                            },
                            {
                              path: '/account/create-user',
                              component: UserCreate,
                            },
                          ],
                        },
                        {
                          path: '/create-user',
                          component: UserCreate,
                          exact: true,
                        },

                        {
                          path: '/lazy-example',
                          component: LazyLoadingExample,
                          exact: true,
                        },
                        {
                          path: '/styled-example',
                          component: StyledComponentsExample,
                          exact: true,
                        },
                        {
                          path: '/router-example/:slug',
                          component: RouterExample,
                          exact: true,
                        },
                        {
                          path: '/webtorrent',
                          component: WebTorrentRoute,
                          exact: true,
                        },
                      ])}
                    </Switch>
                  </main>
                  {/*<Chat />*/}
                </div>
              </BrowserRouter>
            </ThemeProvider>
          </UserContext.Provider>
        </WebRTCProvider>
      </WebSocketProvider>
    </Provider>
  );
};

