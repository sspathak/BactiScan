import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {SliderBox} from 'react-native-image-slider-box';
import IonIcon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import ImageView from 'react-native-image-viewing';

import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RNFetchBlob from 'rn-fetch-blob';
import {transform} from '@babel/core';
import styles from '../CommonStyles';
import CustomWebView from "../imagej_webview/CustomWebView";

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;
  const [result_images, setResultImages] = useState<string[]>([]);
  const [particle_count, setParticleCount] = useState(0);
  const [results_ready, setResultsReady] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [viewing_image, setViewingImage] = useState(0);
  const goBack = () => {
    navigation.goBack();
  };
  const PARTICLE_COUNT_DEFAULT_PARAMS = {
    threshold_min: 5,
    threshold_max: 100,
    particle_size_min: 5,
    particle_size_max: 100,
  };

  // RNFS.readFile(thumbnail.uri, 'base64').then(image_b64 => {
  //   fetch('http://192.168.1.199:8080/health')
  //     .then(response => response.text())
  //     .then(data => {
  //       console.warn(data);
  //     })
  //     .catch(error => {
  //       console.error(error);
  //     });
  //   // console.warn('thumbnail = ' + thumbnail.uri);
  //   // const getImages = async () => {
  //   try {
  //     const response = fetch('http://192.168.1.199:8089/particle_count', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //       body: JSON.stringify({
  //         image: image_b64,
  //         particle_count_params: PARTICLE_COUNT_DEFAULT_PARAMS,
  //       }),
  //     });
  //
  //     console.warn('got response');
  //
  //     // if (!response.ok) {
  //     //   throw new Error('Network response was not ok');
  //     // }
  //     response.then(data => {
  //       console.warn(data);
  //       data.json().then(data => {
  //         console.warn(data);
  //         setResultImages(data.output_images);
  //         console.log('result_images ready');
  //       });
  //     });
  //     // }
  //     // const data = response.json();
  //     // console.warn(data);
  //     // setResultImages(data.output_images);
  //     // console.log('result_images ready');
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   // };
  // });

  // getImages().catch(error => {
  //   console.warn(error);
  // });
  // };

  const exportToGallery = async () => {
    try {
      const {uri} = thumbnail;
      await RNFS.copyFile(
        uri,
        `${RNFS.PicturesDirectoryPath}/scanned_image.jpg`,
      );
      Alert.alert('Success', 'Image exported to gallery');
    } catch (error) {
      console.log('Failed to export image:', error);
      Alert.alert(
        'Export failed',
        'An error occurred while exporting the image',
      );
    }
  };
  const getParticleCountData = async () => {
    // check if files exist already
    let scanFolderPath = thumbnail.uri;
    let file_path = `${scanFolderPath.split('/').slice(0, -1).join('/')}/3.png`;
    let file_exists = await RNFS.exists(file_path);
    // if (file_exists) {
    //   console.warn('File exists');
    //   try {
    //     console.warn("Trying to read folder :'" + `${scanFolderPath.split('/').slice(0, -1).join('/')}` + "'");
    //     const files = await RNFS.readDir(
    //       `${scanFolderPath.split('/').slice(0, -1).join('/')}`,
    //     );
    //     const imageFiles = files
    //       .filter(file => file.isFile() && (file.name.endsWith('.png') || file.name.endsWith('.jpg')))
    //       .map(
    //         file =>
    //           `${scanFolderPath.split('/').slice(0, -1).join('/')}/${
    //             file.name
    //           }`,
    //       );
    //     setResultImages(imageFiles);
    //     return imageFiles;
    //   } catch (error) {
    //     console.error('Error while scanning folder:', error);
    //     return [];
    //   }
    // }
    // else {
    //   // CustomWebView(thumbnail.uri);
    //   console.warn(`File ${file_path} does not exist. Making request to server`);
    //   RNFS.readFile(thumbnail.uri, 'base64').then(image_b64 => {
    //     fetch('http://192.168.1.199:8080/health')
    //       .then(response => response.text())
    //       .then(data => {
    //         console.warn('Health check passed');
    //       })
    //       .catch(error => {
    //         console.error(error);
    //       });
    //     // console.warn('thumbnail = ' + thumbnail.uri);
    //     // const getImages = async () => {
    //     try {
    //       const response = fetch('http://192.168.1.199:8089/particle_count', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Accept: 'application/json',
    //         },
    //         body: JSON.stringify({
    //           image: image_b64,
    //           particle_count_params: PARTICLE_COUNT_DEFAULT_PARAMS,
    //         }),
    //       });
    //
    //       console.warn('got response');
    //
    //       // if (!response.ok) {
    //       //   throw new Error('Network response was not ok');
    //       // }
    //       response.then(data => {
    //         console.warn('line 129');
    //         data.json().then(data => {
    //           console.warn(`Got data with length ${data.output_images.length}`);
    //           setResultImages(data.output_images);
    //           console.warn('result_images ready');
    //           for (let i = 0; i < data.output_images.length; i++) {
    //             let image_data_uri = data.output_images[i].split(',');
    //             let image_data = image_data_uri[1];
    //             let scan_folder_path = thumbnail.uri;
    //             let file_path = `${scan_folder_path
    //               .split('/')
    //               .slice(0, -1)
    //               .join('/')}/${i}.png`;
    //             RNFetchBlob.fs.writeFile(file_path, image_data, 'base64');
    //           }
    //           const getImagesInFolder = async (
    //             scanFolderPath: string,
    //           ): Promise<string[]> => {
    //             try {
    //               console.warn(
    //                 "Trying to read folder '" + scanFolderPath + "'",
    //               );
    //               const files = await RNFS.readDir(
    //                 `${scanFolderPath.split('/').slice(0, -1).join('/')}`,
    //               );
    //               const imageFiles = files
    //                 .filter(file => file.isFile() && file.name.endsWith('.png'))
    //                 .map(
    //                   file =>
    //                     `${scanFolderPath.split('/').slice(0, -1).join('/')}/${
    //                       file.name
    //                     }`,
    //                 );
    //               return imageFiles;
    //             } catch (error) {
    //               console.error('Error while scanning folder:', error);
    //               return [];
    //             }
    //           };
    //           getImagesInFolder(thumbnail.uri).then(imageFiles => {
    //             setResultImages(imageFiles);
    //             console.warn(
    //               'result_images hook updated to length ' + imageFiles.length,
    //             );
    //           });
    //
    //           // write this in typescript: [scan_folder_path + '/../' + i + '.png' for i in os.listdir(scan_folder_path) if i.endswith('.png')]
    //         });
    //       });
    //       // }
    //       // const data = response.json();
    //       // console.warn(data);
    //       // setResultImages(data.output_images);
    //       // console.log('result_images ready');
    //     } catch (error) {
    //       console.error(error);
    //     }
    //     // };
    //   });
    // }
  };

  // if (!results_ready) {
  //   getParticleCountData().then(() => {
  //     setResultsReady(true);
  //     // setIsVisible(true);
  //   });
  // }

  const deleteScan = async () => {
    Alert.alert('Delete scan', 'Are you sure you want to delete this scan?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const {uri} = thumbnail;
            const scanDirPath = uri.substring(0, uri.lastIndexOf('/'));
            await RNFS.unlink(scanDirPath);
            navigation.goBack();
          } catch (error) {
            console.log('Failed to delete scan:', error);
            Alert.alert(
              'Deletion failed',
              'An error occurred while deleting the scan',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goBack}>
          <IonIcon name="arrow-back-outline" size={32} />
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.iconButton} onPress={deleteScan}>
          <IonIcon name="trash-outline" size={32} />
        </TouchableOpacity>
      </View>
      <View style={commonStyles.content}>
        {/*<Image*/}
        {/*  source={thumbnail}*/}
        {/*  style={commonStyles.scanImage}*/}
        {/*  resizeMode="contain"*/}
        {/*/>*/}
        <View>
          <SliderBox
            images={result_images}
            // style={styles_display_image.image}
            onCurrentImagePressed={(index: number) => {
              setViewingImage(index);
              if (results_ready) {
                setIsVisible(true);
              }
            }}
            sliderBoxHeight={600}
          />
          <ImageView
            images={result_images.map(uri => ({uri}))}
            imageIndex={viewing_image}
            onRequestClose={() => setIsVisible(false)}
            visible={visible}
          />

          {/*<SliderBox images={result_images} ImageComponentStyle={{transform: [{rotate: '-90deg'}]}}/>*/}
        </View>
        {/*<ImageCarousel*/}
        {/*  images={images.map(b64 => {*/}
        {/*    return {uri: 'data:image/jpeg;base64,' + b64};*/}
        {/*  })}*/}
        {/*  width={300}*/}
        {/*  height={300}*/}
        {/*  style={commonStyles.scanImage}*/}
        {/*  onImagePress={image => console.log(image)}*/}
        {/*/>*/}
        <View style={commonStyles.metadataContainer}>
          <Text style={commonStyles.metadataTitle}>{metadata.title}</Text>
          <Text style={commonStyles.metadataText}>Date: {metadata.date}</Text>
          <Text style={commonStyles.metadataText}>Time: {metadata.time}</Text>
        </View>
      </View>
      {/*<CustomWebView  />*/}
      <CustomWebView source_image_path={thumbnail.uri} />
      <View style={commonStyles.bottomBar}>
        <View style={commonStyles.buttonContainerBorder}>
          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              style={commonStyles.iconButton}
              onPress={exportToGallery}>
              <IonIcon name="download-outline" size={32} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default ScanViewer;
