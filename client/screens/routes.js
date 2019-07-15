import Login from './login';
import SignUp from './signUp';
import SignOut from './signOut';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import Follow from './follow';
import Profile from './profile';
import SinglePost from './singlePost';
import UserProfile from './visitProfile';
import Search from './search';
import Message from './message';
import SharedPost from './sharedPost';
import Tabs from './bottomNavigation';
import EditPost from './editPost';
import React from 'react';
import {
	ActivityIndicator,
	AsyncStorage,
	Button,
	StatusBar,
	StyleSheet,
	View,
} from 'react-native';

/**
 * Signout Route
 */
const SignOutStack = createStackNavigator({
	Login: {
		screen: Login,
		navigationOptions: {
			header: null
		}
	},
	SignUp: {
		screen: SignUp,
		navigationOptions: {
			header: null
		}
	},
	SignOut: {
		screen: SignOut,
		navigationOptions: {
			header: null
		}
	},

});

/**
 * SignIn route
 */
const SignInStack = createStackNavigator({
	Tabs: {
		screen: Tabs,
		navigationOptions: {
			header: null
		}
	},
	Follow: {
		screen: Follow,
		navigationOptions: {
			title: 'Follow',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	Profile: {
		screen: Profile,
		navigationOptions: {
			header: null
		}
	},
	SinglePost: {
		screen: SinglePost,
		navigationOptions: {
			title: 'SinglePost',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	UserProfile: {
		screen: UserProfile,
		navigationOptions: {
			title: 'UserProfile',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	Search: {
		screen: Search,
		navigationOptions: {
			title: 'Search',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	Message: {
		screen: Message,
		navigationOptions: {
			title: 'Message',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	SharedPost: {
		screen: SharedPost,
		navigationOptions: {
			title: 'SharedPost',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	EditPost: {
		screen: EditPost,
		navigationOptions: {
			title: 'EditPost',
			headerTitleStyle: { color: '#696969', fontWeight: 'normal' }
		}
	},
	SignOut: {
		screen: SignOut,
		navigationOptions: {
			header: null
		}
	},


});
class AuthLoadingScreen extends React.Component {
	constructor() {
		super();
		this._bootstrapAsync();
	}
	// Fetch the token from storage then navigate to our appropriate place
	_bootstrapAsync = async () => {
		const curruntUser = await AsyncStorage.getItem('curruntUser');

		// This will switch to the App screen or Auth screen and this loading
		// screen will be unmounted and thrown away.
		this.props.navigation.navigate(curruntUser ? 'SignIn' : 'signOut');
	};
	render() {
		return (
			<View style={styles.container}>
				{/* <ActivityIndicator size="large" color="#ef6858" /> */}
				<StatusBar barStyle="default" />
			</View>
		);
	}
}
const Routes = createAppContainer(createSwitchNavigator(
	{
		AuthLoading: AuthLoadingScreen,
		signOut: SignOutStack,
		SignIn: SignInStack,
	},
	{
		initialRouteName: 'AuthLoading',
	}
));

const styles = StyleSheet.create({
	navTitle: {
		color: '#696969', // changing navbar title color
		fontWeight: 'normal'
	},
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default Routes;