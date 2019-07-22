import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Image, ToastAndroid, ActivityIndicator, FlatList } from 'react-native';
import Config from '../config';
import postService from '../services/post.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
import userService from '../services/user.service';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
const config = new Config();
let sorted_posts;
const { width } = Dimensions.get('screen');

export default class UserProfile extends Component {
  constructor(props) {
    global.user = "",
      curruntUserId = '',
      curruntUserFriends = [],
      userData = ''
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
    this.setState({userData:global.user});
    curruntUserId = this.props.navigation.state.params.curruntUserId;
    console.log("=======================UserIdddddd{{{{}}}}===================", curruntUserId, global.user);
    userService.getUserById(curruntUserId).
      then(response => {
        console.log("curruntuserdata===============>", response.data.data);
        this.setState({ curruntUserFriends: response.data.data.friends })
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })


    /**
     * @param {String} userId
     * Get Posts By UserId
     */
    postService.getPostByUserId(this.props.navigation.state.params.userId._id).
      then(response => {
        // console.log('postttttttttttttttttttttttttttt===================>', response.data);
        if (response.data.data.length) {
          sorted_posts = response.data.data[0].post.sort((a, b) => {
            return new Date(a.created_date).getTime() -
              new Date(b.created_date).getTime()
          }).reverse();
          // console.log('sorted post==================================>', sorted_posts);
        }
        this.setState({
          post: response.data.data[0]
        })
          if (this.state.curruntUserFriends) {
            for (let i = 0; i <= this.state.curruntUserFriends.length; i++) {
              if (global.user._id == this.state.curruntUserFriends[i]) {
                console.log("unfollooooooowwwwww=========================>");
                if(this.state.post){
                this.state.post.isFollow = true;
                this.setState({ post: this.state.post })
                }else{
                  global.user.isFollow = true;
                }
                console.log("this.state.post=================>", this.state.post)
              } 
            }
          }
      })
      .catch(err => {
        console.log('er=====>', err);
        alertService.alerAndToast("Internal Server Error");
      })
  }


  /**
   * Get ProfilePhoto 
   */
  profilePic = () => {
    console.log("profile pic===========================>", global.user.profilePhoto);
    if (!global.user.profilePhoto) {
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('../images/profile.png')}
        />
      )
    } else {
      return (
        <CacheableImage resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + global.user.profilePhoto }} permanent={true} />
      )
    }
  }


  /**
 * @param {object} userData
 * Follow User
 */
  handleClickFollow = (item) => {
    console.log("data=====================================+++++++++++=====>", item);
    const payload = {
      "requestedUser": curruntUserId,
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
          if(this.state.post){
            this.state.post.isFollow = true;
            this.setState({ post: this.state.post })
          }else{
            this.state.userData.isFollow = true;
            this.setState({ userData: this.state.userData })
          }
        })
        .catch(err => {
          console.log("err======>", err);
          alertService.alerAndToast("Internal Server Error");
        })
    }
  }


  /**
   * @param {object} userData
   * Unfollow user 
   */
  handleClickUnfollow(item) {
    console.log('data====================>', item);
    this.setState({
      ButtonStateHolder: true
    })
    const payload = {
      "requestedUser": curruntUserId,
      "userTobeUnFollowed": item._id
    }
    console.log(payload)
    if (payload.requestedUser == payload.userTobeUnFollowed) {
      console.log("user can't Unfollow itself")
      alertService.alerAndToast("user can't Unfollow itself");
    } else {
      userService.handleClickUnfollow(payload)
        .then(response => {
          console.log("response=====>    ", typeof response.data);
          console.log("Unfollow sucessfully................");
          if(this.state.post){
            this.state.post.isFollow = false;
            this.setState({ post: this.state.post })
          } else{
            this.state.userData.isFollow = false;
            this.setState({userData:this.state.userData})
          }
          this.setState({ ButtonStateHolder: false })
        })
        .catch(err => {
          console.log(err);
          this.setState({ ButtonStateHolder: false });
          alertService.alerAndToast("Internal Server Error");
        })
    }
  }

  /**
   * display userDetails
   * @param { object} data
   */
  userDetails = (data) => {
    // console.log("data==============>", data);
    return (
      <>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 5 }}></View>
          <View style={{ flex: 6 }}>
            {this.profilePic()}
          </View>
          <View style={{ flex: 5 }}></View>
        </View>
        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 22, textAlign: 'center', color: 'black' }}>{data.userName}</Text>
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          {/* Display post,following,followers count */}
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
        {data.isFollow ? <TouchableOpacity
          style={styles.button}
          onPress={() => { this.handleClickUnfollow(data) }}
        >
          <Text style={{ textAlign: 'center', color: 'white' }}>Unfollow</Text>
        </TouchableOpacity> : <TouchableOpacity
          style={styles.button}
          onPress={() => { this.handleClickFollow(data) }}
        >
            <Text style={{ textAlign: 'center', color: 'white' }}>Follow</Text>
          </TouchableOpacity>}

      </>
    )
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
            {/* loader */}
            <View style={[styles.horizontal, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#ef6858" />
            </View>
          </>
        )
      } else {
        return (
          <>
            <View style={{ backgroundColor: '#ffffff98', paddingBottom: 20 }}>
              {this.userDetails(this.state.post)}
              {/* Display profilepic and userName */}
            </View>
            {/* Display post */}
            <ScrollView>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'row', margin: 5 }}>
                  <FlatList
                    data={sorted_posts}
                    renderItem={({ item }) =>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('SinglePost', { id: item._id })}>
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
      }
    } else {
      console.log('this.state.userData==============>',this.state.userData)
      return (
        <>
          <View style={{ backgroundColor: '#ffffff98', paddingBottom: 20 }}>
            {/* Display profilepic and userName */}
            {this.userDetails(this.state.userData)}
          </View>
          {/* There are no post */}
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
  button: {
    margin: 20,
    height: 38,
    padding: 10,
    width: 'auto',
    backgroundColor: '#0099e7',
    borderRadius: 5,
  },
});
