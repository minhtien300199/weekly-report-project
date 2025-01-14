const User = require('../models/User');
const bcrypt = require('bcryptjs');

class AdminController {
    async showUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'username', 'created_at', 'updated_at'],
                raw: true
            });
            res.render('admin/users', { users });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).render('error', { error: 'Failed to load users' });
        }
    }

    async createUser(req, res) {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                username,
                password: hashedPassword
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, password } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Update user data
            user.username = username;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }

            await user.save();
            res.json({ success: true });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Prevent deleting the last admin user
            const userCount = await User.count();
            if (userCount <= 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete the last user'
                });
            }

            await user.destroy();
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new AdminController(); 