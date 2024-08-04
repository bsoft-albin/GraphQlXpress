const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
//const mysql = require('mysql');

const { Pool } = require('pg');

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'erp',
  password: 'albin',
  port: 5432,
});


const getBioData = async () =>{
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM biodata');
      return rows;
    } finally {
      client.release();
    }
  }

const getBiodataById = async ({ id }) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM biodata WHERE id = $1', [parseInt(id)]);
    return rows[0];
  } finally {
    client.release();
  }
}
//RETURNING * ==> returns the affected rows

const createBioData = async ({ name, age, place, contact }) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('INSERT INTO biodata (name, age, place, contact) VALUES ($1, $2, $3, $4) RETURNING *', [name, age, place, contact]);
    return rows[0];
  } finally {
    client.release();
  }
}

const updateBioData = async ({ id, name, age, place, contact }) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('UPDATE biodata SET name = COALESCE($2, name), age = $3, place = $4, contact = $5 WHERE id = $1 RETURNING *', [id, name, age, place, contact]);
    return "Updated Succesfully!!";
  } finally {
    client.release();
  }
}

const deleteBioData = async ({ id }) => {
  const client = await pool.connect();
  try {
    const str = ''
    await client.query('DELETE FROM biodata WHERE id = $1', [id]);
    return 'BioData deleted successfully';
  } finally {
    client.release();
  }
}

const schema = buildSchema(`
  type BioData {
    id : Int
    name : String
    age : Int
    place : String
    contact : String
  }

  type Query {
    getListOfBioData: [BioData]
    getSingleBioData(id: Int!): BioData
  }

  type Mutation {
    postBioData(name: String!, age: Int!, place: String!, contact: String!): BioData
    putBiodata(id: Int!, name: String, age: Int, place: String, contact: String): String
    deleteBioData(id: Int!): String
  }

`);

// this is the { key } that must need to be matched in the Query,Mutation object!!!!

const root = {
  getListOfBioData : getBioData,
  getSingleBioData : getBiodataById,
  postBioData : createBioData,
  putBiodata : updateBioData,
  deleteBioData : deleteBioData,
};

const app = express();

// Setup GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true // Enable GraphiQL interface
}));

// Start the server
app.listen(4000, () => {
  console.log('Express GraphQL server running at http://localhost:4000/graphql');
});
