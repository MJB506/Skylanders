const token = require('./createJWT');

exports.setApp = function(app, client)
{
    app.post('/api/login', async (req, res, next) =>
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { login, password } = req.body;
        const db = client.db('COP4331Cards');
        const results = await
        db.collection('Users').find({Login:login,Password:password}).toArray();
        var id = -1;
        var fn = '';
        var ln = '';
        if( results.length > 0 )
        {
            id = results[0].UserId;
            fn = results[0].FirstName;
            ln = results[0].LastName;
        }
        if (id < 0)
        {
            return res.status(200).json({
                error: 'Login/Password incorrect'
            });
        }

        var ret = token.createToken(fn, ln, id);
        res.status(200).json(ret);
    });

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