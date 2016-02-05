const router = require('express').Router();

const User = require('mongoose').model('User');
module.exports = router

import {
    createDoc,
    getDocAndSend,
    getDocsAndSend,
    getDocAndUpdateIfOwnerOrAdmin,
    getDocAndDeleteIfOwnerOrAdmin,
    getDocAndRunFunction,
    getDocAndRunFunctionIfOwnerOrAdmin,
    getUserDocAndRunFunction
} from './helpers/crud';

import { mustBeLoggedIn } from './helpers/permissions';

// guest can create user
router.post('/', createDoc('User'));

// guest can see all users
router.get('/', getDocsAndSend('User', ['name', 'followers', 'createdLevels', 'totalStars', 'profilePic'], [{path: 'createdLevels', select: 'title dateCreated starCount'}]));

// guest can see user
router.get('/:id', getDocAndSend('User'));

// user can follow other users
router.post('/follow', mustBeLoggedIn, getUserDocAndRunFunction());

// user can update own profile
router.put('/:id', mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin('User'));

// user can delete own profile (optional to implement)
router.delete('/:id', mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin('User'));
