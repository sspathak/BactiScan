import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import commonStyles from '../CommonStyles';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import type {Routes} from '../Routes';
import CustomWebView from "../imagej_webview/CustomWebView";

type Props = NavigationProp<Routes, 'ScanListItem'>;

const ScanListItem = ({thumbnail, metadata}) => {
  const navigation = useNavigation<Props>();

  const goToScanViewer = () => {
    navigation.navigate('ScanViewer', {
      thumbnail: thumbnail,
      metadata: metadata,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        // style={commonStyles.iconButton}
        style={styles.touchableContainer}
        // on press it should load scan viewer with the thumbnail path of the scan list item that was clicked
        onPress={goToScanViewer}>
        <Image source={thumbnail} style={styles.thumbnail} />
        <View style={styles.metadataContainer}>
          <Text style={styles.title}>{metadata.title}</Text>
          <Text style={styles.date}>{metadata.date}</Text>
          <Text style={styles.date}>{metadata.time}</Text>
          <Text style={styles.particleCount}>{ 'Count: ' + (metadata.particle_count ? metadata.particle_count : 'Unknown') }</Text>
          {/*<Text*/}
          {/* // Add other metadata fields as needed */}
        </View>
      </TouchableOpacity>
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
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
  },
  metadataContainer: {
    flex: 1,
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

export default ScanListItem;
