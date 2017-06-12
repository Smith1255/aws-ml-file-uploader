var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var machinelearning = new AWS.MachineLearning({apiVersion: '2014-12-12'});
var createBucket = require('./createBucket.js');
var s3 = new AWS.S3();
var bucketName = process.argv[2];
var uploadedFile = process.argv[3];
var dataSchema = process.argv[4];
var async = require('async');
var glob = require('glob');
var path = require('path');
var globOptions = {dot:true};
// Bucket names must be unique across all S3 users
var bucketName = "testAS1043";
var dataParams;
var mlParams;
var csv;
var schema;


function createParameters(done) {
    glob(path.join('requiredFiles/*.csv*'), globOptions, function(err, matches) {
        csv = matches[0].substring(14);
        schema = matches[1].substring(14);
        dataParams = {
            DataSourceId: csv,
            DataSpec: {
                DataLocationS3: 's3://' + bucketName + '/' + csv,
                DataSchemaLocationS3: 's3://' + bucketName + '/' + csv + ".schema"
            },
            ComputeStatistics: true,
            DataSourceName: csv
        };
        mlParams = {
            MLModelId: csv + "-model", /* required */
            MLModelType: "BINARY", /* required */
            TrainingDataSourceId: csv, /* required */
            MLModelName: csv + "-model"
        };
        done();
    });
}
async.series([
    function(callback) {
        createParameters(function() {
            console.log("Parameters for bucket created.")
            callback();
        });
    },
    function(callback){
        createBucket(bucketName, function(err) {
            console.log("Created Bucket");
            callback();
        });
    },
    function(callback){
        machinelearning.createDataSourceFromS3(dataParams, function(err, data) {
            if (err) console.log("ERR" + err, err.stack); // an error occurred
            console.log('Data Source Created for ML');
            callback();
        });
    },
    function(callback){
        machinelearning.createMLModel(mlParams, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
            console.log("Model Created");
            callback(err);
        });
    }
], function (err, data) {
    if (err) console.log(err);
    else console.log(data);

});