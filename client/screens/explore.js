import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ToastAndroid, ActivityIndicator, Dimensions } from 'react-native';
import Config from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import postService from '../services/post.service';
import alertService from '../services/alert.service';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CacheableImage = imageCacheHoc(Image, {
  validProtocols: ['http', 'https']
});
const { width } = Dimensions.get('screen');
const config = new Config();

export default class Explore extends Component {
  constructor(props) {
    super(props)
    pageCount = 0
    this.state = {
      posts: [],
      data: [],
      page: 1,
      loading: true,
      ButtonStateHolder: false,
      message: ''
    }
    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getAllPost();
      });
  };

  /**
   * Get All Post
   */
  getAllPost = async () => {
    const pageNumber = this.state.page
    postService.getAllPost(pageNumber)
      .then(response => {
        console.log('all post postss===================>', response.data);
        console.log('totalcount==========>',response.data.totalCount);
        this.pageCount = response.data.totalCount;
        if (response.data.status === 404) {
          this.setState({ message: response.data.message })
          global.message = response.data.message
        }
        if (response.data.data) {
          this.setState(prevState => ({
            posts: [...prevState.posts, ...response.data.data]
          }))
        }
      })
      .catch(err => {
        alertService.alerAndToast("Internal Server Error");
      })
  }

  /** 
   * handle page number for get post images
   */
  handleEnd = () => {
    console.log("handleend callll==================>", this.state.page);
    if(this.state.page < this.pageCount)
    this.setState(prevState => ({ page: prevState.page + 1 }), () => this.getAllPost());
  }

  /**
   * Display posts Images
   */
  displayPostsImage = () => {
    // if (this.state.posts.length) {
    if (this.state.posts.length) {
      return (
        <View style={{ marginBottom: 100 }}>
          <FlatList
            data={this.state.posts}
            keyExtractor={(item, index) => index}
            onEndReachedThreshold={0.6}
            onEndReached={() => {
              this.handleEnd();
            }}
            onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
            renderItem={({ item }) =>
              <CacheableImage style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} permanent={true} />
            }
            numColumns={2}
          />
        </View>
      )
    } else if (this.state.message) {
      return (
        <>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>No Post</Text>
          </View>
        </>
      )
    } else {
      return (
        <View style={[styles.horizontal, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#ef6858" />
        </View>
      )
    }
    // }
  }

  render() {
    console.log("posttttttttt=============>", this.state.posts, this.state.message);
    // console.log("searched post=====================>", this.state.searchedPost);
    return (
      <>
        {/* Display Serach bar */}
        <View style={{ height: 50, elevation: 3, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 20, top: 10, left: 20 }}>Explore</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ flex: 10 }}>
            <TouchableOpacity
              style={styles.input}
              onPress={() => this.props.navigation.navigate('Search')}>
              <Text style={{ color: 'gray' }}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Icon name='search' color='black' size={27} style={{ marginTop: 5, opacity: 0.5, marginLeft: 5 }} />
          </View>
        </View>
        {/* Display post images */}
        {this.displayPostsImage()}
      </>
    )
  }
}

const styles = StyleSheet.create({
  img: {
    height: width / 2.11,
    width: width / 2.11,
    margin: 5,
    borderRadius: 3
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  input: {
    padding: 6,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    marginBottom: 10,
    marginLeft: 12,
    borderRadius: 5
  },
});
