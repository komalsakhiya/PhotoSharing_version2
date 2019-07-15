import { createStackNavigator, createMaterialTopTabNavigator } from 'react-navigation';
import Followers from './followers';
import Following from './following';

/**
 * Follwing And Followers Tabs
 */
const TabScreen = createMaterialTopTabNavigator(
  {
    Following: { screen: Following },
    Followers: { screen: Followers },
  },
  {
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      activeTintColor: '#302f2f',
      inactiveTintColor: 'gray',
      style: {
        backgroundColor: '#ffffff',
      },
      labelStyle: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 15
      },
      indicatorStyle: {
        borderBottomColor: '#363636',
        borderBottomWidth: 2,
      },
    },
  }
);

const Follow = createStackNavigator({
  TabScreen: {
    screen: TabScreen,
    navigationOptions: {
      header: null
    },
  },
});

//For React Navigation Version 2+
export default Follow;
