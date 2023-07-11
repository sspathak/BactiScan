import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

import commonStyles from '../CommonStyles';
import type {Routes} from '../Routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ImageCarousel from './ImageCarousel';

type Props = NativeStackScreenProps<Routes, 'ScanViewer'>;
export function ScanViewer({navigation, route}: Props): React.ReactElement {
  const {thumbnail, metadata} = route.params;

  const goBack = () => {
    navigation.goBack();
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
