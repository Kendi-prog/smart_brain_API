const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: '123',
      database: 'smart_brain',
    },
  });

  
const app = express();

app.use(bodyParser.json());

app.use(cors());


app.get('/', (req, res) => {
    res.send('Success');
})

app.post('/signin', (req, res) => {
    const { email, password } = req.body
    knex.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if(isValid){
                return knex.select('*').from('users')
                 .where('email', '=', email)
                 .then(user => {
                    res.json(user[0])
                 })
            } else{
                res.status(400).json('Unable to get user')
            }    
        })
        .catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
    const { name, email, password} = req.body;
    var hash = bcrypt.hashSync(password);
    knex.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            })  
            .then(user => {
                res.json(user);
            })
    })
    .then(trx.commit)
    .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register'))
    
    
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    knex.select('*').from('users').where({id})
    .then(user => {
        if(user.length){
           res.json(user[0]) 
        } else {
           res.status(400).json('not found')
        }   
    })
    .catch(err => res.status(400).json('error getting user'))
    
    //if(!found){
       //     req.status(404).json('not found');
//}
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    knex('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]).entries;
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3000, ()=> {
    console.log('App is running on port 3000');
})   

/*
/--> res - this is working
/signin --> POST - sucess/fail
/register --> POST - user
/profile/userId --> GET = user
/image --> PUT --> user
*/

//app.post('/signin', (req, res) => {

//})