require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Charity = require('./models/Charity');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/golf-charity');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Charity.deleteMany({});

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@golfcharity.com',
      password: 'admin123',
      role: 'admin',
      subscriptionStatus: 'active',
      charityPercentage: 10
    });
    await admin.save();
    console.log('✅ Admin created: admin@golfcharity.com / admin123');

    // Create test user
    const testUser = new User({
      name: 'John Golfer',
      email: 'user@golfcharity.com',
      password: 'user123',
      role: 'user',
      subscriptionStatus: 'active',
      charityPercentage: 15
    });
    await testUser.save();
    console.log('✅ Test user created: user@golfcharity.com / user123');

    // Create charities
    const charities = [
      {
        name: 'Youth Golf Foundation',
        description: 'Empowering underprivileged youth through golf, providing equipment, coaching, and scholarships to young aspiring golfers who lack access to the sport.',
        category: 'youth',
        featured: true,
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600',
        website: 'https://example.com/youth-golf',
        events: [{ title: 'Junior Golf Day 2026', description: 'Annual youth tournament', date: new Date('2026-06-15'), location: 'City Golf Club' }]
      },
      {
        name: 'Green Fairways Initiative',
        description: 'Dedicated to environmental sustainability in golf, promoting eco-friendly course management and protecting natural habitats surrounding golf courses worldwide.',
        category: 'environment',
        featured: true,
        image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
        website: 'https://example.com/green-fairways'
      },
      {
        name: 'Golf for Health',
        description: 'Using golf as therapy for veterans and individuals recovering from physical and mental health challenges. Walking the course changes lives.',
        category: 'health',
        featured: true,
        image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600',
        events: [{ title: 'Veterans Golf Day', description: 'A day of golf for veterans', date: new Date('2026-05-20'), location: 'National Golf Resort' }]
      },
      {
        name: 'Community Links Trust',
        description: 'Building community bonds through accessible golf programs. We bring free golf clinics to neighborhoods that have never had access to the sport.',
        category: 'community',
        featured: false,
        image: 'https://images.unsplash.com/photo-1632932693608-aece1a8e3b07?w=600'
      },
      {
        name: 'Golf Education Alliance',
        description: 'Providing scholarships and educational opportunities to student-athletes through competitive golf programs at schools and universities.',
        category: 'education',
        featured: true,
        image: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=600'
      },
      {
        name: 'Adaptive Golf Network',
        description: 'Making golf accessible to people with disabilities through adapted equipment, specialized coaching, and inclusive tournament opportunities.',
        category: 'sports',
        featured: false,
        image: 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=600'
      }
    ];

    await Charity.insertMany(charities);
    console.log(`✅ ${charities.length} charities created`);

    // Update test user with first charity
    const firstCharity = await Charity.findOne({});
    testUser.selectedCharity = firstCharity._id;
    await testUser.save();

    console.log('\n🎉 Seed complete!');
    console.log('Admin: admin@golfcharity.com / admin123');
    console.log('User: user@golfcharity.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
