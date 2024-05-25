import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
};

type FilterPageNavigationProp = NavigationProp<RootStackParamList, 'Filter'>;

const FilterPage = () => {
  const navigation = useNavigation<FilterPageNavigationProp>();

  const backToSearch = () => {
    navigation.navigate('Search');
  };
  const applyToSearch = () => {
    navigation.navigate('Search');
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={backToSearch}>
          {/*<Image*/}
          {/*  source={require('../../assets/search-icon.png')}*/}
          {/*  style={styles.iconImage}*/}
          {/*/>*/}
          <Text>Cancel</Text>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Filter</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={applyToSearch}>
          {/*<Image*/}
          {/*  source={require('../../assets/search-icon.png')}*/}
          {/*  style={styles.iconImage}*/}
          {/*/>*/}
          <Text>Apply</Text>
        </TouchableOpacity>
        {/*<View style={styles.emptyBox}></View>*/}
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

export default FilterPage;
