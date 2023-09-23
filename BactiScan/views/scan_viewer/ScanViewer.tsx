import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Button,
  TextInput,
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
import EditParametersModal from './EditParametersModal';
import CameraRoll from '@react-native-community/cameraroll';

import AppContext from '../AppContext';

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;
  const [result_images, setResultImages] = useState<string[]>([]);
  const [particle_count, setParticleCount] = useState('Unknown');
  const [results_ready, setResultsReady] = useState(true);
  const [visible, setIsVisible] = useState(false);
  const [viewing_image, setViewingImage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const particleCountParams = useContext(AppContext);

  const goBack = () => {
    navigation.goBack();
  };
  const PARTICLE_COUNT_DEFAULT_PARAMS = {
    threshold_min: 5,
    threshold_max: 100,
    particle_size_min: 5,
    particle_size_max: 100,
    bandpass_small: 0,
    bandpass_large: 5,
  };

  const exportToGallery = async () => {
    Alert.alert(
      'Save to Photos',
      'Would you like to save this image to Photos?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          style: 'default',
          onPress: async () => {
            RNFS.exists(result_images[viewing_image]).then(status => {
              if (status) {
                console.log('Yay! File exists');
              } else {
                console.log('File not exists');
              }
            });
            try {
              CameraRoll.save(result_images[viewing_image], 'photo')
                .then(res => {
                  console.log('Success', 'Image exported to gallery');
                })
                .catch(err => {
                  console.log('Failed to export image:', err);
                  console.log(`${result_images[viewing_image]}`);
                  Alert.alert(
                    'Export failed',
                    'An error occurred while exporting the image',
                  );
                });
              console.log('Success', 'Image exported to gallery');
            } catch (error) {
              console.log('Failed to export image:', error);
              console.log(`${result_images[viewing_image]}`);
              Alert.alert(
                'Export failed',
                'An error occurred while exporting the image',
              );
            }
          },
        },
      ],
    );
  };

  const updateParticleCountValue = async () => {
    let file_path = `${thumbnail.uri
      .split('/')
      .slice(0, -1)
      .join('/')}/metadata.json`;
    let file_exists = await RNFS.exists(file_path);
    if (file_exists) {
      console.log('metadata.json exists');
      try {
        const metadataContents = await RNFS.readFile(file_path);
        const metadata = JSON.parse(metadataContents);
        setParticleCount(metadata.particle_count);
      } catch (error) {
        console.log('Error reading metadata.json: ' + error);
      }
    }
  };

  const updateMetadata = async (newTitle: string) => {
    let file_path = `${thumbnail.uri
      .split('/')
      .slice(0, -1)
      .join('/')}/metadata.json`;
    let file_exists = await RNFS.exists(file_path);
    if (file_exists) {
      console.log('metadata.json exists');
      try {
        const metadataContents = await RNFS.readFile(file_path);
        const metadata = JSON.parse(metadataContents);
        metadata.title = newTitle;
        const newMetadata = JSON.stringify(metadata);
        await RNFS.writeFile(file_path, newMetadata);
      } catch (error) {
        console.log('Error reading metadata.json: ' + error);
      }
    }
  };
  const getParticleCountData = async () => {
    // check if files exist already
    let scanFolderPath = thumbnail.uri;
    let file_path = `${scanFolderPath.split('/').slice(0, -1).join('/')}/3.png`;
    let file_exists = await RNFS.exists(file_path);
    if (file_exists) {
      console.log('File exists');
      try {
        console.log(
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
  };

  return (
    <View style={{...commonStyles.container}}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={commonStyles.iconButton} onPress={goBack}>
          <IonIcon name="arrow-back-outline" size={32} />
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.iconButton} onPress={deleteScan}>
          <IonIcon name="trash-outline" size={32} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          ...commonStyles.metadataContainer,
          borderRadius: 10,
          backgroundColor: '#E4E4E4',
        }}>
        {/*<Text style={commonStyles.metadataTitle}>{metadata.title}</Text>*/}
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <TextInput
            style={{
              height: 40,
              borderWidth: 1,
              padding: 5,
              width: '100%',
              borderRadius: 5,
              ...commonStyles.metadataTitle,
              borderStyle: 'dotted',
              borderColor: '#BBBBBB',
            }}
            defaultValue={metadata.title}
            keyboardType="default"
            returnKeyType="done"
            returnKeyLabel="Next"
            onSubmitEditing={new_title =>
              updateMetadata(new_title.nativeEvent.text)
            }
          />
        </View>
        <Text style={commonStyles.metadataText}>Date: {metadata.date}</Text>
        <Text style={commonStyles.metadataText}>Time: {metadata.time}</Text>
        <Text style={commonStyles.metadataText}>
          Particle Count: {particle_count}
          {/*{metadata.particle_count ? metadata.particle_count : particle_count}*/}
        </Text>
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
        <>
          <View>
            <EditParametersModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              setLowerThreshold={particleCountParams.setGlobalLowerThreshold}
              setUpperThreshold={particleCountParams.setGlobalUpperThreshold}
              setLowerParticleSize={particleCountParams.setGlobalLowerSize}
              setUpperParticleSize={particleCountParams.setGlobalUpperSize}
              setLowerBandpass={particleCountParams.setGlobalLowerBandpass}
              setUpperBandpass={particleCountParams.setGlobalUpperBandpass}
              setResultsReady={setResultsReady}
              // lower_threshold={particleCountParams.global_lower_threshold}
              // upper_threshold={particleCountParams.global_upper_threshold}
              // lower_particle_size={particleCountParams.global_lower_particle_size}
              // upper_particle_size={particleCountParams.global_upper_particle_size}
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
              currentImageEmitter={index => {
                setViewingImage(index);
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
      {results_ready ? (
        <View style={commonStyles.bottomBar}>
          <View style={commonStyles.buttonContainerBorder}>
            <View style={commonStyles.buttonContainer}>
              <TouchableOpacity
                style={{
                  ...commonStyles.iconButton,
                  marginLeft: 2,
                  marginRight: 0,
                  marginBottom: 2,
                  padding: 4,
                  paddingHorizontal: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={exportToGallery}>
                <IonIcon name="download-outline" size={32} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default ScanViewer;
