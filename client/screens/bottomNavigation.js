import React from 'react';
import { StyleSheet, Text, View ,ScrollView} from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Icon from "react-native-vector-icons/MaterialIcons";
import Post from './posts';
import Profile from './profile';
import Explore from './explore';
import Addpost from './addPost';
import Follow from './follow';

 /**
  * Bottom Tab Navigator
  */
const Tabs = createBottomTabNavigator({
	Post:{screen:Post,
		navigationOptions: {
			tabBarIcon: ({ tintColor,focused }) => (
				<Icon name="home" size={35}  />
				)
		},
	},
	Explore:{screen: Explore,
		navigationOptions: {
			tabBarIcon: ({ tintColor,focused }) => (
				<Icon name="search" size={35}  />
				)
		},
	},
	Addpost:{screen: Addpost,
		navigationOptions: {
			tabBarIcon: ({ tintColor,focused }) => (
				<Icon name='add-box' size={35}   color={'#0099e7'}/>
				)
		},
	},
	Follow:{screen: Follow,
		navigationOptions: {
			tabBarIcon: ({ tintColor,focused }) => (
				<Icon name='favorite-border' size={35}/>
				)
		},
	},
	
	Profile:{screen: Profile,
		navigationOptions: {
			tabBarIcon: ({ tintColor,focused }) => (
				<Icon name='perm-identity' size={35} />
				)
		},
	},
},
{
  tabBarOptions: { showLabel: false ,activeTintColor: '#2BEDBA',
           }
});
export default createAppContainer(Tabs);
