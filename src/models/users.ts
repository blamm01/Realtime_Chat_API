import mongo from "mongoose"

export default mongo.model("users", new mongo.Schema({
    token: String,
    expires_in: {
        type: Number,
        default: 604800000
    },
    username: String,
    password: String,
    email: String,
    updatedAt: {
        type: Number,
        default: Date.now()
    }
}))