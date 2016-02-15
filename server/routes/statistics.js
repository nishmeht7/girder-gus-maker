const router = require( 'express' ).Router();

module.exports = router;

import { createDoc } from './helpers/crud';
import { mustBeLoggedIn } from './helpers/permissions';

router.post( '/', mustBeLoggedIn, createDoc( 'Statistic', 'player' ) );
