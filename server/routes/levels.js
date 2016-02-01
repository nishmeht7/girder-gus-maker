const router = require('express').Router();
//temp test!
var Level = require('mongoose').model('Level');

module.exports = router

import {
    createDoc,
    getDocAndSend,
    getDocsAndSend,
    getDocAndUpdateIfOwnerOrAdmin,
    getDocAndDeleteIfOwnerOrAdmin
} from './helpers/crud';

import { mustBeLoggedIn } from './helpers/permissions';

// user can create level
router.post('/', mustBeLoggedIn, createDoc('Level', 'creator'));

// guest can see all levels
router.get('/', getDocsAndSend('Level'));

// guest can search levels
// router.get('/', function(req, res, next) {
//     Level.find(req.query)
//         .select('title creator dateCreate starCount')
//         .populate('creator')
//         .then(documents => res.json(documents))
//         .then(null, next);
// })

// guest can see all levels with creators
router.get('/users', getDocsAndSend('Level', null, ['creator']));

// guest can see level
router.get('/:id', getDocAndSend('Level'));

// user can update own level
router.put('/:id', mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin('Level'));

// user can delete own level
router.delete('/:id', mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin('Level'));
