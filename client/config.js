// const ip = 'http://photosharing.raoinformationtechnology-conduct.tk';
const ip = 'http://192.168.43.53';
// const ip ='http://photosharing.raoinformationtechnology.com';
// const ip = 'https://protected-peak-31112.herokuapp.com/';

class Config {
	getBaseUrl() {
		let baseurl;
		return baseurl = ip + ":5000/";
		// return baseurl = ip;
	}
	getMediaUrl() {
		let baseMediaUrl;
		return baseMediaUrl = ip + "/photsharing_ios/server/uploads/";
		// return baseMediaUrl = ip;
	}
}
export default Config