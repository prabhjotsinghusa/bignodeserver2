// const {
//     sign,
//     verify
// } = require('jsonwebtoken');
const md5 = require('md5');
const exec = require('child_process').exec;
// const path = require('path');
const fs = require('fs');
// const pdf = require('html-pdf');
// const qrImage = require('qr-image');

// const {
//     eachSeries
// } = require('async');

// const {
//     get: fetchMailConfigs
// } = require('../configs/email-config');
// const {
//     get: fetchAppConfigs
// } = require('../configs/app-config');
// const {
//     createVoucherCode: getVoucherCode,
//     aggregate: checkForVoucher,
//     count: countVouchers,
//     add: addVoucher,
//     get: getVouchers,
//     getCampaign: fetchCampaign

// } = require("../components/Vouchers");

// const {
//     addTransaction: saveTransaction,
//     get: getTransaction,
//     update: updateTransaction

// } = require("../components/Transactions");

// const {
//     addCardToken: createToken,
//     addCustomer: createCustomer,
//     saveCustomer: saveCustomerDetails,
//     addCard: createCard,
//     get: fetchAllCards,
//     deleteSpecificCard: removeCard,
//     addCharge: saveCharge,

//     //addTransaction: saveTransaction
// } = require("../components/Stripe");

// const {
//     moveFileTmpToCdn,
//     get: getFile
// } = require("../components/Files");

// const {
//     add: saveCardTemplate,
//     update: updateCardTemplate

// } = require("../components/Cards");

// const {
//     updateOne: updateNotification,
//     add: addNotification,
//     get: getNotification
// } = require("../components/Notification");
// const transactionModel = require('../components/Transactions/models');

// const mongoose = require("mongoose");
// const _ = require("underscore");
// const cheerio = require("cheerio");
// const schedule = require('node-schedule');
// const request_promise = require('request-promise');

/**** Function runs after a request fails on JOI validation to clean up the message that JOI validation creates ****/
const failActionFunction = (request, reply, source, error) => {
    let customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation
    return reply(error);
};

/**** Function to genrate a random string of provided length ****/
const generateRandomString = (alphanumeric = true, length) => {
    let data = "",
        stringkey = "";

    if (alphanumeric) {
        stringkey = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    } else {
        stringkey = "0123456789";  //ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }

    for (let i = 0; i < length; i++) {
        data += stringkey.charAt(Math.floor(Math.random() * stringkey.length));
    }
    return data;
};

/**** Utility function to capitalize first character of every word provided in the string ****/
const capitalizeFirstLetter = string => {

    let firstname;

    let names = string.split(' ')

    if (names.length > 1) { // first name and second name both

        let username = "";

        for (let i = 0; i < names.length; i++) {

            firstname = names[i].charAt(0).toUpperCase() + names[i].slice(1);
            if (i != 0) {
                username = username + ' ' + firstname;
            } else {
                username = firstname;
            }
        }
        return username

    } else if (names.length == 1) { // only first name

        firstname = names[0].charAt(0).toUpperCase() + names[0].slice(1);
        username = firstname;
        return username;

    } else {

        return '';

    }
};

/**** Encode a string to MD5 ****/
const encodeMD5 = string => md5(string);

const getNextSequenceValue = (sequenceName) => {

    var sequenceDocument = db.counters.findAndModify({
        query: { uid: sequenceName },
        update: { $inc: { uid: 1 } },
        new: true
    });

    return sequenceDocument.sequence_value;
}

/**** Create JWT using the key set in App Configs ****/
const createJWT = object => sign(object, fetchAppConfigs('/keys/JWT_SECRET_KEY'));

/**** Decoding JWT using the key provided  ****/
const decodeJWT = jwt => {

    return new Promise((fulfill, reject) => {

        verify(jwt, fetchAppConfigs('/keys/JWT_SECRET_KEY'), (err, decodedData) => {
            if (err) {
                reject(err)
            } else {
                fulfill(decodedData)
            }
        });

    });
}

/**** Function to fetch contents of a file ****/
const fetchFile = filepath => {
    return new Promise((fulfill, reject) => {

        if (fs.existsSync(filepath)) {

            let fileReadStream = fs.createReadStream(filepath),
                content = ' ';

            fileReadStream.on('data', function (buffer) {
                content += buffer.toString();
            });

            fileReadStream.on('end', function (res) {
                fulfill(content);
            });

        } else {
            reject("File does not exist.")
        }

    });
}



const fetchDiscountedPrices = async (userData, campaignId, voucherPriceObj, loyaltyLevelObj) => {

    let respObj = {},
        lis = {},
        voucherLevel = [];

    Object.keys(loyaltyLevelObj).sort().forEach(levelKey => {
        const resultant = [];

        if (levelKey !== '$init') { //temporary
            Object.keys(voucherPriceObj).sort().forEach(voucherKey => {

                const obj = {

                    'loyaltyLevel': loyaltyLevelObj[levelKey],
                    'amount': voucherPriceObj[voucherKey],
                    'discountedPrice': Math.round(voucherPriceObj[voucherKey] - 0.01 * loyaltyLevelObj[levelKey] * voucherPriceObj[voucherKey]),
                    'isActive': levelKey == 'level1'

                }
                resultant.push(obj)
            })
            voucherLevel.push(resultant)
        }

    });

    if (userData != undefined || userData != null) {

        let voucherObj = {

            userId: userData._id,
            campaignId: mongoose.Types.ObjectId(campaignId),
            isDeleted: false

        },
            options = {
                amount: 1,
                loyaltyLevel: 1,
                levelKey: 1,
                _id: 0
            }


        try {

            let voucherPricesResponse = await getVouchers(voucherObj, options)
            //console.log(voucherPricesResponse,'...........voucherPricesResponse')
            voucherLevel.forEach((voucherList, voucherIndex) => {

                voucherList.forEach((voucherPriceObj, index) => {

                    if (_.findWhere(voucherPricesResponse, {
                        loyaltyLevel: voucherPriceObj.loyaltyLevel,
                        amount: voucherPriceObj.amount
                    })) {

                        voucherPriceObj.isActive = false;

                        if (voucherLevel[voucherIndex + 1] != undefined) {

                            voucherLevel[voucherIndex + 1][index].isActive = true;
                        }
                        for (let i = 0; i < voucherLevel.length; i++) {

                            lis[`level${i + 1}`] = voucherLevel[i];
                        }

                    }
                })
            })
        } catch (err) {
            console.log(err)
            throw err;
        }
    }

    for (let i = 0; i < voucherLevel.length; i++) {

        lis[`level${i + 1}`] = voucherLevel[i];

    }

    return lis
}

/**** Function to genrate a random string of provided length ****/
const generateVoucherCode = (voucherCodeObj) => {
    let data = "",
        stringkey = "",
        length = 11;


    stringkey = voucherCodeObj.campaignId.concat(voucherCodeObj.userId);


    for (let i = 0; i < length; i++) {
        data += stringkey.charAt(Math.floor(Math.random() * stringkey.length));
    }
    return data;
};



const fetchPdf = (template, filename) => {

    console.log("Template *** ", template, " File name *** ", filename)

    let rnString = generateRandomString();

    console.log(template, filename, '................/');

    const filePath = `/home/ankit/Downloads/` + filename + `_${rnString}.pdf`;

    return new Promise((resolve, reject) => {

        pdf.create(template).toFile(filePath, (err, res) => {

            console.log(err, res, '........................res')

            if (err) {
                reject(err);

            } else {
                resolve(res)

            }
        });

    });

};


const schedulePayment = () => {

    return new Promise((fulfill, reject) => {

        function fetchBankAccountBusiness(transactionChargeArr) {

            Promise.all(transactionChargeArr.map(id => {


                return getItem(id).then(result => {

                    return result.name;

                });

            })).then(results => {
                //results is an array of names

            });

        }

        function getPendingPaymentsBusiness() {

            const transactionObj = {

                transferedToBusiness: false,
                campaignId: ObjectId("5a672089b501de46070f4d9e")

            },
                options = {
                    paymentObject: 1
                };

            return new Promise((fulfill, reject) => {

                transactionModel.find(transactionObj, options).exec((err, res) => {
                    if (err) {

                        reject(err);
                    } else {

                        fetchBankAccountBusiness(res);
                    }
                });


            });
        }

        // function paymentToBusiness() {

        //     return new Promise((fulfill, reject) => {

        //         fulfill(console.log('........Test'));

        //     });
        // }

        schedule.scheduleJob('* */1 * * * *', () => {

            getPendingPaymentsBusiness()

        });

    });
};

const encodeImage = (fileName) => {

    const data = fs.readFileSync(fileName);

    return data.toString('base64');

}

const newTemplate = (templateString, values) => {

    return new Promise((resolve, reject) => {
        if (values.length > 0) {
            let finalTemplate = templateString;
            eachSeries(values, (component, cb) => {

                const {
                    valueType,
                    value,
                    containerType
                } = component,
                    $ = cheerio.load(finalTemplate),
                    componentString = "#container" + containerType;

                if (valueType == "image") {

                    const queryObj = {
                        _id: value
                    },
                        options = {
                            fileExtension: 1,
                            tmpLocation: 1
                        };

                    getFile(queryObj, options).then(file => {

                        if (file.length > 0) {

                            const {
                                _id,
                                tmpLocation,
                                fileExtension
                            } = file[0],
                                filePath = tmpLocation + '/' + _id + '.' + fileExtension;

                            encodedImage = encodeImage(filePath);

                            $(componentString).append("<img src='data:image/jpeg;base64," + encodedImage + "'" + " height='200' width='200' />");

                            finalTemplate = $.html();

                            cb(null, true);
                        }

                    }).catch(err => cb(err));

                } else {

                    $(componentString).append("<p>" + value + "</p>")
                    finalTemplate = $.html();

                    cb(null, true);
                }

            }, (err, res) => {

                if (err) {
                    reject(err)
                } else {
                    resolve(finalTemplate)
                }
            });
        }
    });
}

const addtemplateCard = (templateData) => {

    return new Promise((resolve, reject) => {

        let cardObj = {};

        function addFrontTemplate() {

            return new Promise((resolve, reject) => {

                if (templateData.hasOwnProperty("frontTemplate") && templateData["frontTemplate"].hasOwnProperty("values") && templateData["frontTemplate"]["values"].length > 0) {

                    const {
                        values,
                        type
                    } = templateData["frontTemplate"];

                    let templateString = "",
                        templatePath = "";

                    switch (type) {
                        case 0:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template1");
                            break;
                        case 1:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template2");
                            break;
                        case 2:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template3");
                            break;
                        case 3:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template4");
                            break;
                        case 4:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template5");
                            break;
                        case 5:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template6");
                            break;
                        case 6:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template7");
                            break;
                        case 7:
                            templatePath = fetchAppConfigs("/cardTemplatePath/template8");
                            break;
                        default:
                            console.log('.............mm')
                            break;
                    }
                    fetchFile(templatePath).then(template => newTemplate(template, templateData["frontTemplate"]["values"])).then(result => {

                        cardObj.frontside = JSON.stringify(result)
                        return fetchPdf(result, 'cardTemplate')

                    }).then(result => {

                        //console.log("This is result **** ", result)
                        resolve(result)

                    }).catch(err => {

                        //console.log("Error While fetching file **** ", err);
                        reject(err)
                    });
                };
            });
        }

        function addRightTemplate() {

            return new Promise((resolve, reject) => {

                if (templateData.hasOwnProperty("insideRightTemplate") && templateData["insideRightTemplate"].length > 0) {

                    let templateString = "",
                        templatePath = fetchAppConfigs("/cardTemplatePath/insideRight");

                    fetchFile(templatePath).then(template => newTemplate(template, templateData["insideRightTemplate"])).then(result => {


                        cardObj.rightside = JSON.stringify(result);
                        return fetchPdf(result, 'cardTemplate')

                    }).then(result => {

                        resolve(result)

                    }).catch(err => {

                        console.log("Error While fetching file **** ", err);
                        reject(err)
                    });
                }
            });
        }

        function addQrCode(content) {
            return new Promise((resolve, reject) => {

                let $ = cheerio.load(content),
                    componentString = "#container0",
                    qrData = qrImage.imageSync(templateData.qrCode, {
                        type: 'png'
                    }),
                    encodedQr = Buffer.from(qrData).toString('base64');
                console.log(encodedQr, '...........encodedQr');
                $(componentString).append("<img src='data:image/jpeg;base64," + encodedQr + "'" + " width='200' />");

                resolve($.html())
            })
        }

        function fetchModifiedTeplate(templatePath) {

            return new Promise((resolve, reject) => {

                fetchFile(templatePath).then(template => {

                    let content = template.replace('{{amount}}', templateData.amount)
                        .replace('{{business_name}}', templateData.businessName.toUpperCase());

                    return addQrCode(content)

                }).then(template => {

                    cardObj.leftside = JSON.stringify(template);
                    console.log(template, '.......cardObj.leftside')
                    return fetchPdf(template, 'cardTemplate')

                }).then(result => {

                    console.log(result, '.......fetchModifiedTeplate')

                    resolve(result);

                }).catch(err => {

                    console.log("Error While fetching file **** ", err);
                    reject(err)
                });
            });
        }

        function addLeftTemplate() {

            return new Promise((resolve, reject) => {

                let templateString = "",
                    templatePath = fetchAppConfigs("/cardTemplatePath/insideLeft");

                fetchModifiedTeplate(templatePath).then(template => {

                    console.log(template, '/////////addLeftTemplate')
                    resolve(template)

                }).catch(err => {

                    console.log("Error While fetching file **** ", err);
                    reject(err)
                });
            });
        }

        addFrontTemplate().then(res => {
            console.log(res, 'addFrontTemplateaddFrontTemplate')
            if (res) {
                return addRightTemplate()
            }
        }).then(res => {
            console.log(res, 'addFrontTemplateaddFrontTemplate')
            return addLeftTemplate()

        }).then(res => {
            console.log(res, 'addRightTemplateaddRightTemplate')
            if (res) {
                return saveCardTemplate(cardObj)
            }
        }).then(result => {

            resolve(result)

        }).catch(err => {

            reject(err)
        });

        // if (templateData.hasOwnProperty("backTemplate") && templateData["backTemplate"].length > 0) {

        //     templateData["backTemplate"].forEach(imageValue => {

        //         fetchAppConfigs("/cdnTempPath" + imageValue["value"]);
        //     });
        // };
    });


};

const saveNotifications = (notificationObj) => {

    console.log("insie save Notification function ....", notificationObj)

    return new Promise((resolve, reject) => {

        console.log("inside promose");

        addNotification(notificationObj).then(notifications => { // check receiver user exists

            if (notifications && notifications.length > 0) {

                const unreadNotificationObj = {

                    receiver_id: notificationObj.receiver_id,
                    is_read: false,
                    notification_type: {

                        $in: [1, 2]

                    }

                };

                return getNotification(unreadNotificationObj)

            } else {
                let response = Boom.conflict(fetchResponses("/message/NOTIFICATION_NOT_ADDED"));
                throw response;
            }
        }).then(unreadNotifications => {
            console.log("inside net to save the notifications")

            //   addNotification(dataToSave);

            let response = Object.assign({}, fetchResponses("/response", {
                type: "success"
            }));
            response.message = fetchResponses("/message/NOTIFICATION_SENT");
            response.data = unreadNotifications.length;
            resolve(response);

        }).catch((err) => {
            console.log(err);
            reject(err);
        });

    });

};
const serverCall = () => {
    return new Promise((resolve, reject) => {
        /* /* remote server code execution in node */
        //const str = "sshpass -p '!$@DeM0$((.!7$!' ssh -o StrictHostKeyChecking=no root@103.115.35.17 /var/lib/asterisk/bin/module_admin reload";
        //const str = "sshpass -p 'Welcome@82A' ssh -o StrictHostKeyChecking=no root@162.221.88.195 /var/lib/asterisk/bin/module_admin reload";
        // const str = "sshpass -p 'QOJf3278tEkxWRk5L4AD' ssh -o StrictHostKeyChecking=no root@13.127.63.54 /var/lib/asterisk/bin/module_admin reload";
        const str = "sshpass -p 'M87?7q758T*MQtGyGVp9' ssh -o StrictHostKeyChecking=no root@66.185.29.98 /var/lib/asterisk/bin/module_admin reload";
        exec(str, (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
                throw e;
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });


        /*    } else {
               reject("File does not exist.")
           } */

    });
}
const blacklist = (num) => {
    return new Promise((resolve, reject) => {
        /* /* remote server code execution in node */
        const str = `sshpass -p 'M87?7q758T*MQtGyGVp9' ssh root@66.185.29.98 /usr/sbin/asterisk -rvx \\'database put blacklist ${num} 1\\'`;
        // console.log(str);
        exec(str, (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
                throw e;
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });
    });
}
const delBlacklist = (num) => {
    return new Promise((resolve, reject) => {
        /* /* remote server code execution in node */
        const str = `sshpass -p 'M87?7q758T*MQtGyGVp9' ssh root@66.185.29.98 /usr/sbin/asterisk -rvx \\'database del blacklist ${num}\\'`;
        // console.log(str);
        exec(str, (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
                throw e;
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });


    });
}
const getBlacklist = () => {
    return new Promise((resolve, reject) => {
        /* /* remote server code execution in node */
        const str = `sshpass -p 'M87?7q758T*MQtGyGVp9' ssh root@66.185.29.98 /usr/sbin/asterisk -rvx \\'database show blacklist\\'`;
        // console.log(str);
        exec(str, (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
                throw e;
            }
            if (stderr) {
                return reject(stderr);
            }
            return resolve(stdout);
            /* console.log('stdout ', stdout);
            console.log('stderr ', stderr); */
        });


    });
}

module.exports = {

    failActionFunction,
    generateRandomString,
    capitalizeFirstLetter,
    encodeMD5,
    createJWT,
    fetchFile,
    decodeJWT,
    generateVoucherCode,
    fetchDiscountedPrices,
    fetchPdf,
    schedulePayment,
    addtemplateCard,
    saveNotifications,
    serverCall,
    blacklist,
    getBlacklist,
    delBlacklist

};