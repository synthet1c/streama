import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { IUserDTO } from '../../shared/IUserDTO';

interface IProps {
  user: IUserDTO;
}

export const User: React.FunctionComponent<IProps> = ({ user }) => (
  <Card>
    <CardHeader title={user.name} />
    <CardContent>
      <Typography>email: {user.email}</Typography>
      <Typography>login: {user.login}</Typography>
    </CardContent>
  </Card>
);
