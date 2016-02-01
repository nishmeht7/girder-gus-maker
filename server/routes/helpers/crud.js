/**
 * MIDDLEWARE-RETURNING FUNCTIONS:
 * createDoc(ModelStr, tieToUser = false // tieToUser = property to reference user)
 * getDocsAndSend(ModelStr, refPropName = false)
 * getDocAndSend(ModelStr) // requires req.params.id
 * getDocAndUpdate(ModelStr) // requires req.params.id
 * getDocAndDelete(ModelStr) // requires req.params.id
 *
 * getDocAndSendIfOwnerOrAdmin(ModelStr) // requires req.params.id
 * getDocAndUpdateIfOwnerOrAdmin(ModelStr) // requires req.params.id
 * getDocAndDeleteIfOwnerOrAdmin(ModelStr) // requires req.params.id
*/


const mongoose = require('mongoose')

/**
 * INTERNAL HELPERS
 */
const ownerOrAdmin = (doc, user) => {
  if (!user) return;
  return doc.user === user._id || user.isAdmin
}

const sendDocIfOwnerOrAdmin = (doc, user, res) => {
  if (ownerOrAdmin(doc, user)) res.json(doc);
  else res.status(401).end();
};

/**
 * EXPORTED FUNCTIONS
 */

export const createDoc = (ModelStr, tieToUser = false) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  if (tieToUser) req.body[tieToUser] = req.user._id;

  Model.create(req.body)
    .then(document => res.status(201).json(document))
    .then(null, next);
}

// returns middleware. No auth. Optionally also gets docs based on req.params.id
export const getDocsAndSend = (ModelStr, selectParams = [], populateParams = []) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  let query = {};
  let sort = {};
  
  if(ModelStr === 'Level') {
    // acceptable search parameters for levels
    if(req.query.title !== undefined) query.title =  { $regex: req.query.title, $options: 'i' };
    if(!isNaN(req.query.starCount)) query.starCount = { $gte: req.query.starCount };

    // acceptable sort parameters for levels
    if(req.query.sort === 'title' || req.query.sort === 'dateCreate' || req.query.sort === 'starCount') {
      if(req.query.by === 'asc' || req.query.by === 'desc' || req.query.by === 'ascending' || req.query.by === 'descending' || req.query.by === 1 || req.query.by === -1) {
        sort[req.query.sort] = req.query.by;
      } else {
        sort[req.query.sort] = 'desc';
      }
    }
  }

  if(ModelStr === 'User') {
    // acceptable search parameters for users
    if(req.query.name !== undefined) query.name = { $regex: req.query.name, $options: 'i' };
    if(req.query.email !== undefined) query.email = req.query.email;
    if(!isNaN(req.query.totalStars)) query.totalStars = { $gte: req.query.totalStars };


    // acceptable sort parameters for users
    if(req.query.sort === 'name' || req.query.sort === 'totalStars' || req.query.sort === 'totalFollowers' || req.query.sort === 'totalCreatedLevels') {
      if(req.query.by === 'asc' || req.query.by === 'desc' || req.query.by === 'ascending' || req.query.by === 'descending' || req.query.by === 1 || req.query.by === -1) {
        sort[req.query.sort] = req.query.by;
      } else {
        sort[req.query.sort] = 'desc';
      }
    }
  }

  // allow users to specify results per page and to step through
  //    pages of results
  let page = !isNaN(req.query.page) ? req.query.page-1 : 0;
  let limit = !isNaN(req.query.limit) ? req.query.limit : 0;

  Model.find(query)
    .skip(page*limit)
    .limit(limit)
    .sort(sort)
    .select(selectParams.join(" "))
    .populate(populateParams)
    .then(documents => res.json(documents))
    .then(null, next);
}

// returns middleware. No auth.
export const getDocAndSend = (ModelStr, populateParams=[]) => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id).populate(populateParams.join(" "))
    .then(document => res.status(200).json(document))
    .then(null, next);
}

// returns middleware. No auth.
export const getDocAndUpdate = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findByIdAndUpdate(id, req.body, {
      new: true
    })
    .then(document => res.status(200).json(document))
    .then(null, next);
}

// returns middleware. No auth.
export const getDocAndDelete = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findByIdAndRemove(id)
    .then(document => {
      if (!document) next()();
      else return res.json(document)
    })
    .then(null, next);
}

// returns middleware
export const getDocAndSendIfOwnerOrAdmin = (ModelStr, populateParams = []) => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id).populate(populateParams.join(" "))
    .then(document => {

      if (!document) next();
      else sendDocIfOwnerOrAdmin(document, req.user, res)
    })
    .then(null, next);
};

// returns middleware
export const getDocAndUpdateIfOwnerOrAdmin = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .then(document => {
      if (!document) next();
      if (ownerOrAdmin(document, req.user)) {
        return Model.findByIdAndUpdate(document, req.body, {
          new: true
        });
      } else res.status(401).end();
    })
    .then(document => res.status(200).json(document))
    .then(null, next)
};

export const getDocs = (ModelStr, refPropName = false) => (req, res, next) => {
  const Model = mongoose.model(ModelStr);
  let query = {};
  if (refPropName) {
    query[refPropName] = req.params.id
  }

  Model.find(query)
    .then(documents => res.json(documents))
    .then(null, next);
}

// returns middleware
export const getDocAndDeleteIfOwnerOrAdmin = ModelStr => (req, res, next) => {
  const id = req.params.id;
  const Model = mongoose.model(ModelStr);

  Model.findById(id)
    .then(document => {
      if (!document) next();
      if (ownerOrAdmin(document, req.user)) {
        return document.remove();
      } else res.status(401).end();
    })
    .then(document => res.json(document))
    .then(null, next)
};
