var AWS = require("aws-sdk");
let awsConfig = {
    "region": "us-west-2",
    "endpoint": "http://dynamodb.us-west-2.amazonaws.com",
    "accessKeyId": "AKIA26TCCJMQ2S6CKTUL", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var dynamodb = new AWS.DynamoDB();
const performAsynScanOperation = (scanParams) => {
    return new Promise((resolve, reject) => {
        dynamodb.scan(scanParams, function (err, responseData) {
            if (err) {
                reject(err)
            } else {
                resolve(responseData)
            }
        })
    })
}

const getAllRecords = async (tableName) => {
    let allItems = [];
    let LastEvaluatedKeyFlag = true;
    let scanParams = { TableName: tableName }
    while (LastEvaluatedKeyFlag) {
        let responseData = await performAsynScanOperation(scanParams)
        let batchItems = responseData.Items;
        allItems = allItems.concat(batchItems);
        if (responseData.LastEvaluatedKey) {
            LastEvaluatedKeyFlag = true;
            console.log('LastEvaluatedKey', responseData.LastEvaluatedKey)
            scanParams.ExclusiveStartKey = responseData.LastEvaluatedKey
        } else {
            LastEvaluatedKeyFlag = false;
        }
    }
    return allItems;
}


const { createServer } = require('http');
const { allowedNodeEnvironmentFlags } = require("process");

const server = createServer((request,response) =>  {

    if(request.url == '/'){
        response.write('Hello World');
        response.end();
    }

    if(request.url == '/api/getCoordinates'){
        getAllRecords('GPS_DB').then((allItems) => {
            response.write(JSON.stringify(allItems, null, 2));
            response.end();
        });
    }
    //return response.end();
});

server.listen(8080);