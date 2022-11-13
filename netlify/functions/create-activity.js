const { Pool } = require("pg");
const format = require("pg-format");
const { v4 } = require("uuid");
const constants = require('./constants')
const connectionString = "postgresql://adminjd:" + process.env.PASSWORD + "@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/casita?sslmode=verify-full&options=--cluster%3Dopal-possum-6624";

const genResponse = (object) => { 
  object.b = (!object.b) ? constants.DEFAULT_BODY : object.b;
  object.h = (!object.h) ? constants.DEFAULT_HEADERS : object.h;
  object.s = (!object.s) ? constants.DEFAULT_STATUS_CODE : object.s;
  return {
    statusCode : object.s,
    headers    : object.h,
    body       : JSON.stringify(object.b)
  }
}

const genStatement = (body) => {
  try {
    const { cocinar, platos, name } = body;
    const uuid = v4();
    return format(
      'INSERT INTO actividades(id, name, platos, cocinar, date_created) VALUES(%L, %L, %L, %L, %L)',
      uuid,
      name,
      platos,
      cocinar,
      new Date()
    );
  }catch(error){
      client.release();
      return genResponse({s: 500, b: {error, response: "An internal error ocurred!"}});
  }
}

const genQuery = async (statement) => {
  try {
    await client.query(statement);
    return genResponse({b: {response: `Activity was created!`}});
  } catch (error) {
    return genResponse({s: 422, b: {error, response: "Error inserting activity!"}});
  }
}

const client = new Pool({ connectionString });

exports.handler = async (event, context, callback) => {
  if(event.httpMethod == 'OPTIONS') return genResponse({b: {msg: "Preflight call!"}});

  let body = constants.BASE_64_REGEX.test(event.body) 
    ? JSON.parse(atob(event.body))
    : JSON.parse(event.body);

  let statement = genStatement(body);

  return await genQuery(statement);
};