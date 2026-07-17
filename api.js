const { ObjectId } = require('mongodb');
const token = require('./createJWT');
require('dotenv').config();

const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_BASE_URL
});

async function sendEmail(to, subject, text)
{
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `Skylanders <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        to: [to],
        subject,
        text
    });
}

exports.setApp = function(app, client)
{

    //  updated: mongodb will handle inc.
    app.post('/api/register', async (req, res) =>
    {
        const {username, password, email } = req.body;
        
        const db = client.db('Skylanders');
        const users = db.collection('Users');

        const existingUser = await users.findOne({ $or: [{ Username: username }, { Email: email }] });

        if (existingUser)
        {
            return res.status(200).json({
                error: 'User or email already exists'
            });
        }

       
        //  new user
        const newUser =
        {
            FirstName: '',
            LastName: '',
            Username: username,
            Password: password,
            Email: email,
            IsVerified: false,
            Code: Math.floor(100000 + Math.random() * 900000).toString(), // 6 digit code
            CodeCreated: new Date()
        };

        //  add it in
        await users.insertOne(newUser);

        try
        {
            await sendEmail(
                email,
                'Verify your Skylanders account',
                'Your verification code is: ' + newUser.Code + '\n\nThis code expires in 15 minutes. Do not share it with anyone.'
            );
        }
        catch(e)
        {
        }

        res.status(200).json({
            message: 'User registered successfully',
            code: newUser.Code
        });
    });

    //  updated: check isVerified first
    app.post('/api/login', async (req, res, next) =>
{
    const { login, password } = req.body;

    try
    {
        const db = client.db('Skylanders');

        const user = await db.collection('Users').findOne({
            Username: login,
            Password: password
        });

        if (!user)
        {
            return res.status(200).json({
                error: 'Login/Password incorrect'
            });
        }

        if (user.IsVerified !== true)
        {
            return res.status(200).json({
                error: 'Email not verified.'
            });
        }

        const userId = user._id.toString();

        const ret = token.createToken(
            user.FirstName,
            user.LastName,
            userId
        );

        return res.status(200).json({
            userId,
            ...ret
        });
    }
    catch(e)
    {
        return res.status(500).json({
            error: e.toString()
        });
    }
});

   //  viewcollection
    app.post('/api/getcollection', async (req, res, next) =>
    {
        const {userId, jwtToken} = req.body;
        var error = '';
        var _ret = [];
        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                results: _ret,
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');
            const ownedFigures = await db.collection('Collection').find({
                    '_id.UserId': new ObjectId(userId)
                }).toArray();

            for (var i=0; i<ownedFigures.length; i++)
            {
                const figure = await db.collection('Figure').findOne({
                    _id: ownedFigures[i]._id.FigureId
                });

                    _ret.push({
                        ...figure,
                        Boxed: ownedFigures[i]._id.Boxed,
                        Quantity: ownedFigures[i].Quantity
                    });
            
                }
        }
        catch(e)
        {
            error = e.toString();
        }

        //  refresh the token
        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/resendverification', async (req, res, next) =>
    {
        // incoming: email
        // outgoing: error
        var error = '';
        const { email } = req.body;

        try
        {
            const db = client.db('Skylanders');
            const users = db.collection('Users');

            const user = await users.findOne({ Email: email });

            if (!user)
            {
                return res.status(200).json({
                    error: 'Email not found'
                });
            }

            if (user.IsVerified === true)
            {
                return res.status(200).json({
                    error: 'Account is already verified'
                });
            }

            const newCode = Math.floor(100000 + Math.random() * 900000).toString();

            await users.updateOne(
                { Email: email },
                {
                    $set: {
                        Code: newCode,
                        CodeCreated: new Date()
                    }
                }
            );

            await sendEmail(
                email,
                'Verify your Skylanders account',
                'Your verification code is: ' + newCode + '\n\nThis code expires in 15 minutes. Do not share it with anyone.'
            );
        }
        catch(e)
        {
            error = e.toString();
        }

        res.status(200).json({
            error
        });
    });

    //  new
    app.post('/api/verifyemail', async (req, res, next) =>
    {
        const { email, code } = req.body;
        var error = '';

        try
        {
            const db = client.db('Skylanders');
            const users = db.collection('Users');

            const user = await users.findOne({
                Email: email,
                Code: code
            });

            if (!user)
            {
                return res.status(200).json({
                    error: 'Invalid verification code'
                });
            }

            const ageMinutes = (new Date() - new Date(user.CodeCreated)) / 60000;
            if (ageMinutes > 15)
            {
                return res.status(200).json({
                    error: 'Verification code has expired'
                });
            }

            await users.updateOne(
                { Email: email },
                {
                   $set: {
                        IsVerified: true,
                        Code: '',
                        CodeCreated: new Date()
                    }
                }
            );
        }
        catch(e)
        {
            error = e.toString();
        }

        res.status(200).json({
            error
        });
    });

    //  new
    app.post('/api/getwishlist', async (req, res, next) =>
    {
        const {userId, jwtToken} = req.body;
        var error = '';
        var _ret = [];
        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                results: _ret,
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');
            const wishlistFigures = await db.collection('Wishlist').find({
                '_id.UserId': new ObjectId(userId)
            }).toArray();


            for (var i=0; i<wishlistFigures.length; i++)
            {
                const figure = await db.collection('Figure').findOne({
                    _id: wishlistFigures[i]._id.FigureId
                });

                    _ret.push(figure);
            }
        }
        catch(e)
        {
            error = e.toString();
        }

        //  refresh the token
        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/addtowishlist', async (req, res, next) =>
    {
        const { userId, figureId, jwtToken } = req.body;
        var error = '';

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const userObjectId = new ObjectId(userId);
            const figureObjectId = new ObjectId(figureId);

           await db.collection('Wishlist').updateOne(
                {
                    _id: {
                        UserId: new ObjectId(userId),
                        FigureId: new ObjectId(figureId)
                    }
                },
                {
                    $setOnInsert: {
                        _id: {
                            UserId: new ObjectId(userId),
                            FigureId: new ObjectId(figureId)
                        }
                    }
                },
                { upsert: true }
            );
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/removefromwishlist', async (req, res, next) =>
{
    const { userId, figureId, jwtToken } = req.body;
    var error = '';

    if (token.isExpired(jwtToken))
    {
        return res.status(200).json({
            error: 'The JWT is no longer valid',
            jwtToken: ''
        });
    }

    try
    {
        const db = client.db('Skylanders');
        await db.collection('Wishlist').deleteOne({
            _id: {
                UserId: new ObjectId(userId),
                FigureId: new ObjectId(figureId)
            }
        });
    }
    catch(e)
    {
        error = e.toString();
    }

    const refreshedToken = token.refresh(jwtToken);

    res.status(200).json({
        error,
        jwtToken: refreshedToken
    });
    });

    //  new
    app.post('/api/removefromcollection', async (req, res, next) =>
    {
        const { userId, figureId, boxed, jwtToken } = req.body;
        var error = '';

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            await db.collection('Collection').deleteOne({
                    _id: {
                        UserId: new ObjectId(userId),
                        FigureId: new ObjectId(figureId),
                        Boxed: boxed
                    }
                });
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
        //  every user searches for same figures so change
    app.post('/api/searchfigures', async (req, res, next) =>
    {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { search, jwtToken } = req.body;
        var _search = search.trim();
        const db = client.db('Skylanders');
        const results = await db.collection('Figure').find({
            Name:
            {
                $regex: _search + '.*',
                $options: 'i'
            }
        }).toArray();
        var _ret = [];

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                results: _ret,
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        for( var i=0; i<results.length; i++ )
        {
            _ret.push( results[i] );
        }

        const refreshedToken =
            token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });



    //  new
    app.post('/api/addtocollection', async (req, res, next) =>
    {
        const { userId, figureId, boxed, quantity, jwtToken } = req.body;
        var error = '';

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const userObjectId = new ObjectId(userId);
            const figureObjectId = new ObjectId(figureId);

            await db.collection('Collection').updateOne(
            {
                _id: {
                    UserId: new ObjectId(userId),
                    FigureId: new ObjectId(figureId),
                    Boxed: boxed
                }
            },
            {
                $inc: {
                    Quantity: quantity
                }
            },
            {
                upsert: true
            }
        );
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });


    //  new
    app.post('/api/updatequantity', async (req, res, next) =>
    {
        // incoming: userId, figureId, boxed, quantity, jwtToken
        // outgoing: error
        var error = '';
        const { userId, figureId, boxed, quantity, jwtToken } = req.body;

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            await db.collection('Collection').updateOne(
                {
                    _id: {
                        UserId: new ObjectId(userId),
                        FigureId: new ObjectId(figureId),
                        Boxed: boxed
                    }
                },
                {
                    $set: {
                        Quantity: quantity
                    }
                }
            );
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/searchusers', async (req, res, next) =>
    {
        // incoming: userId, search, jwtToken
        // outgoing: results[], error
        var error = '';
        const { userId, search, jwtToken } = req.body;
        var _search = search.trim();
        var _ret = [];

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                results: _ret,
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const results = await db.collection('Users').find({
                _id: { $ne: new ObjectId(userId) },
                Username:
                {
                    $regex: _search + '.*',
                    $options: 'i'
                }
            }).toArray();

            for (var i = 0; i < results.length; i++)
            {
                _ret.push({
                    id: results[i]._id,
                    username: results[i].Username,
                    firstName: results[i].FirstName,
                    lastName: results[i].LastName
                });
            }
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });


    //  new 
    app.post('/api/sendfriendrequest', async (req, res, next) =>
    {
        // incoming: userId, friendId, jwtToken
        // outgoing: error
        var error = '';
        const { userId, friendId, jwtToken } = req.body;

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const userObjectId = new ObjectId(userId);
            const friendObjectId = new ObjectId(friendId);

            const existingRequest = await db.collection('FriendsList').findOne({
                $or: [
                    {
                        '_id.UserId': userObjectId,
                        '_id.FriendId': friendObjectId
                    },
                    {
                        '_id.UserId': friendObjectId,
                        '_id.FriendId': userObjectId
                    }
                ]
            });

            if (existingRequest)
            {
                return res.status(200).json({
                    error: 'Friend request already exists',
                    jwtToken: token.refresh(jwtToken)
                });
            }

            const newFriendRequest =
            {
                _id: {
                    UserId: new ObjectId(userId),
                    FriendId: new ObjectId(friendId)
                },
                Status: 'Pending'
            };

            await db.collection('FriendsList').insertOne(newFriendRequest);
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/acceptfriendrequest', async (req, res, next) =>
    {
        // incoming: userId, friendId, jwtToken
        // outgoing: error
        var error = '';
        const { userId, friendId, jwtToken } = req.body;

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const result = await db.collection('FriendsList').updateOne(
                {
                    '_id.UserId': new ObjectId(friendId),
                    '_id.FriendId': new ObjectId(userId),
                    Status: 'Pending'
                },
                {
                    $set: {
                        Status: 'Accepted'
                    }
                }
            );

            if (result.matchedCount === 0)
            {
                return res.status(200).json({
                    error: 'Pending friend request not found',
                    jwtToken: token.refresh(jwtToken)
                });
            }
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/denyfriendrequest', async (req, res, next) =>
    {
        // incoming: userId, friendId, jwtToken
        // outgoing: error
        var error = '';
        const { userId, friendId, jwtToken } = req.body;

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const result = await db.collection('FriendsList').deleteOne({
                '_id.UserId': new ObjectId(friendId),
                '_id.FriendId': new ObjectId(userId),
                Status: 'Pending'
            });

            if (result.deletedCount === 0)
            {
                return res.status(200).json({
                    error: 'Pending friend request not found',
                    jwtToken: token.refresh(jwtToken)
                });
            }
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/removefriend', async (req, res, next) =>
    {
        // incoming: userId, friendId, jwtToken
        // outgoing: error
        var error = '';
        const { userId, friendId, jwtToken } = req.body;

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');

            const userObjectId = new ObjectId(userId);
            const friendObjectId = new ObjectId(friendId);

            await db.collection('FriendsList').deleteOne({
                $or: [
                    {
                        '_id.UserId': userObjectId,
                        '_id.FriendId': friendObjectId
                    },
                    {
                        '_id.UserId': friendObjectId,
                        '_id.FriendId': userObjectId
                    }
                ]
            });
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/recoveraccount', async (req, res, next) =>
    {
        // incoming: email
        // outgoing: error
        var error = '';
        const { email } = req.body;

        try
        {
            const db = client.db('Skylanders');
            const users = db.collection('Users');

            const user = await users.findOne({
                Email: email
            });

            if (!user)
            {
                return res.status(200).json({
                    error: 'Email not found'
                });
            }

            const recoveryCode =
                Math.floor(100000 + Math.random() * 900000).toString();

            await users.updateOne(
                { Email: email },
                {
                    $set: {
                        Code: recoveryCode,
                        CodeCreated: new Date()
                    }
                }
            );

           await sendEmail(
            email,
            'Recover your Skylanders account',
            'Your recovery code is: ' + recoveryCode + '\n\nThis code expires in 15 minutes. Do not share it with anyone.'
        );
        }
        catch(e)
        {
            error = e.toString();
        }

        res.status(200).json({
            error
        });
    });

    //  new
    app.post('/api/resetpassword', async (req, res, next) =>
    {
        // incoming: email, recoveryCode, newPassword
        // outgoing: error
        var error = '';
        const { email, recoveryCode, newPassword } = req.body;

        try
        {
            const db = client.db('Skylanders');
            const users = db.collection('Users');

            const user = await users.findOne({
                Email: email,
                Code: recoveryCode
            });

            if (!user)
            {
                return res.status(200).json({
                    error: 'Invalid recovery code'
                });
            }

            const ageMinutes = (new Date() - new Date(user.CodeCreated)) / 60000;
            if (ageMinutes > 15)
            {
                return res.status(200).json({
                    error: 'Recovery code has expired'
                });
            }

            await users.updateOne(
                { Email: email },
                {
                    $set: {
                        Password: newPassword,
                        Code: ''
                    }
                }
            );
        }
        catch(e)
        {
            error = e.toString();
        }

        res.status(200).json({
            error
        });
    });

    //  new
    app.post('/api/getfriendslist', async (req, res, next) =>
    {
        // incoming: userId, jwtToken
        // outgoing: friends[], pending[], error
        var error = '';
        const { userId, jwtToken } = req.body;
        var friends = [];
        var pending = [];

        if (token.isExpired(jwtToken))
        {
            return res.status(200).json({
                friends,
                pending,
                error: 'The JWT is no longer valid',
                jwtToken: ''
            });
        }

        try
        {
            const db = client.db('Skylanders');
            const userObjectId = new ObjectId(userId);

            const entries = await db.collection('FriendsList').find({
                $or: [
                    { '_id.UserId': userObjectId },
                    { '_id.FriendId': userObjectId }
                ]
            }).toArray();

            for (var i = 0; i < entries.length; i++)
            {
                const entry = entries[i];
                const otherUserId = entry._id.UserId.equals(userObjectId)
                    ? entry._id.FriendId
                    : entry._id.UserId;

                const otherUser = await db.collection('Users').findOne(
                    { _id: otherUserId },
                    { projection: { Username: 1, FirstName: 1, LastName: 1 } }
                );

                const userInfo = {
                    id: otherUserId,
                    username: otherUser ? otherUser.Username : '',
                    firstName: otherUser ? otherUser.FirstName : '',
                    lastName: otherUser ? otherUser.LastName : ''
                };

                if (entry.Status === 'Accepted')
                {
                    friends.push(userInfo);
                }
                else if (entry.Status === 'Pending' && entry._id.UserId.equals(userObjectId))
                {
                    pending.push({ ...userInfo, direction: 'sent' });
                }
                else if (entry.Status === 'Pending' && entry._id.FriendId.equals(userObjectId))
                {
                    pending.push({ ...userInfo, direction: 'received' });
                }
            }
        }
        catch(e)
        {
            error = e.toString();
        }

        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            friends,
            pending,
            error,
            jwtToken: refreshedToken
        });
    });

}