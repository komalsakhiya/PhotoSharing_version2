import React, { Component } from 'react';
import { StyleSheet, AsyncStorage, Image } from 'react-native';
import Routes from './screens/routes';
import NavigationService from './services/navigation.service';
import Config from './config';
import firebase from 'react-native-firebase';
import navigationService from './services/navigation.service';
const config = new Config();

export default class App extends Component {
 
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners(); //add this line
  }

  componentWillUnmount = async () => {
    this.notificationListener;
    this.notificationOpenedListener;
    let userId;
    const curruntUser = await AsyncStorage.getItem('curruntUser');
    if (curruntUser) {
      userId = JSON.parse(curruntUser);
      console.log("value===+++++++++in post++++++++++++===========================>", userId.data._id);
      global.curruntUserId = userId.data._id;
    }
  }

  //1
  async checkPermission() {
    console.log("==========checkpermission================")
    firebase.messaging().hasPermission().then((resp) => {
      console.log("rsponse==========>", resp)
      if (resp) {
        this.getToken();
      } else {
        this.requestPermission();
      }
    }).catch((erro) => {
      console.log('err: ', erro);
    });
    console.log("==========checkpermission after================")

  }

  //3
  async getToken() {
    console.log("getToken============>")
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        console.log('fcmToken:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await AsyncStorage.getItem('')
      }
    }
    console.log('fcmToken:', fcmToken);
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }


  /**
   * Get ProfilePhoto
   */
  profilePic = (profilePic) => {
    console.log("profile pic===========================>", profilePic);
    if (!profilePic) {
      console.log("in if===============/.")
      return (
        <Image resizeMode='cover' style={styles.profile}
          source={require('./images/profile.png')}
        />
      )
    } else {
      console.log("in else===============/.")
      return (
        <Image resizeMode='cover' style={styles.profile} source={{ uri: config.getMediaUrl() + profilePic }} />
      )
    }
  }

  async createNotificationListeners() {
    let notificationData;
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      notificationData = notification.data;
      const { title, body, data } = notification;
      console.log('onNotification============>:', notification);

      const localNotification = new firebase.notifications.Notification({
        // sound: 'sampleaudio',
        show_in_foreground: true,
      })
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setBody(notification.body)
        // .setDatat(notification.data)
        .setSound('default')
        .android.setLargeIcon(config.getMediaUrl() + notification.data.profilePhoto)
        .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
        .android.setSmallIcon('@drawable/logo') // create this icon in Android Studio
        .android.setColor('#000000') // you can set a color here
        .android.setPriority(firebase.notifications.Android.Priority.High);

      const action = new firebase.notifications.Android.Action('action', 'ic_launcher', 'Visit Profile', () => {
        console.log("Add event in addaction=====================>")
        navigationService.navigate('UserProfile', { userId: JSON.parse(notificationData.userData), curruntUserId: global.curruntUserId })
      });
      // Add the action to the notification
      localNotification.android.addAction(action);
      firebase.notifications()
        .displayNotification(localNotification)
        .catch(err => console.error('err===============>', err));
    });

    const channel = new firebase.notifications.Android.Channel('fcm_FirebaseNotifiction_default_channel', 'Demo app name', firebase.notifications.Android.Importance.High)
      .setDescription('Demo app description')
    // .setSound('sampleaudio.wav');
    firebase.notifications().android.createChannel(channel);

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log('onNotificationOpened:');
      console.log("data======-=====>", notificationData);
      navigationService.navigate('UserProfile', { userId: JSON.parse(notificationData.userData), curruntUserId: global.curruntUserId })
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      console.log('getInitialNotification:');
      navigationService.navigate('UserProfile', { userId: JSON.parse(notificationData.userData), curruntUserId: global.curruntUserId })
      console.log("{{{{{{{{{{{{{{{{")
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      console.log('message=============>', message)
      //process data message
      console.log("JSON.stringify:", JSON.stringify(message));
    });
  }

  render() {
    console.log("=====================render ================")
    return (
      <Routes
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
