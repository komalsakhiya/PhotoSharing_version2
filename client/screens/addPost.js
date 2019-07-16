import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import Config from '../config';
import { AsyncStorage } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import _ from 'lodash'

const config = new Config();

export default class Addpost extends Component {
	constructor(props) {
		super(props)
		this.state = {
			content: "",
			file: "",
			imageName: "",
			ButtonStateHolder: false,
		};
	}
	/** 
	 * Select image from galary
	 */
	pickImage = () => {
		console.log("function call=========>");
		const options = {
			allowsEditing: true,
			base64: false
		};
		ImagePicker.launchImageLibrary(options, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				console.log("this images===========", response);
				const source = { uri: response.uri }
				console.log("source=============================>", source);
				this.setState({ file: response.uri, imageName: response.fileName, ButtonStateHolder: false });
				console.log('image path=========>', this.state.file, this.state.imageName);
			}
		})
	};

	/**
	 * @param {*} postData
	 * Add Post
	 */
	addPost = async (data) => {
		this.setState({
			ButtonStateHolder: true
		})
		let userId;
		console.log("function calling==============>", data);
		console.log("content=======================>", data.content);
		console.log('image path=========>', this.state.file, this.state.imageName);
		var tagsListArr = data.content.split(' ');
		console.log('tagsListArr===========>', tagsListArr);
		let hashTag = [];
		_.forEach(tagsListArr, (tag) => {
			if (tag.charAt(0) === '#') {
				hashTag.push(tag);
			}
		})
		console.log('hashTag===============>', hashTag);
		console.log('hashTag===============>', typeof hashTag);
		console.log("this.state.buttonstateholder=================>", this.state.ButtonStateHolder);
		if (!this.state.imageName) {
			if (Platform.OS === 'ios') {
				alert('Choose Image')
			} else {
				ToastAndroid.show('Choose Image', ToastAndroid.SHORT);
			}
		} else {
			try {
				const curruntUser = await AsyncStorage.getItem('curruntUser');
				if (curruntUser !== null) {
					userId = JSON.parse(curruntUser)
					console.log("value===+++++++++++++++++++++===========================>", userId.data._id, userId.token);
				}
			} catch (error) {
				console.log("==============", error);
				if (Platform.OS === 'ios') {
					alert('User Data Not Found')
				} else {
					ToastAndroid.show('User Data Not Found', ToastAndroid.SHORT);
				}
			};
			const cleanFilePath = this.state.file.replace('file://', '');
			RNFetchBlob.fetch('POST', config.getBaseUrl() + 'post/post', {
				'Content-Type': 'multipart/form-data',
				'token': userId.token
			},
				[

					{
						name: 'content',
						data: this.state.content
					},
					{
						name: 'hashTag',
						data: JSON.stringify(hashTag)
					},
					{
						name: 'userId',
						data: userId.data._id

					},
					{
						name: 'images',
						filename: this.state.imageName,
						data: RNFetchBlob.wrap(cleanFilePath)
					},
				])
				.then(async (res) => {
					console.log('response====================>', res.data, JSON.parse(res.data).message);
					this.setState({ content: '', file: "", ButtonStateHolder: false, imageName: '' })
					if ((res.data == "Unauthorized: Invalid token" || res.data == "Unauthorized: No token provided")) {
						alert(res.data);
						await AsyncStorage.setItem('curruntUser', '');
						this.props.navigation.navigate('Login')
					} else {
						if (Platform.OS === 'ios') {
							alert('User Data Not Found')
						} else {
							ToastAndroid.show(JSON.parse(res.data).message, ToastAndroid.SHORT);
						}
						this.props.navigation.navigate('Profile')
					}

				})
				.catch((err) => {
					console.log('err===========================>', err);
					ToastAndroid.show("Internal Server Error", ToastAndroid.SHORT);
					this.setState({ content: '', file: "", ButtonStateHolder: false, imageName: '' })
				})
		}
	}

	render() {
		console.log('this.state========================>', this.state);
		if (this.state.file) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<View style={[styles.container, { marginTop: 70 }]}>
						<Text style={styles.titleText}>Add Post</Text>
						<Icon name="photo-library"
							size={70}
							onPress={this.pickImage}
							style={{ textAlign: 'center', marginTop: 40 }}
						/>
						<TextInput
							value={this.state.content}
							onChangeText={(content) => this.setState({ content: content })}
							placeholder={'Caption'}
							style={styles.input}
						/>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 3 }}>
							</View>
							<View style={{ flex: 4 }}>
								<Image source={{ uri: this.state.file }} style={styles.preview} />
							</View>
							<View style={{ flex: 3 }}>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.button, { backgroundColor: this.state.ButtonStateHolder ? '#607D8B' : '#0099e7' }]}
							onPress={() => this.addPost(this.state)}
							disabled={this.state.ButtonStateHolder}>
							<Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}> Post</Text>
						</TouchableOpacity>

					</View>
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<View style={styles.container}>
						<Text style={styles.titleText}>Add Post</Text>
						<Icon name="photo-library"
							size={70}
							onPress={this.pickImage}
							style={{ textAlign: 'center', marginTop: 40 }}
						/>
						<TextInput
							value={this.state.content}
							onChangeText={(content) => this.setState({ content: content })}
							placeholder={'Caption'}
							style={styles.input}
						/>

						<TouchableOpacity
							style={[styles.button]}
							onPress={() => this.addPost(this.state)}
						>
							<Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}> Post</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}
	}
}
const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#e1e0e0',
		borderRadius: 10,
		width: 310,
		padding: 20,
		height: 'auto',
	},
	input: {
		width: 250,
		height: 44,
		padding: 4,
		borderBottomWidth: 1,
		borderColor: 'gray',
		marginBottom: 10,
		marginLeft: 10,
	},
	titleText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: 'black',
		textAlign: 'center',
	},
	button: {
		marginLeft: 4,
		marginTop: 20,
		height: 33,
		padding: 0,
		width: 260,
		backgroundColor: '#0099e7',
		borderRadius: 3,
	},
	preview: {
		height: 120,
		width: 120,
		borderRadius: 3,
		marginTop: 5
	}
});



