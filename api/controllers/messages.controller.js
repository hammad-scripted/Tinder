import { Message } from '../models/message.model.js';

export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message: content,
    });

    //TODO : send message in real time with socket.io

    return res.status(200).json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getConversation = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
