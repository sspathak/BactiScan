/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
import AppContext from './views/AppContext';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomePage from './views/home_page/HomePage';
import SettingsPage from './views/settings_page/SettingsPage';
import SearchPage from './views/search_page/SearchPage';
import FilterPage from './views/search_page/FilterPage';
// import ScanPage from './views/scan_page/ScanPage';
import MediaPage from './views/camera_page/MediaPage';
import CameraPage from './views/camera_page/CameraPage';
import ImagePicker from './views/gallery_page/ImagePicker';
import GalleryPage from './views/gallery_page/GalleryPage';
import {verticalAnimation} from './views/CommonStyles';
import {Routes} from './views/Routes';
import ScanViewer from './views/scan_viewer/ScanViewer';
import MicroscopePage from "./views/microscope_page/MicroscopePage";

// const fs = require('fs-extra')
const Stack = createStackNavigator<Routes>();
type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [global_lower_threshold, setGlobalLowerThreshold] = useState(150);
  const [global_upper_threshold, setGlobalUpperThreshold] = useState(255);
  const [global_lower_size, setGlobalLowerSize] = useState(20);
  const [global_upper_size, setGlobalUpperSize] = useState(100000);
  const [global_lower_bandpass, setGlobalLowerBandpass] = useState(0);
  const [global_upper_bandpass, setGlobalUpperBandpass] = useState(5);
  const particle_count_params = {
    global_lower_threshold: global_lower_threshold,
    global_upper_threshold: global_upper_threshold,
    global_lower_size: global_lower_size,
    global_upper_size: global_upper_size,
    global_lower_bandpass: global_lower_bandpass,
    global_upper_bandpass: global_upper_bandpass,
    setGlobalLowerSize: setGlobalLowerSize,
    setGlobalUpperSize: setGlobalUpperSize,
    setGlobalLowerThreshold: setGlobalLowerThreshold,
    setGlobalUpperThreshold: setGlobalUpperThreshold,
    setGlobalLowerBandpass: setGlobalLowerBandpass,
    setGlobalUpperBandpass: setGlobalUpperBandpass,
  };
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // const navigation = useNavigation();

  return (
    <AppContext.Provider value={particle_count_params}>
      <NavigationContainer>
        <StatusBar barStyle={'dark-content'} translucent={true} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="Settings" component={SettingsPage} />
          <Stack.Screen name="Search" component={SearchPage} />
          <Stack.Screen
            name="Filter"
            component={FilterPage}
            options={verticalAnimation}
          />
          {/*<Stack.Screen name="Scan" component={ScanPage} />*/}
          <Stack.Screen
            name="Camera"
            component={CameraPage}
            options={verticalAnimation}
          />
          <Stack.Screen
            name="Gallery"
            component={ImagePicker}
            options={verticalAnimation}
          />
          <Stack.Screen name="MediaPage" component={MediaPage} />
          <Stack.Screen name="ScanViewer" component={ScanViewer} />
          <Stack.Screen name="Microscope" component={MicroscopePage} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  iconButton: {
    marginLeft: 10,
  },
  iconImage: {
    height: 40,
    width: 40,
  },
});

export default App;
