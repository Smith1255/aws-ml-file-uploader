var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS.config.update({region:'us-east-1'});
var colors = require('colors');
var async = require('async');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var globOptions = {dot:true};

var bucketName = "testAS1043";

var createBucket = function(bucketName, done) {
    async.series([
        function(callback){
            s3.createBucket({Bucket: bucketName}, function (err, data) {
                console.log("Creating bucket");
                if (err) console.log("Error:" + err);
                callback(err);
            });
        },
        function(callback){
            glob(path.join('*.json'), globOptions, function(err, matches) {


                fs.readFile(path.join(matches[0]), 'utf8', function (err, fileBuffer) {
                    console.log('Reading Policy File...'.bold);
                    if (err) return console.log("Error:" + err);

                    var params = {
                        Bucket: bucketName,
                        Policy: fileBuffer
                    };
                    s3.putBucketPolicy(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                        callback(err);
                    });
                });
            });
        },
        function(callback){
            glob(path.join('*.csv*'), globOptions, function(err, matches) {
                fs.readFile(matches[0], 'utf8', function (err, fileBuffer) {
                    console.log('Reading CSV File...'.bold);
                    if (err) return console.log("Error:" + err);

                    params = {Bucket: bucketName, Key: matches[0], Body: fileBuffer};
                    s3.putObject(params, function (err, data) {
                        if (err) {
                            console.log("Error:" + err)
                        } else {
                            console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + matches[0].bold);
                        }
                    });
                });
                fs.readFile(matches[1], 'utf8', function (err, fileBuffer) {
                    console.log('Reading Schema File...'.bold);
                    if (err) return console.log("Error:" + err);

                    params = {Bucket: bucketName, Key: matches[1], Body: fileBuffer};
                    s3.putObject(params, function (err, data) {
                        if (err) {
                            console.log("Error:" + err)
                        } else {
                            console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + matches[1].bold);
                        }
                    });
                });
                callback(err);
            });
        }
    ], function (err, data) {
        if (err) console.log(err);
        else console.log(data);
        done();
    });

};

module.exports = createBucket;

createBucket(bucketName, function() {
    console.log("Done")
});