const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'martinhilary',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */

app.get('/', (request, response) => {
  // query database for all pokemon

  // respond with HTML page displaying all pokemon
  //
  const queryString = 'SELECT * from pokemon'

  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
    } else {
      console.log('query result:', result);
      let context = {
        pokemon : result.rows
      }
      // redirect to home page
      response.render('Home',context);


    }
  });

});

app.get('/new', (request, response) => {
  // respond with HTML page with form to create new pokemon
  response.render('new');
});

app.get('/pokemon/:id',(request,response)=>{
  let pokeId=request.params.id;
  const queryString= 'SELECT * from pokemon where id= $1'
  const values=[pokeId];
  pool.query(queryString, values, (err,result)=>{

    if (err) {
     console.log('query error',err.stack)
    }
    else{
        console.log('query result:',result)
        let context={
          pokemon:result.rows[0]
        }
        response.render('Pokemon',context)


    }
  })
});
app.get('/pokemon/:id/edit',(request,response)=>{
  let pokeId=request.params.id;
  const queryString='SELECT * from pokemon where id=$1'
  const values=[pokeId];
  pool.query(queryString,values,(err,result)=>{
    if(err){
      console.log('query error', err.stack)
    }
    else{
      console.log('query result:',result)
      let context={
        pokemon:result.rows[0]
      }
      response.render('Edit',context)
    }
  })
})

app.delete('/pokemons/edit/:id',(request,response)=>{
  let content=request.body;
  const queryString='DELETE from pokemon WHERE id='+request.params.id;
  pool.query(queryString,(err,res)=>{
    if(err){
      console.log('query error',err.stack)
    }else{
      console.log('query result',res);
      response.redirect('/');
    }
  })

})

app.put('/pokemons/edit/:id',(request,response)=>{
  let content= request.body;
  const queryString = 'UPDATE pokemon SET num=$1,  name=$2, img=$3, height=$4, weight=$5 WHERE id =$6';
 const values = [content.num,content.name, content.img, content.height, content.weight, request.params.id];
  console.log('hi');
  pool.query(queryString,values,(err,res)=>{
      if(err){
        console.log('query error',err.stack)
      }else{
        console.log('query result:',res);
        response.redirect('/pokemon/'+request.params.id);
      }

  })
})
app.post('/pokemon', (request, response) => {
  let content = request.body;

  const queryString = 'INSERT INTO pokemon(num,name,img,height,weight) VALUES($1, $2,$3,$4,$5)'

  const values = [content.num, content.name,content.img,content.height,content.weight];

  pool.query(queryString, values, (err, res) => {
    if (err) {
      console.log('query error:', err.stack);
    } else {
      console.log('query result:', res);

      // redirect to home page
      response.redirect('/');
    }
  });
});


/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));
