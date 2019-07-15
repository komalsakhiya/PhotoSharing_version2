import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image, ScrollView, TouchableOpacity, AsyncStorage, ActivityIndicator, Dimensions, ToastAndroid } from 'react-native';
import Config from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Popover from 'react-native-popover-view';
import { EventRegister } from 'react-native-event-listeners';
import ParsedText from 'react-native-parsed-text';
import _ from 'lodash';
import postService from '../services/post.service';
let { width } = Dimensions.get('window');
let config = new Config();

export default class SinglePost extends Component {
  constructor(props) {
    super(props)
    global.curruntUserData = ""
    this.state = {
      like: [],
      comment: '',
      post: [],
      isVisible: false,
      popoverAnchor: { x: 340, y: 40, width: 80, height: 60 },
      modalVisible: false,
      useName: '',
      content: '',
      ButtonStateHolder: false,
    }
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getPost();
      });
  };
  /**
   * Get CurruntUser Details from Storage
   */
  componentDidMount = async () => {
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser) {
        data = JSON.parse(curruntUser);
        global.curruntUserData = data
        console.log("value===+++++++++++++++++++++===========================>", global.curruntUserData.data._id);
      }
    } catch (error) {
      if (Platform.OS === 'ios') {
        alert('User Data Not Found')
      } else {
        ToastAndroid.show('User Data Not Found', ToastAndroid.SHORT);
      }
      console.log("err===>", err)
    }
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('resp', (resp) => {
      console.log("hello======================", resp);
      this.setState(prevState => ({
        post: [resp]
      }))
    })
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  /** 
   * @param {String} postId
   * Get Post By Id
  */
  getPost() {
    const postId = this.props.navigation.state.params.id;
    console.log("postid==================>", postId);
    postService.getPostById(postId).
      then(response => {
        console.log('find post===================>', response.data);
        for (let i = 0; i < response.data.data[0].like.length; i++) {
          if (global.curruntUserData.data._id == response.data.data[0].like[i]) {
            response.data.data[0].isLiked = true;
          } else {
            response.data.data[0].isLiked = false
          }
        }
        this.setState(prevState => ({
          post: response.data.data,
          comment: ''
        }))
      })
      .catch(err => {
        console.log('errrr in single post=================>', err);
        // alert('Internal Server Error')
        if (Platform.OS === 'ios') {
          alert('Internal Server Error')
        } else {
        ToastAndroid.show('Internal Server Error', ToastAndroid.SHORT);
        }
      })
  }

  /**
   * @param {String} postId
   * Like Post
   */
  like = async (postId) => {
    console.log('userId======================>', global.curruntUserData.data._id);
    console.log('postId============================>', postId);
    let apiBaseUrl = config.getBaseUrl() + "post/like";
    console.log('apiBaseUrl===========>', apiBaseUrl);
    let payload = {
      "postId": postId,
      "userId": global.curruntUserData.data._id
    }
    postService.likePost(payload).
      then(response => {
        console.log("-------------------------------------------------------------------------------------------");
        console.log("response=================>", response.data);
        console.log("like successfull");
      })
      .then(() => {
        this.getPost();
      })
  }

  /**
   * @param {String} postId
   * Add Comment
   */
  comment = async (postId) => {
    console.log('data=============================>', postId);
    if (!this.state.comment) {
      if (Platform.OS === 'ios') {
        alert('Enter any comment')
      } else {
      ToastAndroid.show('Enter any comment', ToastAndroid.SHORT);
      }
    } else {
      console.log('userId======================>', global.curruntUserData.data._id);
      console.log('postId============================>', postId);
      let payload = {
        "postId": postId,
        "userId": global.curruntUserData.data._id,
        "comment": this.state.comment
      }
      postService.addComment(payload).
        then(function (response) {
          console.log("response=================>", response.data);
          console.log("comment successfull");
        })
        .then(() => {
          this.getPost();
        })
    }
  }

  /**
   * @param {String} postId
   *  Delete Post
   */
  deletePost = (postId) => {
    console.log('postid=====================>', postId);
    let payload = {
      "postId": postId,
    }
    console.log('payload==============>', payload)
    postService.deletePost(payload).
      then(response => {
        console.log("response===============s==>", response.data);
        if (Platform.OS === 'ios') {
          alert(response.data.message)
        } else {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
        }
      })
      .then(() => this.props.navigation.navigate('Profile'))
      .catch(err => {
        // console.log("errrrr============>",err)
        console.log('er=====>', err.response.data.message);
        // alert('Internal Server Error')
        if (Platform.OS === 'ios') {
          alert(err.response.data.message)
        } else {
        ToastAndroid.show(err.response.data.message, ToastAndroid.SHORT);
        }
      })
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  openModal() {
    console.log("======open model call ===========")
    this.setState({ modalVisible: true });
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
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + item.userId.profilePhoto }} />
      )
    }
  }

  /**
   * @param {object} comment
   * Display Comment
   */
  displayComment = (item) => {
    return (
      item.comment.map((comment) => {
        let count = Object.keys(comment).length;
        console.log("=]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]count=============>", count);
        if (comment && count > 0) {
          console.log("========================in If=======================", count);
          return (
            <View>
              <View style={{ flexDirection: 'row' }}>
                {this.profilePic(comment)}
                <View style={{ marginTop: 5, marginLeft: 15 }}>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('UserProfile', { userId: comment.userId })}
                  >
                    <Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10 }}>{comment.userId.userName}</Text>
                  </TouchableOpacity>
                  <Text style={styles.text}>{comment.comment}</Text>
                </View>
              </View>
            </View>
          )
        } else {
          console.log("========================in else=======================", count);
          return (
            null
          )
        }
      }).reverse()
    )
  }

  /**
   * @param {object} post
   * Display Comment Count
   */
  displayCommentCount = (item) => {
    let count = Object.keys(item.comment[0]).length;
    console.log('count=======in count=============>', count);
    if (count) {
      return (
        <Text style={{ marginLeft: 10 }}>All comments</Text>
      )
    } else {
      return (
        null
      )
    }
  }

  /**
   * @param {String} postId
   * Propover Icon
   */
  editPostIcon = (id) => {
    console.log("=============calling editeicon============");
    console.log('curruntuserId========================>', global.curruntUserData.data._id, id);
    if (global.curruntUserData.data._id == id) {
      console.log("==========true============");
      return (
        <TouchableOpacity
          onPress={() => this.setState({ isVisible: true })}>
          <Icon
            name='more-vert'
            color='#696969'
            size={30}
            style={{ marginTop: 10 }}
          />
        </TouchableOpacity>
      )
    } else {
      return (
        null
      )
    }
  }

  /**
   * @param {object} post
   * Display Content  
   */
  displayContent = (item) => {
    // console.log('item======content========================================>',item);
    return (
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
    )
  }

  render() {
    console.log("posttttttttt=============>", this.state.post);
    // console.log("this.state.comment===================>", this.state.comment);
    if (this.state.post.length == 0) {
      return (
        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" color="#ef6858" />
        </View>
      )
    } else {
      return (
        <>
          <ScrollView>
            {this.state.post.map((item) =>
              <View style={styles.card}>
                <View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flex: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                          <View>
                            {this.profilePic(item)}
                          </View>
                          <View>
                            <Text style={styles.userName}>{item.userId.userName}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        {this.editPostIcon(item.userId._id)}
                      </View>
                      <Popover
                        isVisible={this.state.isVisible}
                        popoverStyle={{ height: 70, width: 100 }}
                        onRequestClose={() => {
                          this.setState({ isVisible: false })
                        }}
                        placement='bottom'
                        fromRect={this.state.popoverAnchor}
                      >
                        <View>
                          <TouchableOpacity onPress={() => { this.setState({ isVisible: false }), this.props.navigation.navigate('EditPost', { post: this.state.post }) }}>
                            <View style={styles.buttons}>
                              <Text style={styles.buttonText}>Edit</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { this.setState({ isVisible: false }), this.deletePost(item._id) }}>
                            <View style={styles.buttons}>
                              <Text style={styles.buttonText}>Delete</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </Popover>
                    </View>
                    <Image resizeMode='cover' style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
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
                  <View>
                    {item.like.length ? ((item.like.length == 1 ? (<Text style={styles.likeText}>{item.like.length} like</Text>) : (<Text style={styles.likeText}>{item.like.length} likes</Text>))) : (null)}
                  </View>
                </View>
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
                    <TouchableOpacity style={{ marginLeft: 5, position: 'absolute', marginTop: 3 }}
                      onPress={() => this.comment(item._id)}>
                      <Icon
                        name="send"
                        size={25}
                        style={{ color: 'black', opacity: 0.5 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    {item.content ? (<Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 10 }}>{item.userId.userName}</Text>) : (null)}
                    {this.displayContent(item)}
                  </View>
                  {this.displayCommentCount(item)}
                  {this.displayComment(item)}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      );
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
  card: {
    elevation: 5,
    color: 'white',
    backgroundColor: 'white',
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
  input: {
    height: 35,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    padding: 0,
    borderRadius: 5,
    marginLeft: 10,
  },
  userName: {
    color: 'black',
    fontSize: 20,
    marginLeft: 20,
    marginTop: 10,
    fontWeight: 'bold'
  },
  like: {
    color: '#696969',
    marginLeft: 10,

  },
  likeText: {
    color: 'black',
    marginLeft: 10,
    marginTop: 3
  },
  text: {
    color: 'gray',
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    flexWrap: 'wrap'
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
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  hashTag: {
    color: '#3F729B'
  },
});