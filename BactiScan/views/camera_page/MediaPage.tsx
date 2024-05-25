import React, {useCallback, useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Video, {LoadError, OnLoadData} from 'react-native-video';
import {SAFE_AREA_PADDING} from './Constants';
import {useIsForeground} from './hooks/useIsForeground';
import {PressableOpacity} from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {Alert} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import {StatusBarBlurBackground} from './views/StatusBarBlurBackground';
import type {NativeSyntheticEvent} from 'react-native';
import type {ImageLoadEventData} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {Routes} from '../Routes';
import {useIsFocused} from '@react-navigation/core';
import RNFS from 'react-native-fs';


const requestSavePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  if (permission == null) {
    return false;
  }
  let hasPermission = await PermissionsAndroid.check(permission);
  if (!hasPermission) {
    const permissionRequestResult = await PermissionsAndroid.request(
      permission,
    );
    hasPermission = permissionRequestResult === 'granted';
  }
  return hasPermission;
};

const isVideoOnLoadEvent = (
  event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>,
): event is OnLoadData => 'duration' in event && 'naturalSize' in event;

type Props = NativeStackScreenProps<Routes, 'MediaPage'>;
export function MediaPage({navigation, route}: Props): React.ReactElement {
  const {path, type} = route.params;
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;
  const [savingState, setSavingState] = useState<'none' | 'saving' | 'saved'>(
    'none',
  );

  const onMediaLoad = useCallback(
    (event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>) => {
      if (isVideoOnLoadEvent(event)) {
        console.log(
          `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
        );
      } else {
        console.log(
          `Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`,
        );
      }
    },
    [],
  );
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);
  const onMediaLoadError = useCallback((error: LoadError) => {
    console.log(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

  const onSavePressed = useCallback(async () => {
    try {
      console.log('saving media...')
      setSavingState('saving');

      const hasPermission = await requestSavePermission();
      console.log('hasPermission: ', hasPermission);
      if (!hasPermission) {
        Alert.alert(
          'Permission denied!',
          'Vision Camera does not have permission to save the media to your camera roll.',
        );
        return;
      }
      console.log('saving media to camera roll...');
      await CameraRoll.save(`file://${path}`, {
        type: type,
      });
      console.log('media saved to camera roll!');
      setSavingState('saved');
    } catch (e) {
      console.log('failed to save media: ', e);
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      setSavingState('none');
      Alert.alert(
        'Failed to save!',
        `An unexpected error occured while trying to save your ${type}. ${message}`,
      );
    }
    console.log('exiting onSavePressed...');
  }, [path, type]);

  const source = useMemo(() => ({uri: `file://${path}`}), [path]);

  const screenStyle = useMemo(
    () => ({opacity: hasMediaLoaded ? 1 : 0}),
    [hasMediaLoaded],
  );

  const acceptHome = async () => {
    try {
      // Create a unique directory for each image
      const imageDirPath = `images/${Date.now()}`;
      console.log(
        'creating directory ' + `${RNFS.DocumentDirectoryPath}/${imageDirPath}`,
      );
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${imageDirPath}`);

      // Save the image to the directory
      const imagePath = 'image.jpg';
      console.log(
        'path: ',
        `${RNFS.DocumentDirectoryPath}/${imageDirPath}/${imagePath}`,
      );
      await RNFS.moveFile(
        path,
        `${RNFS.DocumentDirectoryPath}/${imageDirPath}/${imagePath}`,
      );

      // Save the metadata to a separate file
      const metadataPath = `${imageDirPath}/metadata.json`;
      const metadata = JSON.stringify({
        path: imagePath,
        type: type,
        timestamp: Date.now(),
      });
      await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${metadataPath}`, metadata);
      console.log(
        'Saved metadata to',
        `${RNFS.DocumentDirectoryPath}/${metadataPath}`,
      );
      // Navigate to the home page
      navigation.navigate('Home');
    } catch (error) {
      console.log('Failed to save media:', error);
      Alert.alert(
        'Failed to save!',
        `An unexpected error occurred while trying to save the ${type}.`,
      );
    }
  }

  return (
    <View style={[styles.container, screenStyle]}>
      <View style={{height: 20}}></View>
      {type === 'photo' && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
        />
      )}
      {type === 'video' && (
        <Video
          source={source}
          style={StyleSheet.absoluteFill}
          paused={isVideoPaused}
          resizeMode="cover"
          posterResizeMode="cover"
          allowsExternalPlayback={false}
          automaticallyWaitsToMinimizeStalling={false}
          disableFocus={true}
          repeat={true}
          useTextureView={false}
          controls={false}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          onReadyForDisplay={onMediaLoadEnd}
          onLoad={onMediaLoad}
          onError={onMediaLoadError}
        />
      )}

      <PressableOpacity style={styles.closeButton} onPress={navigation.goBack}>
        <IonIcon name="close" size={35} color="white" style={styles.icon} />
      </PressableOpacity>

      <PressableOpacity style={styles.acceptButton} onPress={acceptHome}>
        <IonIcon name="checkmark" size={35} color="white" style={styles.icon} />
      </PressableOpacity>

      <PressableOpacity
        style={styles.saveButton}
        onPress={onSavePressed}
        disabled={savingState !== 'none'}>
        {savingState === 'none' && (
          <IonIcon
            name="download"
            size={35}
            color="white"
            style={styles.icon}
          />
        )}
        {savingState === 'saved' && (
          <IonIcon
            name="checkmark"
            size={35}
            color="white"
            style={styles.icon}
          />
        )}
        {savingState === 'saving' && <ActivityIndicator color="white" />}
      </PressableOpacity>

      <StatusBarBlurBackground />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop,
    left: SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
  },
  acceptButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop,
    right: SAFE_AREA_PADDING.paddingRight,
    width: 40,
    height: 40,
  },
  saveButton: {
    position: 'absolute',
    bottom: SAFE_AREA_PADDING.paddingBottom,
    left: SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
  },
  icon: {
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
});

export default MediaPage;
