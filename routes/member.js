const express = require('express');
const router = express.Router();
const pool = require('../app');
  
router.get('/', (req, res) => {
    pool.query('SELECT * FROM Member', (error, results) => {
      if (error) {
        console.error('Error fetching Member: ', error);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });

  router.post("/", function (req, res) {
    const { firstname, lastname, username, password, email, phonenumber, status } = req.body;
  
    const query = 'INSERT INTO Member (Mem_Id, Mem_Fname, Mem_Lname, Mem_Username, Mem_Password, Mem_Email, Mem_Phone, Mem_Status) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)';
    pool.query(query, [ firstname, lastname, username, password, email, phonenumber, status], function(error, results) {
      if (error) {
        res.status(500).send(error.toString());
      } else {
        res.status(201).send('Member added successfully.');
      }
    });
  });
  
  router.delete('/:id', function(req, res) {
    const { id } = req.params;  
  
    if (!id) {
        return res.status(400).send('ID is required for deletion.');
    }
  
    const query = 'DELETE FROM Member WHERE Mem_Id = ?';
    pool.query(query, [id], function(error, results) {
        if (error) {
            return res.status(500).send(error.toString());
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('No member found with the specified ID.');
        }
        res.send('Member deleted successfully.');
    });
  });
  
  router.put('/:id', function(req, res) {
    const { id } = req.params;  // Get the ID from the URL parameter
    const { firstname, lastname, username, password, email, phonenumber, status } = req.body;
  
    const query = 'UPDATE Member SET Mem_Fname = ?, Mem_Lname = ?, Mem_Username = ?, Mem_Password = ?, Mem_Email = ?, Mem_Phone = ?, Mem_Status = ? WHERE Mem_Id = ?';
    pool.query(query, [firstname, lastname, username, password, email, phonenumber, status, id], function(error, results) {
        if (error) {
            return res.status(500).send(error.toString());
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('No member found with the specified ID.');
        }
        res.send('Member updated successfully.');
    });
  });
module.exports = router;
