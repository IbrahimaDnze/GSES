const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token manquant'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-motDePasse');
      if (!user) return next(new Error('Utilisateur introuvable'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.join('all');
  });

  return io;
}

module.exports = { setupSocket };
