var AWS = require("aws-sdk");
let awsConfig = {
    "region": "us-west-2",
    "endpoint": "http://dynamodb.us-west-2.amazonaws.com",
    "accessKeyId": "AKIA26TCCJMQ2S6CKTUL", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();
var temp ='';
let fetchOneByKey = function () {
    var params = {
        TableName: "GPS_DB",
        Key: {
            "Timestamp": "01"
        }
    };
    docClient.get(params, function (err, data) {
        if (err) {
            console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
        }
        else {
            temp = data;
            console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
        }
    })
}


fetchOneByKey();

const { createServer } = require('http');

const server = createServer((request,response) =>  {
    response.writeHead(200,{'Context-Type':'text/html'});
    response.write(JSON.stringify(temp, null, 2));
    return response.end();
});

server.listen(8080);