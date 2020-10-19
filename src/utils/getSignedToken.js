import jwt from 'jsonwebtoken'

const getSignedToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '7 days'})
}

export { getSignedToken as default }