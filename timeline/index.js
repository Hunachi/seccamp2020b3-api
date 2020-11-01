const CosmosClient = require('@azure/cosmos').CosmosClient;
const client = new CosmosClient(process.env.seccamp2020b3_DOCUMENTDB);

module.exports = async function (context, req) {
    context.log(`x-ms-client-principal-name: ${req.headers['x-ms-client-principal-name']}`);

    const user_id = req.headers['x-ms-client-principal-name'];

    if (user_id == null && (req.body == null || req.body.id == null)) {
        context.res = {
            status: 400,
            body: `login or enter id`,
        };
        return;
    }

    if (req.body.previous_timestamp == null) {
        context.res = {
            status: 400,
            body: `previous timestamp is null`,
        };
        return;
    }

    const query = {
        query: "SELECT * FROM c WHERE c.user_id = @user_id AND c.timestamp >= @pre_time ORDER BY c.timestamp DESC",
        parameters: [
            {
                name: "@user_id",
                value: (req.body && req.body.id) ? req.body.id : user_id,
            },{
                name: "@pre_time",
                value: req.body.previous_timestamp
            }
        ]
    };
    const result = await client.database("handson").container("messages")
        .items.query(query).fetchAll();
    
    context.log(`Cosmos DB result: ${JSON.stringify(result)}`);

    const msgs = result.resources.map(e => ({user_id: e.user_id, timestamp: e.timestamp, text: e.text}));

    context.res = {
        status: 200,
        body: {msgs}
    };
}