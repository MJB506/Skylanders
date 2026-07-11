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
        
        const db = client.db('COP4331Cards');
        const users = db.collection('Users');

        const existingUser = await users.findOne({ $or: [{ Login: username }, { Email: email }] });

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
            Login: username,
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
                'Your verification code is: ' + newUser.Code
            );
        }
        catch(e)
        {
            console.log('Email failed: ' + e.toString());
        }

        res.status(200).json({
            message: 'User registered successfully',
            code: newUser.Code
        });
    });

    //  updated: check isVerified first
    app.post('/api/login', async (req, res, next) =>
{
    console.log('LOGIN: endpoint hit');

    const { login, password } = req.body;
    console.log('LOGIN: body received', { login, password });

    try
    {
        const db = client.db('COP4331Cards');
        console.log('LOGIN: database selected');

        const user = await db.collection('Users').findOne({
            Login: login,
            Password: password
        });

        console.log('LOGIN: database result', user);

        if (!user)
        {
            console.log('LOGIN: invalid credentials');

            return res.status(200).json({
                error: 'Login/Password incorrect'
            });
        }

        if (user.IsVerified !== true)
        {
            console.log('LOGIN: user not verified');

            return res.status(200).json({
                error: 'Email not verified.'
            });
        }

        const userId = user._id.toString();
        console.log('LOGIN: before token creation', userId);

        const ret = token.createToken(
            user.FirstName,
            user.LastName,
            userId
        );

        console.log('LOGIN: token created', ret);

        return res.status(200).json({
            userId,
            ...ret
        });
    }
    catch(e)
    {
        console.error('LOGIN ERROR:', e);

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
            const db = client.db('COP4331Cards');
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

        //  refresh the token now (though it's infinite now isn't it?)
        const refreshedToken = token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });

    //  new
    app.post('/api/verifyemail', async (req, res, next) =>
    {
        const { email, code } = req.body;
        var error = '';

        try
        {
            const db = client.db('COP4331Cards');
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
            const db = client.db('COP4331Cards');
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

        //  refresh the token now (though it's infinite now isn't it?)
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
            const db = client.db('COP4331Cards');

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
        const db = client.db('COP4331Cards');
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
            const db = client.db('COP4331Cards');

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
        const db = client.db('COP4331Cards');
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
            const db = client.db('COP4331Cards');

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
            const db = client.db('COP4331Cards');

            const results = await db.collection('Users').find({
                _id: { $ne: new ObjectId(userId) },
                Login:
                {
                    $regex: _search + '.*',
                    $options: 'i'
                }
            }).toArray();

            for (var i = 0; i < results.length; i++)
            {
                _ret.push({
                    id: results[i]._id,
                    username: results[i].Login,
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
            const db = client.db('COP4331Cards');

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
            const db = client.db('COP4331Cards');

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
            const db = client.db('COP4331Cards');

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
            const db = client.db('COP4331Cards');
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
                        RecoveryCode: recoveryCode
                    }
                }
            );

           await sendEmail(
            email,
            'Recover your Skylanders account',
            'Your recovery code is: ' + recoveryCode
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



    //  outdated endpoints from MERN A
    app.post('/api/searchcards', async (req, res, next) =>
    {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { userId, search, jwtToken } = req.body;
        var _search = search.trim();
        const db = client.db('COP4331Cards');
        const results = await db.collection('Cards').find({
            UserId: userId,
            Card:
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
            _ret.push( results[i].Card );
        }

        const refreshedToken =
            token.refresh(jwtToken);

        res.status(200).json({
            results: _ret,
            error,
            jwtToken: refreshedToken
        });
    });

    app.post('/api/addcard', async (req, res, next) =>
    {
        // incoming: userId, color
        // outgoing: error
        const { userId, card, jwtToken } = req.body;
        const newCard = {Card:card,UserId:userId};
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
            const db = client.db('COP4331Cards');
            const result = await db.collection('Cards').insertOne(newCard);
        }
        catch(e)
        {
            error = e.toString();
        }
        const refreshedToken =
            token.refresh(jwtToken);

        res.status(200).json({
            error,
            jwtToken: refreshedToken
        });
    });

}