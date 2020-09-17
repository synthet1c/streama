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
  email: string
  login: string
  open: boolean
}

export class UserCreate extends React.Component<any, IState> {

  state = {
    name: 'foonta',
    email: '',
    login: '',
    open: false,
    message: 'Please enter a new user'
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
              <form noValidate autoComplete="off" onSubmit={this.createUser}>
                <div>
                  <TextField label="Name" value={this.state.name} name='name' onChange={this.handleInputChange} />
                </div>
                <div>
                  <TextField label="Email" value={this.state.email} name='email' onChange={this.handleInputChange} />
                </div>
                <div>
                  <TextField label="Login" value={this.state.login} name='login' onChange={this.handleInputChange} />
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

  createUser = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/user/create', {
        name: this.state.name,
        email: this.state.email,
        login: this.state.login,
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
