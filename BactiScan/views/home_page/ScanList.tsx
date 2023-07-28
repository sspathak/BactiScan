import React from 'react';
import {Text, ScrollView, View} from 'react-native';
import {FlatList} from 'react-native';
import ScanListItem from './ScanListItem';


interface ScanListProps {
  default_scan_list_data: boolean;
}

const ScanList = ({data}) => {
  console.log('ScanList data:', data)
  let sorted_data = data;
  if (data !== null) {
    sorted_data = data?.sort((a, b) => {
      a.metadata.id - b.metadata.id;
    });
  }
  return (
    <FlatList
      data={sorted_data}
      renderItem={({item}) => (
        <ScanListItem thumbnail={item.thumbnail} metadata={item.metadata} />
      )}
      keyExtractor={item => item.metadata.id}
      // Add sorting and other list configuration as needed
      // sort by ID in descending order


    />
  );
};

export default ScanList;
