import { AppBar, Avatar, Box, CardContent, Grid, makeStyles, TextField, Toolbar, Typography } from '@material-ui/core';
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
  const user = useContext(UserContext);

  return (
    <AppBar color='inherit' position='fixed' className={classes.appBar}>
      <Toolbar>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Box>
            <Avatar alt="Remy Sharp" src="/assets/images/logo.png" />
            <Typography variant='h6' noWrap>
              AYO
            </Typography>
          </Box>
          <form>
            <div>
              <TextField
                label="Login"
                name="login"
              >Login</TextField>
            </div>
          </form>
        </Grid>

      </Toolbar>
    </AppBar>
  );
};
