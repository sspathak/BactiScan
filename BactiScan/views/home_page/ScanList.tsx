import React from 'react';
import {Text, ScrollView, View} from 'react-native';
import {FlatList} from 'react-native';
import ScanListItem from './ScanListItem';


interface ScanListProps {
  default_scan_list_data: boolean;
}

const ScanList = ({data}) => {
  return (
    <FlatList
      data={data}
      renderItem={({item}) => (
        <ScanListItem thumbnail={item.thumbnail} metadata={item.metadata} />
      )}
      keyExtractor={item => item.id}
      // Add sorting and other list configuration as needed
    />
  );
};

export default ScanList;
