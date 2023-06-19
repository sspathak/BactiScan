import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: 'lightgray',
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
});

export default styles;
