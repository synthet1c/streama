import { Grid, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import VideoStream from './VideoStream';

import React from 'react';
import { WebTorrent } from 'webtorrent';
import io, { Socket } from 'socket.io-client';
import SendIcon from '@material-ui/icons/Send';

interface iWebTorrentState {
  messages: iSocketMessage[]
  message: string
}

interface iSocketMessage {
  message?: string
}

export class WebTorrentRoute extends React.Component {
  state: iWebTorrentState = {
    messages: [
      { message: 'this is a test' },
      { message: 'this is another test' },
    ],
    message: '',
  };
  socket: Socket;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.socket = io('http://localhost:3000');

    window.addEventListener('fetch', (e: Event) => {
      console.log('fetch', e);
    });

    fetch('https://fonts.googleapis.com/css?family=Roboto:300,400,500').then(result => result.blob()).then(console.log.bind(console, 'fetchcall'));

    this.socket.on('connect', (...args) => {
      console.log('connected', ...args);
      this.socket.emit('message', { message: 'Hello!' });
    });

    this.socket.on('message', (data: any) => {
      console.log('io:message', data);
      this.setState({ messages: this.state.messages.concat(data) });
    });

  }

  sendMessage = (e) => {
    console.log('sendMessage', e);
    this.socket.emit('message', { message: this.state.message });
    this.setState({ ...this.state, message: '' });
  };

  setMessage = (e) => {
    this.setState({
      ...this.state,
      message: e.target.value,
    });
  };

  renderMessages() {
    return this.state.messages.map((message: iSocketMessage, i: Number) =>
      <ListItem key={`message-${i}`} value={this.state.message}>{message.message}</ListItem>,
    );
  }

  render() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Card>
            <CardHeader title='WebTorrent' />
            <CardContent>
              <Grid>
                <Grid item>
                  <Typography>WebTorrent connection</Typography>
                </Grid>
                <Grid item>
                  <Input type="text" onChange={this.setMessage} value={this.state.message} />
                </Grid>
                <Grid item>
                  <Button onClick={this.sendMessage}
                          variant='outlined'
                          color='primary'
                          startIcon={<SendIcon />}>
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardHeader title='Messages' />
            <CardContent>
              {/*<VideoStream />*/}
              <List>
                {this.renderMessages()}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    );
  }
}
