import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import ScanList from "../home_page/ScanList";

const SettingsPage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Image
            source={require('../../assets/home-icon.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        {/*<TouchableOpacity style={styles.iconButton}>*/}
        {/*  <Image*/}
        {/*    source={require('../../assets/search-icon.png')}*/}
        {/*    style={styles.iconImage}*/}
        {/*  />*/}
        {/*</TouchableOpacity>*/}
      </View>
      <View style={styles.content}>
        {/* Render the list of scan items here */}
        <ScanList />
      </View>
      {/*<View style={styles.bottomBar}>*/}
      {/*  <View style={styles.buttonContainerBorder}>*/}
      {/*    <View style={styles.buttonContainer}>*/}
      {/*      <TouchableOpacity style={styles.iconButton}>*/}
      {/*        <Image*/}
      {/*          source={require('../../assets/camera-icon.png')}*/}
      {/*          style={styles.iconImage}*/}
      {/*        />*/}
      {/*      </TouchableOpacity>*/}
      {/*      <View style={styles.separator} />*/}
      {/*      <TouchableOpacity style={styles.iconButton}>*/}
      {/*        <Image*/}
      {/*          source={require('../../assets/gallery-icon.png')}*/}
      {/*          style={styles.iconImage}*/}
      {/*        />*/}
      {/*      </TouchableOpacity>*/}
      {/*    </View>*/}
      {/*  </View>*/}
      {/*</View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    // marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  buttonContainer: {
    backgroundColor: 'lightgray',
    borderRadius: 40,
    padding: 5,
    // marginLeft: 10,
    flexDirection: 'row',
  },
  buttonContainerBorder: {
    backgroundColor: 'black',
    borderRadius: 40,
    padding: 2,
    flexDirection: 'row',
  },
  separator: {
    width: 2,
    backgroundColor: 'black',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  iconImage: {
    height: 40,
    width: 40,
  }
});

export default HomeScreen;
