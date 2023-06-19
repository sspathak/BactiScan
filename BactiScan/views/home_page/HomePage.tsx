import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from './ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
};

type HomePageNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const HomePage = () => {
  const navigation = useNavigation<HomePageNavigationProp>();

  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  const goToSearch = () => {
    navigation.navigate('Search');
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToSettings}>
          <Image
            source={require('../../assets/settings-icon.png')}
            style={commonStyles.iconImage}
          />
        </TouchableOpacity>
        <Text style={commonStyles.title}>My Scans</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToSearch}>
          <Image
            source={require('../../assets/search-icon.png')}
            style={commonStyles.iconImage}
          />
        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
      <View style={commonStyles.bottomBar}>
        <View style={commonStyles.buttonContainerBorder}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity style={commonStyles.iconButton}>
              <Image
                source={require('../../assets/camera-icon.png')}
                style={commonStyles.iconImage}
              />
            </TouchableOpacity>
            <View style={commonStyles.separator} />
            <TouchableOpacity style={commonStyles.iconButton}>
              <Image
                source={require('../../assets/gallery-icon.png')}
                style={commonStyles.iconImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
