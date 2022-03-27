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

export const formatSlackNotifyMessage = (data) => {
    const {ip, city, postal, region, country, loc, org, hostname, timezone} = data;

    return `
        ${ip}
        ${city} ${postal} ${region} ${country}
        ${loc}
        ${org} ${hostname}
        ${timezone}
    `
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

export const findUrlString = (val) => {
    const regex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    return val.match(regex);
}

export const findPhoneNumber = (val) => {
    const regex = new RegExp(/(?:(?:(?:\+|00)?48)|(?:\(\+?48\)))?(?:1[2-8]|2[2-69]|3[2-49]|4[1-8]|5[0-9]|6[0-35-9]|[7-8][1-9]|9[145])\d{7}/g);

    return regex.test(val);
}

export const findSwearWord = (val) => {
    const badWords = ['fuck', 'shit', 'asshole', 'cunt', 'fag', 'fuk', 'fck', 'fcuk', 'assfuck', 'assfucker', 'fucker',
        'chuj','chuja', 'chujek', 'chuju', 'chujem', 'chujnia',
        'chujowy', 'chujowa', 'chujowe', 'cipa', 'cipę', 'cipe', 'cipą',
        'cipie', 'dojebać','dojebac', 'dojebie', 'dojebał', 'dojebal',
        'dojebała', 'dojebala', 'dojebałem', 'dojebalem', 'dojebałam',
        'dojebalam', 'dojebię', 'dojebie', 'dopieprzać', 'dopieprzac',
        'dopierdalać', 'dopierdalac', 'dopierdala', 'dopierdalał',
        'dopierdalal', 'dopierdalała', 'dopierdalala', 'dopierdoli',
        'dopierdolił', 'dopierdolil', 'dopierdolę', 'dopierdole', 'dopierdoli',
        'dopierdalający', 'dopierdalajacy', 'dopierdolić', 'dopierdolic',
        'dupa', 'dupie', 'dupą', 'dupcia', 'dupeczka', 'dupy', 'dupe', 'huj',
        'hujek', 'hujnia', 'huja', 'huje', 'hujem', 'huju', 'jebać', 'jebac',
        'jebał', 'jebal', 'jebie', 'jebią', 'jebia', 'jebak', 'jebaka', 'jebal',
        'jebał', 'jebany', 'jebane', 'jebanka', 'jebanko', 'jebankiem',
        'jebanymi', 'jebana', 'jebanym', 'jebanej', 'jebaną', 'jebana',
        'jebani', 'jebanych', 'jebanymi', 'jebcie', 'jebiący', 'jebiacy',
        'jebiąca', 'jebiaca', 'jebiącego', 'jebiacego', 'jebiącej', 'jebiacej',
        'jebia', 'jebią', 'jebie', 'jebię', 'jebliwy', 'jebnąć', 'jebnac',
        'jebnąc', 'jebnać', 'jebnął', 'jebnal', 'jebną', 'jebna', 'jebnęła',
        'jebnela', 'jebnie', 'jebnij', 'jebut', 'koorwa', 'kórwa', 'kurestwo',
        'kurew', 'kurewski', 'kurewska', 'kurewskiej', 'kurewską', 'kurewska',
        'kurewsko', 'kurewstwo', 'kurwa', 'kurwaa', 'kurwami', 'kurwą', 'kurwe',
        'kurwę', 'kurwie', 'kurwiska', 'kurwo', 'kurwy', 'kurwach', 'kurwami',
        'kurewski', 'kurwiarz', 'kurwiący', 'kurwica', 'kurwić', 'kurwic',
        'kurwidołek', 'kurwik', 'kurwiki', 'kurwiszcze', 'kurwiszon',
        'kurwiszona', 'kurwiszonem', 'kurwiszony', 'kutas', 'kutasa', 'kutasie',
        'kutasem', 'kutasy', 'kutasów', 'kutasow', 'kutasach', 'kutasami',
        'matkojebca', 'matkojebcy', 'matkojebcą', 'matkojebca', 'matkojebcami',
        'matkojebcach', 'nabarłożyć', 'najebać', 'najebac', 'najebał',
        'najebal', 'najebała', 'najebala', 'najebane', 'najebany', 'najebaną',
        'najebana', 'najebie', 'najebią', 'najebia', 'naopierdalać',
        'naopierdalac', 'naopierdalał', 'naopierdalal', 'naopierdalała',
        'naopierdalala', 'naopierdalała', 'napierdalać', 'napierdalac',
        'napierdalający', 'napierdalajacy', 'napierdolić', 'napierdolic',
        'nawpierdalać', 'nawpierdalac', 'nawpierdalał', 'nawpierdalal',
        'nawpierdalała', 'nawpierdalala', 'obsrywać', 'obsrywac', 'obsrywający',
        'obsrywajacy', 'odpieprzać', 'odpieprzac', 'odpieprzy', 'odpieprzył',
        'odpieprzyl', 'odpieprzyła', 'odpieprzyla', 'odpierdalać',
        'odpierdalac', 'odpierdol', 'odpierdolił', 'odpierdolil',
        'odpierdoliła', 'odpierdolila', 'odpierdoli', 'odpierdalający',
        'odpierdalajacy', 'odpierdalająca', 'odpierdalajaca', 'odpierdolić',
        'odpierdolic', 'odpierdoli', 'odpierdolił', 'opieprzający',
        'opierdalać', 'opierdalac', 'opierdala', 'opierdalający',
        'opierdalajacy', 'opierdol', 'opierdolić', 'opierdolic', 'opierdoli',
        'opierdolą', 'opierdola', 'piczka', 'pieprznięty', 'pieprzniety',
        'pieprzony', 'pierdel', 'pierdlu', 'pierdolą', 'pierdola', 'pierdolący',
        'pierdolacy', 'pierdoląca', 'pierdolaca', 'pierdol', 'pierdole',
        'pierdolenie', 'pierdoleniem', 'pierdoleniu', 'pierdolę', 'pierdolec',
        'pierdola', 'pierdolą', 'pierdolić', 'pierdolicie', 'pierdolic',
        'pierdolił', 'pierdolil', 'pierdoliła', 'pierdolila', 'pierdoli',
        'pierdolnięty', 'pierdolniety', 'pierdolisz', 'pierdolnąć',
        'pierdolnac', 'pierdolnął', 'pierdolnal', 'pierdolnęła', 'pierdolnela',
        'pierdolnie', 'pierdolnięty', 'pierdolnij', 'pierdolnik', 'pierdolona',
        'pierdolone', 'pierdolony', 'pierdołki', 'pierdzący', 'pierdzieć',
        'pierdziec', 'pizda', 'pizdą', 'pizde', 'pizdę', 'piździe', 'pizdzie',
        'pizdnąć', 'pizdnac', 'pizdu', 'podpierdalać', 'podpierdalac',
        'podpierdala', 'podpierdalający', 'podpierdalajacy', 'podpierdolić',
        'podpierdolic', 'podpierdoli', 'pojeb', 'pojeba', 'pojebami',
        'pojebani', 'pojebanego', 'pojebanemu', 'pojebani', 'pojebany',
        'pojebanych', 'pojebanym', 'pojebanymi', 'pojebem', 'pojebać',
        'pojebac', 'pojebalo', 'popierdala', 'popierdalac', 'popierdalać',
        'popierdolić', 'popierdolic', 'popierdoli', 'popierdolonego',
        'popierdolonemu', 'popierdolonym', 'popierdolone', 'popierdoleni',
        'popierdolony', 'porozpierdalać', 'porozpierdala', 'porozpierdalac',
        'poruchac', 'poruchać', 'przejebać', 'przejebane', 'przejebac',
        'przyjebali', 'przepierdalać', 'przepierdalac', 'przepierdala',
        'przepierdalający', 'przepierdalajacy', 'przepierdalająca',
        'przepierdalajaca', 'przepierdolić', 'przepierdolic', 'przyjebać',
        'przyjebac', 'przyjebie', 'przyjebała', 'przyjebala', 'przyjebał',
        'przyjebal', 'przypieprzać', 'przypieprzac', 'przypieprzający',
        'przypieprzajacy', 'przypieprzająca', 'przypieprzajaca',
        'przypierdalać', 'przypierdalac', 'przypierdala', 'przypierdoli',
        'przypierdalający', 'przypierdalajacy', 'przypierdolić',
        'przypierdolic', 'qrwa', 'rozjebać', 'rozjebac', 'rozjebie',
        'rozjebała', 'rozjebią', 'rozpierdalać', 'rozpierdalac', 'rozpierdala',
        'rozpierdolić', 'rozpierdolic', 'rozpierdole', 'rozpierdoli',
        'rozpierducha', 'skurwić', 'skurwiel', 'skurwiela', 'skurwielem',
        'skurwielu', 'skurwysyn', 'skurwysynów', 'skurwysynow', 'skurwysyna',
        'skurwysynem', 'skurwysynu', 'skurwysyny', 'skurwysyński',
        'skurwysynski', 'skurwysyństwo', 'skurwysynstwo', 'spieprzać',
        'spieprzac', 'spieprza', 'spieprzaj', 'spieprzajcie', 'spieprzają',
        'spieprzaja', 'spieprzający', 'spieprzajacy', 'spieprzająca',
        'spieprzajaca', 'spierdalać', 'spierdalac', 'spierdala', 'spierdalał',
        'spierdalała', 'spierdalal', 'spierdalalcie', 'spierdalala',
        'spierdalający', 'spierdalajacy', 'spierdolić', 'spierdolic',
        'spierdoli', 'spierdoliła', 'spierdoliło', 'spierdolą', 'spierdola',
        'srać', 'srac', 'srający', 'srajacy', 'srając', 'srajac', 'sraj',
        'sukinsyn', 'sukinsyny', 'sukinsynom', 'sukinsynowi', 'sukinsynów',
        'sukinsynow', 'śmierdziel', 'udupić', 'ujebać', 'ujebac', 'ujebał',
        'ujebal', 'ujebana', 'ujebany', 'ujebie', 'ujebała', 'ujebala',
        'upierdalać', 'upierdalac', 'upierdala', 'upierdoli', 'upierdolić',
        'upierdolic', 'upierdoli', 'upierdolą', 'upierdola', 'upierdoleni',
        'wjebać', 'wjebac', 'wjebie', 'wjebią', 'wjebia', 'wjebiemy',
        'wjebiecie', 'wkurwiać', 'wkurwiac', 'wkurwi', 'wkurwia', 'wkurwiał',
        'wkurwial', 'wkurwiający', 'wkurwiajacy', 'wkurwiająca', 'wkurwiajaca',
        'wkurwić', 'wkurwic', 'wkurwi', 'wkurwiacie', 'wkurwiają', 'wkurwiali',
        'wkurwią', 'wkurwia', 'wkurwimy', 'wkurwicie', 'wkurwiacie', 'wkurwić',
        'wkurwic', 'wkurwia', 'wpierdalać', 'wpierdalac', 'wpierdalający',
        'wpierdalajacy', 'wpierdol', 'wpierdolić', 'wpierdolic', 'wpizdu',
        'wyjebać', 'wyjebac', 'wyjebali', 'wyjebał', 'wyjebac', 'wyjebała',
        'wyjebały', 'wyjebie', 'wyjebią', 'wyjebia', 'wyjebiesz', 'wyjebie',
        'wyjebiecie', 'wyjebiemy', 'wypieprzać', 'wypieprzac', 'wypieprza',
        'wypieprzał', 'wypieprzal', 'wypieprzała', 'wypieprzala', 'wypieprzy',
        'wypieprzyła', 'wypieprzyla', 'wypieprzył', 'wypieprzyl', 'wypierdal',
        'wypierdalać', 'wypierdalac', 'wypierdala', 'wypierdalaj',
        'wypierdalał', 'wypierdalal', 'wypierdalała', 'wypierdalala',
        'wypierdalać', 'wypierdolić', 'wypierdolic', 'wypierdoli',
        'wypierdolimy', 'wypierdolicie', 'wypierdolą', 'wypierdola',
        'wypierdolili', 'wypierdolił', 'wypierdolil', 'wypierdoliła',
        'wypierdolila', 'zajebać', 'zajebac', 'zajebie', 'zajebią', 'zajebia',
        'zajebiał', 'zajebial', 'zajebała', 'zajebiala', 'zajebali', 'zajebana',
        'zajebani', 'zajebane', 'zajebany', 'zajebanych', 'zajebanym',
        'zajebanymi', 'zajebiste', 'zajebisty', 'zajebistych', 'zajebista',
        'zajebistym', 'zajebistymi', 'zajebiście', 'zajebiscie', 'zapieprzyć',
        'zapieprzyc', 'zapieprzy', 'zapieprzył', 'zapieprzyl', 'zapieprzyła',
        'zapieprzyla', 'zapieprzą', 'zapieprza', 'zapieprzy', 'zapieprzymy',
        'zapieprzycie', 'zapieprzysz', 'zapierdala', 'zapierdalać',
        'zapierdalac', 'zapierdalaja', 'zapierdalał', 'zapierdalaj',
        'zapierdalajcie', 'zapierdalała', 'zapierdalala', 'zapierdalali',
        'zapierdalający', 'zapierdalajacy', 'zapierdolić', 'zapierdolic',
        'zapierdoli', 'zapierdolił', 'zapierdolil', 'zapierdoliła',
        'zapierdolila', 'zapierdolą', 'zapierdola', 'zapierniczać',
        'zapierniczający', 'zasrać', 'zasranym', 'zasrywać', 'zasrywający',
        'zesrywać', 'zesrywający', 'zjebać', 'zjebac', 'zjebał', 'zjebal',
        'zjebała', 'zjebala', 'zjebana', 'zjebią', 'zjebali', 'zjeby'];

    let result = badWords.filter(word => {
        const regex = new RegExp(word, 'gi');
        return regex.test(val);
    })

    return result.length > 0;
}