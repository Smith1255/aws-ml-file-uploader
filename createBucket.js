var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS.config.update({region:'us-east-1'});
var colors = require('colors');
var async = require('async');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var globOptions = {dot:true};

var createBucket = function(bucketName, done) {
    async.series([
        function(callback){
            s3.createBucket({Bucket: bucketName}, function (err, data) {
                console.log("Creating bucket");
                if (err) console.log("Error:" + err);
                glob(path.join('requiredFiles/*.JSON*'), globOptions, function(err, matches) {
                    var params;
                    fs.readFile(matches[0],'utf8', function(err, fileBuffer) {
                        params = {
                            Bucket: bucketName, /* required */
                            Policy: fileBuffer /* required */
                        };
                        s3.putBucketPolicy(params, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else     console.log(data);           // successful response
                            callback(err);
                        });
                    });
                });
            });
        },
        function(callback){
            glob(path.join('requiredFiles/*.csv*'), globOptions, function(err, matches) {
                var filePath = matches[0];
                var csvFile = filePath.substring(14);
                fs.readFile(filePath, 'utf8', function (err, fileBuffer) {
                    console.log('Reading CSV File...'.bold);
                    if (err) return console.log("Error:" + err);

                    params = {Bucket: bucketName, Key: csvFile, Body: fileBuffer};
                    s3.putObject(params, function (err, data) {
                        if (err) {
                            console.log("Error:" + err)
                        } else {
                            console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + csvFile.bold);
                        }
                        callback(err);
                    });
                });
            });
        },
        function(callback){
            glob(path.join('requiredFiles/*.csv*'), globOptions, function(err, matches) {
                var filePath = matches[1];
                var dataSchema = filePath.substring(14);
                fs.readFile(filePath, 'utf8', function (err, fileBuffer) {
                    console.log('Reading Schema File...'.bold);
                    if (err) return console.log("Error:" + err);

                    params = {Bucket: bucketName, Key: dataSchema, Body: fileBuffer};
                    s3.putObject(params, function (err, data) {
                        if (err) {
                            console.log("Error:" + err)
                        } else {
                            console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + dataSchema.bold);
                        }
                        callback(err);
                    });
                });
            });
        }
    ], function (err, data) {
        if (err) console.log(err);
        else console.log(data);
        done();
    });
};

module.exports = createBucket;