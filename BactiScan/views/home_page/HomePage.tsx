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
import chooseFile from '../gallery_page/ImagePicker';
import captureImage from '../gallery_page/ImagePicker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
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

  const captureImage = async type => {
    let options = {
      mediaType: type,
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 1,
      videoQuality: 'low',
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: true,
    };
    // let isCameraPermitted = await requestCameraPermission();
    // let isStoragePermitted = await requestExternalWritePermission();
    launchCamera(options, _response => {
      let response = _response.assets[0];
      console.log('Response = ', response);

      if (response.didCancel) {
        console.warn('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        console.warn('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        console.warn('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        console.warn(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      let path = response.uri.replace('file://', '');
      navigation.navigate('MediaPage', {
        path: path,
        type: type,
      });
      // setFilePath(response);
    });
  };

  const chooseFile = type => {
    let options = {
      mediaType: type,
      // maxWidth: 300,
      // maxHeight: 550,
      quality: 1,
    };
    launchImageLibrary(options, _response => {
      let response = _response['assets'][0];
      console.log('Response = ', response);

      if (response.didCancel) {
        console.warn('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        console.warn('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        console.warn('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        console.warn(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      // console.log('height -> ', response.height);
      // console.log('fileSize -> ', response.fileSize);
      // console.log('type -> ', response.type);
      // console.log('fileName -> ', response.fileName);
      // convert file uri to path like
      // file:///var/mobile/Containers/Data/Application/DA1C05C7-CC9E-4C66-A888-7B6B457F36E3/tmp/44C0D87F-3CD0-4D64-B994-A2B0B5EF5C5F.jpg to
      // ${RNFS.TemporaryDirectoryPath}44C0D87F-3CD0-4D64-B994-A2B0B5EF5C5F.jpg
      let path = response.uri.replace('file://', '');

      navigation.navigate('MediaPage', {
        path: path,
        type: type,
      });
      // setFilePath(response);
    });
  };

  const loadSavedData = async () => {
    try {
      const imagesDirPath = 'images';
      const imageDirs = await RNFS.readDir(
        `${RNFS.DocumentDirectoryPath}/${imagesDirPath}`,
      );

      const newData = await Promise.all(
        imageDirs.map(async imageDir => {
          console.warn(`imageDir.path: ${imageDir.path}`);
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
        <ScanList data={scanData} />
        {/*<CustomWebView />*/}
      </View>
      <View style={commonStyles.bottomBar}>
        <View style={commonStyles.buttonContainerBorder}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              style={commonStyles.iconButton}
              // onPress={goToCamera}>
              onPress={() => captureImage('photo')}>
              <IonIcon name="camera-outline" size={32} />
            </TouchableOpacity>
            <View style={commonStyles.separator} />
            <TouchableOpacity
              style={commonStyles.iconButton}
              // onPress={goToGallery}>
              onPress={() => chooseFile('photo')}>
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
