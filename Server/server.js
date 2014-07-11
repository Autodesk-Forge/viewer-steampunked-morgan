/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved 
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var morgan = require('morgan');
var api = require('./api');

var app = express();

app.use(morgan({ format: 'dev', immediate: true }));     
//app.use(express.bodyParser());

/////////////////////////////////////////////////////////////////////////////////
//  Webpages server
//
/////////////////////////////////////////////////////////////////////////////////
app.use('/steamed', express.static(__dirname + '/../SteamClient'));
//app.use('/steamed', express.static(__dirname + '/../Client'));

/////////////////////////////////////////////////////////////////////////////////
//  Rest API
//
/////////////////////////////////////////////////////////////////////////////////
app.get('/steamed/api/token', api.getToken);

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
app.listen(3000);//process.env.PORT || 3000);

console.log('Listening on port 3000...');
