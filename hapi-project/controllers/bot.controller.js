const request = require('request-promise');

module.exports = {
    onMemberApi(req, reply, next) {
        var status=req.query.status;
        var queue=req.query.queue;
        var buyer=req.query.buyer;
        var global_cap=req.query.global_cap;
        var capping=req.query.capping;
        return request('http://portal.routemycalls.com/cc_caping/web_service/on_member_api.php?status='+status+'&queue='+queue+'&buyer='+buyer+'&global_cap='+global_cap+'&capping='+capping+'')
            .then(async body => {
                const r = await body;
                //console.log(r, "=======================");
                return { data: r};
            }).catch((e) => {
                return { err: e};
            });

    },
}
