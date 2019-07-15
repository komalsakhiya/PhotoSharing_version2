import React, { Component } from 'react';
import { StyleSheet, AsyncStorage } from 'react-native';
import Routes from './screens/routes';
import NavigationService from './services/navigation.service'

export default class App extends Component {

  render() {
    return (
      <Routes
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
