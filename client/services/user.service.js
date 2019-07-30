import Config from '../config';
import axios from 'axios';
const config = new Config();

export default {

    /**
     * @param {object} payload
     * Register User
     */
    signUp: (payload) => {
        return axios.post(config.getBaseUrl() + "user/signUp", payload).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },
    /**
     * @param {String} userId
     * Get Followers Of CurruntUser
     */
    getFollowers: (userId) => {
        return axios.get(config.getBaseUrl() + "user/get-my-followers/" + userId).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },

    /**
     * @param {String} userId
     * Get Friends Of CurruntUser
     */
    getFriends: (userId) => {
        console.log("userId=======================>",userId)
        return axios.get(config.getBaseUrl() + "user/get-my-friends/" + userId).
            then(response => {
                return response;
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },

    /**
     * @param {object} payload
     * Unfollow User
     */
    handleClickUnfollow: (payload) => {
        return axios.post(config.getBaseUrl() + "user/unfollow", payload).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' })
    },

    /**
     * @param {object} payload
     * Follow User
     */
    handleClickFollow: (payload) => {
        return axios.post(config.getBaseUrl() + "user/follow", payload).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' })
    },

    /**
     * @param {object} payload 
     * Login User
     */
    onLogin: (payload) => {
        return axios.post(config.getBaseUrl() + "user/login", payload).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' })
    },
    /**
     * @param {String} userId
     * get User whose Shred Post with You
     */
    sharedPostUser: (userId) => {
        return axios.get(config.getBaseUrl() + "message/get-shared-post/" + userId).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },

    /**
    * @param {object} payload
    * Search HashTag
    */
    SearchUser: (payload) => {
        return axios.post(config.getBaseUrl() + "user/search", payload).
            then(response => {
                return response
            })
            .catch({ status: 500, message: 'Internal Serevr Error' })
    },

    /**
     * @param {String} userId
     * Get User By userId
     */
    getUserById: (userId) => {
        return axios.get(config.getBaseUrl() + "user/get-single-user/" + userId).
            then(response => {
                return response;
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },

    /**
     * Get All Users
     */
    getAllUser: () => {
        return axios.get(config.getBaseUrl() + "user/user").
            then(response => {
                return response;
            })
            .catch({ status: 500, message: 'Internal Serevr Error' });
    },
    /**
     * @param {String} userId
     * LogOut user
     */
    logOut:(userId)=>{
        return axios.put(config.getBaseUrl() + "user/logout/" + userId).
        then(response => {
            return response;
        })
        .catch({ status: 500, message: 'Internal Serevr Error' });
    }

}