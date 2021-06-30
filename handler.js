const {User} = require("./models/User");

const clouddb = require('@agconnect/database-server/dist/index.js');
const agconnect = require('@agconnect/common-server');

// Init AGCClient
const credentialPath = "/dcache/layer/func/resource/agc-apiclient-660110761581888128-6979164466034395931.json";
agconnect.AGCClient.initialize(agconnect.CredentialParser.toCredential(credentialPath));

// Init CloudDB
const agcClient = agconnect.AGCClient.getInstance();
clouddb.AGConnectCloudDB.initialize(agcClient);

// Define and create zone
const zoneName = 'Foundvio';
const cloudDBZoneConfig = new clouddb.CloudDBZoneConfig(zoneName);
const mCloudDBZone = clouddb.AGConnectCloudDB.getInstance().openCloudDBZone(cloudDBZoneConfig);

let addUser = async function(event, context, callback, logger) {
    let res = new context.HTTPResponse(context.env, {
        "res-type": "context.env",
        "faas-content-type": "json",
    }, "application/json", "200");

    // if (event.body) {
    //     logger.info("body is not empty");
    //     let _body = JSON.parse(event.body);
    //     res.body = _body;
    //     logger.info("parsed json");
    //     let user = new User()
    //     user.setPhoneId(_body.phoneId)
    //     user.setGivenName(_body.givenName)
    //     user.setFamilyName(_body.familyName)
    //     user.setIsTracker(_body.isTracker)
    //     logger.info("user created");
    //
    //     try{
    //         let response = await upsertUser(user);
    //         logger.info("user upserted");
    //         // res.body = "Successfully created user";
    //     } catch (error) {
    //         // res.body = "Failed to create user";
    //         logger.error('upsertUser => ', error);
    //     }
    // }else{
    //     res.body = "Failed to create user";
    //     res.body = event.body;
    // }
    res.body = event.body.request;
    callback(res)
}


async function upsertUser(user) {
    if (!mCloudDBZone) {
        console.log("CloudDBClient is null, try re-initialize it");
        return;
    }
    const resp = await mCloudDBZone.executeUpsert(user);
    return resp;
}

module.exports.addUser = addUser;
