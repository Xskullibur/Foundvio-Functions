import {User} from "./models/User";
import {AGConnectCloudDB, CloudDBZoneConfig} from "@agconnect/database-server/dist/index.js";
import {AGCClient, CredentialParser} from "@agconnect/common-server";

let addUser = async function (event, context, callback, logger) {

    // Create Response
    const res = new context.HTTPResponse(context.env, {
        "res-type": "context.env",
        "faas-content-type": "json",
    }, "application/json", "200");

    // Perform Upsert
    logger.info("Request to add user...")

    if (event.body) {

        logger.info(event.body)

        // Create User
        let _body = event.body;
        let user = new User()
        user.setPhoneId(_body.phoneId)
        user.setGivenName(_body.givenName)
        user.setFamilyName(_body.familyName)
        user.setIsTracker(_body.isTracker)

        // Log results
        logger.info("PhoneId: " + user.getPhoneId())
        logger.info("Given Name: " + user.getGivenName())
        logger.info("Family Name: " + user.getFamilyName())
        logger.info("isTracker: " + user.getIsTracker())

        // Perform Upsert
        try {

            let response = await upsertUser(user)
            logger.info("Upsert Successful => " + response)
            res.body = "Success"

        } catch (error) {
            logger.error("Upsert Failed => " + error)
            logger.error("Upsert Failed Stack => " + error.stack)
            res.body = "Error"
        }

    } else {


        logger.info()
        // Request Body Empty
        logger.error("Request Body is Empty")
        res.body = "Empty"
    }

    // Callback
    context.callback(res);

    // Upsert Function
    async function upsertUser(user: User) {
        // Init AGCClient
        const credentialPath = "/dcache/layer/func/resource/agc-apiclient-660110761581888128-6979164466034395931.json";
        AGCClient.initialize(CredentialParser.toCredential(credentialPath));

        // Init CloudDB
        const agcClient = AGCClient.getInstance();
        AGConnectCloudDB.initialize(agcClient);

        // Define and create zone
        const zoneName = 'Foundvio';
        const cloudDBZoneConfig = new CloudDBZoneConfig(zoneName);
        const mCloudDBZone = AGConnectCloudDB.getInstance().openCloudDBZone(cloudDBZoneConfig);
        if (!mCloudDBZone) {
            console.log("CloudDBClient is null, try re-initialize it");
            return;
        }
        return await mCloudDBZone.executeUpsert(user);
    }

}

const combined = Object.assign({}, {addUser});
export = combined;