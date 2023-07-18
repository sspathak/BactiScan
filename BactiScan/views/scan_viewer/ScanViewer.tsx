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
import EditParametersModal from "./EditParametersModal";

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;
  const [result_images, setResultImages] = useState<string[]>([]);
  const [particle_count, setParticleCount] = useState('Unknown');
  const [results_ready, setResultsReady] = useState(true);
  const [visible, setIsVisible] = useState(false);
  const [viewing_image, setViewingImage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [lower_threshold, setLowerThreshold] = useState(5);
  const [upper_threshold, setUpperThreshold] = useState(100);
  const [lower_particle_size, setLowerParticleSize] = useState(5);
  const [upper_particle_size, setUpperParticleSize] = useState(100);
  // In the future version we will use something else to store the parameters sp that they stay the same  even on different pages
  // this can be done by using a global state as follows in the HomePage.tsx file
  // const [lower_threshold, setLowerThreshold] = useState(5);
  // and then to access it in this file we can use the following
  // const {lower_threshold} = useGlobalState();
  // and then we can use the lower_threshold variable in the code below
  // eg print the value of lower_threshold
  // console.log(lower_threshold);
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

  const updateParticleCountValue = async () => {
    let file_path = `${thumbnail.uri
      .split('/')
      .slice(0, -1)
      .join('/')}/metadata.json`;
    let file_exists = await RNFS.exists(file_path);
    if (file_exists) {
      console.warn('metadata.json exists');
      try {
        const metadataContents = await RNFS.readFile(file_path);
        const metadata = JSON.parse(metadataContents);
        setParticleCount(metadata.particle_count);
      } catch (error) {
        console.warn('Error reading metadata.json: ' + error);
      }
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
        await updateParticleCountValue();
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

  const edit_trigger = () => {
    setModalVisible(true);
  }

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
          lower_threshold={lower_threshold}
          upper_threshold={upper_threshold}
          lower_particle_size={lower_particle_size}
          upper_particle_size={upper_particle_size}
        />
      ) : (
        <>
          <View>
            <EditParametersModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              setLowerThreshold={setLowerThreshold}
              setUpperThreshold={setUpperThreshold}
              setLowerParticleSize={setLowerParticleSize}
              setUpperParticleSize={setUpperParticleSize}
              setResultsReady={setResultsReady}
              lower_threshold={lower_threshold}
              upper_threshold={upper_threshold}
              lower_particle_size={lower_particle_size}
              upper_particle_size={upper_particle_size}
            />
            <Button
              title="Change parameters"
              onPress={() => setModalVisible(true)}
            />
          </View>
          <View style={{transform: [{scale: 0.95}]}}>
            <SliderBox
              images={result_images}
              // style={styles_display_image.image}
              onCurrentImagePressed={(index: number) => {
                setViewingImage(index);
                if (results_ready) {
                  setIsVisible(true);
                }
              }}
              sliderBoxHeight={400}
            />
            <ImageView
              images={result_images.map(uri => ({uri}))}
              imageIndex={viewing_image}
              onRequestClose={() => setIsVisible(false)}
              visible={visible}
            />
          </View>
        </>
      )}
      <View style={commonStyles.metadataContainer}>
        <Text style={commonStyles.metadataTitle}>{metadata.title}</Text>
        <Text style={commonStyles.metadataText}>Date: {metadata.date}</Text>
        <Text style={commonStyles.metadataText}>Time: {metadata.time}</Text>
        <Text style={commonStyles.metadataText}>
          Particle Count:{' '}
          {metadata.particle_count ? metadata.particle_count : particle_count}
        </Text>
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
