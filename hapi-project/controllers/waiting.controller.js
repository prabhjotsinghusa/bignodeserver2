const request = require('request-promise');
const Buyer_Number = require('../models/buyer_number.model');
const exec = require('child_process').exec;

module.exports = {
    getAll(req, reply, next) {
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
        return request('http://portal.pbx4you.com/monitoring/test.txt')
            .then((body) => {
                // console.log(body, "=======================")
                let rawArr = body.trim('\n').split('\n');
                
                let waiting = rawArr.filter((value, index) => {
                    if (/SIP/i.test(value)) {
                        /* /wait/i.test(value) ||  */
                        return true;
                    }
                });
                if (waiting.length > 0) {
                    waiting.forEach(async (value, index) => {
                        let result = value.split('/');
                        if (result !== undefined) {
                            let finalsip = result[1].split('(');
                            finalsip = finalsip[0].trim(' ');
                            if(finalsip != '1111137749096'){
                                const r = await serverCalling(finalsip);
                                if (r !== null) {
                                    waiting_calls.push(r);
                                }
                            }
                            
                        }
                        if (index >= waiting.length - 1) {
                            console.log(waiting_calls);
                            return {
                                waiting: waiting_calls
                            };
                        }
                    });
                    return {waiting:waiting_calls}

                } else {
                    return {
                        waiting: waiting_calls
                    };
                }


            }).catch((err) => {

                return err;
            });

    },

}