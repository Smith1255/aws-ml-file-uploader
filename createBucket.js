/**
 * This script takes a CSV file and its data schema and uploads it to the Amazon AWS S3 database.
 * These resources are to be used to create an AWS machine learning model, using aws-ml-file-uploader.js
 *
 * NOTE: To successfully use this script, you must include a valid CSV file, a valid schema
 * (valid as in the same format that Amazon uses), and a policy.json that permits Amazon to
 * read from the S3 buckets. These  files MUST be in a directory titled requiredFiles, also in the working
 * directory of the program.
 * The policy included in the requiredDocuments folder can be modified by changing the Bucket name and the CSV file name.
 *
 * @summary   Takes a CSV file and its data schema, uploads it to the Amazon AWS S3 database.
 * @author Andrew Smith
 * 6-12-2017
 *
 */

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS.config.update({region:'us-east-1'});

var colors = require('colors');
var async = require('async');
var path = require('path');
var glob = require('glob');
var globOptions = {dot:true};
var fs = require('fs');

/**
 * @summary This function both creates the bucket needed to store the files, and populates it with the required data.
 *
 * @param String $bucketName User provided name for the bucket.
 * @param function $done Callback for the function.
 * @return no return.
 */

var createBucket = function(bucketName, done) {
    async.series([
        function(callback){ //Creates the bucket, and populates it with the a policy file.
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
        function(callback){ //Finds the required CSV file and uploads it
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