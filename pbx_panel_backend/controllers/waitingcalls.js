var mongoose = require('mongoose');
var Manage_Group = mongoose.model('Manage_Group');
const http = require("http");
const exec = require('child_process').exec;

const {
    getNextSequenceValue,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');


var waitingcalls = {};

waitingcalls.getAll = (req, res, next) => {
    function serverCalling(finalsip) {
        return new Promise((resolve, reject) => {
            const str = `sshpass -p'wP9j@Y$?PBX?$%kCN5@C' ssh root@66.185.29.98 /usr/sbin/asterisk -rvx \\'core show channel ${finalsip}\\'`;
            console.log(str);
            exec(str, (e, stdout, stderr) => {
                if (e instanceof Error) {
                    console.error(e);
                    reject(e);
                }
                /* if(strerr){
                    console.log('stderr ', stderr);
                    res.json({data:''});
                } */
                // console.log('stdout ', stdout);
                if (stdout) {
                    const conn = stdout.split('\n');
                    let did = conn.filter(v => /FROM_DID/.test(v));
                    if(did[0] !== undefined){
                        did = did[0].split('=');
                        did = did[1];                           
                    } else {
                        return resolve(null);
                    } 

                    let connected = conn.filter(v => /FROMEXTEN/.test(v));                
                        connected = connected[0].split('=');
                        connected = connected[1];                           
                    let duration = conn.filter(v => /Elapsed Time/.test(v));               
                    duration = duration[0].split(':');
                    duration = duration[1];                      
                         
                    let hour = duration.split('h');
                    let min = hour[1].split('m');
                    let sec = min[1].split('s');
                    return resolve({ did: did, connected: connected, duration: ('00' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2) });                   
                }
            });
        })
    }
    let waiting_calls = [];
    http.get('http://portal.pbx4you.com/monitoring/test.txt', (response) => {
        const { statusCode } = response;
        const contentType = response.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        } else if (!/^text\/plain/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected text/plain but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.json({ waiting: waiting_calls });
            return;
        }

        //response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', () => {
            try {
                let rawArr = rawData.trim('\n').split('\n');
                //res.json({ data: rawData });

                let waiting = rawArr.filter((value, index) => {
                    if (/SIP/i.test(value)) {/* /wait/i.test(value) ||  */
                        return true;
                    }
                });

                if (waiting.length > 0) {
                    waiting.forEach(async (value, index) => {
                        let result = value.split('/');
                        if(result !== undefined){                            
                            let finalsip = result[1].split('(');
                            finalsip = finalsip[0].trim(' ');
                            const r = await serverCalling(finalsip);
                            if(r !== null){
                                waiting_calls.push(r);          
                            }                                              
                        }
                        if (index >= waiting.length - 1) {                            
                            //console.log(waiting_calls);
                            res.json({ waiting: waiting_calls });
                        }
                    });
                   // res.json({ data: waiting });
                } else {
                    res.json({ waiting: waiting_calls });
                }
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

module.exports = waitingcalls;
