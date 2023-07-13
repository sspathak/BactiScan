import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import ScanList from './ScanList';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import IonIcon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import {useIsFocused} from '@react-navigation/core';
import CustomWebView from '../imagej_webview/CustomWebView';
// import MyInlineWeb from './CustomWebview';

type Props = NavigationProp<Routes, 'Home'>;

const HomePage = () => {
  const navigation = useNavigation<Props>();
  const [scanData, setScanData] = useState([]);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      loadSavedData();
    }
  }, [isFocused]);

  // RNFS.writeFile(
  //   `${RNFS.DocumentDirectoryPath}/test.txt`,
  //   'Lorem ipsum dolor sit amet',
  //   'utf8',
  // ).then(r => console.log('writeFile result:', r));

  const loadSavedData = async () => {
    try {
      const imagesDirPath = `images`;
      const imageDirs = await RNFS.readDir(
        `${RNFS.DocumentDirectoryPath}/${imagesDirPath}`,
      );

      const newData = await Promise.all(
        imageDirs.map(async imageDir => {
          console.warn(`imageDir.path: ${imageDir.path}`)
          const metadataPath = `${imageDir.path}/metadata.json`;
          const metadataContents = await RNFS.readFile(metadataPath);
          const metadata = JSON.parse(metadataContents);

          return {
            thumbnail: {uri: `${imageDir.path}/${metadata.path}`},
            metadata: {
              title: `Scan ${metadata.timestamp}`,
              date: '2021-11-01',
              time: '12:00',
            },
          };
        }),
      );

      setScanData(newData);
    } catch (error) {
      console.log('Failed to load saved data:', error);
    }
  };

  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  const goToSearch = () => {
    navigation.navigate('Search');
  };

  const goToCamera = () => {
    navigation.navigate('Camera');
  };

  const goToGallery = () => {
    navigation.navigate('Gallery');
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.iconButton}
          onPress={goToSettings}>
          <IonIcon name="settings-outline" size={32} />
        </TouchableOpacity>
        <Text style={commonStyles.title}>BactiScan</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToSearch}>
          <IonIcon name="search-outline" size={32} />
        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        {/*<ScanList data={scanData} />*/}
        <CustomWebView />
      </View>
      <View style={commonStyles.bottomBar}>
        <View style={commonStyles.buttonContainerBorder}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              style={commonStyles.iconButton}
              onPress={goToCamera}>
              <IonIcon name="camera-outline" size={32} />
            </TouchableOpacity>
            <View style={commonStyles.separator} />
            <TouchableOpacity
              style={commonStyles.iconButton}
              onPress={goToGallery}>
              <IonIcon
                name="image-outline"
                size={32}
                style={{paddingRight: 10}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
