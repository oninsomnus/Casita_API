const { Pool, Client } = require("pg");
const format = require("pg-format");
const { v4 } = require("uuid");
const connectionString = "postgresql://" + process.env.USERNAME + ":" + process.env.PASSWORD + "@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/casita?sslmode=verify-full&options=--cluster%3Dopal-possum-6624";
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;


//const client = new Client(process.env.DATABASE_URL)

const client = new Pool({
  connectionString
});

exports.handler = async(event, context, callback) => {

  console.log(event);

    switch (event.httpMethod) {
      case 'OPTIONS':
        const headers = {
        'Access-Control-Allow-Origin': 'https://platform.appgyver.com/',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      };
      return {
        statusCode: 200,
        headers,
        body: 'This was a preflight call!'
      };

      case 'POST':
        let body = base64regex.test(event.body) ? JSON.parse(atob(event.body)) : JSON.parse(event.body);
        
        const { cocinar, platos, name } = body;

        try {
            const uuid = v4();
            const sqlStatement = format(
                'INSERT INTO actividades(id, name, platos, cocinar, date_created) VALUES(%L, %L, %L, %L, %L)',
                uuid,
                name,
                platos,
                cocinar,
                new Date()
            );


            try {
                await client.query(sqlStatement);
                //await client.end();

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        response: `${cocinar} activity created`
                    }),
                    headers: {
                      "access-control-allow-origin": "*"
                    }
                };
            } catch (e) {
                return {
                    statusCode: 422,
                    body: JSON.stringify({
                        response: sqlStatement + " " + e + " Error inserting activity"
                    }),
                    headers: {
                      "access-control-allow-origin": "*"
                    }
                };
            }
        } catch (error) {
            client.release();
            //client.end();

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error,
                    message: "An internal error occurred. Try again later",
                }),
                headers: {
                  "access-control-allow-origin": "*"
                }
            };
        }
    }
};