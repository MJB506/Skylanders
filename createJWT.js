const jwt = require('jsonwebtoken');
require('dotenv').config();

function createToken(fn, ln, id)
{
    const user =
    {
        userId: id,
        firstName: fn,
        lastName: ln
    };

    const accessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET
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
        ud.firstName,
        ud.lastName,
        ud.userId
    );
}

module.exports =
{
    createToken,
    isExpired,
    refresh
};