'use strict';
var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
/* 
SMTP Username:
AKIAJDHAYXJJGC7XI53A
SMTP Password:
ArYo1hMVwYw3b4lzgVjmTwqBk+ExOUVXwckb34qeaBua
Server Name:	
email-smtp.us-east-1.amazonaws.com
Port:	25, 465 or 587
 */
let transporter = nodemailer.createTransport(
  {
      host: 'email-smtp.us-east-1.amazonaws.com',//'smtp.gmail.com',
      port: 25,
      secure: false,
      auth: {
        user: 'AKIAJDHAYXJJGC7XI53A',//'manish1986200821@gmail.com',
        pass: 'ArYo1hMVwYw3b4lzgVjmTwqBk+ExOUVXwckb34qeaBua',//'manish@123'
      },
      logger: true,
      debug: false // include SMTP traffic in the logs
  },
  /* {
      // default message fields

      // sender info
      from: 'Pangalink <no-reply@pangalink.net>',
      headers: {
          'X-Laziness-level': 1000 // just an example header, no need to use this
      }
  } */
);
transporter.use('compile',hbs({
	viewPath:'views/email/',
	extName:'.html'
}));

/* var mailOptions = {
  from: 'support@pbx4you.com',
  to:'geeks.sem81@gmail.com',
  subject: 'Sending Email using Node.js',
  template: 'email',
  context:{
	username:'manish',
	link:'http://alpha.pbx4you.com',
	email:'manish198646@pbx4you.com',
	password:'manish@123'
}
}; */

/**** Function to send mail using nodemailer smtp transport ****/
const sendMail = (mailObj) => {

    
    return new Promise((fulfill, reject) => {

        transporter.verify((err, success) => {
            console.log("in mail++++++++++++++++++++++",err, success)
            if (err) {
                //console.log(mailObj,'/////errmailObj')
                reject(mailObj)
            } else {              
                transporter.sendMail(mailObj, (err, info) => {
                    if (err) {
                        // console.log(err,'////err')
                        reject(mailObj)
                    } else {
                        // console.log(info,'////info')
                        fulfill(mailObj)
                    }
                });
            }
        });

    });
}


const sendEmail = (emailOption) => {   
    return new Promise((resolve, reject) => {
       // console.log(emailOption,'getting the data');
       transporter.sendMail(emailOption, (error, info)=>{
        if (error) {
         // console.log(error);
          reject (error);
        } else {
         // console.log('Email sent: ' + info.response);
          resolve(info);
        }
      });        
    }).catch(err => {
        console.log('This is err', err);
      //  reject(err);
    });
}

module.exports = { sendEmail };
