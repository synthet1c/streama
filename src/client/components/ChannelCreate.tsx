import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';

interface IState {
  name: string
  slug: string
  open: boolean
}

export class ChannelCreate extends React.Component<any, IState> {

  state = {
    name: '',
    slug: '',
    open: false,
    message: 'Please enter your channels details'
  };

  constructor(props) {
    super(props);
  }

  setOpen = open => {
    this.setState({
      open
    })
  }

  public render() {
    return (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Create new user' />
            <CardContent>
              <Collapse in={this.state.open}>
                <Box p={2}>
                  <Alert variant="outlined" severity="success" onClose={() => this.setOpen(false)}>{this.state.message}</Alert>
                </Box>
              </Collapse>
              <form noValidate autoComplete="off" onSubmit={this.createChannel}>
                <div>
                  <TextField label="Name" value={this.state.name} name='name' onChange={this.handleInputChange} />
                </div>
                <div>
                  <TextField label="Slug" value={this.state.slug} name='slug' onChange={this.handleInputChange} />
                </div>
                <div>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  handleInputChange = (e) => {
    const target = e.target
    const value = target.value
    const name = target.name
    this.setState((state) => ({
      ...state,
      [name]: value,
    }))
  }

  createChannel = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/channel/create', {
        name: this.state.name,
        slug: this.state.slug,
      })

      this.setState((state) => ({
        ...state,
        open: true,
        message: response.data.message,
      }))

    } catch (err) {
      console.dir(err.response.data)
    }

  }

  public async componentDidMount() {

  }
}
