const CryptoJS = require("crypto-js");

const encrypt = (val, env) => {
    const key = CryptoJS.enc.Utf8.parse(env.REACT_APP_KEY);
    const iv  = CryptoJS.enc.Utf8.parse(env.REACT_APP_IV);
    const encryptedCP = CryptoJS.AES.encrypt(val, key, { iv: iv });

    return encryptedCP.toString();
}

const decrypt = (val, env) => {
    const key = CryptoJS.enc.Utf8.parse(env.REACT_APP_KEY);
    const iv  = CryptoJS.enc.Utf8.parse(env.REACT_APP_IV);

    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(val)
    });

    const decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv});
    return decryptedFromText.toString(CryptoJS.enc.Utf8);
}

module.exports = {encrypt, decrypt};
