const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const CredentialSchema = require('../models/schema')
const credentialsFunc = require('../functions/credentials')
const pool = require('../functions/pool')
const DidKeyPair = require('../models/didKeyPair')


router.post('/createSchema', auth, async(req, res) => {


    let did = await DidKeyPair.findOne({owner: req.user._id, public: true})

    const schemaInfo = await credentialsFunc.createSchema(did.did, req.body.name, req.body.creds.split())

    const schema = new CredentialSchema({
        ver: schemaInfo.schema.ver,
        id: schemaInfo.schemaId,
        name: schemaInfo.schema.name,
        version: schemaInfo.schema.version,
        attrNames: schemaInfo.schema.attrNames,
        seqNo: schemaInfo.schema.seqNo,
        owner: req.user._id
    })

    let msg = await credentialsFunc.sendSchema(pool.poolHandle, req.user.userWalletHandle, )

    try {
        await schema.save()
        res.send({schema, msg})
    } catch (e) {
        res.send(e)        
    }
})

router.get('/getSchema', async(req, res) => {

    let did = await DidKeyPair.findOne({owner: req.user._id, public: true})
    let schema = await CredentialSchema.findOne({name:req.body.name})
    let schemaInfo = await credentialsFunc.getSchema(pool.poolHandle, did.did, schema.id)

    try {
        res.send({schemaInfo})
    } catch (e) {
        res.send(e)
    }
})