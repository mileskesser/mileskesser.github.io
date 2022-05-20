// App.js


//  SETUP

var express = require('express');   // Use express library for the web server
var app     = express();            
PORT        = 9637;                 // Set port number 

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

// Database
var db = require('./database/db-connector')

// app.js - SETUP section
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'));         
    

app.get('/', function(req, res){ 
    let query1;
    if (req.query.name === undefined){
        query1 = "SELECT * FROM Donors;";
    }
    else {
        query1 = `SELECT * FROM Donors WHERE name LIKE "${req.query.name}%"`
    }
    db.pool.query(query1, function(error, rows, fields){
        res.render('donors', {data: rows});
    })
});


app.post('/add-donor-form', function(req, res){
    
    let data = req.body;
    // Capture NULL values
    let donated = parseInt(data['input-donated']);
    if (isNaN(donated)){
        donated = '0'
    }
    let email = parseInt(data['input-email']);
    if (isNaN(email)){
        email = 'NULL'
    }
    query1 = `INSERT INTO Donors (name, email, total_donated) VALUES ('${data['input-name']}', '${data['input-email']}', ${donated})`;
    db.pool.query(query1, function(error, rows, fields){
        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else {
            res.redirect('/');
        }
    })
});


app.delete('/delete-donor-ajax/', function(req,res,next){                                                                
    let data = req.body;
    let personID = parseInt(data.donor_id);
    let deleteDonor = `DELETE FROM Donors WHERE donor_id = '${personID}'`;
        db.pool.query(deleteDonor, [personID], function(error, rows, fields) {
            if (error) {
                console.log(error);
                res.sendStatus(400);
            } else {
                res.sendStatus(204);
            }
        })
  });


  app.put('/put-person-ajax', function(req,res,next){
    let data = req.body;
  
    let homeworld = parseInt(data.homeworld);
    let person = parseInt(data.fullname);
  
    let queryUpdateWorld = `UPDATE Donors SET email = ? WHERE Donors.donor_id = ?`;
    let selectWorld = `SELECT * FROM Donors WHERE donor_id = ?`
  
          // Run the 1st query
          db.pool.query(queryUpdateWorld, [homeworld, person], function(error, rows, fields){
              if (error) {
  
              // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
              console.log(error);
              res.sendStatus(400);
              }
  
              // If there was no error, we run our second query and return that data so we can use it to update the people's
              // table on the front-end
              else
              {
                  // Run the second query
                  db.pool.query(selectWorld, [homeworld], function(error, rows, fields) {
  
                      if (error) {
                          console.log(error);
                          res.sendStatus(400);
                      } else {
                          res.send(rows);
                      }
                  })
              }
  })});

 //   LISTENER

app.listen(PORT, function(){            
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});



