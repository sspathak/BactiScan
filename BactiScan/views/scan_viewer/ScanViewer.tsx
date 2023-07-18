import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Button,
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
import CustomWebView from '../imagej_webview/CustomWebView';

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;
  const [result_images, setResultImages] = useState<string[]>([]);
  const [particle_count, setParticleCount] = useState(0);
  const [results_ready, setResultsReady] = useState(true);
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
    if (file_exists) {
      console.warn('File exists');
      try {
        console.warn(
          "Trying to read folder :'" +
            `${scanFolderPath.split('/').slice(0, -1).join('/')}` +
            "'",
        );
        const files = await RNFS.readDir(
          `${scanFolderPath.split('/').slice(0, -1).join('/')}`,
        );
        const imageFiles = files
          .filter(
            file =>
              file.isFile() &&
              (file.name.endsWith('.png') || file.name.endsWith('.jpg')),
          )
          .map(
            file =>
              `${scanFolderPath.split('/').slice(0, -1).join('/')}/${
                file.name
              }`,
          );
        setResultImages(imageFiles);
        return imageFiles;
      } catch (error) {
        console.error('Error while scanning folder:', error);
        return [];
      }
    } else {
      setResultsReady(false);
    }
  };

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

  useEffect(() => {
    getParticleCountData();
  }, []);

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
      {/*<CustomWebView  />*/}
      {!results_ready ? (
        <CustomWebView
          source_image_path={thumbnail.uri}
          setParticleCount={setParticleCount}
          results_ready={results_ready}
          setResultsReady={setResultsReady}
          getParticleCountData={getParticleCountData}
        />
      ) : (
        // <Button
        //   title="Redo Particle Count"
        //   onPress={() => setResultsReady(false)}
        // />

        <View style={commonStyles.content}>
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
        </View>
      )}
      <View style={commonStyles.metadataContainer}>
        <Text style={commonStyles.metadataTitle}>{metadata.title}</Text>
        <Text style={commonStyles.metadataText}>Date: {metadata.date}</Text>
        <Text style={commonStyles.metadataText}>Time: {metadata.time}</Text>
      </View>

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
