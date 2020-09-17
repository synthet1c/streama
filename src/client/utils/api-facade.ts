import axios from 'axios';
import { trace } from '../../shared/trace';
import { IUserDTO } from '../../shared/IUserDTO';

export function loadUsersAPI() {
  return axios.get(`/api/user/list`).then((res) => res.data as IUserDTO[]).then(trace('user/list'));
}
