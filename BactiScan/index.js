/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'text-encoding-polyfill';
import {decode, encode} from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}
// import Joi from '@hapi/joi';
// import AppNavigator from './views/AppNavigator';

AppRegistry.registerComponent(appName, () => App);
