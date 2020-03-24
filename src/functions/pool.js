const indy = require('indy-sdk')

// const pool_ = {}
let poolHandle = 0;
const poolCreation = async (poolName) => {
    let poolConfig = {
        "genesis_txn": '/home/ubuntu/IndyProjectT/src/genesis-pool-config-file.txn'
    }

    try {
        await indy.createPoolLedgerConfig(poolName, poolConfig)
    } catch (error) {
        if(error.message !== "PoolLedgerConfigAlreadyExistsError"){
            throw error
        }
    }
        
    await indy.setProtocolVersion(2)

    poolHandle = await indy.openPoolLedger(poolName)
    
    return poolHandle
}

const sendNym = async (poolHandle, walletHandle, Did, newDid, newKey, role=null) => {

    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
    return {role, msg: 'nym request sent'}
}
// const createUserWallet = async (name,id, key, refid) => {
//     const user = {
//         name,
//         walletConfig: json.dumps({id}),
//         walletCredentials: json.dumps({key}),
//         pool: poolHandle,
//         seed: '0'*(32 - refid.length)+refid
//     }

//     try {
//         await indy.createWallet(user.walletconfig, user.wallet_credentials)
//     } catch (e) {
//         if(e.message !== 'WalletAlreadyExistsError'){
//             throw e
//         }
//     }

//     let userWallet = await indy.openWallet(user.walletConfig, user.walletCredentials)

//     let didInfo = {seed: user.seed}

//     [did, verkey] = indy.createAndStoreMyDid(userWallet, didInfo)

//     return [did, verkey]
// }

module.exports = {poolCreation, sendNym, poolHandle}
