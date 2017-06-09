var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var machinelearning = new AWS.MachineLearning({apiVersion: '2014-12-12'});
var createBucket = require('./createBucket.js');
var s3 = new AWS.S3();
var bucketName = process.argv[2];
var uploadedFile = process.argv[3];
var dataSchema = process.argv[4];
var async = require('async');
// Bucket names must be unique across all S3 users

var dataParams = {
  DataSourceId: uploadedFile,
  DataSpec: {
      DataLocationS3: 's3://' + bucketName + '/' + uploadedFile,
      DataSchemaLocationS3: 's3://' + bucketName + '/' + uploadedFile + ".schema"
  },
  ComputeStatistics: true,
  DataSourceName: uploadedFile
};
var mlParams = {
    MLModelId: 'test-model', /* required */
    MLModelType: "BINARY", /* required */
    TrainingDataSourceId: uploadedFile, /* required */
    MLModelName: 'Test Model'
};
var waiterParams = {
    FilterVariable: "Name",
    EQ: uploadedFile
};
async.series([
    function(callback){
        createBucket(bucketName, uploadedFile, dataSchema, function(err, data) {
            console.log('Bucket Created.');
            callback(err);
            });
    },
    function(callback){
        machinelearning.createDataSourceFromS3(dataParams, function(err, data) {
            console.log('Data Source Created for ML');
            if (err) console.log(err, err.stack); // an error occurred
            callback(err);
        });
    }
], function (err, data) {
    if (err) console.log(err);
    else console.log(data);

});