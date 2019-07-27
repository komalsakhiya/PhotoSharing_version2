import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, FlatList, Image, ScrollView, TouchableOpacity, AsyncStorage, Dimensions, ActivityIndicator, Alert, ToastAndroid, Animated, CameraRoll } from 'react-native';
import Config from '../config';
import { PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from "rn-fetch-blob";
import ParsedText from 'react-native-parsed-text';
import RBSheet from "react-native-raw-bottom-sheet";
import postService from '../services/post.service';
import userService from '../services/user.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
const config = new Config();
const { width } = Dimensions.get('screen');


export default class Post extends Component {
  constructor(props) {
    super(props)
    global.curruntUserId = "",
      global.message = ""
    this.springValue = new Animated.Value(100);
    this.state = {
      post: [],
      like: [],
      comment: '',
      isVisible: false,
      popoverAnchor: { x: 90, y: 200, width: 80, height: 60 },
      likeCount: 0,
      visible: false,
      ButtonStateHolder: false,
      allUser: [],
      modalVisible: false,
      animation: new Animated.Value(0),
      postId: '',
      backClickCount: 0,
      page: 1,
      postIndex: '',
      curruntUserData: [],
      message : ''
    };
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.setState({ post: [], page: 1 })
        this.getFriendsPost();
      });
  }

  componentDidMount = async () => {
    let userId;
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser) {
        userId = JSON.parse(curruntUser);
        console.log("value===+++++++++in post++++++++++++===========================>", userId.data._id);
        global.curruntUserId = userId.data._id;
      }
    } catch (error) {
      alertService.alerAndToast("User Data Not Found");
      console.log("errr=====>", error)
    }
    // this.getFriendsPost();
    this.getAllUser();
    this.getUserById();
  }

  /**
   * @param {String} userId
   * Get User By Id
   */
  getUserById = () => {
    userService.getUserById(global.curruntUserId).
      then(response => {
        // console.log('currunt user===================>', response.data);
        // console.log('currunt user post===================>', response.post);
        this.setState({
          curruntUserData: response.data.data
        })
        // console.log("curruntUser================>", this.state.curruntUserData)
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /**
   * Get Friends Posts
   * @param {*} CurruntuserId
   */
  getFriendsPost = async () => {
    let userId;
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser) {
        userId = JSON.parse(curruntUser);
        console.log("value===+++++++++in post++++++++++++===========================>", userId.data._id);
        global.curruntUserId = userId.data._id
      }
    } catch (error) {
      alertService.alerAndToast("User Data Not Found");
      Console.log("errr=====>", error)
    }
    let pageNumber = this.state.page
    postService.getFriendsPost(global.curruntUserId, pageNumber).
      then((response) => {
        // console.log('response.data.data===============>', response)
        // console.log('all friends postttttttttttttttttttttttttttt===================>', response.data.data.friendsPost.length);
        // console.log('all friends postttttttttttttttttttttttttttt===================>', response.data.data.friendsPost);
        // console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]", Object.keys(response.data.data.friendsPost[0]).length);
        if (response.data.status === 404) {
          this.setState({message:response.data.message}) 
          global.message = response.data.message
        }
        if (response.data.data) {
          if (Object.keys(response.data.data).length > 1) {
            for (let i = 0; i < response.data.data.friendsPost.length; i++) {
              for (let j = 0; j < response.data.data.friendsPost[i].like.length; j++) {
                if (global.curruntUserId == response.data.data.friendsPost[i].like[j]) {
                  response.data.data.friendsPost[i].isLiked = true
                } else {
                  response.data.data.friendsPost[i].isLiked = false
                }
              }
            }
          }
          this.setState(prevState => ({
            post: [...prevState.post, ...response.data.data.friendsPost]
            // post:response.data.data.friendsPost
          }))
        }

      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /**
   * @param {String} postId,index,isLiked
   * Like Post
   */
  like = async (postId, index, isLiked) => {
    let likearr;
    console.log('postId============================>', postId, index, isLiked);
    const payload = {
      "postId": postId,
      "userId": global.curruntUserId
    }
    postService.likePost(payload).
      then(function (response) {
        console.log("-------------------------------------------------------------------------------------------");
        console.log("response of  like=================>", response.data);
        likearr = response.data.data.like;
        console.log("like successfull");
      })
      .then(() => {
        console.log(this.state.post[index].isLiked);
        this.state.post[index].isLiked = isLiked;
        this.state.post[index].like = likearr;
        this.setState({ post: this.state.post })
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /**
   * @param {String} postId  
   *  Add Comment 
  */
  comment = async (postId, index) => {
    let commentData;
    console.log('data=============================>', postId, index);
    this.setState({
      ButtonStateHolder: true
    })
    if (!this.state.comment) {
      ToastAndroid.show('Enter any comment', ToastAndroid.SHORT);
      this.setState({
        ButtonStateHolder: false
      })
    } else {
      console.log('postId============================>', postId, userName);
      const payload = {
        "postId": postId,
        "userId": global.curruntUserId,
        "comment": this.state.comment
      }
      postService.addComment(payload).
        then(function (response) {
          console.log("response============>", response.data);
          commentData = response.data.data
          console.log("comment successfull", commentData);
        }).then(() => {
          console.log("postttt ============ in comment()=============>", this.state.post[index].comment)
          // this.setState({ page: 1, post: [] })
          // this.getFriendsPost();
          const addComment = {
            comment: commentData.comment,
            userId: {
              _id: this.state.curruntUserData._id,
              userName: this.state.curruntUserData.userName,
              profilePhoto: this.state.curruntUserData.profilePhoto
            }
          }
          console.log('addComment:---------------------------- ', addComment);
          this.state.post[index].comment.push(addComment);
          this.setState({ post: this.state.post });
        })
        .catch(err => {
          console.log('er=====>', err);
          alertService.alerAndToast("Internal Server Error");
        })
      this.setState({
        comment: '',
        ButtonStateHolder: false
      })
    }
  }

  /**
   * @param {*} Image
   * Save post Image
   */
  savePostImage = (data) => {
    ToastAndroid.show('Downloading...', ToastAndroid.SHORT);
    console.log("=====================", data);
    this.setState(
      {
        visible: true,
        ButtonStateHolder: true
      }
    );
    if (Platform.OS === 'android') {
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
            ToastAndroid.show('Download completed', ToastAndroid.SHORT);
            console.log('The file saved to ', res)
          })
      })
    } else {
      CameraRoll.saveToCameraRoll(config.getMediaUrl() + data)
        .then(Alert.alert('Success', 'Photo added to camera roll!'))
    }
    setTimeout(() => {
      this.setState({ ButtonStateHolder: false })
    }, 700)
  }

  /**
   * @param {*} profilePhoto
   * Get ProfilePhoto
   */
  profilePic = (profilePhoto) => {
    if (!profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <CacheableImage resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + profilePhoto }} permanent={true} />
      )
    }
  }

  /**
   * @param {*} comment
   * Get Comment ProfilePhto
   */
  commentProfile = (comment) => {
    // console.log("comment in commentProfile========================>", comment.userId.profilePhoto)
    if (!comment.userId.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <CacheableImage resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + comment.userId.profilePhoto }} permanent={true} />
      )
    }
  }

  /**
   * @param {*} postData
   * Display Comment
   */
  displayComment = (item) => {
    // console.log("item in displaycomment=======================>", item)
    // Comment is more than three
    if (item.comment.length > 3) {
      // console.log("=======moe than 3 comments===========");
      return (
        item.comment.slice(-3).map((comment) => {
          // console.log('comment ======================>', comment);
          let count = Object.keys(comment).length;
          // console.log("=]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]count=============>", count);
          if (comment && count > 0) {
            // console.log("========================in If={{{{{{{}}}}}}}======================", count, comment.userId.userName);
            return (
              <View>
                {/* Display UserName  and Comment Content*/}
                <View style={{ flexDirection: 'row' }}>
                  {this.commentProfile(comment)}
                  <View style={{ marginTop: 5, marginLeft: 15 }}>
                    <TouchableOpacity
                      onPress={() => comment.userId._id == global.curruntUserId ? this.props.navigation.navigate('Profile'):this.props.navigation.navigate('UserProfile', { userId: comment.userId,curruntUserId:global.curruntUserId })}
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
      // Comment are less than three
      return (
        item.comment.map((comment) => {
          // console.log('comment ======================>', comment);
          const count = Object.keys(comment).length;
          // console.log("=]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]count=============>", count);
          if (comment && count > 0) {
            // console.log("========================in If{={{}}}======================", count, comment.userId.userName);
            return (
              <View>
                {/* Display UserName  and Comment Content*/}
                <View style={{ flexDirection: 'row' }}>
                  {this.commentProfile(comment)}
                  <View style={{ marginTop: 5, marginLeft: 15 }}>
                    <TouchableOpacity
                      onPress={() => comment.userId._id == global.curruntUserId ? this.props.navigation.navigate('Profile'):this.props.navigation.navigate('UserProfile', { userId: comment.userId,curruntUserId:global.curruntUserId  })}
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
   * @param {*} postData
   * Display Comment Count
   */
  displayCommentCount = (item) => {
    // console.log("item.comment============>", item.comment[0])
    let count = Object.keys(item.comment[0]).length;
    // console.log('count=======in count=============>', count);
    if (count) {
      return (
        // Display comment count
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
   * Get All Users
   */
  getAllUser = () => {
    userService.getAllUser().
      then((response) => {
        // console.log('all user===============================>', response);
        this.setState({
          allUser: response.data.data,
        })
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /** Open RBSheet For Share Post  */
  sharePost = (postId, index) => {
    console.log(" share postid ====================================> ", postId, index);
    this.RBSheet.open();
    this.setState({
      postId: postId,
      postIndex: index
    })
  }

  /** 
   * @param {*} userId
   * shared Post to user
   */
  sendPost = (userId) => {
    console.log("========================sharepost ======================================", userId, this.state.postId, global.curruntUserId, this.state.postIndex);
    this.setState({ ButtonStateHolder: true })
    let payload = {
      "postId": this.state.postId,
      "srcId": global.curruntUserId,
      "desId": userId
    }
    console.log('payload==={{{{{{{{payload}}}}}}}}==============>', payload)
    postService.sendPost(payload).
      then(function (response) {
        console.log("Shared post successfullllllllllllll=================", response.data);
        // sharePostCount = response
      })
      .then(() => {
        this.RBSheet.close();
        this.setState({ ButtonStateHolder: false })
        this.state.post[this.state.postIndex].sharePostCount = this.state.post[this.state.postIndex].sharePostCount + 1;
        this.setState({ post: this.state.post })
        // this.state.post[index]
        // this.getFriendsPost();
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
        this.setState({ ButtonStateHolder: false })
      })
  }

  /** 
  * handle page number for get post images
  */
  handleEnd = () => {
    console.log("handleend callll==================>", this.state.page);
    this.setState(prevState => ({ page: prevState.page + 1 }), () => this.getFriendsPost());
  }


  render() {
    const Toast = (props) => {
      if (props.visible) {
        ToastAndroid.showWithGravityAndOffset(
          props.message,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
        return null;
      }
      return null;
    };
    // console.log("postttttttttttttttttttttt================================>", this.state.post, global.message);
    // console.log("post=================friend===============>", this.state.post.friendsPost);
    // console.log("comment================================>", this.state.comment);
    // console.log("all users=====this.state.user===========================>", this.state.allUser);
    // console.log("post==========this.state.post==========>", this.state.post)
    if (this.state.post.length) {
      let friendpostarr = this.state.post;
      console.log('friendpostarr==============>', friendpostarr.length)
      // console.log('friendpostarr==============>',friendpostarr)
      if (!friendpostarr) {
        return (
          <>
            <View style={[styles.container, styles.horizontal]}>
              <ActivityIndicator size="large" color="#ef6858" />
            </View>
          </>
        )
      }
      else if (friendpostarr[0].comment.length > 0 && Object.keys(friendpostarr[0]).length > 2 && (Object.keys(friendpostarr[0].comment).length > 2 || Object.keys(friendpostarr[0].comment).length >= 0)) {
        return (
          <>
            {/* header */}
            <View style={{ height: 50, elevation: 3, backgroundColor: 'white' }}>
              <Text style={{ fontSize: 20, top: 10, left: 20 }}>Posts</Text>
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 15, }}
                onPress={() => this.props.navigation.navigate('Message')}
              >
                <Image style={{ height: 25, width: 25 }}
                  source={require('../images/Share_icon.png')}
                />
              </TouchableOpacity>
            </View>

            {/* posts  */}
            <FlatList
              data={friendpostarr}
              keyExtractor={(index) => index}
              onEndReachedThreshold={0.6}
              onEndReached={() => {
                this.handleEnd();
              }}
              onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
              renderItem={({ item, index }) =>
                <View style={styles.card}>
                  <View>
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row' }}>
                        {/* Display user profilepic And userNAme */}
                        <View style={{ flex: 10 }}>
                          <View style={{ flexDirection: 'row' }}>
                            <View>
                              {this.profilePic(item.userId.profilePhoto)}
                            </View>
                            <View>
                              <TouchableOpacity
                                onPress={() => item.userId._id == global.curruntUserId ? this.props.navigation.navigate('Profile') :this.props.navigation.navigate('UserProfile', { userId: item.userId ,curruntUserId:global.curruntUserId })}
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
                      <CacheableImage resizeMode='cover' style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} permanent={true} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    {/* Display Like Icon And Counts */}
                    <View style={{ flexDirection: 'row', flex: 9 }}>
                      {item.isLiked ? (<Icon name="favorite"
                        size={25}
                        onPress={() => this.like(item._id, index, false)}
                        style={{ marginLeft: 10, color: '#cd1d1f' }}
                      />) : (<Icon name="favorite-border"
                        size={25}
                        onPress={() => this.like(item._id, index, true)}
                        style={styles.like}
                      />)}
                      {item.like.length > 0 ? ((item.like.length == 1 ? (<Text style={styles.likeText}>{item.like.length} like</Text>) : (<Text style={styles.likeText}>{item.like.length} likes</Text>))) : (null)}
                    </View>
                    {/* Share Post Icon */}
                    <View style={{ flexDirection: 'row', flex: 3, right: 10, position: 'absolute' }}>
                      {item.sharePostCount != 0 ? (<Text style={[styles.likeText, { marginRight: 9 }]}>{item.sharePostCount} Share</Text>) : (null)}
                      <TouchableOpacity
                        onPress={() => this.sharePost(item._id, index)}
                      >
                        <Image style={{ height: 20, width: 20, marginTop: 7 }}
                          source={require('../images/Share_icon.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ marginBottom: 10 }}>
                    {/* Post caption  */}
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                      <TouchableOpacity
                        onPress={() => item.userId._id == global.curruntUserId ?this.props.navigation.navigate('Profile'):this.props.navigation.navigate('UserProfile', {
                          userId: item.userId,curruntUserId:global.curruntUserId 
                        })}
                      >
                        {item.content ? (<Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10 }}>{item.userId.userName}</Text>) : (null)}
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
                          onChangeText={(text) => this.setState({ comment: text })}
                          placeholder={'Comment here....'}
                          style={styles.input}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.button}
                          onPress={() => this.comment(item._id, index)}
                          disabled={this.state.ButtonStateHolder}>
                          <Icon
                            name="send"
                            size={25}
                            color={this.state.ButtonStateHolder ? '#C0C0C0' : '#696969'}
                          />
                        </TouchableOpacity>
                        <Toast ref="toast" />
                      </View>
                    </View>
                    {/* Display comment count */}
                    {this.displayCommentCount(item)}
                    {/* Display comment list */}
                    {this.displayComment(item)}
                  </View>

                  {/** All User for Share Post */}
                  <View style={{ marginBottom: 10 }}>
                    <RBSheet
                      ref={ref => {
                        this.RBSheet = ref;
                      }}
                      height={400}
                      duration={250}
                      customStyles={{
                        container: {
                          borderTopLeftRadius: 15,
                          borderTopRightRadius: 15
                        }
                      }}
                    >
                      <ScrollView>
                        <FlatList
                          data={this.state.allUser}
                          renderItem={({ item }) =>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ flex: 2 }}>
                                {this.profilePic(item.profilePhoto)}
                              </View>
                              <TouchableOpacity
                                style={{ flex: 8 }}
                                onPress={() => {item._id == global.curruntUserId?this.props.navigation.navigate('Profile'): this.props.navigation.navigate('UserProfile', { userId: item,curruntUserId:global.curruntUserId  }), this.RBSheet.close(); }}
                              >
                                <Text style={{ marginTop: 10, color: 'black', fontSize: 18, marginLeft: 10 }}>{item.userName}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.button1, { backgroundColor: this.state.ButtonStateHolder ? '#607D8B' : '#0099e7', flex: 3 }]}
                                disabled={this.state.ButtonStateHolder}
                                onPress={() => this.sendPost(item._id)}
                              >
                                <Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}>Send</Text>
                              </TouchableOpacity>
                            </View>

                          }
                        />
                      </ScrollView>
                    </RBSheet>
                  </View>
                </View>
              }
            />
          </>
        );
      }
    } else if (this.state.message) {
      return (
        <>
          <View style={{ height: 50, elevation: 3, backgroundColor: 'white' }}>
            <Text style={{ fontSize: 20, top: 10, left: 20 }}>Posts</Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: 10, top: 15, }}
              onPress={() => this.props.navigation.navigate('Message')}
            >
              <Image style={{ height: 25, width: 25 }}
                source={require('../images/Share_icon.png')}
              />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>No Post</Text>
          </View>
        </>
      )
    } else {
      return (
        <>
          <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" color="#ef6858" />
          </View>
        </>
        // <>
        //   {/* Header */}
        //   <View style={{ height: 50, elevation: 3, backgroundColor: 'white' }}>
        //     <Text style={{ fontSize: 20, top: 10, left: 20 }}>Posts</Text>
        //     {/* Messege Icon */}
        //     <TouchableOpacity
        //       style={{ position: 'absolute', right: 10, top: 15, }}
        //       onPress={() => this.props.navigation.navigate('Message')}
        //     >
        //       <Image style={{ height: 25, width: 25 }}
        //         source={require('../images/Share_icon.png')}
        //       />
        //     </TouchableOpacity>
        //   </View>
        //   {/** There are no post */}
        //   <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        //     <Text >No post yet</Text>
        //   </View>
        // </>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  input: {
    height: 35,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    padding: 0,
    borderRadius: 5,
    marginLeft: 10,
  },
  button: {
    marginTop: 3,
    position: 'absolute',
    marginLeft: 5
  },
  MainContainer:
  {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: (Platform.OS === 'ios') ? 20 : 0
  },
  textStyle: {
    color: '#fff',
    fontSize: 22
  },
  footer: {
    flexDirection: 'column', flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    elevation: 5,
    color: 'white',
    backgroundColor: 'white',
    borderBottomColor: '#ddd',
    borderBottomWidth: 2,
  },
  img: {
    height: 325,
    width: width * 1,
    marginTop: 10
  },
  buttons: {
    backgroundColor: 'white',
    height: 30,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: 'black'
  },
  userName: {
    color: 'black',
    fontSize: 18,
    marginLeft: 20,
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
    marginLeft: 9,
    marginTop: 4
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  profile: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginTop: 5,
    left: 10,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
  hashTag: {
    color: '#3F729B'
  },
  sheet: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  popup: {
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  button1: {
    marginTop: 15,
    height: 33,
    padding: 0,
    width: 70,
    backgroundColor: '#0099e7',
    borderRadius: 3,
    marginRight: 22,
  },
  animatedView: {
    width,
    backgroundColor: "#4b415a",
    elevation: 2,
    position: "absolute",
    bottom: 0,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  exitTitleText: {
    textAlign: "center",
    color: "#fff",
    marginRight: 10,
  },
  exitText: {
    color: "#e5933a",
    paddingHorizontal: 10,
    paddingVertical: 3
  }
});

