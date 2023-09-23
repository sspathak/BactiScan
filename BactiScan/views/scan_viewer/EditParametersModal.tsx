import {useContext, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
  Button,
} from 'react-native';

import React from 'react';
import AppContext from "../AppContext";

interface EditParametersModalProps {
  setLowerThreshold: ((text: string) => void) | undefined;
}

interface EditParametersModalProps {
  setLowerParticleSize: ((text: string) => void) | undefined;
}

interface EditParametersModalProps {
  setUpperParticleSize: ((text: string) => void) | undefined;
}

const EditParametersModal = ({
  modalVisible,
  setModalVisible,
  setLowerThreshold,
  setUpperThreshold,
  setLowerParticleSize,
  setUpperParticleSize,
  setLowerBandpass,
  setUpperBandpass,
  setResultsReady,
}) => {
  const lowerThreshold = useRef(null);
  const upperThreshold = useRef(null);
  const lowerParticle = useRef(null);
  const upperParticle = useRef(null);
  const lowerBandpass = useRef(null);
  const upperBandpass = useRef(null);
  const particleCountParams = useContext(AppContext);
  const handleInputSubmit = nextInputRef => {
    if (nextInputRef && nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };
  const ParameterInputGrid = () => {
    return (
      <View>
        <View style={styles.parameterInput}>
          <TextInput
            ref={lowerThreshold}
            style={styles.input}
            onChangeText={setLowerThreshold}
            placeholder={particleCountParams.global_lower_threshold.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Next"
            onSubmitEditing={() => handleInputSubmit(upperThreshold)}
          />
          <TextInput
            ref={upperThreshold}
            style={styles.input}
            onChangeText={setUpperThreshold}
            placeholder={particleCountParams.global_upper_threshold.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Next"
            onSubmitEditing={() => handleInputSubmit(lowerParticle)}
          />
        </View>
        <View style={styles.parameterInput}>
          <TextInput
            ref={lowerParticle}
            style={styles.input}
            onChangeText={setLowerParticleSize}
            placeholder={particleCountParams.global_lower_size.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Next"
            onSubmitEditing={() => handleInputSubmit(upperParticle)}
          />
          <TextInput
            ref={upperParticle}
            style={styles.input}
            onChangeText={setUpperParticleSize}
            placeholder={particleCountParams.global_upper_size.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Done"
            onSubmitEditing={() => handleInputSubmit(lowerBandpass)}
          />
        </View>
        <View style={styles.parameterInput}>
          <TextInput
            ref={lowerBandpass}
            style={styles.input}
            onChangeText={setLowerBandpass}
            placeholder={particleCountParams.global_lower_bandpass.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Next"
            onSubmitEditing={() => handleInputSubmit(upperBandpass)}
          />
          <TextInput
            ref={upperBandpass}
            style={styles.input}
            onChangeText={setUpperBandpass}
            placeholder={particleCountParams.global_upper_bandpass.toString()}
            placeholderTextColor={'gray'}
            keyboardType="numeric"
            returnKeyType="done"
            returnKeyLabel="Done"
          />
        </View>
      </View>
    );
  };

  const SizeThresholdText = () => {
    return (
      <View
        style={{
          flexDirection: 'column',
          paddingRight: 10,
          justifyContent: 'space-around',
        }}>
        <Text>Threshold</Text>
        <Text>Size</Text>
        <Text>Bandpass</Text>
      </View>
    );
  };
  const SetCancelButtons = () => {
    return (
      <View style={styles.parameterInputButtons}>
        <Button
          onPress={() => {
            setModalVisible(!modalVisible);
            setResultsReady(false);
          }}
          title={'Set'}
        />
        <View style={{width: 40}} />
        <Button
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          title={'Cancel'}
        />
      </View>
    );
  };

  const headerTextLabels = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 20,
        }}>
        <View style={{width: 80}} />
        <Text style={{paddingRight: 50}}>Lower</Text>
        <Text style={{paddingRight: 1}}>Upper</Text>
      </View>
    );
  };

  return (
    <View style={{flexDirection: 'column'}}>
      <View style={styles.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
          statusBarTranslucent={true}>
          <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Particle Count Parameters</Text>
                {headerTextLabels()}
                <View style={{flexDirection: 'row'}}>
                  {SizeThresholdText()}
                  {ParameterInputGrid()}
                </View>
                {SetCancelButtons()}
              </View>
          <View style={{height: 100}}></View>
            </View>
        </Modal>
      </View>
    </View>
  );
};

export default EditParametersModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 100,
    flexDirection: 'row',
    borderRadius: 5,
  },
  parameterInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parameterInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  modalView: {
    flexDirection: 'column',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
