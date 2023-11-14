import React, {useContext, useEffect, useState} from 'react';
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
// import chooseFile from '../gallery_page/ImagePicker';
// import captureImage from '../gallery_page/ImagePicker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AppContext from '../AppContext';
import { BACTISCAN_ROOT, DEFAULT_FOLDER_NAME } from '../../Constants';
type Props = NavigationProp<Routes, 'Home'>;
const HomePage = () => {
  const navigation = useNavigation<Props>();
  const [scanData, setScanData] = useState([]);
  const appCtx = useContext(AppContext);
  console.log("appCtx: ", appCtx)
  const [selectedFolderName, setSelectedFolderName] = appCtx['folderSelect'];

  appCtx.scanData = scanData;
  appCtx.setScanData = setScanData;
  
  // if (!appCtx.selectedFolderName) {
  //   console.log("setting selectedFolderName to " + DEFAULT_FOLDER_NAME)
  //   appCtx.selectedFolderName = selectedFolderName;
  //   appCtx.setSelectedFolderName = setSelectedFolderName;
  // }
  
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      console.log("USEEFFECT loading saved data from : ", selectedFolderName, "...")
      loadSavedData(selectedFolderName)
        .then(r => console.log('loadSavedData result:', r))
        .catch(e => console.log('loadSavedData error:', e));
    }
  }, [isFocused, selectedFolderName]);
  // useEffect(() => {
  //   console.log("USEEFFECT loading saved data from : ", appCtx.selectedFolderName, "...")
  //   loadSavedData(appCtx.selectedFolderName)
  //     .then(r => console.log('loadSavedData result:', r))
  //     .catch(e => console.log('loadSavedData error:', e));
    
  // }, [appCtx.selectedFolderName]);
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
    await launchCamera(options, _response => {
      if (_response.didCancel) {
        return;
      }
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
        destination_folder: selectedFolderName,
      });
      // setFilePath(response);
    });
  };
  const goToMicroscope = () => {
    console.log('goToMicroscope');
    navigation.navigate('Microscope', {
      destination_folder: selectedFolderName,
    });
  };
  const chooseFile = async (type: string) => {
    let options = {
      mediaType: type,
      // maxWidth: 300,
      // maxHeight: 550,
      quality: 1,
    };
    await launchImageLibrary(options, _response => {
      if (_response.didCancel) {
        return;
      }
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
      let path = response.uri.replace('file://', '');
      navigation.navigate('MediaPage', {
        path: path,
        type: type,
        destination_folder: selectedFolderName,
      });
      // setFilePath(response);
    });
  };

  // input is the absolute path to the folder containing the images
  const loadSavedData = async (folder_name: string = 'images') => {
    const folder_path = `${BACTISCAN_ROOT}/${folder_name}`;
    try {
      const imageDirs = await RNFS.readDir(
        folder_path,
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
              title: metadata.title
                ? metadata.title
                : `Scan ${metadata.timestamp}`,
              // Get date from timestamp
              date: new Date(metadata.timestamp).toLocaleDateString(),
              // Get time from timestamp
              time: new Date(metadata.timestamp).toLocaleTimeString(),
              id: metadata.timestamp,
              particle_count: metadata.particle_count
                ? metadata.particle_count
                : 'Unknown',
            },
          };
          return img_data;
        }),
      );
      console.log('newData:', newData);
      appCtx.setScanData(newData);
      console.log("DONE running loadSavedData")
      // setScanData(newData);
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
  const goToFolders = () => {
    navigation.navigate('FoldersPage');
  }
  const test_toggle_folder = () => { // this function is for testing and debugging purposes only
    console.log("test_toggle_folder called")
    console.log("appCTX in test_toggle_folder: ", appCtx)
    if (selectedFolderName === 'Collection1') {
      console.log("setting selectedFolderName to images")
      setSelectedFolderName('images');
    } else {
      setSelectedFolderName('Collection1');
    }
    console.log("final selectedFolderName: ", selectedFolderName)
  }
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={{...commonStyles.iconButton}}
          onPress={goToFolders}>
          <IonIcon name="folder-outline" size={32} />
        </TouchableOpacity>
        {/* <View style={{...commonStyles.iconButton, width: 32, height: 32}} /> */}
        {/* <Text style={commonStyles.title}>BactiScan</Text> */}
        <Text style={commonStyles.title}>{selectedFolderName}</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToSearch}>
          <IonIcon name="search-outline" size={32} />
        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/* Render the list of scan items here */}
        {appCtx.scanData.length === 0 && (
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 50,
              alignItems: 'center',
            }}>
            <Text style={{color: '#888888'}}>Added scans will appear here</Text>
          </View>
        )}
        <ScanList data={appCtx.scanData} />
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
            <View style={commonStyles.separator} />
            <TouchableOpacity
              style={commonStyles.iconButton}
              // onPress={goToGallery}>
              onPress={() => goToMicroscope()}>
              <IonIcon
                name="scan-circle-outline"
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