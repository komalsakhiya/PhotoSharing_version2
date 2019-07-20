import React, { Component } from 'react';
import {Platform, StyleSheet, Text, View, AsyncStorage, TouchableOpacity, ScrollView, Image } from 'react-native';
import Config from '../config';
import userService from '../services/user.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
let config = new Config();

export default class Message extends Component {
  constructor(props) {
    global.curruntUserId = ""
    super(props)
    this.state = {
      sharedPost: [],
    }
  }
  componentDidMount = async () => {
    let userId;
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser !== null) {
        userId = JSON.parse(curruntUser);
        console.log("value===+++++++++++++++++++++===========================>", userId.data._id);
        global.curruntUserId = userId.data._id
      }
    } catch (error) {
      alertService.alerAndToast("User Data Not Found");
    }
    this.sharedPostUser();
  }

  /** get User whose Shred Post with You */
  sharedPostUser = () => {
    const userId = global.curruntUserId;
    userService.sharedPostUser(userId).
      then(response => {
        console.log('Shared post==================================>', response);
        this.setState({
          sharedPost: response.data.data
        })
      })
      .catch(err => {
        alertService.alerAndToast("Internal Server Error");
        console.log(err);
      })
  }

  /** Get ProfilePhoto */
  profilePic = (profilePhoto) => {
    if (!profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
         />
      )
    } else {
      return (
        <CacheableImage resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + profilePhoto }}   permanent = {true} />
      )
    }
  }

  render() {
    if (!this.state.sharedPost.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No shared Post....</Text>
        </View>
      )
    } else {
      return (
        <View style={styles.container}>
          {/* Display user Name whose Shared post with this user */}
          <ScrollView>
            {this.state.sharedPost.map((item) =>
              <View>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('SharedPost', { id: item._id })}
                >
                  <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                    <View style={{ flex: 1 }}>
                      {this.profilePic(item.srcId.profilePhoto)}
                    </View>
                    <View style={{ flex: 6 }}>
                      <Text style={styles.text}>{item.srcId.userName}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profile: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginTop: 5,
    left: 10,
  },
  text: {
    color: 'black',
    fontSize: 18,
    marginTop: 13,
    marginLeft: 10,
    textTransform: 'capitalize'
  }
});
