import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import React, { useState, useEffect } from 'react';
import { NavLink, Route } from 'react-router-dom';
import { IUserDTO } from '../../shared/IUserDTO';
import { loadUsersAPI } from '../utils/api-facade';
import { User } from './User';
import { Link } from '@material-ui/core';
// import Room from './Room';
import RTCChat from './RTCChat'
// import SinglePageChat from './SinglePageFunctionalChat';
// import SinglePageChat from './SinglePageChat';
import WebRTC2 from '../providers/WebRTC2';

interface IState {
  users: IUserDTO[];
  isLoading: boolean;
}

export default class UsersList extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      isLoading: true,
    };
  }

  public render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Users List' />
            <CardContent>
              <List>
                {this.state.users.map((user) => (
                  <ListItem key={user.login}>
                    <Link to={`/account/users/${user.login}`} component={NavLink}>
                      {user.name}
                    </Link>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          {/*<SinglePageChat/>*/}
          <WebRTC2 />
        </Grid>
        <Grid item xs={12}>
          <RTCChat />
        </Grid>
        <Grid item xs={12}>
          <Route
            exact
            path='/account/users/:login'
            render={(props) => <User user={this.getUserById(props.match.params.login)} />}
          />
        </Grid>
      </>
    );
  }

  public async componentDidMount() {
    const users = await loadUsersAPI();
    // @ts-ignore
    this.setState({ users: users.data, isLoading: false });
  }

  private getUserById(login) {
    return this.state.users.find((u) => u.login === login);
  }
}
