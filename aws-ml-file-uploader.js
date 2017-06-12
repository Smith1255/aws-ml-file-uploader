/**
 * This script takes a CSV file and its data schema and uploads it to the Amazon AWS S3 database.
 * From there it creates an AWS Machine Learning datasource and model from the CSV data.
 * In the future, ability to query the model for predicitons will be added.
 *
 * NOTE: To successfully use this script, you must include a valid CSV file, a valid schema
 * (valid as in the same format that Amazon uses), and a policy.json that permits Amazon to
 * read from the S3 buckets. These  files MUST be in a directory titled requiredFiles, also in the working
 * directory of the program.
 * The policy included in the requiredDocuments folder can be modified by changing the Bucket name and the CSV file name.
 *
 * @summary   Takes a CSV file and its data schema, uploads it to the Amazon AWS S3 database, and creates an AWS ML model.
 * @author Andrew Smith
 * 6-12-2017
 *
 */
var AWS = require('aws-sdk');
var machinelearning = new AWS.MachineLearning({apiVersion: '2014-12-12'});
var s3 = new AWS.S3();
AWS.config.update({region:'us-east-1'});

var async = require('async');
var glob = require('glob');
var globOptions = {dot:true};
var path = require('path');

var createBucket = require('./createBucket.js');
// Bucket names must be unique across all S3 users
var bucketName = "testAS1043";
var dataParams;
var mlParams;
var csv;
var schema;

/**
 * @summary This function creates the parameters needed for each of the Amazon functions that communicate between AWS
 * and the local machine.
 *
 *
 * @return no return.
 */

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
    function(callback) { //Creates Parameters
        createParameters(function() {
            console.log("Parameters for bucket created.")
            callback(err);
        });
    },
    function(callback){ //Creates Bucket
        createBucket(bucketName, function(err) {
            console.log("Created Bucket");
            callback(err);
        });
    },
    function(callback){ //Creates Data Source for model
        machinelearning.createDataSourceFromS3(dataParams, function(err, data) {
            if (err) console.log("ERR" + err, err.stack); // an error occurred
            console.log('Data Source Created for ML');
            callback(err);
        });
    },
    function(callback){ //Creates Machine Learning Model
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