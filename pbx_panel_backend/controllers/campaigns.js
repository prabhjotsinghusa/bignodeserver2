var mongoose = require("mongoose");
var Campaign = mongoose.model("Campaign");
var Tfn = mongoose.model("Tfn");
var CampPubTfn = mongoose.model("Camp_Pub_Tfn");
var CampBuyerTfn = mongoose.model("Camp_Buyer_Tfn");
var mongoose = require("mongoose");
const exec = require("child_process").exec;

const {
  sendEmail,
  sendResetPasswordMail,
  contactUserMail
} = require("../config/mailing"); //fetch mailing-configs from Utility module

const db = require("../config/db"); //fetch mailing-configs from Utility module

const {
  encodeMD5,
  getNextSequenceValue,
  createJWT,
  decodeJWT,
  fetchFile,
  schedulePayment,
  generateRandomString,
  serverCall
} = require("../Utilities/Utilities");

var campaign = {};

campaign.getCampaign = (req, res, next) => {
  let query = {};
  if (req.params.campaignId) {
    query = {
      campaign_id: parseInt(req.params.campaignId),
      pub_id: { $ne: 0 }
    };
  } else {
    query = {
      pub_id: { $ne: 0 }
    };
  }

  let aggregateData = [{
    $match: query
  },
  {
    $lookup: {
      from: "users",
      localField: "pub_id",
      foreignField: "uid",
      as: "userdata"
    }
  },
  {
    $project: {
      campaign_id: 1,
      pub_id: 1,
      camp_name: 1,
      buffer_time: 1,
      price_per_call: 1,
      created_at: 1,
      status: 1,
      time_zone: 1,
      queue_name: 1,
      queue_no: 1,
      read_only: 1,
      active_on: 1,
      active_off: 1,
      publisherName: {
        $arrayElemAt: ["$userdata.fullname", 0]
      }
    }
  }
  ];

  Campaign.aggregate(aggregateData)
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }

      return res.json({
        campaigns: data
      });
    })
    .catch(next);
};

campaign.getPubCampaign = (req, res, next) => {
  let query = {};
  query = {
    pub_id: parseInt(req.params.pubId)
  };

  Campaign.find(query)
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }
      return res.json({
        campaigns: data
      });
    })
    .catch(next);
};

campaign.getAllIvrDetails = (req, res, next) => {
  return new Promise((resolve, reject) => {
    db.query("select * from asterisk.ivr_details", (err, data) => {
      if (err) {
        reject(err);
      } else if (data.length == 0) {
        resolve(null);
      } else {
        resolve(res.json({
          ivrDetails: data
        }));
      }
    });
  });
};

campaign.getCampPubTfns = (req, res, next) => {
  CampPubTfn.find({
    camp_id: req.params.camp_id
  })
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }
      return res.json({
        pub_tfns: data
      });
    })
    .catch(next);
};
campaign.getCampBuyerTfns = (req, res, next) => {
  CampBuyerTfn.find({
    camp_id: req.params.camp_id
  })
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }
      return res.json({
        buyer_tfns: data
      });
    })
    .catch(next);
};
/* deleting the campaign if inside route is empty */
campaign.deleteCampaign = (req, res, next) => {
  function oldTfns(tfn, pub_id) {
    const options = {
      new: false,
      upsert: false
    };
    const query = {
      tfn: tfn,
      pub_id: pub_id
    };
    Tfn.findOneAndUpdate(query, {
      status: "unused"
    }, options)
      .then(data2 => {
        console.log("update1 tfn in mongodb");
      })
      .catch(next);
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE `asterisk`.`incoming` set destination='app-blackhole,hangup,1' WHERE extension LIKE '%" +
        tfn +
        "%'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  function deleteQueue(queue_no) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM `asterisk`.`queues_details` WHERE `id`='" +
        queue_no +
        "'; ",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            console.log("delete queue details and queue config");
            resolve(data);
            db.query(
              "DELETE FROM `asterisk`.`queues_config` WHERE `extension`='" +
              queue_no +
              "'; ",
              (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  console.log("delete each number");
                  resolve(data);
                }
              }
            );
          }
        }
      );
    });
  }
  Campaign.findOne({
    campaign_id: req.params.campaignId
  }).then(campaign => {
    let q = campaign.queue_no;
    if (campaign.inside_route !== '') {
      q = '10000' + req.params.campaignId;
    }
    deleteQueue(q);
    CampPubTfn.find({
      camp_id: campaign.campaign_id
    })
      .then(pub_tfns => {
        pub_tfns.forEach(async p => {
          await oldTfns(p.tfn, p.pub_id);
          console.log("delete campaign pub tfn");
          p.delete();
        });
      }).catch(next);
    CampBuyerTfn.deleteMany({
      camp_id: campaign.campaign_id
    }).then(data => {
      console.log(data, "delete the buyer camp tfn");
    }).catch(next);
    Campaign.deleteOne({
      campaign_id: req.params.campaignId
    })
      .then(data => {
        if (!data) {
          return res.sendStatus(422);
        }
        serverCall();
        return res.json({
          success: "OK",
          message: "Campaign is removed successfully"
        });
      }).catch(next);
  }).catch(next);
};

campaign.addCampaign = async (req, res, next) => {
  console.log(req.body);
  /* Adding the new Campaign */
  let campaign = new Campaign();
  campaign.pub_id = req.body.pub_id;
  campaign.camp_name = req.body.camp_name;
  campaign.buffer_time = req.body.buffer_time || 0;
  campaign.price_per_call = req.body.price_per_call || 0;
  campaign.time_zone = req.body.time_zone;
  campaign.read_only = req.body.read_only;
  campaign.created_at = Date.now();
  campaign.inside_route = req.body.inside_route || "";
  campaign.active_on = req.body.active_on || '00:00:00';
  campaign.active_off = req.body.active_off || '23:59:59';
  campaign
    .save()
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }
      return res.json({ data: data });
    })
    .catch(next);
};
campaign.addCampaign_old = async (req, res, next) => {
  function updateIncoming(tfn, queue) {
    let dest = "";
    if (isNaN(queue) && queue.indexOf(",") > -1) {
      dest = queue;
    } else {
      dest = "ext-queues," + queue + ",1";
    }
    return new Promise((resolve, reject) => {
      /* $this->db->query("update `asterisk`.`incoming` set destination="+$dest+" where extension LIKE '%"+substr(tfn,-10)+"%' ");
               exec("asterisk -rvx 'core reload'"); */
      console.log("updating incoming table");
      db.query(
        "UPDATE `asterisk`.`incoming` set destination='" + dest + "' WHERE extension LIKE '%" + tfn + "%'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  function addQueueDetails(buyer_numbers, queue_no, queue_name) {
    let queue_member = [{
      keyword: "announce-frequency",
      data: "0",
      flags: "0"
    },
    {
      keyword: "announce-holdtime",
      data: "no",
      flags: "0"
    },
    {
      keyword: "announce-position",
      data: "no",
      flags: "0"
    },
    {
      keyword: "answered_elsewhere",
      data: "0",
      flags: "0"
    },
    {
      keyword: "autofill",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "autopause",
      data: "no",
      flags: "0"
    },
    {
      keyword: "autopausebusy",
      data: "no",
      flags: "0"
    },
    {
      keyword: "autopausedelay",
      data: "0",
      flags: "0"
    },
    {
      keyword: "autopauseunavail",
      data: "no",
      flags: "0"
    },
    {
      keyword: "cron_random",
      data: "false",
      flags: "0"
    },
    {
      keyword: "cron_schedule",
      data: "never",
      flags: "0"
    },
    {
      keyword: "joinempty",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "leavewhenempty",
      data: "no",
      flags: "0"
    },
    {
      keyword: "maxlen",
      data: "0",
      flags: "0"
    },
    //{keyword:"member",data:"Local/18886739960@from-queue/n,0",flags:"0"},
    {
      keyword: "memberdelay",
      data: "0",
      flags: "0"
    },
    {
      keyword: "min-announce-frequency",
      data: "15",
      flags: "0"
    },
    {
      keyword: "monitor-join",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "music",
      data: "none	",
      flags: "0"
    },
    {
      keyword: "penaltymemberslimit",
      data: "0",
      flags: "0"
    },
    {
      keyword: "periodic-announce-frequency",
      data: "0",
      flags: "0"
    },
    {
      keyword: "queue-callswaiting",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "queue-thankyou",
      data: "",
      flags: "0"
    },
    {
      keyword: "queue-thereare",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "queue-youarenext",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "recording",
      data: "force",
      flags: "0"
    },
    {
      keyword: "reportholdtime",
      data: "no",
      flags: "0"
    },
    {
      keyword: "retry",
      data: "0",
      flags: "0"
    },
    {
      keyword: "ringinuse",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "rvolume",
      data: "0",
      flags: "0"
    },
    {
      keyword: "servicelevel",
      data: "60",
      flags: "0"
    },
    {
      keyword: "setinterfacevar",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "skip_joinannounce",
      data: "",
      flags: "0"
    },
    {
      keyword: "strategy",
      data: "rrmemory",
      flags: "0"
    },
    {
      keyword: "timeout",
      data: "15",
      flags: "0"
    },
    {
      keyword: "timeoutpriority",
      data: "app",
      flags: "0"
    },
    {
      keyword: "timeoutrestart",
      data: "no",
      flags: "0"
    },
    {
      keyword: "weight",
      data: "0",
      flags: "0"
    },
    {
      keyword: "wrapuptime",
      data: "0",
      flags: "0"
    }
    ];
    buyer_numbers.forEach(bn => {
      queue_member.push({
        keyword: "member",
        data: "Local/" + bn.buyer_number + "@from-queue/n," + bn.priority,
        flags: "0"
      });
    });
    let values = "";
    queue_member.forEach((v, index) => {
      values +=
        "('" +
        queue_no +
        "','" +
        v.keyword +
        "','" +
        v.data +
        "','" +
        v.flags +
        "'),";
    });
    values = values.substr(0, values.length - 1);

    return new Promise((resolve, reject) => {
      /* $this->db->query("update `asterisk`.`incoming` set destination="+$dest+" where extension LIKE '%"+substr(tfn,-10)+"%' ");
            exec("asterisk -rvx 'core reload'"); */
      db.query(
        "INSERT INTO `asterisk`.`queues_config` set extension='" +
        queue_no +
        "',descr='" +
        queue_name +
        "',grppre='',alertinfo='',ringing='0',maxwait='',password='',ivr_id='none',dest='ext-queues," +
        queue_no +
        ",1',cwignore='0',queuewait='1',use_queue_context='0',togglehint='0',qnoanswer='0',callconfirm='0',callconfirm_id=NULL,qregex='',agentannounce_id=NULL,joinannounce_id=NULL,monitor_type='',monitor_heard='0',monitor_spoken='0',callback_id='none'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            let sql =
              "INSERT INTO `asterisk`.`queues_details` (id,keyword,data,flags) VALUES" +
              values;
            // console.log(sql);
            db.query(sql, (err, data7) => {
              if (err) {
                reject(err);
              } else {
                console.log("adding in the queues_details addding campaign");
                /* remote server code execution in node */
                serverCall();
                // return res.json({ success: 'OK' });
              }
            });
          }
        }
      );
    });
  }

  console.log(req.body);
  /* Adding the new Campaign */
  let campaign = new Campaign();
  campaign.pub_id = req.body.pub_id;
  campaign.camp_name = req.body.camp_name;
  campaign.buffer_time = req.body.buffer_time || 0;
  campaign.price_per_call = req.body.price_per_call || 0;
  campaign.time_zone = req.body.time_zone;
  campaign.read_only = req.body.read_only;
  campaign.created_at = Date.now();
  campaign.inside_route = req.body.inside_route || "";
  campaign
    .save()
    .then(data => {
      if (!data) {
        return res.sendStatus(422);
      }
      let queue_no = 0;
      let queue_name = "";

      if (req.body.inside_route != undefined && req.body.inside_route !== "") {
        queue_no = req.body.inside_route;
        queue_name = "Travel";
        let campbuyertfn = new CampBuyerTfn();
        campbuyertfn.camp_id = data.campaign_id;
        campbuyertfn.buyer_id = 1;
        campbuyertfn.buyers_no = queue_no;
        campbuyertfn.priority = 0;
        campbuyertfn.cccapping = 0;
        campbuyertfn.penalty = 0;
        campbuyertfn.created_at = Date.now();
        campbuyertfn
          .save()
          .then(data5 => {
            if (!data5) {
              return res.sendStatus(422);
            }
            console.log("add buyer camp record with inside route");
            /* remote server code execution in node */
            serverCall();
          })
          .catch(next);
      } else {
        queue_no = "10000" + data.campaign_id;
        queue_name =
          data.campaign_id +
          "_" +
          req.body.pub_id +
          "_" +
          data.camp_name.replace(" ", "");
        if (req.body.buyer_numbers) {
          // console.log(req.body.buyer_numbers);
          req.body.buyer_numbers.forEach((bn, index) => {
            let campbuyertfn = new CampBuyerTfn();
            campbuyertfn.camp_id = data.campaign_id;
            campbuyertfn.buyer_id = bn.buyer_id;
            campbuyertfn.buyers_no = bn.buyer_number;
            campbuyertfn.priority = bn.priority;
            campbuyertfn.cccapping = bn.cccapping;
            campbuyertfn.penalty = 0;
            campbuyertfn.created_at = Date.now();
            campbuyertfn.save().then(data5 => {
              if (!data5) {
                return res.sendStatus(422);
              }
              console.log("add the record in the camp buyer");
            })
              .catch(next);
          });
          addQueueDetails(req.body.buyer_numbers, queue_no, queue_name);
        }
      }

      /* TFN(s) */
      req.body.tfns.forEach((tfn, index) => {
        const query = {
          tfn: tfn,
          pub_id: req.body.pub_id
        };
        const options = {
          upsert: false,
          new: false
        };

        /* updating the tfn collection for specific publisher and adding data in camp_pub_tfn collection */
        Tfn.findOneAndUpdate(
          query, {
            pub_id: req.body.pub_id,
            status: "used"
          },
          options
        )
          .then(data2 => {

            if (data2) {
              let camp_pub_tfn = new CampPubTfn();
              camp_pub_tfn.camp_id = data.campaign_id;
              camp_pub_tfn.pub_id = data.pub_id;
              camp_pub_tfn.tfn = tfn;
              camp_pub_tfn.queue = queue_no;
              camp_pub_tfn.created_at = Date.now();
              camp_pub_tfn.save().then(data4 => {
                if (!data4) {
                  return res.sendStatus(422);
                }
              })
                .catch(next);
              /* updating the asterisk incoming table */
              updateIncoming(tfn, queue_no);
            }
          })
          .catch(next);
      });
      /* udpating the campaign */
      const options = {
        new: false,
        upsert: false
      };

      Campaign.findOneAndUpdate({
        campaign_id: data.campaign_id
      }, {
          queue_name: queue_name,
          queue_no: queue_no
        },
        options
      ).then(data6 => {
        if (!data6) {
          return res.sendStatus(422);
        }
        console.log("updating the campaign");
        return res.json({
          success: "OK"
        });
      })
        .catch(next);
    })
    .catch(next);
};

campaign.editCampaign = async (req, res, next) => {
  function oldTfns(tfn, pub_id) {
    const query = {
      tfn: tfn,
      pub_id: pub_id
    };
    Tfn.findOneAndUpdate(query, {
      status: "unused"
    }, options).then(data2 => {
      console.log("update1 tfn");
    })
      .catch(next);
    return new Promise((resolve, reject) => {
      db.query("UPDATE `asterisk`.`incoming` set destination='app-blackhole,hangup,1' WHERE extension LIKE '%" + tfn + "%'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  function updateIncoming(tfn, queue) {
    let dest = "";
    console.log(queue);
    if (isNaN(queue) && queue.indexOf(",") > -1) {
      dest = queue;
    } else {
      dest = "ext-queues," + queue + ",1";
    }
    return new Promise((resolve, reject) => {
      /* $this->db->query("update `asterisk`.`incoming` set destination="+$dest+" where extension LIKE '%"+substr(tfn,-10)+"%' ");
               exec("asterisk -rvx 'core reload'"); */

      db.query(
        "UPDATE `asterisk`.`incoming` set destination='" + dest + "' WHERE extension LIKE '%" + tfn + "%'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  function deleteBuyerNumber(buyers_no, queue_no) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM `asterisk`.`queues_config` WHERE `extension`='" + queue_no + "'; ",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            console.log("delete queue config");
            db.query(
              "DELETE FROM `asterisk`.`queues_details` WHERE `id`='" +
              queue_no +
              "'; ",
              (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  console.log("delete each number", buyers_no);
                  resolve(data);
                }
              }
            );
          }
        }
      );

    });
  }
  async function addQueueDetails(buyer_numbers, queue_no, queue_name) {
    await deleteBuyerNumber(buyer_numbers, queue_no);
    let queue_member = [{
      keyword: "announce-frequency",
      data: "0",
      flags: "0"
    },
    {
      keyword: "announce-holdtime",
      data: "no",
      flags: "0"
    },
    {
      keyword: "announce-position",
      data: "no",
      flags: "0"
    },
    {
      keyword: "answered_elsewhere",
      data: "0",
      flags: "0"
    },
    {
      keyword: "autofill",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "autopause",
      data: "no",
      flags: "0"
    },
    {
      keyword: "autopausebusy",
      data: "no",
      flags: "0"
    },
    {
      keyword: "autopausedelay",
      data: "0",
      flags: "0"
    },
    {
      keyword: "autopauseunavail",
      data: "no",
      flags: "0"
    },
    {
      keyword: "cron_random",
      data: "false",
      flags: "0"
    },
    {
      keyword: "cron_schedule",
      data: "never",
      flags: "0"
    },
    {
      keyword: "joinempty",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "leavewhenempty",
      data: "no",
      flags: "0"
    },
    {
      keyword: "maxlen",
      data: "0",
      flags: "0"
    },
    //{keyword:"member",data:"Local/18886739960@from-queue/n,0",flags:"0"},
    {
      keyword: "memberdelay",
      data: "0",
      flags: "0"
    },
    {
      keyword: "min-announce-frequency",
      data: "15",
      flags: "0"
    },
    {
      keyword: "monitor-join",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "music",
      data: "none	",
      flags: "0"
    },
    {
      keyword: "penaltymemberslimit",
      data: "0",
      flags: "0"
    },
    {
      keyword: "periodic-announce-frequency",
      data: "0",
      flags: "0"
    },
    {
      keyword: "queue-callswaiting",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "queue-thankyou",
      data: "",
      flags: "0"
    },
    {
      keyword: "queue-thereare",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "queue-youarenext",
      data: "silence/1",
      flags: "0"
    },
    {
      keyword: "recording",
      data: "force",
      flags: "0"
    },
    {
      keyword: "reportholdtime",
      data: "no",
      flags: "0"
    },
    {
      keyword: "retry",
      data: "0",
      flags: "0"
    },
    {
      keyword: "ringinuse",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "rvolume",
      data: "0",
      flags: "0"
    },
    {
      keyword: "servicelevel",
      data: "60",
      flags: "0"
    },
    {
      keyword: "setinterfacevar",
      data: "yes",
      flags: "0"
    },
    {
      keyword: "skip_joinannounce",
      data: "",
      flags: "0"
    },
    {
      keyword: "strategy",
      data: "rrmemory",
      flags: "0"
    },
    {
      keyword: "timeout",
      data: "15",
      flags: "0"
    },
    {
      keyword: "timeoutpriority",
      data: "app",
      flags: "0"
    },
    {
      keyword: "timeoutrestart",
      data: "no",
      flags: "0"
    },
    {
      keyword: "weight",
      data: "0",
      flags: "0"
    },
    {
      keyword: "wrapuptime",
      data: "0",
      flags: "0"
    }
    ];
    buyer_numbers.forEach(bn => {
      queue_member.push({
        keyword: "member",
        data: "Local/" + bn.buyer_number + "@from-queue/n," + bn.priority,
        flags: "0"
      });
    });
    let values = "";
    queue_member.forEach((v, index) => {
      values += "('" + queue_no + "','" + v.keyword + "','" + v.data + "','" + v.flags + "'),";
    });
    values = values.substr(0, values.length - 1);

    return new Promise((resolve, reject) => {
      /* $this->db->query("update `asterisk`.`incoming` set destination="+$dest+" where extension LIKE '%"+substr(tfn,-10)+"%' ");
            exec("asterisk -rvx 'core reload'"); */
      db.query(
        "INSERT INTO `asterisk`.`queues_config` set extension='" +
        queue_no +
        "',descr='" +
        queue_name +
        "',grppre='',alertinfo='',ringing='0',maxwait='',password='',ivr_id='none',dest='ext-queues," +
        queue_no +
        ",1',cwignore='0',queuewait='1',use_queue_context='0',togglehint='0',qnoanswer='0',callconfirm='0',callconfirm_id=NULL,qregex='',agentannounce_id=NULL,joinannounce_id=NULL,monitor_type='',monitor_heard='0',monitor_spoken='0',callback_id='none'",
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            let sql =
              "INSERT INTO `asterisk`.`queues_details` (id,keyword,data,flags) VALUES" +
              values;
            // console.log(sql);
            db.query(sql, (err, data7) => {
              if (err) {
                reject(err);
              } else {
                console.log("adding in the queues_details editing campaign");
                /* remote server code execution in node */
                serverCall();
                // return res.json({ success: 'OK' });
              }
            });
          }
        }
      );
    });
  }

  console.log(req.body);
  /* Adding the new Campaign */
  let campaign = {
    pub_id: req.body.pub_id,
    camp_name: req.body.camp_name,
    buffer_time: req.body.buffer_time || 0,
    price_per_call: req.body.price_per_call || 0,
    time_zone: req.body.time_zone,
    read_only: req.body.read_only,
    inside_route: req.body.inside_route || "",
  };

  /* udpating the campaign */
  const options = {
    new: false,
    upsert: false
  };

  Campaign.findOneAndUpdate({
    campaign_id: req.params.campaignId
  },
    campaign,
    options
  ).then(data => {
    if (!data) {
      return res.sendStatus(422);
    }

    console.log(data.campaign_id);
    let queue_no = 0;
    let queue_name = "";
    CampBuyerTfn.deleteMany({
      camp_id: data.campaign_id
    })
      .then(data2 => {
        if (data2.ok) {
          if (req.body.inside_route != undefined && req.body.inside_route !== "") {
            //queue_no = req.body.inside_route;
            queue_no = 0;
            queue_name = "Travel";
            let campbuyertfn = new CampBuyerTfn();
            campbuyertfn.camp_id = data.campaign_id;
            campbuyertfn.buyer_id = 1;
            campbuyertfn.buyers_no = queue_no;
            campbuyertfn.priority = 0;
            campbuyertfn.cccapping = 0;
            campbuyertfn.penalty = 0;
            campbuyertfn.created_at = Date.now();
            campbuyertfn
              .save()
              .then(data5 => {
                if (!data5) {
                  return res.sendStatus(422);
                }
                console.log("add buyer camp record with inside route");
                /* remote server code execution in node */
                serverCall();
                return res.json({ success: "OK" });
              })
              .catch(next);
          } else {
            queue_no = "10000" + data.campaign_id;
            queue_name =
              data.campaign_id +
              "_" +
              req.body.pub_id +
              "_" +
              data.camp_name.replace(" ", "");
            if (req.body.buyer_numbers) {

              req.body.buyer_numbers.forEach((bn, index) => {
                let campbuyertfn = new CampBuyerTfn();
                campbuyertfn.camp_id = data.campaign_id;
                campbuyertfn.buyer_id = bn.buyer_id;
                campbuyertfn.buyers_no = bn.buyer_number;
                campbuyertfn.priority = bn.priority;
                campbuyertfn.cccapping = bn.cccapping;
                campbuyertfn.penalty = 0;
                campbuyertfn.created_at = Date.now();
                console.log(campbuyertfn);
                campbuyertfn
                  .save()
                  .then(data5 => {
                    if (!data5) {
                      return res.sendStatus(422);
                    }

                    console.log("add the record in the camp buyer");
                  })
                  .catch(next);
              });
              addQueueDetails(
                req.body.buyer_numbers,
                queue_no,
                queue_name
              );
              return res.json({
                success: "OK"
              });
            }
          }
        }
      })
      .catch(next);

    /* TFN(s) */

    /* Remove from camp pub tfns collections */
    let camp_pubArr = [];
    req.body.camp_pub_tfns.forEach((tfn2, index) => {
      camp_pubArr = [...camp_pubArr, tfn2.tfn];
    });
    /* Remove old TFN from campagin that are not required */
    camp_pubArr.forEach((t) => {
      if (req.body.tfns.indexOf(t) === -1) {
        CampPubTfn.deleteMany({
          camp_id: data.campaign_id,
          tfn: t
        }).then(async data3 => {
          /* Remove from asterisk database table incoming */
          await oldTfns(t, req.body.pub_id);
        });
      }

    });

    // console.log(camp_pubArr, 'camp pub');
    req.body.tfns.forEach((tfn, index) => {
      if (camp_pubArr.indexOf(tfn) === -1) {
        CampPubTfn.deleteMany({
          camp_id: data.campaign_id,
          tfn: tfn
        }).then(async data3 => {
          /* Remove from asterisk database table incoming */
          await oldTfns(tfn, req.body.pub_id);
          const query = {
            tfn: tfn,
            pub_id: req.body.pub_id
          };
          const options = {
            upsert: false,
            new: false,
            overwrite: false
          };
          /* updating the tfn collection for specific publisher and adding data in camp_pub_tfn collection */
          Tfn.findOneAndUpdate(
            query, {
              pub_id: req.body.pub_id,
              status: "used"
            },
            options
          )
            .then(data2 => {
              if (data2) {
                if (queue_no === 0) {
                  queue_no = req.body.inside_route || 0;
                }
                /* make changes here */

                let camp_pub_tfn = new CampPubTfn();
                camp_pub_tfn.camp_id = data.campaign_id;
                camp_pub_tfn.pub_id = data.pub_id;
                camp_pub_tfn.tfn = tfn;
                camp_pub_tfn.queue = queue_no;
                camp_pub_tfn.created_at = Date.now();
                camp_pub_tfn
                  .save()
                  .then(data4 => {
                    if (!data4) {
                      return res.sendStatus(422);
                    }
                  })
                  .catch(next);
                /* updating the asterisk incoming table */
                console.log('status used');
                updateIncoming(tfn, queue_no);
              }
            })
            .catch(next);
        });




      }

    });




  }).catch(next);
};

module.exports = campaign;