import mongo from "mongoose"

export default mongo.model("rooms", new mongo.Schema({
    _id: String,
    users: Array,
    messages: Array,
    createdAt: {
        type: Number,
        default: Date.now(),
        required: true
    },
    info: {
        id: String,
        name: String,
        description: String,
    }
}))