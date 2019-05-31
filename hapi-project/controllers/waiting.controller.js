const request = require('request-promise');
const Buyer_Number = require('../models/buyer_number.model');
const exec = require('child_process').exec;

module.exports = {
    getAll(req, reply, next) {

        let waiting_calls = [];
        const url = 'http://portal.routemycalls.com/waitingcalls.php';// 'http://portal.pbx4you.com/monitoring/test.txt'
        return request(url)
            .then((body) => {
                // console.log(body, "=======================")
                const prishi = JSON.parse(body);
                return { waiting_calls: prishi.waiting_calls };

            }).catch((err) => {

                return err;
            });

    },

}