var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS.config.update({region:'us-east-1'});
var colors = require('colors');

fs = require('fs');

var createBucket = function(bucketName, fileToUpload, dataSchema) {
    s3.createBucket({Bucket: bucketName}, function(err, data) {
        console.log("Creating Bucket...".bold);
        if (err) {
            console.log(err);
        }
    });

    fs.readFile(fileToUpload, 'utf8', function (err, fileBuffer) {
        console.log('Reading File...'.bold);
        if (err) {
            return console.log(err);
        }

        params = {Bucket: bucketName, Key: fileToUpload, Body:fileBuffer};
        s3.putObject(params, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + fileToUpload.bold);
            }
        });

    });
    fs.readFile(dataSchema, 'utf8', function (err, fileBuffer) {
        console.log('Reading Second File...'.bold);
        if (err) {
            return console.log(err);
        }
        params = {Bucket: bucketName, Key: dataSchema, Body:fileBuffer};
        s3.putObject(params, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully uploaded data to ".green + bucketName.bold + "/".bold + dataSchema.bold);
            }
        });

    });

};
module.exports = createBucket;