const mongoose = require('mongoose')
const validator = require('validator')

const didKeyPairSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    did: {
        type: String,

        required: true
    },
    verkey: {
        type: String,
        required: true
    },
    metadata: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    public: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
})

const DidKeyPair = mongoose.model('DidKeyPair', didKeyPairSchema)

module.exports = DidKeyPair

