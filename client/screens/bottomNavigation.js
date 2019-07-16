import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Icon from "react-native-vector-icons/MaterialIcons";
import Post from './posts';
import Profile from './profile';
import Explore from './explore';
import Addpost from './addPost';
import Follow from './follow';



// const tabBarIcon = (nameInactive, nameActive) => ({ tintColor, focused }) => (
// 	<Icon name={focused ? nameActive : nameInactive} size={26} color={focused ? tintColor : Colors.tabInactive} />
//   );
/**
 * Bottom Tab Navigator
 */
const Tabs = createBottomTabNavigator({
	Post: {
		screen: Post,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => (
				<Icon name="home" size={35} color={tintColor} />
			)
		},
	},
	Explore: {
		screen: Explore,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => (
				<Icon name="search" size={35} color={tintColor} />
			)
		},
	},
	Addpost: {
		screen: Addpost,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => (
				<Icon name='add-box' size={35} color={'#0099e7'} />
			)
		},
	},
	Follow: {
		screen: Follow,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => (
				<Icon name='favorite-border' size={35} color={tintColor} />
			)
		},
	},

	Profile: {
		screen: Profile,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => (
				<Icon name='perm-identity' size={35} color={tintColor} />
			)
		},
	},
},
	{
		tabBarOptions: {
			showLabel: false, activeTintColor: "black"
		}
	});
export default createAppContainer(Tabs);
