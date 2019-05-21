const Buyer_Number = require('../models/buyer_number.model');
const request = require('request-promise');

module.exports = {
    getBuyer(req, reply, next) {
        function buyerName(num) {

            return new Promise((resolve, reject) => {

                let aggregate = [
                    {
                        $match: { number: num },
                    },
                    {
                        $lookup: {
                            from: 'buyers',
                            localField: 'buyer_id',
                            foreignField: 'buyer_id',
                            as: 'buyerdata'
                        }
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            buyer_id: 1,
                            buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                        }
                    }
                ];

                Buyer_Number.aggregate(aggregate).then(data => {

                    if (!data) {
                        return resolve('-NA-');
                    }
                    return resolve(data[0]);
                }).catch(next);
            });

        }

        function filterNullValues(data) {
            return new Promise(async (resolve, reject) => {
                const filterArr = await data.filter(x =>{
                    x.calls = x.calls.filter(y=>y);
                    return x;
                });
                resolve(filterArr);
            });

        }

        function mergeArray(data) {

            let mergeArr = [];
            return new Promise(async (resolve, reject) => {

                let t = 0;
                let k = 7;

                for (let i = 0; i < data.length; i++) {

                    if (data[i]['buyer_number'] > 0) {

                        if (data[i]['buyer_number'].length >= 6) {

                            const d = await buyerName(data[i]['buyer_number']);
                            if (d!== undefined && d.buyer_id !== undefined) {
                                if (mergeArr[d.buyer_id] === undefined) {
                                    t = 0;
                                    mergeArr[d.buyer_id] = { key: data[i]['buyer_number'], name: d.buyerName, calls: [], total: 0, dynamic: true };
                                } else {
                                    t = mergeArr[d.buyer_id].total;
                                }

                                if (mergeArr[d.buyer_id].key === data[i]['buyer_number']) {
                                    if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                        mergeArr[d.buyer_id].calls[k] = [];
                                    }
                                    mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                                } else {
                                    k++;
                                    if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                        mergeArr[d.buyer_id].calls[k] = [];
                                    }
                                    mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                                }

                                t++;
                                mergeArr[d.buyer_id].total = t;
                            }

                        }
                        if (data[i]['buyer_number'].length === 4) {
                            if (data[i]['buyer_number'] >= 1001 && data[i]['buyer_number'] <= 1070) {
                                if (mergeArr[0] === undefined) {
                                    t = 0;
                                    mergeArr[0] = { key: 'tech_chhd', name: 'TS', calls: [], total: 0, dynamic: false };
                                    mergeArr[0].calls[0] = [];
                                } else {
                                    t = mergeArr[0].total;
                                }
                                t++;
                                mergeArr[0].total = t;
                                mergeArr[0].calls[0] = [...mergeArr[0].calls[0], data[i]];
                            }
                            if (data[i]['buyer_number'] >= 2001 && data[i]['buyer_number'] <= 2150) {
                                if (mergeArr[1] === undefined) {
                                    t = 0;
                                    mergeArr[1] = { key: 'tech_ggn', name: 'Tech LDH', calls: [], total: 0, dynamic: false };
                                    mergeArr[1].calls[0] = [];
                                } else {
                                    t = mergeArr[1].total;
                                }
                                t++;
                                mergeArr[1].total = t;
                                mergeArr[1].calls[0] = [...mergeArr[1].calls[0], data[i]];
                            }
                            if (data[i]['buyer_number'] >= 3001 && data[i]['buyer_number'] <= 3050) {
                                if (mergeArr[3] === undefined) {
                                    t = 0;
                                    mergeArr[3] = { key: 'tech_mada', name: 'Tech MADA', calls: [], total: 0, dynamic: false };
                                    mergeArr[3].calls[0] = [];
                                } else {
                                    t = mergeArr[3].total;
                                }
                                t++;
                                mergeArr[3].total = t;
                                mergeArr[3].calls[0] = [...mergeArr[3].calls[0], data[i]];
                            }
                            /* if ((data[i]['buyer_number'] >= 5001 && data[i]['buyer_number'] <= 5096) || (data[i]['buyer_number'] >= 5129 && data[i]['buyer_number'] <= 5240)) {
                                if (mergeArr[4] === undefined) {
                                    t = 0;
                                    mergeArr[4] = { key: 'tech_rch', name: 'Tech RCH', calls: [], total: 0, dynamic: false };
                                    mergeArr[4].calls[0] = [];
                                } else {
                                    t = mergeArr[4].total;
                                }
                                t++;
                                mergeArr[4].total = t;
                                mergeArr[4].calls[0] = [...mergeArr[4].calls[0], data[i]];
                            } */
                            if (data[i]['buyer_number'] >= 9001 && data[i]['buyer_number'] <= 9040) {
                                if (mergeArr[5] === undefined) {
                                    t = 0;
                                    mergeArr[5] = { key: 'tech_tunis', name: 'Tech TUNIS', calls: [], total: 0, dynamic: false };
                                    mergeArr[5].calls[0] = [];
                                } else {
                                    t = mergeArr[5].total;
                                }
                                t++;
                                mergeArr[5].total = t;
                                mergeArr[5].calls[0] = [...mergeArr[5].calls[0], data[i]];
                            }
                        }
                        if (data[i]['buyer_number'].length === 5) {
                            if (mergeArr[6] === undefined) {
                                t = 0;
                                mergeArr[6] = { key: 'travel', name: 'Travel', calls: [], total: 0, dynamic: false };
                                mergeArr[6].calls[0] = [];
                            } else {
                                t = mergeArr[6].total;
                            }
                            t++;
                            mergeArr[6].total = t;
                            mergeArr[6].calls[0] = [...mergeArr[6].calls[0], data[i]];
                        }
                        if(data[i]['buyer_number'].length === 3){                            
                            if (data[i]['buyer_number'] == 622) {
                                
                                if (mergeArr[7] === undefined) {
                                    t = 0;
                                    mergeArr[7] = { key: 'tech_ldh', name: 'Tech LDH', calls: [], total: 0, dynamic: false };
                                    mergeArr[7].calls[0] = [];
                                } else {
                                    t = mergeArr[7].total;
                                }
                                t++;
                                mergeArr[7].total = t;
                                mergeArr[7].calls[0] = [...mergeArr[7].calls[0], data[i]];
                            }
                        }
                    }
                }
                // console.log(mergeArr, 'last');
                let filterNull = await filterNullValues(mergeArr);
                resolve(filterNull)
            });
        }


        return request('https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw')
            .then(async (body) => {

                //  console.log(body, "=======================")
                //resolve(statusCode, body, headers);
                const result = await mergeArray(JSON.parse(body));
                return { data: result };
            }).catch((e) => {
                return { err: e };
            });

    },
    getBuyer2(req, reply, next) {
        function buyerName(num) {

            return new Promise((resolve, reject) => {

                let aggregate = [
                    {
                        $match: { number: num },
                    },
                    {
                        $lookup: {
                            from: 'buyers',
                            localField: 'buyer_id',
                            foreignField: 'buyer_id',
                            as: 'buyerdata'
                        }
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            buyer_id: 1,
                            buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                        }
                    }
                ];

                Buyer_Number.aggregate(aggregate).then(data => {

                    if (!data) {
                        return resolve('-NA-');
                    }
                    return resolve(data[0]);
                }).catch(next);
            });

        }

        function filterNullValues(data) {
            return new Promise(async (resolve, reject) => {
                const filterArr = await data.filter(x =>{
                   // x.calls = x.calls.filter(y=>y);
                    return x;
                });
                resolve(filterArr);
            });

        }

        function mergeArray(data) {

            let mergeArr = [];
            return new Promise(async (resolve, reject) => {

                let t = 0;
                let k = 0;

                for (let i = 0; i < data.length; i++) {

                    if (data[i]['buyer_number'] > 0) {
                        if (data[i]['buyer_number'].length >= 6) {
                            const d = await buyerName(data[i]['buyer_number']);
                            if (d!== undefined && d.buyer_id !== undefined) {
                                if (mergeArr[d.buyer_id] === undefined) {
                                    t = 0;
                                    mergeArr[d.buyer_id] ={ key: data[i]['buyer_number'], name: d.buyerName, calls:[] , total: 0, dynamic: true };
                                } else {
                                    t = mergeArr[d.buyer_id].total;
                                }
                                
                                let b_exits = false;

                                mergeArr[d.buyer_id].calls.forEach(b=>{                                	
                                	if(b.key === data[i]['buyer_number']){
                                		/*if (!b.value.hasOwnProperty(k)) {
	                                        b.value[k] = [];
	                                    }*/
                                		b.value = [...b.value, data[i]];
                                		b_exits = true;
                                	}
                                });                               
                                if(!b_exits){
                                	let b=[];                                	
                                	b=[...b,data[i]];
                                    let a = {key: data[i]['buyer_number'], value:b };
                                	mergeArr[d.buyer_id].calls =[...mergeArr[d.buyer_id].calls,a];
                                }
   								k++;                               
                                t++;
                                mergeArr[d.buyer_id].total = t;
                            }

                        }
                       if (data[i]['buyer_number'].length === 4) {
                           const chdArr=['1001','1002','1003','1004','1005','1006','1007','1008','1009','1010','1011','1012','1013','1014','1015','1016','1017','1018','1019','1020','1021','1022','1023','1024','1025','1026','1027','1028','1029','1030','1031','1032','1033','1034','1035','1036','1037','1038','1039','1040','1041','1042','1043','1044','1045','1046','1047','1048','1049','1050','1051','1052','1053','1054','1055','1056','1057','1058','1059','1060','1061','1062','1063','1064','1065','1066','1067','1068','1069','1070'];
                            if (chdArr.indexOf(data[i]['buyer_number']) > 0) {
                                if (mergeArr[0] === undefined) {
                                    t = 0;
                                    mergeArr[0] = { key: 'tech_chhd', name: 'TS', calls: [], total: 0, dynamic: false }; 
                                    mergeArr[0].calls[0]= {key: 'static', value:[]};                                   
                                } else {
                                    t = mergeArr[0].total;
                                }
                                t++;
                                mergeArr[0].total = t;                            
                                mergeArr[0].calls[0].value = [...mergeArr[0].calls[0].value, data[i]];
                            }
                            if (data[i]['buyer_number'] >= 2001 && data[i]['buyer_number'] <= 2150) {
                                if (mergeArr[1] === undefined) {
                                    t = 0;
                                    mergeArr[1] = { key: 'tech_ggn', name: 'Tech LDH', calls: [], total: 0, dynamic: false };
                                   	mergeArr[1].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[1].total;
                                }
                                t++;
                                mergeArr[1].total = t;
                                mergeArr[1].calls[0].value = [...mergeArr[1].calls[0].value, data[i]];
                            }
                            if (data[i]['buyer_number'] >= 3001 && data[i]['buyer_number'] <= 3050) {
                                if (mergeArr[3] === undefined) {
                                    t = 0;
                                    mergeArr[3] = { key: 'tech_mada', name: 'Tech MADA', calls: [], total: 0, dynamic: false };
                                    mergeArr[3].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[3].total;
                                }
                                t++;
                                mergeArr[3].total = t;
                                mergeArr[3].calls[0].value = [...mergeArr[3].calls[0].value, data[i]];
                                
                            }
                            /* const rchArr=['1006','1007','1008','1009','1014','1015','1016','1017','1018','1019','1020','1021','1022','1023','1024','1025','1026','1027','1048','1049','1050','1051','1052','1053','1054','1055','1056','1057','1058','1059','1060','1061','1062','1063','1064','1065','1066','1067','1068','1069','5097','5098','5099','5100','5101','5102','5103','5104','5105','5106','5107','5108','5109','5110','5111','5112','5113','5114','5115','5116','5117','5118','5119','5120','5121','5122','5123','5124','5125','5126','5127','5128','5129','5130','5131','5132','5133','5134','5135','5136','5137','5138','5241','5242','5243','5244','5245','5246','5247','5248','5249','5250','5251','5252','5253','5254'];
                            if (rchArr.indexOf(data[i]['buyer_number']) > 0) {
                                if (mergeArr[4] === undefined) {
                                    t = 0;
                                    mergeArr[4] = { key: 'tech_rch', name: 'Tech RCH', calls: [], total: 0, dynamic: false };
                                    mergeArr[4].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[4].total;
                                }
                                t++;
                                mergeArr[4].total = t;
                                mergeArr[4].calls[0].value = [...mergeArr[4].calls[0].value, data[i]];                                
                            } */
                            if (data[i]['buyer_number'] >= 9001 && data[i]['buyer_number'] <= 9040) {
                                if (mergeArr[5] === undefined) {
                                    t = 0;
                                    mergeArr[5] = { key: 'tech_tunis', name: 'Tech TUNIS', calls: [], total: 0, dynamic: false };
                                    mergeArr[5].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[5].total;
                                }
                                t++;
                                mergeArr[5].total = t;                               
                                mergeArr[5].calls[0].value = [...mergeArr[5].calls[0].value, data[i]];                                
                            }
                        }
                        if (data[i]['buyer_number'].length === 5) {
                            if (mergeArr[6] === undefined) {
                                t = 0;
                                mergeArr[6] = { key: 'travel', name: 'Travel', calls: [], total: 0, dynamic: false };
                                mergeArr[6].calls[0]= {key: 'static', value:[]};
                            } else {
                                t = mergeArr[6].total;
                            }
                            t++;
                            mergeArr[6].total = t;
                            mergeArr[6].calls[0].value = [...mergeArr[6].calls[0].value, data[i]];  
                        }
                        if(data[i]['buyer_number'].length === 3){                            
                            if (data[i]['buyer_number'] == 622) {
                                
                                if (mergeArr[7] === undefined) {
                                    t = 0;
                                    mergeArr[7] = { key: 'tech_ldh', name: 'Tech LDH', calls: [], total: 0, dynamic: false };
                                    mergeArr[7].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[7].total;
                                }
                                t++;
                                mergeArr[7].total = t;
                               mergeArr[7].calls[0].value = [...mergeArr[7].calls[0].value, data[i]];  ;
                            }
                        }
                    }

                }
                // console.log(mergeArr, 'last');
                let filterNull = await filterNullValues(mergeArr);
                resolve(filterNull)
            });
        }


        return request('https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw')
            .then(async (body) => {

                //  console.log(body, "=======================")
                //resolve(statusCode, body, headers);
                const result = await mergeArray(JSON.parse(body));
                return { data: result };
            }).catch((e) => {
                return { err: e };
            });

    },
    getSpecific(req, reply, next) {
        function buyerName(num) {

            return new Promise((resolve, reject) => {

                let aggregate = [
                    {
                        $match: { number: num },
                    },
                    {
                        $lookup: {
                            from: 'buyers',
                            localField: 'buyer_id',
                            foreignField: 'buyer_id',
                            as: 'buyerdata'
                        }
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            buyer_id: 1,
                            buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                        }
                    }
                ];

                Buyer_Number.aggregate(aggregate).then(data => {

                    if (!data) {
                        return resolve('-NA-');
                    }
                    return resolve(data[0]);
                }).catch(next);
            });

        }

        function filterNullValues(data) {
            return new Promise(async (resolve, reject) => {
                const filterArr = await data.filter(x => x);
                resolve(filterArr);
            });

        }

        function mergeArray(data) {
            let mergeArr = [];
            return new Promise(async (resolve, reject) => {

                let t = 0;
                let k = 0;

                for (let i = 0; i < data.length; i++) {

                    if (data[i]['buyer_number'] > 0) {
                        if (data[i]['buyer_number'].length >= 6) {
                            const d = await buyerName(data[i]['buyer_number']);
                            if (d!== undefined && d.buyer_id !== undefined && d.buyer_id === parseInt(req.query.buyer_id)) {
                                if (mergeArr[d.buyer_id] === undefined) {
                                    t = 0;
                                    mergeArr[d.buyer_id] ={ key: data[i]['buyer_number'], name: d.buyerName, calls:[] , total: 0, dynamic: true };
                                } else {
                                    t = mergeArr[d.buyer_id].total;
                                }
                                
                                let b_exits = false;

                                mergeArr[d.buyer_id].calls.forEach(b=>{
                                	console.log(b.key+' === '+data[i]['buyer_number']);
                                	if(b.key === data[i]['buyer_number']){
                                		/*if (!b.value.hasOwnProperty(k)) {
	                                        b.value[k] = [];
	                                    }*/
                                		b.value = [...b.value, data[i]];
                                		b_exits = true;
                                	}
                                });                               
                                if(!b_exits){
                                	let b=[];                                	
                                	b=[...b,data[i]];
                                    let a = {key: data[i]['buyer_number'], value:b };
                                	mergeArr[d.buyer_id].calls =[...mergeArr[d.buyer_id].calls,a];
                                }
   								k++;                               
                                t++;
                                mergeArr[d.buyer_id].total = t;
                            }

                        }
                        if (data[i]['buyer_number'].length === 4 && parseInt(req.query.buyer_id) === 441) {
                           
                            if (data[i]['buyer_number'] >= 9001 && data[i]['buyer_number'] <= 9040) {
                                if (mergeArr[5] === undefined) {
                                    t = 0;
                                    mergeArr[5] = { key: 'tech_tunis', name: 'Tech TUNIS', calls: [], total: 0, dynamic: false };
                                    mergeArr[5].calls[0]= {key: 'static', value:[]};
                                } else {
                                    t = mergeArr[5].total;
                                }
                                t++;
                                mergeArr[5].total = t;                               
                                mergeArr[5].calls[0].value = [...mergeArr[5].calls[0].value, data[i]];                                
                            }
                        }                        
                    }

                }
                // console.log(mergeArr, 'last');
                let filterNull = await filterNullValues(mergeArr);
                resolve(filterNull)
            });
        }

        return request('https://portal.pbx4you.com/realtime.php?hasher=U3VjY2Vzcw')
            .then(async (body) => {

                //  console.log(body, "=======================")
                //resolve(statusCode, body, headers);
                const result = await mergeArray(JSON.parse(body));
                return { data: result };
            }).catch((e) => {
                return { err: e };
            });

    },
}
