'use strict';

var express = require('express');
var router = express.Router();
var models = require('./models');
var Sequelize = require('sequelize');

router.get('/', function(req, res, next) {
  var options = {
    entry: [['createdAt', 'DESC']]
  };
  Sequelize.Promise.all([
    models.Entry.findAll(options),
    models.Spreadsheet.findAll(options)
  ]).then(function(results) {
    res.render('index', {
      entries: results[0],
      spreadsheets: results[1]
    });
  }, function(err) {
    next(err);
  });
});

router.get('/create', function(req, res, next) {
  res.render('upsert');
});

router.get('/edit/:id', function(req, res, next) {
  models.Entry.findById(req.params.id).then(function(entry) {
    if (entry) {
      res.render('upsert', {
        entry: entry
      });
    } else {
      next(new Error('Entry not found: ' + req.params.id));
    }
  });
});

router.get('/delete/:id', function(req, res, next) {
  models.Entry.findById(req.params.id)
    .then(function(entry) {
      if (!entry) {
        throw new Error('Entry not found: ' + req.params.id);
      }
      return entry.destroy();
    })
    .then(function() {
      res.redirect('/');
    }, function(err) {
      next(err);
    });
});

router.post('/upsert', function(req, res, next) {
  models.Entry.upsert(req.body).then(function() {
    res.redirect('/');
  }, function(err) {
    next(err);
  });
});

// Route for creating spreadsheet.

var SheetsHelper = require('./sheets');

router.post('/spreadsheets', function(req, res, next) {
  var auth = req.get('Authorization');
  if (!auth) {
    return next(Error('Authorization required.'));
  }
  var accessToken = auth.split(' ')[1];
  var helper = new SheetsHelper(accessToken);
  var title = 'Entries (' + new Date().toLocaleTimeString() + ')';
  helper.createSpreadsheet(title, function(err, spreadsheet) {
    if (err) {
      return next(err);
    }
    var model = {
      id: spreadsheet.spreadsheetId,
      sheetId: spreadsheet.sheets[0].properties.sheetId,
      name: spreadsheet.properties.title
    };
    models.Spreadsheet.create(model).then(function() {
      return res.json(model);
    });
  });
});

// Route for syncing spreadsheet.

router.post('/spreadsheets/:id/sync', function(req, res, next) {
  var auth = req.get('Authorization');
  if (!auth) {
    return next(Error('Authorization required.'));
  }
  var accessToken = auth.split(' ')[1];
  var helper = new SheetsHelper(accessToken);
  Sequelize.Promise.all([
    models.Spreadsheet.findById(req.params.id),
    models.Entry.findAll()
  ]).then(function(results) {
    var spreadsheet = results[0];
    var entries = results[1];
    helper.sync(spreadsheet.id, spreadsheet.sheetId, entries, function(err) {
      if (err) {
        return next(err);
      }
      return res.json(entries.length);
    });
  });
});

module.exports = router;
