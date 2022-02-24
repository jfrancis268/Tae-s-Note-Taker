const express = require('express');
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid'); 
const notes = require('./db/db');
const { parse } = require('path');


const PORT = process.env.PORT || 3001;

const app = express();


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//route to the /notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});


app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if(err) {
        console.log(err)
      }
      res.json(JSON.parse(data))
    })
});


//routes to post notes
app.post('/api/notes', (req, res) =>{
    //fs.readFile('/db/db.json', 'utf8').then((notes) => JSON.parse(notes))
    const { title , text } = req.body;
  if (title && text) {
    const newDb = {
      title, 
      text, 
      id: uuidv4(),
    };

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          // Convert string into JSON object
          const parsedDb = JSON.parse(data);
  
          // Add a new review
          parsedDb.push(newDb);
  
          // Write updated notes back to the file
          fs.writeFile(
            './db/db.json',
            JSON.stringify(parsedDb, null, 3),
            (writeErr) =>
              writeErr
                ? console.error(writeErr)
                : console.info('Successfully updated notes!')
          );
        }
    });

    const response = {
        status: 'success',
        body: newDb,
    };
      console.log(response);
      res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting note');
  }
})



//route to delete files 
app.delete('/api/notes/:id', (req,res) => {
  const noteId = req.params.id
  console.log(noteId)

  fs.readFile('./db/db.json', 'utf8', (err, notes) => {
      if(err) {
          console.log(err)
      } 
      notes = JSON.parse(notes)

      notes = notes.filter(note => note.id !== noteId);

      fs.writeFile(
        './db/db.json',
        JSON.stringify(notes, null, 3),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info('Successfully updated notes!')
      );
  
        res.json(notes)
  });
});


//route to all other pages - catch all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);