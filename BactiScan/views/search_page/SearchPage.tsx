import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import IonIcon from "react-native-vector-icons/Ionicons";

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
};

type SearchPageNavigationProp = NavigationProp<RootStackParamList, 'Search'>;

const SearchPage = () => {
  const navigation = useNavigation<SearchPageNavigationProp>();
  const goToHome = () => {
    navigation.navigate('Home');
  };
  const goToFilter = () => {
    // todo - navigate to filter page
    navigation.navigate('Filter');
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToHome}>
          {/*<Image*/}
          {/*  source={require('../../assets/left-icon.png')}*/}
          {/*  style={commonStyles.iconImage}*/}
          {/*/>*/}
          <IonIcon name="chevron-back-outline" size={32} style={{paddingRight : 10}}></IonIcon>

        </TouchableOpacity>
        <Text style={commonStyles.title}>Search</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToFilter}>
          {/*<Image*/}
          {/*  source={require('../../assets/filter-icon.png')}*/}
          {/*  style={commonStyles.iconImage}*/}
          {/*/>*/}
          <IonIcon name="funnel-outline" size={32} style={{paddingRight : 10}}></IonIcon>
        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

export default SearchPage;
