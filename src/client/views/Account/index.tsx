import React, { FC, useState } from 'react';
import {
  Box,
  Container,
  Divider,
  Tab,
  Tabs,
  makeStyles,
  Typography,
  Card,
  CardHeader,
  CardContent, Avatar, AppBar,
} from '@material-ui/core';
import Page from '../../components/Page';
import Header from './Header';
import Grid from '@material-ui/core/Grid';
import {
  TabPanel,
  TabContext,
  TabList,
} from '@material-ui/lab';


export const Account: FC = () => {

  const [tab, setTab] = useState('1');

  const handleChange = (e, value) => setTab(value);

  return (
    <Page title='Account'>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Account'>
            <Avatar alt="Remy Sharp" src="/assets/images/logo.png" />
          </CardHeader>
          <CardContent>
            <TabContext value={tab}>
              <TabList onChange={handleChange} aria-label="simple tabs example">
                <Tab label="Account Details" value="1" />
                <Tab label="Contact Details" value="2" />
                <Tab label="Subscribers" value="3" />
              </TabList>
              <TabPanel value="1">
                <Typography>This is some text</Typography>
              </TabPanel>
              <TabPanel value="2">
                <Typography>
                  Item Two
                </Typography>
              </TabPanel>
              <TabPanel value="3">
                <Typography>
                  Item Three
                </Typography>
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </Grid>
    </Page>
  );
};
