import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid, AsyncStorage, BackHandler, Animated } from 'react-native';
// import FBSDK, { LoginManager } from "react-native-fbsdk";
import Icon from 'react-native-vector-icons/MaterialIcons';
import userService from '../services/user.service'
import alertService from '../services/alert.service';

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.springValue = new Animated.Value(100);
    this.state = {
      userName: "",
      password: "",
      ButtonStateHolder: false,
      isVisible: true,
      backClickCount: 0
    };
  }

  componentWillMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    console.log('================================================')
    this.props.navigation.goBack();
    return true;
  }
  /**Login User */
  onLogin = async (data) => {
    console.log('dat====================>', data);
    this.setState({
      ButtonStateHolder: true
    })
    if (!this.state.userName || !this.state.password) {
      console.log("===========requirefd-=============================");
      alertService.alerAndToast("Enter username and password");
      this.setState({
        ButtonStateHolder: false
      })
    } else {
      this.setState({
        ButtonStateHolder: true
      })
      const deviceToken = await AsyncStorage.getItem('fcmToken');
      console.log('device token================>',deviceToken);
      const payload = {
        "userName": this.state.userName,
        "password": this.state.password,
        "deviceToken":deviceToken
      }
      console.log("payload=============>", payload);
      userService.onLogin(payload)
        .then(async function (response) {
          console.log("response=================>", response.data);
          alertService.alerAndToast(response.data.message);
          try {
            await AsyncStorage.setItem('curruntUser', JSON.stringify(response.data));
          } catch (error) {
            alertService.alerAndToast("User Data Not Found");
          }
          const curruntUser = await AsyncStorage.getItem('curruntUser');
          console.log('curuuntuser---------------------------->', JSON.parse(curruntUser));
          console.log(']]]]]]]]]]]]]]]]]]', curruntUser);
          console.log("login successfull");
        }).then(() => { this.props.navigation.navigate('SignOut') }, this.setState({
          ButtonStateHolder: false
        }))
        .catch(err => {
          console.log('err=========>', err);
          this.setState({ ButtonStateHolder: false });
          alertService.alerAndToast(err.response.data.message);
        })
    }
  }
  onPress = () => {
    this.setState({ isVisible: !this.state.isVisible })
  }
  render() {
    console.log("{{{{{{{{{{{{{{{", this.state);
    return (
      <View style={styles.form}>
        {/* Login Form */}
        <View style={{ flexDirection: 'row' }} >
          <View style={{ flex: 1 }} />
          <View style={{ flex: 6 }} >
            <View >
              <View style={styles.container}>
                <Text style={styles.titleText}>Photosharing</Text>
                <View style={{ marginTop: 20 }}>
                  <TextInput
                    value={this.state.userName}
                    onChangeText={(userName) => this.setState({ userName: userName })}
                    placeholder={'Username'}
                    style={styles.input}
                  />
                  <TextInput
                    value={this.state.password}
                    onChangeText={(password) => this.setState({ password: password })}
                    placeholder={'Password'}
                    secureTextEntry={this.state.isVisible}
                    style={styles.input}
                  />
                  <Icon name={this.state.isVisible ? "visibility-off" : "visibility"}
                    style={{ position: 'absolute', bottom: 20, right: 0 }}
                    size={20}
                    onPress={this.onPress} />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: this.state.ButtonStateHolder ? '#607D8B' : '#0099e7' }]}
                  onPress={() => { this.onLogin(this.state) }}
                  disabled={this.state.ButtonStateHolder}
                >
                  <Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}>Login</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: '#aca5a5', textAlign: 'center' }}>OR</Text>
                </View>
                <TouchableOpacity onPress={() => this.facebookLogin()}>
                  <Text style={{ textAlign: 'center', marginTop: 5, color: '#385185' }}>Login with Facebook</Text>
                </TouchableOpacity>
              </View>
              {/* signUp view */}
              <View style={styles.signUpView}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ color: 'black', marginLeft: 20 }}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('SignUp')}
                  >
                    <Text style={{ color: '#0099e7', marginLeft: 15 }}>SignUp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e0e0',
    borderRadius: 10,
    padding: 20,
    height: 'auto',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0099e7',
    textAlign: 'center',
  },
  input: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#C0C0C0',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    height: 33,
    padding: 0,
    backgroundColor: '#0099e7',
    borderRadius: 3,

  },
  signUpView: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e0e0',
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    height: 'auto'
  }
});
