import { Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import React from 'react';
import { WebTorrent } from 'webtorrent';

export class WebTorrentRoute extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card>
        <CardHeader title='WebTorrent' />
        <CardContent>
          <Typography>WebTorrent connection</Typography>
        </CardContent>
      </Card>
    );
  }
}
