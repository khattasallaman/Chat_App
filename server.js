// const { ApolloServer } = require('apollo-server-express')
// const express = require('express')
const { ApolloServer } = require('apollo-server')

require('dotenv').config()

const { sequelize } = require('./models')

// console.log("this is the current working directory ", __dirname)

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const contextMiddleware = require('./util/contextMiddleware')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
})

// const app = express()
// server.applyMiddleware({app})
// app.use(express.static("public"))

// app.listen({port:4000}, () => {
//   console.log(`🚀 Server ready at http://localhost:4000/`)
//   console.log(`🚀 Susbscription ready at ws://localhost:4000/graphql`)

//   sequelize
//     .authenticate()
//     .then(() => console.log('Database connected!!'))
//     .catch((err) => console.log(err))
// })




server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Susbscription ready at ${subscriptionsUrl}`)

  sequelize
    .authenticate()
    .then(() => console.log('Database connected!!'))
    .catch((err) => console.log(err))
})
