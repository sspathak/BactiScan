import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {SliderBox} from 'react-native-image-slider-box';
import IonIcon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;
  const [result_images, setResultImages] = useState<string[]>([]);
  const [particle_count, setParticleCount] = useState(0);
  const goBack = () => {
    navigation.goBack();
  };
  const PARTICLE_COUNT_DEFAULT_PARAMS = {
    threshold_min: 20,
    threshold_max: 100,
    particle_size_min: 20,
    particle_size_max: 400,
  };

  // const getImages = async () => {
  //   // make post request to 0.0.0.0:5000/get_images with "image" as key and base64 encoded thumbnail as value and
  //   // another key "particle_count_params" with PARTICLE_COUNT_DEFAULT_PARAMS as value
  //   // the response will be a list of base64 encoded images which will be set to result_images
  RNFS.readFile(thumbnail.uri, 'base64').then(image_b64 => {
    fetch('http://192.168.1.199:8080/health')
      .then(response => response.text())
      .then(data => {
        console.warn(data);
      })
      .catch(error => {
        console.error(error);
      });
    // console.warn('thumbnail = ' + thumbnail.uri);
    // const getImages = async () => {
    try {
      const response = fetch('http://192.168.1.199:8089/particle_count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          image: image_b64,
          particle_count_params: PARTICLE_COUNT_DEFAULT_PARAMS,
        }),
      });

      console.warn('got response');

      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      response.then(data => {
        console.warn(data);
        data.json().then(data => {
          console.warn(data);
          setResultImages(data.output_images);
          console.log('result_images ready');
        });
      });
      // }
      // const data = response.json();
      // console.warn(data);
      // setResultImages(data.output_images);
      // console.log('result_images ready');
    } catch (error) {
      console.error(error);
    }
    // };
  });

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
        <Image
          source={thumbnail}
          style={commonStyles.scanImage}
          resizeMode="contain"
        />
        <SliderBox images={result_images} />
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
