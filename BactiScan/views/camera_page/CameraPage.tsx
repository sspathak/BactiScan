import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
  Camera: undefined;
};

type CameraPageNavigationProp = NavigationProp<RootStackParamList, 'Camera'>;

const CameraPage = () => {
  const navigation = useNavigation<CameraPageNavigationProp>();
  const backToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={backToHome}>
          <Image
            source={require('../../assets/home-icon.png')}
            style={commonStyles.iconImage}
          />
        </TouchableOpacity>
        <Text style={commonStyles.title}>New Scan</Text>
        <View style={commonStyles.emptyBox}></View>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

export default CameraPage;
