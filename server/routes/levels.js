const router = require('express').Router();
//temp test!
var Level = require('mongoose').model('Level');

module.exports = router

import {
    createDoc,
    getDocAndSend,
    getDocsAndSend,
    getDocAndUpdateIfOwnerOrAdmin,
    getDocAndDeleteIfOwnerOrAdmin,
    getUserDocAndRunFunction
} from './helpers/crud';

import { mustBeLoggedIn } from './helpers/permissions';

// user can create level
router.post('/', mustBeLoggedIn, createDoc('Level', 'creator'));

// guest can see all levels
router.get('/', getDocsAndSend('Level', ['title', 'creator', 'dateCreated', 'starCount'], [{path: 'creator', select: 'name'}]));

// guest can see level
router.get('/:id', getDocAndSend('Level', ['-map'], [{path: 'creator', select: 'name totalStars totalFollowers totalCreatedLevels'}]));

// mapdata route
router.get('/:id/map', getDocAndSend('Level', ['map']));

// user can update own level
router.put('/:id', mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin('Level'));

// user can create own level
router.post('/', mustBeLoggedIn, createDoc('Level', 'creator'));

// user can like level
router.post('/like', mustBeLoggedIn, getUserDocAndRunFunction());

// user can delete own level
router.delete('/:id', mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin('Level'));
