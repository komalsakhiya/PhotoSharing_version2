import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ToastAndroid, ActivityIndicator, Dimensions } from 'react-native';
import Config from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import postService from '../services/post.service';
const { width } = Dimensions.get('screen');
const config = new Config();

export default class Explore extends Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      data: [],
      page: 1,
      loading: true,
      ButtonStateHolder: false,
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
    let pageNumber = this.state.page
    postService.getAllPost(pageNumber)
      .then(response => {
        console.log('all post postss===================>', response.data.data);
        this.setState(prevState => ({
          posts: [...prevState.posts, ...response.data.data]
        }))
      })
      .catch(err => {
        // alert('Internal Server Error') 
        if (Platform.OS === 'ios') {
          alert('Internal Server Error')
        } else {
          ToastAndroid.show('Internal Server Error', ToastAndroid.SHORT);
        }
      })
  }

  /** 
   * handle page number for get post images
   */
  handleEnd = () => {
    console.log("handleend callll==================>", this.state.page);
    this.setState(prevState => ({ page: prevState.page + 1 }), () => this.getAllPost());
  }

  render() {
    console.log("posttttttttt=============>", this.state.posts);
    console.log("searched post=====================>", this.state.searchedPost);
    if (!this.state.posts.length) {
      return (
        <>
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
          <View style={[styles.horizontal, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
            <ActivityIndicator size="large" color="#ef6858" />
          </View>
        </>
      )
    } else {
      return (
        <>
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

          {/* Display Posts Images */}
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
                <Image style={styles.img} source={{ uri: config.getMediaUrl() + item.images }} />
              }
              numColumns={2}
            />
          </View>
        </>
      );
    }
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
