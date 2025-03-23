import express from 'express';
import jwt from 'jsonwebtoken';
import Group from '../models/Group.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Middleware to authenticate token
const auth = async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ","")
      console.log(token)
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      req.user = user;
      console.log(user)
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const allgroup = await Group.find().populate('members', 'username');

    const groups = allgroup.map(group => ({
      ...group.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: req.user._id,
    }));

    res.json(groups);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/group', auth, async (req, res) => {
  try {
    // const groupId=req.params.id
    const userId=req.user._id

    const allgroup = await Group.find({
      members: { $in: [userId] },
    });

    const groups = allgroup.map(group => ({
      ...group.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: req.user._id,
    }));



    res.json({groups});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search groups
router.get('/search', auth, async (req, res) => {
  try {
    const { destination, date } = req.query;
    const inputDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Start of the current day

    if (inputDate < currentDate) {
      // If the provided date is less than the current date
      return res.status(400).json({ message: 'The date you entered is in the past. Please provide a valid date.' });
    }
    const groups = await Group.find({
      destination: new RegExp(destination, 'i'),
      date: { $gte: inputDate }
    }).populate('members', 'username');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Sever error' });
  }
});



// Get specific group
// Get specific group
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'username') // Populate members with their usernames
      .populate('messages.sender', 'username'); // Populate message senders with their usernames

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if messages and their senders are populated
    group.messages.forEach((message, index) => {
      if (!message.sender) {
        console.log(`Message at index ${index} is missing a sender:`, message);
      } else {
        console.log(`Message at index ${index} sender:`, message.sender);
      }
    });

    // Debugging: Log the group object
    console.log(JSON.stringify(group, null, 2));
     
    const ismember = await Group.exists({
      _id:group,
      members:{$in:[req.user._id]}
    })
    
    ismember && res.json(group);
    
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const { destination, date } = req.body;
    const group = new Group({
      destination,
      date,
      creator: req.user._id,
      members: [req.user._id]
    });
    await group.save();
    
    // Add group to user's joinedGroups
    await User.findByIdAndUpdate(req.userId, {
      $push: { joinedGroups: group._id }
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join group
router.post('/join/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user._id);
    await group.save();

    // Add group to user's joinedGroups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedGroups: group._id }
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    console.log(req.user._id)
    const message = {
      sender: req.user._id,
      content,
      timestamp: new Date()
    };

    group.messages.push(message);
    await group.save();

    // Populate sender info before sending response
    const populatedMessage = await Group.populate(message, {
      path: 'sender',
      select: 'username'
    });

    res.json({
      ...populatedMessage,
      groupId: group._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// deletion of group
router.post('/:id/delete', auth, async (req, res) => {
  try {
    const id=req.params.id;
    const grp=await Group.findById(id)
    console.log(id)
    
    if (!grp.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to delete this group" });
    }
    
      
    const group=await Group.deleteOne({ _id: id })
    console.log(group)

   
    res.status(200).json({ message: 'group deleted' });
  
  } catch (error) {
    res.status(500).json({ message: 'ddelete error' });
  }
});
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const id = req.params.id; // Group ID from the request URL
    const userId = req.user._id; // User ID from authenticated request
    const group = await Group.findById(id); // Find the group by its ID

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = group.members.includes(userId);
    if (!isMember) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Remove the user from the members array
    group.members = group.members.filter(member => !member.equals(userId));
    await group.save(); // Save the updated group

    res.status(200).json({ message: "You have left the group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error leaving the group" });
  }
});
router.post('/delete', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const result = await Group.deleteMany({ date: { $lt: currentDate } });
    console.log(groupsToDelete);
    res.status(200).json({ message: `Deleted ${result.deletedCount} expired groups.` });
  } catch (error) {
    console.error('Error deleting expired groups:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
export default router;