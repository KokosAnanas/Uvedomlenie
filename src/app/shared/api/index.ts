import { environment } from '../../../environments/environment.development';


const serverIp = environment.apiUrl

export const API = {
  auth: (login: string) => `${serverIp}/users/${login}`,
	registration: `${serverIp}/users`,
	notices: `${serverIp}/notices`,
  uploads: `${serverIp}/uploads`,


	// notice: `${serverIp}/notice`,
	// config: `/config/config.json`,
  // nearestNotices: `${serverIp}/nearestNotices`,
  // countries: `${serverIp}/countries`,    // test mistake
  // countryByCode: 'https://restcountries.com/v3.1/alpha',
  // getWeather: 'https://api.open-meteo.com/v1/forecast',
  // order: `${serverIp}/order`,
  // orders: `${serverIp}/orders`,

}
