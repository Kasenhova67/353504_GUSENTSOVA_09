const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const SECRET_KEY = process.env.JWT_SECRET || 'museum-secret-key-2024-demo';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000' 
    );
  }

  async verifyToken(idToken) {
    try {
      console.log('🔍 Верификация Google токена...');
      
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      console.log('✅ Google токен верифицирован для пользователя:', payload.email);
      
      if (!payload.email_verified) {
        throw new Error('Email не верифицирован Google');
      }
      
      return {
        success: true,
        userInfo: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          givenName: payload.given_name,
          familyName: payload.family_name,
          picture: payload.picture,
          locale: payload.locale,
          emailVerified: payload.email_verified
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка верификации Google токена:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findOrCreateUser(googleUserInfo) {
    try {
      let user = await User.findOne({ googleId: googleUserInfo.googleId });
      
      if (!user) {
        user = await User.findOne({ email: googleUserInfo.email });
        
        if (user) {
          user.googleId = googleUserInfo.googleId;
          user.googleData = googleUserInfo;
        } else {
          user = new User({
            googleId: googleUserInfo.googleId,
            email: googleUserInfo.email,
            username: googleUserInfo.email.split('@')[0], 
            name: googleUserInfo.name,
            avatar: googleUserInfo.picture,
            role: 'visitor',
            isActive: true,
            authMethod: 'google',
            googleData: googleUserInfo,
            lastLogin: new Date()
          });
        }
      } else {
        user.lastLogin = new Date();
        user.googleData = googleUserInfo;
      }
      
      await user.save();
      
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          authMethod: 'google'
        },
        SECRET_KEY,
        { expiresIn: '7d' }
      );
      
      return {
        success: true,
        user: {
          _id: user._id,
          googleId: user.googleId,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          token: token,
          authMethod: user.authMethod,
          createdAt: user.createdAt
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка создания/поиска пользователя:', error);
      return {
        success: false,
        error: 'Ошибка обработки пользователя'
      };
    }
  }
}

module.exports = new GoogleAuthService();