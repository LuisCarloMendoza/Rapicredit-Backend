import User from '../models/user.model.js';

export const userRepository = {
    findByUid: async (uid) => {
        return await User.findOne({ uid });
    },

    findByCodigoUsuario: async (codigoUsuario) => {
        return await User.findOne({ codigoUsuario });
    },

    createUser: async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    },

    updateUserByUid: async (uid, updateData) => {
        return await User.findOneAndUpdate({ uid }, updateData, { new: true });
    }
}