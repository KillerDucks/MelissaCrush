function randomToken(){
    let x = require('crypto').randomBytes(getRandomInt()).toString('hex');
    return x;
}
// Helpers
function getRandomInt(min = 2, max = 97) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Export the Function
module.exports.run = async (client, message, userstate, prams) => {
    client.say("speedoflightpen", `MelissaCrush v1.0.0 --> ${randomToken()}`);
};
// Export the Meta
module.exports.help =  {
    name: "test",
    Info: "BASIC INFO"
};