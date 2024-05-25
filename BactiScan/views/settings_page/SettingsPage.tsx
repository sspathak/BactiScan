import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import IonIcon from "react-native-vector-icons/Ionicons";


type Props = NavigationProp<
  Routes,
  'Settings'
>;

const SettingsPage = () => {
  const navigation = useNavigation<Props>();

  const goToHome = () => {
    navigation.navigate('Home');
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToHome}>
          {/*<Image*/}
          {/*  source={require('../../assets/home-icon.png')}*/}
          {/*  style={commonStyles.iconImage}*/}
          {/*/>*/}
          <IonIcon name="home-outline" size={32} style={{paddingRight: 10}} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Settings</Text>
        <View style={commonStyles.emptyBox}></View>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

export default SettingsPage;
