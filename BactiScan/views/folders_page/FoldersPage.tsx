// This file contains code for the folder page
// This page allows users to enter a specific folder and view the images inside
// On this page you only see folders and no images. User has to click on a folder to see the images inside

// folder structure of the app will look as follows:
// At the top level we have the app folder which contains an "images" folder.
// The "images" folder is the default folder where images taken on the home screen go.
// alongside the "images" folder we have a folder called "collections"
// The collections folder contains folders for each collection the user has created.
// Each collection folder contains the images for that collection as well as a metadata.json file that describes the collection.
// The resultant folder structure looks like this:
// app
//   images
//     1698263331534
//       image.jpg
//       metadata.json
//       ...
//     1698263331535
//       ...
//     ...
//   collections
//     collection_A
//       1698254331534
//         image.jpg
//         ...
//       1698254331535
//         ...
//       ...
//       metadata.json
//     collection_B
//     ...
//   ...
//

import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Alert} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import {FlatList} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import AppContext from '../AppContext';
import { BACTISCAN_ROOT } from '../../Constants';
import IonIcon from 'react-native-vector-icons/Ionicons';
import DialogInput from 'react-native-dialog-input';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';



type Props = NavigationProp<Routes, 'FoldersPage'>;


const FoldersPage = () => {
  const navigation = useNavigation<Props>();
  const appCtx = useContext(AppContext);
  const [selectedFolderName, setSelectedFolderName] = appCtx['folderSelect'];
  const [getFolderListHook, setFolderListHook] = useState([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  useEffect(() => {
    const fetchFolderList = async () => {
      const folderList = await getFolderList();
      console.log("_FOLDER LIST IN USE EFFECT IS: ", folderList)
      // sort folder list by name
      // const _fl = folderList.sort((a, b) => {
      //   if (a > b) {
      //     return -1;
      //   }
      //   if (a < b) {
      //     return 1;
      //   }
      // })
      console.log("FOLDER LIST BEFORE SETTING HOOK IS: ", folderList)
      // reverse the filder list so that it starts with A and ends with z
      const fl = folderList.reverse();
      setFolderListHook(fl);
    };
    fetchFolderList();
  }, []);

  const goToFolder = (folder_name) => {
    setSelectedFolderName(folder_name);
    navigation.navigate('Home');
  }

  const toggleNewFolderDialog = () => {
    
  }

  const renderFolderListItem = ({item}) => {
    return (
      // <TouchableOpacity
      //   style={styles.touchableContainer}
      //   onPress={() => goToFolder(item)}>
      //   <Text style={styles.title}>{item}</Text>
      // </TouchableOpacity>
      <View style={{...styles.container, 
      }}>
        <TouchableOpacity
          style={styles.touchableContainer}
          // on press it should load scan viewer with the thumbnail path of the scan list item that was clicked
          onPress={() => goToFolder(item)}>
          <IonIcon name="folder-outline" size={32}/>
          <View style={{...styles.metadataContainer
          }}>
            <Text style={{...styles.title}}>{item === 'images'? 'Home' : item}</Text>
          </View>

        </TouchableOpacity>
      </View>

    );
  }
  
  const RenderFolderList = ({folder_list}) => {
    console.log("folder_list: ", folder_list)
    return (
      <FlatList
        data={folder_list}
        renderItem={renderFolderListItem}
        keyExtractor={item => item.path}
      />
    );
  }
  const getFolderList = async (): Promise<string[]> => {
    const folders = await RNFS.readDir(
      `${BACTISCAN_ROOT}`,
    );
    // sort by path string
    folders.sort((a, b) => {
      if (a.path > b.path) {
        return -1;
      }
      if (a.path < b.path) {
        return 1;
      }
    });
    // remove any files from the list
    const filteredFolders = folders.filter(folder => folder.isDirectory());
    // remove any folders that start with a period
    const filteredFolders2 = filteredFolders.filter(folder => !folder.name.startsWith('.'));
    // sort by name
    filteredFolders2.sort((a, b) => {
      if (a.name > b.name) {
        return -1;
      }
      if (a.name < b.name) {
        return 1;
      }
    });
    const filteredFolders3 = filteredFolders2.map(folder => folder.name);
    filteredFolders3.sort((a, b) => {
      if (a > b) {
        return -1;
      }
      if (a < b) {
        return 1;
      }
    })
    // move 'images' folder from list to end of list
    const imagesIndex = filteredFolders3.indexOf('images');
    if (imagesIndex !== -1) {
      filteredFolders3.splice(imagesIndex, 1);
      filteredFolders3.push('images');
    }

    return filteredFolders3;
  }
  

  
  const createNewFolder = async (_folder_name) => {
    const folder_name = _folder_name.trim();
    const folder_path = `${BACTISCAN_ROOT}/${folder_name}`;
    // first validate that the folder name is not already taken
    // if it is, send an alert to the user and ask them to enter a different name
    // else create the folder

    if (getFolderListHook.includes(folder_name) || folder_name === "") {
      Alert.alert(
        'Invalid folder name',
        `A folder with the name ${folder_name} already exists. Please enter a different name.`,
      );
      return;
    }
    else {

      RNFS.mkdir(folder_path)
      .then(() => {
        getFolderList()
        .then(
          (folder_list) => {
            setFolderListHook(folder_list);
            setIsDialogVisible(false); 
          }
        )
      })
      .catch(()=> {
        console.log("ERROR CREATING FOLDER: ", error)
        // send alert asking user to enter a different name
        Alert.alert(
          'Could not create folder!',
          `There was an error creating the folder. Please try again with a different name.`,
        );
      })
      // await RNFS.mkdir(folder_path);
    }
    
  }
  const goToHome = () => {
    navigation.navigate('Home');
  };
  return (
    <View style={commonStyles.container}>
      <DialogInput isDialogVisible={isDialogVisible}
            title={"New Folder"}
            message={"Enter a name for the new folder"}
            hintInput ={"Name"}
            submitInput={ (inputText) => {createNewFolder(inputText)} }
            closeDialog={ () => {setIsDialogVisible(false)}}>
</DialogInput>
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={{...commonStyles.iconButton}}
          onPress={()=>setIsDialogVisible(true)}>
          <IonIcon name="add-outline" size={32} />
        </TouchableOpacity>
        {/* <View style={{...commonStyles.iconButton, width: 32, height: 32}} /> */}
        <Text style={commonStyles.title}>Folders</Text>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goToHome}>
          <IonIcon name="chevron-forward-outline" size={32} />
        </TouchableOpacity>
        {/* <Text style={commonStyles.title}>{selectedFolderName}</Text> */}
          {/* <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 50,
              alignItems: 'center',
            }}>
            <Text style={{color: '#888888'}}>Added scans will appear here</Text>
          </View> */}
        {/* )} */}
      </View>  
      <View style={commonStyles.content}>
        <RenderFolderList folder_list={getFolderListHook} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 10,
    justifyContent: 'center',
    alignContent: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
  },
  metadataContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888888',
  },
  particleCount: {
    fontSize: 14,
    color: '#888888'
  }
});
  

export default FoldersPage;
