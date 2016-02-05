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
    getDocAndRunFunctionIfOwnerOrAdmin
} from './helpers/crud';

import { mustBeLoggedIn } from './helpers/permissions';

// guest can create user
router.post('/', createDoc('User'));

// guest can see all users
router.get('/', getDocsAndSend('User', ['name', 'followers', 'createdLevels', 'totalStars', 'profilePic'], [{path: 'createdLevels', select: 'title dateCreat starCount'}]));

// guest can see user
router.get('/:id', getDocAndSend('User'));

router.post('/:id/follow', mustBeLoggedIn, getDocAndRunFunctionIfOwnerOrAdmin('User', 'followUser'));

router.post('/:id/unfollow', mustBeLoggedIn, getDocAndRunFunctionIfOwnerOrAdmin('User', 'unfollowUser'));

// user can update own profile
router.put('/:id', mustBeLoggedIn, getDocAndUpdateIfOwnerOrAdmin('User'));

// user can delete own profile (optional to implement)
router.delete('/:id', mustBeLoggedIn, getDocAndDeleteIfOwnerOrAdmin('User'));
