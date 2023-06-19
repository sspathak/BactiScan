import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
};

type FilterPageNavigationProp = NavigationProp<RootStackParamList, 'Filter'>;

const FilterPage = () => {
  const navigation = useNavigation<FilterPageNavigationProp>();

  const goToSearch = () => {
    navigation.navigate('Search');
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={goToSearch}>
          <Image
            source={require('../../assets/search-icon.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Filter</Text>
        <View style={styles.emptyBox}></View>
      </View>
      <View style={styles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    // marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  buttonContainer: {
    backgroundColor: 'lightgray',
    borderRadius: 40,
    padding: 5,
    // marginLeft: 10,
    flexDirection: 'row',
  },
  buttonContainerBorder: {
    backgroundColor: 'black',
    borderRadius: 40,
    padding: 2,
    flexDirection: 'row',
  },
  separator: {
    width: 2,
    backgroundColor: 'black',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  iconImage: {
    height: 40,
    width: 40,
  },
  emptyBox: {
    height: 40,
    width: 40,
  },
});

export default FilterPage;
