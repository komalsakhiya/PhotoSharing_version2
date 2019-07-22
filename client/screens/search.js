import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, FlatList, Image, ScrollView, TouchableOpacity, ToastAndroid, Dimensions } from 'react-native';
import Config from '../config';
import { AsyncStorage } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ParsedText from 'react-native-parsed-text';
import { PermissionsAndroid } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import _ from 'lodash';
import differenceBy from 'lodash/differenceBy';
import userService from '../services/user.service';
import postService from '../services/post.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
const { width } = Dimensions.get('window');
const config = new Config();

export default class Search extends Component {
  constructor(props) {
    global.curruntUserData = ""
    super(props)
    this.state = {
      posts: [],
      data: [],
      page: 1,
      loading: true,
      searchedPost: [],
      ButtonStateHolder: false,
      key: '',
      searchedUser: [],
      friends: [],
      comment: ''
    }
  };

  componentDidMount = async () => {
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser) {
        data = JSON.parse(curruntUser);
        global.curruntUserData = data
        console.log("value===+++++++++++++++++++++===========================>", global.curruntUserData.data._id);
      }
    } catch (error) {
      alertService.alerAndToast("User Data Not Found");
      console.log("err=====>", err)
    }
    this.getFriends()
  }

  /**
   * @param {String} curruntUserId
   *  Get User Friends
   */
  getFriends = () => {
    const userId = global.curruntUserData.data._id
    userService.getFriends(userId)
      .then(response => {
        console.log('currunt user Friends following==============================>', response.data[0]);
        this.setState({
          friends: response.data.data
        })
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /** 
   * @param {String} key
   * Search User And hashTag
   */
  Search = (key) => {
    console.log('key=============================================>', key);
    if (!key) {
      ToastAndroid.show('Enter Any name', ToastAndroid.SHORT);
    } else {
      if (key.charAt(0) === '#') {
        const payload = {
          "key": key,
        }
        postService.SearchHashTag(payload).
          then(response => {
            // console.log('response of serach tag=================>', response);
            if (!response.data.data.length) {
              console.log("=======user not found==============");
              alertService.alerAndToast("There are No HashTag Found");
            } else {
              for (let i = 0; i < response.data.data.length; i++) {
                for (let j = 0; j < response.data.data[i].like.length; j++) {
                  if (global.curruntUserData.data._id == response.data.data[i].like[j]) {
                    response.data.data[i].isLiked = true
                  } else {
                    response.data.data[i].isLiked = false
                  }
                }
              }
            }
            if (this.state.searchedUser.length) {
              this.setState({ searchedUser: [] })
            }
            this.setState({ searchedPost: response.data.data })
          })
          .catch(err => {
            console.log("err======>", err);
            alertService.alerAndToast("Internal Server Error");
          })
      } else {
        const payload = {
          "key": key,
        }
        userService.SearchUser(payload)
          .then(response => {
            console.log('serchedUser==============================>', response.data.data);
            if (!response.data.data.length) {
              console.log("=======user not found==============");
              alertService.alerAndToast("There Are No User Found");
            } else {
              // let myFriends = global.curruntUserData.data.friends;
              // let searchUserId = response.data.data[0]._id
              // console.log('myFriends===========>', myFriends);
              // console.log("searchUserId============>0", searchUserId);
              // console.log("this.state.friends=============>", this.state.friends)
              // let result = this.state.friends.filter(function (o1) {
              //   // if match found return false
              //   return _.findIndex(response.data.data, { 'id': o1.id }) !== -1 ? false : true;
              // });
              // console.log('resultttttttttttttttttttttt====================================>', result);
              // const searchUsers = differenceBy(response.data.data, result, '_id');
              // console.log('===================myDifferences======================>', searchUsers);
              if (!response.data.data.length) {
                alertService.alerAndToast("No user Found");
              }
              this.setState(prevState => ({
                searchedUser: response.data.data
              }))
              if (this.state.searchedPost.length != 0) {
                this.setState({ searchedPost: [] })
              }
              console.log("================resulttttttttttttt=========>", response.data);
            }
          })
          .catch(err => {
            console.log("err======>", err);
            alertService.alerAndToast("Internal Server Error");
          })
      }
    }
  }

  /**
   * @param {String} curruntUserId
   * Follow User
   */
  handleClickFollow = (item) => {
    console.log("data=====================================+++++++++++=====>", item);
    const payload = {
      "requestedUser": global.curruntUserData.data._id,
      "userTobeFollowed": item._id
    }
    console.log(payload)
    if (payload.requestedUser == payload.userTobeFollowed) {
      console.log("user can't follow itself")
      alertService.alerAndToast("User Can't follow itself");
    } else {
      userService.handleClickFollow(payload)
        .then(response => {
          console.log("response========================>    ", response.data);
          console.log("follow sucessfully................");
          res = item;
          alertService.alerAndToast("Follow successfully....");
        })
        .catch(err => {
          console.log("err======>", err);
          alertService.alerAndToast("Internal Server Error");
        })
    }
  }

  /** 
   * Get ProfilePhoto
   */
  profilePic = (item) => {
    if (!item.userId.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + item.userId.profilePhoto }} permanent={true} />
      )
    }
  }

  /** 
   * Download Post Image
   */
  savePostImage = (data) => {
    console.log("=====================", data);
    alertService.alerAndToast("Internal Server Error");
    ToastAndroid.show('Downloading...', ToastAndroid.SHORT);
    this.setState(
      {
        visible: true,
        ButtonStateHolder: true
      },
      () => {
        this.hideToast();
      },
    );
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'Storage',
        'message': 'This app would like to store some files on your phone'
      }
    ).then(() => {
      let dirs = RNFetchBlob.fs.dirs.DownloadDir;
      RNFetchBlob
        .config({
          // response data will be saved to this path if it has access right.
          fileCache: true,
          addAndroidDownloads: {
            title: data,
            path: dirs + '/' + data,
            ext: "jpg",
            useDownloadManager: true,
            description: "fileName",
            notification: true,
          }
        })
        .fetch('GET', config.getMediaUrl() + data, {
        })
        .then((res) => {
          console.log('The file saved to ', res);
          alertService.alerAndToast("Download completed");
        })
    })
    setTimeout(() => {
      this.setState({ ButtonStateHolder: false })
    }, 700)
  }

  hideToast = () => {
    this.setState({
      visible: false,
    });
  };

  /**
   * @param {object} comment 
   * Get Comment ProfilePhoto
   */
  commentProfile = (comment) => {
    if (!comment.userId.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + comment.userId.profilePhoto }} permanent={true} />
      )
    }
  }

  /**
   * @param {object} postData
   *  Display Comment
   */
  displayComment = (item) => {
    if (item.comment.length > 3) {
      // console.log("=======moe than 3 comments===========");
      return (
        item.comment.slice(-3).map((comment) => {
          // console.log('comment ======================>', comment);
          let count = Object.keys(comment).length;
          // console.log("=]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]count=============>", count);
          if (comment && count > 0) {
            // console.log("========================in If=======================", count);
            return (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {this.commentProfile(comment)}
                  <View style={{ marginTop: 5, marginLeft: 15 }}>
                    <TouchableOpacity
                      onPress={() =>comment.userId._id ==  global.curruntUserData.data._id ?this.props.navigation.navigate('Profile'): this.props.navigation.navigate('UserProfile', { userId: comment.userId ,curruntUserId: global.curruntUserData.data._id})}
                    >
                      <Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10 }}>{comment.userId.userName}</Text>
                    </TouchableOpacity>
                    <Text style={styles.text}>{comment.comment}</Text>
                  </View>
                </View>
              </View>
            )
          } else {
            // console.log("========================in else=======================", count);
            return (
              null
            )
          }
        }).reverse()
      )
    } else {
      return (
        item.comment.map((comment) => {
          // console.log('comment ======================>', comment);
          let count = Object.keys(comment).length;
          // console.log("=]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]count=============>", count);
          if (comment && count > 0) {
            // console.log("========================in If=======================", count);
            return (
              <View>
                <View style={{ flexDirection: 'row' }}>
                  {this.commentProfile(comment)}
                  <View style={{ marginTop: 5, marginLeft: 15 }}>
                    <TouchableOpacity
                      onPress={() => comment.userId._id ==  global.curruntUserData.data._id ?this.props.navigation.navigate('Profile'):this.props.navigation.navigate('UserProfile', { userId: comment.userId ,curruntUserId: global.curruntUserData.data._id})}
                    >
                      <Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10 }}>{comment.userId.userName}</Text>
                    </TouchableOpacity>
                    <Text style={styles.text}>{comment.comment}</Text>
                  </View>
                </View>
              </View>
            )
          } else {
            // console.log("========================in else=======================", count);
            return (
              null
            )
          }
        }).reverse()
      )
    }
  }

  /**
   * @param {object} post
   * Display Comment Count
   */
  displayCommentCount = (item) => {
    // console.log("item.comment============>", item.comment[0])
    let count = Object.keys(item.comment[0]).length;
    // console.log('count=======in count=============>', count);
    if (count != 0) {
      return (
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('SinglePost', { id: item._id })}>
          <Text style={{ marginLeft: 10 }}>All {item.comment.length} comments</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        null
      )
    }
  }

  /**
   * @param {String} postId,UserId
   * Like Post 
  */
  like = async (postId) => {
    // console.log('postId============================>', postId);
    let apiBaseUrl = config.getBaseUrl() + "post/like";
    // console.log('apiBaseUrl===========>', apiBaseUrl);
    let payload = {
      "postId": postId,
      "userId": global.curruntUserData.data._id
    }
    postService.likePost(payload).
      then(response => {
        // console.log("-------------------------------------------------------------------------------------------");
        // console.log("response of  like=================>", response.data);
        // console.log("like successfull");
      }).then(() => {
        let payload = {
          "key": this.state.key,
        }
        postService.SearchHashTag(payload)
          .then(response => {
            // console.log('response of serach tag=================>', response.data);
            this.setState({ searchedPost: response.data.data })
          })
      })
      .catch(err => {
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /** 
   * @param {String} postId
   * Add Comment
   */
  comment = async (postId) => {
    // console.log('data=============================>', postId);
    this.setState({
      ButtonStateHolder: true
    })
    if (!this.state.comment) {
      alertService.alerAndToast("Enter any comment");
      this.setState({
        ButtonStateHolder: false
      })
    } else {
      // console.log('userId======================>', global.curruntUserData.data._id);
      // console.log('postId============================>', postId);
      const payload = {
        "postId": postId,
        "userId": global.curruntUserData.data._id,
        "comment": this.state.comment
      }
      postService.addComment(payload).
        then(response => {
          // console.log("comment successfull");
        }).then(() => {
          const payload = {
            "key": this.state.key,
          }
          postService.SearchHashTag(payload)
            .then(response => {
              // console.log('response of serach tag=================>', response.data);
              this.setState({ searchedPost: response.data.data, comment: '' })
            })
        })
        .catch(err => {
          console.log("err======>", err);
          alertService.alerAndToast("Internal Server Error");
        })
    }
  }

  /**
   * Get ProfilePhoto 
   */
  profilePic = (profile) => {
    console.log("profile pic===========================>", profile);
    if (!profile) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + profile }} permanent={true} />
      )
    }
  }

  render() {
    const Toast = (props) => {
      if (props.visible) {
        ToastAndroid.showWithGravityAndOffset(
          props.message,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          140,
        );
        return null;
      }
      return null;
    };
    console.log("Searched Post====================>", this.state.searchedUser);
    console.log("comment{{}}====================>", this.state.comment);
    return (
      <>
        {/* Search bar */}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ flex: 10 }}>
            <TextInput
              value={this.state.key}
              onChangeText={(key) => { this.setState({ key: key }), this.Search(key) }}
              placeholder={'Search'}
              style={styles.input}
              autoFocus={true}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => this.Search(this.state.key)}>
              <Icon name='search' color='black' size={27} style={{ marginTop: 8, opacity: 0.5, marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Searched UserName */}
        <ScrollView>
          <View style={{ elevation: 3, backgroundColor: 'white' }}>
            <FlatList
              data={this.state.searchedUser}
              style={{ elevation: 5 }}
              renderItem={({ item }) =>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 2 }}>
                    {this.profilePic(item.profilePhoto)}
                  </View>
                  <TouchableOpacity
                    style={{ flex: 8 }}
                    onPress={() => { item._id ==global.curruntUserData.data._id?this.props.navigation.navigate('Profile'): this.props.navigation.navigate('UserProfile', { userId: item ,curruntUserId: global.curruntUserData.data._id}) }}
                  >
                    <Text style={styles.name_text}>{item.userName}</Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    style={styles.button2}
                    onPress={() => this.handleClickFollow(item)}>
                    <Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}>Follow</Text>
                  </TouchableOpacity> */}
                </View>
              }
            />
          </View>
        </ScrollView>
        {/* Searched HashTag Posts */}
        <ScrollView>
          {this.state.searchedPost.map((item) =>
            <View style={styles.card}>
              <View>
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'row' }}>
                    {/* Display user profilepic And userNAme */}
                    <View style={{ flex: 10 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <View>
                          {this.profilePic(item)}
                        </View>
                        <View>
                          <TouchableOpacity
                            onPress={() => item.userId._id ==  global.curruntUserData.data._id?this.props.navigation.navigate('Profile'):this.props.navigation.navigate('UserProfile', { userId: item.userId,curruntUserId: global.curruntUserData.data._id })}
                          >
                            <Text style={styles.userName}>{item.userId.userName}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {/* Image Download Icon */}
                    <View style={{ flex: 1 }}>
                      <Icon onPress={() => { this.savePostImage(item.images) }}
                        name="file-download"
                        size={30}
                        color={this.state.ButtonStateHolder ? '#C0C0C0' : '#696969'}
                        disabled={this.state.ButtonStateHolder}
                        style={{ marginTop: 13 }}
                      />
                    </View>
                  </View>
                  {/* Display post Image */}
                  <Image resizeMode='cover' style={styles.post_img} source={{ uri: config.getMediaUrl() + item.images }}  />
                </View>
              </View>
              <View style={{ flexDirection: 'column' }}>
                {/* Display Like Icon And Counts */}
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <View>
                    {item.isLiked ? (<Icon name="favorite"
                      size={25}
                      onPress={() => this.like(item._id)}
                      style={{ marginLeft: 10, color: '#cd1d1f' }}
                    />) : (<Icon name="favorite-border"
                      size={25}
                      onPress={() => this.like(item._id)}
                      style={styles.like}
                    />)}
                  </View>
                  {item.like.length ? (item.like.length == 1 ? (<Text style={styles.likeText}>{item.like.length} like</Text>) : (<Text style={styles.likeText}>{item.like.length} likes</Text>)) : (null)}
                </View>
              </View>
              <View style={{ marginBottom: 10 }}>
                {/* Post caption  */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() =>item.userId._id ==  global.curruntUserData.data._id?this.props.navigation.navigate('Profile'): this.props.navigation.navigate('UserProfile', { userId: item.userId ,curruntUserId: global.curruntUserData.data._id})}
                  >
                    <Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10, textTransform: 'capitalize' }}>{item.userId.userName}</Text>
                  </TouchableOpacity>
                  <ParsedText
                    style={styles.text}
                    parse={
                      [
                        { pattern: /#(\w+)/, style: styles.hashTag },
                      ]
                    }
                    childrenProps={{ allowFontScaling: false }}
                  >
                    {item.content}
                  </ParsedText>
                </View>
                {/* Comment Input box */}
                <View style={{ marginBottom: 10, flexDirection: 'row' }}>
                  <View style={{ flex: 10 }}>
                    <TextInput
                      value={this.state.comment}
                      onChangeText={(comment) => this.setState({ comment: comment })}
                      placeholder={'Comment here....'}
                      style={styles.input}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.button}
                      onPress={() => this.comment(item._id)}
                      disabled={this.state.ButtonStateHolder}>
                      <Icon
                        name="send"
                        size={25}
                        color={this.state.ButtonStateHolder ? '#C0C0C0' : '#696969'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Display comment count */}
                {this.displayCommentCount(item)}
                {/* Display comment list */}
                {this.displayComment(item)}
              </View>
            </View>
          )}
        </ScrollView>
      </>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 5,
    position: 'absolute',
    marginLeft: 5
  },
  input: {
    padding: 4,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    marginBottom: 10,
    marginLeft: 10,
    borderRadius: 5
  },
  card: {
    elevation: 5,
    color: 'white',
    backgroundColor: 'white',
    borderBottomColor: '#ddd',
    borderBottomWidth: 2,
  },
  post_img: {
    height: 325,
    width: width * 1,
    marginTop: 10
  },
  userName: {
    color: 'black',
    fontSize: 18,
    marginLeft: 26,
    marginTop: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  text: {
    color: 'gray',
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    flexWrap: 'wrap'
  },
  like: {
    color: '#696969',
    marginLeft: 10,

  },
  likeText: {
    color: 'black',
    marginLeft: 10,
    marginTop: 4
  },
  profile: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginTop: 5,
    left: 10,
    borderColor: 'lightgray',
    borderWidth: 2,
  },
  hashTag: {
    color: '#3F729B'
  },
  button2: {
    marginTop: 15,
    height: 33,
    padding: 0,
    width: 70,
    backgroundColor: '#0099e7',
    borderRadius: 3,
    marginRight: 15,

  },
  name_text: {
    fontSize: 18,
    flexDirection: 'column',
    flex: 8,
    marginLeft: 10,
    marginTop: 14,
    color: 'black'
  },
});

