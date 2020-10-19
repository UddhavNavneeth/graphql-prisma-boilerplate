import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'

const client = getClient()

beforeEach(seedDatabase, 15000)

test('should create a new user', async () => {
    const createUser = gql`
        mutation {
            createUser(
                data: {
                    name: "Uddhav Navneeth",
                    email: "ud@test.com",
                    password: "red12345"
                }
             ) {
                token
                user {
                    id
                }
            }
        }
    `

    const response = await client.mutate({
        mutation: createUser
    })

    const userFound = await prisma.exists.User({
        id: response.data.createUser.user.id
    }) 

    expect(userFound).toBe(true)
})

test("should expose public author profiles", async () => {
    const getUsers = gql`
        query {
            users {
                id
                name
                email
            }
        }
    `

    const response = await client.query({
        query: getUsers
    })

    expect(response.data.users.length).toBe(2)
    expect(response.data.users[0].email).toBe(null)
})

test("should not login with bad credentials", async () => {
    const login = gql`
        mutation {
            login(
                data: {
                    email: "ut@test.com",
                    password: "wrongpassword"
                }
            ) {
                token
            }
        }
    `

    await expect(
        client.mutate({ mutation:login })
        ).rejects.toThrow()
})

test('should create a new user', async () => {
    const createUser = gql`
        mutation {
            createUser(
                data: {
                    name: "NightAxe Blade",
                    email: "nab@test.com",
                    password: "red123"
                }
             ) {
                token
                user {
                    id
                }
            }
        }
    `

    await expect(
        client.mutate({mutation: createUser})
        ).rejects.toThrow()
})

test('should fetch user profile', async () => {
    const client = getClient(userOne.jwt)
    const getProfile = gql`
        query {
            me {
                id
                name
                email
            }
        }    
    `

    const { data } = await client.query({
        query: getProfile
    })

    expect(data.me.id).toBe(userOne.user.id)
    expect(data.me.name).toBe(userOne.user.name)
    expect(data.me.email).toBe(userOne.user.email)
})