import { environment } from '../../../environments/environment.development';

const serverIp = environment.apiUrl

export const API = {
  auth: (login: string) => `${serverIp}/users/${login}`,
	registration: `${serverIp}/users`,
	notices: `${serverIp}/notices`,
  uploads: `${serverIp}/uploads`,
}
