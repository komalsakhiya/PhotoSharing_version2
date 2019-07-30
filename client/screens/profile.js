import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, FlatList, Image, ScrollView, TouchableOpacity, Modal, ActivityIndicator, ToastAndroid, Dimensions } from 'react-native';
import Config from '../config';
import { AsyncStorage } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import { EventRegister } from 'react-native-event-listeners';
import userService from '../services/user.service';
import postService from '../services/post.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
const { width } = Dimensions.get('screen');
const config = new Config();
let sorted_posts;

export default class Profile extends Component {
  constructor(props) {
    super(props)
    global.curruntUserId = ""
    token = ''
    this.state = {
      curruntUserData: [],
      userPost: [],
      isVisible: false,
      userName: '',
      file: "",
      imageName: "",
      ButtonStateHolder: false,
    };
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.componentDidMount();
      });
  }

  componentDidMount = async () => {
    let userId;
    try {
      const curruntUser = await AsyncStorage.getItem('curruntUser');
      if (curruntUser) {
        userId = JSON.parse(curruntUser);
        global.curruntUserId = userId.data._id
        token = userId.token
        // console.log("value===+++++++++++++++++++++===========================>", userId.data._id,token);
      }
    } catch (error) {
      alertService.alerAndToast("User Data Not Found");
      console.log("err=====>", error)
    }
    this.getUserById();
    this.getPostsByUserId();
  }

  /**
   * @param {String} curruntUserId
   * Get User By Id
  */
  getUserById = () => {
    userService.getUserById(global.curruntUserId).
      then(response => {
        console.log('currunt user===================>', response.data);
        // console.log('currunt user post===================>', response.post);
        this.setState({
          curruntUserData: response.data.data
        })
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /**
   * @param {string} curruntUserId
   * Get POsts By UserId
   */
  getPostsByUserId = () => {
    postService.getPostByUserId(global.curruntUserId).
      then((response) => {
        console.log('currunt user postss========={}==========>', response.data.data);
        // console.log('currunt user postsssssssssssssssssssss===================>', response.data.post);
        if (response.data.data.length) {
          sorted_posts = response.data.data[0].post.sort((a, b) => {
            return new Date(a.created_date).getTime() -
              new Date(b.created_date).getTime()
          }).reverse();
          // console.log('sorted post==================================>', sorted_posts);
          this.setState({
            userPost: response.data.data[0]
          })
        }
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('resp', (resp) => {
      // console.log("response={{{}}}=====================", resp);
      this.setState({
        curruntUserData: resp.data
      })
    })
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  /** 
   * LoguOut User
   */
  logOut = async () => {
    console.log("logout==============");
    userService.logOut(global.curruntUserId).then((response) => {
      console.log('response===============>', response);
    })
      .then(async () => {
        await AsyncStorage.setItem('curruntUser', '');
        await AsyncStorage.setItem('fcmToken', '');
        const curruntUser = await AsyncStorage.getItem('curruntUser');
        console.log(']]]]]]]]]]]]]]]]]]', curruntUser);
        this.props.navigation.navigate('SignOut');
      })
      .catch((err) => {
        console.log('er=====>', err);
      })
  }

  openModal() {
    this.setState({ isVisible: true });
  }

  /**
   * @param {*} userData 
   * Edit Profile
   */
  editProfile = async (data, Data, image) => {
    console.log('data===============================>', data, Data, image);
    this.setState({
      ButtonStateHolder: true
    })
    const cleanFilePath = this.state.file.replace('file://', '');
    if (!data) {
      RNFetchBlob.fetch('PUT', config.getBaseUrl() + 'user/user', {
        'Content-Type': 'multipart/form-data',
        'token': token
      },
        [
          {
            name: 'userName',
            data: Data
          },
          {
            name: 'userId',
            data: global.curruntUserId
          },
          {
            name: 'profilePhoto',
            filename: this.state.imageName,
            data: RNFetchBlob.wrap(cleanFilePath)
          },
        ]).then((res) => {
          console.log('response====================>', res.data);
          console.log("=================response============>", JSON.parse(res.data));
          if (JSON.parse(res.data).message == 'Try other username.....') {
            alertService.alerAndToast("Try other userName...");
          } else {
            console.log("in else==========>")
            EventRegister.emit('resp', JSON.parse(res.data));
          }
          this.setState({
            ButtonStateHolder: false, file: '', imageName: ''
          })
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            ButtonStateHolder: false
          })
        })
    } else if (!image) {
      if (!data) {
        RNFetchBlob.fetch('PUT', config.getBaseUrl() + 'user/user', {
          'Content-Type': 'multipart/form-data',
          'token': token
        },
          [
            {
              name: 'userName',
              data: Data
            },
            {
              name: 'userId',
              data: global.curruntUserId
            },
          ]).then((res) => {
            console.log('response====================>', res.data);
            console.log("=================response============>", JSON.parse(res.data));
            if (JSON.parse(res.data).message == 'Try other username...') {
              console.log("]]]]]]]]]]]]]]]]]]]]]]]");
              alertService.alerAndToast("Try other username...");
            } else {
              console.log("in else==========>")
              EventRegister.emit('resp', JSON.parse(res.data));
            }
            this.setState({
              ButtonStateHolder: false, file: '', imageName: ''
            })
          })
          .catch((err) => {
            console.log(err);
            this.setState({
              ButtonStateHolder: false
            })
          })
      } else {
        RNFetchBlob.fetch('PUT', config.getBaseUrl() + 'user/user', {
          'Content-Type': 'multipart/form-data',
          'token': token
        },
          [
            {
              name: 'userName',
              data: data
            },
            {
              name: 'userId',
              data: global.curruntUserId
            },

          ]).then((res) => {
            console.log('response====================>', res.data);
            console.log("=================response============>", JSON.parse(res.data));
            if (JSON.parse(res.data).message == 'Try other username.....') {
              console.log("]]]]]]]]]]]]]]]]]]]]]]]");
              alertService.alerAndToast("Try other username...");
            } else {
              console.log("in else==========>")
              EventRegister.emit('resp', JSON.parse(res.data));
            }
            this.setState({
              ButtonStateHolder: false, file: '', imageName: ''
            })
          })
          .catch((err) => {
            console.log(err);
            this.setState({
              ButtonStateHolder: false
            })
          })
      }
    } else {
      RNFetchBlob.fetch('PUT', config.getBaseUrl() + 'user/user', {
        'Content-Type': 'multipart/form-data',
        'token': token
      },
        [
          {
            name: 'userName',
            data: data
          },
          {
            name: 'userId',
            data: global.curruntUserId
          },
          {
            name: 'profilePhoto',
            filename: this.state.imageName,
            data: RNFetchBlob.wrap(cleanFilePath)
          },
        ]).then((res) => {
          console.log('response====================>', res.data);
          if (JSON.parse(res.data).message == 'Try other username.....') {
            console.log("=================response============>", JSON.parse(res.data));
            console.log("]]]]]]]]]]]]]]]]]]]]]]]");
            alertService.alerAndToast("Try other username...");
          } else {
            console.log("in else==========>")
            EventRegister.emit('resp', JSON.parse(res.data));
          }
          this.setState({
            ButtonStateHolder: false, file: '', imageName: ''
          })
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            ButtonStateHolder: false, file: '', imageName: ''
          })
        })
    }
    this.setState({
      ButtonStateHolder: true,
      isVisible: false
    })
    this.setState({ isVisible: false });
  }

  /** 
   * Select Image From Gallary
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
        this.setState({ file: response.uri, imageName: response.fileName });
      }
      console.log('this.state.file=================>', this.state.file)
    })
  };

  /**
   * Get ProfilePhoto
   */
  profilePic = () => {
    console.log("profile pic===========================>", this.state.curruntUserData.profilePhoto, config.getMediaUrl(), this.state.curruntUserData.profilePhoto);
    if (!this.state.curruntUserData.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + this.state.curruntUserData.profilePhoto }} />
      )
    }
  }

  /** 
   *  Space Convert into underScore in UserName
   */
  userNameHandle(value) {
    this.setState({
      userName: value.replace(/\s/g, '_')
    })
    console.log("===============userName============", this.state.userName);
  }

  /**
   * Edit Profile Modal
   */
  editProfileModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.isVisible}
        onRequestClose={() => {
          this.setState({ isVisible: false })
        }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View>
            <View style={styles.container1}>
              <Text style={styles.titleText}>Edit Profile</Text>
              <View style={{ marginTop: 20 }}>
                <TextInput
                  value={this.state.userName}
                  onChangeText={(userName) => this.userNameHandle(userName)}
                  placeholder={this.state.curruntUserData.userName}
                  style={styles.input}
                />
                <Text style={{ marginLeft: 12 }}>Upload Profile</Text>
                <View style={{ flexDirection: 'row' }}>
                  {!this.state.file ? <View style={styles.ImageIcon}>
                    <Icon name="photo-library"
                      size={70}
                      onPress={this.pickImage}
                      style={{ textAlign: 'right', marginTop: 40 }}
                    />
                  </View> : <View style={styles.ImageIcon}>
                      <TouchableOpacity
                        onPress={this.pickImage}>
                        <Image source={{ uri: this.state.file }} style={styles.preview} />
                      </TouchableOpacity>
                    </View>}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: this.state.ButtonStateHolder ? '#607D8B' : '#0099e7' }]}
                disabled={this.state.ButtonStateHolder}
                onPress={() => this.editProfile(this.state.userName, this.state.curruntUserData.userName, this.state.imageName)}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 15 }}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  /**
   * display header
   */
  header() {
    return (
      <View style={{ height: 50, elevation: 3, backgroundColor: 'white' }}>
        <Text style={{ fontSize: 20, top: 10, left: 20 }}>Profile</Text>
        <TouchableOpacity
          style={{ position: 'absolute', right: 8, top: 10, }}
          onPress={this.logOut}>
          <Text style={{ fontSize: 15, color: 'black', borderWidth: 1.5, borderRadius: 10, paddingRight: 15, paddingLeft: 15, paddingTop: 5, paddingBottom: 5, borderColor: '#d6d7da' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    )
  }
  /**
   * @param {object} data
   * Display Count
   */

  userDetail = (data) => {
    console.log("data=============>", data)
    return (
      <>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 5 }}></View>
          {/* Display profile pic */}
          <View style={{ flex: 6 }}>
            {this.profilePic()}
          </View>
          <View style={{ flex: 5 }}></View>
        </View>
        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 22, textAlign: 'center', color: 'black' }}>{this.state.curruntUserData.userName}</Text>
        {/* Display post,following,followers count */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <View style={styles.footer}>
            {data.post ? <Text style={styles.textColor}>{data.post.length}</Text> : <Text style={styles.textColor}>0</Text>}
            <Text>Posts</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.textColor}>{data.followers.length}</Text>
            <Text>Followers</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.textColor}>{data.friends.length}</Text>
            <Text>Following</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => { this.openModal() }}
        >
          <Text style={{ textAlign: 'center', color: 'white' }}>Edit Profile</Text>
        </TouchableOpacity>
      </>
    )
  }

  render() {
    console.log("curruntUserData+++++++====================>", this.state.curruntUserData);
    console.log("posttttttsttttttttttttttttttt====================>", this.state.userPost);
    const curruntUserArray = this.state.curruntUserData.friends;
    const curruntUserPost = this.state.userPost.friends;
    console.log('curruntUserPost====>', curruntUserPost);
    console.log("file=================>", this.state.file)
    if (!curruntUserPost && curruntUserArray) {
      return (
        <>
          {/* header */}
          {this.header()}
          <View>
            <ScrollView>
              {/* Edit Profile Modal */}
              {this.editProfileModal()}
            </ScrollView>
          </View>
          <View style={{ backgroundColor: '#ffffff98' }}>
            {/* Display User Detail */}
            {this.userDetail(this.state.curruntUserData)}
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>No Post</Text>
          </View>
        </>
      )
    }
    else if (curruntUserPost) {
      return (
        <>
          <View>
            <ScrollView>
              {/* Edit Profile modal */}
              {this.editProfileModal()}
            </ScrollView>
          </View>
          {/* display header */}
          {this.header()}
          <View style={{ backgroundColor: '#ffffff98' }}>
            {/* Display User Detail */}
            {this.userDetail(this.state.userPost)}
          </View>
          <ScrollView>
            {/* Display post */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', margin: 5 }}>
                <FlatList
                  data={sorted_posts}
                  renderItem={({ item }) =>
                    <TouchableOpacity style={styles.GridViewContainer} onPress={() => this.props.navigation.navigate('SinglePost', { id: item._id })}>
                      <CacheableImage style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} permanent={true} />
                    </TouchableOpacity>
                  }
                  numColumns={3}
                />
              </View>
            </View>
          </ScrollView>
        </>
      );
    } else {
      return (
        <>
          {this.header()}
          {/* loader */}
          <View style={{ justifyContent: 'center', alignItem: 'center', flex: 1 }}>
            <View style={styles.horizontal}>
              <ActivityIndicator size="large" color="#ef6858" />
            </View>
          </View>
        </>
      )
    }
  }
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'column', flex: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: width / 3.2,
    width: width / 3.2,
    margin: 2
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  button: {
    margin: 20,
    height: 38,
    padding: 10,
    width: 'auto',
    backgroundColor: '#0099e7',
    borderRadius: 5,
  },
  textColor: {
    color: 'black',
    fontWeight: 'bold'
  },
  input: {
    width: 260,
    // height: 44,
    borderBottomWidth: 1,
    borderColor: '#C0C0C0',
    marginBottom: 10,
    marginLeft: 15,
  },
  container1: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e0e0',
    borderRadius: 10,
    width: 310,
    padding: 10,
    height: 'auto'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  preview: {
    height: 120,
    width: 120,
    borderRadius: 3,
    marginTop: 15
  },
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
  ImageIcon: {
    marginLeft: 'auto',
    marginRight: 'auto'
  }
});
