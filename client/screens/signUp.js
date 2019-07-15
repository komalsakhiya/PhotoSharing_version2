import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import userService from '../services/user.service'

export default class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      email: "",
      userName: "",
      password: "",
      visible: false,
      ButtonStateHolder: false,
      isVisible: true
    }
  }

  /** 
   * Register User
   */
  signUp() {
    this.setState({
      ButtonStateHolder: true
    })
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!this.state.name || !this.state.email || !this.state.userName || !this.state.password) {
      if (Platform.OS === 'ios') {
        alert('Enter Valid Value')
      } else {
        ToastAndroid.show('Enter Valid Value', ToastAndroid.SHORT);
      }
      this.setState({
        ButtonStateHolder: false
      })
    } else if (!reg.test(this.state.email)) {
      console.log("Email is Not Correct");
      if (Platform.OS === 'ios') {
        alert('Enter Valid Email')
      } else {
        ToastAndroid.show('Enter Valid Email', ToastAndroid.SHORT);
      }
      this.setState({
        ButtonStateHolder: false
      })
      return false;
    }
    else {
      let payload = {
        "name": this.state.name,
        "email": this.state.email,
        "password": this.state.password,
        "userName": this.state.userName,
      }
      userService.signUp(payload).
        then(function (response) {
          console.log("response===============>", response.data);
          if (Platform.OS === 'ios') {
            alert('Registerd successfully...')
          } else {
            ToastAndroid.show('Registerd successfully...', ToastAndroid.SHORT);
          }
          console.log("register successfull");
        })
        .then(() => this.props.navigation.navigate('Login'))
        .catch(err => {
          console.log('err=====>', err);
          alert(err.response.data.message)
        })
    }
    this.setState({
      ButtonStateHolder: false
    })
  }
  onPress = () => {
    this.setState({ isVisible: !this.state.isVisible })
  }
  /**
   * @param {String} userName 
   * space is converted into underScore in userName
   */
  userNameHandle(value) {
    this.setState({
      userName: value.replace(/\s/g, '_')
    })
    console.log("===============userName============", this.state.userName);
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
          </View>
          <View style={{ flex: 6 }}>
            <View style={styles.container}>
              <Text style={styles.titleText}>Photosharing</Text>
              <View style={{ marginTop: 20 }}>
                <TextInput
                  value={this.state.name}
                  onChangeText={(name) => this.setState({ name: name })}
                  placeholder={'Name'}
                  style={styles.input}
                />
                <TextInput
                  value={this.state.userName}
                  onChangeText={(userName) => this.userNameHandle(userName)}
                  placeholder={'Username'}
                  style={styles.input}
                />
                <TextInput
                  value={this.state.email}
                  onChangeText={(email) => this.setState({ email: email })}
                  placeholder={'Email'}
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
                disabled={this.state.ButtonStateHolder}
                onPress={() => this.signUp()
                }
              >
                <Text style={{ textAlign: 'center', marginTop: 5, color: 'white' }}>SignUp</Text>
              </TouchableOpacity>
              <View>
                <Text style={{ marginTop: 15, color: '#837c7c', fontSize: 12, textAlign: 'center' }}>By signing up, you agree to our Terms, Data Policy and Cookies Policy</Text>
              </View>
            </View>
            <View style={styles.signUpView}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'black', marginLeft: 40 }}>Have an account?</Text>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('Login')}
                >
                  <Text style={{ color: '#0099e7', marginLeft: 15 }}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
          </View>
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
    height: 'auto'
  },
  input: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#C0C0C0',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0099e7',
    textAlign: 'center',
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
