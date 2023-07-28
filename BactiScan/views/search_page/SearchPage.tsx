import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, TextInput, StyleSheet} from 'react-native';
import ScanList from '../home_page/ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import IonIcon from "react-native-vector-icons/Ionicons";
import AppContext from "../AppContext";
import {useIsFocused} from "@react-navigation/core";
import RNFS from "react-native-fs";

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
};

type SearchPageNavigationProp = NavigationProp<RootStackParamList, 'Search'>;

const SearchPage = () => {
  const navigation = useNavigation<SearchPageNavigationProp>();
  const scanItems = useContext(AppContext);
  const [searchString, setSearchString] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const isFocused = useIsFocused();
  const loadSavedData = async () => {
    try {
      const imagesDirPath = 'images';
      const imageDirs = await RNFS.readDir(
        `${RNFS.DocumentDirectoryPath}/${imagesDirPath}`,
      );
      // sort by path string
      imageDirs.sort((a, b) => {
        if (a.path > b.path) {
          return -1;
        }
        if (a.path < b.path) {
          return 1;
        }
        return 0;
      });

      const newData = await Promise.all(
        imageDirs.map(async imageDir => {
          console.log(`imageDir.path: ${imageDir.path}`);
          const metadataPath = `${imageDir.path}/metadata.json`;
          const metadataContents = await RNFS.readFile(metadataPath);
          const metadata = JSON.parse(metadataContents);
          const img_data = {
            thumbnail: {uri: `${imageDir.path}/${metadata.path}`},
            metadata: {
              // title: `Scan ${metadata.timestamp}`,
              title: metadata.title ? metadata.title : `Scan ${metadata.timestamp}`,
              // Get date from timestamp
              date: new Date(metadata.timestamp).toLocaleDateString(),
              // Get time from timestamp
              time: new Date(metadata.timestamp).toLocaleTimeString(),
              id: metadata.timestamp,
              particle_count: metadata.particle_count ? metadata.particle_count : 'Unknown'
            },
          };
          return img_data;
          // return {
          //   thumbnail: {uri: `${imageDir.path}/${metadata.path}`},
          //   metadata: {
          //     title: `Scan ${metadata.timestamp}`,
          //     date: '2021-11-01',
          //     time: '12:00',
          //     id: `${metadata.timestamp}`,
          //   },
          // };
        }),
      );
      console.log('newData:', newData);
      scanItems.setScanData(newData);
      // setScanData(newData);
      searchName(searchString);
    } catch (error) {
      console.log('Failed to load saved data:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadSavedData()
        .then(r => console.log('loadSavedData result:', r))
        .catch(e => console.log('loadSavedData error:', e));
    }
  }, [isFocused]);
  const handleTextInput = (text: string) => {
    setSearchString(text);
    searchName(text);
  };
  const goToHome = () => {
    navigation.navigate('Home');
  };
  const goToFilter = () => {
    // todo - navigate to filter page
    navigation.navigate('Filter');
  };

  const searchName = (ss: string) => {
    // iterate over all scanData and only return those items that have the entire searchString as a substring in the metadata title
    const _filteredData = scanItems.scanData.filter((item) => {
      // convert to lower before searching
      return item.metadata.title.toLowerCase().includes(ss.toLowerCase());
      // return item.metadata.title.includes(searchString);
    });
    setFilteredData(_filteredData);
  };
  useEffect(() => {
    searchName(searchString);
  }, [searchString]);

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToHome}>
          <IonIcon name="chevron-back-outline" size={32} style={{paddingRight : 10}}></IonIcon>
        </TouchableOpacity>
        <Text style={commonStyles.title}>Search</Text>
        {/*<TouchableOpacity style={commonStyles.iconButton} onPress={goToFilter}>*/}
        {/*  <IonIcon name="funnel-outline" size={32} style={{paddingRight : 10}}></IonIcon>*/}
        {/*</TouchableOpacity>*/}
        <View style={{width: 32, height: 32}} />
      </View>
      <View style={{display: 'flex', justifyContent: 'center', flexDirection:  'column', alignItems: 'center'}}>
        <TextInput
          style={styles.input}
          // onChangeText={setSearchString}
          placeholder={searchString}
          placeholderTextColor={'gray'}
          keyboardType="default"
          returnKeyType="done"
          returnKeyLabel="Next"
          value={searchString}
          // onSubmitEditing={(search_text) => searchName(search_text.nativeEvent.text)}
          // onChange={() => searchName()}
          onSubmitEditing={() => searchName(searchString)}
          onChangeText={handleTextInput}
        />
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        <ScanList data={filteredData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    width: '90%',
    borderRadius: 5,
  },
  parameterInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parameterInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  modalView: {
    flexDirection: 'column',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default SearchPage;
