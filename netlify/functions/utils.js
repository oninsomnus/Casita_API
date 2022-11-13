// TODO; hacer funcionar este extra archivo
exports.db = () =>  {
    const statement = (client, body) => {
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
            return response({s: 500, b: {error, msg: "Error in insertion!"}});
        }
      }
      
      const query = async (client, statement) => {
        try {
          await client.query(sqlStatement);
          return response({b: {response: `${cocinar} activity created`}});
        } catch (e) {
          return response({s: 422, b: {response: "Error in query!"}});
        }
      }
      
      const response = (object) => { 
        object.b = (!object.b) ? constants.DEFAULT_BODY : object.b;
        object.h = (!object.h) ? constants.DEFAULT_HEADERS : object.h;
        object.s = (!object.s) ? constants.DEFAULT_STATUS_CODE : object.s;
        return {
          statusCode : object.s,
          headers    : object.h,
          body       : JSON.stringify(object.b)
        }
      }

    return {
        statement  : statement,
        query      : query,
        response   : response
    }
}
