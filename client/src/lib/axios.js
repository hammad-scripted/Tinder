import axios from 'axios';


//TODO update the base url to the production url
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, //? include cookies in requests
});
