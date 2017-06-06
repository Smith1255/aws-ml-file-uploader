var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var machinelearning = new AWS.MachineLearning();
var createBucket = require('./createBucket.js');
var s3 = new AWS.S3();
var bucketName = process.argv[2];
var uploadedFile = process.argv[3];
var dataSchema = process.argv[4];
// Bucket names must be unique across all S3 users

var mlParams = {
  DataSourceId: uploadedFile,
  DataSpec: {
      DataLocationS3: 's3://' + bucketName + '/' + uploadedFile,
      DataSchemaLocationS3: uploadedFile + ".schema"
  },
  ComputeStatistics: true || false,
  DataSourceName: uploadedFile
};

createBucket(bucketName, uploadedFile);


machinelearning.createDataSourceFromS3(mlParams, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});
