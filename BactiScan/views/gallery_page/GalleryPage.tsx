import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import IonIcon from "react-native-vector-icons/Ionicons";

type Props = NavigationProp<Routes, 'Gallery'>;

const GalleryPage = () => {
  const navigation = useNavigation<Props>();
  const rejectGalleryImage = () => {
    // todo - add logic to reject image
    navigation.navigate('Home');
  };
  const acceptGalleryImage = () => {
    // todo - add logic to accept image
    navigation.navigate('Home');
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={rejectGalleryImage}>
          {/*<Image*/}
          {/*  source={require('../../assets/cross-icon.png')}*/}
          {/*  style={commonStyles.iconImage}*/}
          {/*/>*/}
          <IonIcon name="checkmark-outline" size={32}></IonIcon>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Add from Gallery</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={acceptGalleryImage}>
          {/*<Image*/}
          {/*  source={require('../../assets/check-icon.png')}*/}
          {/*  style={commonStyles.iconImage}*/}
          {/*/>*/}
          <IonIcon name="close-outline" size={32} style={{paddingRight : 10}}></IonIcon>

        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

export default GalleryPage;
