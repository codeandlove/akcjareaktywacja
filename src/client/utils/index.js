import {UAParser} from 'ua-parser-js';
import moment from "moment";

export const getClientDeviceData = () => {
    const parser = new UAParser();
    return parser.getResult();
}

export const generateClientDeviceUUID = () => {
    const data = getClientDeviceData();
    let device = data.device;

    if(!device.type) {
        device = {
            model: "PC",
            type: "PC",
            vendor: "PC"
        }
    }
    return btoa(`${data.cpu.architecture}|${data.engine.name}|${data.os.name}-${data.os.version}|${device.model}-${device.type}-${device.vendor}`);
}

export const verifyCaptcha = async (props, eventName) => {
    const {googleReCaptchaProps: {executeRecaptcha}} = props;

    if(!executeRecaptcha) {
        console.log('Recaptcha has not been loaded');

        return false;
    }

    try {
        return await executeRecaptcha(eventName);
    } catch (err) {
        throw new Error("ReCaptcha Token Error");
    }
}

export const resizeImage = (base64Str, maxWidth = 400, maxHeight = 350) => {
    return new Promise((resolve) => {
        let img = new Image()
        img.src = base64Str
        img.onload = () => {
            let canvas = document.createElement('canvas')
            const MAX_WIDTH = maxWidth
            const MAX_HEIGHT = maxHeight
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width
                    width = MAX_WIDTH
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height
                    height = MAX_HEIGHT
                }
            }
            canvas.width = width
            canvas.height = height
            let ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL())
        }
    })
}

export const getBool = (val) => {
    const num = +val;
    return !isNaN(num) ? !!num : !!String(val).toLowerCase().replace(!!0,'');
}

export const isInPastDate = (date, pastDays = 1) => {
    return moment(date) < moment().subtract(pastDays, 'days').startOf('day').valueOf()
}

export const notifyToSlackChannel = (webHookURL, message, channel, userName, botIconURL) => {
    if (webHookURL && webHookURL.trim() && message ) {
        var payload = message;

        if (channel && channel.trim()) {
            payload.channel = channel;
        }

        if (userName && userName.trim()) {
            payload.username = userName;
        }

        if (botIconURL && botIconURL.trim()) {
            payload.icon_url = botIconURL;
        }

        fetch(webHookURL, {
            method: 'post',
            body: JSON.stringify(payload)
        }).then(function (response) {
            return response;
        }).then(function (response) {
            return response;
        })["catch"](function (error) {
            return error;
        });
    }
}

export const getIPInfoApiUrl = () => {
    return `https://ipinfo.io/json?token=${process.env.REACT_APP_IPINFO_TOKEN}`;
}

export const searchPlaceData = (place, args) => {
    let customParams = '';
    if(args) {
        customParams += '&'+encodeURI(args);
    }

    return fetch(`https://nominatim.openstreetmap.org/search.php?addressdetails=1&q=${encodeURIComponent(place)}${customParams}&limit=5&format=jsonv2`)
        .then(response => response.json())
        .catch(err => {
            console.log(err);
            return null;
        });
}
