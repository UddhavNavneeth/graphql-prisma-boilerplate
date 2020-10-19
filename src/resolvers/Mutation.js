import bcrypt from 'bcryptjs'
import getUserId from '../utils/getUserId'
import getSignedToken from '../utils/getSignedToken'
import hashPassword from '../utils/password'

const Mutation = {
    async createUser(parent, args, { prisma }, info) {

        const password = await hashPassword(args.data.password)
        
        const user = await prisma.mutation.createUser({ 
            data: {
                ...args.data,
                password
            }
         })

         return {
             user,
             token: getSignedToken(user.id)
         }
    },
    async login(parent, args, { prisma }, info) {
        const user = await prisma.query.user({
            where: {
                email: args.data.email
            }
        })

        if (!user) {
            throw new Error('No such user found')
        }

        const isMatch = await bcrypt.compare(args.data.password, user.password)

        if (!isMatch) {
            throw new Error('Incorrect Password')
        }

        return {
            user,
            token:getSignedToken(user.id)
        }
    },
    deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.mutation.deleteUser({ 
            where: { 
                id: userId 
            } 
        }, info)
    },
    async updateUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password)
        }

        return prisma.mutation.updateUser({ 
            where: {
                id: userId,
            },
            data: args.data
        }, info)
    }
}

export { Mutation as default }