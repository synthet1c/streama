import { AppBar, Grid, makeStyles, TextField, Toolbar, Typography } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import React, { useContext } from 'react';
import { UserContext } from '../context/User';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
  }),
);
export const Header: React.FunctionComponent = () => {
  const classes = useStyles({});
  const user = useContext(UserContext)

  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Typography variant='h6' noWrap>
            Test Fullstack TypeScript
          </Typography>
          <form>
            <div>
              <TextField label="Login" name="login">Login</TextField>
            </div>
          </form>
        </Grid>

      </Toolbar>
    </AppBar>
  );
};
