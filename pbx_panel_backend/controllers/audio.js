const mongoose = require('mongoose');
const Audio = mongoose.model('Audio');
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

const audio = {};

//configuring the AWS environment


AWS.config.loadFromPath('./aws_config.json');

var s3 = new AWS.S3();

audio.uploadAudio = (req, res, next) => {
    
    function uploadAudioFile(file, fileName) {
        
        return new Promise((resolve, reject) => {

            //configuring parameters
            const params = {
                Bucket: 'filesystem-backup-bucket',
                Body: file,
                Key: "ankit/" + fileName
            };

            s3.upload(params, (err, data) => {
                //handle error
                if (err) {
                    console.log("Error", err);
                    reject(err);
                }
                console.log(data, "--------------")
                //success
                if (data) {
                    console.log("Uploaded in:", data.Location);
                    resolve(data);
                }
            });



        });

    }

    function saveAudioFile(filename) {
        
        return new Promise((resolve, reject) => {

            Audio.findOne({
                // pub_id: parseInt(req.query.pub_id),
                buyer_id: req.query.buyer_id,
                fileName: filename
            }).then(audio => {

                if (!audio) {
                    // console.log(req.query.buyer_id,typeof req.query.buyer_id);
                    let audio = new Audio();
                    //audio.pub_id = parseInt(req.query.pub_id);
                    audio.buyer_id = req.query.buyer_id;
                    audio.fileName = filename;
                    audio.save().then(data => {
                        if (!data) {
                            reject(res.sendStatus(422));
                        }
                        resolve(data);

                    }).catch(err => {
                        console.log(err)
                        reject(err)
                    });
                }
                else {
                    return res.json({ success: 'failed', message: 'Record file already exists' });
                }
            });
        });

    }

    return new Promise((resolve, reject) => {
        req.pipe(req.busboy);

        req.busboy.on('file', async function (fieldname, file, filename) {
           
            const outputFile = await uploadAudioFile(file, filename);
            const result = await saveAudioFile(filename);

            return resolve(res.json({ success: 'OK' }));
        });
    });
    // return res.json({ success: 'OK' });
}

audio.fetchAudioFile = (req, res, next) => {
    let cond = {};
    if (req.query.buyer_id) {
        cond.buyer_id = parseInt(req.query.buyer_id);
    }

    let queryObj = [

        {
            $match: cond
        },

        {
            $lookup: {
                from: 'buyers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyername'
            }
        },

        {
            "$unwind": "$buyername"
        },
        {
            $project: {
                "fileName": 1,
                "date": { "$dateToString": { "format": "%Y-%m-%d", "date": "$createdAt" } },
                "name": '$buyername.name'

            }
        }
    ];


    Audio.aggregate(queryObj).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ audio: data });
    }).catch(next);

}


module.exports = audio;