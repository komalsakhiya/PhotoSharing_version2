import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import { AsyncStorage } from 'react-native';
import _ from 'lodash';
import userService from '../services/user.service';
import alertService from '../services/alert.service';

export default class Following extends Component {
   constructor(props) {
      super(props)
      global.curruntUserData = ""
      this.state = {
         friends: [],
         ButtonStateHolder: false,
         refreshing: false,
      }
      this.props.navigation.addListener(
         'didFocus',
         payload => {
            this.componentDidMount();
         });
   }

   componentDidMount = async () => {
      console.log("_____+_+_+_+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++FOLLOW")
      try {
         const curruntUser = await AsyncStorage.getItem('curruntUser');
         if (curruntUser) {
            data = JSON.parse(curruntUser);
            global.curruntUserData = data
            console.log("value===+===========================>", global.curruntUserData.data._id);
         }
      } catch (error) {
         alertService.alerAndToast("User Data Not Found");
      }
      this.getFriends();
   }

   /**Get Friends Of CurruntUser */
   getFriends = () => {
      const userId = global.curruntUserData.data._id
      userService.getFriends(userId)
         .then(response => {
            console.log('currunt user Friends following==============================>', response.data.data);
            this.setState(prevState => ({
               friends: response.data.data
            }))
         })
         .catch(err => {
            console.log('er=====>', err);
            alertService.alerAndToast("Internal Server Error");
         })
   }

   /**Unfollow user */
   handleClickUnfollow(item) {
      console.log('data====================>', item);
      this.setState({
         ButtonStateHolder: true
      })
      const payload = {
         "requestedUser": global.curruntUserData.data._id,
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
               this.getFriends();
               this.setState({ ButtonStateHolder: false })
            })
            .catch(err => {
               console.log(err);
               this.setState({ ButtonStateHolder: false });
               alertService.alerAndToast("Internal Server Error");
            })
      }
   }

   render() {
      console.log('this.state,friends==============================>?>', this.state.friends.length);
      if (!this.state.friends.length) {
         return (
            <View style={styles.container}>
               <Text style={{ fontSize: 20, color: 'black' }}>Make a new friends...</Text>
            </View>
         )
      } else {
         return (
            <View style={{ backgroundColor: '#fff' }}>
               <ScrollView>
                  <View style={{ marginBottom: 20 }}>
                     {/*  Display Friends Name And unfollow Button */}
                     <FlatList
                        data={this.state.friends}
                        renderItem={({ item }) =>
                           <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity
                                 style={{ flex: 8 }}
                                 onPress={() => this.props.navigation.navigate('UserProfile', { userId: item ,curruntUserId:global.curruntUserData.data._id})}
                              >
                                 <Text style={styles.text}>{item.userName}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                 style={[styles.button1, { backgroundColor: this.state.ButtonStateHolder ? '#607D8B' : '#0099e7' }]}
                                 disabled={this.state.ButtonStateHolder}
                                 onPress={() => this.handleClickUnfollow(item)}>
                                 <Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}>Unfollow</Text>
                              </TouchableOpacity>
                           </View>
                        }
                     />
                  </View>
               </ScrollView>
            </View>
         )
      }
   }
}

const styles = StyleSheet.create({
   text: {
      fontSize: 18,
      flexDirection: 'column',
      flex: 8,
      marginLeft: 10,
      marginTop: 14,
      color: 'black'
   },
   button1: {
      marginTop: 15,
      height: 33,
      padding: 0,
      width: 70,
      backgroundColor: '#0099e7',
      borderRadius: 3,
      marginRight: 15,
   },
   container: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1
   },
})
