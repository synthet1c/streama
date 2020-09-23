import React, { Component } from 'react';
import { Grid, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import { WebRTCContext } from '../providers/WebRTC';

export default class RTCChat extends Component {

  static contextType = WebRTCContext;

  state = {
    message: '',
    messages: []
  }

  componentDidMount() {
    this.context.subscribe(message => {
      console.log('webrtc:message', message)
    })
    // this.sendMessage('Sup RCT boi')
  }

  sendMessage = (event) => {
    this.context.sendMessage(this.state.message)
    this.setState(state => ({ ...state, message: '' }))
  }

  setMessage = (e) => {
    const value = e.currentTarget.value
    this.setState((state) => ({ ...state, message: value }))
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
                  <Button
                    onClick={this.sendMessage}
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
      </Grid>
    )
  }
}
