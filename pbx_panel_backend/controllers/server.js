const mongoose = require('mongoose');
const Server = mongoose.model('Server');
const db = require("../config/db"); //fetch mailing-configs from Utility module

const async = require("async");
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');

const {
    sendEmail,
    sendResetPasswordMail,
    contactUserMail

} = require("../config/mailing"); //fetch mailing-configs from Utility module

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../Utilities/Utilities');

const server = {};

server.addServer = (req, res, next) => {

    let server = new Server();

    console.log(req.body,"in addServer")

    server.server_key = generateRandomString(true, 16) || '';
    server.server_name = req.body.server_name || '';
    server.ip = req.body.ip || '';


    server.save().then(data => { //create email verification tokenand update user data with the email verification token

        if (!data) { return res.sendStatus(422); }

        return res.json({ serverdata: data });
    }).catch(next);
}


server.getServer = (req, res, next) => {

    let str = {};

    if (req.query.id) {
        str._id = mongoose.Types.ObjectId(req.query.id);
    }

    Server.find(str).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({
            serverData: data
        });
    });

}

server.getActiveServer = (req, res, next) => {

    const str = {status:'active'};

    Server.find(str).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({
            servers: data
        });
    });

}

server.updateServer = (req, res, next) => {

    let updatevalue = {};

    if (req.body.server_key) {
        updatevalue.server_key = req.body.server_key
    }
    if (req.body.status) {
        updatevalue.status = req.body.status;
    }

    if (req.body.server_name) {
        updatevalue.server_name = req.body.server_name;
    }
    if (req.body.ip) {
        updatevalue.ip = req.body.ip;
    }

    console.log(updatevalue,"=========");

    const query = {
        _id: mongoose.Types.ObjectId(req.query.id)
    },
        update = {
            $set: updatevalue
        },
        options = {
            new: true,
            upsert: false

        }

    Server.findByIdAndUpdate(query, update, options).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ serverdata: data });
    }).catch(next);

}

server.deleteServer  = (req,res,next) =>{


    Server.deleteOne({_id:req.params.id}).then(data => {
        if (!data) { return res.sendStatus(422); }
        return res.json({ success: 'OK', message: "Server is permanently deleted successfully!" });
    }).catch(next);
}

module.exports = server;