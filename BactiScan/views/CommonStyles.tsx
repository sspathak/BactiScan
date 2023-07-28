import {StyleSheet} from 'react-native';

import {
  HeaderStyleInterpolators,
  StackCardInterpolationProps,
  StackNavigationOptions,
  TransitionSpecs,
} from '@react-navigation/stack';

export const horizontalAnimation: StackNavigationOptions = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  headerStyleInterpolator: HeaderStyleInterpolators.forFade,
  cardStyleInterpolator: ({current, layouts}: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

export const verticalAnimation: StackNavigationOptions = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  headerStyleInterpolator: HeaderStyleInterpolators.forSlideUp,
  cardStyleInterpolator: ({current, layouts}: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
    marginTop: 20,
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
    // backgroundColor: 'lightgray',
    backgroundColor: '#AACCEE',
    borderRadius: 40,
    padding: 5,
    // marginLeft: 10,
    flexDirection: 'row',
  },
  buttonContainerBorder: {
    backgroundColor: 'black',
    borderRadius: 40,
    marginBottom: 20,
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
  },
  emptyBox: {
    height: 40,
    width: 40,
  },
  scanImage: {
    flex: 1,
  },
  metadataContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'lightgray',
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metadataText: {
    fontSize: 16,
    marginBottom: 5,
    paddingLeft: 5,
  },
});

export default styles;
