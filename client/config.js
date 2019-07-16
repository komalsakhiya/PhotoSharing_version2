// const ip = 'http://photosharing.raoinformationtechnology-conduct.tk';
const ip = 'http://192.168.1.49';
// const ip ='http://photosharing.raoinformationtechnology.com';
// const ip = 'https://warm-fjord-19948.herokuapp.com';

class Config {
	getBaseUrl() {
		let baseurl;
		return baseurl = ip + ":5000/";
	}
	getMediaUrl() {
		let baseMediaUrl;
		return baseMediaUrl = ip + "/photsharing_ios/server/uploads/";
	}
}
export default Config