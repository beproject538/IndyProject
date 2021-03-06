const express = require('express')
const router = new express.Router()
const bodyParser = require('body-parser')
const userFuncs = require('../functions/user')
const User = require('../models/user')
const timestamp = require('timestamp')
const auth = require('../middleware/auth')
const urlencodedParser = bodyParser.json()
const ConnectionOffer = require('../models/connectionOffer')
const DidKeyPair = require('../models/didKeyPair')
const ConnectionRequest = require('../models/connectionRequest')
const ConnectionResponse = require('../models/connectionResponse')

router.post('/sendConnectionOffer', auth,async(req, res) => {


    

    const did = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const Offer = await userFuncs.connectionOffer(did.did, req.body.recipientDid)
    console.log('.......REQ>USER', req.user)
    console.log('OFFER--------------------', Offer)

    const connectionOffer = await ConnectionOffer.findOne({did:did.did, recipientDid: req.body.recipientDid, owner: req.user._id})
    if(connectionOffer){
        return res.send({error: 'Connection Offer Already Sent.'})
    }

    try {
        const connectionOffer = new ConnectionOffer({
            did:Offer.did,
            ip: Offer.ip,
            // port: Offer.port,
            recipientDid: Offer.recipientDid,
            owner: req.user._id
        })
        await connectionOffer.save()
        res.send(connectionOffer)
    } catch (e) {
        res.send(e)
    }
})

router.get('/sentConnectionOffers', auth, async(req, res) => {

    const sentConnectionOffers = await ConnectionOffer.find({owner: req.user._id})

    if(!sentConnectionOffers){
        return res.send({error: 'No Connection Offers Sent'})
    }

    try {
        res.send(sentConnectionOffers)
    } catch (e) {
        res.send(e)
    }
})

router.get('/pendingConnectionOffer', auth, async(req, res) => {

    try {
        const me = await DidKeyPair.find({owner: req.user._id, public: true})
        console.log(me[0].did)
        const pendingOffers = await ConnectionOffer.find({recipientDid: me[0].did, accepted: false})
        console.log('----See----',pendingOffers)
        if(!pendingOffers){
            return res.send({error: 'No Pending Connection Offers'})
        }

        res.send(pendingOffers)

    } catch (e) {
        res.send(e)
    }
    

})


router.patch('/rejectConnectionOffer', auth, async(req, res) => {

    try {
        const pendingOffer = await ConnectionOffer.findOneAndUpdate({recipientDid: req.user.did, accepted: false}, {rejected: true})

        if(!pendingOffer){
            return res.send({error: 'No Pending Connection Offers'})
        }

        res.send(pendingOffer)
    } catch (e) {
        res.send(e)
    }
})


router.post('/sendConnectionRequest', auth,async(req, res) => {

    

    const requestorDid = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const myDid = requestorDid.did
    console.log('MY DID', myDid)
    const recipient = await ConnectionOffer.findOne({recipientDid: myDid, accepted: false})
    console.log('Recipient', recipient)
    const recipientDid = recipient.did

    const connectionRequest = await ConnectionRequest.findOne({owner: req.user._id, did: myDid, recipientDid})
    if(connectionRequest){
        return res.send({error: 'Connection Request Already Sent'})
    }else


    // const offer = await ConnectionOffer.updateOne({did:recipientDid, recipientDid: myDid, owner: recipient.owner, accepted: false}, {accepted: true})
    await ConnectionOffer.updateOne({did:recipientDid, recipientDid: myDid, owner: recipient.owner, accepted: false}, {accepted: true})


    console.log('Offer',offer)
    console.log(req.user.userWalletHandle)
    const Request = await userFuncs.connectionRequest(myDid, recipientDid, req.user.userWalletHandle)
    try {
        const connectionRequest = new ConnectionRequest({
            ...Request,
            owner: req.user._id
        })
        await connectionRequest.save()

        const didKeyPair = new DidKeyPair({
            id: req.user.id,
            did: Request.newDid,
            verkey: Request.newKey,
            owner: req.user._id,
            public: false
        })


        await didKeyPair.save()
        res.send({connectionRequest, offer})
    } catch (e) {
        res.send(e)
    }
})

router.get('/sentConnectionRequests', auth, async(req, res) => {

    try {
        const sentRequests = await ConnectionRequest.find({owner: req.user._id})
        if(!sentRequests){
            return res.send({error: 'No Connection Requests Sent'})
        }
        res.send(sentRequests)
    } catch (e) {
        res.send(e)
    }
    
})

router.get('/pendingConnectionRequest', auth,async(req, res) => {

    const me = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const myDid = me.did

    const pendingRequests = await ConnectionRequest.find({recipientDid: myDid, responded: false})
    if(!pendingRequests){
        return res.send({error: 'No pending requests'})
    }

    try {
        res.send(pendingRequests)
    } catch (e) {
        res.send(e)
    }
})

router.patch('/rejectConnectionRequest', auth, async(req, res) => {

    


    try {
        const me = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const myDid = me.did

    const pendingRequest = await ConnectionRequest.findOneAndUpdate({recipientDid: myDid, responded: false}, {rejected: true})
    if(!pendingRequests){
        return res.send({error: 'No Pending Connection Requests'})
    }
        res.send(pendingRequest)
    } catch (e) {
        res.send(e)
    }

})

router.post('/sendConnectionResponse', auth, async(req, res) => {

    const me = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const myDid = me.did

    const recipient = await ConnectionRequest.findOne({recipientDid: myDid, responded: false})
    const recipientDid = recipient.did

    const response = await ConnectionResponse.findOne({owner: req.user._id, did: myDid, recipientDid})
    if(response){
        return res.send({error: 'Connection Response Already Sent'})
    }

    try {

        const Response = await userFuncs.connectionResponse(myDid, recipientDid, req.user.userWalletHandle)

        const connectionResponse = new ConnectionResponse({
            ...Response,
            owner: req.user._id
        })

        await connectionResponse.save()
        res.send(connectionResponse)
    } catch (e) {
        res.send(e)
    }


})


router.get('/sentConnectionResponse', auth, async(req, res) => {

    try {
        const Responses = await ConnectionResponse.find({owner: req.user._id})
        if(!Responses){
            return res.send({error: 'No Connection Responses Sent'})
        }

        res.send(Responses)

    } catch (e) {
        res.send(e)
    }
    
})

router.get('/pendingConnectionResponse', auth, async(req, res) => {

    const me = await DidKeyPair.findOne({owner: req.user._id, public: true})
    const myDid = me.did

    const pendingResponses = await ConnectionResponse.find({recipientDid: myDid, acknowledged: false})

    try {
        if(!pendingResponses){
            return res.send({error: 'No Pending Connection Responses'})
        }

        res.send(pendingResponses)
    } catch (e) {
        res.send(e)
    }
})


module.exports = router

