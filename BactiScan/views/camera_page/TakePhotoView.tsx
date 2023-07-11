import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import VisionCamera, {useCameraDevices, Camera, PhotoFile} from 'react-native-vision-camera';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import commonStyles from '../CommonStyles';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Filter: undefined;
  Camera: undefined;
  PhotoView: undefined;
};

type TakePhotoViewNavigationProp = NavigationProp<
  RootStackParamList,
  'PhotoView'
>;


const TakePhotoView = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const navigation = useNavigation<TakePhotoViewNavigationProp>();
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;
  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();
  }, []);
  const goToHome = () => {
    navigation.navigate('Home');
  };
  const goToCamera = () => {
    navigation.navigate('Camera');
  };

  // const takePhoto = async () => {
  //   const photo = await VisionCamera.takePicture({quality: 'high'});
  //   console.log('takePhoto', photo);
  // };

  const capturePhoto = async () => {
    if (camera.current !== null) {
      const photo = await camera.current.takePhoto<PhotoFile>({});
      setImageSource(photo.path);
      setShowCamera(false);
      console.log(photo.path);
    }
  };

  if (device == null) {
    return <Text>Camera not available</Text>;
  }
  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.camButton}
              onPress={() => capturePhoto()}
            />
          </View>
        </>
      ) : (
        <>
          {imageSource !== '' ? (
            <Image
              style={styles.image}
              source={{
                uri: `file://'${imageSource}`,
              }}
            />
          ) : null}

          <View style={styles.backButton}>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#fff',
                width: 100,
              }}
              onPress={() => setShowCamera(true)}>
              <Text style={{color: 'white', fontWeight: '500'}}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  padding: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#77c3ec',
                }}
                onPress={() => setShowCamera(true)}>
                <Text style={{color: '#77c3ec', fontWeight: '500'}}>
                  Retake
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#77c3ec',
                  padding: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
                onPress={() => setShowCamera(true)}>
                <Text style={{color: 'white', fontWeight: '500'}}>
                  Use Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'gray',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: 0,
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    //ADD backgroundColor COLOR GREY
    backgroundColor: '#B2BEB5',

    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 9 / 16,
  },
});

export default TakePhotoView;

//   return (
//     <View style={commonStyles.container}>
//       <View style={commonStyles.header}>
//         <TouchableOpacity style={commonStyles.iconButton} onPress={goToHome}>
//           <Image
//             source={require('../../assets/left-icon.png')}
//             style={commonStyles.iconImage}
//           />
//         </TouchableOpacity>
//         <Text style={commonStyles.title}>Take Photo</Text>
//         <View style={commonStyles.emptyBox}></View>
//       </View>
//       <View style={commonStyles.content}>
//         <TouchableOpacity style={commonStyles.iconButton} onPress={takePhoto}>
//           <Image
//             source={require('../../assets/camera-icon.png')}
//             style={commonStyles.iconImage}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={commonStyles.iconButton}
//           onPress={startRecording}>
//           <Image
//             source={require('../../assets/record-icon.png')}
//             style={commonStyles.iconImage}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={commonStyles.iconButton}
//           onPress={stopRecording}>
//           <Image
//             source={require('../../assets/stop-icon.png')}
//             style={commonStyles.iconImage}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity style={commonStyles.iconButton} onPress={goToCamera}>
//           <Image
//             source={require('../../assets/camera-icon.png')}
//             style={commonStyles.iconImage}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
