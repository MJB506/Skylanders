const jwt = require('jsonwebtoken');
require('dotenv').config();

function createToken(username, id)
{
    const user =
    {
        userId: id,
        username: username
    };

    const accessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '24h' }
    );

    return { accessToken };
}

function isExpired(token)
{
    try
    {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return false;
    }
    catch
    {
        return true;
    }
}

function refresh(token)
{
    const ud = jwt.decode(token);

    return createToken(
        ud.username,
        ud.userId
    );
}

module.exports =
{
    createToken,
    isExpired,
    refresh
};
