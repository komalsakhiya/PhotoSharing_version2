import React, { Component } from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, ToastAndroid, ActivityIndicator, FlatList } from 'react-native';
import Config from '../config';
import postService from '../services/post.service';
const config = new Config();
let sorted_posts;
const { width } = Dimensions.get('screen');

export default class UserProfile extends Component {
  constructor(props) {
    global.user = ""
    super(props)
    this.state = {
      post: [],
    };
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.componentDidMount();
      });
  }

  componentDidMount = async () => {
    console.log("=======================UserIdddddd===================", this.props.navigation.state.params.userId)
    global.user = this.props.navigation.state.params.userId;
    console.log("=======================UserIdddddd{{{{}}}}===================", global.user)
    /**
     * @param {String} userId
     * Get Posts By UserId
     */
    postService.getPostByUserId(this.props.navigation.state.params.userId._id).
      then(response => {
        console.log('postttttttttttttttttttttttttttt===================>', response.data);
        if (response.data.data.length) {
          sorted_posts = response.data.data[0].post.sort((a, b) => {
            return new Date(a.created_date).getTime() -
              new Date(b.created_date).getTime()
          }).reverse();
          console.log('sorted post==================================>', sorted_posts);
        }
        this.setState({
          post: response.data.data[0]
        })

      })
      .catch(err => {
        console.log('er=====>', err);
        // alert('Internal Server Error')
        if (Platform.OS === 'ios') {
          alert('Internal Server Error')
        } else {
        ToastAndroid.show('Internal Server Error', ToastAndroid.SHORT);
        }
      })

  }


  /**
   * Get ProfilePhoto 
   */
  profilePic = () => {
    console.log("profile pic===========================>",global.user.profilePhoto);
    if (!global.user.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + this.state.post.profilePhoto }} />
      )
    }
  }

  render() {
    console.log("post=============tis.state============>", this.state.post);
    // console.log("gfetched user================>", this.state.userData.friends)
    // console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{", this.props.navigation.state.params.userId);
    // console.log("postarr==========================>", postArr)
    if (this.state.post) {
      const postArr = this.state.post.friends;
      if (!postArr) {
        return (
          <>
            <View style={[styles.horizontal, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#ef6858" />
            </View>
          </>
        )
      } else {
        return (
          <>
            <View style={{ backgroundColor: '#ffffff98', paddingBottom: 20 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 5 }}></View>
                <View style={{ flex: 6 }}>
                  {this.profilePic()}
                </View>
                <View style={{ flex: 5 }}></View>
              </View>
              <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 22, textAlign: 'center', color: 'black' }}>{this.state.post.userName}</Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <View style={styles.footer}>
                  {this.state.post.post.length ? <Text style={styles.textColor}>{this.state.post.post.length}</Text> : <Text>0</Text>}
                  <Text>Posts</Text>
                </View>
                <View style={styles.footer}>
                  <Text style={styles.textColor}>{this.state.post.followers.length}</Text>
                  <Text>Followers</Text>
                </View>
                <View style={styles.footer}>
                  <Text style={styles.textColor}>{this.state.post.friends.length}</Text>
                  <Text>Following</Text>
                </View>
              </View>
            </View>
            <ScrollView>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'row', margin: 5 }}>
                  <FlatList
                    data={sorted_posts}
                    renderItem={({ item }) =>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('SinglePost', { id: item._id })}>
                        <Image style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} />
                      </TouchableOpacity>
                    }
                    numColumns={3}
                  />
                </View>
              </View>
            </ScrollView>
          </>
        );
      }
    } else {
      return (
        <>
          <View style={{ backgroundColor: '#ffffff98', paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 5 }}></View>
              <View style={{ flex: 6 }}>
                {this.profilePic()}
              </View>
              <View style={{ flex: 5 }}></View>
            </View>
            <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 22, textAlign: 'center', color: 'black' }}>{global.user.userName}</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <View style={styles.footer}>
               <Text style={styles.textColor}>0</Text>
                <Text>Posts</Text>
              </View>
              <View style={styles.footer}>
                <Text style={styles.textColor}>{global.user.followers.length}</Text>
                <Text>Followers</Text>
              </View>
              <View style={styles.footer}>
                <Text style={styles.textColor}>{global.user.friends.length}</Text>
                <Text>Following</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>No Post</Text>
          </View>
        </>

      )
    }
  }
}

const styles = StyleSheet.create({
  profile: {
    borderRadius: 40,
    height: 80,
    width: 80,
    marginTop: 20,
    left: 30,
    borderColor: 'lightgray',
    borderWidth: 2,
    margin: 'auto'
  },
  footer: {
    flexDirection: 'column', flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColor: {
    color: 'black',
    fontWeight: 'bold'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  img: {
    height: width / 3.2,
    width: width / 3.2,
    margin: 2
  },
});
