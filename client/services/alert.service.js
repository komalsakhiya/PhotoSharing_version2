import { Platform, ToastAndroid } from 'react-native';

export default {
    alerAndToast: (message)=>{
        if (Platform.OS === 'ios') {
            alert(message)
        } else {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        }
    }
}