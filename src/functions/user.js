const indy = require('indy-sdk')
const timestamp = require('timestamp')

const User = require('../models/user')

const localIp = require('local-ip')
const ip = require('ip')

const pool = require('../functions/pool')

const createUserWallet = async (name,id, key) => {
    const user = {
        name: name,
        walletConfig: {id: id},
        walletCredentials: {key: key},
        timestamp: timestamp()
    }
    // console.log(refid.length)
    try {
        await indy.createWallet(user.walletConfig, user.walletCredentials)
    } catch (e) {
        if(e.message !== 'WalletAlreadyExistsError'){
            throw e
        }
    }

    const userWalletHandle = await indy.openWallet(user.walletConfig, user.walletCredentials)
    // console.log('Opened.........')
    
    // const didInfo = {seed: user.seed, timestamp}
    // // console.log(didInfo)
    // const [did, verkey] = await indy.createAndStoreMyDid(userWalletHandle, didInfo)
    // // console.log(did)
    // return {did, verkey, userWalletHandle} 

    return userWalletHandle
}


const createDidKey = async(userWalletHandle, didInfo, info) => {
    console.log('-----IN CREATEDIDKEY-----------------')

    try {
        const [did, verkey] = await indy.createAndStoreMyDid(userWalletHandle, didInfo)
        console.log('----------------DID KEY CREATED--------------------')
    const metadata = JSON.stringify({
        info
    })
    await indy.setDidMetadata(userWalletHandle, did, metadata)
    console.log('--------META DATA CERATED-----------------------')
    return {did, verkey, metadata}
    } catch (e) {
        console.log('ERROR-----------',e)
    }
    
}

const openWallet = async (id, key) => {

    console.log("---{id}, {key}----", id, key);
    try {
        const userWalletHandle = await indy.openWallet(id, key)
        console.log('OPENED ------------------------------------')
        if(!userWalletHandle){
            console.log('No user handle')
        }

        console.log('--userWalletHandle------------', userWalletHandle);
        return userWalletHandle
    } catch (e) {
        console.log('ERROR-------------------------',e)
    }
    

}

const closeWallet = async (userWalletHandle) => {

    try {
        console.log('Hello.....')
        await indy.closeWallet(userWalletHandle)
        console.log('WALLET CLOSED------------------------')
        return "Closed"
    } catch (e) {
        console.log('ERROR----------------',e)
    }
    
    
}


const deleteWallet = async (id, key) => {

    try {
        await indy.deleteWallet(id, key)
        
        return "deleted"
    } catch (e) {
        return e
    }
    
}


const createOrgWallet = async (name,id, key, seed) => {
    const user = {
        name: name,
        walletConfig: {id},
        walletCredentials: {key},
    
        // seed: '0'.repeat(32 - seed.length)+seed,
        timestamp: timestamp()
    }
    // console.log(refid.length)
    try {
        await indy.createWallet(user.walletConfig, user.walletCredentials)
    } catch (e) {
        if(e.message !== 'WalletAlreadyExistsError'){
            throw e
        }
    }

    const userWalletHandle = await indy.openWallet(user.walletConfig, user.walletCredentials)

    
    const didInfo = {seed: user.seed, timestamp}
    // console.log(didInfo)
    const [did, verkey] = await indy.createAndStoreMyDid(userWallet, didInfo)
    // console.log(did)
    return {did, verkey, userWalletHandle} 
}


const connectionOffer = async (did, recipientDid) => {
    return {
        '@id': 'connection-offer',
        did,
        ip: ip.address(),
        // port: process.env.PORT,
        recipientDid: recipientDid
    }
}

const connectionRequest = async (did, recipientDid, userWalletHandle, role=null) => {
    
    const [newDid, newKey] = await indy.createAndStoreMyDid(userWalletHandle, {})

    console.log('POOL HANDLE,', pool.poolHandle)
    await pool.sendNym(pool.poolHandle, userWalletHandle, did, newDid, newKey, role)
    
    return {
        did,
        newDid,
        newKey,
        ip: ip.address(),
        recipientDid
    }
}

const connectionResponse = async (did, recipientDid, userWalletHandle) => {

    const [newDid, newKey] = await indy.createAndStoreMyDid(userWalletHandle, {})

    return {
        did,
        newDid,
        newKey,
        ip: ip.address(),
        recipientDid
    }
}

const connectionAcknowledgement = async(userWalletHandle, did, newDid, newKey, role=null) => {

    await pool.sendNym(pool.poolHandle, userWalletHandle, did, newDid, newKey, role)

    return {
        newDid, 
        newKey,
        msg: 'Connected.....YAY UwU!!!'
    }

}


module.exports = {createUserWallet, createOrgWallet, openWallet, closeWallet, deleteWallet, createDidKey, connectionOffer, connectionRequest, connectionResponse}