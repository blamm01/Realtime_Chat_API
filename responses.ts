const responses: {
    [index: string]: string
} = {
    // Global
    "INVALID_FORM": "Sai cách gửi yêu cầu.",

    // Authentication
    "NOT_LOGGED_IN": "Vui lòng đăng nhập trước khi thực hiện!",
    "INVALID_CREDENTIAL": "Sai tên đăng nhập hoặc mật khẩu",
    "USED_USERNAME": "Tên đăng nhập đã được dùng trước đó!",

    // Room
    "ROOM_NOT_FOUND": "Không tìm thấy phòng.",
    "REQUESTED_USER_NOT_FOUND": "Không tìm thấy người yêu cầu.",

    // Messages
    "MESSAGE_NOT_FOUND": "Không tìm thấy tin nhắn",
    "LIMITED_MAX_MESSAGES": "Phòng này đã vượt quá mức giới hạn {max_messages} tin nhắn!",
    "NOT_SENDER": "Bạn không phải người gửi tin nhắn"
}

export default responses;