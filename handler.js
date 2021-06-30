const { User } = require("./models/User");

const clouddb = require('@agconnect/database-server/dist/index.js');
const agconnect = require('@agconnect/common-server');

let addUser = async function (event, context, callback, logger) {

    // Create Response
    var res = new context.HTTPResponse(context.env, {
        "res-type": "context.env",
        "faas-content-type": "json",
    }, "application/json", "200");

    // Perform Upsert
    logger.info("Request to add user...")

    if (event.body) {

        logger.info(event.body)

        // Create User
        var _body = event.body;
        var user = new User()
        user.setPhoneId(_body.phoneId)
        user.setGivenName(_body.givenName)
        user.setFamilyName(_body.familyName)
        user.setIsTracker(_body.isTracker)

        // Log results
        logger.info("PhoneId: ", user.getPhoneId())
        logger.info("Given Name: ", user.getGivenName())
        logger.info("Family Name: ", user.getFamilyName())
        logger.info("isTracker: ", user.getIsTracker())

        // Perform Upsert
        try {

            var response = await upsertUser(user)
            logger.info("Upsert Successful => ", response)
            res.body = "Success"
            
        } catch (error) {
            
            logger.error("Upsert Failed => ", error)
            res.body = "Error"
        }

    } else {

        // Request Body Empty
        logger.error("Request Body is Empty")
        res.body = "Empty"
    }

    // Callback
    context.callback(res)

    // Upsert Function
    async function upsertUser(user) {

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

        if (!mCloudDBZone) {
            console.log("CloudDBClient is null, try re-initialize it");
            return;
        }

        const resp = await this.mCloudDBZone.executeUpsert(user);
        return resp;
    }

}

module.exports.addUser = addUser;
